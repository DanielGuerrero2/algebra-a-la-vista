import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { parseTableFile, parseTableGroup } from '../core/playground-import.js';
import { loadPlayground, savePlayground } from '../core/playground-storage.js';
import { createSession } from '../core/session.js';
import { reducePlaygroundProjects } from '../core/playground-projects.js';
import { run } from '../core/engine.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
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
    setNotice({ kind: rejected.length ? 'error' : 'success', text: [accepted.length && `${accepted.length} ${accepted.length === 1 ? 'tabla cargada' : 'tablas cargadas'}: ${accepted.join(', ')}.`, ...rejected].filter(Boolean).join(' ') });
  }

  function remove(name) {
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

  return <div class="playground-shell">
    <input type="file" accept=".csv,.json,.txt" multiple hidden ref={fileInput} onChange={importFiles}/>
    <a href="#playground-main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4">Ir al playground</a>
    <SiteHeader current="playground" className="playground-toolbar" afterBrand={<><span class="playground-toolbar-divider"/><strong>Playground</strong></>}/>
    <main id="playground-main" tabIndex={-1} class="playground-workspace">
      <div class="playground-sidebar"><PlaygroundProjects projects={projects} onCreate={createProject} onSelect={id => { dispatchProjects({ type: 'select', id }); setNotice(null); }} onRename={renameProject} onRemove={removeProject}/><PlaygroundTables tables={tables} source={work.source} onImport={() => fileInput.current?.click()} onSelect={selectTable} onRemove={remove}/></div>
      <div class="playground-main-pane">
        <PlaygroundQuery tables={tables} queries={queries} work={work} mode={mode} root={root} stale={stale} error={parsed.error} onAddQuery={addQuery} onSelectQuery={selectQuery} onCloseQuery={closeQuery} onModeChange={changeMode} onUndo={() => dispatch({ type: 'undo' })} onRedo={() => dispatch({ type: 'redo' })} onEdit={expression => dispatch({ type: 'edit', expression })} onExecute={() => execute()} onApply={expression => execute(expression, false)} onImport={() => fileInput.current?.click()}/>
        <PlaygroundResults work={work} root={root} stale={stale} error={parsed.error} notice={notice}/>
      </div>
    </main>
  </div>;
}
