import { NavLink, Outlet } from 'react-router-dom';
import { activityOf, studentsOf, useDB } from '../data/store';
import { initials } from '../lib/initials';
import { useCurrentUser, useSession } from '../session';
import { UserMenu } from './UserMenu';

/** Coach shell: a dark sidebar on desktop that turns into a top bar on phones. */
export function CoachLayout() {
  const db = useDB();
  const coach = useCurrentUser();
  const { logout } = useSession();
  const atRisk = studentsOf(db, coach.id).filter((s) => ['risk', 'inactive'].includes(activityOf(db, s.id).status)).length;

  const links = [
    { to: '/coach', label: 'Alumnos', end: true, count: atRisk },
    { to: '/coach/planes', label: 'Planes' },
    { to: '/coach/ejercicios', label: 'Ejercicios' },
    { to: '/coach/plantillas', label: 'Mis rutinas' },
    { to: '/coach/importar', label: 'Importar CSV' },
    { to: '/coach/qr', label: 'QR del gimnasio' },
  ];

  return (
    <div className="coach-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="sidebar-logo" src="/brand/forza-logo-dark.svg" alt="Forza" />
          <span>Panel del coach</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="sidebar-link">
              <span>{l.label}</span>
              {!!l.count && <span className="sidebar-count" title="Alumnos en riesgo o inactivos">{l.count}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar avatar-sm" aria-hidden="true">{initials(coach.name)}</span>
          <span className="sidebar-user-name">{coach.name}</span>
          <UserMenu user={coach} onLogout={logout} trigger="Salir" triggerClassName="btn-link sidebar-logout" />
        </div>
      </aside>
      <main className="coach-main">
        <Outlet />
      </main>
    </div>
  );
}
