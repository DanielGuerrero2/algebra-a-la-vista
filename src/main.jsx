import { render } from 'preact';
import App from './App.jsx';
import { useEffect, useState } from 'preact/hooks';
import { Landing } from './components/Landing.jsx';
import './styles.css';

function Site() {
  const [laboratory, setLaboratory] = useState(location.hash === '#laboratorio');
  useEffect(() => {
    function navigate() {
      if (!['', '#', '#inicio', '#laboratorio'].includes(location.hash)) return;
      setLaboratory(location.hash === '#laboratorio');
      window.scrollTo(0, 0);
      requestAnimationFrame(() => document.querySelector(location.hash === '#laboratorio' ? '#workspace' : '#inicio')?.focus());
    }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  return laboratory ? <App/> : <Landing/>;
}

render(<Site/>, document.getElementById('app'));
