import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { LabPage } from './pages/LabPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { PlaygroundPage } from './pages/PlaygroundPage.jsx';
import { FirstQueryPage } from './pages/FirstQueryPage.jsx';
import './styles.css';
import './landing.css';

const destinations = {
  '': '#landing-main',
  '#': '#landing-main',
  '#inicio': '#landing-main',
  '#primera-consulta': '#first-query-main',
  '#laboratorio': '#workspace',
  '#playground': '#playground-main',
};

function Site() {
  const [page, setPage] = useState(location.hash);
  useEffect(() => {
    function navigate() {
      const hash = location.hash;
      if (hash === '#guia' || hash === '#operaciones') {
        setPage('#inicio');
        requestAnimationFrame(() => {
          const section = document.getElementById(hash.slice(1));
          section?.scrollIntoView();
          section?.focus({ preventScroll: true });
        });
        return;
      }
      const destination = destinations[hash];
      if (!Object.hasOwn(destinations, hash)) return;
      setPage(hash);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.querySelector(destination)?.focus({ preventScroll: true }));
    }
    window.addEventListener('hashchange', navigate);
    if (location.hash === '#guia' || location.hash === '#operaciones') navigate();
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  if (page === '#primera-consulta') return <FirstQueryPage/>;
  return page === '#laboratorio' ? <LabPage/> : page === '#playground' ? <PlaygroundPage/> : <LandingPage/>;
}

render(<Site/>, document.getElementById('app'));
