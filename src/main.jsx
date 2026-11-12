import { render } from 'preact';
import App from './App.jsx';
import { useEffect, useState } from 'preact/hooks';
import { Landing } from './components/Landing.jsx';
import { Playground } from './components/Playground.jsx';
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
  return page === '#laboratorio' ? <App/> : page === '#playground' ? <Playground/> : <Landing/>;
}

render(<Site/>, document.getElementById('app'));
