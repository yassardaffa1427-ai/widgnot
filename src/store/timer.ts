import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = 'focus' | 'break';
const STEP = 5 * 60;

interface TimerState {
  mode: TimerMode;
  focusSec: number;
  breakSec: number;
  running: boolean;
  remaining: number;
  endsAt: number | null;
  toggle: () => void;
  reset: () => void;
  adjust: (delta: 1 | -1) => void;
  setMode: (m: TimerMode) => void;
  tick: () => void;
}

const total = (s: Pick<TimerState, 'mode' | 'focusSec' | 'breakSec'>) => (s.mode === 'focus' ? s.focusSec : s.breakSec);

export const useTimer = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: 'focus',
      focusSec: 25 * 60,
      breakSec: 5 * 60,
      running: false,
      remaining: 25 * 60,
      endsAt: null,
      toggle: () => {
        const s = get();
        if (s.running) set({ running: false, endsAt: null });
        else set({ running: true, endsAt: Date.now() + s.remaining * 1000 });
      },
      reset: () => set((s) => ({ running: false, endsAt: null, remaining: total(s) })),
      adjust: (d) => {
        const s = get();
        if (s.running) return;
        const key = s.mode === 'focus' ? 'focusSec' : 'breakSec';
        const next = Math.min(180 * 60, Math.max(STEP, s[key] + d * STEP));
        set({ [key]: next, remaining: next } as Partial<TimerState>);
      },
      setMode: (mode) =>
        set((s) => ({ mode, running: false, endsAt: null, remaining: mode === 'focus' ? s.focusSec : s.breakSec })),
      tick: () => {
        const s = get();
        if (!s.running || !s.endsAt) return;
        const remaining = Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000));
        if (remaining > 0) return set({ remaining });
        // selesai -> pindah mode otomatis & berhenti
        beep();
        const mode: TimerMode = s.mode === 'focus' ? 'break' : 'focus';
        set({ mode, running: false, endsAt: null, remaining: mode === 'focus' ? s.focusSec : s.breakSec });
      },
    }),
    {
      name: 'widgnot:timer:v1',
      partialize: (s) => ({ focusSec: s.focusSec, breakSec: s.breakSec }),
      // saat reload, remaining diambil dari durasi tersimpan
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<TimerState>;
        const focusSec = p.focusSec ?? current.focusSec;
        return { ...current, ...p, focusSec, remaining: focusSec };
      },
    },
  ),
);

export const timerTotal = total;

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
  } catch { /* audio diblokir -> abaikan */ }
}
