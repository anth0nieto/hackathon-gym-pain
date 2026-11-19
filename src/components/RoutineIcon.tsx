import type { Muscle } from '../data/exercises';

const svg = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// Paths from Lucide (ISC) and Tabler Icons (MIT): same 24px grid and 2px stroke.
const icons = {
  // Tabler "stretching": a lunge.
  legs: (
    <svg {...svg} aria-hidden="true">
      <path d="M16 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M5 20l5 -.5l1 -2" /><path d="M18 20v-5h-5.5l2.5 -6.5l-5.5 1l1.5 2" />
    </svg>
  ),
  // Lucide "biceps-flexed".
  arm: (
    <svg {...svg} aria-hidden="true">
      <path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1" />
      <path d="M15 14a5 5 0 0 0-7.584 2" /><path d="M9.964 6.825C8.019 7.977 9.5 13 8 15" />
    </svg>
  ),
  // Tabler "barbell".
  upper: (
    <svg {...svg} aria-hidden="true">
      <path d="M2 12h1" /><path d="M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2" />
      <path d="M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z" /><path d="M9 12h6" />
      <path d="M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z" />
      <path d="M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2" /><path d="M22 12h-1" />
    </svg>
  ),
  // Lucide "heart-pulse".
  cardio: (
    <svg {...svg} aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  ),
  // Lucide "person-standing".
  fullBody: (
    <svg {...svg} aria-hidden="true">
      <circle cx="12" cy="5" r="1" /><path d="m9 20 3-6 3 6" /><path d="m6 8 6 2 6-2" /><path d="M12 10v4" />
    </svg>
  ),
};

const ARMS: Muscle[] = ['Bíceps', 'Tríceps', 'Hombros'];
const UPPER: Muscle[] = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Abdomen'];

function kind(muscles: Muscle[]): keyof typeof icons {
  if (muscles.length === 0) return 'fullBody';
  const only = (group: Muscle[]) => muscles.every((m) => group.includes(m));
  if (only(['Piernas'])) return 'legs';
  if (only(['Cardio y funcional'])) return 'cardio';
  if (only(ARMS)) return 'arm';
  if (only(UPPER)) return 'upper';
  return 'fullBody';
}

/** Small icon for a routine, from the muscles it works: legs, arms, upper body, cardio or full body. */
export function RoutineIcon({ muscles }: { muscles: Muscle[] }) {
  return <span className="routine-icon">{icons[kind(muscles)]}</span>;
}
