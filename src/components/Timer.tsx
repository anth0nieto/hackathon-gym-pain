import { useEffect, useState } from 'react';
import { clock } from '../lib/duration';

/** Live clock counting from `since`. */
export function Timer({ since }: { since: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="timer" role="timer" aria-live="off">
      <span className="timer-label">Tiempo</span>
      <span className="timer-value">{clock(now - new Date(since).getTime())}</span>
    </div>
  );
}
