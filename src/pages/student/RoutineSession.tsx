import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Stepper } from '../../components/Stepper';
import { StatusBadge } from '../../components/StatusBadge';
import { fmt } from '../../components/ExerciseSummary';
import { clearLog, logFor, routineStatus, saveLog, skipRoutine, useDB } from '../../data/store';
import { formatDay } from '../../lib/dates';
import { useCurrentUser } from '../../session';
import type { ExerciseLog, PlannedExercise, Prescription } from '../../types';

export function RoutineSession() {
  const db = useDB();
  const user = useCurrentUser();
  const { routineId } = useParams();
  const routine = db.routines.find((r) => r.id === routineId && r.studentId === user.id);
  if (!routine) return <Navigate to="/alumno" replace />;

  const status = routineStatus(db, routine);

  return (
    <div className="stack">
      <Link to={`/alumno?fecha=${routine.date}`} className="btn-link">‹ {formatDay(routine.date)}</Link>
      <div className="row-between">
        <h1>{routine.name}</h1>
        <StatusBadge status={status} />
      </div>
      {routine.exercises.map((e) => (
        <ExerciseCard key={e.id} routineId={routine.id} exercise={e} log={logFor(db, routine.id, e.id)} />
      ))}
      {status === 'pending' && (
        <button className="btn btn-block btn-ghost" onClick={() => confirm('¿Saltear toda la rutina?') && skipRoutine(routine)}>
          Hoy no entreno — saltear rutina
        </button>
      )}
    </div>
  );
}

function ExerciseCard({ routineId, exercise, log }: { routineId: string; exercise: PlannedExercise; log?: ExerciseLog }) {
  const initial: Prescription = log ?? exercise;
  const [values, setValues] = useState<Prescription>({ sets: initial.sets, reps: initial.reps, weight: initial.weight });
  const [editing, setEditing] = useState(!log);
  const update = (k: keyof Prescription) => (n: number) => setValues((v) => ({ ...v, [k]: n }));

  const mark = (status: ExerciseLog['status']) => {
    saveLog(routineId, exercise.id, status, values);
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
            <button className="btn-link muted" onClick={() => { clearLog(routineId, exercise.id); setValues(exercise); setEditing(true); }}>
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
