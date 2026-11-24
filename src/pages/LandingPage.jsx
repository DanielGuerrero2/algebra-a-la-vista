import { useState } from 'preact/hooks';
import datasets from '../data/datasets.json';
import { run } from '../core/engine.js';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { LandingHero, LandingDemo, LandingGuide, LandingMethod, LandingFooter } from '../components/LandingSections.jsx';

export function LandingPage() {
  const [minimum, setMinimum] = useState(1000000);
  const exerciseTotal = datasets.reduce((total, dataset) => total + dataset.exercises.length, 0);
  const expression = `π ciudad, precio (σ precio > ${minimum} (Casa))`;
  const result = run(expression, datasets[0].relations);

  return <div class="landing">
    <SiteHeader current="inicio" mainId="landing-main"/>
    <main id="landing-main" tabIndex={-1}>
      <LandingHero exerciseTotal={exerciseTotal} datasetTotal={datasets.length}/>
      <LandingDemo minimum={minimum} onMinimumChange={setMinimum} expression={expression} result={result}/>
      <LandingGuide data={datasets[0]}/>
      <LandingMethod/>
    </main>
    <LandingFooter/>
  </div>;
}
