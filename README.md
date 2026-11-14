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

## Bina semula

```bash
npm install             # playwright 1.63.0, tailwindcss 3.4.17
npm run build:player    # → video-showcase-v7.html
npm run docs            # → sari-kata-bm-v7.srt
npm run check           # semakan automatik
npm run render          # → NADI-Muallim-Pitch-137s-v7.mp4 (perlukan FFmpeg)
```

## Privasi

- **Salinan dibersihkan.** Dalam `arkib/v2–v5-sumber.tar.gz` dan `e-acd-video/tools/`, baris pengawal lama yang menyenaraikan pengecam sebenar (nama kakitangan, ID spreadsheet, koordinat) telah dibuang. Fungsi lain tidak berubah. Salinan asal disimpan secara setempat.
- **Tidak dimuat naik:**
  - tangkapan skrin peta GIS (data kes sebenar);
  - tangkapan skrin WhatsApp (nama sebenar);
  - fail aplikasi e-ACD operasi (HTML dan Apps Script).
- **Imej peta glob** menggunakan imejan Google (Airbus/CNES/Maxar) dengan atribusi pada skrin. Penggunaan awam tertakluk kepada syarat Google.
