import { EXERCISES, MUSCLES, exerciseFor, getExercise } from '../data/exercises';
import { uid } from '../lib/id';
import type { PlannedExercise } from '../types';
import './exercises.css';

export const blankExercise = (): PlannedExercise => ({ id: uid(), name: '', sets: 3, reps: 10, weight: 0 });

/** Every exercise has to come from the catalog, so all of them have photos and a how-to. */
export const exercisesValid = (list: PlannedExercise[]) => list.length > 0 && list.every((e) => exerciseFor(e));

/** Links each exercise to its catalog entry and uses the catalog name. */
export const trimExercises = (list: PlannedExercise[]) =>
  list.map((e) => {
    const found = exerciseFor(e);
    return found ? { ...e, exerciseId: found.id, name: found.alias } : { ...e, name: e.name.trim() };
  });

export function ExercisesEditor({ value, onChange }: { value: PlannedExercise[]; onChange: (v: PlannedExercise[]) => void }) {
  const patch = (id: string, p: Partial<PlannedExercise>) => onChange(value.map((e) => (e.id === id ? { ...e, ...p } : e)));
  const num = (s: string) => Math.max(0, Number(s) || 0);
  const pick = (id: string, exerciseId: string) => {
    const found = getExercise(exerciseId);
    if (found) patch(id, { exerciseId: found.id, name: found.alias });
  };

  return (
    <div className="stack-sm">
      <h2>Ejercicios</h2>
      {value.map((ex, i) => {
        const found = exerciseFor(ex);
        const legacy = !found && ex.name.trim() !== '';
        return (
          <div key={ex.id} className="card stack-sm">
            <div className="row-between">
              <strong>#{i + 1}</strong>
              {value.length > 1 && (
                <button type="button" className="btn-link muted" onClick={() => onChange(value.filter((e) => e.id !== ex.id))}>
                  Quitar
                </button>
              )}
            </div>
            <div className="row">
              {found && <img className="exthumb" src={found.images[0]} alt="" />}
              <select
                className="grow"
                aria-label={`Ejercicio ${i + 1}`}
                value={found?.id ?? ''}
                onChange={(e) => pick(ex.id, e.target.value)}
                required
              >
                <option value="" disabled>
                  {legacy ? `${ex.name} (no está en la lista)` : 'Elegí un ejercicio'}
                </option>
                {MUSCLES.map((m) => (
                  <optgroup key={m} label={m}>
                    {EXERCISES.filter((e) => e.muscle === m).map((e) => (
                      <option key={e.id} value={e.id}>{e.alias}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {legacy && <p className="notice small">“{ex.name}” no está en la lista de ejercicios. Elegí uno para poder guardar.</p>}
            <div className="grid-3">
              <label className="field"><span>Series</span><input type="number" min={0} value={ex.sets} onChange={(e) => patch(ex.id, { sets: num(e.target.value) })} /></label>
              <label className="field"><span>Reps</span><input type="number" min={0} value={ex.reps} onChange={(e) => patch(ex.id, { reps: num(e.target.value) })} /></label>
              <label className="field"><span>Peso kg</span><input type="number" min={0} step={0.5} value={ex.weight} onChange={(e) => patch(ex.id, { weight: num(e.target.value) })} /></label>
            </div>
          </div>
        );
      })}
      <button type="button" className="btn btn-secondary" onClick={() => onChange([...value, blankExercise()])}>
        + Agregar ejercicio
      </button>
    </div>
  );
}
