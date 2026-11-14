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
 * Ikon Record Meeting (Video Camera) — Figma Node 219:2343
 */
export function RecordMeetingIcon({ size = 20, color = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.66675 10.4166V9.58331C1.66675 6.84375 1.66675 5.47396 2.42338 4.552C2.5619 4.38322 2.71666 4.22846 2.88544 4.08995C3.8074 3.33331 5.17718 3.33331 7.91675 3.33331C10.6563 3.33331 12.0261 3.33331 12.9481 4.08995C13.1168 4.22846 13.2716 4.38322 13.4101 4.552C13.9947 5.2644 14.1277 6.24417 14.1578 7.91666L14.7154 7.64233C16.3369 6.83155 17.1477 6.42615 17.7406 6.79254C18.3334 7.15894 18.3334 8.06542 18.3334 9.8784V10.1216C18.3334 11.9346 18.3334 12.8411 17.7406 13.2074C17.1477 13.5738 16.3369 13.1684 14.7154 12.3576L14.1578 12.0833C14.1277 13.7558 13.9947 14.7356 13.4101 15.448C13.2716 15.6167 13.1168 15.7715 12.9481 15.91C12.0261 16.6666 10.6563 16.6666 7.91675 16.6666C5.17718 16.6666 3.8074 16.6666 2.88544 15.91C2.71666 15.7715 2.5619 15.6167 2.42338 15.448C1.66675 14.526 1.66675 13.1562 1.66675 10.4166ZM11.3007 7.9672C11.7887 7.47904 11.7887 6.68759 11.3007 6.19943C10.8125 5.71127 10.021 5.71127 9.53283 6.19943C9.04475 6.68759 9.04475 7.47904 9.53283 7.9672C10.021 8.45531 10.8125 8.45531 11.3007 7.9672Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      />
    </svg>
  );
}

