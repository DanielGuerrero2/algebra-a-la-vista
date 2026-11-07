import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks';
import datasets from '../data/datasets.json';
import { run } from '../core/engine.js';
import { compare } from '../core/lab-model.js';
import { createSession, reduceSession } from '../core/session.js';
import { getCheckOutcome } from '../core/completion.js';

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function validLocation(location) {
  const dataset = Number.isInteger(location?.dataset) && datasets[location.dataset] ? location.dataset : 0;
  const exercise = location?.exercise === null ? null
    : Number.isInteger(location?.exercise) && datasets[dataset].exercises[location.exercise] ? location.exercise : 0;
  return { dataset, exercise };
}
const keyFor = location => `${location.dataset}:${location.exercise ?? 'free'}`;

function load(location, drafts) {
  const data = datasets[location.dataset];
  const saved = drafts[keyFor(location)] || {};
  const initial = data.exercises[location.exercise]?.expression.match(/\b(?:Vendedor|Casa|Ventas|Clientes|Productos|Venta|Libro|Autor|Editorial)\b/)?.[0];
  const source = Object.hasOwn(data.relations, saved.source) ? saved.source : initial || Object.keys(data.relations)[0];
  return createSession(source, saved);
}

export function useWorkspace() {
  const [location, setLocation] = useState(() => validLocation(read('lab-location-v3', {})));
  const drafts = useRef(null);
  if (drafts.current === null) {
    const stored = read('lab-drafts-v2', {});
    drafts.current = stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
  }
  const [work, dispatch] = useReducer(reduceSession, null, () => load(location, drafts.current));
  const [solved, setSolved] = useState(() => {
    const saved = read('lab-progress', []);
    return Array.isArray(saved) ? [...new Set(saved.filter(id => {
      const [d, e] = String(id).split(':').map(Number);
      return datasets[d]?.exercises[e];
    }))] : [];
  });
  const [notice, setNotice] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [storageOk, setStorageOk] = useState(true);
  const data = datasets[location.dataset];
  const task = location.exercise === null ? null : data.exercises[location.exercise];
  const parsed = useMemo(() => {
    try { return { root: run(work.executed, data.relations), error: null }; }
    catch (error) { return { root: null, error: error.message }; }
  }, [work.executed, data]);
  const stale = work.expression !== work.executed;

  function persist(currentLocation = location, session = work) {
    drafts.current[keyFor(currentLocation)] = {
      source: session.source, expression: session.expression, history: session.history,
      historyIndex: session.index, assisted: session.assisted,
    };
    try {
      localStorage.setItem('lab-drafts-v2', JSON.stringify(drafts.current));
      localStorage.setItem('lab-location-v3', JSON.stringify(currentLocation));
      setStorageOk(true);
    } catch { setStorageOk(false); }
  }
  useEffect(() => { persist(); }, [work, location]);

  function navigate(dataset, exercise) {
    persist();
    const next = validLocation({ dataset, exercise });
    dispatch({ type: 'load', session: load(next, drafts.current) });
    setLocation(next);
    setNotice(null);
    setComparison(null);
  }
  function execute(expression = work.expression, showResult = true) {
    try {
      run(expression, data.relations);
      dispatch({ type: 'execute', expression, valid: true, showResult });
      setNotice(null); setComparison(null);
      return true;
    } catch (error) {
      dispatch({ type: 'execute', expression, valid: false, showResult });
      setNotice({ kind: 'error', text: error.message }); setComparison(null);
      return false;
    }
  }
  function edit(expression) {
    dispatch({ type: 'edit', expression });
    setNotice(null); setComparison(null);
  }
  function check() {
    if (!task || !execute()) return false;
    const result = compare(run(work.expression, data.relations), run(task.expression, data.relations));
    const { celebrate, completed, explanation } = getCheckOutcome(result.correct, solved, keyFor(location));
    if (result.correct) {
      setNotice({ kind: 'success', text: '¡Correcto! Tus filas y columnas coinciden con el objetivo.', explanation });
      if (completed) {
        const next = [...new Set([...solved, keyFor(location)])];
        setSolved(next);
        try { localStorage.setItem('lab-progress', JSON.stringify(next)); } catch { setStorageOk(false); }
      }
    } else {
      const columns = result.missingColumns.length || result.extraColumns.length;
      setNotice({ kind: 'warning', text: columns
        ? `Revisa las columnas. Faltan: ${result.missingColumns.join(', ') || 'ninguna'}. Sobran: ${result.extraColumns.join(', ') || 'ninguna'}.`
        : `Todavía no coincide: faltan ${result.missing.length} filas y sobran ${result.extra.length}.` });
      setComparison(run(task.expression, data.relations));
    }
    return celebrate;
  }
  function hint() { setNotice({ kind: 'info', text: task.description }); }
  function solution() {
    dispatch({ type: 'solution', expression: task.expression });
    setComparison(null);
    setNotice({ kind: 'info', text: 'Solución de referencia. Recorre sus pasos para entenderla; Reiniciar te permite resolverla por tu cuenta.' });
  }
  function action(type, extra = {}) {
    dispatch({ type, ...extra }); setNotice(null); setComparison(null);
  }
  return {
    datasets, data, location, task, work, solved, notice, comparison, storageOk, stale,
    root: stale ? null : parsed.root, error: stale ? null : parsed.error,
    navigate, execute, edit, check, hint, solution, action,
    nextExercise: () => location.exercise + 1 < data.exercises.length
      ? navigate(location.dataset, location.exercise + 1) : navigate((location.dataset + 1) % datasets.length, 0),
  };
}
