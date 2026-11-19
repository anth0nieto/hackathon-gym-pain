import { useRef } from 'react';
import { initials } from '../lib/initials';
import type { User } from '../types';
import './UserMenu.css';

/** Avatar button that opens a small modal with the user's name and "Cerrar sesión". */
export function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button type="button" className="avatar avatar-btn" aria-label={`Cuenta de ${user.name}`} onClick={() => dialog.current?.showModal()}>
        {initials(user.name)}
      </button>
      <dialog
        ref={dialog}
        className="user-menu"
        aria-label="Tu cuenta"
        onClick={(e) => { if (e.target === dialog.current) close(); }}
      >
        <div className="user-menu-body">
          <span className="avatar avatar-lg" aria-hidden="true">{initials(user.name)}</span>
          <strong className="user-menu-name">{user.name}</strong>
          <button type="button" className="btn btn-block btn-danger" onClick={() => { close(); onLogout(); }}>
            Cerrar sesión
          </button>
          <button type="button" className="btn-link muted" onClick={close}>Cancelar</button>
        </div>
      </dialog>
    </>
  );
}
