# NADI Muallim — Filem Pertandingan · V7 (137 saat, muzik latar)

Filem 02:17.000 (1920 × 1080, 60 fps, 8,220 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V7 ialah V6 dengan tiga perubahan yang diminta:
- tahanan liputan pada 1:13–1:17 (V6) kini bergerak;
- babak pengisian manual diperlahankan kepada ≈ 10 s (6.5–16.35 s);
- susun atur nod "12 berkunci / kosong" dibetulkan.

Setup V6 yang lain dikekalkan. Semua rekod, nama dan angka ialah **data simulasi**. Tiada panggilan ke aplikasi langsung, Google Sheets, peta atau WhatsApp.

## Fail V7 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-137s-v7.mp4` | Filem akhir V7: H.264 High 1920 × 1080, CFR 60 fps, 8,220 bingkai, 137.000 s; AAC 48 kHz stereo; muzik latar dan kesan bunyi, tanpa narasi. Saiz 56.0 MB. |
| `video-showcase-v7.html` | Pemain HTML kendiri, luar talian (WebGL untuk glob). Kekunci 1–9 dan 0 untuk 10 babak. |
| `sari-kata-bm-v7.srt` | 21 baris: 18 teks kit + 3 sari kata WhatsApp, pada jam filem V7. |

**Disimpan untuk perbandingan (tidak diubah):**
- **V6:** `NADI-Muallim-Pitch-134s-v6.mp4`, `video-showcase-v6.html`, `sari-kata-bm-v6.srt`.
- **V5–V2:** fail masing-masing, seperti dalam dokumentasi di bawah.
- **Sumber:** `arkib/v6-sumber.tar.gz` (V6) dan `arkib/v7-sumber.tar.gz` (V7).

**Masa V6 → V7.** Semua masa selepas babak manual beranjak **+3.0 s**.

| Bahagian | V6 | V7 |
|---|---|---|
| Babak manual | 6.5–13.35 s | 6.5–16.35 s |
| Hentakan tajuk NADI | 13.35 s | 16.35 s |
| Telefon muncul | 24.30 s | 27.30 s |
| Tahanan liputan | 1:11–1:18 | 1:14–1:21 |
| WhatsApp | 1:24.95–1:38.95 | 1:27.95–1:41.95 |
| Penutup | 2:06.35 | 2:09.35 |

## Perubahan V7 berbanding V6

### 1. Tahanan liputan kini bergerak (V7 1:14–1:21)

- **Punca.** Dari 71.6 s hingga 77.5 s (masa cerita), kamera sengaja kekal pegun. Peraturan "close-up pegun untuk dibaca" diguna sejak V3. Yang berubah hanya sari kata, jadi ia kelihatan seperti dijeda.
- **Sekarang:**
  - **Kamera menolak perlahan** sebanyak 6% ke kad liputan sepanjang tahanan, dan monitor di belakang hanyut sedikit (paralaks). Tiada bingkai pegun.
  - **Panel baharu "Liputan setiap pasukan".** Garis putus-putus sasaran KKM 80% dilukis, kemudian enam bar P1–P6 naik satu demi satu: 85 / 83 / 84 / 82 / 83 / 83%, semuanya di atas garis.
    - Angka daripada rekod simulasi yang sama (`calcTeamPct`).
    - Paksi penuh 0–100% (tidak dipotong), jadi perbezaan kecil tidak dibesar-besarkan.
  - **Cahaya** menyapu pil "Capai Sasaran" pada penghujung tahanan.
- Angka "84%", "92 daripada 110 premis dilawati" dan "Capai Sasaran" kekal di skrin selama V6.

### 2. Babak pengisian manual diperlahankan (6.5–16.35 s)

- Babak ini (cerita 6.5–13.35 s) kini dimainkan **1.44× lebih perlahan**, kira-kira 10 s:

| Langkah | V6 | V7 |
|---|---|---|
| Tulisan tangan pada Borang ACD + Lampiran 1 | 2.05 s | 2.95 s |
| Kiraan tally | 1.25 s | 1.80 s |
| Sari kata c02 | 2.6 s | 3.7 s |
| Sari kata c03 | 2.9 s | 4.2 s |

- Pembukaan glob sebelum 6.5 s tidak berubah.
- **Muzik.** Degupan jantung, detik dan dron kini membina ketegangan sehingga hentakan tajuk pada 16.35 s. Kord tajuk tetap jatuh tepat pada hentakan.
- **Selepas babak ini**, semua bahagian beranjak +3.0 s tanpa perubahan rentak.

### 3. Susun atur nod "12 berkunci / kosong"

- **Punca.** Kotak 100 px; label dua baris "berkunci / kosong" (48 + 6 + 2 × 22 px) melebihi ruang dalam. Nombor terhimpit ke atas dan "kosong" terkeluar di bawah.
- **Sekarang:**
  - Nod baris kedua 120 px, dengan nombor sebaris dari atas (92 · 12 · 6).
  - Nod tindakan "Semak semula status" dan "Rancang lawatan susulan" turut dilegakan (fon 17 px), kerana sebelum ini juga sesak.
  - Garisan penyambung dan baris tindakan dianjak 20 px.

### 4. Dikekalkan seperti V6

Glob peta dan radius 200 m, sisipan WhatsApp, peralihan 1:01–1:03 yang licin (kini 1:04–1:06), dan semua bahagian lain.

## Keputusan semakan V7

`node tools/check-player.js` menjalankan 72 semakan dan **72/72 lulus** pada pemain akhir. Semua semakan V3–V6 dikekalkan pada jam filem V7. Semakan baharu atau yang dikemas kini:

| Semakan | Bukti |
|---|---|
| P1 babak manual | Filem 6.5 s → hentakan tajuk 16.35 s (bunyi hentakan tepat 16.35 s). Tulisan tangan 2.95 s, tally 1.80 s, c02 3.74 s, c03 4.22 s. Pembukaan sebelum 6.5 s tidak berubah. |
| K1 tahanan liputan | Setiap 0.25 s berbeza daripada sebelumnya (tiada regangan pegun). Enam bar 85/83/84/82/83/83% setinggi 84 px × peratus (paksi penuh), dan garis 80% dilukis. |
| V8 (dikemas kini) | "84%", "92 daripada 110…" dan "Capai Sasaran" kekal pada 70.9–77.6 s (cerita) sementara kamera bergerak. Larian pegun terpanjang 0.000 s. |
| L1 susun atur | Nombor dan label setiap nod susulan (92 · 12 · 6 · Semak semula · Rancang) berada dalam kotak. |
| D1 / D2 | 16/16 dan 10/10 sama, termasuk bingkai babak manual, tahanan, sisipan dan penutup. |

**Pengesahan MP4** (`NADI-Muallim-Pitch-137s-v7.mp4`):
- **ffprobe:** H.264 High 1920 × 1080 yuv420p bt709, 60/1, 8,220 bingkai, 137.000 s; AAC 48 kHz 2 saluran, 137.000 s.
- **Kenyaringan:** −16.0 LUFS, LRA 3.3 LU, puncak sebenar −1.1 dBFS (masih ≤ −1 dBTP).
- **Ketiadaan narasi:** max |r| = 0.014 (had 0.15). Rangkaian: 0 permintaan.
- **Analisis bingkai MP4:**
  - Tiada bingkai tersekat.
  - Tahanan liputan (73.8–81.05 s): larian pegun terpanjang hanya 2 bingkai (V6: ≈ 6 s).
  - Lonjakan yang tinggal sama seperti V6 (perubahan butang serta-merta dan potongan keras yang disengajakan), beranjak +3 s.

## Bina, semak dan render (V7)

```bash
TAILWIND_BIN=/path/to/tailwindcss node tools/build-player.js   # → video-showcase-v7.html (enggan menulis atas v2–v6)
node tools/make-docs.js                                         # → sari-kata-bm-v7.srt
node tools/check-player.js                                      # semakan automatik
node render-video.js                                            # → NADI-Muallim-Pitch-137s-v7.mp4 (+ ffprobe, semakan ketiadaan narasi)
```

## Dokumentasi V6 (134 s, disimpan untuk perbandingan)

Filem 02:14.000 (1920 × 1080, 60 fps, 8,040 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V6 ialah V5 dengan tiga permintaan:
- latar peta glob dengan radius ACD 200 m pada pembukaan;
- segmen salin–tampal ringkasan ACD ke WhatsApp, 14 s, menjadikan filem 134 s;
- pembaikan peralihan 1:01–1:03.

Setup V5 yang lain dikekalkan. Semua rekod, nama dan angka ialah **data simulasi**. Tiada panggilan ke aplikasi langsung, Google Sheets, peta atau WhatsApp.

### Fail V6 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-134s-v6.mp4` | Filem akhir V6: H.264 High 1920 × 1080, CFR 60 fps, 8,040 bingkai, 134.000 s; AAC 48 kHz stereo; muzik latar dan kesan bunyi, tanpa narasi. Saiz 52.1 MB. |
| `video-showcase-v6.html` | Pemain HTML kendiri, luar talian (WebGL untuk glob; jika tiada WebGL, peta rata dipaparkan). Kekunci 1–9 dan 0 untuk 10 babak. |
| `sari-kata-bm-v6.srt` | 21 baris: 18 teks kit (dianjak +14 s selepas 84.95 s) + 3 sari kata WhatsApp. |

Nama fail kini **134s** kerana filem bukan lagi 120 saat.

**Disimpan untuk perbandingan (tidak diubah):**
- **V5:** `NADI-Muallim-Pitch-120s-v5.mp4`, `video-showcase-v5.html`, `sari-kata-bm-v5.srt`.
- **V4, V3, V2:** fail masing-masing, seperti dalam dokumentasi di bawah.
- **Sumber:** `arkib/v2-…`, `v3-…`, `v4-…`, `v5-sumber.tar.gz`, dan `arkib/v6-sumber.tar.gz`.

### Perubahan V6 berbanding V5

#### 1. Pembukaan: peta satelit sebagai glob, dengan radius ACD 200 m (0–6.6 s)

- **Imej.** Tangkapan skrin Google Maps tanpa label (imej ketiga yang diberi).
  - Hanya UI Google Maps dibuang: butang Layers, zum, lokasi, logo, bar atribusi dan skala. Imejan satelit tidak diubah.
  - Garisan gelap di lorong belakang kampung dikekalkan. Ia longkang dalam imejan, bukan lukisan: nilai pikselnya 40–60 dan ia mengikut lorong.
- **Jalur utara.** Tepi atas imej memotong bulatan 200 m kira-kira 46 px.
  - Jalur ≈ 145 px di utara disambung daripada imejan Google yang sama dalam peta GIS PKD.
  - Padanan automatik (korelasi fasa): skala 0.5234, anjakan (137.6, −145.7). Warna dipadankan pada kawasan bertindih.
  - **Sebelum digunakan**, semua penanda dibuang daripada jalur itu: pin kes, label nombor rumah, garisan dan label jarak antara kes, bulatan wabak asal, label tempat dan UI GIS.
- **Glob.**
  - Dilukis dengan WebGL secara deterministik: setiap bingkai fungsi masa, dan tangkapan yang sama dalam apa jua urutan.
  - Ada grid latitud/longitud dan cahaya atmosfera teal, serta berputar perlahan (zon bergerak dari kiri ke kanan).
  - Glob naik masuk pada 0–1.5 s.
- **Radius 200 m.**
  - 212 px pada skala peta (bar skala imej: 100 m = 106 px).
  - Pusatnya ialah pusat bulatan wabak peta GIS, didaftar ke imej ini, iaitu titik tengah antara kes dan bukan rumah kes. Bulatan GIS asal = 209.9 px ≈ 198 m, sepadan.
  - Garisan putus-putus ambar dari 0.9 s. Dilukis penuh merah jambu bersama riak semasa **Isytihar wabak** (3.7–4.6 s), dengan label "Kg. Ketoyong · radius 200 m".
- **Tiada pin rumah kes**, sama ada sebenar atau fiktif.
- **Kredit pada skrin:** "Imejan ©2026 Airbus, CNES / Airbus, Maxar Technologies · Data peta ©2026 Google".

#### 2. Segmen baharu: salin–tampal ringkasan ACD ke WhatsApp (84.95–98.95 s, babak 7 "Kongsi")

- **Garis masa.**
  - Cerita V5 ditahan pada 84.95 s, tepat selepas kad "Ringkasan sedia dikongsi".
  - Semua babak selepasnya beranjak +14 s. Rentak dan masa animasi asal tidak diubah.
- **Telefon.** Satu telefon rata 2D (tanpa sudut 3D). Urutan, dalam saat dari mula segmen:

| Saat | Tindakan |
|---|---|
| 0.9 | Ketik butang sebenar aplikasi **"Salin Laporan (WhatsApp)"** |
| 1.05–2.45 | Toast sumber "Ringkasan laporan disalin! Sedia ditampal ke WhatsApp." |
| 2.15–2.75 | Tukar ke WhatsApp |
| 3.1–3.95 | Tekan lama medan mesej, menu **"Tampal"** |
| 4.05 | Teks ditampal (dengan asterisk seperti WhatsApp sebenar) |
| 4.95 | Hantar |
| 5.8–7.1 | Zum 2D pada mesej |
| 7.5–11.2 | Kamera membaca ke bawah |
| 8.1–11.0 | "Pencapaian ACD (%): 84%" disorot |
| 10.6 | Tanda biru (dibaca) |
| 11.2 | Reaksi 👍 3 |
| 12.3–13.5 | Zum keluar |

- **Kandungan mesej.**
  - Format sebenar aplikasi (`buildWhatsappSummary`) dengan angka simulasi filem: lokaliti 110, dilawati 92, berkunci 12, diperiksa 337, bergejala 3, rujukan 3, sampel 0, **84%**, takungan 14, Abate 13, risalah 92.
  - Angka sebenar dalam tangkapan skrin WhatsApp tidak digunakan.
- **Orang dan kumpulan.**
  - Kumpulan "Pasukan Vektor PKD Muallim" dengan ahli peranan sahaja ("Pegawai Epid, PKP, PPKP, Pasukan 1–6").
  - Permintaan daripada "Pegawai Epid".
  - Tiada nama sebenar, nama kumpulan sebenar atau logo WhatsApp. Emoji dilukis sebagai ikon SVG supaya paparan sama di semua peranti.
- **Label.**
  - "Kongsi laporan · WhatsApp (simulasi)" + DATA SIMULASI.
  - Nota kad ringkasan sebelum segmen kini "Sedia disalin ke WhatsApp pasukan (simulasi)".
- **Sari kata baharu.** Fungsi sahaja, tiada dakwaan penjimatan.
  - **w1** (85.55–88.15 s): "Ringkasan laporan disalin dengan satu ketikan."
  - **w2** (89.0–91.9 s): "Ringkasan ditampal ke kumpulan WhatsApp pasukan."
  - **w3** (93.0–96.6 s): "Angka dalam mesej datang terus daripada rekod yang disimpan."
- **Muzik.**
  - Progresi D6/9 → A → G9 → A, 3.5 s setiap satu, kemudian Bm11 menyambung babak susulan seperti V5.
  - Denyut, hi-hat dan arpeggio diteruskan tanpa putus.
  - Kesan bunyi untuk ketik, salin, tampal, hantar, zum dan tanda dibaca.

#### 3. Peralihan 1:01–1:03 dan kelicinan gerakan

Punca yang ditemui, diukur bingkai demi bingkai:
1. **Lompatan kamera satu bingkai** pada 62.017 s (bingkai 3721): zum 1.0 → 1.12 sekali gus. Beza bingkai 13.18 berbanding jiran 0.07.
2. **Skrin telefon bertukar** borang → papan pemuka dalam satu bingkai pada 62.2 s.
3. **Gerakan laju–perlahan–laju.** Monitor naik dengan pegas (puncak 62.4 s), kemudian zum kamera memecut semula (63.2 s).

Pembaikan:
- Kamera kekal pegun. Telefon dan monitor bergerak bersama dengan satu lengkung lembut (62.0–64.5 s).
- Tab "Papan Pemuka" diketik (60.95 s), kemudian skrin meluncur (61.1–61.5 s) sebelum peralihan bermula.

Hasil: tiada lonjakan; beza bingkai maksimum 5.7 dalam satu lengkung licin.

Pembaikan tambahan: semua skala transform sebelum ini dibundarkan kepada 0.001. Akibatnya zum perlahan bergerak dalam lompatan 1–2 px, contohnya zum keluar pembukaan dan tolakan kamera NADI. Ketepatan kini 0.00001.

#### 4. Dikekalkan seperti V5

Borang manual, isian rekod, penyelarasan Sheets, kiraan naik, sasaran KKM, aliran susulan, kad manfaat, penutup, dan muzik latar tanpa narasi.

### Keputusan semakan V6

`node tools/check-player.js` menjalankan 69 semakan dan **69/69 lulus**. Semua semakan V3–V5 dikekalkan; masa cerita dipetakan ke masa filem melalui `filmTime()`. Semakan baharu:

| Semakan | Bukti |
|---|---|
| G1 glob | WebGL berfungsi secara deterministik; kredit imejan kelihatan. |
| G2 radius 200 m | 212 px = 200 m pada skala peta. Putus-putus pada 1.5 s; piksel merah jambu pada cincin selepas "Isytihar wabak"; label "radius 200 m". |
| W1 salin–tampal | Butang "Salin Laporan (WhatsApp)", toast, menu "Tampal", teks ditampal dan butang hantar, mengikut urutan. |
| W2 mesej | Semua baris dengan angka simulasi (110 / 92 / 12 / 337 / 3 / 84%). Angka sebenar tangkapan skrin tiada. Ada sorotan 84%, tanda dibaca dan reaksi. |
| W3 privasi | Kumpulan dan ahli peranan sahaja; label "WhatsApp (simulasi)" + DATA SIMULASI. Nama dalam tangkapan skrin tiada dalam fail HTML. |
| W4 cerita ditahan | Keadaan cerita sama pada 85.2 s dan 98.3 s. Telefon kelihatan sebelum segmen, NADI selepasnya. |
| J1 1:01–1:03 | Gerakan telefon maksimum 1.78 px/bingkai (V5: lompatan ≈ 150 px pada bingkai 3721). Tab diketik, kemudian skrin meluncur. |
| D1 / D2 | 14/14 dan 8/8 sama, termasuk bingkai glob dan sisipan. |

**Pengesahan MP4** (`NADI-Muallim-Pitch-134s-v6.mp4`):
- **ffprobe:** H.264 High 1920 × 1080 yuv420p bt709, 60/1, 8,040 bingkai, 134.000 s; AAC 48 kHz 2 saluran, 134.000 s.
- **Kenyaringan** (ffmpeg ebur128): −16.0 LUFS bersepadu, LRA 3.2 LU, puncak sebenar −1.4 dBFS.
- **Ketiadaan narasi:** max |r| = 0.010 merentas 18 tetingkap kiu (had 0.15). Rangkaian: 0 permintaan.
- **Analisis bingkai demi bingkai pada MP4:**
  - Tiada bingkai tersekat.
  - Tetingkap 1:00–1:05 tanpa lonjakan (beza maksimum 4.65, satu lengkung licin).
  - Lonjakan yang tinggal ialah peristiwa yang disengajakan (hentakan tajuk 13.35 s, potongan keras ke Bahagian D 78.05 s) dan perubahan butang serta-merta semasa ketikan.

### Privasi

- **Peta.** Hanya imejan satelit dan bulatan kawasan 200 m. Tiada pin, label atau garisan rumah kes. Pautan Google Sites MOH yang diberi tidak dibuka, dan tiada URL dalam mana-mana fail.
- **WhatsApp.**
  - Tiada nama sebenar, nama kumpulan sebenar atau nombor telefon.
  - Semua antara muka ialah markup tempatan; tiada mesej dihantar.
  - Semakan W3 mengesahkan nama-nama dalam tangkapan skrin tiada dalam fail HTML.
- **Imej sumber.** Tangkapan skrin yang diberi tidak disalin ke dalam projek. Hanya tekstur yang telah dibersihkan, `assets/peta-glob.jpg`, disimpan.
- **Pengawal binaan dan semakan (A2, W3).** ID spreadsheet sebenar, koordinat peta sumber, nama kakitangan sebenar aplikasi sumber dan nama dalam tangkapan skrin WhatsApp kini disimpan sebagai cincang SHA-256 sahaja, bukan teks biasa. Diuji: pengesan menangkap 22/22 sampel, dan output V6 kekal sama bait demi bait.
  - Arkib lama `arkib/v2…v5-sumber.tar.gz` masih mengandungi senarai pengawal versi lama dalam teks biasa. Ia tidak diubah kerana disimpan untuk perbandingan, jadi **jangan kongsi folder `arkib/` di luar pasukan**.

### Perkara untuk perhatian (V6)

- **Hak imej peta.** Imejan Google (Airbus/CNES/Maxar) dengan atribusi dikekalkan pada skrin. Penggunaan awam, contohnya dimuat naik untuk pertandingan, tertakluk kepada syarat Google Maps/Earth. **Ini perlu disahkan.**
- **Pusat bulatan 200 m** diambil daripada pusat bulatan wabak peta GIS. Untuk privasi, pusat tidak diletakkan pada mana-mana rumah kes.
- **Sari kata c10** "Ini menjimatkan masa menyediakan ringkasan" (daripada kit asal) ialah dakwaan penjimatan masa tanpa ukuran dalam filem. Ia dikekalkan kerana tidak diminta diubah; pertimbangkan untuk menyemaknya.
- **WebGL.** Pemain memerlukan WebGL untuk glob. Tanpa WebGL, peta rata ditunjukkan. MP4 sentiasa menggunakan glob.

### Bina, semak dan render (V6)

```bash
TAILWIND_BIN=/path/to/tailwindcss node tools/build-player.js   # → video-showcase-v6.html (enggan menulis atas v2–v5)
node tools/make-docs.js                                         # → sari-kata-bm-v6.srt
node tools/check-player.js                                      # semakan automatik
node render-video.js                                            # → NADI-Muallim-Pitch-134s-v6.mp4 (+ ffprobe, semakan ketiadaan narasi)
```

Tekstur glob dijana semula daripada dua tangkapan skrin (tidak disertakan dalam projek):

```bash
python3 -I tools/make-map-globe.py <google-maps-tanpa-label.webp> <peta-gis.webp> assets/peta-glob.jpg <folder-semakan>
```

## Dokumentasi V5 (muzik latar, 120 s, disimpan untuk perbandingan)

Filem 02:00.000 (1920 × 1080, 60 fps, 7,200 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V5 ialah V4 dengan empat perubahan yang diminta. Semua rekod, nama, angka dan lokasi ialah **data simulasi**. Paparan e-ACD di dalam NADI dilabel **Prototaip Integrasi**. Tiada panggilan ke aplikasi langsung, Google Sheets, peta atau perkhidmatan pesanan.

### Fail V5 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-120s-v5.mp4` | Filem akhir V5: H.264 High 1920 × 1080, CFR 60 fps, 7,200 bingkai, 120.000 s; AAC 48 kHz stereo; muzik latar dan kesan bunyi, tanpa narasi. |
| `video-showcase-v5.html` | Pemain HTML kendiri, luar talian, dengan runut bunyi yang sama. |
| `sari-kata-bm-v5.srt` | 18 baris teks pada skrin V5 (teks kit; masa dilaraskan untuk V5). |

**Disimpan untuk perbandingan (tidak diubah):**
- **V4:** `NADI-Muallim-Pitch-120s-v4.mp4`, `video-showcase-v4.html`.
- **V3 bernarasi:** `NADI-Muallim-Pitch-120s-v3.mp4`, `video-showcase-v3.html`, `sari-kata-bm-v3.srt`.
- **V2:** `NADI-Muallim-120s.mp4`, `video-showcase.html`.
- **Sumber:** `arkib/v2-sumber.tar.gz`, `arkib/v3-sumber.tar.gz`, `arkib/v4-sumber.tar.gz`.

### Perubahan V5 berbanding V4

1. **Pembukaan baharu: carta alir beranimasi (0–6.5 s)** menggantikan soalan penyelia. Empat langkah muncul satu demi satu, dihubungkan dengan anak panah:
   - **Notifikasi diterima** (0.5 s): loceng berbunyi, lencana "1", "1 notifikasi baharu".
   - **Peningkatan kes** (1.9 s): bar kes meningkat.
   - **Isytihar wabak** (3.35 s): cop "WABAK".
   - **Pengesanan Kes Aktif (ACD)** (4.8 s): rumah ditanda ✓ satu demi satu.

   Kamera kemudian bergerak ke langkah ACD dan beralih kepada borang manual (6.5 s).
2. **Rentak isian rekod di telefon diperlahankan dan diratakan (33–49 s).** Setiap langkah mendapat masanya sendiri; jurang terpanjang antara dua tindakan ialah 1.7 s, jadi tiada lagi jeda kosong ~7 s selepas gejala. Urutannya:
   - status "1 - Dilawati" (34.3 s);
   - bilangan penghuni dikira 1 → 5, satu ketukan setiap 0.45 s (36.0–37.35 s);
   - Bahagian B: "Ada Kes" (39.3 s), dua gejala (40.0 / 40.7 s), kes bergejala (41.0 s), rujukan (41.9 s);
   - Bahagian C: takungan (44.3 s), Abate (44.9 s), risalah (45.5 s);
   - tindakan lapangan (46.3 s);
   - butang simpan ditonjolkan (47.9 s), kemudian simpan (49.42 s).
3. **Sasaran liputan dilabel sebagai sasaran KKM.**
   - Formula: "ROUND(92 / 110 × 100) = 84% · sasaran KKM: ≥ 80%".
   - Kad NADI: "sasaran KKM ≥ 80%".
   - Lencana e-ACD "Capai Sasaran (≥80%)" kekal seperti dalam aplikasi.
4. **Bahagian premis belum dilawati (85–105 s) kini aliran langkah demi langkah**, tanpa jeda panjang (jurang terpanjang 2.0 s):
   - **Soalan:** "Premis mana yang masih perlu dilawati?" (85.3 s), dipindahkan ke sini daripada pembukaan.
   - **Pecahan:** 110 premis (86.0 s) bercabang kepada 92 dilawati, 12 berkunci/kosong dan 6 belum dilawati (86.85–87.25 s).
   - **Peta:** 6 penanda merah berdenyut (87.6–89.4 s), kemudian 12 penanda ambar (90.5–92.3 s), dengan nod "12" ditonjolkan.
   - **Keputusan penyelia:** kursor mengklik **"Rancang lawatan susulan"** (95.2 s). Nod "Rancang lawatan susulan · 6 premis" muncul dan penanda bertukar menjadi nombor 1–6. Laluan lawatan dilukis (96.0–97.4 s) dan senarai premis dibuka dalam kad NADI.
   - **Semak semula:** nod "Semak semula status · 12 premis" muncul dan penanda ambar mendapat gelang semakan (97.9–98.9 s).
   - **Lawatan susulan:** titik pasukan bergerak di sepanjang laluan (100.6–104.0 s) sambil kamera menolak masuk perlahan.

**Sari kata.** 18 baris teks kit kekal pada skrin. c01 (soalan penyelia) kini menjadi tajuk aliran susulan. c02 (6.6–9.2 s), c14 (86.9–88.9 s), c16 (95.0–97.7 s) dan c17 (97.9–100.6 s) dilaraskan masanya supaya sepadan dengan visual baharu.

### Keputusan semakan V5

`node tools/check-player.js` menjalankan 62 semakan; **62/62 lulus**. Ini termasuk semua pintu V3 dan V4 (pintu telefon 24.30 s, borang ACD, kiraan naik, lencana sasaran, tiada narasi). Semakan baharu:

| Semakan | Bukti |
|---|---|
| O1 carta alir pembukaan | Empat langkah muncul satu demi satu (tersembunyi sebelum masanya, kelihatan 0.4 s selepasnya), ketiga-tiga anak panah dilukis, dan soalan penyelia tiada dalam 0–13.2 s. |
| R1 rentak isian rekod | Jurang terpanjang antara tindakan ialah 1.7 s (had 2.2 s); ketukan penghuni berjarak ≥ 0.45 s. |
| S1 aliran susulan | Jurang terpanjang antara langkah ialah 2.0 s (had 2.5 s). Di peta: 6 merah dan 12 ambar; laluan dilukis; titik pasukan bergerak. |
| C6 label sasaran | "sasaran KKM: ≥ 80%" kelihatan bersama lencana "Capai Sasaran (≥80%)". |
| C8 keputusan penyelia | Klik pada 95.2 s, dalam baris "Penyelia menjadualkan lawatan…" (95.0–97.7 s). |

**Render V5** (`node render-video.js --out NADI-Muallim-Pitch-120s-v5.mp4`, 10 min 6 s):
- **ffprobe:**
  - H.264 High, 1920 × 1080, yuv420p bt709, 60/1, **7,200 bingkai**, video 120.000 s.
  - AAC 48 kHz stereo, 120.000 s; bekas 120.000 s; 45.6 MB.
- **Tiada narasi:** korelasi maksimum dengan `narration-bm.wav` hanya 0.011 dalam 18 tetingkap kiu.
- **Kenyaringan (ebur128):** −16.0 LUFS, LRA 3.2 LU, puncak sebenar −1.4 dBTP.
- **Bingkai MP4 berbanding HTML:** 16 bingkai disemak, iaitu pembukaan (60/234/348), borang (456), taip semula (711), tajuk (801), pintu telefon (1458), isian rekod (2076/2232/2484/2676), liputan (4350) dan aliran susulan (5244/5460/5730/6150). PSNR 35.3–42.3 dB, iaitu beza mampatan H.264 sahaja.
- **Rangkaian:** 0 permintaan rangkaian.

## Dokumentasi V4 (muzik latar, disimpan untuk perbandingan)

Filem 02:00.000 (1920 × 1080, 60 fps, 7,200 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V4 ialah V3 dengan empat perubahan yang diminta:
1. suara narasi dibuang;
2. kiraan naik liputan dipulihkan;
3. animasi "capai sasaran" dipulihkan;
4. borang ACD sebenar digunakan dalam babak manual.

Semua rekod, nama, angka dan lokasi ialah **data simulasi**. Paparan e-ACD di dalam NADI dilabel **Prototaip Integrasi**. Tiada panggilan ke aplikasi langsung, Google Sheets, peta atau perkhidmatan pesanan.

### Fail V4 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-120s-v4.mp4` | Filem akhir V4: H.264 High 1920 × 1080, CFR 60 fps, 7,200 bingkai, 120.000 s; AAC 48 kHz stereo. Hanya muzik latar dan kesan bunyi; tiada narasi. |
| `video-showcase-v4.html` | Pemain HTML kendiri, luar talian, dengan runut bunyi yang sama. |

**Disimpan untuk perbandingan (tidak diubah):**
- **V3 bernarasi:** `NADI-Muallim-Pitch-120s-v3.mp4`, `video-showcase-v3.html`, `sari-kata-bm-v3.srt`, `NADI-Muallim-V3-pratonton-00-30s.mp4`.
- **V2:** `NADI-Muallim-120s.mp4`, `video-showcase.html`.
- **Sumber lama:** `arkib/v2-sumber.tar.gz` dan `arkib/v3-sumber.tar.gz`.

### Perubahan V4 berbanding V3

1. **Suara narasi lelaki (Osman) dibuang.**
   - Runut bunyi kini muzik latar dan kesan bunyi asal: dron, degupan, detik jam, riser, hentakan tajuk, bunyi ketukan dan "whoosh".
   - Tanpa suara, muzik tidak lagi direndahkan; ia sendiri menjadi program pada −16 LUFS.
   - 19 baris sari kata dikekalkan sebagai **teks pada skrin**, supaya cerita masih boleh difahami tanpa suara. Dalam pemain HTML, kekunci S menyembunyikannya; MP4 tetap memaparkannya.
2. **Kiraan naik liputan ACD, seperti v1 (filem e-ACD 90 saat).** Papan pemuka telefon dan monitor bermula daripada sifar:
   - 62.7–63.9 s: premis dalam lokaliti dikira naik hingga 110.
   - 64.7–69.0 s: premis dilawati naik hingga 92, dan liputan 0% → 84%.
   - Carta bar dan donut ikut naik bersama.
3. **Animasi "capai sasaran", seperti v1.**
   - Penanda bertitik "Sasaran 80%" muncul pada bar liputan dari 63.9 s.
   - Lencana dalam aplikasi bertukar daripada "Sedang Berjalan (<80%)" kepada **"Capai Sasaran (≥80%)"** pada saat liputan melepasi 80% (~68.3 s), dengan bunyi kejayaan.
   - Kamera zum ke kad liputan telefon (69.6–70.8 s), seperti v1.
   - Panel besar "84% · 92 daripada 110 premis dilawati" muncul, diikuti pil **"Capai Sasaran"** (71.25 s) dan formula "ROUND(92 / 110 × 100) = 84% · sasaran dalam aplikasi: ≥ 80%" (71.6 s). Semuanya ditahan hingga 77.6 s.
4. **Borang manual yang betul.**
   - "Borang Pengesanan Kes Aktif (ACD) Denggi" PKD Muallim (Bahagian A–D) dan **Lampiran 1** (7 lajur, baris 1–7) dibina semula mengikut PDF kit.
   - Kedua-duanya diisi dengan tulisan tangan pada 4.7–7.1 s, dengan kamera menolak masuk supaya boleh dibaca.
   - **Isian (fiksyen):**
     - Bahagian A: tarikh 04/11/2026, masa 9.00 pagi, Kg. Ketoyong, Petugas 1–3.
     - Bahagian C: tanda ✓ pada ketiga-tiga soalan.
     - Lampiran 1: Premis Contoh 001–007, kod status (1/2/3), bilangan penghuni, tindakan lapangan (Pend. Kesihatan / Rujuk Klinik / Notis).
   - **Privasi:** lajur nama dan nombor telefon ditulis sebagai contengan yang tidak boleh dibaca. Nombor telefon petugas dibiarkan kosong. Bahagian D kosong kerana diisi di akhir operasi.
   - Tulisan tangan menggunakan fon Caveat (SIL OFL 1.1, dibenam; lesen dalam `assets/Caveat-OFL.txt`).

### Keputusan semakan V4

`node tools/check-player.js` menjalankan 59 semakan; **59/59 lulus**. Ini termasuk semua pintu V3:
- telefon tiada pada bingkai 0–1457;
- taip semula selesai 11.85 s;
- hentakan tajuk 13.35 s;
- sudut 3D;
- tulisan sehala ke Sheets;
- tahanan;
- satu set data 110 / 92 / 12 / 6 / 84%.

Semakan baharu:

| Semakan | Bukti |
|---|---|
| C6 animasi sasaran | Pada 66.5 s kedua-dua lencana "Sedang Berjalan (<80%)" dan penanda "Sasaran 80%" kelihatan. Pada 73 s lencana "Capai Sasaran (≥80%)", pil dan formula "sasaran dalam aplikasi: ≥ 80%" kelihatan. |
| C9 kiraan naik | 62.5 s: 0%; 65.2 s: lokaliti 110; 67.0 s: 45%; 69.1 s: 84% (92/110). Sasaran dicapai di tengah kiraan, dengan bunyi kejayaan pada saat yang sama. |
| M1 borang | Semua medan utama Borang ACD (Bahagian A–D) dan semua tajuk lajur Lampiran 1 ada dan kelihatan. |
| M2 isian | Tiada tulisan pada 4.6 s; semua entri (Bahagian A, tanda ✓, baris 1–7) siap pada 7.1 s; tiada corak nombor telefon. |
| E2 tanpa narasi | Tiada narasi dalam campuran dan tiada blok FLAC dalam HTML. |
| E3 kenyaringan | Program −16.0 LUFS, puncak −1.6 dBFS. |

**Render V4** (`node render-video.js --out NADI-Muallim-Pitch-120s-v4.mp4`, 10 min 29 s):
- **ffprobe:**
  - H.264 High, 1920 × 1080, yuv420p bt709, 60/1, **7,200 bingkai**, video 120.000 s.
  - AAC 48 kHz stereo, 120.000 s; bekas 120.000 s; 45.0 MB.
- **Tiada narasi dalam MP4:** audio MP4 dikorelasi dengan `narration-bm.wav` dalam 19 tetingkap kiu; korelasi maksimum hanya 0.013 (narasi akan memberi kira-kira 0.97).
- **Kenyaringan (FFmpeg ebur128):** −16.0 LUFS, LRA 3.2 LU, puncak sebenar −1.1 dBTP.
- **Bingkai MP4 berbanding HTML:** 16 bingkai disemak, termasuk borang (300/372/420), pintu telefon (1457/1458/1459) dan kiraan naik (3780/3990/4110/4164/4260/4350). PSNR 36.7–42.9 dB, iaitu beza mampatan H.264 sahaja.
- **Rangkaian:** 0 permintaan rangkaian.

### Perkara untuk perhatian (V4)

1. **Sari kata kekal pada skrin.** Ia ialah teks narasi lama, tetapi kini tanpa suara. Jika anda mahu filem tanpa teks sari kata, MP4 perlu dirender semula; dalam pemain HTML, tekan S.
2. **Dua baris sari kata masih membuat dakwaan tanpa bukti dalam pakej ini:**
   - c08 "Borang kertas tidak perlu dibawa untuk tugas ini."
   - c10 "Ini menjimatkan masa menyediakan ringkasan."

   Saya kekalkan teks asal kit. Cadangan: sediakan bukti, atau tukar kepada pernyataan tanpa dakwaan.
3. **"Capai Sasaran" ialah status dalam aplikasi**, berdasarkan ambang 80% yang ditetapkan dalam e-ACD (data simulasi). Ia bukan sasaran rasmi yang disahkan; formula pada skrin menyatakan "sasaran dalam aplikasi".
4. **Susun atur borang** disalin daripada PDF kit (teks dan struktur), bukan imej PDF itu sendiri. Saiz fon dan jarak dilaraskan sedikit supaya muat dalam bingkai.

### Bina, semak dan render (V4)

```bash
node tools/build-player.js
```

```bash
node tools/check-player.js
```

```bash
node render-video.js --out NADI-Muallim-Pitch-120s-v4.mp4
```

Selepas mux, `render-video.js` mengesahkan bahawa narasi `narration-bm.wav` **tiada** dalam MP4: korelasi bagi setiap tetingkap kiu mesti di bawah 0.15. Untuk membina semula V3 yang bernarasi, jalankan `npm run render:v3`.

## Dokumentasi V3 (bernarasi, disimpan untuk perbandingan)

Filem 02:00.000 (1920 × 1080, 60 fps, 7,200 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V3 menggunakan narasi `narration-bm.wav` dan 19 kiu sari kata daripada kit suara. Gerakan dan muzik pembukaan diambil semula daripada filem e-ACD 90 saat.

Semua rekod, nama, angka dan lokasi ialah **data simulasi**. Paparan e-ACD di dalam NADI dilabel **Prototaip Integrasi**. Filem ini tidak membuat sebarang panggilan ke aplikasi langsung, Google Sheets, peta atau perkhidmatan pesanan.

### Fail V3 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-120s-v3.mp4` | Filem akhir V3: H.264 High 1920 × 1080, CFR 60 fps, 7,200 bingkai, 120.000 s; AAC 48 kHz stereo. Mengandungi narasi, muzik dan kesan bunyi (satu campuran). |
| `video-showcase-v3.html` | Pemain HTML kendiri, luar talian. Narasi terbenam sebagai FLAC tanpa kehilangan, jadi campurannya sama dengan MP4. |
| `sari-kata-bm-v3.srt` | 19 kiu sari kata yang dipaparkan dalam filem. Teks sama dengan kit; hanya masa kiu 5/6 berubah (lihat §4). |
| `NADI-Muallim-V3-pratonton-00-30s.mp4` | Pratonton bernarasi 0–30 s untuk menyemak pembukaan, sebutan, sari kata dan keseimbangan muzik. |

**Input (dibaca sahaja):**
- `narration-bm.wav`: mono PCM 16-bit, 48 kHz, 120.000 s, sha256 `8a1bbe04fb96…`.
- `kit-suara/`: `subtitles-bm.srt`, `voiceover-script-bm.md`, `README.md`.

**V2, disimpan untuk perbandingan (tidak diubah):**
- `NADI-Muallim-120s.mp4`, `video-showcase.html`, `sari-kata-bm.srt`, `skrip-narasi-bm.md`.
- `arkib/v2-sumber.tar.gz`: sumber V2.
- `arkib/README-VIDEO-v2.md`: dokumentasi V2.

### 1. Garis masa V3

| Masa | Babak | Narasi (kiu) | Paparan dan masa penting |
|---|---|---|---|
| 00:00–00:13.2 | 1 · Pembukaan | c01 0.92–3.22<br>c02 4.03–8.69<br>c03 9.39–12.33 | Peta daerah gelap daripada filem 90 s (ilustrasi, 110 premis). Pin Kg. Ketoyong berdenyut sekali pada 0.80, diikuti tolakan perlahan. Soalan "Premis mana yang masih perlu dilawati?" muncul 0.80–4.10.<br>Fokus berpindah satu demi satu: borang (4.15), fail (5.95), kiraan manual (9.20; lakaran 9.70–10.95, "dikira" ≈ 10.81), komputer riba (10.70).<br>Kamera tolak ke satu sel 11.05–11.50. Sel "14" ditaip 11.45–11.85, ditahan hingga 12.85, kemudian set dikosongkan 12.85–13.30. Riser 9.90 → 13.35. |
| 00:13.2–00:24.3 | 2 · NADI | c04 16.94–20.54<br>c05 21.22–25.66 | Tajuk "NADI Muallim · Dari Survelan ke Respons Denggi" (gaya penutup). Hentakan 13.35, stabil 13.80.<br>Kad lokaliti Kg. Ketoyong, dengan kurang krom pelayar dan butiran GIS. Tindakan "Buka Operasi ACD" berlabel PROTOTAIP INTEGRASI diklik pada 24.10.<br>Kad hilang 24.16–24.34. |
| 00:24.3–00:49 | 3 · Rekod | c06 25.69–27.02<br>c07 33.92–38.95<br>c08 40.73–44.02 | **Telefon tidak wujud sebelum 24.30** (bingkai 1458); bingkai pertama yang kelihatan ialah 1459. Skrin pembuka "Operasi ACD · Kg. Ketoyong" (lokaliti sama).<br>Sudut tiga suku cetek (yaw −12°), stabil pada 25.60. "Cukup satu telefon untuk rekod ACD" dipaparkan 25.75–32.85.<br>Pasukan 1 · Premis Contoh 012: status, saringan gejala, rujukan dan Bahagian C. Telefon hampir hadapan untuk dibaca. |
| 00:49–01:02 | 4 · Simpan, Sheets | c09 49.32–53.63<br>c10 56.34–59.08 | Simpan 49.42. "Rekod disimpan" ditahan 49.73–54.83 (5.1 s). Kiraan Pasukan 1 berubah 16/19 → 17/20 pada 51.30.<br>Telefon → Google Apps Script → "Hasil ACD!C8:H13", satu hala. Sel diisi selepas simpan, pada 57.45. "Dapatan diselaraskan apabila sambungan tersedia". |
| 01:02–01:18 | 5 · Liputan | c11 64.93–70.69<br>c12 72.38–74.86 | Telefon (12°) dan monitor (−9°) dengan gerakan kamera 3D cetek, selesai 64.50.<br>Kad "84% liputan ACD · 92 daripada 110 premis dilawati" ditahan 64.82–77.60; carta menjadi latar sekunder. |
| 01:18–01:25 | 6 · Sahkan | c13 78.92–81.25 | Pengesahan Bahagian D (80.35) dan ringkasan statik sedia dikongsi. Tiada penghantaran WhatsApp. |
| 01:25–01:45 | 7 · Susulan | c14 85.92–87.98<br>c15 90.42–93.28<br>c16 99.01–101.75<br>c17 101.75–104.54 | Kad NADI (PROTOTAIP INTEGRASI + DATA SIMULASI). "6 premis belum dilawati" muncul pada 85.85. "12 berkunci atau kosong" ditonjolkan 90.30–93.60.<br>Penyelia mengklik "Rancang lawatan susulan" pada 99.65. "Semak semula status 12 premis" pada 102.0. |
| 01:45–01:52.35 | 8 · Manfaat | (tiada) | Empat kad:<br>• Rekod ACD pada telefon<br>• Kiraan liputan automatik<br>• Pengesahan dan ringkasan<br>• Perancangan lawatan susulan (Prototaip Integrasi)<br>Masuk dalam kira-kira 1 s; baris penuh 106.08–112.07. |
| 01:52.35–02:00 | 9 · Penutup | c18 112.90–114.02<br>c19 114.68–118.16 | Lockup penutup penuh pada 113.03, kekal hingga bingkai akhir. |

**Diambil semula daripada filem 90 saat:**
- Peta daerah gelap dengan 110 premis dan pin.
- Tetingkap Google Sheets dan nod Apps Script, termasuk anak panah satu hala dan paket data.
- Sudut 3D telefon/monitor (`perspective` + `rotateX/Y`, rata semasa membaca supaya teks tajam).
- Bunyi pembukaan: dron, degupan jantung berpasangan yang semakin laju, detik jam, riser dan hentakan.

### 2. Pintu wajib V3: keputusan semakan

`node tools/check-player.js` menjalankan 56 semakan; **56/56 lulus**. Semakan utama:

| Pintu | Bukti |
|---|---|
| Telefon tiada sebelum 00:24.30 | Lapisan telefon (bingkai, bayang, lencana, penanda sentuhan) tersembunyi pada **setiap** bingkai 0–1457, termasuk 1027, 1065, 1160 dan 1457. Bingkai pertama yang kelihatan: 1459. Tiada bunyi sentuhan atau bunyi pendedahan telefon sebelum 24.30. `renderFrame()` yang sama dipakai untuk main, lompat dan eksport. |
| Babak taip semula | Sel "14" lengkap pada 11.85 dan kamera tetap hingga 12.33. Tajuk kelihatan pada bingkai hentakan 13.35 (riser berakhir 13.35) dan stabil pada 13.80. |
| Sudut 3D | Telefon −12° (masuk), 14° (Sheets), 12° (gabungan); monitor −9°. Telefon 0° semasa borang dan Bahagian D dibaca. Gerakan selesai 64.50, kamera tetap 64.5–74.9. |
| Satu set data | 110 / 92 / 12 / 6 / 84% sama pada monitor, kad liputan, kad NADI, kad susulan dan ringkasan. Tiada angka utama semasa telefon didedahkan (24.30–33). Individu yang disaring/dirujuk dibezakan daripada kes yang dinotifikasi. |
| Sheets | Julat "Hasil ACD!C8:H13". P1 berubah 19/16 → 20/17 hanya selepas simpan. Anak panah satu hala. Tulisan bersyarat sambungan, dengan nota "tiada sambungan langsung dalam demo". |
| Tahanan | "Rekod disimpan" 5.1 s; kad 84%/92 daripada 110 dari 64.82 hingga 77.60; "6 premis" pada 85.85; "12" boleh dibaca pada 90.42; baris manfaat 5.98 s; penutup penuh 113.03. |
| Audio | Satu campuran 120.000 s. Narasi = `narration-bm.wav` (sha256 sama, sampel sama bit demi bit). Program −16.0 LUFS, puncak −1.5 dBFS. Setiap kiu ≥ 12.7 LU di atas muzik. Tiada sintesis suara pelayar. |
| Pemain | Narasi kekal segerak selepas mula semula dan lompat ketika main: campuran dimulakan semula pada masa baharu. 0 permintaan rangkaian, tiada ralat halaman. |

**Keputusan render `NADI-Muallim-Pitch-120s-v3.mp4`** (`render-video.js --voiceover narration-bm.wav`, 12 min 17 s):
- **ffprobe:**
  - H.264 High, 1920 × 1080, yuv420p bt709, 60/1 (purata 60/1), **7,200 bingkai** dinyahkod, video 120.000 s.
  - AAC 48 kHz stereo, 120.000 s; bekas 120.000 s; 41.8 MB.
- **Narasi dalam MP4:** audio MP4 dinyahkod dan dikorelasi dengan `narration-bm.wav` bagi setiap kiu: r = 0.960–0.982 untuk semua 19 kiu, sela 0.00 ms, paras narasi +2.3/+2.4 dB (sama dengan gandaan dalam halaman).
- **Kenyaringan MP4 (FFmpeg ebur128):** −16.0 LUFS, LRA 5.3 LU, puncak sebenar −1.4 dBTP.
- **Bingkai MP4 berbanding HTML:** 22 bingkai disemak, termasuk 711, 740, 801, 1027, 1065, 1160, 1457, 1458 dan 1459. PSNR 37.6–42.9 dB, iaitu beza mampatan H.264 sahaja.
- **Rangkaian:** 0 permintaan rangkaian semasa render.
- **Pratonton** `NADI-Muallim-V3-pratonton-00-30s.mp4`: 1,800 bingkai, 30.000 s; semakan narasi c01–c06 lulus.

### 3. Audio: satu campuran

`src/audio.js` mengira **satu** campuran dalam halaman. Pemain memainkan sampel ini, dan `render-video.js` mengeksport sampel yang sama ke MP4. Tiada pemprosesan kedua dalam FFmpeg selain pengekodan AAC.

- **Narasi:** `narration-bm.wav` dibenam sebagai FLAC tanpa kehilangan dan dinyahkod pada 48 kHz. Sampel yang dinyahkod sama bit demi bit dengan WAV. Dengan `--voiceover`, PCM WAV dihantar terus ke halaman dan menghasilkan campuran yang sama.
- **Pembukaan (dari filem 90 s):**
  - Dron ketegangan D2 + A2, kemudian geseran A3/Bb3.
  - Degupan berpasangan yang semakin laju dari 0.80 hingga 13.2.
  - Detik jam 4.0–13.2 dan riser 9.90 → 13.35.
  - **Hentakan dipindahkan ke tajuk pada 13.35**, kira-kira 6 dB lebih rendah daripada versi 90 s supaya tidak mengejutkan.
  - Satu "ping" mengiringi denyutan pin pada 0.80.
- **Muzik selepas itu:** pad kord D6/9 · Bm11 · Gmaj9 · Asus2, bertukar pada sempadan babak V3, dengan bes, denyut lembut, arpeggio dan kesan UI daripada jadual kiu yang sama dengan visual.
- **Paras (ITU-R BS.1770):**
  - Narasi diukur −19.87 LUFS (mono) dan diberi +1.26 dB, iaitu −15.6 LUFS sebagai stereo dwi-mono.
  - Skor dan kesan bunyi pada −19.5 LUFS, dan direndahkan **−12 dB** ketika narasi aktif (pandang depan 80 ms, tahan 250 ms, lepas 600 ms).
  - Program dilaraskan +1.12 dB ke **−16.0 LUFS**. Penghad pandang depan 5 ms dengan siling −1.5 dBFS (pengurangan maksimum 1.2 dB pada 73 puncak).
- **Keseimbangan per kiu** (narasi berbanding muzik + kesan, LU):

| Kiu | c01 | c02 | c03 | c04 | c05 | c06 | c07 | c08 | c09 | c10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Beza | 17.5 | 15.0 | 12.7 | 16.8 | 16.5 | 15.8 | 16.1 | 16.8 | 15.7 | 15.9 |

| Kiu | c11 | c12 | c13 | c14 | c15 | c16 | c17 | c18 | c19 |
|---|---|---|---|---|---|---|---|---|---|
| Beza | 16.7 | 16.6 | 14.7 | 17.0 | 17.1 | 16.9 | 16.2 | 14.6 | 15.4 |

  c03 paling rapat (12.7 LU) kerana riser dan degupan sedang membina ke arah tajuk. Ini disengajakan dan masih jauh di atas paras yang menenggelamkan suara. Di celah ayat, muzik naik semula ke kira-kira −18 LUFS momentari.

### 4. Sari kata (19 kiu)

`sari-kata-bm-v3.srt` dijana daripada `src/data.js`, iaitu kiu yang sama yang memacu pemain dan MP4. Semua teks dan 17 masa sama dengan `kit-suara/subtitles-bm.srt`.

**Satu perubahan: sempadan kiu 5/6.** Kit meletakkannya pada 24.03; V3 meletakkannya pada **25.66 / 25.69**. [Keyakinan sederhana]

Mengapa sempadan 24.03 tidak sepadan dengan pertuturan dalam WAV:
- Kiu 5 ("…penyelia membuka operasi pengesanan kes aktif", kira-kira 19 suku kata) tidak muat dalam 2.81 s; ini memerlukan 6.8 suku kata/s, berbanding kira-kira 4.5–5.3 dalam kiu lain.
- Kiu 6 ("di Kampung Ketoyong", 6 suku kata) pula akan mengambil 3 s.

Asas keputusan ini:
- kiraan nukleus suku kata (16 nukleus sebelum 25.67 s);
- anggaran berkadar masa (25.70 s);
- jeda tenaga pada 25.66–25.69 s.

Jeda pada 24.14–24.18 s ialah hujung perkataan "membuka". Semakan ini **tidak** menggunakan pengecaman pertuturan (ASR); lihat §7.

Sempadan kiu lain disemak dengan WAV: mula dalam −0.05/+0.06 s, tamat 0–0.19 s lebih awal daripada hujung suara. Sempadan 16/17 (101.75) dikekalkan kerana ujiannya tidak muktamad.

### 5. Bina, semak dan render

Semua langkah berjalan luar talian. Tailwind 3.4.17 dan FFmpeg diperlukan untuk membina; Playwright 1.63.0 untuk render.

```bash
node tools/build-player.js --voiceover narration-bm.wav
```

```bash
node tools/check-player.js
```

```bash
node render-video.js --voiceover narration-bm.wav --start 0 --end 1799 --out NADI-Muallim-V3-pratonton-00-30s.mp4
```

```bash
node render-video.js --voiceover narration-bm.wav --out NADI-Muallim-Pitch-120s-v3.mp4
```

```bash
node tools/make-docs.js
```

**Selepas mux, `render-video.js` mengesahkan narasi.** Ia menyahkod audio MP4 dan mengira korelasi dengan narasi bagi setiap kiu, kemudian gagal (kod keluar 1) jika narasi tiada, terlalu perlahan atau tidak sejajar.

**Ralat yang boleh diambil tindakan.** Fail WAV tiada, bukan WAV, senyap, lebih panjang daripada 120 s, atau pemain tanpa narasi terbenam: setiap kes menghentikan eksport dengan arahan pembetulan. Gunakan `--no-narration` hanya jika eksport tanpa narasi memang dikehendaki.

### 6. Privasi dan luar talian

- **Rekod dan nama:**
  - Semua rekod ialah fiksyen.
  - Petugas dan pegawai dinamakan mengikut peranan atau "Pegawai Contoh".
  - Medan hubungan dibiarkan kosong.
- **Peta, rangkaian dan Sheets:**
  - Peta ialah ilustrasi, bukan berskala, dan dilabel "Peta ilustrasi".
  - Penyelarasan Sheets dan ringkasan WhatsApp disimulasi dalam halaman, dengan nota "tiada sambungan langsung dalam demo".
  - Pemain dibuka daripada `file://`. Semua permintaan rangkaian disekat semasa semakan dan render: **0 permintaan**.
- **Pengawal binaan:** `tools/build-player.js` menolak output yang mengandungi URL langsung, ID spreadsheet, koordinat peta atau nama sebenar kakitangan daripada aplikasi sumber.

### 7. Perkara belum selesai dan memerlukan semakan manusia

1. **Sebutan "Muallim" dan "Ketoyong" belum disahkan dengan pendengaran.** Saya tidak dapat mendengar audio, dan pemasangan ASR (Whisper) tidak dibenarkan dalam persekitaran ini. Sila dengar:
   - Pratonton 00:16.9–00:18.1: "Nadi Muallim".
   - Pratonton 00:25.7–00:27.0: "di Kampung Ketoyong".
   - Filem penuh 01:52.9–01:54.0: "NADI Muallim".
2. **Dua dakwaan dalam narasi yang dibekalkan belum disokong bukti dalam pakej ini:**
   - c08 "Borang kertas tidak perlu dibawa untuk tugas ini." (dakwaan penggantian kertas)
   - c10 "Ini menjimatkan masa menyediakan ringkasan." (dakwaan penjimatan masa)

   Audio tidak diubah. Cip visual "Tanpa borang kertas" yang pernah ditambah pada kad rekod telah **dibuang** supaya filem tidak menguatkan dakwaan itu. Sediakan bukti (contohnya ukuran masa sebenar) atau rakam semula dua baris tersebut sebelum tayangan rasmi.
3. **Sempadan kiu 5/6** dipindahkan berdasarkan analisis tenaga dan suku kata (§4). [Keyakinan sederhana] Jika anda mendengar sempadan lain, ubah `c05`/`c06` dalam `src/data.js`, kemudian bina semula dan render.
4. **Lesen suara.** Menurut README kit, narasi menggunakan suara stok "Osman" daripada FreeReadText. Terma kegunaan komersial suara itu tidak saya semak. **Ini perlu disahkan.**
5. **Data simulasi sahaja.** Angka 110 / 92 / 12 / 6 / 84% dan semua rekod adalah sintetik dan bukan dapatan operasi sebenar.

### 8. Struktur sumber

| Laluan | Kandungan |
|---|---|
| `src/data.js` | Babak V3, 19 kiu, set data simulasi, kad manfaat |
| `src/markup.js` | Pentas: peta pembukaan, set manual, NADI, telefon, monitor, Sheets/Apps Script, tindanan |
| `src/engine.js` | Garis masa V3 deterministik (`renderFrame`), kamera, peletakan 3D, pintu telefon |
| `src/audio.js` | Skor, kesan bunyi, narasi, ducking, kenyaringan, penghad: satu campuran |
| `src/player.js` | Kawalan pemain (main, lompat, babak 1–9, sari kata, bisu, mod bersih) |
| `tools/` | `build-player.js`, `check-player.js`, `make-docs.js` (`sync-narration.js` hanya untuk aliran V2) |
| `arkib/` | Sumber dan dokumentasi V2 |
