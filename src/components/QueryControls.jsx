import { Button, Icon } from './ui.jsx';

export function QueryControls({ mode, onModeChange, onUndo, onRedo, undoDisabled, redoDisabled, labels, order = ['visual', 'code'], className = '', selectorClassName = '', tabClassName = '', historyClassName = '', buttonClassName = '', children }) {
  return <div class={className}>
    <div role="group" aria-label="Modo de consulta" class={selectorClassName}>
      {order.map(id => <button key={id} id={id === 'visual' ? 'visualTab' : 'codeTab'} aria-pressed={mode === id} onClick={() => onModeChange(id)} class={typeof tabClassName === 'function' ? tabClassName(id) : tabClassName}>{labels[id]}</button>)}
    </div>
    <div class={historyClassName}>
      <Button variant="ghost" aria-label="Deshacer operación" disabled={undoDisabled} className={buttonClassName} onClick={onUndo}><Icon name="undo" size={15}/></Button>
      <Button variant="ghost" aria-label="Rehacer operación" disabled={redoDisabled} className={buttonClassName} onClick={onRedo}><Icon name="redo" size={15}/></Button>
      {children}
    </div>
  </div>;
}
