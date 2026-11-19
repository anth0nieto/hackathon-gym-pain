import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ExerciseDemo } from '../../components/ExerciseDemo';
import { fmt } from '../../components/ExerciseSummary';
import { RoutineIcon } from '../../components/RoutineIcon';
import { exerciseFor, type Muscle } from '../../data/exercises';
import { dueRoutine, routinesOf, useDB } from '../../data/store';
import { useCurrentUser } from '../../session';
import type { PlannedExercise, Routine } from '../../types';
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
              <RoutineIcon muscles={muscles} />
              <span className="myplan-info">
                <span className="myplan-name">{r.position} · {r.name}</span>
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
  const [openId, setOpenId] = useState<string>();
  const routine = routinesOf(db, user.id).find((r) => r.id === routineId);
  if (!routine) return <Navigate to="/alumno/plan" replace />;

  return (
    <div className="stack">
      <Link to="/alumno/plan" className="btn-link">‹ Mi plan</Link>
      <div className="row">
        <RoutineIcon muscles={musclesOf(routine)} />
        <div>
          <h1>{routine.position} · {routine.name}</h1>
          <p className="muted">{plural(routine.exercises.length, 'ejercicio', 'ejercicios')} · Tocá uno para ver cómo se hace</p>
        </div>
      </div>
      {routine.override && (
        <p className="notice small">Tu coach cambió algunos ejercicios solo para la próxima vez. Los vas a ver al empezar.</p>
      )}

      <div className="stack-sm">
        {routine.exercises.map((e) => (
          <PlanExercise key={e.id} exercise={e} open={openId === e.id} onToggle={() => setOpenId(openId === e.id ? undefined : e.id)} />
        ))}
      </div>
    </div>
  );
}

function PlanExercise({ exercise, open, onToggle }: { exercise: PlannedExercise; open: boolean; onToggle: () => void }) {
  const demo = exerciseFor(exercise);
  return (
    <article className="card myplan-ex">
      <button type="button" className="myplan-ex-head" aria-expanded={open} onClick={onToggle} disabled={!demo}>
        {demo ? (
          <img className="myplan-thumb" src={demo.images[0]} alt="" loading="lazy" />
        ) : (
          <span className="myplan-thumb is-empty" aria-hidden="true" />
        )}
        <span className="myplan-ex-text">
          <span className="myplan-ex-name">{exercise.name}</span>
          <span className="myplan-ex-dose">{fmt(exercise)}</span>
        </span>
        {demo && <span className={`chevron${open ? ' is-open' : ''}`} aria-hidden="true">▾</span>}
      </button>
      {demo && open && <ExerciseDemo exercise={demo} />}
    </article>
  );
}
