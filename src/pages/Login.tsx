import { Navigate } from 'react-router-dom';
import { resetDB, useDB } from '../data/store';
import { useSession } from '../session';

export function Login() {
  const db = useDB();
  const { user, login } = useSession();
  if (user) return <Navigate to={user.role === 'coach' ? '/coach' : '/alumno'} replace />;

  const coaches = db.users.filter((u) => u.role === 'coach');
  const students = db.users.filter((u) => u.role === 'student');

  return (
    <div className="stack">
      <h1>¿Quién sos?</h1>
      <section className="card stack-sm">
        <h2>Coach</h2>
        {coaches.map((u) => (
          <button key={u.id} className="btn btn-block" onClick={() => login(u.id)}>{u.name}</button>
        ))}
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
