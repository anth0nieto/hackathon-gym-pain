import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../lib/theme';
import { useSession } from '../session';
import { StudentTabBar } from './StudentTabBar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Layout() {
  const { user, logout } = useSession();
  const isStudent = user?.role === 'student';
  const theme = useTheme();
  return (
    <div className="app">
      <header className="topbar">
        <Link to={user?.role === 'coach' ? '/coach' : '/alumno'} className="brand">
          <img className="brand-logo" src={`/brand/forza-logo-${theme}.svg`} alt="Forza" />
        </Link>
        <div className="topbar-user">
          <ThemeToggle />
          {user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </header>
      <main className={`content${isStudent ? ' has-tabbar' : ''}`}>
        <Outlet />
      </main>
      {isStudent && <StudentTabBar />}
    </div>
  );
}
