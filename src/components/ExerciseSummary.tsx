import type { ExerciseLog, PlannedExercise, Prescription } from '../types';

export const fmt = (p: Prescription) => `${p.sets}×${p.reps}${p.weight ? ` · ${p.weight} kg` : ''}`;

/** Planned vs. actual, as the coach sees it. Without `exercise`, shows only what was logged. */
export function ExerciseSummary({ name, exercise, log }: { name: string; exercise?: PlannedExercise; log?: ExerciseLog }) {
  const differs = exercise && log?.status === 'done' && fmt(log) !== fmt(exercise);
  const shown = log?.status === 'done' ? log : exercise;
  return (
    <li className="exsum">
      <span className={`exsum-mark ${log?.status ?? 'none'}`}>
        {log?.status === 'done' ? '✓' : log?.status === 'skipped' ? '–' : '·'}
      </span>
      <span className="exsum-name">{name}</span>
      <span className="exsum-values">
        {differs ? <><s>{fmt(exercise)}</s> <strong>{fmt(log!)}</strong></> : log?.status === 'skipped' ? 'Salteado' : shown && fmt(shown)}
      </span>
    </li>
  );
}
