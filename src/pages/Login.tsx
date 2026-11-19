import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { studentByDni, useDB } from '../data/store';
import { useSession } from '../session';

const COACH = { id: 'c1', user: 'coach', password: 'coach123' };

/** Students arrive from the gym QR, so the DNI form comes first; the coach login sits below. */
export function Login() {
  const db = useDB();
  const { user, login } = useSession();
  const [dniError, setDniError] = useState(false);
  const [coachError, setCoachError] = useState(false);
  if (user) return <Navigate to={user.role === 'coach' ? '/coach' : '/alumno'} replace />;

  function loginStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const student = studentByDni(db, String(new FormData(e.currentTarget).get('dni') ?? ''));
    setDniError(!student);
    if (student) login(student.id);
  }

  // Demo only: the coach credentials ship in the bundle. Replace with Supabase Auth before real use.
  function loginCoach(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const ok = form.get('user') === COACH.user && form.get('password') === COACH.password;
    setCoachError(!ok);
    if (ok) login(COACH.id);
  }

  return (
    <div className="login">
      <div className="login-glow" aria-hidden="true" />
      <header className="login-bar glass">
        <span className="login-brand">Rutinas</span>
        <span className="login-tag">Escaneá · Entrá · Entrená</span>
      </header>

      <main className="login-main">
        <p className="login-kicker">Tu rutina del día, en tu celular</p>
        <h1 className="login-title">
          <span className="login-title-soft">Registrá</span> tu entrenamiento
        </h1>

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
          <form className="login-coach-form" onSubmit={loginCoach}>
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
