import type { PlannedExercise } from '../types';
import { exerciseKey } from './exercises';
import { sessionsOf, type DB } from './store';

/**
 * Weight of the student's most recent "done" log of this exercise, in any routine.
 * Skipped logs don't count: they keep the suggested values, not what was lifted.
 */
export function lastWeight(
  db: DB,
  studentId: string,
  exercise: Pick<PlannedExercise, 'name' | 'exerciseId'>,
  excludeSessionId?: string,
): number | undefined {
  const key = exerciseKey(exercise);
  const sessions = new Map(
    sessionsOf(db, studentId).filter((s) => s.id !== excludeSessionId).map((s) => [s.id, s]),
  );
  let latest: { at: string; weight: number } | undefined;
  for (const log of db.logs) {
    const session = sessions.get(log.sessionId);
    if (!session || log.status !== 'done') continue;
    const planned = session.exercises.find((e) => e.id === log.exerciseId);
    if (exerciseKey({ name: log.exerciseName, exerciseId: planned?.exerciseId }) !== key) continue;
    if (!latest || log.updatedAt > latest.at) latest = { at: log.updatedAt, weight: log.weight };
  }
  return latest?.weight;
}
