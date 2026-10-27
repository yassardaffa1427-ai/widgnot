<p align="center">
  <img src="build/icon.png" width="128" height="128" alt="Widgnot Logo" style="border-radius: 32px; box-shadow: 0 12px 36px rgba(0,0,0,0.45);" />
</p>

<h1 align="center">Widgnot</h1>

<p align="center">
  <b>Dynamic Island Desktop Widget</b> dengan animasi liquid untuk Windows.<br />
  <i>Music Player · Notes · Calendar & Activities · Timer · Todo List · Drag once, paste later</i>
</p>

<p align="center">
  <a href="https://github.com/yassardaffa1427-ai/widgnot/releases/latest">
    <img src="https://img.shields.io/github/v/release/yassardaffa1427-ai/widgnot?style=for-the-badge&color=0088ff&label=Download%20Installer%20v2.2.0%20(2.9%20MB)" alt="Download Windows Installer" />
  </a>
  <img src="https://img.shields.io/badge/Platform-Windows-0078d7?style=for-the-badge&logo=windows&logoColor=white" alt="Windows" />
  <img src="https://img.shields.io/badge/Engine-Tauri%20v2%20(Rust)-ffc131?style=for-the-badge&logo=tauri&logoColor=black" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/RAM-~30MB-10b981?style=for-the-badge" alt="RAM" />
  <img src="https://img.shields.io/badge/Size-2.9MB-success?style=for-the-badge" alt="Size" />
</p>

---

## ✦ Fitur Utama

- **🖱️ Freely Draggable & Click to Open**: Island dapat di-drag dan ditempatkan bebas di posisi mana pun di monitor Anda, serta dapat dibuka secara instan cukup dengan satu klik mouse pada pill saat idle (tanpa wajib menekan shortcut).
- **📋 Drag once, paste later (Halaman ke-6)**: Fitur clipboard visual untuk menampung banyak gambar sekaligus (lewat `Ctrl + V` atau *drag & drop*). Pengguna dapat memilih dan menyalin gambar satu per satu untuk di-paste kembali di platform media manapun seperti **Figma**, Discord, WhatsApp, atau Slack sesuai gambar yang dipilih.
- **🎵 Live Media & Real Bluetooth Integration**: Melacak secara langsung lagu yang sedang diputar di laptop (YouTube browser & Spotify Desktop) dengan pemotongan judul lagu yang rapi (*ellipsis*), serta tombol status Bluetooth perangkat (AirPods, TWS, headphone) yang terintegrasi langsung dengan Windows radio.
- **📝 Quick Notes**: Tulis dan simpan catatan cepat dengan mudah langsung dari island, lengkap dengan mode perluas editor (*expand*).
- **📅 Calendar & Activities**: Jadwal aktivitas harian interaktif dengan penanda tanggal dan agenda.
- **⏳ Focus & Idle Timer**: Timer squircle gradient (Figma node `11:1282`) untuk melacak waktu fokus produktif Anda.
- **✅ Todo List**: Checklist tugas harian yang tersimpan secara lokal dan persisten.
- **⚡ Seamless Click-Through**: Area transparan desktop overlay 100% tembus klik ke aplikasi lain, dan langsung responsif ketika kursor menyentuh pill Widgnot.
- **⚡ Background & System Tray**: Berjalan ringan di latar belakang (~30 MB RAM) tanpa mengotori taskbar, dan dapat diakses cepat lewat icon System Tray.

---

## 🖱️ Interaksi & Navigasi

| Aksi | Fungsi |
| --- | --- |
| **Klik Pill Saat Idle** | Membuka fitur Widgnot secara instan |
| **Drag Pill / Navbar** | Geser dan pindahkan posisi widget ke mana saja di layar |
| **Klik Gambar di "Drag once"** | Menyalin gambar terpilih ke clipboard (siap di-paste ke Figma / platform lain) |
| `Ctrl + V` di halaman ke-6 | Menempelkan gambar baru langsung dari clipboard ke koleksi |
| `Esc` | Menutup panel kembali ke mode pill mengambang |
| `Alt + W` *(Opsional)* | Pintasan keyboard global alternatif untuk toggle buka/tutup |

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
