# Changelog

## [v2.3.0] — 2026-11-22

### 🛠 Masalah yang Diselesaikan (*Solved*)
- **AI Record Meeting tidak merekam suara Google Meet / rapat:**
  - Mengganti pendekatan lama berbasis `webkitSpeechRecognition` (yang tidak didukung di WebView2 Windows dan tidak menangkap suara sistem) dengan perekaman **Windows WASAPI Loopback + Mikrofon** secara native di backend Rust (`src-tauri/src/audio_capture.rs`).
  - Kini seluruh suara peserta Google Meet, Zoom, Teams, atau speaker/headset sekaligus suara mikrofon pengguna direkam dan digabung ke WAV 16 kHz mono, lalu ditranskripsikan secara realtime oleh Gemini (native audio input) atau OpenAI Whisper dengan timestamp `[MM:SS]`.
  - Menghapus teks placeholder palsu, menambahkan deteksi keheningan otomatis, indikator level suara pada titik merah rekam, serta peringatan jika API Key AI belum diisi.
- **Halaman selalu kembali ke Music saat dibuka ulang:**
  - Menambahkan persistensi `page` pada `useUI` (`src/store/ui.ts`) dan menghapus paksa reset ke `music` saat membuka ulang island dari pill, shortcut `Alt+W`, maupun status bar (`Island.tsx`, `App.tsx`, `DesktopShell.tsx`). Kini island otomatis membuka fitur terakhir yang sebelumnya ditutup (kecuali saat recording meeting atau timer sedang aktif).
- **Bug tampilan Music Widget (judul memanjang & tombol player hilang):**
  - Mengembalikan `min-width: 0` dan `overflow: hidden` pada `.music__top` agar judul/artis panjang terpotong rapi dengan ellipsis (`...`) dan tombol Bluetooth tetap terlihat di sisi kanan.
  - Menyesuaikan padding vertikal serta `flex: none` pada wrapper `Pager` sehingga tombol kontrol player (`Prev`, `Play/Pause`, `Next`) tampil utuh dan tidak terpotong.
  - Menghapus badge *"Otomatis sinkron YouTube & Spotify"* dari tampilan Music kosong agar lebih bersih sesuai desain Figma.
- **Area mati tidak bisa diklik di sekitar Idle Pill:**
  - Memperketat padding hit-testing di `src-tauri/src/lib.rs` agar area di luar kapsul pill 84×84 px 100% *click-through*.
- **Kartu menumpuk vertikal pada tampilan maximize "Drag once, paste later":**
  - Memisahkan wrapper scroll vertikal dari elemen CSS Grid di `src/components/widgets/DropWidget.tsx` serta menetapkan `rowGap: 12` = `columnGap: 12` dengan `gridAutoRows: 'max-content'` agar kartu `1:1` tidak terkompresi/menumpuk saat mencapai $\ge 3$ baris.

### ✨ Fitur Baru
- **AI Meeting Recording, Ringkasan Eksekutif & Ekspor `.docx`** (Figma `212:2537`, `207:2418`, `211:2532`, `155:2352`).
- **Dynamic Music Bottom Glow Gradient** yang tersinkronisasi dengan warna dominan cover lagu (Figma `5:2927`).
- **Update Ikon Kamera Video** pada idle pill recording (Figma `219:2343`).
