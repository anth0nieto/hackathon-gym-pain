import type { Routine, User } from '../types';
import { isValidISO } from '../lib/dates';
import { uid } from '../lib/id';

export const CSV_COLUMNS = ['alumno', 'fecha', 'rutina', 'ejercicio', 'series', 'reps', 'peso'] as const;

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

function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  if (isValidISO(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return isValidISO(iso) ? iso : null;
}

const toNumber = (s: string) => Number(s.trim().replace(',', '.'));

export interface CsvResult {
  routines: Routine[];
  errors: string[];
}

export function parseRoutinesCsv(text: string, coachId: string, students: User[]): CsvResult {
  const rows = parseRows(text);
  const errors: string[] = [];
  if (rows.length < 2) return { routines: [], errors: ['El CSV está vacío.'] };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = Object.fromEntries(CSV_COLUMNS.map((c) => [c, header.indexOf(c)])) as Record<(typeof CSV_COLUMNS)[number], number>;
  const missing = CSV_COLUMNS.filter((c) => col[c] === -1);
  if (missing.length) return { routines: [], errors: [`Faltan columnas: ${missing.join(', ')}`] };

  const byKey = new Map<string, Routine>();
  rows.slice(1).forEach((r, i) => {
    const line = i + 2;
    const get = (c: (typeof CSV_COLUMNS)[number]) => (r[col[c]] ?? '').trim();

    const who = get('alumno').toLowerCase();
    const student = students.find((s) => s.name.toLowerCase() === who || s.id.toLowerCase() === who);
    if (!student) return errors.push(`Fila ${line}: no encuentro al alumno "${get('alumno')}".`);

    const date = normalizeDate(get('fecha'));
    if (!date) return errors.push(`Fila ${line}: fecha inválida "${get('fecha')}" (usá AAAA-MM-DD o DD/MM/AAAA).`);

    const name = get('ejercicio');
    if (!name) return errors.push(`Fila ${line}: falta el ejercicio.`);

    const [sets, reps, weight] = [toNumber(get('series')), toNumber(get('reps')), toNumber(get('peso') || '0')];
    if ([sets, reps, weight].some((n) => isNaN(n) || n < 0)) return errors.push(`Fila ${line}: series/reps/peso deben ser números.`);

    const routineName = get('rutina') || 'Rutina';
    const key = `${student.id}|${date}|${routineName}`;
    if (!byKey.has(key)) {
      byKey.set(key, { id: uid(), coachId, studentId: student.id, date, name: routineName, exercises: [] });
    }
    byKey.get(key)!.exercises.push({ id: uid(), name, sets, reps, weight });
  });

  return { routines: [...byKey.values()], errors };
}
