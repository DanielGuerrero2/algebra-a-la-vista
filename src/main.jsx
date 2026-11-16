import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { LabPage } from './pages/LabPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { PlaygroundPage } from './pages/PlaygroundPage.jsx';
import './styles.css';

function Site() {
  const [page, setPage] = useState(location.hash);
  useEffect(() => {
    function navigate() {
      if (!['', '#', '#inicio', '#laboratorio', '#playground'].includes(location.hash)) return;
      setPage(location.hash);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.querySelector(location.hash === '#laboratorio' ? '#workspace' : location.hash === '#playground' ? '#playground-main' : '#inicio')?.focus());
    }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  return page === '#laboratorio' ? <LabPage/> : page === '#playground' ? <PlaygroundPage/> : <LandingPage/>;
}

render(<Site/>, document.getElementById('app'));
