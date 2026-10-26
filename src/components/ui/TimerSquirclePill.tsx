import { fmtMMSS } from '@/lib/date';
import type { TimerMode } from '@/store/timer';

interface Props {
  remaining: number;
  total: number;
  mode: TimerMode;
}

/**
 * Timer Idle Pill 84x84 matching Figma node 11:1290 (break stopwatch) & 11:1282 (focus stopwatch)
 * - Break (Blue): Liquid wavy animation rises UP like charging battery power.
 * - Focus (Red): Liquid wavy animation drains DOWN as focus time elapses.
 * - Squircle countdown progress ring + bold centered time.
 */
export function TimerSquirclePill({ remaining, total, mode }: Props) {
  const isBreak = mode === 'break';
  const progress = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  // Squircle stroke geometry:
  // 84x84, w=73, h=73, rx=19.5, strokeWidth=10 (matching Figma 11:1290 border-10)
  const perimeter = 258.52;
  const strokeOffset = perimeter * (1 - progress);

  // Water level height (y offset from 0 to 84):
  // For Focus (Red): Drains DOWN from top (full) to bottom (empty)
  // For Break (Blue): Charges UP from bottom (empty) to top (full)
  const focusLevel = progress; // 1 = full, 0 = empty
  const breakLevel = 1 - progress; // 0 = empty, 1 = full (energy charged)

  // Level in px: 0% is y=78 (empty), 100% is y=12 (full)
  const activeLevel = isBreak ? breakLevel : focusLevel;
  const waveY = 78 - activeLevel * 66;

  const gradStrokeId = isBreak ? 'timer-stroke-break' : 'timer-stroke-focus';
  const gradWave1Id = isBreak ? 'timer-wave-break-1' : 'timer-wave-focus-1';
  const gradWave2Id = isBreak ? 'timer-wave-break-2' : 'timer-wave-focus-2';

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
      <style>{`
        @keyframes timerWaveHorizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-120px); }
        }
        @keyframes timerWaveReverse {
          0% { transform: translateX(-120px); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .timer-wave-layer { animation: none !important; }
        }
      `}</style>

      {/* SVG Container for Wavy Liquid and Squircle Countdown */}
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
          {/* Clip path for inner squircle cavity */}
          <clipPath id="squircleLiquidClip">
            <rect x="5.5" y="5.5" width="73" height="73" rx="19.5" ry="19.5" />
          </clipPath>

          {/* Stroke gradients */}
          <linearGradient id="timer-stroke-focus" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7844" />
            <stop offset="100%" stopColor="#fe2d28" />
          </linearGradient>
          <linearGradient id="timer-stroke-break" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="100%" stopColor="#0091ff" />
          </linearGradient>

          {/* Liquid gradients */}
          {/* Focus (Red) */}
          <linearGradient id="timer-wave-focus-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 75, 65, 0.85)" />
            <stop offset="100%" stopColor="rgba(195, 20, 20, 0.95)" />
          </linearGradient>
          <linearGradient id="timer-wave-focus-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 120, 70, 0.45)" />
            <stop offset="100%" stopColor="rgba(254, 45, 40, 0.6)" />
          </linearGradient>

          {/* Break (Blue - Charging Energy) */}
          <linearGradient id="timer-wave-break-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 185, 255, 0.85)" />
            <stop offset="100%" stopColor="rgba(0, 110, 245, 0.95)" />
          </linearGradient>
          <linearGradient id="timer-wave-break-2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(80, 220, 255, 0.45)" />
            <stop offset="100%" stopColor="rgba(0, 145, 255, 0.6)" />
          </linearGradient>
        </defs>

        {/* 1. Liquid Wavy Animation Inside Squircle Clip */}
        <g clipPath="url(#squircleLiquidClip)">
          {/* Deep Cavity Dark Base */}
          <rect width="84" height="84" fill="#141416" />

          {/* Liquid Level Group (moves up/down based on progress) */}
          <g
            style={{
              transform: `translateY(${waveY}px)`,
              transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            {/* Secondary wave (back layer, slightly slower & out of phase) */}
            <g
              className="timer-wave-layer"
              style={{
                animation: 'timerWaveReverse 4.5s linear infinite',
              }}
            >
              <path
                d="M 0 0 C 30 -6, 60 6, 90 0 C 120 -6, 150 6, 180 0 C 210 -6, 240 6, 270 0 C 300 -6, 330 6, 360 0 V 120 H 0 Z"
                fill={`url(#${gradWave2Id})`}
              />
            </g>

            {/* Primary wave (front layer, vivid and undulating) */}
            <g
              className="timer-wave-layer"
              style={{
                animation: 'timerWaveHorizontal 2.8s linear infinite',
              }}
            >
              <path
                d="M 0 0 C 30 7, 60 -7, 90 0 C 120 7, 150 -7, 180 0 C 210 7, 240 -7, 270 0 C 300 7, 330 -7, 360 0 V 120 H 0 Z"
                fill={`url(#${gradWave1Id})`}
              />
            </g>
          </g>

          {/* Ambient Inner Lighting */}
          <rect
            x="5.5"
            y="5.5"
            width="73"
            height="73"
            rx="19.5"
            ry="19.5"
            fill="none"
            stroke={isBreak ? 'rgba(0, 185, 255, 0.2)' : 'rgba(255, 80, 80, 0.2)'}
            strokeWidth="1.5"
          />
        </g>

        {/* 2. Squircle Countdown Progress Ring */}
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
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="10"
          />

          {/* Animated squircle countdown stroke matching Figma 11:1290 / 11:1282 */}
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
