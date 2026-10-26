---
description: Verifikasi Widgnot sebelum menyelesaikan tugas
---
1. Jalankan `npm run build` — harus tanpa error.
2. Jalankan `npm run dev` dan cek manual:
   - Pill idle tampil di tepi kanan; saat tidak di-hover ia "mengintip" (auto-hide).
   - Klik pill → island mengembang dari tepi dengan overshoot halus, isi fade+blur masuk.
   - Drag navbar → island berpindah; lepas saat idle → menempel ke tepi terdekat.
   - Panah/dots pindah halaman: Music → Note → Calendar → Timer → Todo, arah slide mengikuti panah.
   - Note: tambah, ketik, maksimalkan (lebar 584), hapus, import .txt.
   - Calendar: pilih tanggal, ganti bulan, tambah aktivitas, centang.
   - Timer: start, tutup island → pill menampilkan hitung mundur; selesai → bunyi + ganti mode.
   - Music: add songs (file audio), play/pause, seek, next/prev.
   - Reload halaman → notes, aktivitas, durasi timer tetap ada.
3. Aktifkan "Reduce motion" di OS → animasi harus jadi instan, tidak rusak.
