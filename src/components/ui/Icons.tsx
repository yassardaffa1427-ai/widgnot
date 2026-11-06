import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24, p: SVGProps<SVGSVGElement>) =>
  ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', ...p }) as SVGProps<SVGSVGElement>;

/* Ikon sederhana buatan sendiri. Ganti dengan export SVG dari Figma bila ingin pixel-perfect
   (lihat docs/FIGMA_MAP.md untuk daftar node ikon). */

export const CloseCircle = ({ size = 29, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <rect x="8" y="8" width="12" height="12" fill="white" />
    <path
      d="M14.5 1.8125C21.5064 1.8125 27.1875 7.49356 27.1875 14.5C27.1875 21.5064 21.5064 27.1875 14.5 27.1875C7.49356 27.1875 1.8125 21.5064 1.8125 14.5C1.8125 7.49356 7.49356 1.8125 14.5 1.8125ZM18.1234 9.59566C18.1228 9.59586 18.1222 9.59617 18.1211 9.59733L14.5 13.2184L10.879 9.59733C10.8778 9.59617 10.8773 9.59586 10.8766 9.59566C10.8759 9.59546 10.8752 9.59546 10.8746 9.59566C10.874 9.59586 10.8734 9.59617 10.8723 9.59733L9.5973 10.8723C9.59617 10.8734 9.59588 10.874 9.59566 10.8746C9.59546 10.8753 9.59546 10.876 9.59566 10.8766L9.59594 10.8772C9.59633 10.8779 9.5968 10.8784 9.59733 10.8789L13.2184 14.5L9.59733 18.1211C9.59617 18.1222 9.59586 18.1228 9.59566 18.1234C9.59546 18.1241 9.59546 18.1248 9.59566 18.1254C9.59586 18.126 9.59617 18.1266 9.59733 18.1277L10.8723 19.4027C10.8734 19.4039 10.874 19.4041 10.8746 19.4044C10.8753 19.4046 10.876 19.4046 10.8766 19.4044C10.8772 19.4042 10.8778 19.4039 10.8789 19.4027L14.5 15.7816L18.1211 19.4027C18.1222 19.4038 18.1228 19.4041 18.1234 19.4043C18.1241 19.4045 18.1248 19.4045 18.1254 19.4043C18.126 19.4041 18.1266 19.4038 18.1277 19.4027L19.4027 18.1277C19.4039 18.1266 19.4041 18.126 19.4044 18.1254C19.4046 18.1247 19.4046 18.124 19.4044 18.1234L19.4041 18.1228C19.4037 18.1221 19.4032 18.1216 19.4027 18.1211L15.7816 14.5L19.4027 10.879C19.4038 10.8778 19.4041 10.8773 19.4043 10.8766C19.4045 10.8759 19.4045 10.8752 19.4043 10.8746C19.4041 10.874 19.4038 10.8734 19.4027 10.8723L18.1277 9.5973C18.1271 9.59656 18.1263 9.59599 18.1254 9.59566C18.1247 9.59546 18.1241 9.59546 18.1234 9.59566Z"
      fill="#3D3D3D"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);
export const ArrowCircle = ({ size = 24, dir = 'right', ...p }: P & { dir?: 'left' | 'right' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: dir === 'left' ? 'scaleX(-1)' : undefined,
      display: 'block',
      flexShrink: 0,
    }}
    {...p}
  >
    {/* Circle background abu-abu gelap */}
    <circle cx="12" cy="12" r="12" fill="#3D3D3D" />
    {/* Panah putih di tengah presisi */}
    <path
      d="M12 7.5L16.5 12L12 16.5M15.5 12H7.5"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export const PenSquare = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 3.5a2.1 2.1 0 013 3L12 16l-4 1 1-4 9.5-9.5z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /></svg>
);
export const Trash = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <path d="M3 6.52381C3 6.12932 3.32671 5.80952 3.72973 5.80952H8.51787C8.52437 4.9683 8.61554 3.81504 9.45037 3.01668C10.1074 2.38839 11.0081 2 12 2C12.9919 2 13.8926 2.38839 14.5496 3.01668C15.3844 3.81504 15.4756 4.9683 15.4821 5.80952H20.2703C20.6733 5.80952 21 6.12932 21 6.52381C21 6.9183 20.6733 7.2381 20.2703 7.2381H3.72973C3.32671 7.2381 3 6.9183 3 6.52381Z" fill="#FF2121"/>
    <path d="M11.5956 22H12.4044C15.1871 22 16.5785 22 17.4831 21.1141C18.3878 20.2281 18.4803 18.7749 18.6654 15.8685L18.9321 11.6806C19.0326 10.1036 19.0828 9.31512 18.6289 8.81546C18.1751 8.3158 17.4087 8.3158 15.876 8.3158H8.12404C6.59127 8.3158 5.82488 8.3158 5.37105 8.81546C4.91722 9.31512 4.96744 10.1036 5.06788 11.6806L5.33459 15.8685C5.5197 18.7749 5.61225 20.2281 6.51689 21.1141C7.42153 22 8.81289 22 11.5956 22ZM10.2463 12.1885C10.2051 11.7546 9.83753 11.4381 9.42537 11.4815C9.01321 11.5249 8.71251 11.9117 8.75372 12.3456L9.25372 17.6087C9.29494 18.0426 9.66247 18.3591 10.0746 18.3157C10.4868 18.2724 10.7875 17.8855 10.7463 17.4516L10.2463 12.1885ZM14.5746 11.4815C14.9868 11.5249 15.2875 11.9117 15.2463 12.3456L14.7463 17.6087C14.7051 18.0426 14.3375 18.3591 13.9254 18.3157C13.5132 18.2724 13.2125 17.8855 13.2537 17.4516L13.7537 12.1885C13.7949 11.7546 14.1625 11.4381 14.5746 11.4815Z" fill-rule="evenodd" clip-rule="evenodd" fill="#FF2121"/>
  </svg>
);
export const Maximize = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <rect x="4" y="4" width="16" height="15" fill="white" />
    <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM12.5 7C12.5 6.58579 12.8358 6.25 13.25 6.25H17C17.4142 6.25 17.75 6.58579 17.75 7V10.75C17.75 11.1642 17.4142 11.5 17 11.5C16.5858 11.5 16.25 11.1642 16.25 10.75V8.81066L8.81066 16.25H10.75C11.1642 16.25 11.5 16.5858 11.5 17C11.5 17.4142 11.1642 17.75 10.75 17.75H7C6.58579 17.75 6.25 17.4142 6.25 17V13.25C6.25 12.8358 6.58579 12.5 7 12.5C7.41421 12.5 7.75 12.8358 7.75 13.25V15.1893L15.1893 7.75H13.25C12.8358 7.75 12.5 7.41421 12.5 7Z" fill-rule="evenodd" clip-rule="evenodd" fill="#3D3D3D"/>
  </svg>
);
export const Minimize = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <rect x="4" y="4" width="16" height="15" fill="white" />
    <path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12ZM6.46967 17.5303C6.17678 17.2374 6.17678 16.7626 6.46967 16.4697L8.68934 14.25H7.5C7.08579 14.25 6.75 13.9142 6.75 13.5C6.75 13.0858 7.08579 12.75 7.5 12.75H10.5C10.9142 12.75 11.25 13.0858 11.25 13.5V16.5C11.25 16.9142 10.9142 17.25 10.5 17.25C10.0858 17.25 9.75 16.9142 9.75 16.5V15.3107L7.53033 17.5303C7.23744 17.8232 6.76256 17.8232 6.46967 17.5303ZM16.5 11.25C16.9142 11.25 17.25 10.9142 17.25 10.5C17.25 10.0858 16.9142 9.75 16.5 9.75H15.3107L17.5303 7.53033C17.8232 7.23744 17.8232 6.76256 17.5303 6.46967C17.2374 6.17678 16.7626 6.17678 16.4697 6.46967L14.25 8.68934V7.5C14.25 7.08579 13.9142 6.75 13.5 6.75C13.0858 6.75 12.75 7.08579 12.75 7.5V10.5C12.75 10.9142 13.0858 11.25 13.5 11.25H16.5Z" fill-rule="evenodd" clip-rule="evenodd" fill="#3D3D3D"/>
  </svg>
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
export const Bolt = ({ size = 15, color = '#ffffff', ...p }: P & { color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...p}
  >
    <path
      d="M3.9187 6.81244L6.37495 3.49994C7.6812 1.74995 8.3312 0.874945 8.78745 1.07495C9.2437 1.27495 9.03745 2.34995 8.59995 4.4937L8.57495 4.6312C8.43745 5.3187 8.3687 5.66869 8.5562 5.89994C8.7437 6.13119 9.0937 6.12495 9.8062 6.12495H10.1999C11.2812 6.12495 11.8187 6.12495 11.9937 6.4687C12.1687 6.81245 11.8437 7.24369 11.2062 8.11869L8.7062 11.5124C7.3937 13.2999 6.7312 14.1874 6.27495 13.9874C5.8187 13.7874 6.03745 12.6999 6.47495 10.5249L6.5187 10.2999C6.6562 9.61244 6.72495 9.26244 6.53745 9.03119C6.34995 8.79994 5.99995 8.8062 5.28745 8.8062H4.9187C3.8312 8.8062 3.2937 8.8062 3.1187 8.46245C2.9437 8.11869 3.2687 7.6812 3.9187 6.8062"
      fill={color}
    />
  </svg>
);
export const CheckCircle = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <circle cx="10" cy="10" r="10" fill="#21FF54" />
    <path d="M6 10L8.78453 12.7845C9.15906 13.1591 9.78025 13.1076 10.0881 12.6766L14.1429 7" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Circle = ({ size = 20, ...p }: P) => (<svg {...base(size, p)}><circle cx="12" cy="12" r="10.3" stroke="#fff" strokeWidth="1.5" /></svg>);
export const Chevron = ({ size = 18, dir = 'down', ...p }: P & { dir?: 'up' | 'down' | 'left' | 'right' }) => {
  const rot = { up: 180, down: 0, left: 90, right: -90 }[dir];
  return (<svg {...base(size, p)} style={{ transform: `rotate(${rot}deg)`, transition: 'transform .3s' }}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
};
export const Bluetooth = ({ size = 26, ...p }: P) => (<svg {...base(size, p)}><path d="M7 7l10 10-5 4V3l5 4L7 17" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>);
export const Music = ({ size = 18, ...p }: P) => (<svg {...base(size, p)}><path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.9" /><circle cx="17.5" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.9" /></svg>);
export const Disc = ({ size = 32, color = 'rgba(255, 255, 255, 0.45)', ...p }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...p}>
    <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6.5" stroke={color} strokeWidth="1" strokeDasharray="2.5 2.5" opacity="0.6" />
    <circle cx="12" cy="12" r="3.8" stroke={color} strokeWidth="1" opacity="0.8" />
    <circle cx="12" cy="12" r="1.8" fill={color} />
  </svg>
);
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

export const TrayArrowDown = ({ size = 28, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M4 16.5V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V16.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 3.5V15M12 15L7.5 10.5M12 15L16.5 10.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DiagonalResize = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M15 4H20V9M20 4L13 11M9 20H4V15M4 20L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DiagonalCollapse = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M14 10H20M14 10V4M14 10L20 4M10 14H4M10 14V20M10 14L4 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Sparkles = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z"
      fill="currentColor"
    />
    <path
      d="M18.5 16L19.3 18.7L22 19.5L19.3 20.3L18.5 23L17.7 20.3L15 19.5L17.7 18.7L18.5 16Z"
      fill="currentColor"
      opacity="0.8"
    />
  </svg>
);

export const Send = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ImageIcon = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Key = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}>
    <path
      d="M21 2L13.5 9.5M16 4.5L18.5 7M14 6.5L16.5 9M15 11C15 14.866 11.866 18 8 18C4.13401 18 1 14.866 1 11C1 7.13401 4.13401 4 8 4C9.85652 4 11.538 4.72124 12.7842 5.90161"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

