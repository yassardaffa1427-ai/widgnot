<p align="center">
  <img src="build/icon.png" width="128" height="128" alt="Widgnot Logo" style="border-radius: 32px; box-shadow: 0 12px 36px rgba(0,0,0,0.45);" />
</p>

<h1 align="center">Widgnot</h1>

<p align="center">
  <b>Hidden Island Desktop Widget</b> dengan animasi liquid Dynamic Island untuk Windows.<br />
  <i>Music Player · Notes · Calendar & Activities · Timer · Todo List</i>
</p>

<p align="center">
  <a href="https://github.com/yassardaffa1427-ai/widgnot/releases/latest">
    <img src="https://img.shields.io/github/v/release/yassardaffa1427-ai/widgnot?style=for-the-badge&color=0088ff&label=Download%20Installer%20(2.9%20MB)" alt="Download Windows Installer" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Windows-0078d7?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/Engine-Tauri%20v2%20(Rust)-ffc131?style=for-the-badge&logo=tauri&logoColor=black" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/RAM-~30MB-10b981?style=for-the-badge" alt="RAM" />
  <img src="https://img.shields.io/badge/Size-2.9MB-success?style=for-the-badge" alt="Size" />
</p>

---

## ✦ Fitur Utama

- **🏝️ Hidden Dynamic Island**: Widget mengambang transparan di tepi layar dengan animasi spring "liquid" yang mulus.
- **🎵 Live Media Synchronization**: Melacak secara langsung apa pun lagu yang sedang diputar di laptop, termasuk **YouTube** di browser (Opera, Opera GX, Chrome, Edge, Firefox) dan **Spotify Desktop**, lengkap dengan kontrol putar/jeda, lagu berikutnya, dan sebelumnya.
- **📝 Quick Notes**: Tulis dan simpan catatan cepat dengan mudah langsung dari island.
- **📅 Calendar & Activities**: Jadwal aktivitas harian dengan picker tanggal dan waktu terintegrasi.
- **⏳ Focus & Idle Timer**: Timer squircle gradient interaktif (desain Figma node `11:1282`) untuk melacak waktu fokus.
- **✅ Todo List**: Checklist tugas harian yang tersimpan secara lokal dan persisten.
- **⚡ Background & System Tray**: Aplikasi berjalan di belakang layar tanpa mengotori taskbar. Dapat diakses kapan saja lewat icon System Tray atau hotkey global.

---

## ⌨️ Pintasan Keyboard (Hotkeys)

| Shortcut | Aksi |
| --- | --- |
| `Alt + W` | **Buka / Tutup Widgnot** dari aplikasi apa pun |
| `Esc` | Tutup panel island ke mode pill mengambang |
| `Drag Navbar` | Geser dan pindahkan posisi island ke sisi layar mana pun (magnet tepi otomatis) |

---

## 📦 Cara Unduh & Instal

1. Kunjungi halaman [Releases Terbaru](https://github.com/yassardaffa1427-ai/widgnot/releases/latest).
2. Unduh file instalasi:
   - **`Widgnot Setup x.x.x.exe`** (Installer Windows dengan shortcut desktop dan start menu otomatis)
   - atau **`Widgnot x.x.x.exe`** (Versi Portable tanpa instalasi)
3. Jalankan aplikasi — Widgnot akan langsung aktif di layar laptop Anda!

---

## 🛠️ Pengembangan Lokal
 
```bash
# Clone repositori
git clone https://github.com/yassardaffa1427-ai/widgnot.git
cd widgnot

# Install dependencies
npm install

# Jalankan dalam mode desktop development (Vite + Tauri)
npm run tauri:dev

# Build installer Windows .exe (hanya 2.9 MB)
npm run tauri:build
```

---

## 🎨 Desain

Desain antarmuka dibuat berdasarkan spesifikasi Figma **`widgnot`** (`FrgTIuGpf3fpWDsiTTJOK1`).
- Icon resmi aplikasi: Node Figma `36:1126`
- Token warna, font Inter Tight, dan spring motion: `src/styles/tokens.css` & `src/lib/motion.ts`.

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/yassardaffa1427-ai">yassardaffa1427-ai</a>
</p>
