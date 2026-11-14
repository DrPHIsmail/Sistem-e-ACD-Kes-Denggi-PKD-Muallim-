# Sistem-e-ACD-Kes-Denggi-PKD-Muallim-

Projek filem pertandingan **NADI Muallim + e-ACD Denggi** untuk Pejabat Kesihatan Daerah Muallim: pemain HTML luar talian, eksport MP4 deterministik, sumber dan dokumentasi. Semua rekod, nama dan angka dalam filem ialah **data simulasi**. Dokumentasi penuh setiap versi ada dalam [`README-VIDEO.md`](README-VIDEO.md).

## Versi terkini: V7 (137 saat)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-137s-v7.mp4` | Filem akhir: 1920 × 1080, 60 fps, 137 s, muzik latar tanpa narasi |
| `video-showcase-v7.html` | Pemain luar talian; buka terus dalam pelayar |
| `sari-kata-bm-v7.srt` | Sari kata Bahasa Melayu (21 baris) |

## Versi terdahulu (untuk perbandingan)

| Versi | Fail |
|---|---|
| V6 (134 s) | `NADI-Muallim-Pitch-134s-v6.mp4`, `video-showcase-v6.html`, `sari-kata-bm-v6.srt` |
| V5 (120 s) | `NADI-Muallim-Pitch-120s-v5.mp4`, `video-showcase-v5.html`, `sari-kata-bm-v5.srt` |
| V4 (120 s) | `NADI-Muallim-Pitch-120s-v4.mp4`, `video-showcase-v4.html` |
| V3 (bernarasi) | `NADI-Muallim-Pitch-120s-v3.mp4`, `NADI-Muallim-V3-pratonton-00-30s.mp4`, `video-showcase-v3.html`, `sari-kata-bm-v3.srt` |
| V2 | `NADI-Muallim-120s.mp4`, `video-showcase.html`, `sari-kata-bm.srt` |

## Isi repositori

| Folder / fail | Isi |
|---|---|
| `src/` | Sumber pemain: data simulasi, markup, enjin garis masa, audio, pemain |
| `tools/` | Bina pemain, semakan automatik, sari kata, penjana tekstur glob peta |
| `render-video.js`, `package.json` | Eksport MP4 (Playwright + FFmpeg) |
| `assets/` | Fon (lesen OFL), Jata Negara, tekstur peta glob |
| `kit-suara/`, `narration-bm.wav`, `skrip-narasi-bm.md`, `narasi/` | Kit suara: suara TTS "Osman", digunakan dalam V3 sahaja |
| `arkib/` | Sumber setiap versi (v2–v7) dan README V2 |
| `e-acd-video/` | Projek filem e-ACD Denggi yang terdahulu (asas filem ini) |
| `rujukan/` | Borang ACD dan Lampiran 1 (PDF kosong), brief V3, tangkapan skrin maklum balas |
| `rujukan/sumber-sebenar/` | **Data sebenar:** peta GIS wabak, tangkapan skrin WhatsApp, tangkapan skrin Google Maps, fail aplikasi e-ACD operasi (HTML dan Apps Script) |

## Bina semula

```bash
npm install             # playwright 1.63.0, tailwindcss 3.4.17
npm run build:player    # → video-showcase-v7.html
npm run docs            # → sari-kata-bm-v7.srt
npm run check           # semakan automatik
npm run render          # → NADI-Muallim-Pitch-137s-v7.mp4 (perlukan FFmpeg)
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

Imej peta glob menggunakan imejan Google (Airbus/CNES/Maxar) dengan atribusi pada skrin. Penggunaan awam tertakluk kepada syarat Google.
