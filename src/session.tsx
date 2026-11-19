import { createContext, useContext, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getUser, gymsOf, useDB } from './data/store';
import type { Gym, Role, User } from './types';

const KEY = 'gym-pain-session';
const GYM_KEY = 'gym-pain-gym';

// Demo only: the single admin ships in the bundle and isn't stored in the database.
export const ADMIN: User & { username: string; password: string } = {
  id: 'admin',
  name: 'Administrador',
  role: 'admin',
  username: 'admin',
  password: 'admin123',
};

export const homeOf = (role: Role) => (role === 'admin' ? '/admin' : role === 'coach' ? '/coach' : '/alumno');

interface Session {
  user?: User;
  login: (id: string) => void;
  logout: () => void;
  /** The gym the coach is working at on this device. */
  gymId: string | null;
  setGymId: (id: string) => void;
}

const SessionContext = createContext<Session | null>(null);

function readStored(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeStored(key: string, id: string | null) {
  try { id ? localStorage.setItem(key, id) : localStorage.removeItem(key); } catch { /* ignore */ }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const db = useDB();
  const [userId, setUserId] = useState<string | null>(() => readStored(KEY));
  const [gymId, setGym] = useState<string | null>(() => readStored(GYM_KEY));
  const value: Session = {
    user: userId === ADMIN.id ? ADMIN : getUser(db, userId),
    login: (id) => { writeStored(KEY, id); setUserId(id); },
    logout: () => { writeStored(KEY, null); setUserId(null); },
    gymId,
    setGymId: (id) => { writeStored(GYM_KEY, id); setGym(id); },
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
  if (user.role !== role) return <Navigate to={homeOf(user.role)} replace />;
  return <>{children}</>;
}

/** The coach's gyms and the one they're working at: the last picked on this device, else the first. */
export function useGym(): { gym?: Gym; gyms: Gym[]; setGymId: (id: string) => void } {
  const db = useDB();
  const coach = useCurrentUser();
  const { gymId, setGymId } = useSession();
  const gyms = gymsOf(db, coach);
  return { gym: gyms.find((g) => g.id === gymId) ?? gyms[0], gyms, setGymId };
}
