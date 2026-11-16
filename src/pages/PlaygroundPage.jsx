import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { parseTableFile, parseTableGroup } from '../core/playground-import.js';
import { loadPlayground, savePlayground } from '../core/playground-storage.js';
import { createSession, reduceSession } from '../core/session.js';
import { run } from '../core/engine.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { PlaygroundTables, PlaygroundQuery, PlaygroundResults } from '../components/PlaygroundSections.jsx';

export function PlaygroundPage() {
  const fileInput = useRef(null);
  const [saved] = useState(() => loadPlayground(window.localStorage));
  const [tables, setTables] = useState(saved.tables);
  const [work, dispatch] = useReducer(reduceSession, saved.work);
  const [mode, setMode] = useState(saved.mode);
  const [notice, setNotice] = useState(saved.warning ? { kind: 'error', text: saved.warning } : null);
  useEffect(() => {
    const error = savePlayground(window.localStorage, { tables, work, mode });
    if (error) setNotice({ kind: 'error', text: error === 'limit' ? 'El trabajo supera 2 MB y no se pudo guardar. Se conserva el último guardado válido.' : 'No se pudo guardar el trabajo en este navegador.' });
  }, [tables, work, mode]);
  const stale = work.expression !== work.executed;
  const names = Object.keys(tables);
  const parsed = useMemo(() => {
    if (!work.executed || !names.length) return { root: null, error: null };
    try { return { root: run(work.executed, tables), error: null }; }
    catch (error) { return { root: null, error: error.message }; }
  }, [work.executed, tables]);
  const root = stale ? null : parsed.root;

  function selectTable(name) {
    dispatch({ type: 'load', session: createSession(name) });
    dispatch({ type: 'execute', expression: name, valid: true, showResult: true });
    setNotice(null);
  }

  async function importFiles(event) {
    const files = [...event.currentTarget.files];
    event.currentTarget.value = '';
    if (!files.length) return;
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
      setTables(next);
      if (!work.source) selectTable(accepted[0]);
    }
    setNotice({ kind: rejected.length ? 'error' : 'success', text: [accepted.length && `${accepted.length} ${accepted.length === 1 ? 'tabla cargada' : 'tablas cargadas'}: ${accepted.join(', ')}.`, ...rejected].filter(Boolean).join(' ') });
  }

  function remove(name) {
    const next = { ...tables };
    delete next[name];
    setTables(next);
    let usesRemovedTable = work.source === name;
    if (!usesRemovedTable && !stale && !parsed.error) {
      try { run(work.expression, next); }
      catch { usesRemovedTable = true; }
    }
    if (usesRemovedTable) {
      const source = Object.keys(next)[0] || '';
      dispatch({ type: 'load', session: createSession(source) });
      if (source) dispatch({ type: 'execute', expression: source, valid: true, showResult: true });
    }
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
    setMode(next);
  }

  return <div class="playground-shell">
    <input type="file" accept=".csv,.json,.txt" multiple hidden ref={fileInput} onChange={importFiles}/>
    <a href="#playground-main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4">Ir al playground</a>
    <SiteHeader current="playground" className="playground-toolbar" afterBrand={<><span class="playground-toolbar-divider"/><strong>Playground</strong></>}/>
    <main id="playground-main" tabIndex={-1} class="playground-workspace">
      <PlaygroundTables tables={tables} source={work.source} onImport={() => fileInput.current?.click()} onSelect={selectTable} onRemove={remove}/>
      <div class="playground-main-pane">
        <PlaygroundQuery tables={tables} work={work} mode={mode} root={root} stale={stale} error={parsed.error} onModeChange={changeMode} onUndo={() => dispatch({ type: 'undo' })} onRedo={() => dispatch({ type: 'redo' })} onEdit={expression => dispatch({ type: 'edit', expression })} onExecute={() => execute()} onApply={expression => execute(expression, false)} onImport={() => fileInput.current?.click()}/>
        <PlaygroundResults work={work} root={root} stale={stale} error={parsed.error} notice={notice}/>
      </div>
    </main>
  </div>;
}
