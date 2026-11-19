import { createContext, useContext, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser, useDB } from './data/store';
import type { Role, User } from './types';

const KEY = 'gym-pain-session';

interface Session {
  user?: User;
  login: (id: string) => void;
  logout: () => void;
}

const SessionContext = createContext<Session | null>(null);

function readStored(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

function writeStored(id: string | null) {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const db = useDB();
  const [userId, setUserId] = useState<string | null>(readStored);
  const value: Session = {
    user: getUser(db, userId),
    login: (id) => { writeStored(id); setUserId(id); },
    logout: () => { writeStored(null); setUserId(null); },
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

/** Returns the logged-in user with the given role; use inside <RequireRole>. */
export function useCurrentUser(): User {
  const { user } = useSession();
  if (!user) throw new Error('useCurrentUser used outside <RequireRole>');
  return user;
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={user.role === 'coach' ? '/coach' : '/alumno'} replace />;
  return <>{children}</>;
}
