import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/core/engine.js';
import { TASKS } from '../src/data/tasks.js';
import { EXPLANATIONS } from '../src/data/explanations.js';
import { GUIDE_EXAMPLES, GUIDE_OPERATIONS } from '../src/data/guide.js';

const datasets = JSON.parse(readFileSync(new URL('../src/data/datasets.json', import.meta.url)));
const expected = JSON.parse(readFileSync(new URL('./fixtures/expected-results.json', import.meta.url)));

test('Veterinaria conserva las tres tablas originales y ofrece ocho retos comprobables', () => {
  const data = datasets[4];
  assert.equal(data.title, 'Veterinaria');
  assert.deepEqual(Object.keys(data.relations), ['Mascotas', 'Responsables', 'Concursos']);
  assert.deepEqual(data.relations.Mascotas.map(row => row.noRegMasc), [100, 200, 300, 400, 500, 600]);
  assert.deepEqual(data.relations.Responsables.map(row => row.cveResponsable), [1, 3, 5, 7]);
  assert.deepEqual(data.relations.Concursos.map(row => row.noConcurso), [1, 2, 3, 4, 5]);
  assert.equal(data.exercises.length, 8);
  assert.equal(TASKS[4].length, 8);
  assert.equal(EXPLANATIONS[4].length, 8);
  assert.equal(expected[4].results.length, 8);
  assert.ok(GUIDE_EXAMPLES[4]);
  assert.equal(GUIDE_OPERATIONS[4].length, 5);
  data.exercises.forEach((exercise, index) => {
    const actual = run(exercise.expression, data.relations);
    const target = expected[4].results[index];
    assert.deepEqual(actual.cols, target.cols, exercise.title);
    assert.deepEqual(actual.rows, target.rows, exercise.title);
  });
  assert.deepEqual(expected[4].results[0].rows, [{ raza: 'Shih tzu' }]);
  assert.deepEqual(expected[4].results[7].rows, []);
});
