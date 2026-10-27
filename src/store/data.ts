import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note { id: string; body: string; updatedAt: number }
export interface Activity { id: string; title: string; date: string; time: string; done: boolean; notes?: string }

interface DataState {
  notes: Note[];
  activities: Activity[];
  autoHide: boolean;
  addNote: (body?: string) => string;
  updateNote: (id: string, body: string) => void;
  removeNote: (id: string) => void;
  addActivity: (a: Omit<Activity, 'id' | 'done'>) => void;
  toggleActivity: (id: string) => void;
  removeActivity: (id: string) => void;
  setAutoHide: (v: boolean) => void;
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export const useData = create<DataState>()(
  persist(
    (set) => ({
      notes: [],
      activities: [],
      autoHide: false,
      addNote: (body = '') => {
        const id = uid();
        set((s) => ({ notes: [{ id, body, updatedAt: Date.now() }, ...s.notes] }));
        return id;
      },
      updateNote: (id, body) =>
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...n, body, updatedAt: Date.now() } : n)) })),
      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      addActivity: (a) => set((s) => ({ activities: [...s.activities, { ...a, id: uid(), done: false }] })),
      toggleActivity: (id) =>
        set((s) => ({ activities: s.activities.map((a) => (a.id === id ? { ...a, done: !a.done } : a)) })),
      removeActivity: (id) => set((s) => ({ activities: s.activities.filter((a) => a.id !== id) })),
      setAutoHide: (autoHide) => set({ autoHide }),
    }),
    { name: 'widgnot:data:v3' },
  ),
);
