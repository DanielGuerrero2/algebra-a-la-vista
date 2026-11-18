import { parseTableFile } from './playground-import.js';
import { createSession } from './session.js';
import { createPlaygroundTabs } from './playground-tabs.js';
import { createPlaygroundProjects } from './playground-projects.js';

export const PLAYGROUND_KEY = 'playground-work-v1';
export const PLAYGROUND_LIMIT = 2 * 1024 * 1024;
const empty = () => {
  const work = createSession('');
  const queries = createPlaygroundTabs(work);
  return { tables: {}, work, queries, mode: 'code', projects: createPlaygroundProjects({}, queries), warning: null };
};

function restoreTables(saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw Error();
  const tables = {};
  for (const [name, rows] of Object.entries(saved)) {
    tables[name] = parseTableFile(`${name}.json`, JSON.stringify(rows)).rows;
  }
  return tables;
}

function restoreWork(session, tables) {
  const names = Object.keys(tables);
  if (!session || typeof session !== 'object' || typeof session.source !== 'string' ||
    session.source !== '' && !Object.hasOwn(tables, session.source) ||
    !names.length && session.source ||
    typeof session.expression !== 'string' || typeof session.executed !== 'string' ||
    !Array.isArray(session.history) || !session.history.length || session.history.length > 50 ||
    session.history.some(item => typeof item !== 'string') ||
    !Number.isInteger(session.index) || session.index < 0 || session.index >= session.history.length ||
    typeof session.resultVisible !== 'boolean') throw Error();
  const work = createSession(session.source, { expression: session.expression, history: session.history, historyIndex: session.index });
  work.executed = session.executed;
  work.resultVisible = session.resultVisible;
  return work;
}

function saveWork(work) {
  return { source: work.source, expression: work.expression, executed: work.executed,
    history: work.history, index: work.index, resultVisible: work.resultVisible };
}

function restoreQueries(stored, tables) {
  if (!stored || !Array.isArray(stored.tabs) || !stored.tabs.length ||
    !Number.isInteger(stored.activeId) || !Number.isInteger(stored.nextId) ||
    stored.nextId < 2 || stored.tabs.some(tab => !Number.isInteger(tab.id) || tab.id < 1 || tab.id >= stored.nextId) ||
    new Set(stored.tabs.map(tab => tab.id)).size !== stored.tabs.length ||
    !stored.tabs.some(tab => tab.id === stored.activeId)) throw Error();
  return { activeId: stored.activeId, nextId: stored.nextId,
    tabs: stored.tabs.map(tab => ({ id: tab.id, work: restoreWork(tab.work, tables) })) };
}

function saveQueries(state) {
  return { activeId: state.activeId, nextId: state.nextId,
    tabs: state.tabs.map(tab => ({ id: tab.id, work: saveWork(tab.work) })) };
}

export function loadPlayground(storage) {
  let raw;
  try { raw = storage.getItem(PLAYGROUND_KEY); }
  catch { return { ...empty(), warning: 'No se pudo leer el trabajo guardado.' }; }
  if (raw === null) return empty();
  try {
    if (new Blob([raw]).size > PLAYGROUND_LIMIT) throw Error();
    const saved = JSON.parse(raw);
    if (![1, 2, 3].includes(saved?.version)) throw Error();
    let projects;
    if (saved.version === 3) {
      const stored = saved.projects;
      if (!stored || !Array.isArray(stored.projects) || !stored.projects.length ||
        !Number.isInteger(stored.activeId) || !Number.isInteger(stored.nextId) || stored.nextId < 2 ||
        stored.projects.some(project => !Number.isInteger(project.id) || project.id < 1 || project.id >= stored.nextId ||
          typeof project.name !== 'string' || !project.name.trim() || !['code', 'visual'].includes(project.mode)) ||
        new Set(stored.projects.map(project => project.id)).size !== stored.projects.length ||
        !stored.projects.some(project => project.id === stored.activeId)) throw Error();
      projects = { activeId: stored.activeId, nextId: stored.nextId, projects: stored.projects.map(project => {
        const tables = restoreTables(project.tables);
        return { id: project.id, name: project.name, tables, queries: restoreQueries(project.queries, tables), mode: project.mode };
      }) };
    } else {
      const tables = restoreTables(saved.tables);
      if (!['code', 'visual'].includes(saved.mode)) throw Error();
      const queries = saved.version === 1 ? createPlaygroundTabs(restoreWork(saved.work, tables)) : restoreQueries(saved.queries, tables);
      projects = createPlaygroundProjects(tables, queries, saved.mode);
    }
    const active = projects.projects.find(project => project.id === projects.activeId);
    return { projects, tables: active.tables, queries: active.queries,
      work: active.queries.tabs.find(tab => tab.id === active.queries.activeId).work,
      mode: active.mode, warning: null };
  } catch {
    return { ...empty(), warning: 'El trabajo guardado está dañado y no se pudo restaurar.' };
  }
}

export function savePlayground(storage, { tables, work, queries, mode, projects }) {
  const state = projects || createPlaygroundProjects(tables, queries || createPlaygroundTabs(work), mode);
  const serialized = JSON.stringify({ version: 3, projects: {
    activeId: state.activeId, nextId: state.nextId,
    projects: state.projects.map(project => ({ id: project.id, name: project.name,
      tables: project.tables, queries: saveQueries(project.queries), mode: project.mode })),
  } });
  if (new Blob([serialized]).size > PLAYGROUND_LIMIT) return 'limit';
  try { storage.setItem(PLAYGROUND_KEY, serialized); return null; }
  catch { return 'storage'; }
}
