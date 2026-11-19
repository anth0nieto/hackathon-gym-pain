import type { ExerciseLog, PlannedExercise, Prescription } from '../types';

export const fmt = (p: Prescription) => `${p.sets}×${p.reps}${p.weight ? ` · ${p.weight} kg` : ''}`;

/** What was logged: "3×8 · 60 kg" when every set was the same, otherwise each set ("8×60 · 8×60 · 6×65 kg"). */
export function fmtLog(log: ExerciseLog): string {
  const sets = log.setDetails ?? [];
  const uniform = sets.every((s) => s.reps === sets[0].reps && s.weight === sets[0].weight);
  if (sets.length < 2 || uniform) return fmt(log);
  const anyWeight = sets.some((s) => s.weight);
  return sets.map((s) => (anyWeight ? `${s.reps}×${s.weight}` : `${s.reps}`)).join(' · ') + (anyWeight ? ' kg' : ' reps');
}

/** Planned vs. actual, as the coach sees it. Without `exercise`, shows only what was logged. */
export function ExerciseSummary({ name, exercise, log }: { name: string; exercise?: PlannedExercise; log?: ExerciseLog }) {
  const differs = exercise && log?.status === 'done' && fmtLog(log) !== fmt(exercise);
  const shown = log?.status === 'done' ? log : exercise;
  return (
    <li className="exsum">
      <span className={`exsum-mark ${log?.status ?? 'none'}`}>
        {log?.status === 'done' ? '✓' : log?.status === 'skipped' ? '–' : '·'}
      </span>
      <span className="exsum-name">{name}</span>
      <span className="exsum-values">
        {differs ? <><s>{fmt(exercise)}</s> <strong>{fmtLog(log!)}</strong></> : log?.status === 'skipped' ? 'Salteado' : log?.status === 'done' ? fmtLog(log) : shown && fmt(shown)}
      </span>
    </li>
  );
}
