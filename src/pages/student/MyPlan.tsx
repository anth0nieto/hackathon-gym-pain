import { Link, Navigate, useParams } from 'react-router-dom';
import { fmt } from '../../components/ExerciseSummary';
import { exerciseFor, type Muscle } from '../../data/exercises';
import { dueRoutine, routinesOf, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';
import type { Routine } from '../../types';
import '../../components/exercises.css';
import './MyPlan.css';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Muscles a routine works, in the order they first appear. */
function musclesOf(routine: Routine): Muscle[] {
  const found = routine.exercises.map((e) => exerciseFor(e)?.muscle).filter((m): m is Muscle => !!m);
  return [...new Set(found)];
}

/** The student's routines for the week, read only. */
export function MyPlan() {
  const db = useDB();
  const user = useCurrentUser();
  const routines = routinesOf(db, user.id);
  const due = dueRoutine(db, user.id);

  return (
    <div className="stack">
      <div>
        <h1>Mi plan</h1>
        <p className="muted">Tus rutinas de la semana. Las hacés en orden y después volvés a la primera.</p>
      </div>

      {routines.length === 0 && <p className="empty">Tu coach todavía no te armó rutinas.</p>}

      <div className="stack-sm">
        {routines.map((r) => {
          const muscles = musclesOf(r);
          return (
            <Link key={r.id} to={`/alumno/plan/${r.id}`} className="myplan-routine">
              <span className="myplan-badge" aria-hidden="true">{r.position}</span>
              <span className="myplan-info">
                <span className="myplan-name">{r.name}</span>
                <span className="muted small">
                  {plural(r.exercises.length, 'ejercicio', 'ejercicios')}
                  {muscles.length > 0 && ` · ${muscles.join(', ')}`}
                </span>
              </span>
              {r.id === due?.id && <span className="badge badge-partial">Te toca</span>}
              <span className="myplan-chevron" aria-hidden="true">›</span>
            </Link>
          );
        })}
      </div>

      {routines.length > 0 && <p className="muted small">Tocá una rutina para ver sus ejercicios.</p>}
    </div>
  );
}

/** One routine of the plan: what to do and how, without logging anything. */
export function MyPlanRoutine() {
  const db = useDB();
  const user = useCurrentUser();
  const { routineId } = useParams();
  const routines = routinesOf(db, user.id);
  const routine = routines.find((r) => r.id === routineId);
  if (!routine) return <Navigate to="/alumno/plan" replace />;

  return (
    <div className="stack">
      <Link to="/alumno/plan" className="btn-link">‹ Mi plan</Link>
      <div>
        <h1>Rutina {routine.position} · {routine.name}</h1>
        <p className="muted">{plural(routine.exercises.length, 'ejercicio', 'ejercicios')}</p>
      </div>
      {routine.override && (
        <p className="notice small">Tu coach cambió algunos ejercicios solo para la próxima vez. Los vas a ver al empezar.</p>
      )}

      <div className="stack-sm">
        {routine.exercises.map((e) => {
          const demo = exerciseFor(e);
          return (
            <article key={e.id} className="card myplan-ex">
              {demo ? (
                <div className="myplan-thumb">
                  <img src={demo.images[0]} alt={`${demo.alias}: posición inicial`} loading="lazy" />
                  <img src={demo.images[1]} alt="" aria-hidden="true" loading="lazy" />
                </div>
              ) : (
                <div className="myplan-thumb is-empty" aria-hidden="true" />
              )}
              <div className="myplan-ex-text">
                <h3>{e.name}</h3>
                <p className="myplan-ex-dose">{fmt(e)}</p>
                {demo && <p className="muted small">{demo.description}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
