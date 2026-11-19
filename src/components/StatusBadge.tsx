import type { SessionStatus } from '../types';

const LABEL: Record<SessionStatus, string> = {
  open: 'En curso',
  done: 'Finalizada',
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  return <span className={`badge badge-${status === 'open' ? 'partial' : 'complete'}`}>{LABEL[status]}</span>;
}
