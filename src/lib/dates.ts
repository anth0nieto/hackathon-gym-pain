export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const today = () => toISO(new Date());

export function startOfWeek(iso: string): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISO(d);
}

export const formatDay = (iso: string) =>
  fromISO(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });

/** Local calendar day of a timestamp: a session at 22:00 in Argentina belongs to that day, not the next UTC day. */
export const dayOf = (timestamp: string) => toISO(new Date(timestamp));

export const isValidISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(fromISO(s).getTime());

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function weekLabel(iso: string): string {
  const weeks = Math.round((fromISO(startOfWeek(iso)).getTime() - fromISO(startOfWeek(today())).getTime()) / (7 * 86_400_000));
  if (weeks === 0) return 'Esta semana';
  if (weeks === -1) return 'Semana pasada';
  if (weeks === 1) return 'Próxima semana';
  const days = weekDays(iso);
  const fmt = (d: string) => fromISO(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  return `${fmt(days[0])} – ${fmt(days[6])}`;
}
