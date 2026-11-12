import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTableFile, parseTableGroup } from '../src/core/playground-import.js';
import { run } from '../src/core/engine.js';
import { readFileSync } from 'node:fs';

test('el playground conecta el selector de archivos con la importación', () => {
  const component = readFileSync(new URL('../src/components/Playground.jsx', import.meta.url), 'utf8');
  assert.match(component, /<input\b[^>]*type="file"[^>]*ref=\{fileInput\}[^>]*onChange=\{importFiles\}/);
});

test('importa CSV y JSON como relaciones consultables', () => {
  const csv = parseTableFile('Personas.csv', 'id,nombre\n1,Ana\n2,"Luis, Jr."\n');
  const json = parseTableFile('Ciudades.json', '[{"id":1,"ciudad":"Puebla"}]');
  assert.deepEqual(csv.rows, [{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Luis, Jr.' }]);
  assert.deepEqual(run('π nombre (Personas)', { Personas: csv.rows }).rows, [{ nombre: 'Ana' }, { nombre: 'Luis, Jr.' }]);
  assert.equal(run('Personas ⋈ Ciudades', { Personas: csv.rows, Ciudades: json.rows }).rows[0].ciudad, 'Puebla');
});

test('CSV conserva comillas y saltos de línea entrecomillados', () => {
  const table = parseTableFile('Notas.csv', 'id,nota\r\n1,"Dijo ""hola""\ny siguió"\r\n');
  assert.deepEqual(table.rows, [{ id: 1, nota: 'Dijo "hola"\ny siguió' }]);
});

test('un archivo de grupo carga varias relaciones tipadas', () => {
  const group = parseTableGroup('Biblioteca.txt', `-- ejemplo
group: BIBLIOTECA
Libro = {
id:number, titulo:String, autor:number
1, 'Estructura de Datos', 10
2, Camino Critico, 20
}
Autor = {
autor:number, nombre:string
10, Ana
20, 'Luis, Jr.'
}`);
  assert.equal(group.title, 'BIBLIOTECA');
  assert.deepEqual(Object.keys(group.tables), ['Libro', 'Autor']);
  assert.equal(run('Libro ⋈ Autor', group.tables).rows.length, 2);
  assert.equal(group.tables.Autor[1].nombre, 'Luis, Jr.');
});

test('un grupo señala errores de esquema y fila', () => {
  assert.throws(() => parseTableGroup('B.txt', 'group: B\nA = {\nid:date\n1\n}'), /tipo/i);
  assert.throws(() => parseTableGroup('B.txt', 'group: B\nA = {\nid:number\ntexto\n}'), /A.*fila 1/i);
  assert.throws(() => parseTableGroup('B.txt', 'group: B\nA = {\nid:number\n1, 2\n}'), /A.*fila 1/i);
  assert.throws(() => parseTableGroup('B.txt', 'group: B\nA = {\nid:number\n1\n}\nA = {\nid:number\n2\n}'), /repetida/i);
});

test('rechaza formatos, esquemas y valores incompatibles', () => {
  assert.throws(() => parseTableFile('mal-nombre.csv', 'id\n1'), /nombre de tabla/);
  assert.throws(() => parseTableFile('Personas.txt', 'id\n1'), /CSV o JSON/);
  assert.throws(() => parseTableFile('Personas.csv', 'id,id\n1,2'), /repetida/);
  assert.throws(() => parseTableFile('Personas.csv', 'id,nombre\n1'), /columnas/);
  assert.throws(() => parseTableFile('Personas.csv', 'id\n'), /fila de datos/);
  assert.throws(() => parseTableFile('Personas.json', '[{"id":1},{"id":"2"}]'), /tipo/);
  assert.throws(() => parseTableFile('Personas.json', '[{"id":1},{"otro":2}]'), /columnas/);
  assert.throws(() => parseTableFile('Personas.json', '{"id":1}'), /arreglo/);
  assert.throws(() => parseTableFile('__proto__.csv', 'id\n1'), /nombre de tabla/);
  assert.throws(() => parseTableFile('Personas.csv', 'id,nombre\n1,"sin cerrar'), /comilla/);
});
