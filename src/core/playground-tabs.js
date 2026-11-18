import { createSession, reduceSession } from './session.js';

export function createPlaygroundTabs(work = createSession('')) {
  return { tabs: [{ id: 1, work }], activeId: 1, nextId: 2 };
}

export function reducePlaygroundTabs(state, action) {
  switch (action.type) {
    case 'new': {
      const id = state.nextId;
      return { tabs: [...state.tabs, { id, work: createSession(action.source) }], activeId: id, nextId: id + 1 };
    }
    case 'select':
      return state.tabs.some(tab => tab.id === action.id) ? { ...state, activeId: action.id } : state;
    case 'close': {
      if (state.tabs.length === 1 || !state.tabs.some(tab => tab.id === action.id)) return state;
      const index = state.tabs.findIndex(tab => tab.id === action.id);
      const tabs = state.tabs.filter(tab => tab.id !== action.id);
      return { ...state, tabs, activeId: state.activeId === action.id ? tabs[Math.min(index, tabs.length - 1)].id : state.activeId };
    }
    case 'session':
      return { ...state, tabs: state.tabs.map(tab => tab.id === state.activeId ? { ...tab, work: reduceSession(tab.work, action.action) } : tab) };
    case 'replaceWorks':
      return { ...state, tabs: state.tabs.map(tab => ({ ...tab, work: action.replace(tab.work) })) };
    default: return state;
  }
}
