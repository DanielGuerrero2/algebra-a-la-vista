import { Button, Icon } from './ui.jsx';
import { VisualBuilder } from './VisualBuilder.jsx';
import { Editor } from './Editor.jsx';
import { Inspector } from './Inspector.jsx';
import { QueryControls } from './QueryControls.jsx';
import { useState } from 'preact/hooks';

export function PlaygroundProjects({ projects, onCreate, onSelect, onRename, onRemove }) {
  const [formMode, setFormMode] = useState(null);
  const [draft, setDraft] = useState('');
  const [issue, setIssue] = useState('');
  const active = projects.projects.find(project => project.id === projects.activeId);
  function openForm(mode) {
    setFormMode(mode);
    setDraft(mode === 'rename' ? active.name : '');
    setIssue('');
  }
  function save(event) {
    event.preventDefault();
    const name = draft.trim();
    if (!name) { setIssue('Escribe un nombre para el proyecto.'); return; }
    if (projects.projects.some(project => project.id !== (formMode === 'rename' ? active.id : null) && project.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setIssue('Ya existe un proyecto con ese nombre.');
      return;
    }
    const saved = formMode === 'create' ? onCreate(name) : onRename(active.id, name);
    if (saved) setFormMode(null);
  }
  return <section class="playground-projects" aria-label="Proyectos">
    <div class="playground-project-heading">
      <span>PROYECTOS <small>{projects.projects.length}</small></span>
      {formMode === null && <button type="button" onClick={() => openForm('create')}><Icon name="plus" size={14}/> Nuevo</button>}
    </div>
    {formMode === null ? <>
      <label class="sr-only" for="playground-project-select">Proyecto activo</label>
      <select id="playground-project-select" value={projects.activeId} onChange={event => onSelect(Number(event.currentTarget.value))}>
        {projects.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
      <div class="playground-project-meta">
        <span>{Object.keys(active.tables).length} {Object.keys(active.tables).length === 1 ? 'tabla' : 'tablas'} · {active.queries.tabs.length} {active.queries.tabs.length === 1 ? 'consulta' : 'consultas'}</span>
        <div class="playground-project-actions">
          <button type="button" aria-label="Renombrar proyecto" title="Renombrar proyecto" onClick={() => openForm('rename')}><Icon name="edit" size={15}/></button>
          <button type="button" aria-label="Eliminar proyecto" title="Eliminar proyecto" disabled={projects.projects.length === 1} onClick={onRemove}><Icon name="trash" size={15}/></button>
        </div>
      </div>
    </> : <form class="playground-project-form" onSubmit={save}>
      <label for="playground-project-name">{formMode === 'create' ? 'Nombre del nuevo proyecto' : 'Cambiar nombre'}</label>
      <input id="playground-project-name" value={draft} maxLength={60} placeholder="Ej. Base de mascotas" aria-invalid={!!issue} aria-describedby={issue ? 'playground-project-issue' : undefined} onInput={event => { setDraft(event.currentTarget.value); setIssue(''); }} onKeyDown={event => { if (event.key === 'Escape') setFormMode(null); }} autoFocus/>
      {issue && <p id="playground-project-issue" role="alert">{issue}</p>}
      <div class="playground-project-form-actions"><button type="button" onClick={() => setFormMode(null)}>Cancelar</button><button type="submit">{formMode === 'create' ? 'Crear proyecto' : 'Guardar'}</button></div>
    </form>}
  </section>;
}

export function PlaygroundTables({ tables, source, onImport, onSelect, onRemove }) {
  const names = Object.keys(tables);
  return <aside class="playground-tables" aria-labelledby="playground-tables-title">
    <div class="playground-sidebar-heading"><h1 id="playground-tables-title">TABLAS <span>{names.length}</span></h1><button aria-label="Importar tablas" title="Importar tablas" onClick={onImport}><Icon name="plus" size={15}/></button></div>
    <div class="playground-table-list">{names.map(name => <div key={name} class={`playground-table-item ${source === name ? 'is-active' : ''}`}><button onClick={() => onSelect(name)} aria-current={source === name ? 'true' : undefined}><Icon name="table" size={14}/><span>{name}</span><small>{tables[name].length}</small></button><button class="playground-table-remove" aria-label={`Eliminar tabla ${name}`} title={`Eliminar ${name}`} onClick={() => onRemove(name)}><Icon name="close" size={13}/></button></div>)}{!names.length && <div class="playground-empty-tables"><span class="playground-empty-tables-icon"><Icon name="table" size={19}/></span><strong>Este proyecto aún no tiene tablas</strong><p>Importa tus archivos para empezar a consultar.</p><button type="button" onClick={onImport}><Icon name="plus" size={13}/> Importar tablas</button></div>}</div>
    <details class="playground-sidebar-help"><summary>Formatos admitidos</summary><p>CSV o JSON: una tabla por archivo. TXT con <code>group: NOMBRE</code>: varias relaciones tipadas en un archivo.</p><p>Máximo 2 MB por archivo y 20 000 filas por tabla. El trabajo se guarda en este navegador.</p></details>
  </aside>;
}

export function PlaygroundQuery({ tables, queries, work, mode, root, stale, error, onAddQuery, onSelectQuery, onCloseQuery, onModeChange, onUndo, onRedo, onEdit, onExecute, onApply, onImport }) {
  const names = Object.keys(tables);
  function navigateTabs(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    onSelectQuery(queries.tabs[next].id);
  }
  return <section class="playground-query" aria-label="Editor de consultas">
    <div class="playground-query-tabs"><div class="playground-query-title" role="tablist" aria-label="Consultas" onKeyDown={navigateTabs}>{queries.tabs.map(tab => <div class={`playground-tab ${tab.id === queries.activeId ? 'is-active' : ''}`} key={tab.id}><button type="button" role="tab" id={`playground-tab-${tab.id}`} aria-selected={tab.id === queries.activeId} aria-controls="playground-query-panel" tabIndex={tab.id === queries.activeId ? 0 : -1} onClick={() => onSelectQuery(tab.id)}><span>Consulta {tab.id}</span><small>{tab.work.source || 'Sin tabla'}</small></button>{queries.tabs.length > 1 && <button type="button" class="playground-tab-close" aria-label={`Cerrar consulta ${tab.id}`} title={`Cerrar consulta ${tab.id}`} onClick={() => onCloseQuery(tab.id)}><Icon name="close" size={12}/></button>}</div>)}<button type="button" class="playground-add-query" onClick={onAddQuery}><Icon name="plus" size={15}/><span>Nueva consulta</span></button></div><QueryControls mode={mode} onModeChange={onModeChange} onUndo={onUndo} onRedo={onRedo} undoDisabled={work.index === 0 && work.expression === work.history[0]} redoDisabled={work.index === work.history.length - 1 || stale} labels={{ visual: 'Visual', code: 'Símbolos' }} order={['code', 'visual']} className="playground-query-actions"><Button variant="primary" icon="play" disabled={!names.length} onClick={onExecute}>Ejecutar</Button></QueryControls></div>
    {names.length ? <div id="playground-query-panel" role="tabpanel" aria-labelledby={`playground-tab-${queries.activeId}`} class="playground-editor-body query-panel">{mode === 'code' ? <Editor key={queries.activeId} expression={work.expression} tables={tables} executionError={stale ? null : error} onEdit={onEdit} onExecute={onExecute} showExecuteFooter={false}/> : root ? <VisualBuilder key={queries.activeId} relation={root} tables={tables} expression={work.expression} isExercise={false} onApply={onApply} onShowResult={onExecute}/> : <div class="p-6 text-sm text-muted">{error || 'Ejecuta tu expresión para continuar.'}</div>}</div> : <div id="playground-query-panel" role="tabpanel" aria-labelledby={`playground-tab-${queries.activeId}`} class="playground-empty-editor"><span class="math">σ π ⋈</span><h2>Tu espacio para experimentar</h2><p>Importa tus tablas para construir y ejecutar expresiones de álgebra relacional.</p><Button variant="primary" icon="plus" onClick={onImport}>Importar archivos</Button></div>}
  </section>;
}

export function PlaygroundResults({ work, root, stale, error, notice }) {
  return <section class="playground-results" aria-label="Resultados de la consulta"><div class="playground-results-heading"><h2>RESULTADOS</h2><span>{work.resultVisible && root ? `${root.rows.length} ${root.rows.length === 1 ? 'fila' : 'filas'}` : 'Sin ejecutar'}</span></div>{notice && <div role="status" class={`playground-notice ${notice.kind === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}<Inspector root={work.resultVisible ? root : null} stale={stale} error={work.resultVisible ? error : null}/></section>;
}
