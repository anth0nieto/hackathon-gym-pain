import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { resetDB, useDB } from '../data/store';
import { useSession } from '../session';

const COACH = { id: 'c1', user: 'coach', password: 'coach123' };

export function Login() {
  const db = useDB();
  const { user, login } = useSession();
  const [coachError, setCoachError] = useState(false);
  if (user) return <Navigate to={user.role === 'coach' ? '/coach' : '/alumno'} replace />;

  const students = db.users.filter((u) => u.role === 'student');

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
      <h1>¿Quién sos?</h1>
      <section className="card stack-sm">
        <h2>Coach</h2>
        <form className="stack-sm" onSubmit={loginCoach}>
          <input name="user" placeholder="Usuario" autoComplete="username" required />
          <input name="password" type="password" placeholder="Contraseña" autoComplete="current-password" required />
          {coachError && <p className="small warn">Usuario o contraseña incorrectos.</p>}
          <button className="btn btn-block">Entrar</button>
        </form>
      </section>
      <section className="card stack-sm">
        <h2>Alumno</h2>
        {students.map((u) => (
          <button key={u.id} className="btn btn-block btn-secondary" onClick={() => login(u.id)}>{u.name}</button>
        ))}
      </section>
      <button className="btn-link muted" onClick={() => confirm('¿Borrar todos los datos y volver al ejemplo?') && resetDB()}>
        Reiniciar datos de ejemplo
      </button>
    </div>
  );
}
