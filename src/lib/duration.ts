import type { Session } from '../types';

/** Elapsed time as a clock: 4:07 or 1:04:07. */
export function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

/** Rounded duration for summaries: 42 min or 1 h 05 min. */
export function humanDuration(ms: number): string {
  const min = Math.round(ms / 60_000);
  if (min < 1) return 'menos de 1 min';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
}

/** Only sessions closed with Finalizar have a real duration; auto-closed ones don't. */
export const sessionDuration = (s: Session): number | undefined =>
  s.finishedAt ? new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime() : undefined;
