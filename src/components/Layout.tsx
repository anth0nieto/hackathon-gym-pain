import { Link, Outlet } from 'react-router-dom';
import { useSession } from '../session';
import { StudentTabBar } from './StudentTabBar';
import { UserMenu } from './UserMenu';

export function Layout() {
  const { user, logout } = useSession();
  const isStudent = user?.role === 'student';
  return (
    <div className="app">
      <header className="topbar">
        <Link to={user?.role === 'coach' ? '/coach' : '/alumno'} className="brand">
          <picture>
            <source srcSet="/brand/forza-logo-dark.svg" media="(prefers-color-scheme: dark)" />
            <img className="brand-logo" src="/brand/forza-logo-light.svg" alt="Forza" />
          </picture>
        </Link>
        {user && <UserMenu user={user} onLogout={logout} />}
      </header>
      <main className={`content${isStudent ? ' has-tabbar' : ''}`}>
        <Outlet />
      </main>
      {isStudent && <StudentTabBar />}
    </div>
  );
}
