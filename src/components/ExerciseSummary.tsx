import type { ExerciseLog, PlannedExercise, Prescription } from '../types';

export const fmt = (p: Prescription) => `${p.sets}×${p.reps}${p.weight ? ` · ${p.weight} kg` : ''}`;

/** Planned vs. actual, as the coach sees it. */
export function ExerciseSummary({ exercise, log }: { exercise: PlannedExercise; log?: ExerciseLog }) {
  const differs = log && log.status === 'done' && fmt(log) !== fmt(exercise);
  return (
    <li className="exsum">
      <span className={`exsum-mark ${log?.status ?? 'none'}`}>
        {log?.status === 'done' ? '✓' : log?.status === 'skipped' ? '–' : '·'}
      </span>
      <span className="exsum-name">{exercise.name}</span>
      <span className="exsum-values">
        {differs ? (
          <><s>{fmt(exercise)}</s> <strong>{fmt(log!)}</strong></>
        ) : (
          fmt(exercise)
        )}
      </span>
    </li>
  );
}
