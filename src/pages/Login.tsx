import { useState, type FormEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { coachByLogin, studentByDni, useDB } from '../data/store';
import { ADMIN, homeOf, useSession } from '../session';

/** Students arrive from the gym QR, so the DNI form comes first; the coach login sits below. */
export function Login() {
  const db = useDB();
  const { user, login } = useSession();
  const [dniError, setDniError] = useState(false);
  const [coachError, setCoachError] = useState(false);
  // The gym QR opens /?gym=<id>, so the student sees which gym they're entering.
  const gym = db.gyms.find((g) => g.id === useSearchParams()[0].get('gym'));
  if (user) return <Navigate to={homeOf(user.role)} replace />;

  function loginStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const student = studentByDni(db, String(new FormData(e.currentTarget).get('dni') ?? ''));
    setDniError(!student);
    if (student) login(student.id);
  }

  // Demo only: coach passwords are readable with the publishable key and the admin's ship in the bundle.
  // Replace with Supabase Auth before real use.
  function loginStaff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get('user') ?? '');
    const password = String(form.get('password') ?? '');
    const id = username === ADMIN.username && password === ADMIN.password ? ADMIN.id : coachByLogin(db, username, password)?.id;
    setCoachError(!id);
    if (id) login(id);
  }

  return (
    <div className="login">
      <div className="login-glow" aria-hidden="true" />
      <header className="login-bar">
        <img className="login-brand" src="/brand/forza-logo-dark.svg" alt="Forza" />
      </header>

      <main className="login-main">
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

        <details className="glass login-card login-coach">
          <summary>Soy coach</summary>
          <form className="login-coach-form" onSubmit={loginStaff}>
            <input name="user" placeholder="Usuario" autoComplete="username" required />
            <input name="password" type="password" placeholder="Contraseña" autoComplete="current-password" required />
            {coachError && <p className="login-error">Usuario o contraseña incorrectos.</p>}
            <button className="login-btn">Entrar</button>
          </form>
        </details>
      </main>
    </div>
  );
}
