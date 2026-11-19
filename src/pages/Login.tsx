import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { coachByLogin, studentByDni, useDB } from '../data/store';
import { ADMIN, homeOf, useSession } from '../session';

function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="login">
      <div className="login-glow" aria-hidden="true" />
      <header className="login-bar">
        <img className="login-brand" src="/brand/forza-logo-dark.svg" alt="Forza" />
      </header>
      <main className="login-main">{children}</main>
    </div>
  );
}

/** Students arrive from the gym QR, so this page is only the DNI form; staff go to /login. */
export function Login() {
  const db = useDB();
  const { user, login } = useSession();
  const [dniError, setDniError] = useState(false);
  // The gym QR opens /?gym=<id>, so the student sees which gym they're entering.
  const gym = db.gyms.find((g) => g.id === useSearchParams()[0].get('gym'));
  if (user) return <Navigate to={homeOf(user.role)} replace />;

  function loginStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const student = studentByDni(db, String(new FormData(e.currentTarget).get('dni') ?? ''));
    setDniError(!student);
    if (student) login(student.id);
  }

  return (
    <LoginShell>
      {gym && <p className="login-kicker">{gym.name}</p>}
      <h1 className="login-title">Registrá tu entrenamiento</h1>
      <p className="login-kicker">Entrá con tu DNI y mirá la rutina que te toca hoy.</p>

      <form className="glass login-card" onSubmit={loginStudent}>
        <label className="login-field">
          <span>Tu DNI</span>
          <input
            name="dni"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Sin puntos"
            autoFocus
            required
            onChange={() => setDniError(false)}
          />
        </label>
        {dniError && <p className="login-error">No encontramos ese DNI. Pedile a tu coach que te dé de alta.</p>}
        <button className="login-btn">Entrar</button>
      </form>

      <Link to="/login" className="login-btn login-btn-ghost">Soy coach o administrador</Link>
    </LoginShell>
  );
}

/** Coaches and the admin log in with username and password; each lands on their own panel. */
export function StaffLogin() {
  const db = useDB();
  const { user, login } = useSession();
  const [error, setError] = useState(false);
  if (user) return <Navigate to={homeOf(user.role)} replace />;

  // Demo only: coach passwords are readable with the publishable key and the admin's ship in the bundle.
  // Replace with Supabase Auth before real use.
  function loginStaff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get('user') ?? '');
    const password = String(form.get('password') ?? '');
    const id = username === ADMIN.username && password === ADMIN.password ? ADMIN.id : coachByLogin(db, username, password)?.id;
    setError(!id);
    if (id) login(id);
  }

  return (
    <LoginShell>
      <h1 className="login-title">Panel de coaches</h1>
      <p className="login-kicker">Entrá con el usuario y la contraseña que te dio el administrador.</p>

      <form className="glass login-card" onSubmit={loginStaff}>
        <label className="login-field">
          <span>Usuario</span>
          <input name="user" autoComplete="username" autoFocus required onChange={() => setError(false)} />
        </label>
        <label className="login-field">
          <span>Contraseña</span>
          <input name="password" type="password" autoComplete="current-password" required onChange={() => setError(false)} />
        </label>
        {error && <p className="login-error">Usuario o contraseña incorrectos.</p>}
        <button className="login-btn">Entrar</button>
      </form>

      <Link to="/" className="login-btn login-btn-ghost">Soy alumno, entrar con DNI</Link>
    </LoginShell>
  );
}
