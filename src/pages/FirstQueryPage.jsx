import { useMemo, useReducer, useState } from 'preact/hooks';
import datasets from '../data/datasets.json';
import { GUIDE_EXAMPLES } from '../data/guide.js';
import { run } from '../core/engine.js';
import { compare } from '../core/lab-model.js';
import { createSession, reduceSession } from '../core/session.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { LabQueryPanel } from '../components/LabSections.jsx';
import { Inspector } from '../components/Inspector.jsx';

const data = datasets[0];
const [source, filter] = GUIDE_EXAMPLES[0].steps;
const expected = run(filter.expression, data.relations);

export function FirstQueryPage() {
  const [work, dispatch] = useReducer(reduceSession, source.expression, createSession);
  const [mode, setMode] = useState('visual');
  const stale = work.expression !== work.executed;
  const { root, error } = useMemo(() => {
    try { return { root: run(work.executed, data.relations), error: null }; }
    catch (error) { return { root: null, error: error.message }; }
  }, [work.executed]);
  const correct = work.resultVisible && !stale && root && compare(root, expected).correct;

  function execute(expression = work.expression, showResult = true) {
    let valid = true;
    try { run(expression, data.relations); }
    catch { valid = false; }
    dispatch({ type: 'execute', expression, valid, showResult });
    if (showResult && valid) requestAnimationFrame(() => document.getElementById('first-query-result')?.focus());
    return valid;
  }

  function switchMode(next) {
    if (next === 'visual' && (stale || error) && !execute(work.expression, false)) return;
    setMode(next);
  }

  const workspace = { data, work, root, error, stale, execute, action: type => dispatch({ type }), edit: expression => dispatch({ type: 'edit', expression }) };
  return <div class="min-h-dvh bg-canvas">
    <SiteHeader mainId="first-query-main" className="workspace-header"/>
    <main id="first-query-main" tabIndex={-1} class="mx-auto max-w-[1480px] px-3 py-3 sm:px-6 sm:py-6 xl:px-8">
      <header class="mb-4 rounded-xl border border-line bg-white p-3 sm:mb-5 sm:p-6">
        <p class="eyebrow text-brand">Tu primera consulta · Inmobiliaria</p>
        <h1 class="mt-2 font-display text-xl font-extrabold leading-tight text-ink sm:text-3xl">Encuentra las casas que cuestan más de un millón</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted">La tabla <strong>Casa</strong> ya está cargada. Vas a conservar todas sus columnas y quedarte con las filas que cumplen el filtro.</p>
        <ol class="mt-4 list-decimal space-y-1 pl-5 text-sm text-ink">
          <li>En <strong>Filtrar filas</strong>, elige <code>precio</code>, <code>&gt;</code> y escribe <code>1000000</code>.</li>
          <li>Pulsa <strong>Añadir paso</strong> para incorporar el filtro.</li>
          <li>Pulsa <strong>Ejecutar y ver resultado</strong> para ver qué casas encontraste.</li>
        </ol>
        <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-brand"><a class="underline" href="#guia">Volver a la guía visual</a><a class="underline" href="#laboratorio">Ir a los retos del laboratorio</a></div>
      </header>
      <div class="grid items-start gap-4 lg:grid-cols-2 xl:gap-5">
        <LabQueryPanel workspace={workspace} mode={mode} mobileView="query" intro onModeChange={switchMode} onShowResult={() => execute()} onShowEditor={() => setMode('code')}/>
        <div id="first-query-result" tabIndex={-1} class="min-w-0">
          <div role="status">{work.resultVisible && root && <p class="mb-3 rounded-lg border border-line bg-soft p-4 text-sm text-ink">{correct ? '¡Lo lograste! Encontraste las tres casas que cuestan más de un millón.' : 'Compara las filas con el objetivo. Si falta el filtro, revisa la condición y recuerda añadir el paso antes de ejecutar.'}</p>}</div>
          <Inspector root={work.resultVisible ? root : null} stale={stale} error={work.resultVisible ? error : null} pendingText="Añade el filtro y ejecuta la consulta para ver las casas que cumplen la condición."/>
        </div>
      </div>
    </main>
  </div>;
}
