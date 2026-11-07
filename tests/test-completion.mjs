import test from 'node:test';
import assert from 'node:assert/strict';
import { getCheckOutcome } from '../src/core/completion.js';
import datasets from '../src/data/datasets.json' with { type: 'json' };
import { EXPLANATIONS } from '../src/data/explanations.js';

test('every first correct check adds progress, including after viewing the solution', () => {
  assert.deepEqual(getCheckOutcome(true, [], '0:0'), { celebrate: true, completed: true, explanation: EXPLANATIONS[0][0] });
  assert.deepEqual(getCheckOutcome(true, ['0:0'], '0:0'), { celebrate: true, completed: false, explanation: EXPLANATIONS[0][0] });
  assert.deepEqual(getCheckOutcome(false, [], '0:0'), { celebrate: false, completed: false, explanation: null });
});

test('every exercise has a result and a relational reason', () => {
  datasets.forEach((dataset, datasetIndex) => {
    assert.equal(EXPLANATIONS[datasetIndex].length, dataset.exercises.length);
    dataset.exercises.forEach((_, exerciseIndex) => {
      const explanation = getCheckOutcome(true, [], `${datasetIndex}:${exerciseIndex}`).explanation;
      assert.ok(explanation.result);
      assert.ok(explanation.reason);
    });
  });
});
