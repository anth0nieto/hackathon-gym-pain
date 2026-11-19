export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function fromISO(iso: string): Date {
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
