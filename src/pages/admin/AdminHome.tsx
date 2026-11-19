import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'gimnasios' ? 'gimnasios' : 'coaches';
  const gyms = gymsSorted(db);
  const allCoaches = coaches(db);
  const studentsAt = (gymId: string) => db.users.filter((u) => u.role === 'student' && u.gymId === gymId).length;

  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<string | undefined>();
  const [form, setForm] = useState(EMPTY_COACH);
  const [taken, setTaken] = useState(false);
  const [gymName, setGymName] = useState('');

  const openCoach = (c?: User) => {
    setEditing(c?.id);
    setForm(c ? { name: c.name, username: c.username ?? '', password: c.password ?? '', gymIds: c.gymIds ?? [] } : EMPTY_COACH);
    setTaken(false);
    dialog.current?.showModal();
  };
  const closeCoach = () => dialog.current?.close();

  const submitCoach = (e: FormEvent) => {
    e.preventDefault();
    const result = saveCoach({ id: editing, ...form, name: form.name.trim(), username: form.username.trim() });
    setTaken(result === 'username-taken');
    if (result === 'ok') closeCoach();
  };

  const toggleGym = (id: string) =>
    setForm((f) => ({ ...f, gymIds: f.gymIds.includes(id) ? f.gymIds.filter((g) => g !== id) : [...f.gymIds, id] }));

  const addGym = (e: FormEvent) => {
    e.preventDefault();
    if (!gymName.trim()) return;
    saveGym({ id: uid(), name: gymName.trim() });
    setGymName('');
  };

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

      <main className="coach-main">
        <div className="stack page-wide">
          <div className="page-head">
            <div>
              <p className="muted small">Administración</p>
              <h1 className="page-title">{tab === 'coaches' ? 'Coaches' : 'Gimnasios'}</h1>
            </div>
            {tab === 'coaches' && <button className="btn" onClick={() => openCoach()}>+ Nuevo coach</button>}
          </div>

          <div className="tabs" role="tablist" aria-label="Secciones de administración">
            {(['coaches', 'gimnasios'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`tab ${tab === t ? 'is-active' : ''}`}
                onClick={() => setParams(t === 'coaches' ? {} : { tab: t }, { replace: true })}
              >
                {t === 'coaches' ? `Coaches · ${allCoaches.length}` : `Gimnasios · ${gyms.length}`}
              </button>
            ))}
          </div>

          {tab === 'coaches' && (
            <div className="table-card" role="tabpanel">
              {allCoaches.length === 0 && <p className="empty">Todavía no hay coaches. Creá el primero con “+ Nuevo coach”.</p>}
              {allCoaches.length > 0 && (
                <table className="table">
                  <thead>
                    <tr><th>Coach</th><th>Gimnasios</th><th>Alumnos</th><th aria-label="Acciones" /></tr>
                  </thead>
                  <tbody>
                    {allCoaches.map((c) => {
                      const theirGyms = gyms.filter((g) => c.gymIds?.includes(g.id));
                      return (
                        <tr key={c.id} onClick={() => openCoach(c)}>
                          <td>
                            <div className="person">
                              <span className="avatar" aria-hidden="true">{initials(c.name)}</span>
                              <div><span className="person-name">{c.name}</span><span className="muted small">@{c.username ?? '—'}</span></div>
                            </div>
                          </td>
                          <td>
                            <div className="tag-list">
                              {theirGyms.length ? theirGyms.map((g) => <span key={g.id} className="badge tone-neutral">{g.name}</span>) : <span className="muted small">Sin gimnasios</span>}
                            </div>
                          </td>
                          <td>{studentsOf(db, c.id).length}</td>
                          <td className="cell-action">
                            <button className="btn-link" onClick={(e) => { e.stopPropagation(); openCoach(c); }}>Editar</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <ul className="table-cards">
                {allCoaches.map((c) => (
                  <li key={c.id}>
                    <button className="card card-link stack-sm admin-card" onClick={() => openCoach(c)}>
                      <div className="person">
                        <span className="avatar" aria-hidden="true">{initials(c.name)}</span>
                        <div><span className="person-name">{c.name}</span><span className="muted small">@{c.username ?? '—'} · {studentsOf(db, c.id).length} alumnos</span></div>
                      </div>
                      <div className="tag-list">
                        {gyms.filter((g) => c.gymIds?.includes(g.id)).map((g) => <span key={g.id} className="badge tone-neutral">{g.name}</span>)}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'gimnasios' && (
            <div className="stack" role="tabpanel">
              <form className="toolbar" onSubmit={addGym}>
                <input className="toolbar-search grow" placeholder="Nombre del gimnasio nuevo" value={gymName} onChange={(e) => setGymName(e.target.value)} aria-label="Nombre del gimnasio nuevo" />
                <button className="btn" disabled={!gymName.trim()}>Agregar gimnasio</button>
              </form>
              <div className="table-card">
                {gyms.length === 0 && <p className="empty">Todavía no hay gimnasios.</p>}
                {gyms.length > 0 && (
                  <table className="table">
                    <thead><tr><th>Gimnasio</th><th>Coaches</th><th>Alumnos</th></tr></thead>
                    <tbody>
                      {gyms.map((g) => (
                        <tr key={g.id} className="row-static">
                          <td><strong>{g.name}</strong></td>
                          <td>{allCoaches.filter((c) => c.gymIds?.includes(g.id)).length}</td>
                          <td>{studentsAt(g.id)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <ul className="table-cards">
                  {gyms.map((g) => (
                    <li key={g.id} className="card row-between">
                      <strong>{g.name}</strong>
                      <span className="muted small">{allCoaches.filter((c) => c.gymIds?.includes(g.id)).length} coaches · {studentsAt(g.id)} alumnos</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <dialog ref={dialog} className="modal" aria-label={editing ? 'Editar coach' : 'Nuevo coach'} onClick={(e) => { if (e.target === dialog.current) closeCoach(); }}>
        <form className="stack" onSubmit={submitCoach}>
          <div className="row-between">
            <h2>{editing ? `Editar a ${form.name || 'coach'}` : 'Nuevo coach'}</h2>
            <button type="button" className="btn-link muted" aria-label="Cerrar" onClick={closeCoach}>✕</button>
          </div>
          <label className="field">
            <span>Nombre y apellido</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Usuario</span>
              <input value={form.username} onChange={(e) => { setForm({ ...form, username: e.target.value }); setTaken(false); }} autoComplete="off" autoCapitalize="none" />
            </label>
            <label className="field">
              <span>Contraseña</span>
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            </label>
          </div>
          {taken && <p className="small warn">Ya hay un coach con ese usuario.</p>}
          <div className="field">
            <span>Gimnasios donde trabaja</span>
            <div className="tag-list" role="group" aria-label="Gimnasios donde trabaja">
              {gyms.map((g) => {
                const on = form.gymIds.includes(g.id);
                return (
                  <button key={g.id} type="button" className={`chip ${on ? 'is-active' : ''}`} aria-pressed={on} onClick={() => toggleGym(g.id)}>
                    {on ? '✓ ' : ''}{g.name}
                  </button>
                );
              })}
              {!gyms.length && <span className="muted small">Primero agregá un gimnasio en la pestaña Gimnasios.</span>}
            </div>
          </div>
          <div className="row">
            <button type="button" className="btn btn-ghost grow" onClick={closeCoach}>Cancelar</button>
            <button className="btn grow" disabled={!valid}>{editing ? 'Guardar cambios' : 'Crear coach'}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
