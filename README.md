<p align="center">
  <img src="build/icon.png" width="128" height="128" alt="Widgnot Logo" style="border-radius: 32px; box-shadow: 0 12px 36px rgba(0,0,0,0.45);" />
</p>

<h1 align="center">Widgnot</h1>

<p align="center">
  <b>Dynamic Island Desktop Widget</b> dengan animasi liquid untuk Windows.<br />
  <i>Music Player · Bluetooth Earphones · Notes · Calendar & Activities · Timer · Todo List · Drag once, paste later</i>
</p>

<p align="center">
  <a href="https://github.com/yassardaffa1427-ai/widgnot/releases/latest">
    <img src="https://img.shields.io/github/v/release/yassardaffa1427-ai/widgnot?style=for-the-badge&color=0088ff&label=Download%20Installer%20v2.2.1" alt="Download Windows Installer" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Windows-0078d7?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/Engine-Tauri%20v2%20(Rust)-ffc131?style=for-the-badge&logo=tauri&logoColor=black" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/RAM-~30MB-10b981?style=for-the-badge" alt="RAM" />
  <img src="https://img.shields.io/badge/Size-2.9MB-success?style=for-the-badge" alt="Size" />
</p>

---

## ✦ Fitur Utama (v2.2.1)

- **🖱️ Freely Draggable & Click to Open**: Island dapat di-drag dan ditempatkan bebas di posisi mana pun di monitor Anda, serta dapat dibuka secara instan cukup dengan satu klik mouse pada pill saat idle (tanpa wajib menekan shortcut).
- **🎧 Halaman Bluetooth Earphones (Figma 102:2169)**: Halaman khusus yang menampilkan status koneksi earphone/TWS/AirPods lengkap dengan persentase baterai riil Windows (R & L) dan visual neon glowing ring cyan.
- **⏰ Task Mulai & Deadline (Figma 26:3408)**: Formulir tambah aktivitas kini mendukung pengaturan waktu mulai dan batas waktu pengerjaan (*deadline*) secara terpisah.
- **🚨 Maskot Urgency & Bubble Chat Interaktif**:
  - Maskot otomatis berubah ekspresi menjadi kuning (*Warning*) saat deadline $\le 60$ menit, dan merah bergetar (*Angry*) saat deadline $\le 15$ menit atau terlewat.
  - Bubble chat interaktif dengan kalimat manusiawi muncul setiap 60 detik di atas maskot idle.
  - Klik pada bubble membuka menu aksi: **Matikan** (bisu pengingat), **1 Menit Lagi** (*snooze*), atau **Buka** (langsung ke To-Do).
- **👻 10-Second Idle Auto-Hide & Auto-Peek**: Pill otomatis sembunyi separuh ke tepi layar laptop setelah 10 detik tanpa aktivitas, dan otomatis mengintip (*peek*) keluar saat mouse didekatkan ke tepi.
- **📋 Drag once, paste later (Halaman ke-7)**: Fitur clipboard visual untuk menampung banyak gambar sekaligus (lewat `Ctrl + V` atau *drag & drop*). Pengguna dapat memilih dan menyalin gambar satu per satu untuk di-paste kembali di platform manapun seperti Figma, Discord, WhatsApp, atau Slack.
- **🎵 Live Media Player**: Melacak lagu yang sedang diputar di laptop (YouTube browser & Spotify Desktop) dengan thumbnail anti-ghosting drag.
- **📝 Quick Notes**: Tulis dan simpan catatan cepat dengan mode normal maupun expand.
- **📅 Calendar & Activities**: Kalender bersih tanpa footer waktu yang mengganggu.
- **⏳ Focus & Idle Timer**: Timer squircle gradient untuk melacak waktu fokus produktif Anda.
- **✅ Todo List**: Checklist tugas harian yang tersimpan lokal dan persisten.
- **⚡ Zero Click-Blocking**: Monitor utama dan aplikasi lain 100% bebas diklik saat Widgnot terbuka maupun idle berkat hit-testing native Win32.

---

## 🖱️ Interaksi & Navigasi

| Aksi | Fungsi |
| --- | --- |
| **Klik Pill Saat Idle** | Membuka panel fitur Widgnot secara instan |
| **Klik Bubble Reminder** | Membuka menu opsi: Matikan pengingat, Snooze 1 menit, atau Buka task |
| **Drag Pill / Navbar** | Geser dan pindahkan posisi widget ke mana saja di layar |
| **Hover Tepi Layar** | Mengintip (*peek*) pill yang sedang auto-hide di pinggir layar |
| **Klik Gambar di "Drag once"** | Menyalin gambar terpilih ke clipboard (siap di-paste ke Figma / platform lain) |
| `Ctrl + V` di halaman Drop | Menempelkan gambar baru langsung dari clipboard ke koleksi |
| `Esc` | Menutup panel kembali ke mode pill mengambang |
| `Alt + W` *(Opsional)* | Pintasan keyboard global alternatif untuk toggle buka/tutup |

---

## 📦 Cara Unduh & Instal

1. Kunjungi halaman [Releases Terbaru](https://github.com/yassardaffa1427-ai/widgnot/releases/latest).
2. Unduh installer ringan versi **Tauri (v2.2.1)**:
   - **`Widgnot_2.2.1_x64-setup.exe`** (Installer super ringan ~2.9 MB)
   - atau **`widgnot.exe`** (Versi Portable Standalone ~10.2 MB)
3. Jalankan aplikasi — Widgnot akan langsung aktif di layar laptop Anda!

---

<p align="center">
  Dibuat dengan ❤️ menggunakan React, Vite, Framer Motion, Rust, dan Tauri v2.
</p>
