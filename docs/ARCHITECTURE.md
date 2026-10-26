# Arsitektur

## Alur render
```
App
 └─ Island (dock, drag, size spring)
     ├─ [closed] IdlePill  → timer berjalan | musik | tanggal
     └─ [open]   panel
         ├─ Navbar  (ikon eq, baterai, tanggal, jam, tutup)  ← drag handle
         ├─ body    (AnimatePresence, halaman slide + blur)
         │    └─ Widget (Music | Note | Calendar | Timer | Todo)
         └─ Pager   (panah + dots yang morph)
```

## Animasi "liquid"
- Ukuran: `animate={{ width, height }}` dengan `islandSpring` (damping rendah → overshoot).
- Isi: panel masuk `scale .9 + blur 12px → 1 + 0`, delay 70 ms agar ukuran "memimpin".
- Posisi: saat berubah ukuran, `x`/`y` dianimasikan dengan spring yang sama → island tumbuh dari tepi
  (sisi dock) tanpa lompat.
- Halaman: arah slide mengikuti `dir` (+1/-1) dengan blur; dots memanjang jadi pil 42px.
- Reduced motion: semua spring diganti `instant`.

## Draggable + dock
- `useDragControls` + `dragListener={false}`: hanya navbar/pill yang memulai drag.
- Klik vs drag dibedakan lewat ref `dragged` (reset di pointerdown).
- Lepas saat idle → magnet ke kiri/kanan terdekat (`dock`), lalu auto-hide: hanya `TAB` px yang terlihat,
  muncul lagi saat hover.
- Lepas saat terbuka → `dock = null`, posisi hanya di-clamp ke viewport.

## Data
| Store | Persist | Isi |
| --- | --- | --- |
| `ui` | tidak | open, page, dir, wide |
| `data` | `widgnot:data:v1` | notes, activities, autoHide |
| `timer` | `widgnot:timer:v1` (durasi saja) | mode, remaining, endsAt |
| `music` | tidak (blob URL) | tracks, playing, bluetooth |

Calendar dan Todo berbagi satu daftar `activities` (kunci tanggal `YYYY-MM-DD`).
Timer memakai `endsAt` (timestamp) agar akurat walau tab di-throttle.

## Keterbatasan web yang disengaja
- Music memutar file lokal; web tidak bisa membaca pemutaran aplikasi lain. Adapter ada di `store/music.ts`.
- Bluetooth hanya menampilkan perangkat (Web Bluetooth); routing audio tetap di OS.
- Widget hidup di dalam tab browser. Untuk "selalu di atas desktop" lihat `docs/ROADMAP.md` (Tauri/Electron).
