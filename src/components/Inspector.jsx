import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button } from './ui.jsx';
import { DataTable } from './DataTable.jsx';

function explain(node) {
  const input = node.children[0];
  if (!input) return node.label === 'Nuevas filas' ? 'Relación construida con los nuevos valores.' : `Tabla original: ${node.rows.length} filas disponibles.`;
  if (node.label.startsWith('σ')) return `De ${input.rows.length} filas, ${node.rows.length} cumplen la condición. Se retiran ${input.rows.length - node.rows.length}.`;
  if (node.label.startsWith('π')) return `Conserva ${node.cols.length} de ${input.cols.length} columnas y elimina ${input.rows.length - node.rows.length} filas duplicadas.`;
  if (node.label.startsWith('⋈')) return `Conecta ${input.rows.length} y ${node.children[1].rows.length} filas: ${node.rows.length} coincidencias. Las filas sin coincidencia quedan fuera.`;
  if (node.label.startsWith('−')) return `Retira ${input.rows.length - node.rows.length} filas de la primera relación. Quedan ${node.rows.length}.`;
  if (node.label.startsWith('∪')) return `Reúne las filas y elimina duplicados. Resultado: ${node.rows.length} filas.`;
  if (node.label.startsWith('∩')) return `Conserva ${node.rows.length} filas presentes en ambas relaciones.`;
  return 'Resultado de esta operación sobre sus relaciones de entrada.';
}
function downloadCsv(node, step) {
  const quote = value => '"' + String(value).replaceAll('"', '""') + '"';
  const csv = '\uFEFF' + [node.cols, ...node.rows.map(row => node.cols.map(col => row[col]))].map(row => row.map(quote).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url; link.download = `resultado-paso-${step + 1}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Inspector({ root, stale, error, comparison, explanation }) {
  const trace = useMemo(() => {
    const nodes = [], indexes = new Map();
    function visit(node) { node.children.forEach(visit); indexes.set(node, nodes.length); nodes.push(node); }
    if (root) visit(root);
    return { nodes, indexes };
  }, [root]);
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(Math.max(0, trace.nodes.length - 1)), [trace]);
  const index = Math.min(selected, Math.max(0, trace.nodes.length - 1));
  const node = trace.nodes[index];
  return <section class="panel flex min-w-0 flex-col" aria-label="Inspector de resultados">
    <div class="panel-heading"><span class="panel-number">02</span><div class="min-w-0 flex-1"><p class="eyebrow">EXPLORA LOS DATOS</p><h2 id="resultTitle" class="break-words">{node ? node === root ? 'Resultado final' : node.label : 'Resultado pendiente'}</h2></div><Button id="csv" variant="ghost" icon="download" disabled={!node} onClick={() => downloadCsv(node, index)}>CSV</Button></div>
    {node ? <>
      <div class="flex items-center justify-between gap-3 px-5 py-3 text-[11px] text-muted"><span id="resultNote">{node.rows.length} {node.rows.length === 1 ? 'fila' : 'filas'} · {node.cols.length} {node.cols.length === 1 ? 'columna' : 'columnas'}</span><span class="rounded bg-soft px-2 py-1 text-[9px] font-semibold tracking-wider text-brand">{node === root ? 'FINAL' : `PASO ${index + 1}`}</span></div>
      <div id="result" aria-live="polite" class="min-h-40"><DataTable relation={node}/></div>
      <div class="m-4 flex items-start gap-2.5 rounded-lg bg-soft/65 p-3"><span class="mt-0.5 size-4 shrink-0 rounded-full border border-brand/25 text-center text-[10px] text-brand">i</span><p id="stepExplanation" class="text-[11px] leading-relaxed text-muted">{explain(node)}</p></div>
      {explanation && <div class="mx-4 mb-4 rounded-lg border border-brand/20 bg-soft p-4" aria-label="Explicación del reto resuelto"><p class="eyebrow text-brand">RETO RESUELTO</p><h3 class="mt-1 font-display font-bold text-ink">¿Por qué funciona tu respuesta?</h3><div class="mt-3 grid gap-3 text-xs leading-relaxed sm:grid-cols-2"><div><strong class="text-brand">Qué demuestra el resultado</strong><p class="mt-1 text-muted">{explanation.result}</p></div><div><strong class="text-brand">La idea algebraica</strong><p class="mt-1 text-muted">{explanation.reason}</p></div></div></div>}
      <div class="flex items-center justify-between gap-2 border-t border-line px-5 py-3"><h3 class="text-xs font-semibold">Recorrido de la consulta</h3><div class="flex items-center gap-2"><button class="step-arrow" aria-label="Paso anterior" disabled={index === 0} onClick={() => setSelected(index - 1)}>←</button><span class="text-[10px] tabular-nums text-muted">{index + 1} / {trace.nodes.length}</span><button class="step-arrow" aria-label="Paso siguiente" disabled={index === trace.nodes.length - 1} onClick={() => setSelected(index + 1)}>→</button></div></div>
      <div class="max-h-56 space-y-1 overflow-auto px-3 pb-4" aria-label="Pasos de la consulta">{trace.nodes.map((step, i) => <button key={i} aria-label={`Paso ${i + 1}: ${step.label}`} aria-current={index === i ? 'step' : undefined} onClick={() => setSelected(i)} class={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${index === i ? 'bg-soft shadow-[inset_3px_0_0_var(--color-brand)]' : 'hover:bg-accent'}`}><span class={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${index === i ? 'border-brand bg-brand text-white' : 'border-line text-muted'}`}>{i + 1}</span><span class="min-w-0 flex-1"><span class="block break-words font-mono text-[11px]">{step.label}</span><span class="mt-1 block text-[9px] text-muted">{step.children.length ? `Entradas: ${step.children.map(n => trace.indexes.get(n) + 1).join(' y ')}` : 'Relación de entrada'}</span></span><span class="shrink-0 text-[10px] text-muted">{step.rows.length} filas</span></button>)}</div>
    </> : <div class="flex min-h-72 flex-col items-center justify-center px-8 text-center"><span class="math mb-4 text-5xl text-brand/30">{error ? '∅' : '⋈'}</span><h3 class="font-display text-sm font-bold">{error ? 'Revisa la expresión' : stale ? 'Tu consulta cambió' : 'Resultado pendiente'}</h3><p id="result" role="status" class="mt-2 max-w-72 text-xs leading-relaxed text-muted">{error || (stale ? 'Ejecuta la expresión para actualizar las filas y recorrer sus pasos.' : 'Pulsa «Ejecutar» para ver las filas. En un ejercicio también puedes pulsar «Comprobar».')}</p></div>}
    {comparison && <div class="border-t border-line"><div class="bg-amber-50 px-5 py-3"><h3 class="text-xs font-semibold text-amber-900">Resultado esperado</h3><p class="mt-1 text-[10px] text-amber-800">Compáralo con tu consulta actual.</p></div><DataTable relation={comparison} compact/></div>}
  </section>;
}
