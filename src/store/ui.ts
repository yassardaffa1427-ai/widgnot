import { create } from 'zustand';

export type PageId = 'music' | 'bluetooth' | 'note' | 'calendar' | 'timer' | 'todo' | 'drop';
/** Urutan halaman = urutan page-dot di Figma (7 halaman) */
export const PAGE_ORDER: PageId[] = ['music', 'bluetooth', 'note', 'calendar', 'timer', 'todo', 'drop'];

interface UIState {
  open: boolean;
  page: PageId;
  dir: 1 | -1;
  /** true saat editor catatan dimaksimalkan (584px) */
  wide: boolean;
  /** true saat form add activities terbuka (node 26:3408, h: 785px) */
  addingAct: boolean;
  /** true saat timer diminimalkan (293x145, node 11:1132 / 11:1238) */
  timerMinimized: boolean;
  /** true saat widget drop diminimalkan (tinggi 245px) */
  dropCompact: boolean;
  setOpen: (open: boolean) => void;
  go: (d: 1 | -1) => void;
  goTo: (p: PageId) => void;
  setWide: (w: boolean) => void;
  setAddingAct: (v: boolean) => void;
  setTimerMinimized: (v: boolean) => void;
  setDropCompact: (v: boolean) => void;
}

export const useUI = create<UIState>((set, get) => ({
  open: false,
  page: 'music',
  dir: 1,
  wide: false,
  addingAct: false,
  timerMinimized: false,
  dropCompact: false,
  setOpen: (open) =>
    set({
      open,
      wide: open ? get().wide : false,
      addingAct: open ? get().addingAct : false,
      timerMinimized: open ? get().timerMinimized : false,
    }),
  go: (d) => {
    const i = PAGE_ORDER.indexOf(get().page);
    const next = PAGE_ORDER[(i + d + PAGE_ORDER.length) % PAGE_ORDER.length];
    set({ page: next, dir: d, wide: false, addingAct: false, timerMinimized: false });
  },
  goTo: (p) => {
    const cur = PAGE_ORDER.indexOf(get().page);
    const nx = PAGE_ORDER.indexOf(p);
    set({ page: p, dir: nx >= cur ? 1 : -1, wide: false, addingAct: false, timerMinimized: false });
  },
  setWide: (wide) => set({ wide }),
  setAddingAct: (addingAct) => set({ addingAct }),
  setTimerMinimized: (timerMinimized) => set({ timerMinimized }),
  setDropCompact: (dropCompact) => set({ dropCompact }),
}));
