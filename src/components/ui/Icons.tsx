import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24, p: SVGProps<SVGSVGElement>) =>
  ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', ...p }) as SVGProps<SVGSVGElement>;

/* Ikon sederhana buatan sendiri. Ganti dengan export SVG dari Figma bila ingin pixel-perfect
   (lihat docs/FIGMA_MAP.md untuk daftar node ikon). */

export const CloseCircle = ({ size = 29, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="12" fill="#4a4a4a" /><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
);
export const ArrowCircle = ({ size = 24, dir = 'right', ...p }: P & { dir?: 'left' | 'right' }) => (
  <svg {...base(size, p)} style={{ transform: dir === 'left' ? 'scaleX(-1)' : undefined }}>
    <circle cx="12" cy="12" r="12" fill="#3d3d3d" /><path d="M7 12h10M13 8l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const PenSquare = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 3.5a2.1 2.1 0 013 3L12 16l-4 1 1-4 9.5-9.5z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
);
export const Trash = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Maximize = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Minimize = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><path d="M20 10h-6V4M4 14h6v6M14 10l7-7M3 21l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Stopwatch = ({ size = 50, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="13.5" r="7" stroke="#fff" strokeWidth="1.5" /><path d="M12 10v4l2 1.5M9.5 3h5M12 3v3.5M18.5 6.5l1-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
);
export const MinusSquare = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="3" width="18" height="18" rx="4" fill="#3d3d3d" /><path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
);
export const AddSquare = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="3" width="18" height="18" rx="4" fill="#3d3d3d" /><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
);
export const Restart = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="10" fill="#3d3d3d" /><path d="M16.5 12a4.5 4.5 0 11-1.4-3.2M16 6.5v3h-3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Cup = ({ size = 12, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 9h11v5a5 5 0 01-5 5h-1a5 5 0 01-5-5V9zM16 10h1.5a2.5 2.5 0 010 5H16M9 3v3M12.5 3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
);
export const Lock = ({ size = 12, ...p }: P) => (
  <svg {...base(size, p)}><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10V8a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.8" /></svg>
);
export const Play = ({ size = 16, ...p }: P) => (<svg {...base(size, p)}><path d="M7 4.5v15l13-7.5-13-7.5z" fill="currentColor" /></svg>);
export const Pause = ({ size = 16, ...p }: P) => (<svg {...base(size, p)}><rect x="6" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor" /><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" fill="currentColor" /></svg>);
export const Skip = ({ size = 26, dir = 'next', ...p }: P & { dir?: 'next' | 'prev' }) => (
  <svg {...base(size, p)} style={{ transform: dir === 'prev' ? 'scaleX(-1)' : undefined }}><path d="M5 5l10 7-10 7V5zM18 5v14" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Bolt = ({ size = 14, color = '#ffffff', ...p }: P & { color?: string }) => (
  <svg
    width={(size * 10) / 14}
    height={size}
    viewBox="0 0 10 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <path
      d="M1.316 6.235L3.772 2.922C5.079 1.172 5.729 0.297 6.185 0.497C6.641 0.697 6.435 1.772 5.997 3.916L5.972 4.053C5.835 4.741 5.766 5.091 5.954 5.322C6.141 5.553 6.491 5.547 7.204 5.547H7.597C8.679 5.547 9.216 5.547 9.391 5.891C9.566 6.235 9.241 6.666 8.604 7.541L6.104 10.935C4.791 12.722 4.129 13.61 3.672 13.41C3.216 13.21 3.435 12.122 3.872 9.947L3.916 9.722C4.054 9.035 4.122 8.685 3.934 8.453C3.747 8.222 3.397 8.228 2.685 8.228H2.316C1.229 8.228 0.691 8.228 0.516 7.885C0.341 7.541 0.666 7.103 1.316 6.228"
      fill={color}
    />
  </svg>
);
export const CheckCircle = ({ size = 20, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="11" fill="#21ff54" /><path d="M7 12.5l3.2 3.2L17 9" stroke="#1b1b1b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Circle = ({ size = 20, ...p }: P) => (<svg {...base(size, p)}><circle cx="12" cy="12" r="10.3" stroke="#fff" strokeWidth="1.5" /></svg>);
export const Chevron = ({ size = 18, dir = 'down', ...p }: P & { dir?: 'up' | 'down' | 'left' | 'right' }) => {
  const rot = { up: 180, down: 0, left: 90, right: -90 }[dir];
  return (<svg {...base(size, p)} style={{ transform: `rotate(${rot}deg)`, transition: 'transform .3s' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
};
export const Bluetooth = ({ size = 26, ...p }: P) => (<svg {...base(size, p)}><path d="M7 7l10 10-5 4V3l5 4L7 17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
export const Music = ({ size = 18, ...p }: P) => (<svg {...base(size, p)}><path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.9" /><circle cx="17.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.9" /></svg>);
export const AirPods = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M6 3H5C3.35 3 2 4.35 2 6V10C2 11.65 3.35 13 5 13H7V19C7 20.1 7.9 21 9 21C10.1 21 11 20.1 11 19V8C11 5.24 8.76 3 6 3ZM5.5 9.75C5.5 10.16 5.16 10.5 4.75 10.5C4.34 10.5 4 10.16 4 9.75V6.25C4 5.84 4.34 5.5 4.75 5.5C5.16 5.5 5.5 5.84 5.5 6.25V9.75ZM19 3H18C15.24 3 13 5.24 13 8V19C13 20.1 13.9 21 15 21C16.1 21 17 20.1 17 19V13H19C20.65 13 22 11.65 22 10V6C22 4.35 20.65 3 19 3ZM20 9.75C20 10.16 19.66 10.5 19.25 10.5C18.84 10.5 18.5 10.16 18.5 9.75V6.25C18.5 5.84 18.84 5.5 19.25 5.5C19.66 5.5 20 5.84 20 6.25V9.75Z"
      fill="currentColor"
    />
  </svg>
);
export const Earbuds = AirPods;
export const Check = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M14.9994 4.5L6.75023 12.7494L3.0006 8.99967" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Clock = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M9 4.49964V9H12.0002M16.5006 9C16.5006 13.1425 13.1425 16.5006 9 16.5006C4.85753 16.5006 1.4994 13.1425 1.4994 9C1.4994 4.85753 4.85753 1.4994 9 1.4994C13.1425 1.4994 16.5006 4.85753 16.5006 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const CalendarDays = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path d="M6 1.5v3M12 1.5v3M2.25 7.5h13.5M3.75 3h10.5A1.5 1.5 0 0115.75 4.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V4.5A1.5 1.5 0 013.75 3zM6 10.5h.01M9 10.5h.01M12 10.5h.01M6 13.5h.01M9 13.5h.01M12 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

