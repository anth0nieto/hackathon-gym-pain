import { NavLink, Outlet } from 'react-router-dom';
import { activityOf, studentsOf, useDB } from '../data/store';
import { initials } from '../lib/initials';
import { useCurrentUser, useGym, useSession } from '../session';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

/** Coach shell: a dark sidebar on desktop that turns into a top bar on phones. */
export function CoachLayout() {
  const db = useDB();
  const coach = useCurrentUser();
  const { logout } = useSession();
  const { gym, gyms, setGymId } = useGym();
  const atRisk = studentsOf(db, coach.id, gym?.id ?? '-').filter((s) => ['risk', 'inactive'].includes(activityOf(db, s.id).status)).length;

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
        {gyms.length > 1 ? (
          <label className="sidebar-gym">
            <span>Gimnasio</span>
            <select value={gym?.id} onChange={(e) => setGymId(e.target.value)}>
              {gyms.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
        ) : gym && <p className="sidebar-gym"><span>Gimnasio</span><strong>{gym.name}</strong></p>}
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
          <ThemeToggle className="theme-toggle sidebar-theme" />
          <UserMenu user={coach} onLogout={logout} trigger="Salir" triggerClassName="btn-link sidebar-logout" />
        </div>
      </aside>
      <main className="coach-main">
        {gym ? (
          <Outlet key={gym.id} />
        ) : (
          <div className="stack">
            <h1>Sin gimnasios</h1>
            <p className="muted">Todavía no tenés gimnasios asignados. Pedile al administrador que te asigne uno.</p>
          </div>
        )}
      </main>
    </div>
  );
}
