# Roadmap

## Cocokkan dengan Figma (prioritas)
- [ ] Ekspor ikon dari Figma → ganti `Icons.tsx`
- [ ] Layout `MusicWidget` playing sesuai node `5:2927`
- [ ] Varian minimize timer 293×145 (`11:1132`, `11:1238`)
- [ ] Tentukan arti idle state=1/2/3 (`13:1817`, `16:1921`, `18:1927`)
- [ ] Efek Pixelate pada cover musik (WebGPU shader Figma; atau pixelate via canvas sebagai pengganti)

## Fitur
- [ ] Pengaturan: toggle auto-hide (`useData.setAutoHide` sudah ada, belum ada UI)
- [ ] Swipe horizontal antar halaman (gesture `drag="x"` di body)
- [ ] Pengingat aktivitas (Notification API)
- [ ] Ekspor catatan ke `.txt`

## Desktop shell (agar benar-benar "slide bar" sistem)
- [ ] Bungkus dengan **Tauri** atau **Electron**: window transparan, tanpa frame, always-on-top,
      pin ke tepi layar; hit-test hanya pada island.
- [ ] Music: baca Now Playing OS (Windows SMTC / macOS MediaRemote) lewat plugin native, ganti adapter `store/music.ts`.
