import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ExerciseDemo } from '../../components/ExerciseDemo';
import { Stepper } from '../../components/Stepper';
import { StatusBadge } from '../../components/StatusBadge';
import { fmt, fmtLog } from '../../components/ExerciseSummary';
import { RestTimer, REST_MS } from '../../components/RestTimer';
import { Timer } from '../../components/Timer';
import {
  cancelSession, clearLog, dueRoutine, finishSession, getSession, logFor, logsOf, openSession, plannedExercises, routinesOf, saveLog, sessionStatus, startSession, useDB,
} from '../../data/store';
import { dayOf, formatDay } from '../../lib/dates';
import { humanDuration, sessionDuration } from '../../lib/duration';
import { exerciseFor } from '../../data/exercises';
import { lastWeight } from '../../data/history';
import { useCurrentUser } from '../../session';
import type { ExerciseLog, PlannedExercise, SetDetail } from '../../types';
import './sets.css';

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
  const [restUntil, setRestUntil] = useState<number | null>(null);

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
          lastWeight={lastWeight(db, user.id, e, session?.id)}
          sessionFor={sessionFor}
          demoOpen={demoOpen.has(e.id)}
          onToggleDemo={() => toggleDemo(e.id)}
          onMarked={() => advanceDemo(e.id)}
          onSetChecked={() => setRestUntil(Date.now() + REST_MS)}
        />
      ))}
      {session && sessionStatus(session) === 'open' && (
        <button className="btn btn-block" onClick={() => { finishSession(session.id); navigate(`/alumno/sesion/${session.id}`, { replace: true }); }}>
          Finalizar rutina
        </button>
      )}
      {session && sessionStatus(session) === 'open' && !past && (
        <button
          type="button"
          className="btn btn-block btn-cancel"
          onClick={() => { cancelSession(session.id); navigate('/alumno', { replace: true }); }}
        >
          Cancelar rutina
        </button>
      )}
      {restUntil !== null && (
        <>
          <div className="rest-spacer" aria-hidden="true" />
          <RestTimer until={restUntil} onChange={setRestUntil} onClose={() => setRestUntil(null)} />
        </>
      )}
    </div>
  );
}

interface CardProps {
  exercise: PlannedExercise;
  log?: ExerciseLog;
  /** What the student lifted the last time they did this exercise, in any routine. */
  lastWeight?: number;
  sessionFor: () => string;
  demoOpen: boolean;
  onToggleDemo: () => void;
  onMarked: () => void;
  onSetChecked: () => void;
}

/** One row per set: the saved sets, or the suggested ones with the weight the student lifted last time. */
type SetRow = SetDetail & { checked: boolean };

/** One row per set: the saved sets (already checked), or the suggested ones with the weight the student lifted last time. */
function initialSets(exercise: PlannedExercise, log: ExerciseLog | undefined, lastWeight: number | undefined): SetRow[] {
  const checked = log?.status === 'done';
  if (log?.setDetails?.length) return log.setDetails.map((s) => ({ reps: s.reps, weight: s.weight, checked }));
  const base = log ?? { sets: exercise.sets, reps: exercise.reps, weight: lastWeight ?? exercise.weight };
  return Array.from({ length: Math.max(1, base.sets) }, () => ({ reps: base.reps, weight: base.weight, checked }));
}

function ExerciseCard({ exercise, log, lastWeight, sessionFor, demoOpen, onToggleDemo, onMarked, onSetChecked }: CardProps) {
  const demo = exerciseFor(exercise);
  const [sets, setSets] = useState<SetRow[]>(() => initialSets(exercise, log, lastWeight));
  const allChecked = sets.every((s) => s.checked);
  const [editing, setEditing] = useState(!log);

  const updateSet = (i: number, patch: Partial<SetRow>) => setSets((all) => all.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const removeSet = (i: number) => setSets((all) => all.filter((_, j) => j !== i));
  const addSet = () => setSets((all) => [...all, { ...all[all.length - 1], checked: false }]);
  /** Checking a set starts the routine if needed and the rest countdown. */
  const toggleSet = (i: number) => {
    const checking = !sets[i].checked;
    updateSet(i, { checked: checking });
    if (checking) {
      sessionFor();
      onSetChecked();
    }
  };

  /** The last set's reps and weight become the exercise's summary, and the weight suggested next time. */
  const mark = (status: ExerciseLog['status']) => {
    const last = sets[sets.length - 1];
    saveLog(sessionFor(), exercise, status, {
      sets: sets.length,
      reps: last.reps,
      weight: last.weight,
      setDetails: status === 'done' ? sets.map(({ reps, weight }) => ({ reps, weight })) : null,
    });
    setEditing(false);
    onMarked();
  };

  if (!editing && log) {
    return (
      <article className={`card exercise ${log.status}`}>
        <div className="row-between">
          <div>
            <h3>{log.status === 'done' ? '✓ ' : '– '}{exercise.name}</h3>
            <p className="muted">{log.status === 'done' ? fmtLog(log) : 'Salteado'}</p>
          </div>
          <div className="row">
            <button className="btn-link" onClick={() => setEditing(true)}>Editar</button>
            <button
              className="btn-link muted"
              onClick={() => { clearLog(log.sessionId, exercise.id); setSets(initialSets(exercise, undefined, lastWeight)); setEditing(true); }}
            >
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
      {lastWeight !== undefined && lastWeight !== exercise.weight && (
        <p className="small muted">La última vez levantaste <strong>{lastWeight} kg</strong></p>
      )}
      {demo && demoOpen && <ExerciseDemo exercise={demo} textCollapsed />}

      <div className="sets" role="table" aria-label={`Series de ${exercise.name}`}>
        <div className="set-row set-head" role="row">
          <span role="columnheader">Serie</span>
          <span role="columnheader">Reps</span>
          <span role="columnheader">Peso (kg)</span>
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </div>
        {sets.map((s, i) => (
          <div key={i} className={`set-row${s.checked ? ' is-checked' : ''}`} role="row">
            <span className="set-num" role="cell">{i + 1}</span>
            <div role="cell">
              <Stepper label={`Reps serie ${i + 1}`} hideLabel disabled={s.checked} value={s.reps} suggested={exercise.reps} onChange={(reps) => updateSet(i, { reps })} />
            </div>
            <div role="cell">
              <Stepper label={`Peso serie ${i + 1}`} hideLabel disabled={s.checked} value={s.weight} step={2.5} suggested={exercise.weight} onChange={(weight) => updateSet(i, { weight })} />
            </div>
            <div role="cell">
              <button
                type="button"
                className="set-check"
                aria-pressed={s.checked}
                aria-label={`${s.checked ? 'Desmarcar' : 'Marcar'} serie ${i + 1}`}
                onClick={() => toggleSet(i)}
              >
                ✓
              </button>
            </div>
            <div role="cell">
              {sets.length > 1 && !s.checked && (
                <button type="button" className="set-remove" aria-label={`Quitar serie ${i + 1}`} onClick={() => removeSet(i)}>×</button>
              )}
            </div>
          </div>
        ))}
        <button type="button" className="btn-link" onClick={addSet}>+ Agregar serie</button>
      </div>

      <div className="row">
        <button className="btn btn-ghost" onClick={() => mark('skipped')}>Saltear</button>
        <button className="btn grow" disabled={!allChecked} onClick={() => mark('done')}>
          {allChecked ? 'Hecho' : `Hecho (${sets.filter((s) => s.checked).length}/${sets.length})`}
        </button>
      </div>
    </article>
  );
}
