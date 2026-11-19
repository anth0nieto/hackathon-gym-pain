import { useSyncExternalStore } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { ExerciseLog, Gym, PlannedExercise, Prescription, Routine, RoutineTemplate, Session, SessionStatus, User } from '../types';
import { getExercise } from './exercises';
import type { Plan } from './plans';
import { seedGyms, seedRoutines, seedTemplates, seedUsers } from './seed';
import { dayOf, startOfWeek, today } from '../lib/dates';
import { uid } from '../lib/id';

// Actions update the in-memory snapshot first and then write the diff to Supabase,
// so selectors stay synchronous. Columns are camelCase, matching src/types.ts.

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

export interface DB {
  gyms: Gym[];
  users: User[];
  templates: RoutineTemplate[];
  routines: Routine[];
  sessions: Session[];
  logs: ExerciseLog[];
}

type Table = keyof DB;
type Row = Record<string, unknown>;

// Insert order respects foreign keys; deletes run in reverse.
const TABLES: Table[] = ['gyms', 'users', 'templates', 'routines', 'sessions', 'logs'];
const PRIMARY_KEY: Record<Table, string[]> = {
  gyms: ['id'],
  users: ['id'],
  templates: ['id'],
  routines: ['id'],
  sessions: ['id'],
  logs: ['sessionId', 'exerciseId'],
};

const rows = (d: DB, t: Table) => d[t] as unknown as Row[];
const keyOf = (t: Table, row: Row) => PRIMARY_KEY[t].map((k) => row[k]).join('|');

const EMPTY: DB = { gyms: [], users: [], templates: [], routines: [], sessions: [], logs: [] };
const listeners = new Set<() => void>();
let db: DB = EMPTY;

function fresh(): DB {
  return { gyms: seedGyms, users: seedUsers, templates: seedTemplates, routines: seedRoutines, sessions: [], logs: [] };
}

function emit(next: DB) {
  db = next;
  listeners.forEach((l) => l());
}

// ponytail: reads every table whole, on start and on any remote change. Fine for one coach;
// filter by coach and patch from the realtime payload when the data grows.
async function fetchAll(): Promise<DB> {
  const tables = await Promise.all(TABLES.map(fetchTable));
  return Object.fromEntries(TABLES.map((t, i) => [t, tables[i]])) as unknown as DB;
}

// Supabase returns at most 1000 rows per request, so read each table in pages until one comes back short.
const PAGE = 1000;
async function fetchTable(t: Table): Promise<Row[]> {
  const all: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    // Ordering by the whole primary key keeps pages stable, so no row is skipped or repeated.
    const query = PRIMARY_KEY[t].reduce((q, k) => q.order(k), supabase.from(t).select('*'));
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw error;
    all.push(...data);
    if (data.length < PAGE) return all;
  }
}

async function refresh() {
  try {
    emit(await fetchAll());
  } catch (e) {
    console.error(e);
  }
}

// A bulk change fires one realtime event per row. Re-reading on each one flooded Supabase
// (~6000 requests in a minute after inserting 5000 rows), so wait for a quiet moment,
// read once, and never run two reads at the same time.
let refreshTimer: ReturnType<typeof setTimeout> | undefined;
let reading: Promise<void> | null = null;
let readAgain = false;

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    if (reading) {
      readAgain = true;
      return;
    }
    reading = refresh().finally(() => {
      reading = null;
      if (readAgain) {
        readAgain = false;
        scheduleRefresh();
      }
    });
  }, 400);
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
    .on('postgres_changes', { event: '*', schema: 'public' }, scheduleRefresh)
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

/** The coach's students; only those at `gymId` when given. */
export const studentsOf = (d: DB, coachId: string, gymId?: string) =>
  d.users.filter((u) => u.role === 'student' && u.coachId === coachId && (!gymId || u.gymId === gymId));

export const coaches = (d: DB) => d.users.filter((u) => u.role === 'coach').sort((a, b) => a.name.localeCompare(b.name));

export const gymsSorted = (d: DB) => [...d.gyms].sort((a, b) => a.name.localeCompare(b.name));

/** The gyms the admin assigned to this coach, by name. */
export const gymsOf = (d: DB, coach: User) => gymsSorted(d).filter((g) => coach.gymIds?.includes(g.id));

export const coachByLogin = (d: DB, username: string, password: string) =>
  d.users.find((u) => u.role === 'coach' && u.username === username.trim() && u.password === password);

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

/** What the student has to do next time for this routine: the coach's one-off change, or the routine. */
export const plannedExercises = (routine: Routine) => routine.override ?? routine.exercises;

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

export type ActivityStatus = 'new' | 'ok' | 'risk' | 'inactive';

/**
 * How long since the student last registered, in calendar days (yesterday at 23:00 is 1, not 0),
 * and what that means: up to 3 days is ok, 4 to 7 is at risk, more is inactive, never is new.
 */
export function activityOf(d: DB, studentId: string): { last?: string; idleDays: number | null; status: ActivityStatus } {
  const last = lastActivity(d, studentId);
  const idleDays = last ? Math.round((Date.parse(today()) - Date.parse(dayOf(last))) / 86_400_000) : null;
  const status: ActivityStatus = idleDays === null ? 'new' : idleDays <= 3 ? 'ok' : idleDays <= 7 ? 'risk' : 'inactive';
  return { last, idleDays, status };
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
    exercises: plannedExercises(routine),
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };
  commit({
    ...db,
    sessions: [...db.sessions, session],
    routines: routine.override ? db.routines.map((r) => (r.id === routine.id ? { ...r, override: null } : r)) : db.routines,
  });
  return session.id;
}

export function finishSession(sessionId: string) {
  commit({
    ...db,
    sessions: db.sessions.map((s) => (s.id === sessionId ? { ...s, finishedAt: new Date().toISOString() } : s)),
  });
}

/** Saves one exercise as done or skipped. Saving it again replaces the previous values. */
export function saveLog(
  sessionId: string,
  exercise: PlannedExercise,
  status: ExerciseLog['status'],
  values: Prescription & Pick<ExerciseLog, 'setDetails'>,
) {
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
  gymId: string;
}): 'ok' | 'dni-taken' {
  const dni = normalizeDni(student.dni);
  const id = student.id ?? uid();
  if (db.users.some((u) => u.dni === dni && u.id !== id)) return 'dni-taken';
  const user: User = {
    id,
    name: student.name.trim(),
    role: 'student',
    coachId: student.coachId,
    gymId: student.gymId,
    dni,
    daysPerWeek: student.daysPerWeek,
  };
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

/**
 * Changes the exercises for one day only, without touching the routine: today's session if the
 * student already started it, otherwise the next time they do this routine. `null` undoes the change.
 */
export function customizeNext(routineId: string, exercises: PlannedExercise[] | null) {
  const routine = db.routines.find((r) => r.id === routineId);
  if (!routine) return;
  const open = openSession(db, routine.studentId);
  if (open?.routineId === routineId) {
    const planned = exercises ?? routine.exercises;
    commit({ ...db, sessions: db.sessions.map((s) => (s.id === open.id ? { ...s, exercises: planned } : s)) });
  } else {
    commit({ ...db, routines: db.routines.map((r) => (r.id === routineId ? { ...r, override: exercises } : r)) });
  }
}

/** Swaps a routine with the one before (-1) or after (+1) it. */
export function moveRoutine(id: string, direction: -1 | 1) {
  const routine = db.routines.find((r) => r.id === id);
  if (!routine) return;
  const other = db.routines.find((r) => r.studentId === routine.studentId && r.position === routine.position + direction);
  if (!other) return;
  commit({
    ...db,
    routines: db.routines.map((r) =>
      r.id === routine.id ? { ...r, position: other.position } : r.id === other.id ? { ...r, position: routine.position } : r,
    ),
  });
}

/** Weight per session for each exercise the student did, oldest first. */
export function progressOf(d: DB, studentId: string): { exercise: string; points: { day: string; weight: number }[] }[] {
  const sessions = new Map(sessionsOf(d, studentId).map((s) => [s.id, s]));
  const byExercise = new Map<string, { day: string; weight: number }[]>();
  d.logs
    .filter((l) => l.status === 'done' && sessions.has(l.sessionId))
    .sort((a, b) => sessions.get(a.sessionId)!.startedAt.localeCompare(sessions.get(b.sessionId)!.startedAt))
    .forEach((l) => {
      const points = byExercise.get(l.exerciseName) ?? [];
      points.push({ day: sessions.get(l.sessionId)!.startedAt, weight: l.weight });
      byExercise.set(l.exerciseName, points);
    });
  return [...byExercise].map(([exercise, points]) => ({ exercise, points }));
}

export const STALL_DAYS = 30;

/**
 * Exercises the student has lifted at the same weight for at least `days`, counted from the first
 * session at that weight to the last one. Bodyweight exercises (0 kg) don't count.
 */
export function stalledExercises(d: DB, studentId: string, days = STALL_DAYS): { exercise: string; weight: number; since: string }[] {
  return progressOf(d, studentId).flatMap(({ exercise, points }) => {
    const last = points.at(-1);
    if (!last || last.weight === 0) return [];
    let first = points.length - 1;
    while (first > 0 && points[first - 1].weight === last.weight) first--;
    const since = points[first].day;
    return Date.parse(last.day) - Date.parse(since) >= days * 86_400_000 ? [{ exercise, weight: last.weight, since }] : [];
  });
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

/** Creates `newStudents` and replaces the routines of every student present in `routines` (CSV import). History is kept. */
export function replaceRoutines(routines: Routine[], newStudents: User[] = []) {
  const students = new Set(routines.map((r) => r.studentId));
  commit({
    ...db,
    users: [...db.users, ...newStudents],
    routines: [...db.routines.filter((r) => !students.has(r.studentId)), ...routines],
  });
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

/** Replaces the student's routines with the plan's, in order. Weights start at 0 for the coach to set. History is kept. */
export function assignPlan(plan: Plan, studentId: string) {
  const student = getUser(db, studentId);
  if (!student?.coachId) return;
  const created = plan.routines.map<Routine>((r, i) => ({
    id: uid(),
    coachId: student.coachId!,
    studentId,
    position: i + 1,
    name: r.name,
    exercises: r.exercises.map((e) => ({
      id: uid(),
      exerciseId: e.exerciseId,
      name: getExercise(e.exerciseId)!.alias,
      sets: e.sets,
      reps: e.reps,
      weight: 0,
    })),
  }));
  commit({ ...db, routines: [...db.routines.filter((r) => r.studentId !== studentId), ...created] });
}

/** The routine's name and exercises replaced by a copy of the template, keeping its position. */
export const fromTemplate = (routine: Routine, template: RoutineTemplate): Routine => ({
  ...routine,
  name: template.name,
  templateId: template.id,
  exercises: copyExercises(template.exercises),
});

// ---------- admin actions ----------

export function saveGym(gym: Gym) {
  const exists = db.gyms.some((g) => g.id === gym.id);
  commit({ ...db, gyms: exists ? db.gyms.map((g) => (g.id === gym.id ? gym : g)) : [...db.gyms, gym] });
}

/** Creates or updates a coach. Returns 'username-taken' without saving if another coach has that username. */
export function saveCoach(coach: { id?: string; name: string; username: string; password: string; gymIds: string[] }): 'ok' | 'username-taken' {
  const id = coach.id ?? uid();
  const username = coach.username.trim();
  if (db.users.some((u) => u.username === username && u.id !== id)) return 'username-taken';
  const user: User = { id, name: coach.name.trim(), role: 'coach', username, password: coach.password, gymIds: coach.gymIds };
  const exists = db.users.some((u) => u.id === id);
  commit({ ...db, users: exists ? db.users.map((u) => (u.id === id ? user : u)) : [...db.users, user] });
  return 'ok';
}
