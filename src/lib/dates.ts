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

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function startOfWeek(iso: string): string {
  const d = fromISO(iso);
  const mondayOffset = (d.getDay() + 6) % 7;
  return addDays(iso, -mondayOffset);
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const formatDay = (iso: string) =>
  fromISO(iso).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });

export const formatShort = (iso: string) =>
  fromISO(iso).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });

export const isValidISO = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(fromISO(s).getTime());
