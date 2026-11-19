import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Stepper } from '../../components/Stepper';
import { StatusBadge } from '../../components/StatusBadge';
import { fmt } from '../../components/ExerciseSummary';
import {
  clearLog, dueRoutine, finishSession, getSession, logFor, logsOf, openSession, plannedExercises, routinesOf, saveLog, sessionStatus, startSession, useDB,
} from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { useCurrentUser } from '../../session';
import type { ExerciseLog, PlannedExercise, Prescription } from '../../types';

/**
 * /alumno/entrenar trains the routine that is due; /alumno/sesion/:sessionId reopens a past one to correct it.
 * The session is created on the first exercise the student marks.
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

  return (
    <div className="stack">
      <Link to={past ? `/alumno?fecha=${dayOf(past.startedAt)}` : '/alumno'} className="btn-link">‹ Inicio</Link>
      <div className="row-between">
        <h1>Rutina {position}{total ? ` de ${total}` : ''} · {name}</h1>
        {session && <StatusBadge status={sessionStatus(session)} />}
      </div>
      {past && <p className="muted small">{formatDay(dayOf(past.startedAt))}</p>}
      {exercises.map((e) => (
        <ExerciseCard key={e.id} exercise={e} log={logFor(db, session?.id, e.id)} sessionFor={sessionFor} />
      ))}
      {session && sessionStatus(session) === 'open' && (
        <button className="btn btn-block" onClick={() => { finishSession(session.id); navigate('/alumno'); }}>
          Finalizar rutina
        </button>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, log, sessionFor }: { exercise: PlannedExercise; log?: ExerciseLog; sessionFor: () => string }) {
  const initial: Prescription = log ?? exercise;
  const [values, setValues] = useState<Prescription>({ sets: initial.sets, reps: initial.reps, weight: initial.weight });
  const [editing, setEditing] = useState(!log);
  const update = (k: keyof Prescription) => (n: number) => setValues((v) => ({ ...v, [k]: n }));

  const mark = (status: ExerciseLog['status']) => {
    saveLog(sessionFor(), exercise, status, values);
    setEditing(false);
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
      <div className="row-between">
        <h3>{exercise.name}</h3>
        <span className="muted small">Sugerido {fmt(exercise)}</span>
      </div>
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
