# Widgnot

Hidden sidebar widget berbentuk "island" (ala Dynamic Island): **Music · Note · Calendar · Timer · Todo**.
Pill 84px menempel di tepi layar, bisa di-drag, dan mengembang dengan animasi spring "liquid".

Sumber desain: Figma `widgnot` (file key `FrgTIuGpf3fpWDsiTTJOK1`) — lihat `docs/FIGMA_MAP.md`.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + build produksi
```

Pintasan: `Alt+W` buka/tutup · `Esc` tutup · tarik navbar/pill untuk memindahkan.

## Stack

| Kebutuhan | Pilihan |
| --- | --- |
| Framework | React 18 + TypeScript + Vite |
| Animasi | `motion` (Framer Motion) — spring, drag, AnimatePresence |
| State | `zustand` (+ `persist` ke localStorage) |
| Styling | CSS biasa + design tokens (`src/styles/tokens.css`) |
| Font | Inter Tight via `@fontsource` (offline-friendly) |

## Struktur

```
src/
  components/
    island/     Island (drag, dock, spring), Navbar, Pager, IdlePill
    widgets/    Music, Note, Calendar, Timer, Todo
    ui/         Icons, Ring, EqBars, BatteryRing, ActivityRow, AddActivityForm
  store/        ui (halaman/open), data (notes+activities), timer, music
  lib/          motion.ts (konfigurasi spring), date.ts, hooks.ts
  styles/       tokens.css, global.css, island.css
docs/           ARCHITECTURE.md, FIGMA_MAP.md, ROADMAP.md
.agent/         rules + workflows untuk Antigravity
AGENTS.md       konteks proyek untuk agent
```

## Mengadaptasi di Antigravity IDE

1. **File → Open Folder** → pilih folder `widgnot`.
2. Jalankan `npm install && npm run dev` di terminal terintegrasi.
3. `AGENTS.md` dan `.agent/` berisi konteks, aturan kode, dan workflow verifikasi untuk agent.
   Jika versi Antigravity kamu memakai lokasi konfigurasi berbeda, salin isinya ke sana.
4. Prompt awal yang disarankan:
   > Baca `AGENTS.md` dan `docs/ARCHITECTURE.md`. Lalu kerjakan item pertama di `docs/ROADMAP.md`.
   > Jalankan workflow `/verify` sebelum selesai.

## Setel animasi

Semua angka "feel" ada di `src/lib/motion.ts`:

- `islandSpring` — ukuran island (stiffness 300, damping 26 → sedikit overshoot = liquid)
- `snapSpring` — snap ke tepi setelah drag
- `contentSpring` — transisi isi halaman

Naikkan `damping` untuk gerak lebih kaku, turunkan untuk lebih "jelly".
