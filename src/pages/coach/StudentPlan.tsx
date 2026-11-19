import { Link, Navigate, useParams } from 'react-router-dom';
import { ExerciseSummary } from '../../components/ExerciseSummary';
import { StatusBadge } from '../../components/StatusBadge';
import {
  customizeNext, dueRoutine, getUser, logFor, logsOf, moveRoutine, openSession, progressOf, routinesOf, sessionStatus, sessionsOf, useDB,
} from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { useCurrentUser } from '../../session';
import type { PlannedExercise } from '../../types';

export function StudentPlan() {
  const db = useDB();
  const coach = useCurrentUser();
  const { studentId } = useParams();
  const student = getUser(db, studentId);
  if (!student || student.coachId !== coach.id) return <Navigate to="/coach" replace />;

  const routines = routinesOf(db, student.id);
  const due = dueRoutine(db, student.id);
  const open = openSession(db, student.id);
  const sessions = sessionsOf(db, student.id);
  const progress = progressOf(db, student.id).filter((p) => p.points.some((x) => x.weight > 0));
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
        {routines.map((r, i) => {
          const startedToday = open?.routineId === r.id;
          return (
            <article key={r.id} className="card stack-sm">
              <div className="row-between">
                <h3>Rutina {r.position} · {r.name}</h3>
                <div className="row">
                  {r.id === due?.id && <span className="badge badge-partial">{startedToday ? 'Entrenando' : 'Le toca'}</span>}
                  <button className="btn-link" aria-label="Subir" disabled={i === 0} onClick={() => moveRoutine(r.id, -1)}>↑</button>
                  <button className="btn-link" aria-label="Bajar" disabled={i === routines.length - 1} onClick={() => moveRoutine(r.id, 1)}>↓</button>
                  <Link to={`/coach/rutina/${r.id}`} className="btn-link">Editar</Link>
                </div>
              </div>
              <ul className="exsum-list">
                {r.exercises.map((e) => <ExerciseSummary key={e.id} name={e.name} exercise={e} />)}
              </ul>
              {r.override && (
                <div className="notice stack-sm">
                  <div className="row-between">
                    <strong>Solo la próxima vez</strong>
                    <button className="btn-link" onClick={() => customizeNext(r.id, null)}>Deshacer</button>
                  </div>
                  <span>{r.override.map((e) => e.name).join(' · ')}</span>
                </div>
              )}
              <Link to={`/coach/rutina/${r.id}/proxima`} className="btn-link small">
                Cambiar ejercicios solo {startedToday ? 'hoy' : 'la próxima vez'}
              </Link>
            </article>
          );
        })}
      </section>

      {progress.length > 0 && (
        <section className="stack-sm">
          <h2>Progreso</h2>
          <article className="card">
            <ul className="exsum-list">
              {progress.map((p) => (
                <li key={p.exercise} className="exsum">
                  <span className="exsum-mark none">↗</span>
                  <span className="exsum-name">{p.exercise}</span>
                  <span className="exsum-values">{p.points.slice(-5).map((x) => `${x.weight}`).join(' → ')} kg</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}

      <section className="stack-sm">
        <h2>Historial</h2>
        {sessions.length === 0 && <p className="empty">Todavía no entrenó.</p>}
        {sessions.map((s) => {
          const planned: PlannedExercise[] = s.exercises.length
            ? s.exercises
            : logsOf(db, s.id).map((l) => ({ id: l.exerciseId, name: l.exerciseName, sets: l.sets, reps: l.reps, weight: l.weight }));
          return (
            <article key={s.id} className="card stack-sm">
              <div className="row-between">
                <h3>{formatDay(dayOf(s.startedAt))} · Rutina {s.position} · {s.routineName}</h3>
                <StatusBadge status={sessionStatus(s)} />
              </div>
              <ul className="exsum-list">
                {planned.map((e) => <ExerciseSummary key={e.id} name={e.name} exercise={e} log={logFor(db, s.id, e.id)} />)}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}
