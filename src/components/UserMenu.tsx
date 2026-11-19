import { useRef, type ReactNode } from 'react';
import { initials } from '../lib/initials';
import type { User } from '../types';
import './UserMenu.css';

interface Props {
  user: User;
  onLogout: () => void;
  /** What the opening button shows; the user's initials by default. */
  trigger?: ReactNode;
  triggerClassName?: string;
}

/** A button that opens a small modal asking whether to log out, with the user's name. */
export function UserMenu({ user, onLogout, trigger, triggerClassName }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        className={triggerClassName ?? 'avatar avatar-btn'}
        aria-label={trigger ? undefined : `Cuenta de ${user.name}`}
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        {trigger ?? initials(user.name)}
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
          <p className="muted">¿Querés cerrar sesión?</p>
          <button type="button" className="btn btn-block btn-danger" onClick={() => { close(); onLogout(); }}>
            Cerrar sesión
          </button>
          <button type="button" className="btn-link muted" onClick={close}>Cancelar</button>
        </div>
      </dialog>
    </>
  );
}
