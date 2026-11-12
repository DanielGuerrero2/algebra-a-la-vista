import { useMemo, useReducer, useRef, useState } from 'preact/hooks';
import { parseTableFile, parseTableGroup } from '../core/playground-import.js';
import { createSession, reduceSession } from '../core/session.js';
import { run } from '../core/engine.js';
import { Button, Icon } from './ui.jsx';
import { VisualBuilder } from './VisualBuilder.jsx';
import { Editor } from './Editor.jsx';
import { Inspector } from './Inspector.jsx';
import { BrandIcon } from './BrandIcon.jsx';
import { QueryControls } from './QueryControls.jsx';

export function Playground() {
  const fileInput = useRef(null);
  const [tables, setTables] = useState({});
  const [work, dispatch] = useReducer(reduceSession, createSession(''));
  const [mode, setMode] = useState('code');
  const [notice, setNotice] = useState(null);
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
    <header class="playground-toolbar">
      <div class="playground-toolbar-brand"><a href="#inicio" aria-label="Álgebra a la vista, inicio"><BrandIcon className="playground-toolbar-mark"/>Álgebra a la vista<span class="text-amber-500">.</span></a><span class="playground-toolbar-divider"/><strong>Playground</strong></div>
      <nav aria-label="Secciones" class="playground-toolbar-nav"><a href="#laboratorio">Laboratorio</a></nav>
    </header>
    <main id="playground-main" tabIndex={-1} class="playground-workspace">
      <aside class="playground-tables" aria-labelledby="playground-tables-title">
        <div class="playground-sidebar-heading"><h1 id="playground-tables-title">TABLAS <span>{names.length}</span></h1><button aria-label="Importar tablas" title="Importar tablas" onClick={() => fileInput.current?.click()}><Icon name="plus" size={15}/></button></div>
        <div class="playground-table-list">{names.map(name => <div key={name} class={`playground-table-item ${work.source === name ? 'is-active' : ''}`}><button onClick={() => selectTable(name)} aria-current={work.source === name ? 'true' : undefined}><Icon name="table" size={14}/><span>{name}</span><small>{tables[name].length}</small></button><button class="playground-table-remove" aria-label={`Eliminar tabla ${name}`} title={`Eliminar ${name}`} onClick={() => remove(name)}><Icon name="close" size={13}/></button></div>)}{!names.length && <p class="playground-empty-tables">Importa CSV, JSON o un grupo TXT para comenzar.</p>}</div>
        <div class="playground-sidebar-help"><strong>Formato de archivos</strong><p>CSV o JSON: una tabla por archivo. TXT con <code>group: NOMBRE</code>: varias relaciones tipadas en un archivo.</p><p>Máximo 2 MB por archivo y 20 000 filas por tabla. Los datos viven solo en esta sesión.</p></div>
      </aside>
      <div class="playground-main-pane">
        <section class="playground-query" aria-label="Editor de consultas">
          <div class="playground-query-tabs"><div class="playground-query-title"><span class="playground-tab-active">Consulta 1</span><span class="playground-tab-name">{work.source || 'Sin tabla'}</span></div><QueryControls mode={mode} onModeChange={changeMode} onUndo={() => dispatch({ type: 'undo' })} onRedo={() => dispatch({ type: 'redo' })} undoDisabled={work.index === 0 && work.expression === work.history[0]} redoDisabled={work.index === work.history.length - 1 || stale} labels={{ visual: 'Visual', code: 'Símbolos' }} order={['code', 'visual']} className="playground-query-actions"><Button variant="primary" icon="play" disabled={!names.length} onClick={() => execute()}>Ejecutar</Button></QueryControls></div>
          {names.length ? <div class="playground-editor-body query-panel">{mode === 'code' ? <Editor expression={work.expression} tables={tables} executionError={stale ? null : parsed.error} onEdit={expression => dispatch({ type: 'edit', expression })} onExecute={() => execute()}/> : root ? <VisualBuilder key={work.source} relation={root} tables={tables} expression={work.expression} isExercise={false} onApply={expression => execute(expression, false)} onShowResult={() => execute()}/> : <div class="p-6 text-sm text-muted">{parsed.error || 'Ejecuta tu expresión para continuar.'}</div>}</div> : <div class="playground-empty-editor"><span class="math">σ π ⋈</span><h2>Tu espacio para experimentar</h2><p>Importa tus tablas para construir y ejecutar expresiones de álgebra relacional.</p><Button variant="primary" icon="plus" onClick={() => fileInput.current?.click()}>Importar archivos</Button></div>}
        </section>
        <section class="playground-results" aria-label="Resultados de la consulta"><div class="playground-results-heading"><h2>RESULTADOS</h2><span>{work.resultVisible && root ? `${root.rows.length} ${root.rows.length === 1 ? 'fila' : 'filas'}` : 'Sin ejecutar'}</span></div>{notice && <div role="status" class={`playground-notice ${notice.kind === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}<Inspector root={work.resultVisible ? root : null} stale={stale} error={work.resultVisible ? parsed.error : null}/></section>
      </div>
    </main>
  </div>;
}
