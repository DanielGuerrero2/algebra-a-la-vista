import { symbolize } from './lab-model.js';

export function createSession(source, saved = {}) {
  const history = Array.isArray(saved.history)
    ? saved.history.filter(item => typeof item === 'string').slice(-50)
    : [source];
  if (!history.length) history.push(source);
  const index = Math.max(0, Math.min(Number(saved.historyIndex) || 0, history.length - 1));
  const expression = symbolize(typeof saved.expression === 'string' ? saved.expression : source);
  return { source, expression, executed: expression, history, index, assisted: !!saved.assisted, resultVisible: false };
}

function commit(state, expression) {
  if (state.history[state.index] === expression) return { ...state, expression, executed: expression };
  const history = [...state.history.slice(0, state.index + 1), expression].slice(-50);
  return { ...state, expression, executed: expression, history, index: history.length - 1 };
}

export function reduceSession(state, action) {
  switch (action.type) {
    case 'load': return action.session;
    case 'edit': return { ...state, expression: symbolize(action.expression), resultVisible: false };
    case 'execute': return action.valid
      ? { ...commit(state, symbolize(action.expression)), resultVisible: action.showResult !== false }
      : { ...state, expression: symbolize(action.expression), executed: symbolize(action.expression), resultVisible: action.showResult !== false };
    case 'solution': return { ...commit(state, symbolize(action.expression)), assisted: true, resultVisible: false };
    case 'source': return { ...commit({ ...state, source: action.source, assisted: false }, action.source), resultVisible: false };
    case 'reset': return { ...commit({ ...state, assisted: false }, state.source), resultVisible: false };
    case 'undo': {
      const index = state.expression !== state.history[state.index] ? state.index : Math.max(0, state.index - 1);
      return { ...state, index, expression: state.history[index], executed: state.history[index], resultVisible: false };
    }
    case 'redo': {
      if (state.expression !== state.history[state.index]) return state;
      const index = Math.min(state.history.length - 1, state.index + 1);
      return { ...state, index, expression: state.history[index], executed: state.history[index], resultVisible: false };
    }
    default: return state;
  }
}
