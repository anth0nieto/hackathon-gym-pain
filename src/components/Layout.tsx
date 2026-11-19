import { Link, Outlet } from 'react-router-dom';
import { useSession } from '../session';
import { StudentTabBar } from './StudentTabBar';

export function Layout() {
  const { user, logout } = useSession();
  const isStudent = user?.role === 'student';
  return (
    <div className="app">
      <header className="topbar">
        <Link to={user?.role === 'coach' ? '/coach' : '/alumno'} className="brand">Rutinas</Link>
        {user && (
          <div className="topbar-user">
            <span>{user.name}</span>
            <button className="btn-link" onClick={logout}>Salir</button>
          </div>
        )}
      </header>
      <main className={`content${isStudent ? ' has-tabbar' : ''}`}>
        <Outlet />
      </main>
      {isStudent && <StudentTabBar />}
    </div>
  );
}
