import { Button, Icon } from './ui.jsx';

export function QueryControls({ mode, onModeChange, work, stale, onUndo, onRedo, children }) {
  const undoDisabled = work.index === 0 && work.expression === work.history[0];
  const redoDisabled = work.index === work.history.length - 1 || stale;

  return <div class="query-controls">
    <div role="group" aria-label="Modo de consulta" class="query-modes">
      <button type="button" aria-pressed={mode === 'visual'} onClick={() => onModeChange('visual')}>Constructor visual</button>
      <button type="button" aria-pressed={mode === 'code'} onClick={() => onModeChange('code')}>Editor de símbolos</button>
    </div>
    <div class="query-actions">
      <Button variant="ghost" aria-label="Deshacer operación" title="Deshacer" disabled={undoDisabled} onClick={onUndo}><Icon name="undo" size={16}/></Button>
      <Button variant="ghost" aria-label="Rehacer operación" title="Rehacer" disabled={redoDisabled} onClick={onRedo}><Icon name="redo" size={16}/></Button>
      {children}
    </div>
  </div>;
}
