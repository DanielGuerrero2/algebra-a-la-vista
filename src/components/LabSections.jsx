import { TASKS } from '../data/tasks.js';
import { Button, Icon } from './ui.jsx';
import { QueryControls } from './QueryControls.jsx';
import { VisualBuilder } from './VisualBuilder.jsx';
import { Editor } from './Editor.jsx';
import { Inspector } from './Inspector.jsx';

export function ExerciseBrief({ workspace: w, onSolution, onCheck }) {
  return <section class="exercise-brief mb-5 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
    <div class="min-w-0"><p class="eyebrow">{w.task ? `EJERCICIO ${w.location.exercise + 1} DE ${w.data.exercises.length}` : 'PRÁCTICA LIBRE'} <span class="mx-1 text-brand/30">—</span> APRENDE HACIENDO</p><h1 class="max-w-[780px] font-display text-xl font-extrabold leading-snug tracking-tight xl:text-[26px]">{w.task ? w.task.title.replace(/^\d+\s/, '') : 'Cada operación cuenta una historia.'}</h1><p class="mt-2 max-w-3xl text-xs leading-relaxed text-muted">{w.task ? TASKS[w.location.dataset][w.location.exercise] : 'Elige una tabla, transforma sus datos y descubre qué ocurre en cada paso.'}</p></div>
    {w.task && <div class="flex shrink-0 items-center gap-1 sm:w-auto sm:flex-wrap sm:justify-end"><Button variant="ghost" className="!min-h-8 text-[11px]" onClick={w.hint}>Pista</Button><Button variant="ghost" className="!min-h-8 text-[11px]" onClick={onSolution}>Solución</Button><Button id="check" variant="primary" icon="check" className="ml-auto text-xs sm:ml-0 sm:justify-center" onClick={onCheck}>Comprobar</Button></div>}
  </section>;
}

export function LabQueryPanel({ workspace: w, mode, mobileView, editorFocusRequest, onModeChange, onShowResult, onShowEditor }) {
  const undoDisabled = w.work.index === 0 && w.work.expression === w.work.history[0];
  const redoDisabled = w.work.index === w.work.history.length - 1 || w.stale;
  return <section id="query-panel" tabIndex={-1} class={`query-panel panel min-w-0 ${mobileView === 'query' ? '' : 'hidden xl:block'}`} aria-label="Constructor de consultas">
    <div class="panel-heading"><span class="panel-number">01</span><div><p class="eyebrow">TU CONSULTA</p><h2>Construye paso a paso</h2></div><span class="math panel-glyph" aria-hidden="true">σ π ⋈</span></div>
    <QueryControls mode={mode} onModeChange={onModeChange} onUndo={() => w.action('undo')} onRedo={() => w.action('redo')} undoDisabled={undoDisabled} redoDisabled={redoDisabled} labels={{ visual: 'Constructor visual', code: 'Editor de símbolos' }} className="lab-query-controls flex min-h-16 flex-wrap items-center justify-between gap-2 border-b border-line p-3.5" selectorClassName="inline-flex rounded-lg bg-canvas p-1" tabClassName={id => `rounded-md px-2.5 py-2 text-[10px] font-semibold ${mode === id ? 'bg-white text-brand shadow-sm' : 'text-muted hover:text-accent-foreground'}`} historyClassName="flex gap-1" buttonClassName="!min-h-7 !px-1.5"/>
    {mode === 'code' ? <Editor expression={w.work.expression} tables={w.data.relations} executionError={w.error} focusRequest={editorFocusRequest} onEdit={w.edit} onExecute={onShowResult}/>
      : w.root ? <VisualBuilder key={`${w.location.dataset}:${w.location.exercise}`} relation={w.root} tables={w.data.relations} expression={w.work.expression} isExercise={!!w.task} onApply={expression => w.execute(expression, false)} onShowResult={onShowResult}/>
      : <div class="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p class="text-xs text-muted">{w.error || 'Ejecuta tu expresión para continuar con los controles visuales.'}</p><Button onClick={onShowEditor}>Ir al editor</Button></div>}
    <div id="status" role="status" class={`flex items-center gap-2 border-t border-line px-5 py-3 text-[10px] ${w.error ? 'bg-red-50 text-red-800' : 'text-muted'}`}><span class={`size-1.5 rounded-full ${w.stale ? 'bg-amber-500' : w.error ? 'bg-red-600' : 'bg-brand'}`}/>{w.stale ? 'Cambios sin ejecutar' : w.error || (w.work.resultVisible ? `Consulta ejecutada · ${w.root?.rows.length || 0} filas` : w.task ? 'Consulta lista para comprobar o ejecutar' : 'Consulta lista para ejecutar')}</div>
  </section>;
}

export function LabResultPanel({ workspace: w, mobileView }) {
  return <div id="result-panel" tabIndex={-1} class={`result-panel min-w-0 ${mobileView === 'result' ? '' : 'hidden xl:block'}`}><Inspector root={w.work.resultVisible ? w.root : null} stale={w.stale} error={w.work.resultVisible ? w.error : null} comparison={w.work.resultVisible ? w.comparison : null} explanation={w.work.resultVisible && !w.stale && w.notice?.kind === 'success' ? w.notice.explanation : null}/></div>;
}
