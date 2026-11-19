import { useSyncExternalStore } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { ExerciseLog, PlannedExercise, Prescription, Routine, RoutineTemplate, Session, SessionStatus, User } from '../types';
import { seedRoutines, seedTemplates, seedUsers } from './seed';
import { dayOf, startOfWeek, today } from '../lib/dates';
import { uid } from '../lib/id';

// Actions update the in-memory snapshot first and then write the diff to Supabase,
// so selectors stay synchronous. Columns are camelCase, matching src/types.ts.

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export interface DB {
  users: User[];
  templates: RoutineTemplate[];
  routines: Routine[];
  sessions: Session[];
  logs: ExerciseLog[];
}

type Table = keyof DB;
type Row = Record<string, unknown>;

// Insert order respects foreign keys; deletes run in reverse.
const TABLES: Table[] = ['users', 'templates', 'routines', 'sessions', 'logs'];
const PRIMARY_KEY: Record<Table, string[]> = {
  users: ['id'],
  templates: ['id'],
  routines: ['id'],
  sessions: ['id'],
  logs: ['sessionId', 'exerciseId'],
};

const rows = (d: DB, t: Table) => d[t] as unknown as Row[];
const keyOf = (t: Table, row: Row) => PRIMARY_KEY[t].map((k) => row[k]).join('|');

const EMPTY: DB = { users: [], templates: [], routines: [], sessions: [], logs: [] };
const listeners = new Set<() => void>();
let db: DB = EMPTY;

function fresh(): DB {
  return { users: seedUsers, templates: seedTemplates, routines: seedRoutines, sessions: [], logs: [] };
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
  return Object.fromEntries(TABLES.map((t, i) => [t, results[i].data ?? []])) as unknown as DB;
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

// Writes run one at a time, so a log never reaches Supabase before the session it belongs to.
let writes = Promise.resolve();

function commit(next: DB) {
  const prev = db;
  emit(next);
  writes = writes
    .then(() => persist(prev, next))
    .catch((e) => {
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

/** Keeps only digits, so "30.111.222" and "30111222" are the same DNI. */
export const normalizeDni = (dni: string) => dni.replace(/\D/g, '');

export const studentByDni = (d: DB, dni: string) => {
  const wanted = normalizeDni(dni);
  return wanted ? d.users.find((u) => u.role === 'student' && u.dni === wanted) : undefined;
};

export const studentsOf = (d: DB, coachId: string) =>
  d.users.filter((u) => u.role === 'student' && u.coachId === coachId);

export const templatesOf = (d: DB, coachId: string) =>
  d.templates.filter((t) => t.coachId === coachId).sort((a, b) => a.name.localeCompare(b.name));

/** The student's routines in the order they do them. */
export const routinesOf = (d: DB, studentId: string) =>
  d.routines.filter((r) => r.studentId === studentId).sort((a, b) => a.position - b.position);

/** The student's sessions, newest first. */
export const sessionsOf = (d: DB, studentId: string) =>
  d.sessions.filter((s) => s.studentId === studentId).sort((a, b) => b.startedAt.localeCompare(a.startedAt));

export const getSession = (d: DB, id?: string) => d.sessions.find((s) => s.id === id);

export const AUTO_CLOSE_HOURS = 6;

export function sessionStatus(session: Session, now = Date.now()): SessionStatus {
  if (session.finishedAt) return 'done';
  return now - new Date(session.startedAt).getTime() >= AUTO_CLOSE_HOURS * 3_600_000 ? 'done' : 'open';
}

export const openSession = (d: DB, studentId: string, now = Date.now()) =>
  sessionsOf(d, studentId).find((s) => sessionStatus(s, now) === 'open');

/**
 * The routine the student has to do now: the one of their open session, or the one after
 * the routine of their last session (back to the first after the last). Undefined if they have none.
 */
export function dueRoutine(d: DB, studentId: string, now = Date.now()): Routine | undefined {
  const routines = routinesOf(d, studentId);
  const open = openSession(d, studentId, now);
  const current = open && routines.find((r) => r.id === open.routineId);
  if (current) return current;
  const last = sessionsOf(d, studentId)[0];
  if (!last) return routines[0];
  return routines.find((r) => r.position > last.position) ?? routines[0];
}

export const logsOf = (d: DB, sessionId: string) => d.logs.filter((l) => l.sessionId === sessionId);

export const logFor = (d: DB, sessionId: string | undefined, exerciseId: string) =>
  d.logs.find((l) => l.sessionId === sessionId && l.exerciseId === exerciseId);

/** Sessions started since Monday of the current week. */
export const sessionsThisWeek = (d: DB, studentId: string) =>
  sessionsOf(d, studentId).filter((s) => dayOf(s.startedAt) >= startOfWeek(today()));

export function lastActivity(d: DB, studentId: string): string | undefined {
  const sessions = sessionsOf(d, studentId);
  const ids = new Set(sessions.map((s) => s.id));
  return [...sessions.map((s) => s.startedAt), ...d.logs.filter((l) => ids.has(l.sessionId)).map((l) => l.updatedAt)]
    .sort()
    .at(-1);
}

// ---------- student actions ----------

/** Returns the open session for this routine, creating it if needed. */
export function startSession(studentId: string, routine: Routine): string {
  const open = openSession(db, studentId);
  if (open?.routineId === routine.id) return open.id;
  const session: Session = {
    id: uid(),
    studentId,
    routineId: routine.id,
    position: routine.position,
    routineName: routine.name,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
  commit({ ...db, sessions: [...db.sessions, session] });
  return session.id;
}

export function finishSession(sessionId: string) {
  commit({
    ...db,
    sessions: db.sessions.map((s) => (s.id === sessionId ? { ...s, finishedAt: new Date().toISOString() } : s)),
  });
}

/** Saves one exercise as done or skipped. Saving it again replaces the previous values. */
export function saveLog(sessionId: string, exercise: PlannedExercise, status: ExerciseLog['status'], values: Prescription) {
  const log: ExerciseLog = {
    sessionId,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    status,
    ...values,
    updatedAt: new Date().toISOString(),
  };
  commit({
    ...db,
    logs: [...db.logs.filter((l) => !(l.sessionId === sessionId && l.exerciseId === exercise.id)), log],
  });
}

export function clearLog(sessionId: string, exerciseId: string) {
  commit({ ...db, logs: db.logs.filter((l) => !(l.sessionId === sessionId && l.exerciseId === exerciseId)) });
}

// ---------- coach actions ----------

/** Creates or updates a student. Returns 'dni-taken' without saving if another user has that DNI. */
export function saveStudent(student: {
  id?: string;
  name: string;
  dni: string;
  daysPerWeek: number;
  coachId: string;
}): 'ok' | 'dni-taken' {
  const dni = normalizeDni(student.dni);
  const id = student.id ?? uid();
  if (db.users.some((u) => u.dni === dni && u.id !== id)) return 'dni-taken';
  const user: User = { id, name: student.name.trim(), role: 'student', coachId: student.coachId, dni, daysPerWeek: student.daysPerWeek };
  const exists = db.users.some((u) => u.id === id);
  commit({ ...db, users: exists ? db.users.map((u) => (u.id === id ? user : u)) : [...db.users, user] });
  return 'ok';
}

/** Deletes a student with their routines, sessions and logs. */
export function deleteStudent(id: string) {
  const sessionIds = new Set(db.sessions.filter((s) => s.studentId === id).map((s) => s.id));
  commit({
    ...db,
    users: db.users.filter((u) => u.id !== id),
    routines: db.routines.filter((r) => r.studentId !== id),
    sessions: db.sessions.filter((s) => s.studentId !== id),
    logs: db.logs.filter((l) => !sessionIds.has(l.sessionId)),
  });
}

/** The position a new routine for this student gets: after the last one. */
export const nextPosition = (d: DB, studentId: string) =>
  Math.max(0, ...routinesOf(d, studentId).map((r) => r.position)) + 1;

export function saveRoutine(routine: Routine) {
  const exists = db.routines.some((r) => r.id === routine.id);
  commit({ ...db, routines: exists ? db.routines.map((r) => (r.id === routine.id ? routine : r)) : [...db.routines, routine] });
}

/** Deletes a routine and renumbers the student's remaining routines 1..n. History is kept. */
export function deleteRoutine(id: string) {
  const routine = db.routines.find((r) => r.id === id);
  if (!routine) return;
  const remaining = db.routines.filter((r) => r.id !== id);
  const renumbered = new Map(
    remaining
      .filter((r) => r.studentId === routine.studentId)
      .sort((a, b) => a.position - b.position)
      .map((r, i) => [r.id, r.position === i + 1 ? r : { ...r, position: i + 1 }]),
  );
  commit({ ...db, routines: remaining.map((r) => renumbered.get(r.id) ?? r) });
}

/** Replaces the routines of every student present in `routines` (CSV import). History is kept. */
export function replaceRoutines(routines: Routine[]) {
  const students = new Set(routines.map((r) => r.studentId));
  commit({ ...db, routines: [...db.routines.filter((r) => !students.has(r.studentId)), ...routines] });
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

const copyExercises = (exercises: PlannedExercise[]) => exercises.map((e) => ({ ...e, id: uid() }));

/** Adds a copy of the template as each student's next routine. Returns how many it created. */
export function assignTemplate(template: RoutineTemplate, studentIds: string[]): number {
  const created = studentIds.map<Routine>((studentId) => ({
    id: uid(),
    coachId: template.coachId,
    studentId,
    position: nextPosition(db, studentId),
    name: template.name,
    templateId: template.id,
    exercises: copyExercises(template.exercises),
  }));
  commit({ ...db, routines: [...db.routines, ...created] });
  return created.length;
}

/** The routine's name and exercises replaced by a copy of the template, keeping its position. */
export const fromTemplate = (routine: Routine, template: RoutineTemplate): Routine => ({
  ...routine,
  name: template.name,
  templateId: template.id,
  exercises: copyExercises(template.exercises),
});

export function resetDB() {
  commit(fresh());
}
