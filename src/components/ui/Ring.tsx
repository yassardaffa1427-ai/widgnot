interface Props { size: number; stroke: number; progress: number; color: string; track?: string }

/** Cincin progres SVG (0..1). Dipakai timer, pill idle, dan baterai. */
export function Ring({ size, stroke, progress, color, track = 'rgba(255,255,255,0.12)' }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, Math.max(0, progress)))}
        style={{ transition: 'stroke-dashoffset .35s linear' }}
      />
    </svg>
  );
}
