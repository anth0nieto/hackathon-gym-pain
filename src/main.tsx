import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadDB } from './data/store';
import './styles.css';

const root = createRoot(document.getElementById('root')!);

loadDB()
  .then(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  )
  .catch((e) => {
    console.error(e);
    root.render(<p className="content">No se pudo conectar con la base de datos. Recargá la página.</p>);
  });
