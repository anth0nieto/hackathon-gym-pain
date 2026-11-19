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
    <div className="stack">
      <h1>Registrá tu entrenamiento</h1>
      <form className="card stack-sm" onSubmit={loginStudent}>
        <label className="field">
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
        {dniError && <p className="small warn">No encontramos ese DNI. Pedile a tu coach que te dé de alta.</p>}
        <button className="btn btn-block">Entrar</button>
      </form>

      <details className="card stack-sm">
        <summary className="muted">Soy coach</summary>
        <form className="stack-sm" onSubmit={loginCoach}>
          <input name="user" placeholder="Usuario" autoComplete="username" required />
          <input name="password" type="password" placeholder="Contraseña" autoComplete="current-password" required />
          {coachError && <p className="small warn">Usuario o contraseña incorrectos.</p>}
          <button className="btn btn-block">Entrar</button>
        </form>
      </details>
    </div>
  );
}
