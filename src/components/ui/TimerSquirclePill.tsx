import { fmtMMSS } from '@/lib/date';
import type { TimerMode } from '@/store/timer';

interface Props {
  remaining: number;
  total: number;
  mode: TimerMode;
}

/**
 * Timer Idle Pill 84x84 matching Figma node 11:1290 (break stopwatch) & 11:1282 (focus stopwatch)
 * - Clean squircle countdown progress ring with rounded tip circling until finished.
 * - Bold centered time.
 * - Break (Blue: #0091ff) / Focus (Red: #fe2d28).
 */
export function TimerSquirclePill({ remaining, total, mode }: Props) {
  const isBreak = mode === 'break';
  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  // Squircle stroke geometry:
  // 84x84, w=73, h=73, rx=19.5, strokeWidth=10
  const perimeter = 258.52;
  const strokeOffset = perimeter * (1 - progress);

  const gradStrokeId = isBreak ? 'timer-stroke-break' : 'timer-stroke-focus';

  return (
    <div
      style={{
        position: 'relative',
        width: 84,
        height: 84,
        borderRadius: 24,
        backgroundColor: '#1b1b1b',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        userSelect: 'none',
        boxShadow: isBreak
          ? '0 0 20px rgba(0, 145, 255, 0.35)'
          : '0 0 20px rgba(254, 45, 40, 0.35)',
      }}
    >
      {/* SVG Container for Squircle Countdown */}
      <svg
        width={84}
        height={84}
        viewBox="0 0 84 84"
        style={{
          position: 'absolute',
          inset: 0,
        }}
        aria-hidden
      >
        <defs>
          {/* Stroke gradients */}
          <linearGradient id="timer-stroke-focus" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7844" />
            <stop offset="100%" stopColor="#fe2d28" />
          </linearGradient>
          <linearGradient id="timer-stroke-break" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#0091ff" />
          </linearGradient>
        </defs>

        {/* Deep Dark Base */}
        <rect width="84" height="84" fill="#141416" rx="24" />

        {/* Squircle Countdown Progress Ring */}
        <g
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '42px 42px',
          }}
        >
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
            strokeWidth="10"
          />

          {/* Animated squircle countdown stroke with rounded tip */}
          <rect
            x="5.5"
            y="5.5"
            width="73"
            height="73"
            rx="19.5"
            ry="19.5"
            fill="none"
            stroke={`url(#${gradStrokeId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={perimeter}
            strokeDashoffset={strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.4s ease-out' }}
          />
        </g>
      </svg>

      {/* Centered Bold Time (02:50 from Figma 11:1290) */}
      <span
        style={{
          position: 'relative',
          zIndex: 3,
          fontSize: 18,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          fontFamily: 'var(--font), sans-serif',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 0 4px rgba(0, 0, 0, 0.7)',
        }}
      >
        {fmtMMSS(remaining)}
      </span>
    </div>
  );
}
