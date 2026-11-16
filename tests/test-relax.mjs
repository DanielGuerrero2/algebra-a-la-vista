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

test('columnas calificadas funcionan en proyección, selección y joins', () => {
  const source = 'ρ L (A) ⋈ L.id = R.id (ρ R (A))';
  const projected = run(`π L.id, R.value (${source})`, db);
  assert.deepEqual(projected.cols, ['L.id', 'R.value']);
  assert.deepEqual(projected.rows, [{ 'L.id': 1, 'R.value': 'a' }, { 'L.id': 2, 'R.value': 'b' }]);
  assert.deepEqual(run(`π L.id (σ L.id = 1 (ρ L (A)))`, db).rows, [{ 'L.id': 1 }]);
  assert.deepEqual(run(build('ρ L (A)', { op: 'project', columns: ['L.id'] }, db), db).cols, ['L.id']);
  assert.throws(() => run('π L.missing (ρ L (A))', db), /proyección/);
  assert.throws(() => run('π A.id (A)', db), /proyección/);
  assert.deepEqual(run('π value (A)', db).cols, ['value']);
  assert.deepEqual(run('σ L.id >= 1.5 (ρ L (A))', db).rows.map(row => row['L.id']), [2]);
});

test('∧ combina condiciones en una autorrelación', () => {
  const games = { Videojuego: [
    { titulo: 'A', numSerie: 1, cveEstudio: 10 },
    { titulo: 'B', numSerie: 2, cveEstudio: 10 },
    { titulo: 'C', numSerie: 3, cveEstudio: 20 },
  ] };
  const expression = 'π V1.titulo, V1.numSerie, V2.numSerie (σ V1.cveEstudio = V2.cveEstudio ∧ V1.numSerie < V2.numSerie (ρ V1 (Videojuego) × ρ V2 (Videojuego)))';
  assert.deepEqual(run(expression, games).rows, [{ 'V1.titulo': 'A', 'V1.numSerie': 1, 'V2.numSerie': 2 }]);
  assert.deepEqual(run(expression.replace('∧ V1.numSerie < V2.numSerie', '∧ (V1.numSerie < V2.numSerie)'), games).rows, run(expression, games).rows);
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
