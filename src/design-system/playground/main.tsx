import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { demos } from './demos';
import './playground.css';

function currentId() {
  return location.hash.slice(1) || demos[0]?.id;
}

function Playground() {
  const [id, setId] = useState(currentId);
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
