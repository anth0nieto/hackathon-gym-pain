import { exerciseFor, exerciseKey } from './exercises';
import { sessionsOf, type DB } from './store';

export interface LiftPoint {
  sessionId: string;
  /** When the session started (ISO timestamp). */
  at: string;
  weight: number;
  reps: number;
}

export interface LiftHistory {
  key: string;
  label: string;
  best: number;
  /** Oldest first: the heaviest set of each session. */
  points: LiftPoint[];
}

/**
 * Per exercise, the heaviest set the student did in each session.
 * Bodyweight exercises (always 0 kg) are left out: there is no weight to follow.
 */
export function liftHistory(db: DB, studentId: string): LiftHistory[] {
  const sessions = new Map(sessionsOf(db, studentId).map((s) => [s.id, s]));
  const byKey = new Map<string, LiftHistory>();

  for (const log of db.logs) {
    const session = sessions.get(log.sessionId);
    if (!session || log.status !== 'done') continue;
    const planned = session.exercises.find((e) => e.id === log.exerciseId);
    const ref = { name: log.exerciseName, exerciseId: planned?.exerciseId };
    const key = exerciseKey(ref);

    const sets = log.setDetails?.length ? log.setDetails : [{ weight: log.weight, reps: log.reps }];
    const top = sets.reduce((a, b) => (b.weight > a.weight || (b.weight === a.weight && b.reps > a.reps) ? b : a));

    const entry = byKey.get(key) ?? { key, label: exerciseFor(ref)?.alias ?? log.exerciseName, best: 0, points: [] };
    const existing = entry.points.find((p) => p.sessionId === session.id);
    if (existing && existing.weight >= top.weight) continue;
    if (existing) Object.assign(existing, { weight: top.weight, reps: top.reps });
    else entry.points.push({ sessionId: session.id, at: session.startedAt, weight: top.weight, reps: top.reps });
    byKey.set(key, entry);
  }

  return [...byKey.values()]
    .map((h) => ({ ...h, best: Math.max(...h.points.map((p) => p.weight)), points: h.points.sort((a, b) => a.at.localeCompare(b.at)) }))
    .filter((h) => h.best > 0)
    .sort((a, b) => b.best - a.best || a.label.localeCompare(b.label));
}
