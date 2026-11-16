import { useState } from 'preact/hooks';
import datasets from '../data/datasets.json';
import { run } from '../core/engine.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { LandingHero, LandingDemo, LandingGuide, LandingMethod, LandingFooter } from '../components/LandingSections.jsx';

export function LandingPage() {
  const [minimum, setMinimum] = useState(1000000);
  const exerciseTotal = datasets.reduce((total, dataset) => total + dataset.exercises.length, 0);
  const result = run(`π ciudad, precio (σ precio > ${minimum} (Casa))`, datasets[0].relations);

  return <div class="landing">
    <a class="landing-skip" href="#inicio">Ir al contenido</a>
    <SiteHeader current="inicio" className="landing-nav" beforeNavigation={<a href="#guia" class="landing-guide-link">Primero, ver la guía <span aria-hidden="true">↓</span></a>}/>
    <main id="inicio" tabIndex={-1}>
      <LandingHero exerciseTotal={exerciseTotal} datasetTotal={datasets.length}/>
      <LandingDemo minimum={minimum} onMinimumChange={setMinimum} rows={result.rows}/>
      <LandingGuide data={datasets[0]}/>
      <LandingMethod/>
    </main>
    <LandingFooter/>
  </div>;
}
