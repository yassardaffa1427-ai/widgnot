interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Ikon Titik Tiga Horizontal ••• (Figma 155:2352 / 212:2537)
 */
export function MoreDotsIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="2" fill={color} />
      <circle cx="12" cy="12" r="2" fill={color} />
      <circle cx="19" cy="12" r="2" fill={color} />
    </svg>
  );
}

/**
 * Ikon Tambahkan file / gambar / video (Figma 155:2352)
 * Kertas dokumen dengan panah ke bawah di pojok kiri bawah dokumen
 */
export function FileUploadIcon({ size = 18, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bentuk dokumen berlipat pojok kanan atas */}
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2V8H20"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Panah bawah di dalam dokumen */}
      <path
        d="M12 11V17M12 17L9.5 14.5M12 17L14.5 14.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Ikon Record Meeting (Monitor + Video Camera) — Figma 155:2352 & 211:2532
 */
export function RecordMeetingIcon({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Layar / Monitor */}
      <rect
        x="2.5"
        y="3.5"
        width="13"
        height="12"
        rx="2.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Kaki / Stand monitor */}
      <path
        d="M9 15.5V19.5M6 19.5H12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Kamera Video di sisi kanan atas */}
      <rect
        x="13.5"
        y="5"
        width="5.5"
        height="5.5"
        rx="1.4"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M19 6.8L21.5 5.5V9.5L19 8.2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

