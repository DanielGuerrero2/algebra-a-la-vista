import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { build, builderIssue, suggestJoinTable } from '../core/lab-model.js';
import { run } from '../core/engine.js';
import { Button, Field, Icon } from './ui.jsx';
import { Expression } from './Editor.jsx';

const operations = {
  select: ['σ', 'Selección', 'Conserva las filas que cumplen una condición.'],
  project: ['π', 'Proyección', 'Elige columnas y elimina las filas repetidas.'],
  join: ['⋈', 'Join natural', 'Conecta relaciones por sus columnas en común.'],
  union: ['∪', 'Unión', 'Reúne filas de dos relaciones compatibles.'],
  difference: ['−', 'Diferencia', 'Retira las filas presentes en la segunda relación.'],
  intersect: ['∩', 'Intersección', 'Conserva las filas que aparecen en ambas relaciones.'],
  divide: ['÷', 'División', 'Busca valores relacionados con todos los de la segunda relación.'],
  insert: ['∪', 'Alta', 'Añade una fila utilizando la unión.'],
  delete: ['−', 'Baja', 'Retira las filas que cumplen tus condiciones.'],
  update: ['↦', 'Modificar', 'Sustituye filas mediante diferencia y unión.'],
};
const comparators = ['=', '!=', '>', '<', '>=', '<='];
const operationGroups = [
  ['Filas y columnas', ['select', 'project', 'join']],
  ['Comparar relaciones', ['union', 'difference', 'intersect', 'divide']],
  ['Cambiar datos', ['insert', 'delete', 'update']],
];

function firstFilter(relation, column = relation.cols[0]) {
  return { column, operator: '=', value: null };
}
function defaults(op, relation, tables) {
  return {
    op, filters: [firstFilter(relation)], logic: 'and', columns: [],
    table: suggestJoinTable(relation, tables) || '', row: {},
    field: relation.cols[0], mode: 'set', value: null, other: '',
  };
}
function FieldNote({ issue, field }) {
  return issue?.field === field && <span class={`builder-field-note ${issue.kind === 'invalid' ? 'is-invalid' : ''}`}>{issue.message}</span>;
}
function Conditions({ config, relation, issue, onChange }) {
  const change = (index, patch) => onChange({ filters: config.filters.map((filter, i) => i === index ? { ...filter, ...patch } : filter) });
  return <div>
    <div class="mb-2 flex items-center justify-between gap-2"><span class="text-[10px] font-semibold uppercase tracking-wider text-muted">Condiciones</span>{config.filters.length > 1 && <Field label="Combinar condiciones"><select class="field" value={config.logic} onChange={e => onChange({ logic: e.currentTarget.value })}><option value="and">Cumplir todas (Y)</option><option value="or">Cumplir alguna (O)</option></select></Field>}</div>
    <div class="space-y-2">{config.filters.map((filter, index) => <div key={index} class="condition-row grid gap-2">
      <Field label={`Condición ${index + 1}: columna`}><select class="field !px-2 text-xs" aria-label={`Columna de condición ${index + 1}`} value={filter.column} onChange={e => change(index, firstFilter(relation, e.currentTarget.value))}>{relation.cols.map(column => <option key={column}>{column}</option>)}</select></Field>
      <Field label="Operador"><select class="field !px-1 text-xs" aria-label={`Operador de condición ${index + 1}`} value={filter.operator} onChange={e => change(index, { operator: e.currentTarget.value })}>{comparators.map(op => <option key={op}>{op}</option>)}</select></Field>
      <Field label="Valor"><input class="field !px-2 text-xs" aria-label={`Valor de condición ${index + 1}`} aria-invalid={issue?.field === `filter-${index}` && issue.kind === 'invalid' || undefined} value={filter.value ?? ''} placeholder={`Ej.: ${String(relation.rows[0]?.[filter.column] ?? (relation.types[filter.column] === 'number' ? 0 : 'texto'))}`} onInput={e => change(index, { value: e.currentTarget.value })}/><FieldNote issue={issue} field={`filter-${index}`}/></Field>
      <button type="button" aria-label={`Quitar condición ${index + 1}`} disabled={config.filters.length === 1} onClick={() => onChange({ filters: config.filters.filter((_, i) => i !== index) })} class="flex items-center justify-center rounded-md text-muted hover:bg-accent disabled:opacity-25"><Icon name="close" size={13}/></button>
    </div>)}</div>
    <Button type="button" variant="ghost" icon="plus" className="mt-2 !min-h-7 !px-0 text-[11px]" disabled={config.filters.length >= 8} onClick={() => onChange({ filters: [...config.filters, firstFilter(relation)] })}>Añadir condición</Button>
  </div>;
}

export function VisualBuilder({ relation, tables, expression, isExercise, onApply, onShowResult }) {
  const chainList = useRef();
  useEffect(() => {
    if (chainList.current) chainList.current.scrollLeft = chainList.current.scrollWidth;
  }, [relation]);
  const [op, setOp] = useState('select');
  const [config, setConfig] = useState(() => defaults('select', relation, tables));
  useEffect(() => { setConfig(defaults(op, relation, tables)); }, [relation]);
  function chooseOperation(next) {
    setOp(next);
    setConfig(defaults(next, relation, tables));
  }
  function change(patch) { setConfig(current => ({ ...current, ...patch })); }
  const preview = useMemo(() => {
    const issue = builderIssue(config, relation);
    if (issue) return { issue, error: issue.message };
    try { const next = build(expression, config, tables); return { expression: next, result: run(next, tables) }; }
    catch (err) {
      const field = ['union', 'difference', 'intersect', 'divide'].includes(config.op) ? 'other' : config.op === 'join' ? 'table' : null;
      return { error: err.message, semantic: true, issue: { field, kind: 'invalid', message: err.message } };
    }
  }, [expression, config, tables, relation]);
  const [symbol, title, description] = operations[op];
  const compatible = Object.keys(tables).filter(name => {
    const cols = Object.keys(tables[name][0]);
    return cols.length === relation.cols.length && cols.every(col => relation.cols.includes(col) && typeof tables[name][0][col] === relation.types[col]);
  });
  const common = relation.cols.filter(column => Object.hasOwn(tables[config.table]?.[0] || {}, column));
  const steps = [];
  for (let node = relation; node; node = node.children[0]) steps.unshift(node);

  return <div>
    <section class="query-chain" aria-label="Consulta encadenada">
      <div class="flex items-center justify-between gap-2"><h3 class="text-xs font-semibold">Tu consulta, paso a paso</h3><span class="text-[10px] text-muted">{steps.length - 1} {steps.length === 2 ? 'operación' : 'operaciones'}</span></div>
      <ol ref={chainList} class="query-chain-steps" tabIndex={0} aria-label="Pasos encadenados, desplázate horizontalmente para recorrerlos">{steps.map((step, i) => <li key={i} aria-current={i === steps.length - 1 ? 'step' : undefined}><span class="query-chain-index">{i}</span><span class="min-w-0"><span class="block break-words font-mono text-[11px]">{step.label}{step.children.length > 1 && <span class="font-sans text-muted"> · con {step.children[1].label}</span>}</span><span class="text-[10px] text-muted">{step.rows.length} {step.rows.length === 1 ? 'fila' : 'filas'} · {step.cols.length} columnas</span></span></li>)}</ol>
      <p class="text-[11px] leading-relaxed text-muted">{steps.length > 1 ? isExercise ? 'Paso añadido. Puedes seguir construyendo o pulsar «Comprobar» cuando la consulta responda al reto.' : 'Paso añadido. Puedes seguir construyendo o explorar el resultado cuando quieras.' : 'Elige una operación para comenzar.'} Cada paso utiliza el resultado anterior.</p>
    </section>
    <section class="operation-picker border-b border-line" aria-label="Operaciones disponibles"><h3 class="text-xs font-semibold">1 · Elige una operación</h3>{operationGroups.map(([group, ids]) => <div key={group}><p class="operation-group-label">{group}</p><div class="operation-grid grid grid-cols-3 gap-2">{ids.map(id => { const [glyph, name] = operations[id]; return <button key={id} type="button" data-op={id} aria-pressed={op === id} aria-controls="operation-form" onClick={() => chooseOperation(id)} class={`flex min-h-14 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors ${op === id ? 'border-brand bg-brand text-white' : 'border-line bg-white text-muted hover:border-ring/40 hover:bg-accent hover:text-accent-foreground'}`}><span class="math w-5 shrink-0 text-center text-2xl">{glyph}</span><span class="text-[10px] font-medium sm:text-[11px]">{name}</span></button>; })}</div></div>)}</section>
    <form id="operation-form" class="operation-form p-5" onSubmit={event => { event.preventDefault(); if (!preview.error) onApply(preview.expression); }}>
      <p class="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">2 · Configura el paso</p>
      <div class="mb-5 flex items-center gap-3"><span class="math text-4xl text-brand">{symbol}</span><div><h3 class="font-display text-sm font-bold">{title}</h3><p class="mt-1 text-[11px] leading-relaxed text-muted">{description}</p></div></div>
      <div role="status" aria-live="polite" class={`builder-step-status mb-4 ${preview.error ? preview.issue?.kind === 'invalid' ? 'is-invalid' : 'is-incomplete' : preview.result.rows.length === 0 ? 'is-empty' : 'is-ready'}`}><strong>{preview.error ? preview.semantic ? 'Esta operación no se puede aplicar' : preview.issue?.kind === 'invalid' ? 'Revisa este dato' : 'Falta completar el paso' : preview.result.rows.length === 0 ? 'Paso válido: resultado vacío' : 'Paso listo para añadir'}</strong><span>{preview.error || (preview.result.rows.length === 0 ? 'Si esperabas filas, revisa la operación antes de añadirla.' : 'Comprueba las filas de muestra y pulsa «Añadir paso».')}</span></div>
      {['select', 'delete', 'update'].includes(op) && <Conditions config={config} relation={relation} issue={preview.issue} onChange={change}/>}
      {op === 'project' && <div><div class="grid grid-cols-2 gap-2">{relation.cols.map(column => <label key={column} class={`flex items-center gap-2 rounded-lg border p-2.5 text-xs ${config.columns.includes(column) ? 'border-brand/25 bg-soft/50' : 'border-line'}`}><input type="checkbox" class="accent-brand" checked={config.columns.includes(column)} onChange={e => change({ columns: e.currentTarget.checked ? [...config.columns, column].sort((a, b) => relation.cols.indexOf(a) - relation.cols.indexOf(b)) : config.columns.filter(c => c !== column) })}/><span class="break-all font-mono text-[11px]">{column}</span></label>)}</div><FieldNote issue={preview.issue} field="columns"/></div>}
      {op === 'join' && <div><Field label="Tabla para conectar"><select id="joinTable" class="field" value={config.table} onChange={e => change({ table: e.currentTarget.value })}><option value="">Elige una tabla</option>{Object.keys(tables).map(name => <option key={name}>{name}</option>)}</select><FieldNote issue={preview.issue} field="table"/></Field><div class="mt-3 rounded-lg border border-dashed border-brand/20 bg-soft/35 p-3 text-[11px] text-muted">{!config.table ? 'Elige una tabla que comparta al menos una columna con el resultado actual.' : common.length ? <>Se relacionarán por: <strong class="font-mono text-brand">{common.join(', ')}</strong></> : 'Estas tablas no comparten columnas: se combinará cada fila con todas las de la otra tabla.'}</div></div>}
      {op === 'insert' && <div class="grid grid-cols-2 gap-3">{relation.cols.map(column => <Field key={column} label={`${column} · ${relation.types[column] === 'number' ? 'número' : 'texto'}`}><input class="field text-xs" aria-label={`Valor de ${column}`} aria-invalid={preview.issue?.field === `row-${column}` && preview.issue.kind === 'invalid' || undefined} value={config.row[column] ?? ''} onInput={e => change({ row: { ...config.row, [column]: e.currentTarget.value } })}/><FieldNote issue={preview.issue} field={`row-${column}`}/></Field>)}</div>}
      {op === 'update' && <div class="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4"><Field label="Columna a modificar"><select id="updateField" class="field text-xs" value={config.field} onChange={e => change({ field: e.currentTarget.value, mode: 'set', value: null })}>{relation.cols.map(col => <option key={col}>{col}</option>)}</select></Field><Field label="Tipo de cambio"><select id="updateMode" class="field text-xs" value={config.mode} onChange={e => change({ mode: e.currentTarget.value, value: null })}><option value="set">Sustituir valor</option><option value="add" disabled={relation.types[config.field] !== 'number'}>Sumar cantidad</option></select></Field><Field label={config.mode === 'add' ? 'Cantidad que se suma' : 'Nuevo valor'} className="col-span-2"><input id="updateValue" class="field" aria-invalid={preview.issue?.field === 'value' && preview.issue.kind === 'invalid' || undefined} value={config.value ?? ''} placeholder="Escribe el valor nuevo" onInput={e => change({ value: e.currentTarget.value })}/><FieldNote issue={preview.issue} field="value"/></Field></div>}
      {['union', 'difference', 'intersect', 'divide'].includes(op) && <div class="space-y-3"><Field label={op === 'divide' ? 'Elegir una tabla divisora' : 'Elegir una tabla compatible'}><select class="field" value={(op === 'divide' ? Object.keys(tables) : compatible).includes(config.other) ? config.other : ''} onChange={e => change({ other: e.currentTarget.value })}><option value="">Expresión personalizada…</option>{(op === 'divide' ? Object.keys(tables) : compatible).map(name => <option key={name}>{name}</option>)}</select></Field><Field label="Segunda relación"><input class="field font-mono text-xs" aria-invalid={preview.issue?.field === 'other' && preview.issue.kind === 'invalid' || undefined} value={config.other} onInput={e => change({ other: e.currentTarget.value })} placeholder={op === 'divide' ? 'π codigoServicio (Servicios)' : "σ ciudad = 'Juarez' (Casa)"}/><FieldNote issue={preview.issue} field="other"/></Field><p class="text-[10px] leading-relaxed text-muted">{op === 'divide' ? 'Las columnas del divisor deben estar en la primera relación. Proyecta las necesarias antes de dividir.' : 'Ambas relaciones necesitan las mismas columnas y tipos.'}</p></div>}
      <div class="builder-preview mt-5 border-t border-line pt-4"><h3 class="text-xs font-semibold">3 · Revisa antes de añadir</h3><div class="mt-2 text-xs leading-relaxed">{preview.error ? <p class="text-muted">La muestra aparecerá cuando el paso esté completo.</p> : <p><strong class="text-brand">{relation.rows.length} → {preview.result.rows.length}</strong> filas · {preview.result.cols.length} columnas</p>}</div>{preview.result && (preview.result.rows.length ? <div class="builder-preview-table mt-3 overflow-x-auto"><table><thead><tr>{preview.result.cols.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{preview.result.rows.slice(0, 3).map((row, index) => <tr key={index}>{preview.result.cols.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody></table></div> : <p class="mt-2 text-xs text-muted">El resultado no tendrá filas. Revisa la condición si esperabas coincidencias.</p>)}{preview.result?.rows.length > 3 && <p class="mt-1 text-[10px] text-muted">Se muestran las primeras 3 filas.</p>}</div>
      <div class="mt-4 flex flex-wrap items-center gap-2"><Button id="apply" type="submit" variant="primary" disabled={!!preview.error}>Añadir paso <Icon name="plus"/></Button><Button type="button" variant="ghost" onClick={onShowResult}>Ejecutar y ver resultado <Icon name="arrow"/></Button></div>
      <p class="mt-3 text-[11px] leading-relaxed text-muted">«Añadir paso» incorpora esta operación a tu consulta. {isExercise ? 'Cuando la consulta resuelva el reto, pulsa «Comprobar» arriba.' : 'Puedes encadenar más operaciones o pulsar «Ejecutar y ver resultado» para explorar los datos.'}</p>
    </form>
    <details class="border-t border-line bg-canvas/40"><summary class="cursor-pointer px-5 py-3 text-[11px] text-muted">Expresión actual <span class="math float-right tracking-widest text-brand">σ π ⋈</span></summary><pre class="expression max-h-40 overflow-auto px-5 pb-4"><Expression text={expression} tables={tables}/></pre></details>
  </div>;
}
