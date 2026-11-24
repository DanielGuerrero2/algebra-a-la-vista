import { Button } from './ui/button.jsx';
import { Card, CardContent } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';
import { DataTable } from './DataTable.jsx';
import { Icon } from './ui.jsx';
import { VisualGuide } from './VisualGuide.jsx';

export function LandingHero({ exerciseTotal, datasetTotal }) {
  return <section class="landing-hero" aria-labelledby="landing-title">
    <div class="landing-intro">
      <div class="landing-hero-identity">
        <p class="landing-chapter">ÁLGEBRA RELACIONAL INTERACTIVA</p>
        <h1 id="landing-title">De los símbolos<br/>a los <em>resultados.</em></h1>
        <p class="landing-description">Aprende a filtrar filas, elegir columnas y conectar tablas. Empieza con un ejemplo guiado y observa cómo cambian los datos en cada paso.</p>
        <div class="landing-hero-actions">
          <Button asChild className="landing-primary"><a href="#guia">Empezar con la guía <Icon name="book"/></a></Button>
          <a href="#laboratorio" class="landing-guide-link">Ir a los retos <Icon name="arrow"/></a>
        </div>
        <div class="landing-facts"><span><strong>{exerciseTotal}</strong> ejercicios guiados</span><span><strong>{datasetTotal}</strong> bases de ejemplo</span></div>
      </div>
      <div class="landing-hero-content"><figure class="landing-illustration"><img src={`${import.meta.env.BASE_URL}assets/brand/brand-icon-cartoon-880.webp`} width="880" height="880" alt="Ilustración de una base de datos verde con dos tablas conectadas por un enlace dorado." fetchPriority="high"/></figure></div>
    </div>
  </section>;
}

export function LandingDemo({ minimum, onMinimumChange, expression, result }) {
  const [beforePrice, afterPrice] = expression.split(String(minimum));
  return <section class="landing-demo-section" aria-labelledby="demo-title">
    <div class="landing-demo-intro">
      <p class="eyebrow">DE LA IDEA A LA CONSULTA</p>
      <h2 id="demo-title">Un pequeño cambio.<br/><em>Un resultado diferente.</em></h2>
      <p>Cambia el precio del ejemplo y observa cómo se filtran las filas.</p>
      <img class="landing-demo-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-delfin-datos-420.webp`} width="420" height="384" alt="" loading="lazy" decoding="async"/>
    </div>
    <Card className="landing-demo">
      <div class="landing-demo-top"><span><Icon name="code"/> Consulta de ejemplo</span><Badge variant="secondary">Inmobiliaria</Badge></div>
      <CardContent className="landing-demo-body">
        <h3>Casas con precio mayor a…</h3>
        <div class="landing-options" role="group" aria-label="Precio mínimo de la demostración">{[1000000, 2000000].map(value => <Button key={value} size="sm" variant={minimum === value ? 'default' : 'outline'} aria-pressed={minimum === value} onClick={() => onMinimumChange(value)}>{value === 1000000 ? '$1 millón' : '$2 millones'}</Button>)}</div>
        <code class="landing-query">{beforePrice}<mark class="landing-query-price">{minimum}</mark>{afterPrice}</code>
        <div class="landing-demo-label"><strong>Resultado</strong><span role="status">{result.rows.length} {result.rows.length === 1 ? 'fila' : 'filas'}</span></div>
        <DataTable relation={result} label="Ciudades y precios que superan el precio seleccionado" compact formatCell={(value, column) => column === 'precio' ? '$' + value.toLocaleString('es-MX') : value} emptyMessage="Prueba con un precio menor."/>
        <div class="landing-demo-action">
          <Button asChild className="landing-primary"><a href="#primera-consulta">Haz tu primera consulta <Icon name="arrow"/></a></Button>
          <p>Practica con la tabla Casa ya cargada.</p>
        </div>
      </CardContent>
    </Card>
  </section>;
}

export function LandingGuide({ data }) {
  return <section id="guia" class="landing-guide" aria-labelledby="guide-title" tabIndex={-1}>
    <div class="landing-guide-heading">
      <div>
        <p class="eyebrow">TU PRIMERA CONSULTA, PASO A PASO</p>
        <h2 id="guide-title">Entiende los símbolos.<br/><em>Sigue los datos.</em></h2>
        <p>Empieza por una tabla y descubre cómo se construye una expresión. Después compara las entradas y resultados de otras cinco operaciones.</p>
      </div>
      <img class="landing-guide-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-construir-expresion-520.webp`} width="520" height="222" alt="Una tabla inicial pasa por una pieza de filtro colocada en un constructor visual y produce una tabla con menos filas." loading="lazy" decoding="async"/>
    </div>
    <VisualGuide data={data}/>
  </section>;
}

export function LandingMethod() {
  return <section class="landing-method" aria-labelledby="landing-method-title">
    <div class="landing-method-heading">
      <h2 id="landing-method-title">Cómo funciona el laboratorio</h2>
      <Button asChild className="landing-primary"><a href="#laboratorio">Practicar en el laboratorio <Icon name="arrow"/></a></Button>
    </div>
    <div class="landing-method-steps">
      {[
        ['code', 'Construye', 'Elige una tabla y aplica operaciones con el constructor visual o el editor de símbolos.'],
        ['table', 'Explora', 'Recorre los pasos de tu consulta y observa cómo se transforma cada relación.'],
        ['check', 'Comprueba', 'Resuelve ejercicios con pistas para avanzar.'],
      ].map(([icon, title, description]) => <article key={title}>
        <span class="landing-step"><Icon name={icon}/></span>
        <div><h3>{title}</h3><p>{description}</p></div>
      </article>)}
    </div>
  </section>;
}

export function LandingFooter() {
  return <footer class="landing-footer">
    <div class="landing-footer-main">
      <div class="landing-footer-copy">
        <p class="landing-footer-eyebrow">ÁLGEBRA A LA VISTA</p>
        <h2>Haz visible lo que hacen tus consultas.</h2>
        <p>Construye, ejecuta y comprende cada paso con tus propios datos.</p>
      </div>
      <img class="landing-footer-art" src={`${import.meta.env.BASE_URL}assets/illustrations/ilustracion-leon-marino-terminal-400.webp`} width="400" height="267" alt="" loading="lazy" decoding="async"/>
    </div>
    <div class="landing-footer-bottom">
      <span>Álgebra a la vista · Aprende, prueba, comprende.</span>
      <nav aria-label="Enlaces del pie de página">
        <a href="#inicio">Inicio</a><a href="#guia">Guía visual</a><a href="#operaciones">Operaciones</a><a href="#laboratorio">Laboratorio</a><a href="#playground">Playground</a>
      </nav>
      <span>Tu progreso se guarda en este navegador.</span>
    </div>
  </footer>;
}
