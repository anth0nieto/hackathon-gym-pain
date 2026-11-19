import { exerciseFor, type Exercise } from '../data/exercises';
import type { PlannedExercise } from '../types';
import './exercises.css';

/** Start and end photos shown in turn, so the movement reads like a short animation, plus how to do it. */
export function ExerciseDemo({ exercise }: { exercise: Exercise }) {
  return (
    <div className="exdemo">
      <div className="exdemo-media">
        <img src={exercise.images[0]} alt={`${exercise.alias}: posición inicial`} loading="lazy" />
        <img src={exercise.images[1]} alt="" aria-hidden="true" loading="lazy" />
      </div>
      <p className="exdemo-text small">{exercise.description}</p>
    </div>
  );
}

/** Collapsible "Cómo se hace" for an exercise in a routine. Nothing if it is not in the catalog. */
export function ExerciseHowTo({ exercise }: { exercise: Pick<PlannedExercise, 'name' | 'exerciseId'> }) {
  const found = exerciseFor(exercise);
  if (!found) return null;
  return (
    <details className="exhowto">
      <summary>Cómo se hace</summary>
      <ExerciseDemo exercise={found} />
    </details>
  );
}
