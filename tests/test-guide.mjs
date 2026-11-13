import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { run } from '../src/core/engine.js';
import { GUIDE_EXAMPLES, GUIDE_OPERATIONS } from '../src/data/guide.js';

const datasets = JSON.parse(readFileSync(new URL('../src/data/datasets.json', import.meta.url)));
const expected = [
  [{ ciudad: 'Chih', precio: 1050000 }, { ciudad: 'Jimenez', precio: 1021000 }, { ciudad: 'Delicias', precio: 1500000 }],
  [{ descripcion: 'Boliler 30 g', precio: 3000 }, { descripcion: 'Calentor Espa¤o', precio: 2530 }],
  [{ titulo: 'Estructura de Datos', pagunas: 568 }, { titulo: 'Inteligencia Artificial', pagunas: 805 }],
  [{ placaVehiculo: 15554, modelo: 'Nova' }, { placaVehiculo: 16653, modelo: 'Spark' }, { placaVehiculo: 16654, modelo: 'Aveo' }],
];

test('la guía muestra transformaciones reales y resultados correctos en las cuatro bases', () => {
  const original = JSON.stringify(datasets);
  assert.equal(GUIDE_EXAMPLES.length, datasets.length);
  GUIDE_EXAMPLES.forEach((example, index) => {
    const [source, filtered, projected] = example.steps.map(step => run(step.expression, datasets[index].relations));
    assert.deepEqual(projected.rows, expected[index]);
    assert.deepEqual(filtered.cols, source.cols, 'Seleccionar conserva las columnas');
    assert.ok(filtered.rows.length < source.rows.length, 'El filtro ilustra la eliminación de filas');
    assert.ok(projected.cols.length < filtered.cols.length, 'Proyectar ilustra la eliminación de columnas');
    assert.equal(projected.rows.length, filtered.rows.length);
    assert.ok(filtered.rows.every(row => source.rows.some(input => JSON.stringify(input) === JSON.stringify(row))));
    assert.ok(run(example.join, datasets[index].relations).rows.length > 0);
  });
  assert.equal(JSON.stringify(datasets), original, 'La demostración conserva las bases originales');
});

test('cada base ofrece cinco ejemplos binarios válidos con resultados visibles', () => {
  assert.equal(GUIDE_OPERATIONS.length, datasets.length);
  GUIDE_OPERATIONS.forEach((operations, index) => {
    assert.deepEqual(operations.map(({ symbol }) => symbol), ['⋈', '∪', '−', '∩', '÷']);
    operations.forEach(({ symbol, expression, inputs, text }) => {
      assert.ok(text);
      assert.equal(inputs.length, 2);
      const [left, right] = inputs.map(input => run(input, datasets[index].relations));
      const result = run(expression, datasets[index].relations);
      assert.ok(left.rows.length > 0 && right.rows.length > 0, `${index} ${symbol}: entradas visibles`);
      assert.ok(result.rows.length > 0, `${index} ${symbol}: resultado visible`);
      if (['∪', '−', '∩'].includes(symbol)) {
        assert.deepEqual(left.cols, right.cols, `${index} ${symbol}: esquemas compatibles`);
        assert.deepEqual(left.types, right.types, `${index} ${symbol}: tipos compatibles`);
      }
      if (symbol === '÷') assert.ok(right.rows.length > 1, `${index}: el divisor muestra el sentido de «todos»`);
    });
  });
});
