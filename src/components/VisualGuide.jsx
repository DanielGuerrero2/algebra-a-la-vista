import { useId, useMemo, useState } from 'preact/hooks';
import { run } from '../core/engine.js';
import { GUIDE_EXAMPLES } from '../data/guide.js';
import { DataTable } from './DataTable.jsx';
import { Expression } from './Editor.jsx';
import { Button, Icon } from './ui.jsx';

export function VisualGuide({ data, dataset = 0, onLoadExample }) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const [method, setMethod] = useState('visual');
  const example = GUIDE_EXAMPLES[dataset];
  const results = useMemo(() => example.steps.map(step => run(step.expression, data.relations)), [example, data]);
  const step = example.steps[selected];
  const result = results[selected];
  const previous = results[Math.max(0, selected - 1)];
  const removedRows = previous.rows.length - result.rows.length;
  const removedColumns = previous.cols.filter(column => !result.cols.includes(column));
  const symbols = [
    ['σ', 'Selección', 'Conserva las filas que cumplen una condición.', example.steps[1].expression],
    ['π', 'Proyección', 'Elige columnas y elimina filas duplicadas.', example.steps[2].expression],
    ['⋈', 'Join natural', 'Une filas que coinciden en todas las columnas de igual nombre. Sin columnas comunes, combina todas las filas.', example.join],
    ['∪', 'Unión', 'Reúne las filas de ambas relaciones sin repetirlas.'],
    ['−', 'Diferencia', 'Conserva las filas de la primera relación que no están en la segunda.'],
    ['∩', 'Intersección', 'Conserva las filas que aparecen en ambas relaciones.'],
    ['÷', 'División', 'Conserva los valores de la primera relación relacionados con todos los valores del divisor.'],
  ];

  return <div class="visual-guide">
    <div class="guide-intro"><div><p class="eyebrow">GUÍA VISUAL · {data.title}</p><h3>De una tabla a una respuesta.</h3><p>Una consulta transforma una tabla en otra. Sigue el recorrido y observa qué cambia en cada paso.</p></div><span class="guide-intro-mark" aria-hidden="true">σ<span>→</span>π</span></div>
    <div class="guide-goal"><Icon name="table" size={20}/><p><strong>Queremos…</strong> {example.goal}</p></div>
    <div class="guide-flow" role="group" aria-label="Pasos del ejemplo">
      {example.steps.map((item, index) => <button key={item.expression} type="button" aria-pressed={selected === index} aria-controls={`${id}-preview`} onClick={() => setSelected(index)}><span class="guide-step-symbol" aria-hidden="true">{['▦', 'σ', 'π'][index]}</span><span><small>0{index + 1}</small><strong>{item.title}</strong><span>{results[index].rows.length} filas · {results[index].cols.length} columnas</span></span><Icon name="arrow"/></button>)}
    </div>
    <div class="guide-preview" id={`${id}-preview`}>
      <div class="guide-step-copy" aria-live="polite" aria-atomic="true"><p class="eyebrow">PASO {selected + 1} DE {example.steps.length}</p><h3>{step.title}</h3><p>{step.text}</p><div class="guide-expression-wrap"><span>EXPRESIÓN</span><code class="guide-expression"><Expression text={step.expression} tables={data.relations}/></code></div></div>
      <div class="guide-change" aria-label="Qué cambia en este paso" aria-live="polite" aria-atomic="true">
        <div class="guide-change-counts">
          <div><span>Filas</span><strong>{selected ? `${previous.rows.length} → ${result.rows.length}` : result.rows.length}</strong><small>{selected ? `${removedRows} ${removedRows === 1 ? 'fila menos' : 'filas menos'}` : 'en la tabla original'}</small></div>
          <div><span>Columnas</span><strong>{selected ? `${previous.cols.length} → ${result.cols.length}` : result.cols.length}</strong><small>{selected ? `${removedColumns.length} ${removedColumns.length === 1 ? 'columna menos' : 'columnas menos'}` : 'en la tabla original'}</small></div>
        </div>
        <div class="guide-change-columns"><strong>{selected ? 'Columnas de entrada' : 'Columnas de la tabla'}</strong><div class="guide-column-list">{previous.cols.map(column => <span key={column} class={removedColumns.includes(column) ? 'is-removed' : 'is-kept'}>{column}<span class="sr-only">{removedColumns.includes(column) ? ', eliminada' : ', conservada'}</span></span>)}</div>{removedColumns.length > 0 && <p>Las columnas tachadas no aparecen en el resultado.</p>}</div>
      </div>
      <div class="guide-result-heading"><span>RESULTADO DE ESTE PASO</span><strong>{result.rows.length} filas · {result.cols.length} columnas</strong></div>
      <DataTable relation={result} label={`Paso ${selected + 1} de la guía: ${step.title}`} compact/>
      <div class="guide-preview-footer"><span>Ejemplo con datos de la base</span><Button variant="ghost" onClick={() => setSelected((selected + 1) % example.steps.length)}>{selected === example.steps.length - 1 ? 'Volver al inicio' : 'Siguiente paso'} <Icon name={selected === example.steps.length - 1 ? 'reset' : 'arrow'}/></Button></div>
    </div>
    <p class="guide-reading"><strong>Lee de adentro hacia afuera:</strong> primero la tabla entre paréntesis, después σ y al final π. Cada operación usa el resultado de la anterior.</p>

    <section class="guide-syntax" aria-labelledby={`${id}-syntax`}>
      <h3 id={`${id}-syntax`}>La sintaxis, pieza por pieza</h3>
      <dl>
        <div><dt>Selección · filtrar filas</dt><dd><code><b>σ</b> <span>columna &gt; valor</span> <b>(</b>Relación<b>)</b></code><p>Escribe el símbolo, una condición completa y la relación entre paréntesis.</p></dd></div>
        <div><dt>Proyección · elegir columnas</dt><dd><code><b>π</b> <span>columna, otraColumna</span> <b>(</b>Relación<b>)</b></code><p>Separa las columnas con comas y usa sus nombres exactos, sin comillas.</p></dd></div>
        <div><dt>Join · conectar tablas</dt><dd><code>Relación <b>⋈</b> OtraRelación</code><p>Escribe una relación a cada lado. El enlace usa las columnas que tienen el mismo nombre.</p></dd></div>
      </dl>
      <p>«Relación», «columna» y «valor» son marcadores: sustitúyelos por nombres y datos de tu base, como en el ejemplo de arriba.</p>
    </section>

    <section class="guide-execution" aria-labelledby={`${id}-execute`}>
      <div class="guide-section-heading"><span class="guide-section-number" aria-hidden="true">↗</span><div><p class="eyebrow">AHORA, EN EL LABORATORIO</p><h3 id={`${id}-execute`}>Cómo ejecutar tu consulta</h3></div></div>
      <div class="guide-methods" role="group" aria-label="Forma de construir la consulta">{[['visual', 'Constructor visual'], ['code', 'Editor de símbolos']].map(([value, label]) => <button key={value} type="button" aria-pressed={method === value} aria-controls={`${id}-instructions`} onClick={() => setMethod(value)}>{label}</button>)}</div>
      <ol id={`${id}-instructions`} class="guide-instructions">
        {method === 'visual' ? <>
          <li><strong>Elige tu base y tabla inicial.</strong> Abre una base en la navegación, entra en Práctica libre y selecciona la tabla del ejemplo.</li>
          <li><strong>Configura una operación.</strong> En Constructor visual, elige Selección para filtrar filas o Proyección para elegir columnas. Revisa la vista previa.</li>
          <li><strong>Pulsa «Añadir paso».</strong> Aplica la operación y ejecuta la consulta. Puedes añadir otra operación sobre ese resultado.</li>
          <li><strong>Pulsa «Ejecutar y ver resultado».</strong> Recorre los pasos para comparar la tabla inicial y cada transformación.</li>
        </> : <>
          <li><strong>Elige la base del ejemplo.</strong> Abre Editor de símbolos y escribe la expresión completa que aparece abajo.</li>
          <li><strong>Inserta los símbolos.</strong> Usa los botones del editor o escribe <code>sigma</code>, <code>pi</code> o <code>join</code>; se convierten automáticamente.</li>
          <li><strong>Revisa y pulsa «Ejecutar».</strong> El editor señala errores y explica cómo corregirlos al dejar de escribir. También puedes ejecutar con <kbd>Ctrl</kbd> + <kbd>Enter</kbd> o <kbd>⌘</kbd> + <kbd>Enter</kbd>.</li>
          <li><strong>Explora «Resultado».</strong> Revisa las filas y el recorrido de la consulta. Si estás resolviendo un ejercicio, pulsa «Comprobar» para validar tu respuesta.</li>
        </>}
      </ol>
      <code class="guide-expression"><Expression text={example.steps[2].expression} tables={data.relations}/></code>
      {onLoadExample ? <div class="guide-action"><Button variant="primary" icon="play" onClick={() => onLoadExample(example.steps[2].expression)}>Cargar ejemplo en el editor</Button><p>Reemplaza el texto de tu consulta actual. Después, pulsa «Ejecutar».</p></div>
        : <div class="guide-action"><Button variant="primary" onClick={() => { window.location.hash = '#laboratorio'; }}>Ir al laboratorio <Icon name="arrow"/></Button><p>Encontrarás esta guía en el botón «Guía» del laboratorio.</p></div>}
    </section>

    <details class="guide-reference"><summary>Diccionario de símbolos <span class="math" aria-hidden="true">σ π ⋈</span></summary><div class="guide-symbols">{symbols.map(([symbol, title, text, expression]) => <article key={symbol}><span class="math" aria-hidden="true">{symbol}</span><div><h3>{title} <span class="sr-only">{symbol}</span></h3><p>{text}</p>{expression && <code>{expression}</code>}</div></article>)}<p class="guide-set-note">Para ∪, − e ∩, ambas relaciones deben tener las mismas columnas y tipos de datos.</p></div></details>
    <details class="guide-reference"><summary>Si una consulta no sale como esperabas <Icon name="help"/></summary><ul class="guide-tips"><li>Respeta los nombres de tablas y columnas, incluidas mayúsculas y minúsculas. Puedes consultar las tablas originales desde la navegación.</li><li>Escribe texto entre comillas simples, como <code>'Chih'</code>, y números sin comillas ni separadores, como <code>1000000</code>.</li><li>Cierra todos los paréntesis. Combina condiciones con <code>and</code> (todas) u <code>or</code> (alguna).</li><li>Una tabla vacía puede ser un resultado válido: ninguna fila cumple la condición.</li><li>Usa Deshacer y Rehacer para recorrer tus consultas ejecutadas. Las tablas originales se conservan.</li></ul></details>
  </div>;
}
