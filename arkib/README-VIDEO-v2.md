# NADI Muallim — Filem Pertandingan 120 Saat

Filem 02:00.000 (1920 × 1080, 60 fps, 7,200 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. Filem ini mengikut pelan suntingan:
- **NADI Muallim** memperkenalkan satu lokaliti (Kg. Ketoyong) dan satu soalan operasi.
- **e-ACD Denggi** menunjukkan cara petugas menjawab soalan itu melalui satu lawatan premis.
- Filem berakhir dengan keputusan penyelia untuk lawatan susulan.

Semua rekod, nama, angka dan lokasi ialah **data simulasi**. Paparan yang menunjukkan ringkasan e-ACD di dalam NADI dilabel **Prototaip Integrasi**.

**Mesej utama.** Cukup satu telefon untuk merekod lawatan ACD. Dapatan dikira automatik, dan ringkasan boleh disediakan sebelum pasukan meninggalkan lapangan.

## Fail yang dihantar

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-120s.mp4` | Filem siap: sari kata BM, muzik asal dan kesan bunyi. **Belum ada suara narator**: narasi perlu dirakam (lihat §6). |
| `video-showcase.html` | Pemain kendiri (HTML/CSS/JS sebaris, fon dan Jata Negara terbenam). Dibuka dengan klik dua kali dan berfungsi tanpa internet. |
| `render-video.js` | Eksport MP4 automatik: Playwright Chromium → PNG bingkai 0–7199 → FFmpeg H.264 + AAC 48 kHz. `--voiceover` menambah narasi dan merendahkan muzik di bawahnya. |
| `skrip-narasi-bm.md` | Skrip narasi BM mengikut babak (7 rakaman), dengan masa mula/tamat, rentak dan nota sebutan. |
| `sari-kata-bm.srt` | 27 kiu sari kata yang sama dalam format SRT. |
| `tools/sync-narration.js` | Menyegerakkan rakaman babak dengan filem dan menjana `narasi/narasi-penuh.wav` serta masa sari kata daripada rakaman. |
| `tools/check-player.js` | 49 semakan automatik (luar talian, data, label, tahanan, kamera, ketentuan bingkai, audio, kawalan). |
| `src/`, `assets/`, `tools/` | Sumber yang boleh disunting, skrip binaan dan penjana dokumen. |
| `package.json` | Kebergantungan tetap: `playwright@1.63.0`; `tailwindcss@3.4.17` (dev, hanya untuk membina semula pemain). |

## 1. Buka pemain

Klik dua kali `video-showcase.html`, atau:

```bash
xdg-open video-showcase.html
```

Di macOS gunakan `open`, di Windows `start`. Klik pertama (**Tekan untuk mula**) memulakan main balik dan membuka audio pelayar. Halaman ini tidak membuat sebarang permintaan rangkaian.

| Kawalan | Butang / kekunci |
|---|---|
| Main / jeda | **Main / Jeda**, `Space` |
| Mula semula | **Mula Semula**, `R` |
| Lompat babak 1–7 | butang babak, `1`–`7` |
| ±1 s / ±5 s, satu bingkai | `←` `→` (tambah `Shift`), `,` `.` |
| Bunyi, sari kata | `M`, `S` |
| Skrin penuh | `F` |
| Mod rakaman bersih (tiada kawalan, tiada kursor) | **Mod Rakaman Bersih**, `C` (keluar: `Esc`) |
| Suara pelayar ms-MY (pratonton sahaja) | **Suara BM (ms-MY)**: aktif hanya jika pelayar mempunyai suara Bahasa Melayu |

Parameter URL: `?t=76` (mula pada 01:16), `?clean=1`, `?subs=0`, `?mute=1`.

## 2. Garis masa (selaras dengan pelan)

Masa tahanan di bawah diukur bingkai demi bingkai oleh `tools/check-player.js` (elemen pada kelegapan penuh).

| Masa | Paparan | Tahanan yang diukur |
|---|---|---|
| 00:00–00:12 | Peta NADI, klik penanda Kg. Ketoyong, kad lokaliti. Kamera menolak ke kad pada 00:03.1–00:04.4 dan kemudian diam. | Soalan **"Premis mana masih perlu dilawati?"** 4.95 s (00:06.78–00:11.73). Kamera diam 7.2 s. |
| 00:12–00:17 | Satu komposisi: Borang ACD, Fail Rekod ACD, kiraan manual dan taip semula pada komputer riba. Fokus berpindah mengikut narasi. | — |
| 00:17–00:28 | Telefon masuk; petugas membuka e-ACD (00:18.05) dan menekan *Rekod Rumah Baharu*. Teks utama **"Cukup satu telefon untuk rekod ACD"** dipaparkan 00:19.75–00:27.95. | — |
| 00:28–01:02 | Satu premis contoh (Premis Contoh 012). Pasukan 1 dan *1 - Dilawati* (28–38 s), satu individu bergejala dan satu rujukan (38–48 s), takungan Aedes dan tindakan Bahagian C (48–56 s), *Simpan* (00:56.9). Kad rekod di kiri terisi satu medan pada satu masa. | **"Rekod disimpan"** 4.67 s. Kamera diam 28.4 s semasa rekod dimasukkan. |
| 01:02–01:24 | Jadual enam pasukan: lajur *Jumlah* bertambah apabila sorotan melalui Pasukan 1→6. Kemudian satu paparan stabil: **84% liputan ACD** dan **92 daripada 110 premis dilawati**, dengan **Data Simulasi** dan dapatan lain sebagai maklumat sekunder. | Panel hasil 15.42 s (01:07.98–01:23.40). Kamera tidak bergerak sepanjang 01:08–01:16. |
| 01:24–01:30.4 | Bahagian D: nama contoh, jawatan PPKP, tarikh, *Sahkan*. | **Pengesahan direkodkan** 4.37 s |
| 01:30.4–01:43 | *Salin Laporan (WhatsApp)* → ringkasan contoh yang sudah ditampal (aplikasi mesej simulasi). **"Jimat masa menyediakan laporan"** dipaparkan dari 01:35.55. | Ringkasan ditampal 9.23 s |
| 01:43–01:54 | Kembali ke kad NADI; bahagian **Ringkasan e-ACD** (Prototaip Integrasi + Data Simulasi): 110 sasaran, 92 dilawati, 12 berkunci/kosong, **6 belum dilawati**. Penyelia klik **Rancang lawatan susulan** (01:50.05); 6 premis susulan muncul pada peta dan dalam senarai. | **"6 premis belum dilawati"** 9.03 s. Keputusan 3.27 s. Kamera diam 10.3 s. |
| 01:54–02:00 | Jata Negara, **NADI Muallim**, **Dari Survelan ke Respons Denggi**, **Pejabat Kesihatan Daerah Muallim**. | Ketiga-tiga baris kelihatan penuh 5.18 s, hingga bingkai terakhir. |

Peralihan antara peranti ialah larutan ringkas melalui latar (≈0.3 s keluar, ≈0.35 s masuk), supaya dua skrin tidak bertindih. Dalam babak 5, Bahagian D → papan pemuka ialah potongan terus dengan celup ringan.

## 3. Penyimpangan daripada pelan dan sebabnya

1. **Pemisahan babak 01:24–01:43 dialih dari 01:33 ke 01:30.4.** Pada 01:33, narasi *"Ringkasan boleh disalin…"* hingga *"…untuk menyediakan laporan."* perlu dibaca pada ≈6 suku kata sesaat dalam 10 s, terlalu pantas untuk narasi formal. Dengan 01:30.4, setiap frasa ≤ 5.4 suku kata sesaat. Pengesahan masih ditahan 4.37 s (≥ 4 s).
2. **Rentak babak 6 padat (≈5.2 suku kata sesaat).** Teks dikekalkan seperti dalam pelan. Pilihan pendek ada dalam `skrip-narasi-bm.md`: buang *"bagi lokaliti yang sama"*.
3. **Keputusan penyelia ditahan 3.27 s**, bukan 4 s. Pelan meminta 6 premis ditahan ≥ 5 s (9.03 s dicapai) dan keputusan *ditunjukkan*. Klik berlaku pada 01:50.05 apabila narator menyebut *"merancang lawatan susulan"*; babak tamat pada 01:54.
4. **Label ambang 80%.** Aplikasi e-ACD asal memaparkan *"Capai Sasaran (≥80%)"*. Dalam filem, lencana itu ditulis **"Sasaran dalam aplikasi ≥ 80%"**, mengikut arahan 5.
5. **Kad lokaliti NADI dibina semula dengan data sintetik** berdasarkan `OutbreakMap.tsx` (kad terapung L848–1036): lencana WT, 4 kotak metrik, *Kawalan Kesihatan Awam* (PTP/SRT) dan butang *Analisis Kawalan AI*. Yang tidak ditunjukkan: koordinat, nombor wabak sebenar, nama mukim dan *Senarai Kes* (senarai pesakit). Bahagian *Ringkasan e-ACD* dan butang *Rancang lawatan susulan* **tidak wujud** dalam repositori NADI. Kedua-duanya ialah reka bentuk prototaip, maka dilabel *Prototaip Integrasi*.
6. **Pengepala NADI dipermudah.** Mengikut `Header.tsx`: jubin ikon, *N.A.D.I Muallim*, subtajuk dan Jata + nama PKD. Butang yang bergantung pada sambungan langsung tidak dipaparkan (*Smart Input (NLP)*, *Google Sheet*, *Muat Naik CSV*, pangkalan data, Drive). Hanya *Privasi: Dilindungi* dan penunjuk dalam talian dikekalkan. Peta ialah lukisan ilustrasi, bukan jubin OpenStreetMap, dan bertanda *"peta ilustrasi, bukan berskala"*.
7. **Paparan agregat menggunakan papan pemuka desktop e-ACD**, iaitu paparan penyelia. Jadual enam lajur tidak terbaca pada skrin telefon. Telefon kekal sebagai peranti petugas dalam babak 2, 3 dan 5.
8. **Aplikasi mesej ialah simulasi generik** ("WhatsApp (simulasi) · draf mesej"), tanpa logo atau jenama pihak ketiga. Ringkasan dibina dengan fungsi yang sama seperti `buildWhatsappSummary` dalam sumber e-ACD.
9. **Dialihkan ke demonstrasi tambahan** (arahan 3): tutorial ikon skrin utama, pertukaran enam tab, animasi Apps Script/Google Sheets dan eksport CSV. Semuanya ada dalam filem 90 saat `e-ACD-Denggi-Pitch.mp4` yang dihantar sebelum ini.

## 4. Data sintetik

- **Sasaran dan liputan:** 110 premis sasaran, 92 dilawati, 12 berkunci/kosong, 6 belum dilawati. Liputan ACD = ROUND(92 / 110 × 100) = ROUND(83.64) = **84%**. Rumus dan cara pembundaran sama seperti `computeTotals`/`calcTeamPct` dalam sumber e-ACD.
- **Pasukan 1–6** (dilawati/sasaran): 17/20, 15/18, 16/19, 14/17, 15/18, 15/18. Lain-lain: 337 penduduk diperiksa, 3 bergejala, 3 rujukan, 0 sampel.
- **Rekod yang diikuti:** menyertai Pasukan 1 dan menaikkan pasukan itu daripada 16/19 kepada 17/20 (sumber: lokaliti +1, dilawati +1). Sebelum simpanan, papan pemuka telefon menunjukkan 91/109 = 83%.
- **Tingkah laku borang ikut sumber:**
  - Status *1 - Dilawati* menetapkan penghuni = 1, menanda risalah dan menetapkan tindakan *Pendidikan Kesihatan*.
  - *Ada Kes* menetapkan 1 bergejala, 1 rujukan dan *Rujuk Klinik Kesihatan*.
  - Selepas simpan, alamat, gejala, takungan dan Abate dikosongkan. Toast: *"Rekod rumah disimpan & ditambah ke Pasukan 1"*.
- **Kad NADI:**
  - Kg. Ketoyong, WT, 3 kes wabak, 4 kes kumulatif, notifikasi 02-11-2026 (ME 44), TJT 16-11-2026.
  - 64 premis diperiksa (Kawalan Kesihatan Awam).
  - Premis susulan: Premis Contoh 018, 033, 061, 074, 096 dan 105.

## 5. Privasi dan keselamatan

- Semua rekod adalah rekaan. Pegawai = *"Pegawai Contoh"* (PPKP). Medan nama ketua rumah, telefon dan catatan pesakit dibiarkan kosong.
- **Kg. Ketoyong tiada dalam data repositori NADI.** Data dalam `src/data` repositori itu ialah data kes sebenar dan tidak digunakan. Semakan silang: 730 rentetan daripada fail data NADI dibandingkan dengan `video-showcase.html`. Hanya 11 label UI generik sepadan (contohnya *Wabak Tamat*, *Klinik Kesihatan*, nama gejala), tiada nama tempat atau orang.
- Fail binaan **ditolak secara automatik** jika mengandungi:
  - URL langsung atau URL Apps Script/Google Maps;
  - ID hamparan;
  - koordinat lokasi sumber e-ACD;
  - nama petugas sebenar daripada sumber e-ACD.
  Lampiran asal tidak diubah.
- Peta, roster, penyegerakan Sheet dan tampalan WhatsApp disimulasikan secara setempat. **Sifar panggilan** ke aplikasi langsung, hamparan, peta atau perkhidmatan mesej:
  - semakan A1: 0 permintaan rangkaian dalam pemain;
  - eksport MP4: 0 permintaan disekat.

## 6. Narasi: rakaman dan penyegerakan

`NADI-Muallim-120s.mp4` belum mengandungi suara narator kerana belum ada rakaman. Sari kata memaparkan teks narasi pada masa yang dirancang.

1. Rakam 7 fail mengikut `skrip-narasi-bm.md`: `narasi/babak-1.wav` … `narasi/babak-7.wav`. Baca ayat babak berturut-turut dengan jeda biasa; tidak perlu mengikut masa filem.
2. Jalankan penyegerak:

```bash
node tools/sync-narration.js
```

   Alat ini mengesan pertuturan berdasarkan tenaga isyarat dan memotong setiap rakaman pada jeda kepada ayat dan frasa sari kata. Setiap **ayat** diletakkan pada masa yang diperlukan visual: dirancang, atau sehingga 1.0 s awal / 0.5 s lewat jika rakaman lebih panjang. Ia menulis `narasi/narasi-penuh.wav` (120.000 s) dan `src/narration-timing.json` (masa setiap kiu daripada rakaman). Jika satu ayat tidak muat, alat itu berhenti dan menamakan ayat tersebut.

3. Bina semula pemain dan dokumen, kemudian eksport dengan narasi:

```bash
node tools/build-player.js && node tools/make-docs.js
```

```bash
node render-video.js --voiceover narasi/narasi-penuh.wav
```

   Narasi dinormalkan ke −16 LUFS (dua laluan, linear) dan muzik direndahkan ≈11 dB ketika narator bercakap (`sidechaincompress`).

4. Untuk kembali ke masa dirancang:

```bash
node tools/sync-narration.js --clear
```

**Ujian alat** dijalankan dengan `node tools/sync-narration.js --selftest`, menggunakan rakaman sintetik yang semua sempadannya diketahui. Hasil:
- lulus pada rentak 0.92×, 1.00× dan 1.03× rancangan;
- ralat sempadan maksimum 35 ms.

Pada 1.04× dan lebih perlahan, babak 6–7 tidak muat. Ini sifat teks dalam pelan, bukan ralat alat.

**Ujian hujung ke hujung** dijalankan dalam salinan projek dengan rakaman sintetik daripada `--demo-takes`:
- semua 27 kiu diletakkan dalam had;
- pemain dibina dengan masa rakaman;
- dokumen dijana semula dengan "masa rakaman";
- klip 10 s dieksport dengan narasi (−15.2 LUFS dinormalkan ke −16 LUFS); ffprobe OK.

## 7. Eksport MP4

```bash
npm install
```

```bash
node render-video.js
```

Pilihan:
- `--out <fail>`, `--voiceover <fail>`, `--workers <n>` (lalai 4);
- `--start/--end <bingkai>` untuk klip ujian;
- `--crf 17`, `--preset medium`, `--fast` (bingkai JPEG);
- `--probe <fail.mp4>` (semak MP4 sahaja), `--audio-only <fail.wav>`.

Panjang filem dibaca daripada `src/data.js`. Eksport dihentikan jika pemain tidak sepadan.

**Hasil semakan `NADI-Muallim-120s.mp4`:**

| Perkara | Hasil |
|---|---|
| Fail | 37.3 MB. Eksport mengambil 13 min 10 s dengan 4 pekerja. Pemain membuat 0 permintaan rangkaian. |
| Video | H.264 High, 1920×1080, yuv420p, BT.709, 60/1 fps |
| Bingkai | **7,200** bingkai dinyahkod (`ffprobe -count_frames`); tempoh video **120.000 s** |
| Audio | AAC 48 kHz stereo, 120.000 s (5,760,000 sampel). Muzik dan kesan bunyi sahaja, tanpa narasi. |
| Kelantangan | −19.5 LUFS bersepadu, LRA 2.9 LU, puncak −2.5 dBFS (ebur128) |
| Sepadan dengan pemain | PSNR 37.7–41.6 dB pada 10 bingkai, MP4 berbanding `renderFrame()` (perbezaan mampatan CRF 17 sahaja) |
| Penyegerakan A/V | Ofset 0 sampel pada 00:05, 01:00 dan 01:50 (korelasi silang dengan campuran pemain) |
| Masa sari kata | Masa kiu dalam SRT, `skrip-narasi-bm.md` dan pemain sama (27 kiu). Sari kata dalam MP4 dilukis daripada jadual kiu yang sama. |

## 8. Semakan automatik

Untuk menjalankan semakan:

```bash
node tools/check-player.js
```

Hasil terakhir: **49/49 lulus**. Ringkasan:
- **A:** luar talian, tiada URL/ID/koordinat, 7,200 bingkai, sempadan babak.
- **B:** jumlah, 84%, 6 premis, liputan pasukan, kesan simpanan, papan pemuka, jadual, kad NADI, ringkasan WhatsApp.
- **C:** Data Simulasi pada 13 titik masa; Prototaip Integrasi hanya bersama ringkasan e-ACD di NADI; sari kata ≤ 2 baris, berada dalam babaknya dan sepadan dengan narasi; label *"Sasaran dalam aplikasi"*.
- **H:** semua tahanan dalam §2, kamera diam, kad rekod terisi satu medan pada satu masa.
- **D:** bingkai yang sama apabila dicari semula; keadaan DOM main = keadaan DOM cari.
- **E:** audio 120.000 s, 48 kHz, puncak −2.5 dBFS.
- **F:** main, jeda, lompat babak, peleret, sari kata, bisu, kekunci 1–7, mula semula, auto-sembunyi, mod bersih, langkah bingkai, paparan 02:00.00.
- **G:** 27 kiu / 7 babak; tiada ralat halaman.

**Main balik penuh tanpa jeda (automatik):** filem dimainkan 120 s dalam Chromium dalam mod pratonton, dengan keputusan berikut:
- tiada ralat;
- main balik sampai bingkai 7199 dan berhenti di situ;
- tiada lompatan ke belakang;
- jam audio memacu main balik sepanjang masa.

Semakan ini bukan pengganti ujian penonton (§10).

## 9. Manfaat dan dakwaan

Filem menggunakan frasa **"Jimat masa menyediakan laporan"** sebagai manfaat aliran kerja. Manfaat ini ditunjukkan melalui urutan yang boleh dilihat: borang dan kiraan manual, kemudian satu rekod di telefon, kiraan automatik dan ringkasan yang terhasil daripada rekod yang sama.

**Tiada angka minit, peratus penjimatan, kos, kadar ralat atau dakwaan "menggantikan kertas sepenuhnya".** Angka sedemikian memerlukan ukuran daripada operasi rintis yang boleh disemak. Contohnya masa daripada lawatan terakhir hingga laporan dihantar, bagi beberapa operasi dengan kaedah kertas dan e-ACD. Angka itu boleh ditambah selepas ukuran tersebut tersedia.

## 10. Ujian penonton (langkah 6 pelan): belum dijalankan

Saya tidak menjalankan ujian dengan penonton sebenar. Cadangan: tunjuk filem sekali tanpa jeda kepada 3–5 orang yang tidak terlibat dalam pembangunan. Kemudian tanya:

1. Apakah yang dimasukkan petugas pada telefon? (Jawapan dijangka: Pasukan 1, Premis Contoh 012, dilawati, 5 penghuni, 1 bergejala + rujukan, takungan Aedes/Abate/risalah, tindakan.)
2. Berapakah liputan ACD? (92 daripada 110 premis, 84%; data simulasi.)
3. Apakah tindakan penyelia? (Merancang lawatan susulan untuk 6 premis yang belum dilawati.)

Jika lebih daripada seorang gagal menjawab satu soalan, panjangkan tahanan berkaitan dalam `src/engine.js` (objek `T`).

## 11. Nota repositori dan sumber

- **NADI (`DrPHIsmail/Vector_Live_dashboard`, komit `f812dfb`):**
  - Rujukan susun atur, warna dan label `OutbreakMap.tsx` (kad lokaliti, petunjuk GIS, warna penanda dan zon 200 m) dan `Header.tsx`.
  - Fon: Plus Jakarta Sans dan JetBrains Mono (OFL).
  - Tiada kod atau data disalin.
  - Repositori itu tidak mempunyai fail lesen. Jika filem digunakan di luar PKD, dapatkan kebenaran pemilik repositori.
- **e-ACD:**
  - Label borang, aliran borang, Bahagian D, teks toast, rumus pengiraan dan Jata Negara diambil daripada lampiran HTML e-ACD.
  - Lampiran tidak diubah.
- **Demonstrasi tambahan:** filem 90 saat `e-ACD-Denggi-Pitch.mp4`, yang memaparkan tutorial ikon, enam tab, Google Sheets/Apps Script dan CSV.
- **Fon terbenam:** Inter, Plus Jakarta Sans dan JetBrains Mono (subset Latin) di bawah SIL Open Font License 1.1. Notis lesen ada dalam `assets/FONTS-OFL.txt`.

## 12. Struktur sumber

| Fail | Isi |
|---|---|
| `src/data.js` | Babak, data sintetik, kiu narasi/sari kata, rumus. Satu sumber kebenaran. |
| `src/markup.js` | DOM statik: tetingkap NADI, telefon, desktop, komposisi manual, tindanan. |
| `src/engine.js` | Garis masa deterministik `renderFrame(i)` (t = i/60), kamera bagi setiap lapisan, peristiwa bernama `T`. |
| `src/audio.js` | Skor asal dan kesan bunyi disintesis daripada peristiwa yang sama. |
| `src/player.js` | Pemain (kawalan, audio Web Audio, suara ms-MY pilihan). |
| `tools/build-player.js` | Tailwind 3.4.17 luar talian, fon dan Jata sebaris, masa narasi, pengawal privasi. |
