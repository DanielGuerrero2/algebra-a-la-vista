import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../src/core/session.js';
import { createPlaygroundTabs, reducePlaygroundTabs } from '../src/core/playground-tabs.js';

test('cada pestaña conserva su consulta, resultado e historial', () => {
  let state = createPlaygroundTabs(createSession('Personas'));
  state = reducePlaygroundTabs(state, { type: 'session', action: { type: 'edit', expression: 'π nombre (Personas)' } });
  state = reducePlaygroundTabs(state, { type: 'new', source: 'Personas' });
  assert.equal(state.tabs.length, 2);
  assert.equal(state.tabs[1].work.expression, 'Personas');
  state = reducePlaygroundTabs(state, { type: 'session', action: { type: 'execute', expression: 'π id (Personas)', valid: true } });
  state = reducePlaygroundTabs(state, { type: 'select', id: 1 });
  assert.equal(state.tabs[0].work.expression, 'π nombre (Personas)');
  assert.equal(state.tabs[1].work.expression, 'π id (Personas)');
  assert.equal(state.tabs[1].work.resultVisible, true);
  state = reducePlaygroundTabs(state, { type: 'close', id: 1 });
  assert.equal(state.activeId, 2);
  assert.equal(state.tabs.length, 1);
  assert.equal(reducePlaygroundTabs(state, { type: 'close', id: 2 }), state);
});
