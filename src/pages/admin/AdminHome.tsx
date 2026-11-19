import { useState, type FormEvent } from 'react';
import { coaches, gymsSorted, saveCoach, saveGym, studentsOf, useDB } from '../../data/store';
import { uid } from '../../lib/id';
import { initials } from '../../lib/initials';
import { useCurrentUser, useSession } from '../../session';
import type { User } from '../../types';
import { UserMenu } from '../../components/UserMenu';

const EMPTY_COACH = { name: '', username: '', password: '', gymIds: [] as string[] };

/** The single admin creates gyms and coaches, and picks which gyms each coach works at. */
export function AdminHome() {
  const db = useDB();
  const admin = useCurrentUser();
  const { logout } = useSession();
  const gyms = gymsSorted(db);
  const [gymName, setGymName] = useState('');
  const [editing, setEditing] = useState<string | undefined>();
  const [form, setForm] = useState(EMPTY_COACH);
  const [taken, setTaken] = useState(false);

  const addGym = (e: FormEvent) => {
    e.preventDefault();
    if (!gymName.trim()) return;
    saveGym({ id: uid(), name: gymName.trim() });
    setGymName('');
  };

  const edit = (c: User) => {
    setEditing(c.id);
    setForm({ name: c.name, username: c.username ?? '', password: c.password ?? '', gymIds: c.gymIds ?? [] });
    setTaken(false);
  };

  const reset = () => { setEditing(undefined); setForm(EMPTY_COACH); setTaken(false); };

  const submitCoach = (e: FormEvent) => {
    e.preventDefault();
    const result = saveCoach({ id: editing, ...form });
    setTaken(result === 'username-taken');
    if (result === 'ok') reset();
  };

  const toggleGym = (id: string) =>
    setForm((f) => ({ ...f, gymIds: f.gymIds.includes(id) ? f.gymIds.filter((g) => g !== id) : [...f.gymIds, id] }));

  const valid = form.name.trim() && form.username.trim() && form.password;

  return (
    <div className="coach-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="sidebar-logo" src="/brand/forza-logo-dark.svg" alt="Forza" />
          <span>Administración</span>
        </div>
        <div className="sidebar-user">
          <span className="avatar avatar-sm" aria-hidden="true">{initials(admin.name)}</span>
          <span className="sidebar-user-name">{admin.name}</span>
          <UserMenu user={admin} onLogout={logout} trigger="Salir" triggerClassName="btn-link sidebar-logout" />
        </div>
      </aside>
      <main className="coach-main stack">
        <h1>Gimnasios</h1>
        <ul className="card stack-sm">
          {gyms.map((g) => (
            <li key={g.id}>
              <strong>{g.name}</strong>{' '}
              <span className="muted small">
                {coaches(db).filter((c) => c.gymIds?.includes(g.id)).length} coaches ·{' '}
                {db.users.filter((u) => u.role === 'student' && u.gymId === g.id).length} alumnos
              </span>
            </li>
          ))}
          {!gyms.length && <li className="muted">Todavía no hay gimnasios.</li>}
        </ul>
        <form className="row" onSubmit={addGym}>
          <input placeholder="Nombre del gimnasio" value={gymName} onChange={(e) => setGymName(e.target.value)} required />
          <button className="btn">Agregar gimnasio</button>
        </form>

        <h1>Coaches</h1>
        <ul className="card stack-sm">
          {coaches(db).map((c) => (
            <li key={c.id} className="row">
              <span>
                <strong>{c.name}</strong> <span className="muted small">@{c.username ?? '—'} · {studentsOf(db, c.id).length} alumnos</span>
                <br />
                <span className="small">
                  {gyms.filter((g) => c.gymIds?.includes(g.id)).map((g) => g.name).join(', ') || 'Sin gimnasios'}
                </span>
              </span>
              <button type="button" className="btn-link" onClick={() => edit(c)}>Editar</button>
            </li>
          ))}
        </ul>

        <form className="card stack-sm" onSubmit={submitCoach}>
          <h2>{editing ? `Editar a ${form.name || 'coach'}` : 'Nuevo coach'}</h2>
          <label className="field">
            <span>Nombre y apellido</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" required />
          </label>
          <label className="field">
            <span>Usuario</span>
            <input
              value={form.username}
              onChange={(e) => { setForm({ ...form, username: e.target.value }); setTaken(false); }}
              autoComplete="off"
              required
            />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" required />
          </label>
          <fieldset className="field">
            <span>Gimnasios donde trabaja</span>
            {gyms.map((g) => (
              <label key={g.id} className="row">
                <input type="checkbox" checked={form.gymIds.includes(g.id)} onChange={() => toggleGym(g.id)} />
                {g.name}
              </label>
            ))}
          </fieldset>
          {taken && <p className="small warn">Ya hay un coach con ese usuario.</p>}
          <button className="btn btn-block" disabled={!valid}>{editing ? 'Guardar cambios' : 'Crear coach'}</button>
          {editing && <button type="button" className="btn-link" onClick={reset}>Cancelar</button>}
        </form>
      </main>
    </div>
  );
}
