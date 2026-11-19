import { useSyncExternalStore } from 'react';
import type { ExerciseLog, Prescription, Routine, RoutineStatus, RoutineTemplate, User } from '../types';
import { seedRoutines, seedTemplates, seedUsers } from './seed';
import { addDays, weekDays } from '../lib/dates';
import { uid } from '../lib/id';

// Swap this module for a real backend (Supabase, API) keeping the same exports:
// localStorage only shares data between tabs of the same browser.

export interface DB {
  users: User[];
  routines: Routine[];
  templates: RoutineTemplate[];
  logs: ExerciseLog[];
}

const KEY = 'gym-pain-db-v1';
const listeners = new Set<() => void>();

function fresh(): DB {
  return { users: seedUsers, routines: seedRoutines(), templates: seedTemplates, logs: [] };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...(JSON.parse(raw) as Partial<DB>) };
  } catch {
    /* corrupt or blocked storage: fall back to seed */
  }
  return fresh();
}

let db: DB = load();

function commit(next: DB) {
  db = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((l) => l());
}

window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  db = load();
  listeners.forEach((l) => l());
});

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useDB = () => useSyncExternalStore(subscribe, () => db);

// ---------- selectors ----------

export const getUser = (d: DB, id?: string | null) => d.users.find((u) => u.id === id);

export const studentsOf = (d: DB, coachId: string) =>
  d.users.filter((u) => u.role === 'student' && u.coachId === coachId);

export const routinesOn = (d: DB, studentId: string, date: string) =>
  d.routines.filter((r) => r.studentId === studentId && r.date === date);

export const logsOf = (d: DB, routineId: string) => d.logs.filter((l) => l.routineId === routineId);

export const logFor = (d: DB, routineId: string, exerciseId: string) =>
  d.logs.find((l) => l.routineId === routineId && l.exerciseId === exerciseId);

export function routineStatus(d: DB, routine: Routine): RoutineStatus {
  const logs = logsOf(d, routine.id);
  if (logs.length === 0 || routine.exercises.length === 0) return 'pending';
  if (logs.length < routine.exercises.length) return 'partial';
  if (logs.every((l) => l.status === 'skipped')) return 'skipped';
  if (logs.every((l) => l.status === 'done')) return 'complete';
  return 'partial';
}

export const templatesOf = (d: DB, coachId: string) =>
  d.templates.filter((t) => t.coachId === coachId).sort((a, b) => a.name.localeCompare(b.name));

export function lastActivity(d: DB, studentId: string): string | undefined {
  const ids = new Set(d.routines.filter((r) => r.studentId === studentId).map((r) => r.id));
  return d.logs
    .filter((l) => ids.has(l.routineId))
    .map((l) => l.updatedAt)
    .sort()
    .at(-1);
}

// ---------- actions ----------

export function saveRoutine(routine: Routine) {
  const exists = db.routines.some((r) => r.id === routine.id);
  const keptIds = new Set(routine.exercises.map((e) => e.id));
  commit({
    ...db,
    routines: exists ? db.routines.map((r) => (r.id === routine.id ? routine : r)) : [...db.routines, routine],
    logs: db.logs.filter((l) => l.routineId !== routine.id || keptIds.has(l.exerciseId)),
  });
}

export function deleteRoutine(id: string) {
  commit({
    ...db,
    routines: db.routines.filter((r) => r.id !== id),
    logs: db.logs.filter((l) => l.routineId !== id),
  });
}

export function addRoutines(routines: Routine[]) {
  commit({ ...db, routines: [...db.routines, ...routines] });
}

export function saveLog(routineId: string, exerciseId: string, status: ExerciseLog['status'], values: Prescription) {
  const log: ExerciseLog = { routineId, exerciseId, status, ...values, updatedAt: new Date().toISOString() };
  commit({
    ...db,
    logs: [...db.logs.filter((l) => !(l.routineId === routineId && l.exerciseId === exerciseId)), log],
  });
}

export function clearLog(routineId: string, exerciseId: string) {
  commit({ ...db, logs: db.logs.filter((l) => !(l.routineId === routineId && l.exerciseId === exerciseId)) });
}

export function skipRoutine(routine: Routine) {
  const now = new Date().toISOString();
  const others = db.logs.filter((l) => l.routineId !== routine.id);
  const skipped = routine.exercises.map<ExerciseLog>((e) => ({
    routineId: routine.id, exerciseId: e.id, status: 'skipped',
    sets: e.sets, reps: e.reps, weight: e.weight, updatedAt: now,
  }));
  commit({ ...db, logs: [...others, ...skipped] });
}

/** Copies the previous week's routines into the week containing `weekDate`. Returns how many were created. */
export function copyPreviousWeek(studentId: string, weekDate: string): number {
  const previous = new Set(weekDays(addDays(weekDate, -7)));
  const copies = db.routines
    .filter((r) => r.studentId === studentId && previous.has(r.date))
    .map<Routine>((r) => ({
      ...r,
      id: uid(),
      date: addDays(r.date, 7),
      exercises: r.exercises.map((e) => ({ ...e, id: uid() })),
    }));
  if (copies.length) addRoutines(copies);
  return copies.length;
}

export function saveTemplate(template: RoutineTemplate) {
  const exists = db.templates.some((t) => t.id === template.id);
  commit({
    ...db,
    templates: exists ? db.templates.map((t) => (t.id === template.id ? template : t)) : [...db.templates, template],
  });
}

export function deleteTemplate(id: string) {
  commit({ ...db, templates: db.templates.filter((t) => t.id !== id) });
}

/** Creates one routine per student from the template. Skips students who already have it that day. */
export function assignTemplate(template: RoutineTemplate, studentIds: string[], date: string) {
  const already = new Set(
    db.routines.filter((r) => r.templateId === template.id && r.date === date).map((r) => r.studentId),
  );
  const created = studentIds
    .filter((id) => !already.has(id))
    .map<Routine>((studentId) => ({
      id: uid(),
      coachId: template.coachId,
      studentId,
      date,
      name: template.name,
      templateId: template.id,
      exercises: template.exercises.map((e) => ({ ...e, id: uid() })),
    }));
  if (created.length) addRoutines(created);
  return { created: created.length, skipped: studentIds.length - created.length };
}

export function resetDB() {
  commit(fresh());
}
