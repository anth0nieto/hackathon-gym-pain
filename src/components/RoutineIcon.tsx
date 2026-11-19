import type { Muscle } from '../data/exercises';

const svg = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const icons = {
  legs: (
    <svg {...svg} aria-hidden="true">
      <path d="M7 3h10" /><path d="M7.5 3 7 12l1.5 9" /><path d="M16.5 3l.5 9-1.5 9" /><path d="M12 3v5" /><path d="M8.5 21H6" /><path d="M15.5 21H18" />
    </svg>
  ),
  arm: (
    <svg {...svg} aria-hidden="true">
      <path d="M4 20h9a5 5 0 0 0 5-5c0-2.5-1.8-4.3-4-4.6L12.5 8 14 4h-3l-2.5 4.5C6 10.5 4 14 4 20z" /><path d="M10 14.5c1.2-.8 2.8-.8 4 .5" />
    </svg>
  ),
  torso: (
    <svg {...svg} aria-hidden="true">
      <path d="M8.5 4C6 4.8 4 6.5 4 9l1 4h3v7h8v-7h3l1-4c0-2.5-2-4.2-4.5-5-.8 1.3-2 2-3.5 2s-2.7-.7-3.5-2z" />
    </svg>
  ),
  heart: (
    <svg {...svg} aria-hidden="true">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path d="M5.5 12h3l1.5-2.5 2 5 1.5-2.5h5" />
    </svg>
  ),
  dumbbell: (
    <svg {...svg} aria-hidden="true">
      <path d="M6.5 7v10" /><path d="M17.5 7v10" /><path d="M3.5 9.5v5" /><path d="M20.5 9.5v5" /><path d="M6.5 12h11" />
    </svg>
  ),
};

const ARMS: Muscle[] = ['Bíceps', 'Tríceps', 'Hombros'];
const UPPER: Muscle[] = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Abdomen'];

function kind(muscles: Muscle[]): keyof typeof icons {
  if (muscles.length === 0) return 'dumbbell';
  const only = (group: Muscle[]) => muscles.every((m) => group.includes(m));
  if (only(['Piernas'])) return 'legs';
  if (only(['Cardio y funcional'])) return 'heart';
  if (only(ARMS)) return 'arm';
  if (only(UPPER)) return 'torso';
  return 'dumbbell';
}

/** Small icon for a routine, from the muscles it works: legs, arms, upper body, cardio or full body. */
export function RoutineIcon({ muscles }: { muscles: Muscle[] }) {
  return <span className="routine-icon">{icons[kind(muscles)]}</span>;
}
