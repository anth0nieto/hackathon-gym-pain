import { useSyncExternalStore } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { ExerciseLog, Prescription, Routine, RoutineStatus, RoutineTemplate, User } from '../types';
import { seedRoutines, seedTemplates, seedUsers } from './seed';
import { addDays, weekDays } from '../lib/dates';
import { uid } from '../lib/id';

// Actions update the in-memory snapshot first and then write the diff to Supabase,
// so selectors stay synchronous. Columns are camelCase, matching src/types.ts.

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export interface DB {
  users: User[];
  routines: Routine[];
  templates: RoutineTemplate[];
  logs: ExerciseLog[];
}

type Table = keyof DB;
type Row = Record<string, unknown>;

// Insert order respects foreign keys; deletes run in reverse.
const TABLES: Table[] = ['users', 'templates', 'routines', 'logs'];
const PRIMARY_KEY: Record<Table, string[]> = {
  users: ['id'],
  templates: ['id'],
  routines: ['id'],
  logs: ['routineId', 'exerciseId'],
};

const rows = (d: DB, t: Table) => d[t] as unknown as Row[];
const keyOf = (t: Table, row: Row) => PRIMARY_KEY[t].map((k) => row[k]).join('|');

const EMPTY: DB = { users: [], routines: [], templates: [], logs: [] };
const listeners = new Set<() => void>();
let db: DB = EMPTY;

function fresh(): DB {
  return { users: seedUsers, routines: seedRoutines(), templates: seedTemplates, logs: [] };
}

function emit(next: DB) {
  db = next;
  listeners.forEach((l) => l());
}

// ponytail: reads every table whole, on start and on any remote change. Fine for one coach;
// filter by coach and patch from the realtime payload when the data grows.
async function fetchAll(): Promise<DB> {
  const results = await Promise.all(TABLES.map((t) => supabase.from(t).select('*')));
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
  const [users, templates, routines, logs] = results.map((r) => r.data ?? []);
  return { users, templates, routines, logs } as DB;
}

async function refresh() {
  try {
    emit(await fetchAll());
  } catch (e) {
    console.error(e);
  }
}

/** Writes only what changed: actions keep untouched rows by reference, so a new reference means upsert. */
async function persist(prev: DB, next: DB) {
  for (const t of TABLES) {
    const before = new Set(rows(prev, t));
    const changed = rows(next, t).filter((r) => !before.has(r));
    if (changed.length) {
      const { error } = await supabase.from(t).upsert(changed);
      if (error) throw error;
    }
  }
  for (const t of [...TABLES].reverse()) {
    const kept = new Set(rows(next, t).map((r) => keyOf(t, r)));
    for (const r of rows(prev, t)) {
      if (kept.has(keyOf(t, r))) continue;
      const { error } = await supabase.from(t).delete().match(Object.fromEntries(PRIMARY_KEY[t].map((k) => [k, r[k]])));
      if (error) throw error;
    }
  }
}

/** Loads the snapshot, seeds an empty database, and follows changes made from other devices. */
export async function loadDB() {
  let next = await fetchAll();
  if (next.users.length === 0) {
    await persist(EMPTY, fresh());
    next = await fetchAll();
  }
  emit(next);
  supabase
    .channel('db')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => void refresh())
    .subscribe();
}

function commit(next: DB) {
  const prev = db;
  emit(next);
  persist(prev, next).catch((e) => {
    console.error(e);
    alert('No se pudo guardar. Revisá la conexión y probá de nuevo.');
    void refresh();
  });
}

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
