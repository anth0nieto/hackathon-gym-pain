import { useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ExerciseSummary } from '../../components/ExerciseSummary';
import { StatusBadge } from '../../components/StatusBadge';
import {
  customizeNext, dueRoutine, getUser, logFor, logsOf, moveRoutine, openSession, progressOf, routinesOf, sessionStatus, sessionsOf, useDB,
} from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { useCurrentUser } from '../../session';
import type { PlannedExercise } from '../../types';

const TABS = ['rutinas', 'progreso', 'historial'] as const;
type Tab = (typeof TABS)[number];
const HISTORY_PAGE = 5;

export function StudentPlan() {
  const db = useDB();
  const coach = useCurrentUser();
  const { studentId } = useParams();
  // The tab lives in the URL, so coming back from editing a routine lands on the same tab.
  const [params, setParams] = useSearchParams();
  const tab: Tab = TABS.find((t) => t === params.get('tab')) ?? 'rutinas';
  const [historyPage, setHistoryPage] = useState(0);
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

      <div className="tabs" role="tablist" aria-label="Secciones del alumno">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            id={`tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            className={`tab ${tab === t ? 'is-active' : ''}`}
            onClick={() => setParams(t === 'rutinas' ? {} : { tab: t }, { replace: true })}
          >
            {t === 'rutinas' ? `Rutinas · ${routines.length}` : t === 'progreso' ? 'Progreso' : `Historial · ${sessions.length}`}
          </button>
        ))}
      </div>

      {tab === 'rutinas' && (
      <section className="stack-sm" role="tabpanel" id="panel-rutinas" aria-labelledby="tab-rutinas">
        <div className="row-between">
          <h2>Rutinas</h2>
          <div className="row">
            <Link to={`/coach/planes?alumno=${student.id}`} className="btn-link">Usar un plan</Link>
            <Link to={`/coach/alumno/${student.id}/rutina/agregar`} className="btn-link">+ Rutina</Link>
          </div>
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
      )}

      {tab === 'progreso' && (
        <section className="stack-sm" role="tabpanel" id="panel-progreso" aria-labelledby="tab-progreso">
          {progress.length === 0 && <p className="empty">Todavía no hay pesos registrados.</p>}
          {progress.length > 0 && (
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
          )}
        </section>
      )}

      {tab === 'historial' && (
      <section className="stack-sm" role="tabpanel" id="panel-historial" aria-labelledby="tab-historial">
        {sessions.length === 0 && <p className="empty">Todavía no entrenó.</p>}
        {sessions.slice(historyPage * HISTORY_PAGE, (historyPage + 1) * HISTORY_PAGE).map((s) => {
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
        {sessions.length > HISTORY_PAGE && (
          <nav className="pager" aria-label="Páginas del historial">
            <span className="muted small">
              {historyPage * HISTORY_PAGE + 1}–{Math.min((historyPage + 1) * HISTORY_PAGE, sessions.length)} de {sessions.length}
            </span>
            <div className="row">
              <button className="chip" disabled={historyPage === 0} onClick={() => setHistoryPage(historyPage - 1)}>‹ Más nuevas</button>
              <button className="chip" disabled={(historyPage + 1) * HISTORY_PAGE >= sessions.length} onClick={() => setHistoryPage(historyPage + 1)}>Más viejas ›</button>
            </div>
          </nav>
        )}
      </section>
      )}
    </div>
  );
}
