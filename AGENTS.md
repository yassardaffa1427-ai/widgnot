# AGENTS.md — Widgnot

## Tujuan
Frontend untuk widget sidebar tersembunyi "Widgnot" (Music, Note, Calendar, Timer, Todo) dengan
animasi liquid ala Dynamic Island dan perilaku draggable. Desain sumber ada di Figma (lihat `docs/FIGMA_MAP.md`).

## Perintah
- `npm run dev` — dev server
- `npm run build` — typecheck + build (wajib hijau sebelum selesai)

## Aturan kode
- TypeScript strict; tidak ada `any` baru.
- Warna/radius/font hanya dari `src/styles/tokens.css` (jangan hardcode nilai baru di komponen).
- Semua angka spring/animasi ada di `src/lib/motion.ts`; jangan menyebar angka sihir di komponen.
- State global lewat zustand di `src/store/*`. Komponen widget tidak menyimpan data persisten sendiri.
- Hormati `prefers-reduced-motion` (lihat `useReducedMotion` di `Island.tsx`).
- Elemen interaktif harus punya `aria-label` bila hanya berisi ikon.
- Jangan pakai localStorage langsung; pakai middleware `persist` zustand.

## Model island (penting)
- Island = satu kontainer yang `width/height`-nya dianimasikan spring. Isi (`panel`/`pill`) ditukar
  lewat `AnimatePresence` dengan crossfade + blur.
- Tinggi panel diukur (`ResizeObserver`) sehingga widget bebas bertumbuh; jangan hardcode tinggi.
- Posisi = `x`/`y` MotionValue di `.dock`. `dock: 'left' | 'right' | null` menentukan sisi tempat island
  "tumbuh". Pill yang dilepas akan magnet ke tepi; panel hanya di-clamp ke viewport.
- Hanya navbar dan pill yang menjadi drag handle (isi widget tidak, agar teks bisa diseleksi).

## Menambah widget
1. Buat `src/components/widgets/XWidget.tsx` (root: `<section className="widget">`).
2. Tambah id ke `PageId` + `PAGE_ORDER` di `src/store/ui.ts`.
3. Daftarkan di `WIDGETS` pada `Island.tsx`.

## Jangan
- Jangan ubah struktur `Island.tsx` tanpa menjalankan skenario di `.agent/workflows/verify.md`.
- Jangan menambah dependency berat (UI kit, Tailwind) tanpa persetujuan.
