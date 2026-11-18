import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, reduceSession } from '../src/core/session.js';
import { loadPlayground, savePlayground, PLAYGROUND_KEY } from '../src/core/playground-storage.js';
import { createPlaygroundTabs, reducePlaygroundTabs } from '../src/core/playground-tabs.js';
import { createPlaygroundProjects, reducePlaygroundProjects } from '../src/core/playground-projects.js';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('restaura tablas, selección, consulta, historial, modo y resultado recalculable', () => {
  const storage = memoryStorage();
  let work = reduceSession(createSession('Personas'), { type: 'execute', expression: 'π nombre (Personas)', valid: true });
  work = reduceSession(work, { type: 'edit', expression: 'π id (Personas)' });
  const state = { tables: { Personas: [{ id: 1, nombre: 'Ana' }] }, work, mode: 'visual' };
  assert.equal(savePlayground(storage, state), null);
  const restored = loadPlayground(storage);
  assert.deepEqual(restored.tables, state.tables);
  assert.equal(restored.work.source, 'Personas');
  assert.equal(restored.work.expression, 'π id (Personas)');
  assert.equal(restored.work.executed, 'π nombre (Personas)');
  assert.deepEqual(restored.work.history, work.history);
  assert.equal(restored.work.index, work.index);
  assert.equal(restored.mode, 'visual');
  assert.equal(restored.warning, null);
});

test('eliminar una tabla actualiza el guardado', () => {
  const storage = memoryStorage();
  const work = createSession('Personas');
  savePlayground(storage, { tables: { Personas: [{ id: 1 }], Otras: [{ id: 2 }] }, work, mode: 'code' });
  savePlayground(storage, { tables: { Personas: [{ id: 1 }] }, work, mode: 'code' });
  assert.deepEqual(Object.keys(loadPlayground(storage).tables), ['Personas']);
});

test('un guardado dañado se ignora con aviso', () => {
  const storage = memoryStorage();
  storage.setItem(PLAYGROUND_KEY, '{roto');
  const restored = loadPlayground(storage);
  assert.deepEqual(restored.tables, {});
  assert.match(restored.warning, /dañado/);
});

test('el límite y un fallo de escritura conservan el último guardado', () => {
  const storage = memoryStorage();
  const state = { tables: { Personas: [{ id: 1 }] }, work: createSession('Personas'), mode: 'code' };
  savePlayground(storage, state);
  const previous = storage.getItem(PLAYGROUND_KEY);
  assert.equal(savePlayground(storage, { ...state, work: { ...state.work, expression: 'x'.repeat(2 * 1024 * 1024) } }), 'limit');
  assert.equal(storage.getItem(PLAYGROUND_KEY), previous);
  assert.equal(savePlayground({ setItem() { throw Error('quota'); } }, state), 'storage');
  assert.equal(storage.getItem(PLAYGROUND_KEY), previous);
});

test('restaura varias consultas y la pestaña activa', () => {
  const storage = memoryStorage();
  let queries = createPlaygroundTabs(createSession('Personas'));
  queries = reducePlaygroundTabs(queries, { type: 'new', source: 'Personas' });
  queries = reducePlaygroundTabs(queries, { type: 'session', action: { type: 'edit', expression: 'π id (Personas)' } });
  savePlayground(storage, { tables: { Personas: [{ id: 1 }] }, queries, mode: 'code' });
  const restored = loadPlayground(storage);
  assert.equal(restored.queries.tabs.length, 2);
  assert.equal(restored.queries.activeId, 2);
  assert.equal(restored.queries.tabs[1].work.expression, 'π id (Personas)');
  assert.equal(restored.warning, null);
});

test('migra el guardado anterior de una sola consulta', () => {
  const storage = memoryStorage();
  const work = createSession('Personas');
  storage.setItem(PLAYGROUND_KEY, JSON.stringify({ version: 1, tables: { Personas: [{ id: 1 }] }, work, mode: 'code' }));
  const restored = loadPlayground(storage);
  assert.equal(restored.queries.tabs.length, 1);
  assert.equal(restored.queries.tabs[0].work.source, 'Personas');
  assert.equal(restored.warning, null);
});

test('restaura proyectos separados y el proyecto activo', () => {
  const storage = memoryStorage();
  let projects = createPlaygroundProjects();
  projects = reducePlaygroundProjects(projects, { type: 'tables', tables: { Personas: [{ id: 1 }] } });
  projects = reducePlaygroundProjects(projects, { type: 'new', name: 'Trabajo final' });
  projects = reducePlaygroundProjects(projects, { type: 'tables', tables: { Personas: [{ id: 2 }] } });
  assert.equal(savePlayground(storage, { projects }), null);
  const restored = loadPlayground(storage);
  assert.equal(restored.projects.activeId, 2);
  assert.equal(restored.projects.projects[1].name, 'Trabajo final');
  assert.deepEqual(restored.projects.projects[0].tables.Personas, [{ id: 1 }]);
  assert.deepEqual(restored.projects.projects[1].tables.Personas, [{ id: 2 }]);
});

test('migra un guardado con pestañas al proyecto inicial', () => {
  const storage = memoryStorage();
  const queries = createPlaygroundTabs(createSession('Personas'));
  storage.setItem(PLAYGROUND_KEY, JSON.stringify({ version: 2, tables: { Personas: [{ id: 1 }] }, queries, mode: 'code' }));
  const restored = loadPlayground(storage);
  assert.equal(restored.projects.projects.length, 1);
  assert.equal(restored.projects.projects[0].queries.tabs[0].work.source, 'Personas');
});
