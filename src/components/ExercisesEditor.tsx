import { uid } from '../lib/id';
import type { PlannedExercise } from '../types';

export const blankExercise = (): PlannedExercise => ({ id: uid(), name: '', sets: 3, reps: 10, weight: 0 });

export const exercisesValid = (list: PlannedExercise[]) => list.length > 0 && list.every((e) => e.name.trim());

export const trimExercises = (list: PlannedExercise[]) => list.map((e) => ({ ...e, name: e.name.trim() }));

export function ExercisesEditor({ value, onChange }: { value: PlannedExercise[]; onChange: (v: PlannedExercise[]) => void }) {
  const patch = (id: string, p: Partial<PlannedExercise>) => onChange(value.map((e) => (e.id === id ? { ...e, ...p } : e)));
  const num = (s: string) => Math.max(0, Number(s) || 0);

  return (
    <div className="stack-sm">
      <h2>Ejercicios</h2>
      {value.map((ex, i) => (
        <div key={ex.id} className="card stack-sm">
          <div className="row-between">
            <strong>#{i + 1}</strong>
            {value.length > 1 && (
              <button type="button" className="btn-link muted" onClick={() => onChange(value.filter((e) => e.id !== ex.id))}>
                Quitar
              </button>
            )}
          </div>
          <input value={ex.name} placeholder="Ejercicio" onChange={(e) => patch(ex.id, { name: e.target.value })} required />
          <div className="grid-3">
            <label className="field"><span>Series</span><input type="number" min={0} value={ex.sets} onChange={(e) => patch(ex.id, { sets: num(e.target.value) })} /></label>
            <label className="field"><span>Reps</span><input type="number" min={0} value={ex.reps} onChange={(e) => patch(ex.id, { reps: num(e.target.value) })} /></label>
            <label className="field"><span>Peso kg</span><input type="number" min={0} step={0.5} value={ex.weight} onChange={(e) => patch(ex.id, { weight: num(e.target.value) })} /></label>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-secondary" onClick={() => onChange([...value, blankExercise()])}>
        + Agregar ejercicio
      </button>
    </div>
  );
}
