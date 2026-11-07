import { useEffect, useId, useRef } from 'preact/hooks';
import { Button as ShadcnButton } from './ui/button.jsx';

const paths = {
  play: 'm9 5 11 7-11 7V5Z', check: 'm5 12 4 4L19 6', arrow: 'M5 12h14m-5-5 5 5-5 5',
  undo: 'M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12', redo: 'm15 5 5 5-5 5m5-5H10a6 6 0 0 0 0 12',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', close: 'm6 6 12 12M6 18 18 6',
  menu: 'M4 6h16M4 12h16M4 18h16', table: 'M3 4h18v16H3V4Zm0 5h18M9 9v11',
  help: 'M9 8a3 3 0 1 1 5 2c-1 1-2 1-2 4m0 3v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  plus: 'M12 5v14M5 12h14', reset: 'M3 4v6h6M3 10a9 9 0 1 1 1 8',
  book: 'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3V4Zm9 2v16',
};
export function Icon({ name, size = 16, className = '' }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" class={className}><path d={paths[name] || paths.arrow}/></svg>;
}
export function Button({ children, variant = 'default', className = '', icon, ...props }) {
  return <ShadcnButton variant={variant === 'primary' ? 'default' : variant === 'default' ? 'outline' : variant} className={`btn ${className}`} {...props}>{icon && <Icon name={icon}/>} {children}</ShadcnButton>;
}
export function Field({ label, children, className = '' }) {
  return <label class={`flex min-w-0 flex-col gap-1.5 text-xs text-muted ${className}`}><span>{label}</span>{children}</label>;
}
export function Modal({ title, children, onClose, footer }) {
  const ref = useRef();
  const titleId = useId();
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} class="modal m-auto w-[min(760px,94vw)] rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/45 backdrop:backdrop-blur-sm">
    <div class="flex items-center justify-between gap-4 border-b border-line px-6 py-5"><h2 id={titleId} class="font-display text-xl font-bold">{title}</h2><Button variant="ghost" aria-label="Cerrar ventana" onClick={onClose}><Icon name="close"/></Button></div>
    <div class="max-h-[65vh] overflow-auto p-6">{children}</div>
    {footer && <div class="border-t border-line bg-canvas px-6 py-4">{footer}</div>}
  </dialog>;
}
