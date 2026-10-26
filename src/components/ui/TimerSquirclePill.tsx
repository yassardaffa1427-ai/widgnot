import { fmtMMSS } from '@/lib/date';
import type { TimerMode } from '@/store/timer';

interface Props {
  remaining: number;
  total: number;
  mode: TimerMode;
}

/**
 * Timer Idle Pill 84x84 matching Figma node 11:1282 (stopwatch idle)
 * Features a thick squircle gradient progress ring with rounded caps and bold centered time.
 */
export function TimerSquirclePill({ remaining, total, mode }: Props) {
  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  // Geometry for 84x84 squircle with stroke 11
  // x=5.5, y=5.5, w=73, h=73, rx=19.5
  // Straight parts: 4 * (73 - 2 * 19.5) = 136
  // Curve parts: 2 * PI * 19.5 = 122.522
  const perimeter = 258.52;
  const strokeOffset = perimeter * (1 - progress);

  const isBreak = mode === 'break';
  const gradId = isBreak ? 'timer-grad-break' : 'timer-grad-focus';

  return (
    <div
      style={{
        position: 'relative',
        width: 84,
        height: 84,
        borderRadius: 22,
        backgroundColor: '#141416',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <svg
        width={84}
        height={84}
        viewBox="0 0 84 84"
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotate(-90deg)',
          transformOrigin: '42px 42px',
        }}
        aria-hidden
      >
        <defs>
          <linearGradient id="timer-grad-focus" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7844" />
            <stop offset="100%" stopColor="#fe2d28" />
          </linearGradient>
          <linearGradient id="timer-grad-break" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38ef7d" />
            <stop offset="100%" stopColor="#11998e" />
          </linearGradient>
        </defs>

        {/* Subtle background track */}
        <rect
          x="5.5"
          y="5.5"
          width="73"
          height="73"
          rx="19.5"
          ry="19.5"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="11"
        />

        {/* Squircle progress stroke matching Figma 11:1282 */}
        <rect
          x="5.5"
          y="5.5"
          width="73"
          height="73"
          rx="19.5"
          ry="19.5"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={perimeter}
          strokeDashoffset={strokeOffset}
          style={{ transition: 'stroke-dashoffset 0.35s linear' }}
        />
      </svg>

      {/* Centered bold time 02:50 */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          fontSize: 18,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'var(--font), sans-serif',
        }}
      >
        {fmtMMSS(remaining)}
      </span>
    </div>
  );
}
