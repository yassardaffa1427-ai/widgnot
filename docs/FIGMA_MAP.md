# Peta Figma → Kode

File: https://www.figma.com/design/FrgTIuGpf3fpWDsiTTJOK1/widgnot  ·  Frame utama `all` = node `5:2939`

| Figma node | Nama state | Kode | Catatan |
| --- | --- | --- | --- |
| `5:2936` | music on, idle (84×84) | `IdlePill` (musik) | cover 60px r22 + eq |
| `11:1282` / `11:1290` | stopwatch / break stopwatch idle | `IdlePill` (timer) | cincin + `02:50` |
| `13:1817` `16:1921` `18:1927` | state=1/2/3 idle | belum dipetakan | maksud varian belum jelas |
| `5:2933` | no music here | `MusicWidget` (empty) | |
| `5:2928` | bluetooth pairing | `MusicWidget` (pairing) | |
| `5:2927` | music on | `MusicWidget` (player) | layout dirancang ulang, perlu dicocokkan |
| `5:2937` | note default | `NoteWidget` (list) | |
| `5:2935` | note minimize | `NoteWidget` (editor) | |
| `5:2929` | note maximize (584×436) | `NoteWidget` + `ui.wide` | |
| `5:2938` | calendar default | `CalendarWidget` | bulan live, bukan "April 2026" |
| `5:2930` | calendar activities | `CalendarWidget` (list hari) | tinggi otomatis |
| `5:2931` | calendar add | `AddActivityForm` | |
| `5:2932` | focus timer | `TimerWidget` | |
| `9:993` | focus timer, break time | `TimerWidget` (mode break) | |
| `11:1132` `11:1238` | break/focus minimize (293×145) | **belum diimplementasi** | |
| `11:1562` | todo opened | `TodoWidget` | |
| `3:171` | navbar | `Navbar` | |
| `4:586` | page info | `Pager` | |
| `3:123` | battery info (full/quarter/half/low) | `BatteryRing` | memakai Battery API |
| `5:2774` `5:2771` | todo list / check | `ActivityRow` | |
| `11:1218` | start button play/pause | `.play` di `TimerWidget` | |

## Aset
Ikon dibuat ulang sebagai SVG inline di `src/components/ui/Icons.tsx` (bukan export Figma).
Untuk hasil pixel-perfect: ekspor SVG tiap ikon dari Figma ke `src/assets/icons/` dan ganti komponen terkait.
Efek **Pixelate** (shader) pada cover musik di `5:2936` tidak diimplementasi — lihat `docs/ROADMAP.md`.
