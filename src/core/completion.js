import { EXPLANATIONS } from '../data/explanations.js';

export function getCheckOutcome(correct, solved, id) {
  const [dataset, exercise] = id.split(':').map(Number);
  return {
    celebrate: correct,
    completed: correct && !solved.includes(id),
    explanation: correct ? EXPLANATIONS[dataset]?.[exercise] ?? null : null,
  };
}
