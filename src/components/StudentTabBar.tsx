import { NavLink } from 'react-router-dom';

const icon = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const HomeIcon = () => (
  <svg {...icon} aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>
);
const PlayIcon = () => (
  <svg {...icon} aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" /></svg>
);
const StatsIcon = () => (
  <svg {...icon} aria-hidden="true"><path d="M6 20v-6" /><path d="M12 20V8" /><path d="M18 20v-10" /></svg>
);

const tabs = [
  { to: '/alumno', label: 'Inicio', Icon: HomeIcon, end: true },
  { to: '/alumno/entrenar', label: 'Entrenar', Icon: PlayIcon, end: false },
  { to: '/alumno/stats', label: 'Mi actividad', Icon: StatsIcon, end: false },
];

export function StudentTabBar() {
  return (
    <nav className="tabbar" aria-label="Navegación">
      {tabs.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} aria-label={label} title={label} className={({ isActive }) => `tabbar-item${isActive ? ' is-active' : ''}`}>
          <Icon />
        </NavLink>
      ))}
    </nav>
  );
}
