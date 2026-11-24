import { TASKS } from '../data/tasks.js';
import { Button, Icon } from './ui.jsx';
import { QueryControls } from './QueryControls.jsx';
import { VisualBuilder } from './VisualBuilder.jsx';
import { Editor } from './Editor.jsx';
import { PanelHeading, WorkspaceNotice } from './WorkspaceUI.jsx';
import { Inspector } from './Inspector.jsx';

export function ExerciseBrief({ workspace: w, onSolution, onCheck, onGuide }) {
  return <section class="exercise-brief mb-5 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
    <div class="min-w-0"><p class="eyebrow">{w.task ? `EJERCICIO ${w.location.exercise + 1} DE ${w.data.exercises.length}` : 'PRÁCTICA LIBRE'}</p><h1 class="max-w-[780px] font-display text-xl font-extrabold leading-snug tracking-tight xl:text-[26px]">{w.task ? w.task.title.replace(/^\d+\s/, '') : 'Construye una consulta'}</h1><p class="mt-2 max-w-3xl text-xs leading-relaxed text-muted">{w.task ? TASKS[w.location.dataset][w.location.exercise] : 'Elige una tabla, transforma sus datos y descubre qué ocurre en cada paso.'}</p></div>
    <div class="exercise-actions">
      <div class="exercise-help" role="group" aria-label="Ayuda">
        {w.task && <>
          <Button variant="ghost" onClick={w.hint}>Pista</Button>
          <Button variant="ghost" onClick={onSolution}>Solución</Button>
        </>}
        <Button variant="ghost" onClick={onGuide}>Guía visual</Button>
      </div>
      {w.task && <Button id="check" variant="primary" icon="check" onClick={onCheck}>Comprobar reto</Button>}
    </div>
  </section>;
}

export function LabQueryPanel({ workspace: w, mode, mobileView, editorFocusRequest, intro, onModeChange, onShowResult, onShowEditor }) {
  return <section id="query-panel" tabIndex={-1} class={`query-panel panel min-w-0 ${mobileView === 'query' ? '' : 'hidden xl:block'}`} aria-label="Constructor de consultas">
    <PanelHeading icon="code" title="Construye tu consulta"/>
    <QueryControls mode={mode} onModeChange={onModeChange} onUndo={() => w.action('undo')} onRedo={() => w.action('redo')} work={w.work} stale={w.stale}/>
    {mode === 'code' ? <Editor expression={w.work.expression} tables={w.data.relations} executionError={w.error} focusRequest={editorFocusRequest} isExercise={!!w.task} onEdit={w.edit} onExecute={onShowResult}/>
      : w.root ? <VisualBuilder key={w.location ? `${w.location.dataset}:${w.location.exercise}` : 'intro'} relation={w.root} tables={w.data.relations} expression={w.work.expression} intro={intro} isExercise={!!w.task} onApply={expression => w.execute(expression, false)} onShowResult={onShowResult}/>
      : <div class="flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center"><p class="text-xs text-muted">{w.error || 'Ejecuta tu expresión para continuar con los controles visuales.'}</p><Button onClick={onShowEditor}>Ir al editor</Button></div>}
    <div id="status" role="status" class={`flex items-center gap-2 border-t border-line px-5 py-3 text-[10px] ${w.error ? 'bg-red-50 text-red-800' : 'text-muted'}`}><span class={`size-1.5 rounded-full ${w.stale ? 'bg-amber-500' : w.error ? 'bg-red-600' : 'bg-brand'}`}/>{w.stale ? 'Cambios sin ejecutar' : w.error || (w.work.resultVisible ? `Consulta ejecutada · ${w.root?.rows.length || 0} filas` : w.task ? 'Consulta lista para comprobar o ejecutar' : 'Consulta lista para ejecutar')}</div>
  </section>;
}

export function LabResultPanel({ workspace: w, mobileView, notice }) {
  return <div id="result-panel" tabIndex={-1} class={`result-panel min-w-0 ${mobileView === 'result' ? '' : 'hidden xl:block'}`}>
    <WorkspaceNotice id="check-feedback" notice={notice}/>
    <Inspector root={w.work.resultVisible ? w.root : null} pendingText={w.task ? 'Pulsa «Ejecutar» para ver las filas o «Comprobar reto» para validar tu respuesta.' : undefined} stale={w.stale} error={w.work.resultVisible ? w.error : null} comparison={w.work.resultVisible ? w.comparison : null} explanation={w.work.resultVisible && !w.stale ? notice?.explanation : null}/>
  </div>;
}
