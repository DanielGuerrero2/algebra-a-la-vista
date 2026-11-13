import { useEffect, useState } from 'preact/hooks';
import confetti from 'canvas-confetti';
import { TASKS } from './data/tasks.js';
import { Button, Icon, Modal } from './components/ui.jsx';
import { useWorkspace } from './hooks/useWorkspace.js';
import { Sidebar } from './components/Sidebar.jsx';
import { DataTable } from './components/DataTable.jsx';
import { run } from './core/engine.js';
import { VisualBuilder } from './components/VisualBuilder.jsx';
import { Editor } from './components/Editor.jsx';
import { Inspector } from './components/Inspector.jsx';
import { VisualGuide } from './components/VisualGuide.jsx';

export default function App() {
  const w = useWorkspace();
  const [mode, setMode] = useState('visual');
  const [mobileView, setMobileView] = useState('query');
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [editorFocusRequest, setEditorFocusRequest] = useState(0);
  useEffect(() => setMobileView('query'), [w.location]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeDrawer = () => { if (desktop.matches) setMenu(false); };
    desktop.addEventListener('change', closeDrawer);
    return () => desktop.removeEventListener('change', closeDrawer);
  }, []);
  const undoDisabled = w.work.index === 0 && w.work.expression === w.work.history[0];
  const redoDisabled = w.work.index === w.work.history.length - 1 || w.stale;
  const errorTone = w.notice?.kind === 'error' ? 'border-red-200 bg-red-50 text-red-900' : w.notice?.kind === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-brand/15 bg-soft text-brand';
  function switchMode(next) {
    if (next === 'visual' && w.stale && !w.execute(undefined, false)) return;
    setMode(next);
  }
  function showPanel(next) {
    setMobileView(next);
    if (window.matchMedia('(min-width: 1280px)').matches) return;
    requestAnimationFrame(() => {
      const panel = document.getElementById(next === 'query' ? 'query-panel' : 'result-panel');
      panel?.scrollIntoView({ block: 'start' });
      panel?.focus({ preventScroll: true });
    });
  }
  function apply(expression) { w.execute(expression, false); }
  function source(name) { w.action('source', { source: name }); setModal(null); }
  function loadGuideExample(expression) {
    w.edit(expression);
    setMode('code');
    setModal(null);
    setMobileView('query');
    setEditorFocusRequest(current => current + 1);
  }

  return <div class="lab-shell relative flex h-dvh min-h-0 bg-canvas">
    <a href="#workspace" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4">Ir al laboratorio</a>
    <Sidebar workspace={w} open={menu} onClose={() => setMenu(false)} onInspect={name => setModal({ type: 'table', name })}/>
    <div class="flex min-w-0 flex-1 flex-col">
      <header inert={menu || undefined} class="lab-header flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-6 xl:px-8">

        <div class="ml-auto flex min-w-0 items-center gap-3"><Button variant="ghost" aria-label="Abrir navegación" aria-controls="lab-navigation" aria-expanded={menu} className="lg:hidden" onClick={() => setMenu(true)}><Icon name="menu"/></Button><span class="hidden text-xs text-muted sm:block">Laboratorio</span><span class="hidden text-line sm:block">/</span><span class="truncate text-xs font-semibold">{w.data.title}</span><span class="hidden rounded-full border border-brand/15 bg-soft px-2 py-0.5 text-[9px] text-brand xl:block">Álgebra relacional</span></div>
      </header>
      <main id="workspace" tabIndex={-1} inert={menu || undefined} class="lab-workspace min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 xl:px-8 xl:py-7">
        <div class="mx-auto max-w-[1480px]">
          <section class="exercise-brief mb-5 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div class="min-w-0"><p class="eyebrow">{w.task ? `EJERCICIO ${w.location.exercise + 1} DE ${w.data.exercises.length}` : 'PRÁCTICA LIBRE'} <span class="mx-1 text-brand/30">—</span> APRENDE HACIENDO</p><h1 class="max-w-[780px] font-display text-xl font-extrabold leading-snug tracking-tight xl:text-[26px]">{w.task ? w.task.title.replace(/^\d+\s/, '') : 'Cada operación cuenta una historia.'}</h1><p class="mt-2 max-w-3xl text-xs leading-relaxed text-muted">{w.task ? TASKS[w.location.dataset][w.location.exercise] : 'Elige una tabla, transforma sus datos y descubre qué ocurre en cada paso.'}</p></div>
            {w.task && <div class="flex shrink-0 items-center gap-1 sm:w-auto sm:flex-wrap sm:justify-end"><Button variant="ghost" className="!min-h-8 text-[11px]" onClick={w.hint}>Pista</Button><Button variant="ghost" className="!min-h-8 text-[11px]" onClick={() => { w.solution(); setMode('code'); }}>Solución</Button><Button id="check" variant="primary" icon="check" className="ml-auto text-xs sm:ml-0 sm:justify-center" onClick={() => { if (w.check()) confetti({ particleCount: 110, spread: 85, startVelocity: 38, origin: { y: 0.3 }, colors: ['#16a34a', '#f97316', '#facc15', '#ec4899', '#38bdf8', '#8b5cf6'], zIndex: 60, disableForReducedMotion: true }); showPanel('result'); }}>Comprobar</Button></div>}
          </section>
          <div class="guide-invitation"><div><img class="lab-guide-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-guia-laboratorio-lupa-320.png`} width="320" height="160" alt="" decoding="async"/><p><strong>¿Primera vez por aquí?</strong> Mira cómo una expresión se convierte en una tabla.</p></div><Button variant="ghost" onClick={() => setModal({ type: 'help' })}>Abrir guía visual <Icon name="arrow"/></Button></div>
          {w.notice && <div id="feedback" role="status" class={`mb-4 flex items-start gap-3 rounded-lg border p-3.5 text-xs leading-relaxed ${errorTone}`}><span class="mt-0.5 shrink-0">{w.notice.kind === 'success' ? <Icon name="check"/> : <Icon name="help"/>}</span>{w.notice.text}</div>}
          <div class="workspace-switch mb-4 flex gap-1 rounded-lg border border-line bg-white p-1 xl:hidden" role="group" aria-label="Panel visible"><button aria-pressed={mobileView === 'query'} aria-controls="query-panel" class={`flex-1 rounded-md py-2 text-xs ${mobileView === 'query' ? 'bg-brand text-white' : 'text-muted'}`} onClick={() => showPanel('query')}>01 · Consulta</button><button aria-pressed={mobileView === 'result'} aria-controls="result-panel" class={`flex-1 rounded-md py-2 text-xs ${mobileView === 'result' ? 'bg-brand text-white' : 'text-muted'}`} onClick={() => showPanel('result')}>02 · Resultado {w.work.resultVisible && w.root && <span class="ml-1 text-[10px]">({w.root.rows.length})</span>}</button></div>
          <div class="workspace-grid grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
            <section id="query-panel" tabIndex={-1} class={`query-panel panel min-w-0 ${mobileView === 'query' ? '' : 'hidden xl:block'}`} aria-label="Constructor de consultas">
              <div class="panel-heading"><span class="panel-number">01</span><div><p class="eyebrow">TU CONSULTA</p><h2>Construye paso a paso</h2></div><span class="math panel-glyph" aria-hidden="true">σ π ⋈</span></div>
              <div class="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-line p-3.5"><div class="inline-flex rounded-lg bg-canvas p-1" aria-label="Modo de consulta">{[['visual', 'Constructor visual'], ['code', 'Editor de símbolos']].map(([id, label]) => <button key={id} id={id === 'visual' ? 'visualTab' : 'codeTab'} aria-pressed={mode === id} onClick={() => switchMode(id)} class={`rounded-md px-2.5 py-2 text-[10px] font-semibold ${mode === id ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-accent-foreground'}`}>{label}</button>)}</div><div class="flex gap-1"><Button variant="ghost" aria-label="Deshacer operación" disabled={undoDisabled} className="!min-h-7 !px-1.5" onClick={() => w.action('undo')}><Icon name="undo" size={15}/></Button><Button variant="ghost" aria-label="Rehacer operación" disabled={redoDisabled} className="!min-h-7 !px-1.5" onClick={() => w.action('redo')}><Icon name="redo" size={15}/></Button></div></div>
              {mode === 'code' ? <Editor expression={w.work.expression} tables={w.data.relations} executionError={w.error} focusRequest={editorFocusRequest} onEdit={w.edit} onExecute={() => { if (w.execute()) showPanel('result'); }}/>
                : w.root ? <VisualBuilder key={`${w.location.dataset}:${w.location.exercise}`} relation={w.root} tables={w.data.relations} expression={w.work.expression} isExercise={!!w.task} onApply={apply} onShowResult={() => { if (w.execute()) showPanel('result'); }}/>
                : <div class="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p class="text-xs text-muted">{w.error || 'Ejecuta tu expresión para continuar con los controles visuales.'}</p><Button onClick={() => setMode('code')}>Ir al editor</Button></div>}
              <div id="status" role="status" class={`flex items-center gap-2 border-t border-line px-5 py-3 text-[10px] ${w.error ? 'bg-red-50 text-red-800' : 'text-muted'}`}><span class={`size-1.5 rounded-full ${w.stale ? 'bg-amber-500' : w.error ? 'bg-red-600' : 'bg-brand'}`}/>{w.stale ? 'Cambios sin ejecutar' : w.error || (w.work.resultVisible ? `Consulta ejecutada · ${w.root?.rows.length || 0} filas` : w.task ? 'Consulta lista para comprobar o ejecutar' : 'Consulta lista para ejecutar')}</div>
            </section>
            <div id="result-panel" tabIndex={-1} class={`result-panel min-w-0 ${mobileView === 'result' ? '' : 'hidden xl:block'}`}><Inspector root={w.work.resultVisible ? w.root : null} stale={w.stale} error={w.work.resultVisible ? w.error : null} comparison={w.work.resultVisible ? w.comparison : null} explanation={w.work.resultVisible && !w.stale && w.notice?.kind === 'success' ? w.notice.explanation : null}/></div>
          </div>
          <footer class="mt-5 flex flex-wrap items-center justify-between gap-3 pb-2 text-[10px] text-muted"><span class="flex items-center gap-1.5"><Icon name="check" size={12}/>{w.storageOk ? 'Trabajo guardado en este navegador' : 'Guardado no disponible; el trabajo se mantiene en esta sesión'}</span>{w.task && <Button variant="ghost" className="text-[10px]" onClick={w.nextExercise}>Siguiente ejercicio <Icon name="arrow" size={13}/></Button>}<p class="w-full pt-2 text-center text-[9px] text-muted/80">Semántica de conjuntos · Sin filas duplicadas · La base original no se modifica</p></footer>
        </div>
      </main>
    </div>
    {modal?.type === 'help' && <Modal title="Guía visual del laboratorio" onClose={() => setModal(null)}><VisualGuide data={w.data} dataset={w.location.dataset} onLoadExample={loadGuideExample}/></Modal>}
    {modal?.type === 'table' && <Modal title={`${modal.name} · base original`} onClose={() => setModal(null)} footer={<Button variant="primary" onClick={() => { source(modal.name); setMenu(false); }}>Usar como tabla inicial <Icon name="arrow"/></Button>}><DataTable relation={run(modal.name, w.data.relations)} compact/></Modal>}
  </div>;
}
