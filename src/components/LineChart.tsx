import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import './LineChart.css';

export interface LinePoint {
  /** Milliseconds since epoch. */
  x: number;
  y: number;
  /** Shown in the tooltip, e.g. "jue 5 nov". */
  label: string;
  /** Shown in the tooltip, e.g. "80 kg × 10". */
  value: string;
}

const HEIGHT = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    const pad = Math.max(5, Math.abs(min) * 0.1);
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

function monthTicks(from: number, to: number): { x: number; label: string }[] {
  const months = (new Date(to).getFullYear() - new Date(from).getFullYear()) * 12 + new Date(to).getMonth() - new Date(from).getMonth();
  const every = Math.max(1, Math.ceil(months / 5));
  const d = new Date(from);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + 1);
  const ticks: { x: number; label: string }[] = [];
  for (let i = 0; d.getTime() <= to; i++, d.setMonth(d.getMonth() + 1)) {
    if (i % every === 0) ticks.push({ x: d.getTime(), label: d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '') });
  }
  return ticks;
}

/** One series over time: 2px line, a light area wash, and a crosshair tooltip that snaps to the nearest point. */
export function LineChart({ points, from, to, ariaLabel }: { points: LinePoint[]; from: number; to: number; ariaLabel: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [active, setActive] = useState<number>();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(1, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setActive(undefined), [points]);

  const ys = points.map((p) => p.y);
  const ticks = niceTicks(Math.min(...ys), Math.max(...ys));
  const [yMin, yMax] = [ticks[0], ticks[ticks.length - 1]];
  const span = Math.max(1, to - from);
  const sx = (x: number) => PAD.left + ((x - from) / span) * (width - PAD.left - PAD.right);
  const sy = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin || 1)) * (HEIGHT - PAD.top - PAD.bottom);
  const base = HEIGHT - PAD.bottom;

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('');
  const area = points.length > 1 ? `${line}L${sx(points[points.length - 1].x).toFixed(1)},${base}L${sx(points[0].x).toFixed(1)},${base}Z` : '';

  const nearest = (clientX: number) => {
    const rect = wrap.current!.getBoundingClientRect();
    const x = clientX - rect.left;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(sx(p.x) - x) < Math.abs(sx(points[best].x) - x)) best = i;
    });
    return best;
  };
  const onMove = (e: PointerEvent) => setActive(nearest(e.clientX));
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? points.length) - 1));
    else if (e.key === 'ArrowRight') setActive((a) => Math.min(points.length - 1, (a ?? -1) + 1));
    else return;
    e.preventDefault();
  };

  const hit = active !== undefined ? points[active] : undefined;
  const last = points[points.length - 1];
  // Month starts as x labels; within a single month, the first and last dates instead.
  const months = monthTicks(from, to);
  const dayLabel = (x: number) => new Date(x).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
  const xTicks = months.length ? months : [...new Set([from, to])].map((x) => ({ x, label: dayLabel(x) }));

  return (
    <div className="linechart" ref={wrap}>
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        height={HEIGHT}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setActive(undefined)}
        onKeyDown={onKey}
        onBlur={() => setActive(undefined)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line className="linechart-grid" x1={PAD.left} x2={width - PAD.right} y1={sy(t)} y2={sy(t)} />
            <text className="linechart-axis" x={PAD.left - 8} y={sy(t)} textAnchor="end" dominantBaseline="middle">{t}</text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text
            key={t.x}
            className="linechart-axis"
            x={sx(t.x)}
            y={HEIGHT - 8}
            textAnchor={months.length ? 'middle' : i === 0 ? 'start' : 'end'}
          >
            {t.label}
          </text>
        ))}
        {area && <path className="linechart-area" d={area} />}
        <path className="linechart-line" d={line} />
        {hit && <line className="linechart-cross" x1={sx(hit.x)} x2={sx(hit.x)} y1={PAD.top} y2={base} />}
        {(hit ?? last) && (
          <circle className="linechart-dot" cx={sx((hit ?? last).x)} cy={sy((hit ?? last).y)} r={5} />
        )}
      </svg>
      {hit && (
        <div
          className="linechart-tip"
          style={{ left: Math.min(Math.max(sx(hit.x), 70), width - 70), top: Math.max(sy(hit.y) - 12, 0) }}
          role="status"
        >
          <span className="linechart-tip-label">{hit.label}</span>
          <strong>{hit.value}</strong>
        </div>
      )}
    </div>
  );
}
