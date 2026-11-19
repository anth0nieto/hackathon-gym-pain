import { setTheme, useTheme } from '../lib/theme';

const svg = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// Lucide "sun" and "moon" (ISC).
const Sun = () => (
  <svg {...svg} aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);
const Moon = () => (
  <svg {...svg} aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);

/** Switches between light and dark mode. Shows what you switch to. */
export function ThemeToggle({ className = 'theme-toggle' }: { className?: string }) {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  const label = next === 'dark' ? 'Pasar a modo oscuro' : 'Pasar a modo claro';
  return (
    <button type="button" className={className} aria-label={label} title={label} onClick={() => setTheme(next)}>
      {next === 'dark' ? <Moon /> : <Sun />}
    </button>
  );
}
