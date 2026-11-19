import { NavLink, Outlet } from 'react-router-dom';
import { activityOf, studentsOf, useDB } from '../data/store';
import { useCurrentUser, useSession } from '../session';

/** Coach shell: a dark sidebar on desktop that turns into a top bar on phones. */
export function CoachLayout() {
  const db = useDB();
  const coach = useCurrentUser();
  const { logout } = useSession();
  const atRisk = studentsOf(db, coach.id).filter((s) => ['risk', 'inactive'].includes(activityOf(db, s.id).status)).length;

  const links = [
    { to: '/coach', label: 'Alumnos', end: true, count: atRisk },
    { to: '/coach/plantillas', label: 'Mis rutinas' },
    { to: '/coach/importar', label: 'Importar CSV' },
    { to: '/coach/qr', label: 'QR del gimnasio' },
  ];

  return (
    <div className="coach-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <strong>Rutinas</strong>
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
          <span>{coach.name}</span>
          <button className="btn-link" onClick={logout}>Salir</button>
        </div>
      </aside>
      <main className="coach-main">
        <Outlet />
      </main>
    </div>
  );
}
