import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { dueRoutine, openSession, sessionStatus, sessionsOf, useDB } from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { useCurrentUser } from '../../session';

/** Student home: the routine they have to do now, and the ones they already did. */
export function StudentDay() {
  const db = useDB();
  const user = useCurrentUser();
  const due = dueRoutine(db, user.id);
  const started = openSession(db, user.id)?.routineId === due?.id;
  const history = sessionsOf(db, user.id);

  return (
    <div className="stack">
      {!due && <p className="empty">Tu coach todavía no te armó rutinas.</p>}
      {due && (
        <section className="card stack-sm">
          <p className="muted small">Te toca</p>
          <h1>Rutina {due.position} · {due.name}</h1>
          <p className="muted">{due.exercises.map((e) => e.name).join(' · ')}</p>
          <Link to="/alumno/entrenar" className="btn btn-block">{started ? 'Seguir' : 'Empezar'}</Link>
        </section>
      )}
      {history.length > 0 && (
        <section className="stack-sm">
          <h2>Lo que hiciste</h2>
          {history.map((s) => (
            <Link key={s.id} to={`/alumno/sesion/${s.id}`} className="card card-link row-between">
              <span>{formatDay(dayOf(s.startedAt))} · Rutina {s.position} · {s.routineName}</span>
              <StatusBadge status={sessionStatus(s)} />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
