import { Link, Navigate, useParams } from 'react-router-dom';
import { ExerciseSummary } from '../../components/ExerciseSummary';
import { StatusBadge } from '../../components/StatusBadge';
import { dueRoutine, getUser, logFor, logsOf, routinesOf, sessionStatus, sessionsOf, useDB } from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { useCurrentUser } from '../../session';

export function StudentPlan() {
  const db = useDB();
  const coach = useCurrentUser();
  const { studentId } = useParams();
  const student = getUser(db, studentId);
  if (!student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  const routines = routinesOf(db, student.id);
  const due = dueRoutine(db, student.id);
  const sessions = sessionsOf(db, student.id);
  const expected = student.daysPerWeek;

  return (
    <div className="stack">
      <Link to="/coach" className="btn-link">‹ Alumnos</Link>
      <div className="row-between">
        <h1>{student.name}</h1>
        <Link to={`/coach/alumno/${student.id}/editar`} className="btn-link">Editar datos</Link>
      </div>

      <section className="stack-sm">
        <div className="row-between">
          <h2>Rutinas</h2>
          <Link to={`/coach/alumno/${student.id}/rutina/agregar`} className="btn-link">+ Rutina</Link>
        </div>
        <p className="muted small">
          Va {expected ?? '?'} {expected === 1 ? 'vez' : 'veces'} por semana. Hace las rutinas en orden y después vuelve a la primera.
        </p>
        {expected !== undefined && routines.length !== expected && (
          <p className="notice">Tiene {routines.length} rutina{routines.length === 1 ? '' : 's'} y va {expected} veces por semana.</p>
        )}
        {routines.map((r) => (
          <article key={r.id} className="card stack-sm">
            <div className="row-between">
              <h3>Rutina {r.position} · {r.name}</h3>
              <div className="row">
                {r.id === due?.id && <span className="badge badge-partial">Le toca</span>}
                <Link to={`/coach/rutina/${r.id}`} className="btn-link">Editar</Link>
              </div>
            </div>
            <ul className="exsum-list">
              {r.exercises.map((e) => <ExerciseSummary key={e.id} name={e.name} exercise={e} />)}
            </ul>
          </article>
        ))}
      </section>

      <section className="stack-sm">
        <h2>Historial</h2>
        {sessions.length === 0 && <p className="empty">Todavía no entrenó.</p>}
        {sessions.map((s) => {
          const routine = routinesOf(db, student.id).find((r) => r.id === s.routineId);
          const logged = logsOf(db, s.id);
          const names = routine?.exercises ?? logged.map((l) => ({ id: l.exerciseId, name: l.exerciseName }));
          return (
            <article key={s.id} className="card stack-sm">
              <div className="row-between">
                <h3>{formatDay(dayOf(s.startedAt))} · Rutina {s.position} · {s.routineName}</h3>
                <StatusBadge status={sessionStatus(s)} />
              </div>
              <ul className="exsum-list">
                {names.map((e) => (
                  <ExerciseSummary
                    key={e.id}
                    name={e.name}
                    exercise={routine?.exercises.find((x) => x.id === e.id)}
                    log={logFor(db, s.id, e.id)}
                  />
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}
