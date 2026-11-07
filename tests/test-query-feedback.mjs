import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseExpression } from '../src/core/query-feedback.js';

const db = { Casa: [{ precio: 1500000, ciudad: 'Chih' }] };
test('el editor distingue consultas válidas y relaciones vacías de errores', () => {
  assert.equal(diagnoseExpression('π ciudad (σ precio > 1000000 (Casa))', db), null);
  assert.equal(diagnoseExpression('σ precio > 9999999 (Casa)', db), null);
});
test('señala errores de sintaxis y da una corrección concreta', () => {
  const cases = [
    ['σ precio > 1000000 (Casa', /paréntesis/i],
    ["σ ciudad = 'Chih (Casa)", /comilla/i],
    ['σ ciudad = Chih (Casa)', /comillas simples/i],
    ['casa', /Casa/],
    ['π inexistente (Casa)', /columnas/i],
    ["σ precio > '1000000' (Casa)", /sin comillas/i],
    ['σ precio > (Casa)', /valor/i],
    ['σ precio ! 1 (Casa)', /comparadores/i],
  ];
  for (const [expression, hint] of cases) {
    const diagnostic = diagnoseExpression(expression, db);
    assert.ok(diagnostic?.message, expression);
    assert.match(diagnostic.hint, hint, expression);
  }
});
test('las comillas escapadas y los paréntesis dentro de texto son válidos', () => {
  assert.equal(diagnoseExpression("σ ciudad = 'O''Hare (Norte)' (Casa)", db), null);
});
test('las sugerencias usan nombres de la base activa', () => {
  const library = { Libro: [{ titulo: 'Álgebra', pagunas: 300 }] };
  assert.match(diagnoseExpression('π precio (Libro)', library).hint, /π titulo, pagunas \(Libro\)/);
  assert.doesNotMatch(diagnoseExpression("σ pagunas > '300' (Libro)", library).hint, /Casa|precio|ciudad/);
});
test('explica una operación imposible por tipos incompatibles', () => {
  const diagnostic = diagnoseExpression("Casa ⋈ { precio:string 'alto' }", db);
  assert.match(diagnostic.message, /precio.*tipos incompatibles/i);
  assert.match(diagnostic.hint, /mismo tipo/i);
});
test('ubica el delimitador incorrecto sin confundir los que están dentro de texto', () => {
  const opening = 'σ precio > 1000000 (Casa';
  assert.equal(diagnoseExpression(opening, db).position, opening.indexOf('('));
  assert.match(diagnoseExpression(opening, db).hint, /Falta cerrar/);
  assert.equal(diagnoseExpression('Casa)', db).position, 4);
  const quote = "σ ciudad = 'Chih (Casa)";
  assert.equal(diagnoseExpression(quote, db).position, quote.indexOf("'"));
});
