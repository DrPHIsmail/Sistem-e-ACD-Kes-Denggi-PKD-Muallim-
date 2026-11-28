# Sistem-e-ACD-Kes-Denggi-PKD-Muallim-

Projek filem pertandingan **NADI Muallim + e-ACD Denggi** untuk Pejabat Kesihatan Daerah Muallim: pemain HTML luar talian, eksport MP4 deterministik, sumber dan dokumentasi. Semua rekod, nama dan angka dalam filem ialah **data simulasi**. Dokumentasi penuh setiap versi ada dalam [`README-VIDEO.md`](README-VIDEO.md).

## Versi terkini: V11 (141.4 saat)

V11 ialah V10 dengan dua lagi teknik daripada video rujukan:
- **Angka bergerak:** pada 1:44–1:46, empat angka laporan WhatsApp (110, 92, 12, 84%) terbang dan mendarat di tempatnya dalam blok "Ringkasan e-ACD" NADI.
- **Penutup triad:** cincin 200 m terbuka menjadi garis pemisah, lalu "Rekod di lapangan. Terus ke NADI. Susulan terancang." muncul perkataan demi perkataan.

**V11 tiada MP4.** Atas permintaan pemilik, hanya pemain HTML disediakan. MP4 dalam repositori ialah V10, iaitu versi terakhir yang dirender; ia belum mengandungi perubahan V11. Untuk merender MP4 V11, jalankan `npm run render`.

| Fail | Kegunaan |
|---|---|
| `video-showcase-v11.html` | Pemain HTML berdiri sendiri V11 (8.0 MB, luar talian). Dilukis pada resolusi skrin, hingga 4K / Retina. Untuk pembentangan: F = skrin penuh, C = mod bersih |
| `NADI-Muallim-Pitch-141s-v10.mp4` | MP4 terkini yang dirender (V10): 1920 × 1080, 60 fps, 141.4 s, narasi ElevenLabs (suara "Ahmad") dan muzik latar, tanpa sari kata dalam gambar |
| `sari-kata-bm-v9.srt` | Sari kata Bahasa Melayu (29 baris, tidak berubah sejak V9), untuk dimuat naik berasingan, contohnya ke YouTube |

## Versi terdahulu (untuk perbandingan)

Repositori ini hanya menyimpan satu MP4, iaitu V10 (V11 tidak dirender). Versi terdahulu boleh ditonton melalui pemain HTML masing-masing. Jika perlu, MP4-nya boleh dirender semula daripada sumber dalam `arkib/vN-sumber.tar.gz`; setiap arkib ada `render-video.js` sendiri. Begitu juga filem e-ACD Denggi: pemainnya `e-acd-video/video-showcase.html` masih ada, dan MP4-nya boleh dirender semula dengan `e-acd-video/render-video.js`.

| Versi | Fail |
|---|---|
| V10 (141.4 s, elemen wira, imbasan, kamera tidak pernah pegun) | `video-showcase-v10.html`, `NADI-Muallim-Pitch-141s-v10.mp4` |
| V9 (141.4 s, latar 3D Google Earth, pemain HD) | `video-showcase-v9.html`, `sari-kata-bm-v9.srt` |
| V8 (137 s, bernarasi ElevenLabs) | `video-showcase-v8.html`, `sari-kata-bm-v8.srt` |
| V7 (137 s, muzik sahaja) | `video-showcase-v7.html`, `sari-kata-bm-v7.srt` |
| V6 (134 s) | `video-showcase-v6.html`, `sari-kata-bm-v6.srt` |
| V5 (120 s) | `video-showcase-v5.html`, `sari-kata-bm-v5.srt` |
| V4 (120 s) | `video-showcase-v4.html` |
| V3 (bernarasi) | `video-showcase-v3.html`, `sari-kata-bm-v3.srt` |
| V2 | `video-showcase.html`, `sari-kata-bm.srt` |

## Isi repositori

| Folder / fail | Isi |
|---|---|
| `src/` | Sumber pemain: data simulasi, markup, enjin garis masa, audio, pemain |
| `tools/` | Bina pemain, semakan automatik (98 semakan), sari kata, penempatan narasi, penjana tekstur glob, pemulihan kamera imej Google Earth, semakan kestabilan panel dan bingkai beku MP4 |
| `render-video.js`, `package.json` | Eksport MP4 (Playwright + FFmpeg) |
| `assets/` | Fon (lesen OFL), Jata Negara, tekstur peta glob, imej Google Earth untuk latar 3D (`udara-3d.jpg`) |
| `narasi-v8/`, `narasi-v9/` | Narasi ElevenLabs: semua take, take terpilih, penempatan dan WAV narasi |
| `kit-suara/`, `narration-bm.wav`, `skrip-narasi-bm.md`, `narasi/` | Kit suara: suara TTS "Osman", digunakan dalam V3 sahaja |
| `arkib/` | Sumber setiap versi (v2–v11) dan README V2 |
| `.claude/skills/html-film-data-flight-triad/` | Skill Claude untuk teknik V11 (angka terbang antara skrin, penutup triad), beserta kod contoh dan semakannya |
| `e-acd-video/` | Projek filem e-ACD Denggi yang terdahulu (asas filem ini) |
| `rujukan/` | Borang ACD dan Lampiran 1 (PDF kosong), brief V3, tangkapan skrin maklum balas |
| `rujukan/sumber-sebenar/` | **Data sebenar:** peta GIS wabak, tangkapan skrin WhatsApp, tangkapan skrin Google Maps, fail aplikasi e-ACD operasi (HTML dan Apps Script) |

## Bina semula

```bash
npm install             # playwright 1.63.0, tailwindcss 3.4.17, three 0.158.0
npm run build:player    # → video-showcase-v11.html (perlu TAILWIND_BIN; three.js daripada node_modules)
npm run docs            # → sari-kata-bm-v9.srt
npm run check           # 98 semakan automatik
npm run render          # → NADI-Muallim-Pitch-141s-v11.mp4 (perlukan FFmpeg; tidak dijalankan untuk V11)
python3 -I tools/check-mp4-freeze.py NADI-Muallim-Pitch-141s-v11.mp4   # tiada bingkai pegun ≥ 0.5 s
```

## Privasi: repositori ini mesti kekal PERIBADI

Filem dan pemainnya hanya menggunakan data simulasi. Tetapi repositori ini juga menyimpan bahan sumber dengan **data sebenar**:

| Lokasi | Kandungan sebenar |
|---|---|
| `rujukan/sumber-sebenar/peta-gis-wabak-kg-ketoyong.webp` | Nombor wabak, nombor rumah kes, tarikh onset, keputusan serologi dan jentik |
| `rujukan/sumber-sebenar/tangkapan-whatsapp-laporan-acd.jpg` | Nama ahli kumpulan, nama kumpulan dan angka laporan sebenar |
| `rujukan/sumber-sebenar/sistem_e_acd_denggi_pkd_muallim.html`, `code_appsscript_2.js` | Aplikasi e-ACD operasi, termasuk ID spreadsheet sebenar |
| `arkib/v2–v5-sumber.tar.gz`, `e-acd-video/tools/` | Senarai pengawal privasi dengan nama kakitangan sebenar, ID spreadsheet dan koordinat |

Jangan jadikan repositori ini awam dan jangan kongsi fail di atas di luar pasukan. Hanya fail filem (MP4, pemain HTML, sari kata) yang selamat untuk dikongsi.

Imej peta glob dan latar 3D V9 menggunakan imejan Google (Google Maps dan Google Earth; Airbus/CNES/Maxar), dengan atribusi pada skrin. Penggunaan awam tertakluk kepada syarat Google, dan **perlu disahkan**. Latar 3D menunjukkan pekan sebenar, dengan kubah 200 m pada pusat wabak GIS. Seperti V6, tiada rumah kes ditanda.
