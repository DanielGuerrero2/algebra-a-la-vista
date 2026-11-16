import { useEffect, useState } from 'preact/hooks';
import confetti from 'canvas-confetti';
import { Button, Icon, Modal } from '../components/ui.jsx';
import { useWorkspace } from '../hooks/useWorkspace.js';
import { Sidebar } from '../components/Sidebar.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { run } from '../core/engine.js';
import { VisualGuide } from '../components/VisualGuide.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { ExerciseBrief, LabQueryPanel, LabResultPanel } from '../components/LabSections.jsx';

export function LabPage() {
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
  function showResult() { if (w.execute()) showPanel('result'); }
  function checkExercise() {
    if (w.check()) confetti({ particleCount: 110, spread: 85, startVelocity: 38, origin: { y: 0.3 }, colors: ['#16a34a', '#f97316', '#facc15', '#ec4899', '#38bdf8', '#8b5cf6'], zIndex: 60, disableForReducedMotion: true });
    showPanel('result');
  }
  function source(name) { w.action('source', { source: name }); setModal(null); }
  function loadGuideExample(expression) {
    w.edit(expression);
    setMode('code');
    setModal(null);
    setMobileView('query');
    setEditorFocusRequest(current => current + 1);
  }

  return <div class="lab-shell relative flex h-dvh min-h-0 flex-col bg-canvas">
    <a href="#workspace" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:p-4">Ir al laboratorio</a>
    <SiteHeader current="laboratorio" className="lab-header" inert={menu} beforeBrand={<Button variant="ghost" aria-label="Abrir navegación" aria-controls="lab-navigation" aria-expanded={menu} className="lg:hidden" onClick={() => setMenu(true)}><Icon name="menu"/></Button>} afterBrand={<span class="lab-header-dataset truncate text-xs font-semibold">{w.data.title}</span>}/>
    <div class="flex min-h-0 flex-1">
      <Sidebar workspace={w} open={menu} onClose={() => setMenu(false)} onInspect={name => setModal({ type: 'table', name })}/>
      <main id="workspace" tabIndex={-1} inert={menu || undefined} class="lab-workspace min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 xl:px-8 xl:py-7">
        <div class="mx-auto max-w-[1480px]">
          <ExerciseBrief workspace={w} onSolution={() => { w.solution(); setMode('code'); }} onCheck={checkExercise}/>
          <div class="guide-invitation"><div><img class="lab-guide-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-guia-laboratorio-lupa-320.png`} width="320" height="160" alt="" decoding="async"/><p><strong>¿Primera vez por aquí?</strong> Mira cómo una expresión se convierte en una tabla.</p></div><Button variant="ghost" onClick={() => setModal({ type: 'help' })}>Abrir guía visual <Icon name="arrow"/></Button></div>
          {w.notice && <div id="feedback" role="status" class={`mb-4 flex items-start gap-3 rounded-lg border p-3.5 text-xs leading-relaxed ${errorTone}`}><span class="mt-0.5 shrink-0">{w.notice.kind === 'success' ? <Icon name="check"/> : <Icon name="help"/>}</span>{w.notice.text}</div>}
          <div class="workspace-switch mb-4 flex gap-1 rounded-lg border border-line bg-white p-1 xl:hidden" role="group" aria-label="Panel visible"><button aria-pressed={mobileView === 'query'} aria-controls="query-panel" class={`flex-1 rounded-md py-2 text-xs ${mobileView === 'query' ? 'bg-brand text-white' : 'text-muted'}`} onClick={() => showPanel('query')}>01 · Consulta</button><button aria-pressed={mobileView === 'result'} aria-controls="result-panel" class={`flex-1 rounded-md py-2 text-xs ${mobileView === 'result' ? 'bg-brand text-white' : 'text-muted'}`} onClick={() => showPanel('result')}>02 · Resultado {w.work.resultVisible && w.root && <span class="ml-1 text-[10px]">({w.root.rows.length})</span>}</button></div>
          <div class="workspace-grid grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
            <LabQueryPanel workspace={w} mode={mode} mobileView={mobileView} editorFocusRequest={editorFocusRequest} onModeChange={switchMode} onShowResult={showResult} onShowEditor={() => setMode('code')}/>
            <LabResultPanel workspace={w} mobileView={mobileView}/>
          </div>
          <footer class="mt-5 flex flex-wrap items-center justify-between gap-3 pb-2 text-[10px] text-muted"><span class="flex items-center gap-1.5"><Icon name="check" size={12}/>{w.storageOk ? 'Trabajo guardado en este navegador' : 'Guardado no disponible; el trabajo se mantiene en esta sesión'}</span>{w.task && <Button variant="ghost" className="text-[10px]" onClick={w.nextExercise}>Siguiente ejercicio <Icon name="arrow" size={13}/></Button>}<p class="w-full pt-2 text-center text-[9px] text-muted/80">Semántica de conjuntos · Sin filas duplicadas · La base original no se modifica</p></footer>
        </div>
      </main>
    </div>
    {modal?.type === 'help' && <Modal title="Guía visual del laboratorio" onClose={() => setModal(null)}><VisualGuide data={w.data} dataset={w.location.dataset} onLoadExample={loadGuideExample}/></Modal>}
    {modal?.type === 'table' && <Modal title={`${modal.name} · base original`} onClose={() => setModal(null)} footer={<Button variant="primary" onClick={() => { source(modal.name); setMenu(false); }}>Usar como tabla inicial <Icon name="arrow"/></Button>}><DataTable relation={run(modal.name, w.data.relations)} compact/></Modal>}
  </div>;
}
