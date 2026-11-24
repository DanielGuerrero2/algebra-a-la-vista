import { createPlaygroundTabs, reducePlaygroundTabs } from './playground-tabs.js';
import { createSession } from './session.js';

export function createPlaygroundProjects(tables = {}, queries = createPlaygroundTabs(), mode = 'code') {
  return {
    projects: [{ id: 1, name: 'Proyecto 1', tables, queries, mode }],
    activeId: 1,
    nextId: 2,
  };
}

export function reducePlaygroundProjects(state, action) {
  const name = action.name?.trim();
  switch (action.type) {
    case 'new': {
      if (!name || state.projects.some(project => project.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return state;
      const id = state.nextId;
      const tables = action.tables ?? {};
      const source = Object.hasOwn(tables, action.source) ? action.source : '';
      const queries = createPlaygroundTabs({ ...createSession(source), resultVisible: !!source });
      return { projects: [...state.projects, { id, name, tables, queries, mode: source ? 'visual' : 'code' }], activeId: id, nextId: id + 1 };
    }
    case 'select':
      return state.projects.some(project => project.id === action.id) ? { ...state, activeId: action.id } : state;
    case 'rename':
      if (!name || state.projects.some(project => project.id !== action.id && project.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return state;
      return { ...state, projects: state.projects.map(project => project.id === action.id ? { ...project, name } : project) };
    case 'remove': {
      if (state.projects.length === 1 || !state.projects.some(project => project.id === action.id)) return state;
      const index = state.projects.findIndex(project => project.id === action.id);
      const projects = state.projects.filter(project => project.id !== action.id);
      return { ...state, projects, activeId: state.activeId === action.id ? projects[Math.min(index, projects.length - 1)].id : state.activeId };
    }
    case 'tables':
    case 'query':
    case 'mode':
      return { ...state, projects: state.projects.map(project => project.id === (action.projectId ?? state.activeId) ? {
        ...project,
        ...(action.type === 'tables' ? { tables: action.tables } :
          action.type === 'query' ? { queries: reducePlaygroundTabs(project.queries, action.action) } : { mode: action.mode }),
      } : project) };
    default: return state;
  }
}
