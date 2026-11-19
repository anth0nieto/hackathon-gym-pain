import { useState } from 'react';
import { exerciseFor, type Exercise } from '../data/exercises';
import type { PlannedExercise } from '../types';
import './exercises.css';

/**
 * Start and end photos shown in turn, so the movement reads like a short animation, plus how to do it.
 * With `textCollapsed`, the how-to stays behind a "+ info" toggle.
 */
export function ExerciseDemo({ exercise, textCollapsed = false }: { exercise: Exercise; textCollapsed?: boolean }) {
  const [showText, setShowText] = useState(!textCollapsed);
  return (
    <div className="exdemo">
      <div className="exdemo-media">
        <img src={exercise.images[0]} alt={`${exercise.alias}: posición inicial`} loading="lazy" />
        <img src={exercise.images[1]} alt="" aria-hidden="true" loading="lazy" />
      </div>
      {textCollapsed && (
        <button type="button" className="btn-link exdemo-toggle" aria-expanded={showText} onClick={() => setShowText((v) => !v)}>
          {showText ? '− info' : '+ info'}
        </button>
      )}
      {showText && <p className="exdemo-text small">{exercise.description}</p>}
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
