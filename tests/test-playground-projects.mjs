import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaygroundProjects, reducePlaygroundProjects } from '../src/core/playground-projects.js';

test('los proyectos separan tablas, consultas y modo', () => {
  let state = createPlaygroundProjects();
  state = reducePlaygroundProjects(state, { type: 'tables', tables: { Personas: [{ id: 1 }] } });
  state = reducePlaygroundProjects(state, { type: 'query', action: { type: 'session', action: { type: 'edit', expression: 'π id (Personas)' } } });
  state = reducePlaygroundProjects(state, { type: 'new', name: 'Segundo' });
  assert.deepEqual(state.projects[1].tables, {});
  assert.equal(state.projects[1].queries.tabs[0].work.expression, '');
  state = reducePlaygroundProjects(state, { type: 'tables', tables: { Personas: [{ id: 2 }] } });
  state = reducePlaygroundProjects(state, { type: 'mode', mode: 'visual' });
  state = reducePlaygroundProjects(state, { type: 'select', id: 1 });
  assert.deepEqual(state.projects[0].tables.Personas, [{ id: 1 }]);
  assert.equal(state.projects[0].queries.tabs[0].work.expression, 'π id (Personas)');
  assert.equal(state.projects[0].mode, 'code');
  assert.deepEqual(state.projects[1].tables.Personas, [{ id: 2 }]);
  assert.equal(state.projects[1].mode, 'visual');
});

test('renombrar y eliminar conservan un proyecto activo', () => {
  let state = createPlaygroundProjects();
  state = reducePlaygroundProjects(state, { type: 'new', name: 'Prueba' });
  state = reducePlaygroundProjects(state, { type: 'rename', id: 2, name: '  Curso A  ' });
  assert.equal(state.projects[1].name, 'Curso A');
  state = reducePlaygroundProjects(state, { type: 'remove', id: 2 });
  assert.equal(state.activeId, 1);
  assert.equal(state.projects.length, 1);
  assert.equal(reducePlaygroundProjects(state, { type: 'remove', id: 1 }), state);
});
