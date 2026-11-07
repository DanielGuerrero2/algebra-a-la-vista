import test from 'node:test';
import assert from 'node:assert/strict';
import { run, key } from '../src/core/engine.js';
import { build } from '../src/core/lab-model.js';

test('división: todos los servicios, divisor vacío y esquemas incompatibles', () => {
  const tables = {
    Pares: [{ placa: 1, servicio: 1 }, { placa: 1, servicio: 2 }, { placa: 2, servicio: 1 }],
    Servicios: [{ servicio: 1 }, { servicio: 2 }],
  };
  assert.deepEqual(run('Pares ÷ Servicios', tables).rows, [{ placa: 1 }]);
  assert.deepEqual(run('Pares divide (Servicios − Servicios)', tables).rows, [{ placa: 1 }, { placa: 2 }]);
  assert.throws(() => run('Servicios ÷ Pares', tables), /división/);
  assert.throws(() => run("Pares ÷ { servicio:string '1' }", tables), /Tipos incompatibles/);
});

const rows = [
  { id: 1, ciudad: 'Norte', precio: 10 },
  { id: 2, ciudad: 'Sur', precio: 20 },
  { id: 3, ciudad: 'Norte', precio: 30 },
];
const db = {
  Items: rows,
  Otros: [{ precio: 20, ciudad: 'Sur', id: 2 }, { precio: 40, ciudad: 'Este', id: 4 }],
  Ventas: [{ id: 1, vendedor: 'Ana' }, { id: 1, vendedor: 'Luis' }, { id: 3, vendedor: 'Ana' }],
  Letras: [{ letra: 'A' }, { letra: 'B' }],
  IdsTexto: [{ id: '1' }],
};
const canonical = values => values.map(key).sort();
const evaluate = (config, source = 'Items') => run(build(source, config, db), db);
const filter = (column, operator, value) => ({ column, operator, value });

test('selección: los seis comparadores, AND, OR y ningún resultado', () => {
  for (const [operator, ids] of [['=', [2]], ['!=', [1, 3]], ['>', [3]], ['<', [1]], ['>=', [2, 3]], ['<=', [1, 2]]]) {
    assert.deepEqual(evaluate({ op: 'select', filters: [filter('precio', operator, 20)] }).rows.map(r => r.id), ids);
  }
  const filters = [filter('ciudad', '=', 'Norte'), filter('precio', '>', 15)];
  assert.deepEqual(evaluate({ op: 'select', filters, logic: 'and' }).rows, [rows[2]]);
  assert.deepEqual(evaluate({ op: 'select', filters, logic: 'or' }).rows, rows);
  assert.deepEqual(evaluate({ op: 'select', filters: [filter('precio', '>', 100)] }).rows, []);
});

test('proyección: conserva el orden de columnas y elimina duplicados', () => {
  assert.deepEqual(evaluate({ op: 'project', columns: ['ciudad'] }).rows, [{ ciudad: 'Norte' }, { ciudad: 'Sur' }]);
  assert.deepEqual(evaluate({ op: 'project', columns: ['precio', 'id'] }).cols, ['precio', 'id']);
  assert.throws(() => evaluate({ op: 'project', columns: ['desconocida'] }));
});

test('join natural: coincidencias múltiples y exclusión de filas sin pareja', () => {
  assert.deepEqual(evaluate({ op: 'join', table: 'Ventas' }).rows, [
    { ...rows[0], vendedor: 'Ana' }, { ...rows[0], vendedor: 'Luis' }, { ...rows[2], vendedor: 'Ana' },
  ]);
  assert.equal(evaluate({ op: 'join', table: 'Letras' }).rows.length, 6);
  assert.throws(() => evaluate({ op: 'join', table: 'Inexistente' }));
});

test('un join rechaza columnas comunes con tipos incompatibles', () => {
  assert.throws(() => run('Items ⋈ { id:string \'1\' }', db), /join.*id.*tipos incompatibles/i);
  assert.throws(() => run('Items ⋈ { id:string }', db), /join.*id.*tipos incompatibles/i);
  assert.throws(() => evaluate({ op: 'join', table: 'IdsTexto' }), /join.*id.*tipos incompatibles/i);
});

test('operaciones de conjuntos: filas completas, orden de columnas y deduplicación', () => {
  for (const [op, expected] of [
    ['union', [...rows, db.Otros[1]]],
    ['difference', [rows[0], rows[2]]],
    ['intersect', [rows[1]]],
  ]) {
    assert.deepEqual(canonical(evaluate({ op, other: 'Otros' }).rows), canonical(expected));
    assert.throws(() => evaluate({ op, other: 'Letras' }), /columnas/);
  }
  assert.deepEqual(evaluate({ op: 'difference', other: 'Items' }).rows, []);
  assert.deepEqual(evaluate({ op: 'union', other: 'Items' }).rows, rows);
});

test('alta: nueva fila, fila repetida, comillas, negativos y decimales', () => {
  const row = { id: 4, ciudad: "O'Brien", precio: -2.5 };
  assert.deepEqual(evaluate({ op: 'insert', row }).rows, [...rows, row]);
  assert.deepEqual(evaluate({ op: 'insert', row: rows[0] }).rows, rows);
  assert.throws(() => evaluate({ op: 'insert', row: { ...row, precio: '' } }), /número/);
});

test('baja: coincidencias parciales, ninguna y todas', () => {
  assert.deepEqual(evaluate({ op: 'delete', filters: [filter('ciudad', '=', 'Norte')] }).rows, [rows[1]]);
  assert.deepEqual(evaluate({ op: 'delete', filters: [filter('id', '=', 99)] }).rows, rows);
  assert.deepEqual(evaluate({ op: 'delete', filters: [filter('id', '>', 0)] }).rows, []);
});

test('modificación: suma, sustitución numérica/textual y ninguna coincidencia', () => {
  const config = { op: 'update', filters: [filter('ciudad', '=', 'Norte')], field: 'precio', mode: 'add', value: -2.5 };
  assert.deepEqual(canonical(evaluate(config).rows), canonical([{ ...rows[0], precio: 7.5 }, rows[1], { ...rows[2], precio: 27.5 }]));
  const set = evaluate({ ...config, mode: 'set', value: 5 });
  assert.deepEqual(canonical(set.rows), canonical([{ ...rows[0], precio: 5 }, rows[1], { ...rows[2], precio: 5 }]));
  assert.equal(evaluate({ ...config, field: 'ciudad', mode: 'set', value: "O'Brien" }).rows.filter(r => r.ciudad === "O'Brien").length, 2);
  assert.deepEqual(evaluate({ ...config, filters: [filter('id', '=', 99)] }).rows, rows);
  assert.throws(() => evaluate({ ...config, field: 'ciudad' }), /numéricas/);
});

test('cadena: filtrar, unir, modificar, proyectar y añadir sobre el último resultado', () => {
  const original = structuredClone(db);
  let expression = 'Items';
  for (const config of [
    { op: 'select', filters: [filter('precio', '>', 15)] },
    { op: 'join', table: 'Ventas' },
    { op: 'update', filters: [filter('id', '=', 3)], field: 'precio', mode: 'add', value: 5 },
    { op: 'project', columns: ['vendedor', 'precio'] },
    { op: 'insert', row: { vendedor: 'Luis', precio: 50 } },
  ]) expression = build(expression, config, db);
  assert.deepEqual(run(expression, db).rows, [{ vendedor: 'Ana', precio: 35 }, { vendedor: 'Luis', precio: 50 }]);
  assert.deepEqual(db, original);
});

test('las relaciones literales vacías conservan los tipos declarados', () => {
  assert.deepEqual(run('{ id:number, ciudad:string }', db).types, { id: 'number', ciudad: 'string' });
  for (const operator of ['union', '-', 'intersect']) {
    assert.throws(() => run(`{ id:number } ${operator} { id:string '1' }`, db), /Tipos incompatibles/);
    assert.throws(() => run(`{ id:string '1' } ${operator} { id:number }`, db), /Tipos incompatibles/);
  }
});

test('producto y join se detienen al llegar al límite sin construir todas las combinaciones', () => {
  let reads = 0;
  const left = Array.from({ length: 200 }, (_, l) => ({ l }));
  const right = Array.from({ length: 101 }, (_, index) => ({
    get r() { reads++; return index; },
  }));
  for (const operator of ['×', '⋈']) {
    reads = 0;
    assert.throws(() => run(`Izquierda ${operator} Derecha`, { Izquierda: left, Derecha: right }), /20 000 filas/);
    assert.ok(reads < 20301, `Se leyeron ${reads} valores con ${operator}; se generaron todas las combinaciones`);
  }
});

test('una tabla vacía conserva su esquema declarado por separado', () => {
  const tables = { Vacia: [] };
  const schemas = { Vacia: { id: 'number', nombre: 'string' } };
  assert.deepEqual(run('Vacia', tables, schemas).cols, ['id', 'nombre']);
  assert.deepEqual(run('Vacia', tables, schemas).types, schemas.Vacia);
  assert.deepEqual(run('π nombre (Vacia)', tables, schemas).types, { nombre: 'string' });
  assert.throws(() => run("Vacia ⋈ { id:string '1' }", tables, schemas), /tipos incompatibles/);
});

test('comparar tipos y modificar sigue funcionando después de una cadena vacía', () => {
  const source = build('Items', { op: 'delete', filters: [filter('id', '>', 0)] }, db);
  const updated = build(source, { op: 'update', filters: [filter('id', '=', 1)], field: 'precio', mode: 'set', value: 5 }, db);
  assert.deepEqual(run(updated, db).types, { id: 'number', ciudad: 'string', precio: 'number' });
  assert.throws(() => run("sigma precio = 'texto' (" + updated + ')', db), /tipo/);
});
