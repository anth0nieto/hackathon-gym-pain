import { Link } from 'react-router-dom';
import { templatesOf, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';

export function Templates() {
  const db = useDB();
  const coach = useCurrentUser();
  const templates = templatesOf(db, coach.id);

  return (
    <div className="stack">
      <Link to="/coach" className="btn-link">‹ Alumnos</Link>
      <div className="row-between">
        <h1>Mis rutinas</h1>
        <Link to="/coach/plantillas/nueva" className="btn">+ Nueva</Link>
      </div>
      <p className="muted">Armalas una vez y asignalas a varios alumnos. Cada alumno recibe su copia, que podés ajustar sin tocar la original.</p>
      {templates.length === 0 && <p className="empty">Todavía no tenés rutinas guardadas.</p>}
      {templates.map((t) => (
        <article key={t.id} className="card stack-sm">
          <div className="row-between">
            <h2>{t.name}</h2>
            <Link to={`/coach/plantillas/${t.id}`} className="btn-link">Editar</Link>
          </div>
          <p className="muted small">{t.exercises.map((e) => `${e.name} ${e.sets}×${e.reps}`).join(' · ')}</p>
          <Link to={`/coach/plantillas/${t.id}/asignar`} className="btn btn-secondary">Asignar a alumnos</Link>
        </article>
      ))}
    </div>
  );
}
