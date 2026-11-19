import type { RoutineStatus } from '../types';

const LABEL: Record<RoutineStatus, string> = {
  pending: 'Pendiente',
  partial: 'En curso',
  complete: 'Completa',
  skipped: 'Salteada',
};

export function StatusBadge({ status }: { status: RoutineStatus }) {
  return <span className={`badge badge-${status}`}>{LABEL[status]}</span>;
}

export function StatusDot({ status, title }: { status: RoutineStatus | 'none'; title?: string }) {
  return <span className={`dot dot-${status}`} title={title} />;
}
