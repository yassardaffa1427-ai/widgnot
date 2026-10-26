import { create } from 'zustand';

export type PageId = 'music' | 'note' | 'calendar' | 'timer' | 'todo';
/** Urutan halaman = urutan page-dot di Figma */
export const PAGE_ORDER: PageId[] = ['music', 'note', 'calendar', 'timer', 'todo'];

interface UIState {
  open: boolean;
  page: PageId;
  dir: 1 | -1;
  /** true saat editor catatan dimaksimalkan (584px) */
  wide: boolean;
  /** true saat form add activities terbuka (node 26:3408, h: 785px) */
  addingAct: boolean;
  setOpen: (open: boolean) => void;
  go: (d: 1 | -1) => void;
  goTo: (p: PageId) => void;
  setWide: (w: boolean) => void;
  setAddingAct: (v: boolean) => void;
}

export const useUI = create<UIState>((set, get) => ({
  open: false,
  page: 'music',
  dir: 1,
  wide: false,
  addingAct: false,
  setOpen: (open) => set({ open, wide: open ? get().wide : false, addingAct: open ? get().addingAct : false }),
  go: (d) => {
    const i = PAGE_ORDER.indexOf(get().page);
    const next = PAGE_ORDER[(i + d + PAGE_ORDER.length) % PAGE_ORDER.length];
    set({ page: next, dir: d, wide: false, addingAct: false });
  },
  goTo: (p) => {
    const cur = PAGE_ORDER.indexOf(get().page);
    const nx = PAGE_ORDER.indexOf(p);
    set({ page: p, dir: nx >= cur ? 1 : -1, wide: false, addingAct: false });
  },
  setWide: (wide) => set({ wide }),
  setAddingAct: (addingAct) => set({ addingAct }),
}));
