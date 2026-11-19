import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExerciseDemo } from '../../components/ExerciseDemo';
import { Stepper } from '../../components/Stepper';
import { StatusBadge } from '../../components/StatusBadge';
import { fmt } from '../../components/ExerciseSummary';
import { Timer } from '../../components/Timer';
import {
  clearLog, dueRoutine, finishSession, getSession, logFor, logsOf, openSession, plannedExercises, routinesOf, saveLog, sessionStatus, startSession, useDB,
} from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { humanDuration, sessionDuration } from '../../lib/duration';
import { exerciseFor } from '../../data/exercises';
import { useCurrentUser } from '../../session';
import type { ExerciseLog, PlannedExercise, Prescription } from '../../types';

/**
 * /alumno/entrenar trains the routine that is due; /alumno/sesion/:sessionId reopens a past one to correct it.
 * The session (and its timer) starts with Empezar, or on the first exercise marked if the student skips that.
 */
export function RoutineSession() {
  const db = useDB();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const { sessionId: pastId } = useParams();

  const past = getSession(db, pastId);
  const routine = past ? db.routines.find((r) => r.id === past.routineId) : dueRoutine(db, user.id);
  const open = openSession(db, user.id);
  const session = past ?? (open?.routineId === routine?.id ? open : undefined);

  if (pastId ? past?.studentId !== user.id : !routine) return <Navigate to="/alumno" replace />;

  const logs = session ? logsOf(db, session.id) : [];
  const exercises: PlannedExercise[] = session?.exercises.length
    ? session.exercises
    : routine
      ? plannedExercises(routine)
      : logs.map((l) => ({ id: l.exerciseId, name: l.exerciseName, sets: l.sets, reps: l.reps, weight: l.weight }));
  const position = session?.position ?? routine!.position;
  const name = session?.routineName ?? routine!.name;
  const total = routinesOf(db, user.id).length;
  const sessionFor = () => session?.id ?? startSession(user.id, routine!);

  const pendingWithDemo = (skip?: string) =>
    exercises.find((e) => e.id !== skip && !logFor(db, session?.id, e.id) && exerciseFor(e))?.id;
  const [demoOpen, setDemoOpen] = useState<Set<string>>(() => new Set([pendingWithDemo()].filter((id): id is string => !!id)));
  const toggleDemo = (id: string) =>
    setDemoOpen((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  /** After marking an exercise, its photo closes and the next pending one opens. */
  const advanceDemo = (id: string) =>
    setDemoOpen((s) => {
      const next = new Set(s);
      next.delete(id);
      const following = pendingWithDemo(id);
      if (following) next.add(following);
      return next;
    });

  return (
    <div className="stack">
      <Link to={past ? `/alumno?fecha=${dayOf(past.startedAt)}` : '/alumno'} className="btn-link">‹ Inicio</Link>
      <div className="row-between">
        <h1>Rutina {position}{total ? ` de ${total}` : ''} · {name}</h1>
        {session && <StatusBadge status={sessionStatus(session)} />}
      </div>
      {past && <p className="muted small">{formatDay(dayOf(past.startedAt))}</p>}
      {session && sessionStatus(session) === 'open' && <Timer since={session.startedAt} />}
      {session && sessionDuration(session) !== undefined && (
        <p className="notice ok">Terminaste en {humanDuration(sessionDuration(session)!)}.</p>
      )}
      {!session && (
        <button className="btn btn-block btn-start" onClick={sessionFor}>▶ Empezar</button>
      )}
      {exercises.map((e) => (
        <ExerciseCard
          key={e.id}
          exercise={e}
          log={logFor(db, session?.id, e.id)}
          sessionFor={sessionFor}
          demoOpen={demoOpen.has(e.id)}
          onToggleDemo={() => toggleDemo(e.id)}
          onMarked={() => advanceDemo(e.id)}
        />
      ))}
      {session && sessionStatus(session) === 'open' && (
        <button className="btn btn-block" onClick={() => { finishSession(session.id); navigate(`/alumno/sesion/${session.id}`, { replace: true }); }}>
          Finalizar rutina
        </button>
      )}
    </div>
  );
}

interface CardProps {
  exercise: PlannedExercise;
  log?: ExerciseLog;
  sessionFor: () => string;
  demoOpen: boolean;
  onToggleDemo: () => void;
  onMarked: () => void;
}

function ExerciseCard({ exercise, log, sessionFor, demoOpen, onToggleDemo, onMarked }: CardProps) {
  const demo = exerciseFor(exercise);
  const initial: Prescription = log ?? exercise;
  const [values, setValues] = useState<Prescription>({ sets: initial.sets, reps: initial.reps, weight: initial.weight });
  const [editing, setEditing] = useState(!log);
  const update = (k: keyof Prescription) => (n: number) => setValues((v) => ({ ...v, [k]: n }));

  const mark = (status: ExerciseLog['status']) => {
    saveLog(sessionFor(), exercise, status, values);
    setEditing(false);
    onMarked();
  };

  if (!editing && log) {
    return (
      <article className={`card exercise ${log.status}`}>
        <div className="row-between">
          <div>
            <h3>{log.status === 'done' ? '✓ ' : '– '}{exercise.name}</h3>
            <p className="muted">{log.status === 'done' ? fmt(log) : 'Salteado'}</p>
          </div>
          <div className="row">
            <button className="btn-link" onClick={() => setEditing(true)}>Editar</button>
            <button className="btn-link muted" onClick={() => { clearLog(log.sessionId, exercise.id); setValues(exercise); setEditing(true); }}>
              Deshacer
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="card exercise stack-sm">
      {demo ? (
        <button type="button" className="exercise-head" aria-expanded={demoOpen} onClick={onToggleDemo}>
          <h3>{exercise.name}</h3>
          <span className="muted small">Sugerido {fmt(exercise)}</span>
          <span className={`chevron${demoOpen ? ' is-open' : ''}`} aria-hidden="true">▾</span>
        </button>
      ) : (
        <div className="row-between">
          <h3>{exercise.name}</h3>
          <span className="muted small">Sugerido {fmt(exercise)}</span>
        </div>
      )}
      {demo && demoOpen && <ExerciseDemo exercise={demo} textCollapsed />}
      <div className="steppers">
        <Stepper label="Series" value={values.sets} suggested={exercise.sets} onChange={update('sets')} />
        <Stepper label="Reps" value={values.reps} suggested={exercise.reps} onChange={update('reps')} />
        <Stepper label="Peso" value={values.weight} step={2.5} suffix="kg" suggested={exercise.weight} onChange={update('weight')} />
      </div>
      <div className="row">
        <button className="btn btn-ghost" onClick={() => mark('skipped')}>Saltear</button>
        <button className="btn grow" onClick={() => mark('done')}>Hecho</button>
      </div>
    </article>
  );
}
