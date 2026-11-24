import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { parseTableFile, parseTableGroup } from '../core/playground-import.js';
import { loadPlayground, savePlayground } from '../core/playground-storage.js';
import { createSession } from '../core/session.js';
import { reducePlaygroundProjects } from '../core/playground-projects.js';
import { run } from '../core/engine.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { Icon } from '../components/ui.jsx';
import datasets from '../data/datasets.json';
import { PlaygroundProjects, PlaygroundTables, PlaygroundQuery, PlaygroundResults } from '../components/PlaygroundSections.jsx';

export function PlaygroundPage() {
  const fileInput = useRef(null);
  const [saved] = useState(() => loadPlayground(window.localStorage));
  const [projects, dispatchProjects] = useReducer(reducePlaygroundProjects, saved.projects);
  const project = projects.projects.find(item => item.id === projects.activeId);
  const { tables, queries, mode } = project;
  const dispatchQueries = action => dispatchProjects({ type: 'query', action });
  const activeTab = queries.tabs.find(tab => tab.id === queries.activeId);
  const work = activeTab.work;
  const dispatch = action => dispatchQueries({ type: 'session', action });
  const [notice, setNotice] = useState(saved.warning ? { kind: 'error', text: saved.warning } : null);
  const [importNotice, setImportNotice] = useState(null);
  const [showData, setShowData] = useState(false);
  const activeImportNotice = importNotice?.projectId === project.id ? importNotice : null;
  useEffect(() => {
    if (activeImportNotice) document.getElementById('playground-import-feedback')?.scrollIntoView({ block: 'nearest' });
  }, [activeImportNotice]);
  useEffect(() => {
    const error = savePlayground(window.localStorage, { projects });
    if (error) setNotice({ kind: 'error', text: error === 'limit' ? 'El trabajo supera 2 MB y no se pudo guardar. Se conserva el último guardado válido.' : 'No se pudo guardar el trabajo en este navegador.' });
  }, [projects]);
  const stale = work.expression !== work.executed;
  const names = Object.keys(tables);
  const parsed = useMemo(() => {
    if (!work.executed || !names.length) return { root: null, error: null };
    try { return { root: run(work.executed, tables), error: null }; }
    catch (error) { return { root: null, error: error.message }; }
  }, [work.executed, tables]);
  const root = stale ? null : parsed.root;

  function createProject(name) {
    dispatchProjects({ type: 'new', name });
    setNotice(null);
    return true;
  }

  function loadExample() {
    const names = new Set(projects.projects.map(item => item.name.toLocaleLowerCase()));
    const title = 'Ejemplo de casas';
    let name = title;
    for (let number = 2; names.has(name.toLocaleLowerCase()); number++) name = `${title} ${number}`;
    dispatchProjects({ type: 'new', name, tables: { Casa: datasets[0].relations.Casa }, source: 'Casa' });
    setNotice({ kind: 'success', text: 'Se abrió la tabla Casa en un proyecto nuevo. Prueba a filtrar por precio.' });
    document.getElementById('playground-main')?.focus();
  }

  function renameProject(id, name) {
    const trimmed = name.trim();
    if (!trimmed || projects.projects.some(item => item.id !== id && item.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
      setNotice({ kind: 'error', text: 'Escribe un nombre de proyecto distinto.' });
      return false;
    }
    dispatchProjects({ type: 'rename', id, name: trimmed });
    setNotice(null);
    return true;
  }

  function removeProject() {
    if (projects.projects.length === 1 || !window.confirm(`¿Eliminar el proyecto «${project.name}» y sus tablas y consultas?`)) return;
    dispatchProjects({ type: 'remove', id: project.id });
    setNotice(null);
  }

  function selectTable(name) {
    dispatch({ type: 'load', session: createSession(name) });
    dispatch({ type: 'execute', expression: name, valid: true, showResult: true });
    setNotice(null);
  }

  function addQuery() {
    dispatchQueries({ type: 'new', source: work.source || names[0] || '' });
    setNotice(null);
  }

  function selectQuery(id) {
    dispatchQueries({ type: 'select', id });
    setNotice(null);
  }

  function closeQuery(id) {
    dispatchQueries({ type: 'close', id });
    setNotice(null);
  }

  async function importFiles(event) {
    const files = [...event.currentTarget.files];
    event.currentTarget.value = '';
    if (!files.length) return;
    const projectId = project.id;
    const next = { ...tables };
    const accepted = [], rejected = [];
    for (const file of files) {
      try {
        if (file.size > 2 * 1024 * 1024) throw Error('El archivo supera 2 MB.');
        const text = await file.text();
        let entries;
        if (/\.txt$/i.test(file.name)) entries = Object.entries(parseTableGroup(file.name, text).tables);
        else {
          const { name, rows } = parseTableFile(file.name, text);
          entries = [[name, rows]];
        }
        const duplicate = entries.find(([name]) => Object.hasOwn(next, name));
        if (duplicate) throw Error(`Ya existe la tabla ${duplicate[0]}. Elimínala antes de cargar otra con ese nombre.`);
        for (const [name, rows] of entries) { next[name] = rows; accepted.push(name); }
      } catch (error) { rejected.push(`${file.name}: ${error.message}`); }
    }
    if (accepted.length) {
      dispatchProjects({ type: 'tables', projectId, tables: next });
      if (!work.source) dispatchProjects({ type: 'query', projectId, action: { type: 'session', action: { type: 'load', session: { ...createSession(accepted[0]), resultVisible: true } } } });
    }
    setImportNotice({
      projectId,
      kind: rejected.length ? 'error' : 'success',
      text: [accepted.length && `${accepted.length} ${accepted.length === 1 ? 'tabla cargada' : 'tablas cargadas'}: ${accepted.join(', ')}.`, ...rejected].filter(Boolean).join(' '),
    });
    setShowData(true);
  }

  function remove(name) {
    setImportNotice(null);
    const next = { ...tables };
    delete next[name];
    dispatchProjects({ type: 'tables', tables: next });
    const source = Object.keys(next)[0] || '';
    dispatchQueries({ type: 'replaceWorks', replace: current => {
      let invalid = current.source === name;
      if (!invalid && current.executed && source) {
        try { run(current.executed, next); }
        catch { invalid = true; }
      }
      if (!source || invalid) return { ...createSession(source), resultVisible: !!source };
      return current;
    } });
    setNotice({ kind: 'success', text: `Tabla ${name} eliminada.` });
  }

  function execute(expression = work.expression, showResult = true) {
    try {
      run(expression, tables);
      dispatch({ type: 'execute', expression, valid: true, showResult });
      setNotice(null);
      return true;
    } catch (error) {
      dispatch({ type: 'execute', expression, valid: false, showResult });
      setNotice({ kind: 'error', text: error.message });
      return false;
    }
  }

  function changeMode(next) {
    if (next === 'visual' && stale && !execute(work.expression, false)) return;
    dispatchProjects({ type: 'mode', mode: next });
  }

  function showResults() {
    if (!execute() || !window.matchMedia('(width < 768px)').matches) return;
    requestAnimationFrame(() => {
      const results = document.getElementById('playground-results');
      results?.focus({ preventScroll: true });
      results?.scrollIntoView({ block: 'start' });
    });
  }

  return <div class="playground-shell">
    <input type="file" accept=".csv,.json,.txt" multiple hidden ref={fileInput} onChange={importFiles}/>
    <SiteHeader current="playground" mainId="playground-main" className="workspace-header" afterBrand={<h1 class="site-context">Playground</h1>}/>
    <main id="playground-main" tabIndex={-1} class="playground-workspace">
      <button type="button" class="playground-data-toggle" aria-controls="playground-data" aria-expanded={showData} onClick={() => setShowData(!showData)}>
        <Icon name="table" size={16}/> Proyectos y tablas
        <span class="math" aria-hidden="true">{showData ? '▴' : '▾'}</span>
      </button>
      <div id="playground-data" class="playground-sidebar" data-open={showData}><PlaygroundProjects projects={projects} onCreate={createProject} onSelect={id => { dispatchProjects({ type: 'select', id }); setNotice(null); }} onRename={renameProject} onRemove={removeProject}/><PlaygroundTables tables={tables} source={work.source} importNotice={activeImportNotice} onImport={() => fileInput.current?.click()} onSelect={selectTable} onRemove={remove}/></div>
      <div class="playground-main-pane" data-empty={names.length === 0}>
        <PlaygroundQuery tables={tables} queries={queries} work={work} mode={mode} root={root} stale={stale} error={parsed.error} onAddQuery={addQuery} onSelectQuery={selectQuery} onCloseQuery={closeQuery} onModeChange={changeMode} onUndo={() => dispatch({ type: 'undo' })} onRedo={() => dispatch({ type: 'redo' })} onEdit={expression => dispatch({ type: 'edit', expression })} onExecute={showResults} onApply={expression => execute(expression, false)} onImport={() => fileInput.current?.click()} onLoadExample={loadExample}/>
        <PlaygroundResults work={work} root={root} stale={stale} error={parsed.error} notice={notice}/>
      </div>
    </main>
  </div>;
}
