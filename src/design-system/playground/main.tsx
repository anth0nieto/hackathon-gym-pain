import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { demos } from './demos';
import './playground.css';

function currentId() {
  return location.hash.slice(1) || demos[0]?.id;
}

type Theme = 'system' | 'light' | 'dark';

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('ds-theme');
    if (t === 'light' || t === 'dark' || t === 'system') return t;
  } catch {}
  return 'dark';
}

function Playground() {
  const [id, setId] = useState(currentId);
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ds-theme', theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    const onHash = () => setId(currentId());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);
  const demo = demos.find((d) => d.id === id) ?? demos[0];

  return (
    <div className="pg">
      <nav className="pg-nav">
        {demos.map((d) => (
          <a key={d.id} href={`#${d.id}`} aria-current={d.id === demo.id ? 'page' : undefined}>
            {d.name}
          </a>
        ))}
        <label className="pg-theme">
          Tema
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="dark">Oscuro</option>
            <option value="light">Claro</option>
            <option value="system">Sistema</option>
          </select>
        </label>
      </nav>
      <main className="pg-main">
        <h1>{demo.name}</h1>
        <div className="pg-stage">{demo.render()}</div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
