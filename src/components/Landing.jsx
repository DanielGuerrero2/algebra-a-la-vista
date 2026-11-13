import { useState } from 'preact/hooks';
import datasets from '../data/datasets.json';
import { run } from '../core/engine.js';
import { Button } from './ui/button.jsx';
import { Card, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { BrandIcon } from './BrandIcon.jsx';
import { VisualGuide } from './VisualGuide.jsx';

export function Landing() {
  const [minimum, setMinimum] = useState(1000000);
  const exerciseTotal = datasets.reduce((total, dataset) => total + dataset.exercises.length, 0);
  const result = run(`π ciudad, precio (σ precio > ${minimum} (Casa))`, datasets[0].relations);
  return <div class="landing">
    <a class="landing-skip" href="#inicio">Ir al contenido</a>
    <header class="landing-nav">
      <a class="landing-brand" href="#" aria-label="Álgebra a la vista, inicio"><BrandIcon className="landing-mark"/>Álgebra a la vista<span class="landing-dot">.</span></a>
      <nav class="landing-nav-actions" aria-label="Navegación principal">
        <a href="#guia" class="landing-guide-link">Primero, ver la guía <span aria-hidden="true">↓</span></a>
        <Button asChild size="sm"><a href="#laboratorio">Entrar al laboratorio <span aria-hidden="true">↗</span></a></Button>
        <Button asChild variant="outline" size="sm"><a href="#playground">Playground</a></Button>
      </nav>
    </header>
    <main id="inicio" tabIndex={-1}>
      <section class="landing-hero" aria-labelledby="landing-title">
        <div class="landing-intro">
          <div class="landing-hero-identity">
            <p class="landing-chapter">01 / EL LABORATORIO ESTÁ ABIERTO</p>
            <h1 id="landing-title">De los símbolos<br/>a los <em>resultados.</em></h1>
            <Badge variant="outline" className="landing-hero-badge"><span class="size-1.5 rounded-full bg-primary" aria-hidden="true"/> Tu espacio de álgebra relacional</Badge>
            <p class="landing-description">El álgebra relacional se entiende mejor cuando puedes verla. Construye consultas, explora cada operación y descubre qué pasa con tus datos.</p>
            <p class="landing-note">Sin registro. A tu ritmo. Desde tu navegador.</p>
            <div class="landing-facts"><span><strong>{exerciseTotal}</strong> ejercicios guiados</span><span><strong>{datasets.length}</strong> bases de ejemplo</span></div>
          </div>
          <div class="landing-hero-content">
            <figure class="landing-illustration">
              <img src={`${import.meta.env.BASE_URL}assets/brand/brand-icon-cartoon-880.webp`} width="880" height="880" alt="Ilustración de una base de datos verde con dos tablas conectadas por un enlace dorado." fetchPriority="high"/>
            </figure>
          </div>
        </div>
      </section>
      <section class="landing-demo-section" aria-labelledby="demo-title">
        <div class="landing-demo-intro">
          <p class="eyebrow">DE LA IDEA A LA CONSULTA</p>
          <h2 id="demo-title">Un pequeño cambio.<br/>Un resultado diferente.</h2>
          <p>Cambia el precio del ejemplo y observa cómo se filtran las filas. En el laboratorio podrás combinar operaciones y explorar cada paso.</p>
          <img class="landing-demo-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-delfin-datos-420.webp`} width="420" height="384" alt="" loading="lazy" decoding="async"/>
        </div>
        <Card className="landing-demo">
          <div class="landing-demo-top"><span>Vista previa del laboratorio</span><Badge variant="secondary">Interactivo</Badge></div>
          <CardContent className="landing-demo-body">
            <div class="landing-demo-label"><span>01 / SELECCIONA</span><span>Base Inmobiliaria</span></div>
            <h2>Casas con precio mayor a…</h2>
            <div class="landing-options" role="group" aria-label="Precio mínimo de la demostración">{[1000000, 2000000].map(value => <Button key={value} size="sm" variant={minimum === value ? 'default' : 'outline'} aria-pressed={minimum === value} onClick={() => setMinimum(value)}>{value === 1000000 ? '$1 millón' : '$2 millones'}</Button>)}</div>
            <code class="landing-query">π ciudad, precio<br/>(σ precio &gt; {minimum} (Casa))</code>
            <div class="landing-demo-label"><span>02 / OBSERVA EL RESULTADO</span><span role="status" aria-live="polite">{result.rows.length} filas</span></div>
            <div class="landing-table-wrap"><table class="landing-table"><caption class="sr-only">Ciudades y precios de casas que superan el precio seleccionado</caption><thead><tr><th scope="col">ciudad</th><th scope="col">precio</th></tr></thead><tbody>{result.rows.map(row => <tr key={`${row.ciudad}:${row.precio}`}><td>{row.ciudad}</td><td>${row.precio.toLocaleString('es-MX')}</td></tr>)}</tbody></table></div>
            {result.rows.length === 0 && <p class="landing-demo-hint">Ninguna casa supera este precio. Prueba con $1 millón.</p>}
            <p class="landing-demo-hint">Prueba otro precio y observa cómo cambia la tabla.</p>
          </CardContent>
          <div class="landing-demo-bottom"><span aria-hidden="true">↳</span> Los símbolos transforman los datos. Tú ves cómo.</div>
        </Card>
      </section>
      <section id="guia" class="landing-guide" aria-labelledby="guide-title" tabIndex={-1}>
        <div class="landing-guide-heading"><div><p class="eyebrow">TU PRIMERA CONSULTA, PASO A PASO</p><h2 id="guide-title">Entiende los símbolos.<br/>Sigue los datos.</h2></div><div class="landing-guide-aside"><p>Empieza por una tabla y descubre cómo se construye una expresión. Después compara las entradas y resultados de otras cinco operaciones.</p><img class="landing-guide-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-construir-expresion-520.webp`} width="520" height="222" alt="Una tabla inicial pasa por una pieza de filtro colocada en un constructor visual y produce una tabla con menos filas." loading="lazy" decoding="async"/></div></div>
        <VisualGuide data={datasets[0]}/>
      </section>
      <section class="landing-method" aria-label="Cómo funciona el laboratorio">
        {[['01', 'Construye', 'Elige una tabla y aplica operaciones con el constructor visual o el editor de símbolos.'], ['02', 'Explora', 'Recorre los pasos de tu consulta y observa cómo se transforma cada relación.'], ['03', 'Comprueba', 'Resuelve ejercicios de las cuatro bases con pistas para avanzar.']].map(([number, title, description]) => <article key={number}><span class="landing-step">{number}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}
      </section>
    </main>
    <footer class="landing-footer">
      <div class="landing-footer-main">
        <div class="landing-footer-copy">
          <p class="landing-footer-eyebrow">ÁLGEBRA A LA VISTA</p>
          <h2>Haz visible lo que<br/>hacen tus consultas.</h2>
          <p>Construye, ejecuta y comprende cada paso con tus propios datos.</p>
        </div>
        <img class="landing-footer-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-leon-marino-terminal-400.webp`} width="400" height="267" alt="" loading="lazy" decoding="async"/>
      </div>
      <div class="landing-footer-bottom">
        <span>Álgebra a la vista · Aprende, prueba, comprende.</span>
        <nav aria-label="Enlaces del pie de página"><a href="#inicio">Inicio</a><a href="#guia">Guía visual</a><a href="#operaciones">Operaciones</a><a href="#laboratorio">Laboratorio</a><a href="#playground">Playground</a></nav>
        <span>Tu progreso se guarda en este navegador.</span>
      </div>
    </footer>
  </div>;
}
