import { useEffect, useRef } from 'preact/hooks';
import { Button, Icon } from './ui.jsx';
import { BrandIcon } from './BrandIcon.jsx';

export function Sidebar({ workspace: w, onInspect, open, onClose }) {
  const drawer = useRef();
  const exerciseTotal = w.datasets.reduce((total, dataset) => total + dataset.exercises.length, 0);
  useEffect(() => {
    if (!open) return;
    const previous = document.querySelector('button[aria-controls="lab-navigation"]') || document.activeElement;
    const focusable = () => [...drawer.current.querySelectorAll('a, button, select')].filter(element => !element.disabled && element.getClientRects().length);
    focusable()[0]?.focus();
    function keydown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const elements = focusable(), first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    const element = drawer.current;
    element.addEventListener('keydown', keydown);
    return () => { element.removeEventListener('keydown', keydown); if (previous?.getClientRects().length) previous.focus(); };
  }, [open]);
  function navigate(dataset, exercise) { w.navigate(dataset, exercise); onClose(); location.hash = '#laboratorio'; }
  return <>
    {open && <button class="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden" aria-label="Cerrar navegación" onClick={onClose}/>}
    <aside id="lab-navigation" ref={drawer} aria-label="Bases y ejercicios" role={open ? 'dialog' : undefined} aria-modal={open || undefined} class={`lab-sidebar ${open ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col border-r border-line bg-white lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-dvh lg:w-[272px]`}>
      <div class="flex h-[72px] shrink-0 items-center gap-2.5 border-b border-line px-5"><BrandIcon/><a href="#" onClick={onClose} class="whitespace-nowrap font-display text-[14px] font-extrabold tracking-tight">Álgebra a la vista<span class="mt-0.5 block text-[8px] font-medium tracking-[2px] text-muted">APRENDE HACIENDO</span></a><button aria-label="Cerrar menú" class="ml-auto p-2 lg:hidden" onClick={onClose}><Icon name="close"/></button></div>
      <div class="border-b border-line px-4 py-4"><a href="#playground" onClick={onClose} class="sidebar-home-link"><Icon name="table" size={15}/> Playground con tus tablas</a><div class="sidebar-progress"><span>Tu progreso</span><strong>{w.solved.length} / {exerciseTotal}</strong></div><progress max={exerciseTotal} value={w.solved.length} aria-label="Retos completados" class="mt-2 h-1.5 w-full overflow-hidden rounded-full"/></div>
      <div class="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <h2 class="eyebrow px-2">BASES Y RETOS</h2>
        <nav class="sidebar-course-list" aria-label="Ejercicios">{w.datasets.map((data, dataset) => <details key={dataset} open={dataset === w.location.dataset} class="sidebar-course"><summary><span class="sidebar-course-number">0{dataset + 1}</span><span><strong>{data.title}</strong><small>{data.exercises.filter((_, i) => w.solved.includes(`${dataset}:${i}`)).length} de {data.exercises.length} retos</small></span></summary><div class="sidebar-course-exercises">{data.exercises.map((task, i) => {
          const current = w.location.dataset === dataset && w.location.exercise === i, done = w.solved.includes(`${dataset}:${i}`);
          return <button key={i} data-ex={i} aria-current={current ? 'page' : undefined} onClick={() => navigate(dataset, i)} class={`sidebar-exercise ${current ? 'is-current' : ''}`}><span class={`sidebar-exercise-number ${done ? 'is-done' : ''}`}>{done ? <Icon name="check" size={11}/> : i + 1}</span><span>{task.title.replace(/^\d+\s/, '')}</span></button>;
        })}</div></details>)}</nav>
        <Button variant="ghost" icon="plus" className={`mt-3 w-full justify-start !px-2 text-[11px] ${w.location.exercise === null ? 'bg-white' : ''}`} onClick={() => navigate(w.location.dataset, null)}>Práctica libre</Button>
        <div class="mt-7 border-t border-line pt-5"><h2 class="eyebrow px-2">TABLAS ORIGINALES</h2><div class="mt-2 space-y-1">{Object.entries(w.data.relations).map(([name, rows]) => <button key={name} data-table={name} class="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-[11px] text-muted hover:bg-accent hover:text-accent-foreground" onClick={() => onInspect(name)}><Icon name="table" size={14}/><span class="flex-1 font-mono">{name}</span><span class="rounded bg-white px-1.5 text-[9px]">{rows.length}</span></button>)}</div></div>
      </div>
      <div class="lab-sidebar-note shrink-0 border-t border-line px-5 py-4"><div><div class="flex items-center gap-2 text-[10px] font-medium text-brand"><span class="size-1.5 rounded-full bg-brand"/> Base original conservada</div><p class="mt-1.5 text-[9px] leading-relaxed text-muted">Las operaciones son simulaciones.<br/>Tu progreso se guarda en este navegador.</p></div><img src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-base-conservada-128.webp`} width="128" height="128" alt="" decoding="async"/></div>
    </aside>
  </>;
}
