import { useEffect, useRef, useState } from 'react';
import { clock } from '../lib/duration';

export const REST_MS = 2 * 60_000;
const STEP_MS = 30_000;
const DONE_MESSAGE_MS = 3_000;

interface Props {
  until: number;
  onChange: (until: number) => void;
  onClose: () => void;
}

/** Rest countdown between sets. At zero it vibrates (where supported), shows "¡A darle!" for 3 seconds and closes. */
export function RestTimer({ until, onChange, onClose }: Props) {
  const [now, setNow] = useState(Date.now());
  const left = until - now;
  const over = left <= 0;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!over) return;
    navigator.vibrate?.(400);
    const id = setTimeout(() => close.current(), DONE_MESSAGE_MS);
    return () => clearTimeout(id);
  }, [over]);

  return (
    <div className={`rest${over ? ' is-over' : ''}`} role="timer" aria-live="polite">
      <div className="rest-info">
        <span className="rest-label">{over ? '¡A darle!' : 'Descanso'}</span>
        <span className="rest-value">{over ? '0:00' : clock(left)}</span>
      </div>
      {!over && (
        <>
          <button type="button" className="rest-btn" onClick={() => onChange(Math.max(Date.now(), until - STEP_MS))}>−30s</button>
          <button type="button" className="rest-btn" onClick={() => onChange(until + STEP_MS)}>+30s</button>
        </>
      )}
      <button type="button" className="rest-close" aria-label="Cerrar descanso" onClick={onClose}>×</button>
    </div>
  );
}
