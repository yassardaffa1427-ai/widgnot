export const pad = (n: number) => String(n).padStart(2, '0');

/** YYYY-MM-DD dalam zona waktu lokal */
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** 0 = Minggu, 1 = Senin. Ubah ke 0 untuk kalender Minggu-pertama. */
export const WEEK_START = 1 as 0 | 1;

export const weekdayIndex = (d: Date) => (d.getDay() - WEEK_START + 7) % 7;
export const WEEKDAYS_SHORT = WEEK_START === 1 ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const WEEKDAYS_LABEL = WEEK_START === 1
  ? ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  : ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

export const monthMatrix = (cursor: Date): (Date | null)[][] => {
  const first = startOfMonth(cursor);
  const lead = weekdayIndex(first);
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(lead).fill(null)];
  for (let i = 1; i <= days; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
  while (cells.length % 7) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
};

export const weekOf = (d: Date): Date[] => {
  const start = addDays(d, -weekdayIndex(d));
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

export const fmtMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
export const fmtNavDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).replace(/,/g, '');
/** Format navbar Figma: "13.19 Pm" */
export const fmtNavTime = (d: Date) => `${pad(d.getHours())}.${pad(d.getMinutes())} ${d.getHours() >= 12 ? 'Pm' : 'Am'}`;
/** "17:00" -> "05:00 PM" */
export const fmtClock = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${pad(h % 12 || 12)}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const fmtMMSS = (sec: number) => `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
