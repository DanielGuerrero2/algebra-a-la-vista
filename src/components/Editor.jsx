import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { symbolize } from '../core/lab-model.js';
import { diagnoseExpression } from '../core/query-feedback.js';
import { Button } from './ui.jsx';

export function Expression({ text, tables }) {
  return text.split(/('(?:[^']|'')*(?:'|$)|\b-?\d+(?:\.\d+)?\b|[σπρ⋈∪∩×−÷⟕⟖⟗⋉⋊▷↦]|\b[A-Za-z_]\w*\b)/g).map((token, index) => {
    const color = token.startsWith("'") ? 'text-teal-700' : /^[σπρ⋈∪∩×−÷⟕⟖⟗⋉⋊▷↦]$/.test(token) ? 'font-bold text-amber-700' : /^-?\d/.test(token) ? 'text-blue-700' : Object.hasOwn(tables, token) ? 'font-bold text-brand' : '';
    return <span key={index} class={color}>{token}</span>;
  });
}
export function Editor({ expression, tables, onEdit, onExecute, executionError, focusRequest }) {
  const input = useRef(), overlay = useRef(), caret = useRef(null);
  const [validation, setValidation] = useState(null);
  useEffect(() => {
    const timer = setTimeout(() => setValidation({ expression, tables, error: diagnoseExpression(expression, tables) }), executionError ? 0 : 500);
    return () => clearTimeout(timer);
  }, [expression, tables, executionError]);
  const checked = validation?.expression === expression && validation?.tables === tables;
  const diagnostic = checked ? validation.error : null;
  useLayoutEffect(() => {
    if (caret.current) { input.current.setSelectionRange(...caret.current); caret.current = null; }
  }, [expression]);
  useLayoutEffect(() => {
    if (focusRequest) input.current.focus();
  }, [focusRequest]);
  function change(event) {
    const element = event.currentTarget;
    caret.current = [symbolize(element.value.slice(0, element.selectionStart)).length, symbolize(element.value.slice(0, element.selectionEnd)).length];
    onEdit(symbolize(element.value));
  }
  function insert(symbol) {
    const element = input.current, start = element.selectionStart, end = element.selectionEnd;
    const value = /[σπρ⋈∪−∩÷⟕⟖⟗⋉⋊▷]/.test(symbol) ? `${symbol} ` : symbol;
    caret.current = [start + value.length, start + value.length];
    onEdit(expression.slice(0, start) + value + expression.slice(end));
    element.focus();
  }
  return <div class="flex flex-1 flex-col">
    <div class="flex flex-wrap items-center gap-1.5 border-b border-line bg-canvas/50 px-5 py-3" aria-label="Insertar símbolo">
      {['σ', 'π', 'ρ', '⋈', '⟕', '⟖', '⟗', '⋉', '⋊', '▷', '÷', '∪', '−', '∩', '(', ')', "'"].map(symbol => <button key={symbol} class="math flex size-9 items-center justify-center rounded-md border border-line bg-white text-xl hover:border-ring/40 hover:bg-accent" onClick={() => insert(symbol)} aria-label={`Insertar ${symbol}`}>{symbol}</button>)}
    </div>
    <div class="px-5 pt-4"><p class="text-xs font-medium">Escribe con símbolos, piensa en tablas.</p><p id="editor-help" class="mt-1 text-[11px] text-muted">Sintaxis: σ condición (Tabla) · π columnas (Tabla) · ρ alias (Tabla) · relación ⟕ otra. Puedes escribir sigma, pi, rho, join o leftjoin.</p></div>
    <div class="code-editor relative mx-5 my-4 min-h-64 overflow-hidden rounded-lg border border-line bg-[#f9fbf5] focus-within:ring-2 focus-within:ring-brand/25">
      <pre ref={overlay} aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-hidden"><Expression text={expression + '\n'} tables={tables}/></pre>
      <textarea ref={input} id="editor" aria-label="Expresión de álgebra relacional" aria-invalid={!!diagnostic} aria-describedby="editor-help editor-validation" value={expression} onInput={change} spellcheck={false} autoCapitalize="off" autoComplete="off" onScroll={e => { overlay.current.scrollTop = e.currentTarget.scrollTop; overlay.current.scrollLeft = e.currentTarget.scrollLeft; }} onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); onExecute(); } }} class="relative block min-h-64 w-full resize-y bg-transparent caret-brand outline-none"/>
    </div>
    <div id="editor-validation" role="status" aria-live="polite" class={`editor-validation ${diagnostic ? 'has-error' : ''}`}>
      {!checked ? <p>Revisando la expresión…</p> : diagnostic ? <><strong>Revisa tu consulta{diagnostic.position !== undefined ? ` · carácter ${diagnostic.position + 1}` : ''}</strong><p>{diagnostic.message}</p><p><strong>Cómo corregirlo:</strong> {diagnostic.hint}</p>{diagnostic.position !== undefined && <Button variant="ghost" onClick={() => { input.current.focus(); input.current.setSelectionRange(diagnostic.position, diagnostic.position + 1); }}>Señalar en el editor</Button>}</> : <><strong>Expresión válida para esta base.</strong><p>Pulsa «Ejecutar» para ver el resultado. En un ejercicio, «Comprobar» valida si responde al enunciado.</p></>}
    </div>
    <div class="mt-auto flex items-center justify-between gap-3 px-5 pb-5"><span class="text-[10px] text-muted"><kbd>Ctrl</kbd> + <kbd>Enter</kbd></span><Button variant="primary" onClick={onExecute} icon="play">Ejecutar</Button></div>
  </div>;
}
