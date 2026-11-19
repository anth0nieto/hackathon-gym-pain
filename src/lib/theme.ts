import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'forza-theme';
const media = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : undefined;
const listeners = new Set<() => void>();

function saved(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

/** The theme on screen: the one the user picked, or the system's. */
export const currentTheme = (): Theme => saved() ?? (media?.matches ? 'dark' : 'light');

function apply() {
  const t = saved();
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  listeners.forEach((l) => l());
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: the choice lasts until reload */
  }
  document.documentElement.dataset.theme = theme;
  listeners.forEach((l) => l());
}

media?.addEventListener('change', () => listeners.forEach((l) => l()));
apply();

export const useTheme = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => document.documentElement.dataset.theme as Theme | undefined ?? currentTheme(),
  );
