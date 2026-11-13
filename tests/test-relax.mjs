import test from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../src/core/engine.js';
import { build } from '../src/core/lab-model.js';

const db = { A: [{ id: 1, value: 'a' }, { id: 2, value: 'b' }], B: [{ id: 1, note: 'x' }, { id: 3, note: 'y' }] };

test('renombrado de relación y columna permite autorrelaciones', () => {
  assert.deepEqual(run('ρ key←id (A)', db).cols, ['key', 'value']);
  assert.deepEqual(run('ρ L (A) ⋈ L.id = R.id (ρ R (A))', db).rows.map(row => [row['L.id'], row['R.id']]), [[1, 1], [2, 2]]);
  assert.throws(() => run('ρ id←value (A)', db), /repetidas/);
});

test('joins externos, semijoins y antijoin conservan sus columnas y filas', () => {
  assert.deepEqual(run('A ⟕ B', db).rows, [{ id: 1, value: 'a', note: 'x' }, { id: 2, value: 'b', note: null }]);
  assert.deepEqual(run('A ⟖ B', db).rows, [{ id: 1, value: 'a', note: 'x' }, { id: 3, value: null, note: 'y' }]);
  assert.equal(run('A ⟗ B', db).rows.length, 3);
  assert.deepEqual(run('A ⋉ B', db).rows, [db.A[0]]);
  assert.deepEqual(run('A ⋊ B', db).rows, [db.B[0]]);
  assert.deepEqual(run('A ▷ B', db).rows, [db.A[1]]);
});

test('constructor genera las nuevas operaciones', () => {
  const renamed = build('A', { op: 'renameRelation', newName: 'L' }, db);
  assert.deepEqual(run(renamed, db).cols, ['L.id', 'L.value']);
  assert.deepEqual(run(build('A', { op: 'antiJoin', other: 'B' }, db), db).rows, [db.A[1]]);
});

test('esquemas vacíos, tipos y límite de filas se conservan', () => {
  const schemas = { Vacia: { id: 'number' } };
  const empty = run('Vacia ⟕ B', { ...db, Vacia: [] }, schemas);
  assert.deepEqual(empty.types, { id: 'number', note: 'string' });
  assert.deepEqual(empty.rows, []);
  assert.throws(() => run("A ⟕ { id:string '1' }", db), /Tipos incompatibles/);
  const many = Array.from({ length: 150 }, (_, id) => ({ id }));
  assert.throws(() => run('L ⟗ R', { L: many, R: many.map(({ id }) => ({ other: id })) }), /20 000 filas/);
});
