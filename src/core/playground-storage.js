import { parseTableFile } from './playground-import.js';
import { createSession } from './session.js';

export const PLAYGROUND_KEY = 'playground-work-v1';
export const PLAYGROUND_LIMIT = 2 * 1024 * 1024;
const empty = () => ({ tables: {}, work: createSession(''), mode: 'code', warning: null });

export function loadPlayground(storage) {
  let raw;
  try { raw = storage.getItem(PLAYGROUND_KEY); }
  catch { return { ...empty(), warning: 'No se pudo leer el trabajo guardado.' }; }
  if (raw === null) return empty();
  try {
    if (new Blob([raw]).size > PLAYGROUND_LIMIT) throw Error();
    const saved = JSON.parse(raw);
    if (saved?.version !== 1 || !saved.tables || typeof saved.tables !== 'object' || Array.isArray(saved.tables)) throw Error();
    const tables = {};
    for (const [name, rows] of Object.entries(saved.tables)) {
      tables[name] = parseTableFile(`${name}.json`, JSON.stringify(rows)).rows;
    }
    const session = saved.work;
    const names = Object.keys(tables);
    if (!session || typeof session !== 'object' || typeof session.source !== 'string' ||
      session.source !== '' && !Object.hasOwn(tables, session.source) ||
      names.length && !session.source || !names.length && session.source ||
      typeof session.expression !== 'string' || typeof session.executed !== 'string' ||
      !Array.isArray(session.history) || !session.history.length || session.history.length > 50 ||
      session.history.some(item => typeof item !== 'string') ||
      !Number.isInteger(session.index) || session.index < 0 || session.index >= session.history.length ||
      typeof session.resultVisible !== 'boolean' ||
      !['code', 'visual'].includes(saved.mode)) throw Error();
    const work = createSession(session.source, { expression: session.expression, history: session.history, historyIndex: session.index });
    work.executed = session.executed;
    work.resultVisible = session.resultVisible;
    return { tables, work, mode: saved.mode, warning: null };
  } catch {
    return { ...empty(), warning: 'El trabajo guardado está dañado y no se pudo restaurar.' };
  }
}

export function savePlayground(storage, { tables, work, mode }) {
  const serialized = JSON.stringify({ version: 1, tables, work: {
    source: work.source, expression: work.expression, executed: work.executed,
    history: work.history, index: work.index, resultVisible: work.resultVisible,
  }, mode });
  if (new Blob([serialized]).size > PLAYGROUND_LIMIT) return 'limit';
  try { storage.setItem(PLAYGROUND_KEY, serialized); return null; }
  catch { return 'storage'; }
}
