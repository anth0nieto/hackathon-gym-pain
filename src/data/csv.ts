import type { Routine, User } from '../types';
import { uid } from '../lib/id';
import { exerciseFor } from './exercises';

export const CSV_COLUMNS = ['alumno', 'rutina', 'ejercicio', 'series', 'reps', 'peso'] as const;
/** With `dni`, a student who isn't in the app yet gets created; `dias` is how many days a week they train. */
export const OPTIONAL_COLUMNS = ['dni', 'dias'] as const;

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const delimiter = text.split('\n')[0].includes(';') && !text.split('\n')[0].includes(',') ? ';' : ',';

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const toNumber = (s: string) => Number(s.trim().replace(',', '.'));

export interface CsvResult {
  routines: Routine[];
  /** Students in the CSV who aren't in the app yet; importing creates them. */
  newStudents: User[];
  errors: string[];
}

const digits = (s: string) => s.replace(/\D/g, '');

export function parseRoutinesCsv(text: string, coachId: string, students: User[]): CsvResult {
  const rows = parseRows(text);
  const errors: string[] = [];
  if (rows.length < 2) return { routines: [], newStudents: [], errors: ['El CSV está vacío.'] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  type Column = (typeof CSV_COLUMNS)[number] | (typeof OPTIONAL_COLUMNS)[number];
  const col = Object.fromEntries([...CSV_COLUMNS, ...OPTIONAL_COLUMNS].map((c) => [c, header.indexOf(c)])) as Record<Column, number>;
  const missing = CSV_COLUMNS.filter((c) => col[c] === -1);
  if (missing.length) return { routines: [], newStudents: [], errors: [`Faltan columnas: ${missing.join(', ')}`] };

  const byKey = new Map<string, Routine>();
  const newStudents: User[] = [];
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const get = (c: Column) => (col[c] === -1 ? '' : (r[col[c]] ?? '').trim());

    // With a DNI, only the DNI identifies the student (two people can share a name); without one, the name does.
    // A student with a DNI who isn't in the app yet gets created.
    const dni = digits(get('dni'));
    const who = get('alumno').toLowerCase();
    const days = get('dias') ? Number(get('dias')) : undefined;
    if (days !== undefined && !(Number.isInteger(days) && days >= 1 && days <= 7)) {
      return errors.push(`Fila ${line}: "dias" tiene que ser un número del 1 al 7.`);
    }
    const known = [...students, ...newStudents];
    let student = dni
      ? known.find((s) => s.dni === dni)
      : known.find((s) => s.name.toLowerCase() === who || s.id.toLowerCase() === who);
    if (!student && dni && who) {
      student = { id: uid(), name: get('alumno'), role: 'student', coachId, dni, daysPerWeek: days };
      newStudents.push(student);
    }
    if (!student) return errors.push(`Fila ${line}: no encuentro al alumno "${get('alumno')}". Agregá su DNI en la columna "dni" para crearlo.`);

    const name = get('ejercicio');
    if (!name) return errors.push(`Fila ${line}: falta el ejercicio.`);
    const exercise = exerciseFor({ name });
    if (!exercise) return errors.push(`Fila ${line}: "${name}" no está en la lista de ejercicios.`);

    const [sets, reps, weight] = [toNumber(get('series')), toNumber(get('reps')), toNumber(get('peso') || '0')];
    if ([sets, reps, weight].some((n) => isNaN(n) || n < 0)) return errors.push(`Fila ${line}: series/reps/peso deben ser números.`);

    const routineName = get('rutina') || 'Rutina';
    const key = `${student.id}|${routineName}`;
    if (!byKey.has(key)) {
      // The order each routine first appears in for a student is its position: 1, 2, 3.
      const position = [...byKey.values()].filter((x) => x.studentId === student.id).length + 1;
      byKey.set(key, { id: uid(), coachId, studentId: student.id, position, name: routineName, exercises: [] });
    }
    // Keep the coach's own wording ("Sentadilla"); exerciseId is what links it to the exercise list.
    byKey.get(key)!.exercises.push({ id: uid(), exerciseId: exercise.id, name, sets, reps, weight });
  });

  const routines = [...byKey.values()];
  // A new student without "dias" trains as many days as routines they got.
  for (const s of newStudents) s.daysPerWeek ??= routines.filter((r) => r.studentId === s.id).length;
  return { routines, newStudents, errors };
}
