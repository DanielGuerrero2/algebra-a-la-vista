import { Button, Icon } from './ui.jsx';
import { VisualBuilder } from './VisualBuilder.jsx';
import { Editor } from './Editor.jsx';
import { Inspector } from './Inspector.jsx';
import { QueryControls } from './QueryControls.jsx';

export function PlaygroundTables({ tables, source, onImport, onSelect, onRemove }) {
  const names = Object.keys(tables);
  return <aside class="playground-tables" aria-labelledby="playground-tables-title">
    <div class="playground-sidebar-heading"><h1 id="playground-tables-title">TABLAS <span>{names.length}</span></h1><button aria-label="Importar tablas" title="Importar tablas" onClick={onImport}><Icon name="plus" size={15}/></button></div>
    <div class="playground-table-list">{names.map(name => <div key={name} class={`playground-table-item ${source === name ? 'is-active' : ''}`}><button onClick={() => onSelect(name)} aria-current={source === name ? 'true' : undefined}><Icon name="table" size={14}/><span>{name}</span><small>{tables[name].length}</small></button><button class="playground-table-remove" aria-label={`Eliminar tabla ${name}`} title={`Eliminar ${name}`} onClick={() => onRemove(name)}><Icon name="close" size={13}/></button></div>)}{!names.length && <p class="playground-empty-tables">Importa CSV, JSON o un grupo TXT para comenzar.</p>}</div>
    <div class="playground-sidebar-help"><strong>Formato de archivos</strong><p>CSV o JSON: una tabla por archivo. TXT con <code>group: NOMBRE</code>: varias relaciones tipadas en un archivo.</p><p>Máximo 2 MB por archivo y 20 000 filas por tabla. El trabajo se guarda en este navegador.</p></div>
  </aside>;
}

export function PlaygroundQuery({ tables, work, mode, root, stale, error, onModeChange, onUndo, onRedo, onEdit, onExecute, onApply, onImport }) {
  const names = Object.keys(tables);
  return <section class="playground-query" aria-label="Editor de consultas">
    <div class="playground-query-tabs"><div class="playground-query-title"><span class="playground-tab-active">Consulta </span><span class="playground-tab-name">{work.source || 'Sin tabla'}</span></div><QueryControls mode={mode} onModeChange={onModeChange} onUndo={onUndo} onRedo={onRedo} undoDisabled={work.index === 0 && work.expression === work.history[0]} redoDisabled={work.index === work.history.length - 1 || stale} labels={{ visual: 'Visual', code: 'Símbolos' }} order={['code', 'visual']} className="playground-query-actions"><Button variant="primary" icon="play" disabled={!names.length} onClick={onExecute}>Ejecutar</Button></QueryControls></div>
    {names.length ? <div class="playground-editor-body query-panel">{mode === 'code' ? <Editor expression={work.expression} tables={tables} executionError={stale ? null : error} onEdit={onEdit} onExecute={onExecute} showExecuteFooter={false}/> : root ? <VisualBuilder key={work.source} relation={root} tables={tables} expression={work.expression} isExercise={false} onApply={onApply} onShowResult={onExecute}/> : <div class="p-6 text-sm text-muted">{error || 'Ejecuta tu expresión para continuar.'}</div>}</div> : <div class="playground-empty-editor"><span class="math">σ π ⋈</span><h2>Tu espacio para experimentar</h2><p>Importa tus tablas para construir y ejecutar expresiones de álgebra relacional.</p><Button variant="primary" icon="plus" onClick={onImport}>Importar archivos</Button></div>}
  </section>;
}

export function PlaygroundResults({ work, root, stale, error, notice }) {
  return <section class="playground-results" aria-label="Resultados de la consulta"><div class="playground-results-heading"><h2>RESULTADOS</h2><span>{work.resultVisible && root ? `${root.rows.length} ${root.rows.length === 1 ? 'fila' : 'filas'}` : 'Sin ejecutar'}</span></div>{notice && <div role="status" class={`playground-notice ${notice.kind === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}<Inspector root={work.resultVisible ? root : null} stale={stale} error={work.resultVisible ? error : null}/></section>;
}
