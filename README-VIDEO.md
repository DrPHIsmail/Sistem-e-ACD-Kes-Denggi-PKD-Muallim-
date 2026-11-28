# NADI Muallim — Filem Pertandingan · V11 (141.4 saat, bernarasi ElevenLabs)

V11 ialah V10 dengan dua lagi teknik daripada video rujukan `website_after_effect.mp4` (cadangan 4 dan 5):

4. **Angka bergerak.** Di hujung sisipan WhatsApp, empat angka laporan (110, 92, 12, 84%) terangkat keluar dari mesej semasa telefon kabur dan pudar. Angka itu terbang dalam lengkung pendek dengan jejak gema ke tempat masing-masing dalam blok "Ringkasan e-ACD" NADI. Setiap pendaratan ditandai dengan riak "ping" yang mengembang dan pudar di atas jubin. Angka keenam (6 belum dilawati) tiada dalam mesej; ia hanya muncul dalam NADI selepas tiga angka lain mendarat.
5. **Penutup triad.** Cincin 200 m dilukis sebagai garis di sekeliling titik tengah yang berdenyut, lalu terbuka menjadi garis pemisah lockup. Panjangnya sama, iaitu 2πr. Lockup dibina mengikut narasi: tajuk (c18), tagline (c19), kemudian "Rekod di lapangan. Terus ke NADI. Susulan terancang." perkataan demi perkataan, dan akhir sekali nama organisasi.

Narasi, fail SRT, babak lain dan panjang filem tidak berubah. Semua rekod dan angka ialah **data simulasi**. Pemain tidak memanggil sebarang perkhidmatan langsung.

**MP4 V11 tidak dirender**, atas permintaan pengguna untuk menjimatkan token. Fail yang dihantar ialah pemain HTML berdiri sendiri. Untuk menghasilkan MP4 kemudian, jalankan `npm run render` (±15 min, output `NADI-Muallim-Pitch-141s-v11.mp4`). Kemudian jalankan `tools/check-mp4-freeze.py` dan `tools/check-mp4-panel.py` padanya, kerana semakan MP4 itu belum dibuat untuk V11.

## Fail V11

| Fail | Kegunaan |
|---|---|
| `video-showcase-v11.html` | Pemain HTML berdiri sendiri (luar talian, ±8 MB). Kanvas WebGL dilukis pada skala pentas × devicePixelRatio (1–3; disemak pada DPR 2: `RENDER_SCALE` = 2). Elemen V11 ialah DOM/SVG vektor, jadi tajam pada sebarang DPI. F = skrin penuh, C = mod bersih. |
| `src/v11.js` | Angka bergerak dan penutup triad (baharu). |
| `arkib/v11-sumber.tar.gz` | Sumber V11 (src, tools, assets, narasi, README). |

V10 kekal untuk perbandingan: `NADI-Muallim-Pitch-141s-v10.mp4`, `video-showcase-v10.html` dan `arkib/v10-sumber.tar.gz`.

## Perubahan V11 (masa filem)

### 4. Angka bergerak: WhatsApp → NADI

| Detik | Apa berlaku |
|---|---|
| 103.98–104.45 s | Angka terangkat satu demi satu, berselang 0.05 s. Setiap angka bermula tepat di tempatnya dalam mesej, naik 10 px, membesar 14 %, dan mendapat pil putih bergelang teal. Telefon dikaburkan (7 px) dan pudar pada 104.25–104.53 s, dan angka asal hilang dari mesej. |
| 104.30–104.75 s | Angka terapung perlahan semasa latar WhatsApp bertukar ke NADI (tiada bingkai pegun). |
| 104.75–105.63 s | Angka terbang selama 0.7 s setiap satu, berselang 0.06 s. Laluannya lengkung kuadratik setinggi 60–150 px, dengan tiga gema kabur (lewat 0.035/0.07/0.105 s). Di pertengahan laluan, rupa huruf bertukar daripada teks WhatsApp kepada fon jubin NADI. Sasaran dibaca daripada halaman pada setiap bingkai, kerana blok sedang terbuka dan panel menatal. |
| 105.45 / 105.51 / 105.57 / 105.63 s | Setiap angka mendarat: 110, 92, 12, kemudian 84% dalam "Liputan ACD". Angka itu muncul di tempatnya (sebelum itu tersembunyi). Riak ping teal mengembang 12 % dan pudar dalam 0.55 s di atas jubin, dan bunyi blip lembut dimainkan. "110" mendarat serentak dengan "110" pada pokok soalan di kiri (105.5 s). Ping ialah lapisan atas sahaja; kad panel sendiri tidak digayakan semula. Ini mematuhi peraturan V9 bagi kelipan panel: setiap kad menyala sekali sahaja dan kekal (semakan H1). |
| 105.82 s | "6 Belum dilawati" muncul dalam NADI, iaitu angka yang dikira oleh sistem. Kemudian c14 berkata "…enam premis belum dilawati" (105.85 s). |

### 5. Penutup triad

| Detik | Apa berlaku |
|---|---|
| 133.78–134.32 s | Cincin (r 56 px) dilukis di sekeliling titik tengah: titik muncul pada 133.80 s dan berdenyut sekali pada 134.00–134.75 s, bersama sting penutup. |
| 134.05 / 134.20 s | Jata Negara, kemudian "NADI Muallim" muncul dengan kabur yang hilang, serentak dengan c18 "Nadi Muallim." (134.20 s). |
| 134.85–135.55 s | Cincin terbuka menjadi garis pemisah sepanjang 352 px (2π × 56), dan warnanya bertukar daripada teal kepada emas. |
| 135.80 s | Tagline "Dari Survelan ke Respons Denggi" muncul serentak dengan c19, yang bermula pada 135.80 s. |
| 136.50 / 137.10 / 137.70 s | "Rekod di lapangan." / "Terus ke NADI." / "Susulan terancang." muncul perkataan demi perkataan, berselang 0.12 s. Setiap perkataan bermula kabur 10 px dan naik 12 px; warnanya bermula ambar muda lalu bertukar ke warna akhir. "NADI" berwarna hijau, sama seperti tajuk. |
| 138.45–138.95 s | Nama organisasi muncul. Lockup lengkap kekal hingga bingkai akhir (141.4 s). |

## Semakan V11 (`node tools/check-player.js`)

**Keputusan: 98/98 semakan lulus** (93 semakan V10, termasuk H1 kestabilan panel, dan 5 semakan baharu).

Semakan baharu:
- **DM1:** setiap angka terangkat dari tempatnya sendiri dalam mesej (≤ 1.5 px, saiz dalam 5 %) dan meninggalkan mesej. Angka kekal tajam di hadapan telefon yang kabur (≥ 5 px).
- **DM2:** setiap angka mendarat tepat di tempatnya dalam blok NADI (≤ 1 px). Angka tersembunyi sebelum mendarat dan kelihatan selepasnya, ping muncul di atas jubinnya, dan cip hilang. Angka 6 muncul hanya selepas angka terakhir mendarat. Ada satu blip bagi setiap pendaratan.
- **DM3:** gema kelihatan semasa terbang dan tiada semasa diam, dan apungan sebelum penerbangan sentiasa bergerak.
- **TR1:** cincin ialah bulatan penuh (jejari ± 0.5 px), dan menjadi garis lurus pada slot susun aturnya (≤ 0.5 px), sama panjang (2πr ± 1 px) dan berwarna emas.
- **TR2:** tajuk muncul pada c18, tagline pada c19, dan perkataan triad mengikut tertib. Semua elemen kelihatan dan tajam menjelang 139.0 s.

Semakan "lockup penutup" lama diubah: lockup kini lengkap menjelang 139.0 s filem (V10: 134.6 s) dan kekal hingga akhir.

## Perlu perhatian (V11)

- **Tafsiran aliran data** [keyakinan sederhana]. Angka terbang dari mesej WhatsApp ke NADI, jadi sebahagian penonton mungkin faham WhatsApp yang menghantar data ke NADI. Langkah yang diambil untuk mengurangkannya:
  - telefon dan mesej hilang sebelum angka terbang;
  - angka 6 dikira dalam NADI;
  - blok NADI kekal berlabel PROTOTAIP INTEGRASI dan DATA SIMULASI.
  
  Untuk penonton teknikal (IT/sistem maklumat kesihatan), pertimbangkan sama ada peralihan ini perlu.
- **Lockup penutup kini dibina selama ±5 s**, dan lockup lengkap kelihatan 2.45 s pada hujung filem (V10: 7 s). Jika juri perlukan kad akhir yang lebih lama, filem perlu dipanjangkan atau organisasi dipaparkan lebih awal.
- **Teks triad tidak sama dengan ayat c19** ("Dari survelan denggi kepada tindakan susulan di lapangan"), walaupun maknanya bertindih ("susulan", "lapangan"). Triad menerangkan aliran kerja, bukan hasil; tiada dakwaan penjimatan atau ralat.
- **MP4 tidak dirender**, jadi semakan khusus MP4 (bingkai beku, kelipan panel, korelasi narasi) belum dijalankan untuk V11.

## Bina V11

```
npm install          # tailwindcss@3.4.17, three@0.158.0, playwright
node tools/build-player.js        # → video-showcase-v11.html (atau TAILWIND_BIN=… THREE_JS=… jika node_modules tiada)
node tools/check-player.js        # semua semakan pemain
npm run render                    # pilihan: MP4 V11
```

## Dokumentasi V10


Filem 02:21.400 (1920 × 1080, 60 fps, 8,484 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V10 ialah V9 muktamad dengan tiga teknik daripada video rujukan `website_after_effect.mp4`. Video itu dianalisis bingkai demi bingkai, dan pengguna memilih cadangan 1–3:

1. **Elemen wira.** Kawalan utama dicabut dari skrinnya, dibesarkan di hadapan babak yang dikaburkan, digunakan, lalu dikembalikan tepat ke tempatnya:
   - pilihan status lawatan (c07);
   - Simpan → cincin kemajuan → ✓, yang terbang ke kad "Rekod disimpan" (c09);
   - "Rancang lawatan susulan" (c16).
2. **Imbasan.**
   - Pemidang dan jalur imbas membaca rekod, lalu tiba pada kiraan pasukan ketika ia berubah (c09).
   - Radar menyapu Kg. Ketoyong: mula-mula menemui 6 premis belum dilawati, kemudian 12 yang berkunci/kosong (c14–c15).
3. **Tiada kamera pegun.**
   - Pegangan kamera WhatsApp menjadi hanyutan perlahan.
   - Peta susulan "bernafas" di belakang panel, yang kekal pegun.

Narasi, fail SRT, babak lain dan panjang filem tidak berubah. Semua rekod, nama dan angka ialah **data simulasi**. Pemain dan MP4 tidak memanggil sebarang perkhidmatan langsung.

## Fail V10 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-141s-v10.mp4` | Filem akhir V10: H.264 High 1920 × 1080, CFR 60 fps, 8,484 bingkai, 141.400 s; AAC 48 kHz stereo; narasi Ahmad, muzik latar dan kesan bunyi; tanpa sari kata. |
| `video-showcase-v10.html` | Pemain HTML berdiri sendiri (luar talian), dilukis pada resolusi skrin (HD/4K) seperti V9. F = skrin penuh, C = mod bersih. |
| `sari-kata-bm-v9.srt` | Tidak berubah daripada V9, kerana narasi sama. Fail berasingan untuk dimuat naik sebagai sari kata tertutup (CC). |
| `src/hero.js` | Elemen wira, imbasan, hanyutan kamera dan peta (baharu). |
| `tools/check-mp4-freeze.py` | Imbasan bingkai beku dalam MP4: regangan ≥ 0.5 s tanpa gerakan (baharu). |

V9 disimpan untuk perbandingan: `NADI-Muallim-Pitch-141s-v9.mp4`, `video-showcase-v9.html` dan `arkib/v9-sumber.tar.gz`.

## Perubahan V10 berbanding V9

### 1. Elemen wira (masa filem)

| Detik | Apa berlaku |
|---|---|
| Status lawatan (c07) | 39.48–39.78 s: kumpulan pilihan status terangkat dari telefon, dari tempatnya sendiri (beza 0 px). Ia membesar 1.5× di hadapan babak yang dikaburkan (7 px, 28 % lebih gelap). Jari mengetik "1 - Dilawati" pada 39.80 s. Elemen hanyut perlahan semasa ditahan, kemudian kembali ke slotnya pada 40.93–41.28 s (beza 0.07 px). |
| Simpan (c09) | Butang terangkat pada 54.50–54.82 s, dan diketik pada 54.92 s. Ia menjadi bulatan pada 54.97–55.22 s, pemutar berpusing pada 55.00–55.30 s, dan ✓ dilukis pada 55.27–55.42 s, serentak dengan bunyi "confirm" dan lencana "Disimpan". Cincin terbang ke ikon kad pada 55.42–55.78 s dan mendarat tepat (0 px). Kad terbuka dari ikon itu pada 55.74–56.05 s. |
| Keputusan penyelia (c16) | Butang terangkat pada 114.42–114.66 s. Penunjuk mengklik pada butang yang terangkat itu pada 114.70 s, dan penunjuk panel disembunyikan sementara. Butang kembali dalam gaya "selesai" pada 114.95–115.30 s. |

Elemen wira ialah klon elemen asal dalam lapisan pentas yang tersendiri. Kedudukan asalnya diukur setiap bingkai, jadi elemen terbang dari dan kembali ke tempat yang tepat walaupun kamera telefon bergerak.

### 2. Imbasan

- **Rekod (c09):** pemidang muncul pada 56.0 s. Jalur imbas bergerak dari 56.04 s; setiap satu daripada 5 baris rekod menyala ketika jalur melaluinya. Pinggir jalur tiba pada angka pasukan tepat ketika 16 / 19 → 17 / 20 (56.80 s, beza 0.7 px).
- **Radar (c14–c15):** sapuan pertama (107.0–109.4 s) menemui 6 premis belum dilawati mengikut sudut, pada 107.20, 107.50, 107.80, 108.07, 108.33 dan 109.30 s, setiap satu dengan bunyinya. Sapuan kedua (109.9–111.9 s) menemui 12 premis berkunci/kosong.
- **Istilah:** tiada label atau ikon "AI". Kiraan NADI berasaskan peraturan, dan narasi menyebut "kiraan automatik".

### 3. Tiada kamera pegun

- **Masalah dalam V9:** MP4 V9 mempunyai 13 regangan beku ≥ 0.5 s (jumlah 15.1 s), semuanya pada 91.7–124 s.
  - Sisipan WhatsApp: kamera berhenti di antara gerakan.
  - Babak susulan: kamera panel sengaja dipegunkan dalam V9 untuk membaiki kelipan zum.
- **Pembaikan dalam V10:**
  - Setiap pegangan kamera WhatsApp kini hanyut perlahan (zum 2.5 % sesaat, naik 3 px sesaat), dan gerakan seterusnya bermula dari keadaan itu.
  - Dalam babak susulan, kad kanan ("Ringkasan e-ACD") kekal pegun dan tajam, kerana di situlah kelipan V9 dibaiki.
    - Peta di belakangnya mendekati Kg. Ketoyong (`1 + 0.22·p²`): perlahan semasa radar, dan ±2 %/s menjelang hujung, ketika laluan susulan dilukis.
    - Pokok soalan penyelia di kiri terapung perlahan (±5 × ±4 px, kitaran 7 s × 5.3 s; titik pusingannya tidak pernah bertindih), seperti kad terapung dalam video rujukan.
  - Draf pertama MP4 V10, dengan zum peta 10 % sahaja, masih ada 5 regangan beku (3.1 s) pada 116.6–124 s, kerana peta pucat berkontras rendah. Apungan pokok membaikinya: median perubahan sebingkai pada 115.5–124.4 s naik dari 0.02 kepada 0.078 (sumber tanpa kehilangan).

## Keputusan semakan V10

`node tools/check-player.js` menjalankan 93 semakan (87 daripada V9 dan 6 baharu), dan **93/93 lulus**.

| Semakan | Bukti |
|---|---|
| HR1 | Status lawatan: terangkat dari tempatnya (0 px) dan membesar 1.5×. Babak di belakangnya kabur 7 px, manakala elemen wira sendiri tidak dikaburkan. Ketikan "1 - Dilawati" berlaku pada elemen wira, dan elemen kembali ke slotnya (0.07 px). |
| HR2 | Simpan: bermula pada butang (0 px), menjadi bulatan sempurna, dan ✓ dilukis penuh. Cincin mendarat pada ikon kad (0 px). Kad tersembunyi sebelum itu, dan kelihatan penuh selepas terbuka. |
| HR3 | Keputusan penyelia: terangkat (0.09 px) dan membesar 1.51×. Penunjuk mengklik pada butang yang terangkat, dan penunjuk panel disembunyikan. Butang kembali ke slotnya (0.03 px). |
| SC1 | Pinggir jalur imbas berada pada setiap 5 baris rekod ketika baris itu menyala. Ia tiba pada angka (0.7 px) dalam bingkai yang sama 16 / 19 → 17 / 20. |
| SC2 | Setiap 6 penanda merah dan 12 penanda ambar muncul dalam bingkai yang sama sapuan radar melintasinya, setiap satu dengan bunyinya. |
| ST1 | Kamera WhatsApp dan peta susulan berubah dalam setiap bingkai: paling lama 1 bingkai sama berturut-turut. V9 pegun 0.6–2 s. |
| V7 / C8 / S1 | Dikemas kini untuk V10. Kad "Rekod disimpan" ditahan 4.58 s (50.25–54.83). Klik penyelia kelihatan pada butang yang terangkat. Penanda dikira selepas setiap sapuan radar. |
| D1 / D2 / E7 | 22/22 bingkai sama merentas halaman baharu; 13/13 keadaan main = lompat; tiada ralat halaman. |

**Pengesahan MP4 V10** (`NADI-Muallim-Pitch-141s-v10.mp4`, 73.9 MB, render 15 min 14 s):
- **ffprobe:** H.264 High 1920 × 1080 yuv420p, 60/1, 8,484 bingkai, 141.400 s; AAC 48 kHz stereo, 141.400 s.
- **Audio:**
  - −16.0 LUFS, LRA 4.9 LU, puncak −2.7 dBFS.
  - Narasi hadir dalam 29 tetingkap kiu (r ≥ 0.930, lag 0.00 ms).
- **Bingkai beku** (`tools/check-mp4-freeze.py`): **0 regangan ≥ 0.5 s** dalam seluruh filem.
  - Perbandingan: V9 ada 13 regangan (15.1 s), dan draf pertama V10 (zum peta 10 % sahaja) ada 5 (3.1 s).
- **Detik baharu, bingkai demi bingkai:**

  | Detik | Julat | Keputusan |
  |---|---|---|
  | Status | 38.8–42.0 s | Tiada kelipan dan tiada bingkai beku. |
  | Simpan | 54.0–57.6 s | Tiada kelipan dan tiada bingkai beku. |
  | Radar | 106.4–112.6 s | Tiada kelipan dan tiada bingkai beku. |
  | Keputusan penyelia | 114.0–115.8 s | Tiada kelipan dan tiada bingkai beku. |

  Dua lonjakan yang dikesan ialah perubahan keadaan yang disengajakan: ketikan "1 - Dilawati" (39.80 s), dan butang bertukar ke gaya "selesai" (114.85 s, sama seperti V9).
- **Panel kanan susulan** (`tools/check-mp4-panel.py`):
  - Di luar tetingkap elemen wira (104.75–114.35 s dan 115.40–124.20 s): **0 kelipan, 0 getaran**. Ada 1 langkah sebingkai, iaitu bingkai akhir pembukaan panel (105.38 s), sama seperti V9.
  - Di dalam tetingkap itu (114.42–115.30 s), 4 corak A-B-A dikesan pada butang yang diangkat: tekanan klik, riak dan gaya "selesai". Ini maklum balas interaksi, bukan kelipan panel.



## Perkara untuk perhatian (V10)

- **Kad "Rekod disimpan"** kini lengkap 0.92 s selepas ketikan Simpan (V9: 0.3 s), kerana rantai morf. Ia masih ditahan 4.58 s, dan masih muncul semasa ayat "Selepas rekod disimpan…".
- **Penanda merah** kini muncul ikut sudut sapuan radar, jadi selangnya tidak sama: penanda pada 345° muncul 1.0 s selepas penanda kelima.
- **Kabur di belakang elemen wira** ialah kesan berat pada pelayar tanpa pecutan grafik. Pemain HTML mungkin sedikit perlahan pada detik itu; MP4 tidak terjejas.
- Perkara V9 (hak imej Google Earth, sebutan, lesen suara) masih terpakai. Lihat Dokumentasi V9.

## Bina, semak dan render (V10)

```bash
THREE_JS=/path/to/three.min.js TAILWIND_BIN=/path/to/tailwindcss node tools/build-player.js   # → video-showcase-v10.html (enggan menulis atas v2–v9)
node tools/check-player.js                                      # 93 semakan automatik (±17 minit; WebGL perisian)
node render-video.js                                            # → NADI-Muallim-Pitch-141s-v10.mp4 (+ semakan kehadiran narasi)
python3 -I tools/check-mp4-freeze.py NADI-Muallim-Pitch-141s-v10.mp4    # regangan beku ≥ 0.5 s (keluar 1 jika ada)
python3 -I tools/check-mp4-panel.py NADI-Muallim-Pitch-141s-v10.mp4 104.75 124.2    # panel kanan susulan (V9)
```


## Dokumentasi V9 (141.4 s, muktamad sebelum V10, disimpan untuk perbandingan)

Filem 02:21.400 (1920 × 1080, 60 fps, 8,484 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V9 ialah V8 dengan enam perubahan yang diminta:
1. empat ayat pendek pada pembukaan;
2. "Inilah NADI Muallim." selepas kad tajuk;
3. tajuk "Rekod ACD pada telefon masing-masing" dengan contoh dua petugas;
4. ayat baharu untuk Simpan dan jadual;
5. narasi kad kelebihan;
6. pembaikan kelipan panel kanan "Ringkasan e-ACD".

**Draf 2 (permintaan seterusnya):**
7. kad kelebihan terapung dalam orbit dan difokuskan satu demi satu mengikut narasi, berdasarkan analisis bingkai demi bingkai video rujukan (bahagian 9);
8. sari kata dibuang sepenuhnya daripada filem (bahagian 10).

**Draf 3:**
9. sentakan pada peralihan babak borang manual → kad tajuk → pengenalan NADI dibaiki (bahagian 11);
10. latar 3D fotorealistik untuk pengenalan NADI (0:22–0:30): imej Google Earth yang diberi, dengan kubah radius 200 m berdenyut pada pusat wabak dan putaran kamera kanan → kiri (bahagian 12).
11. pemain HTML berdiri sendiri pada resolusi skrin (HD/4K): kanvas WebGL kini mengikut ketumpatan piksel skrin (bahagian 13).

**Panjang filem:** permintaan asal ialah 02:17. Ayat baharu memerlukan masa tambahan. Atas arahan "proceed accordingly, tak perlu fix mengikut garis masa sedia ada", filem dipanjangkan 4.4 s kepada **02:21.4** (bahagian 7).

Semua rekod, nama dan angka ialah **data simulasi**. Pemain dan MP4 tidak memanggil ElevenLabs, aplikasi langsung, Google Sheets, peta atau WhatsApp. Narasi dijana sekali sahaja dan dibenamkan dalam pemain.

### Fail V9 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-141s-v9.mp4` | Filem akhir V9: H.264 High 1920 × 1080, CFR 60 fps, 8,484 bingkai, 141.400 s; AAC 48 kHz stereo; narasi Ahmad + muzik latar dan kesan bunyi; tanpa sari kata. Saiz 54.6 MB (draf 2). |
| `video-showcase-v9.html` | Pemain HTML kendiri luar talian, dengan narasi terbenam sebagai FLAC tanpa kehilangan. Kekunci 1–9 dan 0 untuk 10 babak. |
| `sari-kata-bm-v9.srt` | Fail sari kata berasingan sahaja (29 baris, masa mengikut suara). **Tidak dipaparkan dalam filem** (bahagian 10); boleh dimuat naik sebagai sari kata tertutup (CC) jika perlu. |
| `narasi-v9/narasi-v9.wav` | Trek narasi 141.400 s (48 kHz mono 16-bit) pada jam filem. |
| `narasi-v9/penempatan-v9.json` | Take yang dipilih, masa setiap baris dan masa sari kata. |
| `narasi-v9/takes/`, `narasi-v9/takes-elevenlabs.json` | Take ElevenLabs V8 dan V9 beserta ID penjanaan. Take yang diganti disimpan di bawah `replaced`. |
| `tools/check-mp4-panel.py` | Ujian kestabilan panel kanan dalam MP4, bingkai demi bingkai (bahagian 6). |
| `src/kampung3d.js` | Imej udara Google Earth dalam 3D, kubah 200 m dan putaran (bahagian 12); three.js r158 dibenamkan semasa bina (`THREE_JS` atau `node_modules/three`). |
| `assets/udara-3d.jpg` | Imej Google Earth yang diberi (2000 × 1253, sRGB, tanpa metadata), dibenamkan semasa bina. |
| `tools/make-aerial-camera.py` | Memulihkan kamera tangkapan Google Earth (padanan SIFT dengan peta V6 → homografi → kamera); menghasilkan pemalar `K3D_CAM`. |

**Disimpan untuk perbandingan (tidak diubah):** V8 (`NADI-Muallim-Pitch-137s-v8.mp4`, `video-showcase-v8.html`, `sari-kata-bm-v8.srt`, `narasi-v8/`), dan V7–V2 seperti dalam dokumentasi di bawah. Sumber V9: `arkib/v9-sumber.tar.gz`.

### Perubahan V9 berbanding V8

#### 1. Pembukaan (00:00–00:09): empat ayat pendek pada empat paparan

| Ayat | Suara | Paparan |
|---|---|---|
| "Notifikasi denggi diterima." | 0.30–2.37 s | kad 1 "Notifikasi diterima" muncul 0.58 s |
| "Kes bertambah." | 2.62–3.86 s | kad 2 "Peningkatan kes" muncul 2.19 s |
| "Wabak diisytiharkan." | 4.11–5.83 s | kad 3 "Isytihar wabak" muncul 3.87 s |
| "Pasukan turun untuk pengesanan kes aktif." | 6.08–8.70 s | kad 4 "ACD" muncul 5.54 s; borang kertas bermula 7.50 s |

- **Ayat keempat** bersambung 1.2 s ke paparan borang. Ia tamat sebelum "Dalam operasi denggi…" (9.05 s).
- **Muzik debaran dikekalkan.** Di bawah empat ayat ini, muzik hanya direndahkan 9 dB (bukan 10 dB). Suara kekal 11.8–14.4 LU di atas muzik.
- **Masa:**
  - Aliran pembukaan dipanjangkan 1.0 s (0–6.5 s menjadi 0–7.5 s) supaya setiap ayat jatuh pada kadnya.
  - Babak borang manual dipanjangkan 1.5 s supaya c02 dan c03 muat sebelum hentakan tajuk. Teks c02 dan c03 ialah teks kit, tidak diubah.
  - Hentakan tajuk kini pada 18.85 s (V8: 16.35 s).

#### 2. Kad tajuk dan "Inilah NADI Muallim." (00:19–00:27)
- **Kad tajuk dan Jata Negara:** hentakan pada 18.85 s, stabil pada 19.30 s.
- **Ruang muzik dedahan:** 1.0 s. Kemudian "Inilah NADI Muallim." (20.30–22.33 s).
- **Ayat peta:** "NADI Muallim memaparkan situasi denggi mengikut lokaliti" bermula 22.68 s, sebaik peta mendarat (22.60 s).
- **Anjakan:** detik ini ≈ 2.5 s lebih lewat daripada 00:17–00:20 dalam permintaan, kerana pembukaan dan babak manual dipanjangkan (bahagian 1).

#### 3. Telefon masing-masing (00:33–00:46)
- **Tajuk skrin:** "Rekod ACD pada telefon masing-masing", dalam dua baris. Kotak tajuk dilebarkan ke 860 px supaya "masing-masing" tidak terputus pada tanda sempang.
- **Contoh dua petugas:** kad baharu "Pasukan 1 · contoh dua petugas" di bawah tajuk.
  - Petugas 1 · Premis Contoh 012 · sedang direkod
  - Petugas 2 · Premis Contoh 027 · direkod serentak

  Kad dipaparkan penuh dari 33.80 s hingga 38.07 s. Telefon pula menunjukkan Pasukan 1, dengan premis Petugas 1 sedang ditaip.
- **"Setiap petugas boleh merekod dapatan pada telefon masing-masing."** 33.63–37.96 s.
- **"Bagi premis yang ditugaskan, petugas merekod status lawatan, gejala dan rujukan."** bermula 39.50 s, iaitu 0.3 s sebelum ketikan status (39.80 s). Ayat ini menggantikan ayat kit "…dengan satu telefon".

#### 4. Simpan dan jadual (00:54–01:07)
- **"Selepas rekod disimpan, sistem mengira dapatan pasukan secara automatik."** bermula 54.92 s, tepat pada ketikan Simpan.
- **"Ringkasan dijana terus daripada rekod yang sama."** bermula 62.95 s, tepat ketika jadual "Hasil ACD" diisi.
- **Tuntutan:** ayat kit lama "Ini menjimatkan masa menyediakan ringkasan" tidak lagi disuarakan. Ayat baharu menunjukkan dari mana masa dijimatkan, tanpa menyebut angka penjimatan.

#### 5. Narasi kelebihan (02:04–02:13)
- **Teks:** "Rekod di telefon, kiraan liputan automatik, pengesahan dan ringkasan. Sistem membantu merancang lawatan susulan."
- **Masa:** satu klip, 124.95–133.29 s. Ia bermula ketika kad pertama naik ke tengah (124.63–125.13 s, bahagian 9) dan tamat 1.0 s sebelum narasi penutup (134.30 s).
- **Sari kata (fail SRT sahaja):** dua bahagian, b1 124.85–130.15 s dan b2 130.17–133.69 s.
- **Muzik:** direndahkan 10 dB sepanjang bacaan. Suara 13.8–15.7 LU di atas muzik.
- **Babak kelebihan:** dipanjangkan 1.9 s (kini 124.5–133.75 s) supaya bacaan muat sebelum penutup.

#### 6. Kelipan panel kanan "Ringkasan e-ACD" (Kg. Ketoyong, 01:44–02:04)

**Punca dalam V8.** Pratonton sumber dan MP4 V8 menunjukkan perkara yang sama, jadi puncanya pada animasi, bukan pada pengekodan.
1. **Sorotan kad "12 Berkunci / kosong"** hidup, padam dan hidup semula, setiap kali dalam satu bingkai (V8: 107.30, 109.80 dan 115.32 s). Kad "6 Belum dilawati" juga hidup dalam satu bingkai (104.25 s).
2. **Senarai "Lawatan susulan dirancang"** membuka ruang 252 px dalam 0.25 s (112.35 s), jadi bahagian bawah panel melompat.
3. **Pembukaan panel:** panel ditatal 372 px dengan pantas pada permulaan babak. Tatal (transform) dan pembesaran ringkasan (susun atur) dibundarkan secara berasingan. Akibatnya, blok di bawahnya bergerak tidak sekata dan undur ≈ 0.9 px (MP4 V8, 102.58 s). Draf pertama V9 juga melompat 1.84 px ketika panel berhenti, kerana tinggi akhirnya ditukar kepada `auto`.
4. **Tolakan kamera perlahan 5 %** (V8: 116.5–121.6 s) menggerakkan teks panel secara sub-piksel. Dalam MP4, baris teks melompat satu piksel pada bingkai yang berlainan. Akibatnya panel kelihatan bergetar tepat ketika ia sepatutnya dibaca.

**Pembaikan V9:**
1. **Sorotan kad 6 dan 12** naik sekali sahaja, dengan pudar 0.3 s, pada detik babak (106.77 s dan 109.77 s). Kedua-duanya kekal hingga babak tamat.
2. **Ruang senarai disediakan sejak awal babak**, jadi tinggi susun atur tetap. Senarai muncul di tempatnya dengan pudar 0.55 s sahaja; gelongsor 8 px dibuang kerana dalam MP4 ia bergerak selangkah satu piksel. Baris "Semak semula status · 12 premis" (117.4 s) juga mengisi ruang yang sudah disediakan. Tajuk dan kad angka tidak bergerak.
3. **Pembukaan panel ialah satu gerakan lancar (0.8 s).**
   - Tatal kini mengikut susun atur (`top`), bukan transform.
   - Tatal dan pembesaran bergerak bersama dalam piksel penuh, dan berakhir tepat pada tinggi sebenar.
   - Hasilnya, setiap blok bergerak satu arah sahaja (kad dan butang naik 372 px, blok bawah turun 263 px) dan berhenti tanpa lompatan.
4. **Tolakan kamera dibuang.** Paparan ditahan pegun dari 105.55 s hingga hujung babak. Titik pasukan masih bergerak di peta, jadi gambar tidak kaku.
5. **Nod kiri (berkaitan):** "6 belum dilawati" dan "12 berkunci / kosong" kini pudar 0.3 s; dalam V8 ia bertukar dalam satu bingkai. Rupa akhirnya sama dengan V8. Nod 12 masih menyala dua kali, kerana setiap kali mengikut narasi: "12 direkodkan…" dan "premis yang selebihnya".
6. **Kotak sari kata (berkaitan):** kini kekal legap antara sari kata berturutan. Dalam V8, kotak itu malap kepada 0.60–0.77 kelegapan pada 9 pertukaran, dan berkelip penuh sekali (w2 → w3). V9 mempunyai 18 pertukaran berturutan, jadi tanpa pembaikan ini kelipan kotak akan bertambah. (Draf 2: sari kata dibuang daripada filem, jadi perkara ini tidak lagi kelihatan.)

Bukti ujian ada dalam bahagian "Keputusan semakan V9" (H1–H3 pada pemain, dan `tools/check-mp4-panel.py` pada MP4).

#### 7. Jam filem V9 (02:21.4)

| Segmen | V8 | V9 | Sebab |
|---|---|---|---|
| Aliran pembukaan | 0–6.5 s | 0–7.5 s | empat ayat pendek (+1.0 s) |
| Borang manual → hentakan tajuk | 6.5–16.35 s | 7.5–18.85 s | c02/c03 selepas ayat pembukaan (+1.5 s) |
| Tajuk → NADI → telefon → pengesahan | 16.35–87.95 s | 18.85–90.45 s | sama panjang |
| Sisipan WhatsApp | 87.95–101.95 s | 90.45–104.45 s | sama panjang |
| Susulan Kg. Ketoyong | 101.95–122.0 s | 104.45–124.5 s | sama panjang |
| Kad kelebihan | 122.0–129.35 s | 124.5–133.75 s | narasi kelebihan (+1.9 s) |
| Penutup | 129.35–137.0 s | 133.75–141.4 s | sama panjang |

#### 8. Narasi
- **Klip baharu:** 10 klip ElevenLabs "Ahmad" (`eleven_v4`), 2 take setiap satu:
  - a1–a4;
  - n1 ("Inilah Nadi Muallim.");
  - p1;
  - c07n, c09n, c10n;
  - b1b2.
- **Klip lain:** 14 klip V8 dikunci pada take yang sama.
- **Jumlah:** 24 klip untuk 29 sari kata.
- **Kredit ElevenLabs V9:** ≈ 1,130–1,170 (1,126 aksara dijana, ditambah satu take c02s yang tersekat dan mungkin turut dicaj). Termasuk dalam angka ini ialah versi pendek c02s/c03s yang akhirnya tidak digunakan, kerana filem dipanjangkan.
- **Jumlah keseluruhan V8 + V9:** ≈ 4,030–4,070 kredit. Angka ini dikira daripada bilangan aksara; ia perlu disahkan pada akaun ElevenLabs.

#### 9. Kad kelebihan dalam orbit, fokus satu demi satu (draf 2, 02:04–02:13)

**Analisis rujukan.** Video Threads yang diberi ialah promosi 32.5 s (960 × 720, 24 fps) untuk aplikasi "OneLid", dibina dengan Three.js. Ia dianalisis bingkai demi bingkai: helaian 2, 8 dan 24 bingkai sesaat, serta penjejakan warna untuk mengukur gerakan.

| Elemen terapung | Masa | Gerakan |
|---|---|---|
| Kad UI 3D (notifikasi "Claude Code", panel tetapan) | 3.5–6 s, 8.5–17.5 s | terapung di udara, condong 3D, hanyut perlahan (≈ 20 px/s) |
| Ikon satelit (logo Claude, OpenAI, potret), torus, sfera dan kiub kecil | 14.2–17.4 s | mengorbit panel lawan arah jam: jejari ≈ 35 px, ≈ 4–5 s sepusingan; membesar ≈ 11 % di bahagian depan (orbit condong 3D); objek di luar satah fokus dikaburkan |
| Fokus panel | 16.8–17.4 s | garis cahaya putih dan zum ≈ 5 % |
| Lencana "Low Battery", "Too Hot", "Stopped: Battery 10%" dan tanda "?" | 18.0–19.0 s | masuk satu demi satu, ≈ 0.4 s berselang; terbang masuk dalam 0.15–0.25 s, perlahan di hujung, dengan kabur gerakan |
| Huruf "Z z" | 2–4 s | naik dan berpusing perlahan |
| Peralihan | 6.5, 12.9, 17.5, 21.5 s | sapuan kamera pantas dengan kabur gerakan |

**Reka bentuk dalam V9:**
- **Orbit:** empat kad terapung pada orbit elips di sekeliling tengah bingkai, lawan arah jam, satu pusingan setiap 18 s.
  - Kad di belakang lebih kecil (0.42×), malap dan kabur ≈ 2.3 px.
  - Kad di depan lebih besar (0.62×) dan tajam.
  - Setiap kad turun-naik perlahan (±9 px) dan condong menghadap tengah.
- **Fokus:** pada frasa narasinya, kad meninggalkan orbit 0.2 s sebelum perkataan dan tiba di tengah dalam 0.55 s pada saiz penuh, dengan cahaya putih lembut seperti fokus panel dalam rujukan. Kad sebelumnya kembali ke tempatnya pada orbit pada masa yang sama.
- **Kad yang difokuskan pegun** pada piksel penuh dan skala 1, supaya teksnya tajam. Gerakan sub-piksel membuat teks bergetar, seperti yang berlaku pada panel dalam draf 1.

| Kad | Frasa narasi (mula) | Ke tengah | Di tengah (pegun) |
|---|---|---|---|
| Rekod ACD pada telefon | "Rekod di telefon," 124.95 s | 124.60–125.15 s | 125.15–126.31 s |
| Kiraan liputan automatik | "kiraan liputan automatik," 126.51 s | 126.31–126.86 s | 126.86–128.13 s |
| Pengesahan dan ringkasan | "pengesahan dan ringkasan." 128.33 s | 128.13–128.68 s | 128.68–130.37 s |
| Perancangan lawatan susulan | "Sistem membantu merancang lawatan susulan." 130.57 s | 130.37–130.92 s | 130.92–133.24 s (babak mula pudar) |

- **Masa frasa:** dibaca daripada tenaga jalur frekuensi (bingkai 20 ms) dalam `narasi-v9.wav`.
  - "Sistem" bermula pada 130.57 s. Suara menarik nafas dahulu (130.18–130.46 s), jadi sempadan sari kata b2 (130.17 s) bukan permulaan perkataan.
- **Saiz kad:** kad dilukis pada saiz fokus (600 × 360 px, tajuk 46 px) dan dikecilkan pada orbit.

#### 10. Sari kata dibuang daripada filem (draf 2)
- **Yang dibuang:** kotak sari kata dan bayangnya, dalam pemain dan MP4, serta butang "Sari Kata" dan kekunci S.
- **Yang kekal (sebagai data sahaja):** masa sari kata. Ia digunakan untuk mengukur keseimbangan suara dengan muzik (E4) dan untuk fail `sari-kata-bm-v9.srt` yang berasingan.
- **Kesan pada gambar:** bahagian bawah bingkai kini kosong. Tiada elemen lain dianjak.

#### 11. Peralihan borang manual → kad tajuk → NADI tanpa sentakan (draf 3)

**Punca (diukur pada MP4 draf 2, bingkai demi bingkai):**
1. **Gambar beku 2 s (16.0–18.0 s):** selepas "14" ditaip, kamera berhenti sepenuhnya sementara narasi masih berjalan. Gambar yang beku sambil bunyi terus berjalan kelihatan seperti video tersekat.
2. **Dua peralihan bertindih:**
   - Babak manual undur dan pudar ke gelap (18.55–18.73 s).
   - Jata dan tajuk muncul di atas latar gelap kira-kira 0.15 s *sebelum* hentakan.
   - Pada hentakan (18.85 s), latar teal muncul dalam satu bingkai dan kilat 0.9 menyala serta-merta: perubahan 8.2 dalam satu bingkai.
   - Punca teknikal: animasi ini menggunakan jam cerita, yang menukar kelajuan ×1.66 betul-betul pada hentakan.
3. **Kad tajuk → peta:** tajuk hilang dahulu dan peta masuk kemudian, jadi skrin hampir hitam selama ≈ 0.1 s (22.25–22.32 s).
4. **Bingkai berat dalam pemain:** bingkai paling berat ialah semasa babak manual undur sambil pudar (18.1–18.4 s), dan ini boleh menjatuhkan bingkai ketika dimainkan secara langsung.

**Pembaikan (semuanya pada jam filem, jadi tidak terjejas oleh perubahan kelajuan jam cerita):**
1. **Tiada lagi berhenti mati:** kamera terus menolak perlahan ke sel "14" (laju bertambah perlahan-lahan). Sel itu tidak beranjak sambil dibaca (0 px dari 11.85 hingga 12.33 s cerita).
2. **Resapan terus ke tajuk:**
   - Babak manual larut terus ke dalam tajuk (0.45 s sebelum hentakan), sambil kamera terus ke hadapan.
   - Latar teal masuk di bawahnya lebih awal (0.85–0.4 s sebelum hentakan), jadi tiada bingkai gelap.
   - Tajuk naik dengan satu lengkung lembut, penuh pada hentakan, dan stabil pada 19.30 s.
   - Kilat diganti dengan cahaya lembut (puncak 0.35, naik dalam 4 bingkai).
3. **Cahaya menyapu tajuk:** jalur cahaya menyapu huruf "NADI Muallim" semasa narasi menyebutnya (20.7–21.8 s). Huruf tidak bergerak, jadi tiada getaran teks.
4. **Tajuk → peta:** peta mula masuk 0.2 s lebih awal dan bertindih dengan tajuk yang keluar. Latar teal kekal sehingga peta hampir penuh.

**Bukti (pemain; semakan V4 dan V13):**

| Ukuran | Draf 2 | Draf 3 |
|---|---|---|
| Bingkai beku semasa "tahan" selepas menaip | 100 | **0** |
| Lompatan terbesar satu bingkai (kilat) | 0.9 | **0.11** |
| Liputan latar semasa babak manual → tajuk (1 = tiada gelap) | 0.005 | **1.00** |
| Liputan latar semasa tajuk → peta | 0.23 | **0.99** |

#### 12. Latar 3D fotorealistik: imej Google Earth dengan kubah 200 m dan putaran (draf 3, 0:22–0:30)

**Sejarah keputusan:**
1. Google Earth Studio dipilih pada mulanya.
2. Pengguna kemudian meminta kampung 3D hipotetikal. Versi prosedural itu siap, tetapi tidak dirender ke MP4; sumbernya disimpan dalam pad kerja (`v9-draf3-prosedural/`).
3. Pengguna akhirnya memberi tangkapan Google Earth dan meminta putaran "dari kanan ke kiri".
4. Tangkapan pertama terlalu dekat: bulatan 200 m sebenar melimpah keluar dari tepi imej. Pengguna memberi tangkapan kedua yang lebih luas, dan itulah yang digunakan.

**Lokasi dan skala sebenar.** Kubah tidak diletak dengan mata.
- Tangkapan dipadankan secara automatik dengan peta satelit V6 (`assets/peta-glob.jpg`, skala 100 m = 106 px):
  - 568 padanan SIFT;
  - homografi tanah dengan ralat median 2.3 px.
- Pusat kubah ialah pusat bulatan wabak peta GIS PKD, sama seperti bulatan 200 m pada pembukaan V6. Ia titik tengah antara kes, bukan rumah kes.
- Jejari kubah ialah 200 m pada skala tanah sebenar.
- Pada tangkapan ini, bulatan 200 m meliputi kampung yang berlongkang (garisan gelap itu longkang dalam imejan, seperti dalam V6).

**Kamera dipulihkan daripada foto** (`tools/make-aerial-camera.py`):
- Homografi diurai menjadi kamera lubang jarum.
- Titik prinsipal dipilih supaya penguraian tepat: (1182.5, 674), iaitu di kanan dan di bawah pusat imej. Ini konsisten dengan tangkapan yang dipotong butang kawalan dan bar bawah Google Earth.
- Panjang fokus: f = 2283 px.
- Kamera: ±783 m di udara, 1.4 km ke timur, memandang ke barat 32.5° di bawah ufuk.
- Ralat kamera berbanding homografi ≤ 0.26 px dalam ±300 m.

**Cara 3D dibina (`src/kampung3d.js`, three.js r158, MIT):**
- **Tanah:**
  - Foto diunjur semula ke satah tanah melalui kamera asalnya.
  - Pada putaran 0°, kanvas mengulang foto asal dengan korelasi 0.998; bezanya hanyalah gred warna.
  - Gred: ketepuan −10 % dan sedikit hangat.
  - Penajaman ringan untuk pembesaran 1.3×.
  - Vinyet lembut di sekeliling kubah.
- **Putaran:**
  - Kamera berputar mengelilingi paksi menegak melalui pusat wabak, −6° → +20° (26°) dalam 8 s, sambil mendekat 4 %.
  - Bahagian depan bergerak dari kanan ke kiri, dan pusat kubah kekal di tempatnya (610, 640).
  - Gerakan sudah bermula semasa panel muncul dan masih bergerak semasa panel keluar, jadi tiada hentian.
  - Untuk arah sebaliknya, terbalikkan `K3D_SHOT.turn`. Liputan foto pada arah itu perlu disemak semula.
- **Liputan:** foto melitupi setiap piksel yang kelihatan sepanjang putaran.
  - Hanya jalur ±30 px di sekeliling kad (bucu termasuk) berada di luar foto. Jalur ini diisi foto bercermin di bawah kabus.
  - Semakan K3 menguji kedua-dua hujung putaran.
- **Kubah dan elemen 3D:**
  - Hemisfera kaca jingga 200 m dengan tepi bercahaya.
  - Denyutan setiap 1.6 s: gelombang terang naik dari tanah ke puncak.
  - Cakera tanah dengan garis tepi 200 m, dan tiga gelang mengembang.
  - Label "Kg. Ketoyong · 4 kes" mengikut puncak garis kubah, dan "Kawasan wabak · radius 200 m" mengikut tepi gelang yang dekat.
  - **Tiada pin rumah kes**, sama seperti V6.
- **Penyepaduan:**
  - Kanvas menutup bahagian panel peta NADI yang kelihatan (1708 × 1013 px).
  - Peta 2D disembunyikan untuk 22.0–29.9 s, dan kembali untuk babak susulan.
  - Label sistem (atas kiri) menjadi "Kad lokaliti · imej udara".
  - Kredit "Imej: Google Earth · ©2026 Airbus, CNES / Airbus, Maxar Technologies" di bawah kiri.
- **Luar talian:**
  - Foto (`assets/udara-3d.jpg`, 1.0 MB) dan three.js dibenamkan dalam HTML, yang kini 7.8 MB.
  - Pemain tidak memuatkan apa-apa dari rangkaian.
  - Adegan dibina semasa pemain dimuat, supaya tiada sangkut pada 0:22.
- **Kos render:** ±0.4 s tambahan setiap bingkai 3D pada WebGL perisian. Kampung prosedural memerlukan ±1.7 s.

#### 13. Pemain HTML berdiri sendiri, resolusi skrin (HD / 4K)

- **Satu fail.** `video-showcase-v9.html` (7.8 MB) memuatkan semua fon, imej, three.js, muzik dan narasi.
  - Dibuka terus daripada fail (`file://`), tanpa pelayan dan tanpa rangkaian. Semakan A1: 0 permintaan.
  - Diuji dalam Chromium. Chrome dan Edge terkini disyorkan; Firefox dan Safari belum diuji.
- **Pentas vektor.** Pentas 1920 × 1080 ialah DOM yang diskalakan mengikut tetingkap. Teks, ikon dan SVG sudah dilukis pada resolusi skrin.
- **Kanvas WebGL ikut resolusi skrin.** Glob pembukaan dan imej udara 3D kini juga dilukis pada resolusi skrin, bukan pada 1× lalu dibesarkan.
  - Skala = skala pentas × `devicePixelRatio`, dalam langkah 0.25 dari 1 hingga 3.
  - TV 4K dalam skrin penuh = 2×. Paparan Retina 1920 × 1080 = 2×.
  - Skala dikemas kini apabila tetingkap diubah saiz atau dialih ke skrin lain.
- **Ukuran pada 2×.** Dibandingkan dengan 1× yang dibesarkan, tenaga perincian halus (Laplacian) ialah:

  | Kawasan | Gandaan |
  |---|---|
  | Teks DOM (kad aliran, kad lokaliti, label 3D, telefon) | 4.1–5.6× |
  | Glob WebGL | 5.7× |
  | Kubah + foto | 1.7× (dihadkan oleh foto sumber) |

  Tangkapan pada 3840 × 2160 dan pada DPR 2 memberi nilai yang sama.
- **MP4 tidak berubah.** Eksport dan semakan kekal pada 1×. Lapan bingkai ujian (glob, imej 3D, telefon, penutup) sama bait demi bait dengan binaan sebelum HD.
- **Had resolusi.** Tiga bitmap terhad oleh resolusi sumbernya, jadi pada 4K ia lebih lembut daripada teks:
  - foto Google Earth (2000 × 1253, dipaparkan 1.3×);
  - tekstur glob (2048 × 1024);
  - Jata Negara (176 × 133).

  Untuk imej udara yang lebih tajam, ambil tangkapan Google Earth yang sama pada ≥ 3840 px, kemudian daftar semula dengan `tools/make-aerial-camera.py`. Pemalar `K3D_CAM` akan dikira semula.
- **Pembentangan:**
  1. Buka fail.
  2. Tekan **F** untuk skrin penuh dan **C** untuk mod bersih (tanpa bar kawalan; Esc keluar).
  3. Klik pertama mengaktifkan bunyi. **Ruang** untuk main atau jeda.

### Keputusan semakan V9

`node tools/check-player.js` menjalankan 87 semakan, dan **87/87 lulus** pada pemain akhir (draf 3, imej Google Earth). Semakan yang baharu atau dikemas kini:

| Semakan | Bukti |
|---|---|
| A3 / A4 | 141.4 s × 60 = 8,484 bingkai; segmen 0 · 18.6 · 29.8 · 54.5 · 67.5 · 83.5 · 90.45 · 104.45 · 124.5 · 133.75 · 141.4. |
| C3 | 29 sari kata: 18 kit (c07/c09/c10/c14/c15 teks baharu), 3 WhatsApp di dalam sisipan, dan 8 baris V9. Semuanya pada masa dalam `penempatan-v9.json`. |
| V4 | Draf 3: menaip selesai pada 11.85 s cerita; kamera terus menolak perlahan hingga resapan (0 bingkai beku), dan sel "14" kekal di tempatnya (0 px). |
| V13 | Draf 3: borang manual → tajuk → peta NADI. Setiap lapisan berubah ≤ 0.12 sebingkai (maksimum 0.112), dan liputan latar 1.00 / 0.99 (tiada celah gelap). |
| K3 | Draf 3: imej Google Earth dalam 3D menutup panel peta yang kelihatan (1708 × 1013 px; foto 2000 × 1253; kredit Google Earth; label "imej udara"). Peta 2D disembunyikan, dan kembali pada 95 s. Kubah 200 m pada pusat wabak kekal pada (610, 640) dari bingkai kelihatan pertama (22.07 s) hingga terakhir (29.83 s). Putaran kelihatan 25.7°, dan titik depan bergerak 294 px ke kiri. Foto melitupi 1,849/1,849 titik sampel yang kelihatan pada kedua-dua hujung. |
| C5 | Draf 2: tiada sari kata dalam filem. Tiada kotak atau bayang sari kata dalam halaman, dan tiada satu pun daripada 29 baris dipaparkan pada masanya. |
| F7 | Draf 2: tiada butang "Sari Kata", dan kekunci S tidak mengubah keadaan pemain. |
| N1 | Fail SRT: setiap kiu meliputi perkataannya, dari sebelum ia diucapkan hingga ≥ 0.2 s selepasnya (≥ 0.1 s jika baris seterusnya menyusul serta-merta). |
| N2 | Setiap baris bermula pada detiknya atau ≤ 1.5 s kemudian (c02 +1.39 s dan c03 +2.07 s, selepas ayat pembukaan); jarak ≥ 0.25 s; "84 peratus" tepat pada detiknya. |
| N4 | Ayat baharu tepat pada gambarnya: a1–a4 pada kad 1–4; n1 1.0 s selepas tajuk stabil; c04 0.08 s selepas peta mendarat; p1 dengan kad dua petugas; c07 0.3 s sebelum ketikan status; c09 pada Simpan (0.00 s); c10 pada jadual (0.00 s); b1 bermula ketika kad pertama naik ke tengah (124.63–125.13 s); b2 tamat 1.0 s sebelum penutup. |
| T1 / T2 | Tajuk dua baris, "masing-masing" utuh, 185 px dari telefon dan 44 px di atas kad contoh. Kad dua petugas (Premis Contoh 012 dan 027) dipaparkan penuh sepanjang ayat p1. |
| H1 | Panel "Ringkasan e-ACD" (104.45–124.5 s): sorotan 6 dan 12 naik sekali dan tidak pernah turun; senarai dan baris semakan semula pudar masuk sekali; tinggi ruang senarai tetap (139 px CSS); 0.00 px pergerakan selepas panel dibuka. |
| H2 | Draf 2, orbit: kad yang tidak difokuskan bergerak dalam setiap bingkai (0 bingkai pegun daripada 1,449), lawan arah jam (0 langkah ikut arah jam). Di belakang lebarnya 258 px dan kabur 2.3 px; di depan 361 px dan kabur 0.2 px. |
| V10 | Draf 2: kad 1–4 masing-masing difokuskan — di tengah, skala 1, tajam dan bercahaya — dari ≤ 0.4 s selepas frasanya bermula hingga frasa seterusnya; keempat-empat kad kekal kelihatan (≥ 0.62) di dalam bingkai; kad 4 bertanda Prototaip Integrasi. |
| N5 | Draf 2: empat detik fokus ialah permulaan frasa dalam `narasi-v9.wav`. Sebelum detik −64.6 hingga −46.2 dBFS (senyap); dalam 0.25 s selepasnya −18.1 hingga −19.8 dBFS (suara). |
| H3 | Nod kiri: 6 menyala sekali, 12 dua kali, setiap satu dengan pudar (langkah maksimum 0.15 sebingkai). |
| H4 | Pembukaan panel: kad dan butang naik 371.8 px, blok bawah turun 263.1 px, 0 langkah undur, 0 px perubahan selepas tamat (V8: 1 langkah undur). |
| E4 | Muzik direndahkan 9 dB (pembukaan), 14 dB (crescendo) dan 10 dB (lain-lain); 0 dB pada hentakan tajuk; suara 11.8–22.3 LU di atas muzik dalam setiap sari kata. |
| E3 / E9 | Program −16.0 LUFS, puncak −2.8 dBFS; limiter induk 0 dB. |

**Pengesahan MP4 draf 3** (`NADI-Muallim-Pitch-141s-v9.mp4`, imej Google Earth; render 17 min 49 s):
- **ffprobe:** H.264 High 1920 × 1080 yuv420p bt709, 60/1, 8,484 bingkai, 141.400 s; AAC 48 kHz 2 saluran, 141.400 s.
- **Audio:**
  - −16.0 LUFS, LRA 4.9 LU (tidak berubah).
  - Narasi hadir dalam semua 29 tetingkap kiu: r = 0.930–0.974, lag 0.00 ms.
- **0:16–0:31 bingkai demi bingkai** (`mp4-seg-curve`):
  - Tiada regangan beku ≥ 0.5 s. Draf 3a ada empat (23.05 s selama 1.27 s, 24.33 s selama 1.98 s, dan lain-lain), kerana peta 2D statik.
  - Tiada lonjakan, dan tiada kelipan A-B-A.
  - Perubahan dalam 22.5–29.0 s ialah 0.8–1.4 aras kelabu sebingkai (draf 3a: 0.00–0.01), iaitu putaran dan denyutan berterusan.
  - Puncak pada 22.0 s ialah resapan tajuk → imej udara. Puncak pada 29.5 s ialah peralihan yang disengajakan ke telefon pada 29.80 s.
- **Denyutan kubah:** kecerahan kawasan kubah pada 23.0–29.4 s berulang setiap **1.600 s** (autokorelasi 0.74), sama seperti reka bentuk.

**Pengesahan MP4** (`NADI-Muallim-Pitch-141s-v9.mp4`, draf 2):
- **ffprobe:** H.264 High 1920 × 1080 yuv420p bt709, 60/1, 8,484 bingkai, 141.400 s; AAC 48 kHz 2 saluran, 141.400 s.
- **Kenyaringan:** −16.0 LUFS, LRA 4.9 LU, puncak −2.7 dBFS (sama seperti draf 1; audio tidak diubah).
- **Kehadiran narasi:** dalam setiap 29 tetingkap kiu, audio MP4 berkorelasi dengan narasi pada r = 0.930–0.996, dengan lag 0.00 ms.
- **Rangkaian:** 0 permintaan.
- **Tiada sari kata:** di kawasan sari kata lama, pada titik tengah setiap 29 kiu, draf 1 mempunyai teks sari kata (ketumpatan tepi teks 1.3–6.4 %), manakala draf 2 tidak (0.0–1.9 %).
  - 10 titik melebihi 1 %, dan kesemuanya disemak dengan mata: ia teks antara muka babak itu sendiri, iaitu panel "Kawalan Kesihatan Awam", medan borang telefon, bar tab telefon dan jadual WhatsApp.
- **Kad dalam fokus (draf 2):** di kawasan teks kad pada tengah bingkai, setiap tempoh fokus tiada perubahan langsung (64/64, 71/71, 98/98 dan 134/134 bingkai tidak berubah), dan tiada kelipan.
- **Kestabilan panel** (`tools/check-mp4-panel.py`, babak susulan, 19.45 s pada 60 fps; V8 102.25–121.7 s berbanding V9 104.75–124.2 s):

| Kawasan | Ukuran | V8 MP4 | V9 MP4 |
|---|---|---|---|
| Panel kanan, atas | kelipan ketika pegun (A-B-A / A-B-B-A) | 4 | **0** |
| | perubahan dalam satu bingkai | 145 (sorotan, lompatan senarai, getaran zoom) | **3** (klik butang ×2, bingkai akhir pembukaan panel) |
| | bingkai tanpa perubahan | 766 / 1,166 | **1,032 / 1,166** |
| Panel kanan, bawah | kelipan / getaran undur / perubahan satu bingkai | 2 / 1 / 38 | **0 / 0 / 1** |
| Nod kiri 92 / 12 / 6 | perubahan dalam satu bingkai | 6 | **0** |

  - **Corak A-B-A semasa pembukaan panel (0.6 s) tidak dikira sebagai kelipan.** Ia datang daripada baris teks yang bergerak. Penjejakan jalur menunjukkan setiap blok bergerak satu arah sahaja (semakan H4).
  - **Kursor penyelia** dikenal pasti sebagai objek bergerak, bukan kelipan.
- **Sumber berbanding MP4:** PSNR panel antara tangkapan pemain dan bingkai MP4 ialah 45.7–46.8 dB pada 6 titik (105.5–121.7 s), jadi kedua-duanya sama secara visual.

### Perkara untuk perhatian (V9)

- **Ejaan "analisa" (c14):** ejaan baku DBP ialah "analisis". Teks dikekalkan seperti yang diminta dalam V8. Untuk menukarnya, klip c14c15 perlu dijana semula.
- **Sebutan:** belum disemak secara automatik, kerana tiada ASR setempat. Sila dengar terutamanya "Muallim", "Ketoyong", "diisytiharkan" dan "masing-masing".
- **Panjang:** 02:21.4, melebihi 02:17 dalam permintaan asal. Semak had masa pertandingan, jika ada.
- **Tuntutan dalam skrip:**
  - "Borang kertas tidak perlu dibawa untuk tugas ini" (c08, teks kit) masih disuarakan.
  - Ayat penjimatan masa (c10 lama) telah diganti.
  - Tiada angka penjimatan, kadar ralat atau penggantian kertas dalam filem.
- **Lesen:** seperti V8, semak syarat pelan ElevenLabs untuk suara pustaka, dan sama ada pertandingan mewajibkan pendedahan suara AI. Perkara ini perlu disahkan.
- **Tanpa sari kata (draf 2):** penonton yang menonton tanpa bunyi tidak akan mendapat narasi. Jika filem dimuat naik ke platform yang menyokong sari kata tertutup (contohnya YouTube), fail SRT boleh dimuat naik berasingan.
- **Masa bacaan kad (draf 2):** kad 1–3 pegun di tengah selama 1.2–1.7 s, dan kad 4 selama 2.3 s. Tajuk mudah dibaca, tetapi baris keterangan mungkin tidak sempat dibaca sepenuhnya, kerana kad mengikut rentak narasi.
- **Hak imej Google Earth (draf 3):** pengendalian sama seperti V6.
  - Kredit pada skrin: "Imej: Google Earth · ©2026 Airbus, CNES / Airbus, Maxar Technologies". Pembekal imejan disalin daripada kredit Google Maps V6 bagi kawasan yang sama, kerana bar atribusi tidak ada dalam tangkapan yang diberi. Sila samakan dengan teks yang tertera di bahagian bawah Google Earth semasa tangkapan dibuat.
  - Penggunaan awam (contohnya dimuat naik untuk pertandingan) tertakluk kepada syarat Google Maps/Earth. **Ini perlu disahkan.**
- **Lokasi sebenar (draf 3):** imej menunjukkan pekan sebenar, dan kubah berada pada pusat wabak GIS. Seperti V6, hanya kawasan 200 m ditanda. Tiada pin, label atau garisan rumah kes.
- **WebGL (draf 3):** pemain HTML memerlukan WebGL untuk imej udara 3D. Tanpa WebGL, peta 2D ditunjukkan; MP4 sentiasa menggunakan imej 3D. Pada komputer tanpa pecutan grafik, 0:22–0:30 mungkin bermain perlahan dalam pemain.
- **Rangkaian (draf 2):** untuk memuat turun video rujukan, empat hos ditambah pada environment "PKD Muallim denggi": `www.threads.com`, `static.cdninstagram.com`, `scontent-ord5-1.cdninstagram.com` dan `scontent-ord5-2.cdninstagram.com`. Filem sendiri tidak memanggil mana-mana hos, dan keempat-empatnya boleh dibuang jika tidak diperlukan lagi.

### Bina, semak dan render (V9)

```bash
python3 -I tools/place-narration-v9.py . --take a1=A --take a2=B --take a3=B --take a4=A --take c02=B --take c03=A --take n1=B --take c04=A --take c05c06=A --take p1=B --take c07n=B --take c08=B --take c09n=A --take c10n=A --take c11=A --take c12=B --take c13=B --take w1=B --take w2=B --take w3=A --take c14c15=A --take c16c17=B --take b1b2=A --take c18c19=A
#   → narasi-v9/narasi-v9.wav + penempatan-v9.json (24 take V9 dikunci; take V8 kekal sama)
THREE_JS=/path/to/three.min.js TAILWIND_BIN=/path/to/tailwindcss node tools/build-player.js   # → video-showcase-v9.html (narasi + three.js r158 terbenam; enggan menulis atas v2–v8)
#   THREE_JS boleh ditinggalkan selepas `npm install` (devDependency three 0.158.0 → node_modules/three)
node tools/make-docs.js                                         # → sari-kata-bm-v9.srt
node tools/check-player.js                                      # 87 semakan automatik (±15 minit; WebGL perisian)
node render-video.js                                            # → NADI-Muallim-Pitch-141s-v9.mp4 (+ ffprobe, semakan kehadiran narasi)
python3 -I tools/check-mp4-panel.py NADI-Muallim-Pitch-141s-v9.mp4 104.75 124.2                                       # panel kanan (atas)
python3 -I tools/check-mp4-panel.py NADI-Muallim-Pitch-141s-v9.mp4 104.75 124.2 --box 1324,860,352,156 --bands 868:1012  # panel kanan (bawah, di luar sari kata)
python3 -I tools/check-mp4-panel.py NADI-Muallim-Pitch-141s-v9.mp4 104.75 124.2 --box 48,488,644,152                    # nod kiri 92 / 12 / 6
```

Jika masa sari kata berubah (contohnya selepas `--take`), salin jadual `captions` daripada `penempatan-v9.json` ke `NARR_CAPTIONS` dalam `src/data.js`. Semakan C3 akan gagal sehingga kedua-duanya sama.

## Dokumentasi V8 (137 s, bernarasi ElevenLabs, disimpan untuk perbandingan)

Filem 02:17.000 (1920 × 1080, 60 fps, 8,220 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V8 ialah gambar V7 yang sama, dengan narasi suara ElevenLabs bagi 21 baris sari kata V7. Baris pada 1:44 diolah semula atas permintaan (lihat bahagian 6). Keputusan yang diminta:
- **Suara:** Ahmad (ElevenLabs, model `eleven_v4`).
- **Skrip:** sari kata V7. Teks suara diambil daripada medan `say` dalam `src/data.js`, iaitu sari kata yang sama. Angka disebut dalam perkataan seperti skrip suara asal, dan "NADI" ditulis "Nadi" supaya tidak dieja huruf demi huruf.
- **Masa:** baris dianjak dalam 137 s. Panjang filem, gambar dan masa babak tidak berubah.

Semua rekod, nama dan angka ialah **data simulasi**. Pemain dan MP4 tidak memanggil ElevenLabs, aplikasi langsung, Google Sheets, peta atau WhatsApp. Narasi dijana sekali sahaja dan dibenamkan dalam pemain.

### Fail V8 (untuk dihantar)

| Fail | Kegunaan |
|---|---|
| `NADI-Muallim-Pitch-137s-v8.mp4` | Filem akhir V8: H.264 High 1920 × 1080, CFR 60 fps, 8,220 bingkai, 137.000 s; AAC 48 kHz stereo; narasi Ahmad + muzik latar dan kesan bunyi. Saiz 55.3 MB. |
| `video-showcase-v8.html` | Pemain HTML kendiri luar talian, dengan narasi terbenam sebagai FLAC tanpa kehilangan. Kekunci 1–9 dan 0 untuk 10 babak. |
| `sari-kata-bm-v8.srt` | 21 baris sari kata, dengan masa mengikut suara. |
| `narasi-v8/narasi-v8.wav` | Trek narasi 137.000 s (48 kHz mono 16-bit) pada jam filem. |
| `narasi-v8/penempatan-v8.json` | Take yang dipilih, masa setiap baris dan masa sari kata. |
| `narasi-v8/takes/`, `narasi-v8/takes-elevenlabs.json` | Take asal ElevenLabs (2 bagi setiap klip; take lama c14/c15 disimpan sebagai `replaced`), beserta suara, model dan ID penjanaan. |

**Disimpan untuk perbandingan (tidak diubah):** V7 (`NADI-Muallim-Pitch-137s-v7.mp4`, `video-showcase-v7.html`, `sari-kata-bm-v7.srt`), dan V6–V2 seperti dalam dokumentasi di bawah.

### Perubahan V8 berbanding V7

#### 1. Narasi ElevenLabs "Ahmad"
- **17 klip:** baris 5–6, 14–15, 16–17 dan 18–19 dijana sebagai satu ayat setiap satu, supaya intonasinya semula jadi. Setiap klip ada 2 take.
- **Pemilihan take:** dibuat secara automatik. Take yang dipilih ialah yang kadar bercakapnya paling hampir dengan median (4.8 suku kata sesaat) dan muat dalam ruangnya. Untuk menukar take selepas mendengar: `python3 -I tools/place-narration-v8.py . --take c03=B`.
- **Rantaian suara bagi setiap klip:**
  - aras −20 LUFS;
  - pemampat lembut 2.5:1;
  - had puncak suara −6 dBFS, jadi nisbah puncak kepada kenyaringan ≈ 14 dB.

  Akibatnya, limiter induk tidak lagi perlu memotong suara.
- **Kredit ElevenLabs:** 2,106 untuk narasi, 210 untuk ayat baharu 1:44, dan 584 untuk sampel perbandingan suara (jumlah 2,900).

#### 2. Penempatan dalam 137 s
- **Masa mula:** setiap baris bermula pada masa sari kata V7. Tiga baris dianjak kerana baris sebelumnya masih bercakap:
  - baris 2: +1.29 s;
  - baris 4–5: +0.31 s;
  - WhatsApp 2: +0.18 s.

  Ayat baharu 1:44 pula bermula 0.45 s **lebih awal** (lihat bahagian 6).
- **Jarak dan sempadan:** jarak minimum antara baris ialah 0.35 s, dan setiap baris tamat sebelum babaknya tamat.
- **Detik penting:**
  - "Liputannya lapan puluh empat peratus" tepat pada detik V7.
  - Tiga baris WhatsApp berada di dalam sisipan.
- **Jumlah suara:** 77.8 s.

#### 3. Sari kata mengikut suara
- **Masa paparan:** setiap sari kata muncul 0.10 s sebelum suara dan kekal 0.40 s selepasnya. Ia tidak melepasi hujung babak; contohnya, baris 2 tamat pada 16.10 s, sebelum hentakan tajuk.
- **Baris gabungan:** sari kata dipecah pada sempadan perkataan, iaitu pada 29.37 s, 108.44 s, 115.35 s dan 131.40 s.
- **Teks:** sama seperti V7 dan kit, kecuali c14/c15 (bahagian 6). Semakan C8 masih lulus: penyelia memilih "Rancang lawatan susulan" (112.2 s) semasa sari kata "Penyelia menjadualkan…" dipaparkan.

#### 4. Campuran audio
- **Muzik dan kesan bunyi:** sama seperti V7. Ia direndahkan 10 dB di bawah suara, dan 14 dB semasa crescendo babak manual (degupan jantung, detik dan riser), kerana di situlah muzik paling kuat.
- **Hentakan tajuk (16.35 s):** jatuh pada kekuatan penuh, kerana pengecilan dilepaskan dalam 0.25 s sebelumnya. Tanpa pembetulan ini, hentakan jatuh ≈ 5 dB lebih perlahan.
- **Keseimbangan:** suara 11.9–16.4 LU di atas muzik dalam setiap sari kata.
- **Program:** −16.0 LUFS, puncak −2.8 dBFS, dan limiter induk tidak memotong langsung (0 dB).

#### 5. Dikekalkan seperti V7
Gambar, animasi, masa babak, glob peta dan radius 200 m, sisipan WhatsApp, babak manual yang diperlahankan, tahanan liputan yang bergerak, dan panjang 137 s.

#### 6. Baris 1:44 diolah semula (permintaan selepas draf pertama V8)
- **Teks lama (dua baris):** "Enam premis belum dilawati." / "Dua belas direkodkan berkunci atau kosong."
- **Teks baharu (satu ayat):** "Daripada analisa automatik sistem, enam premis belum dilawati, dua belas direkodkan berkunci atau kosong."
- **Sari kata:** "Daripada analisa automatik sistem, / 6 premis belum dilawati," (c14) dan "12 direkodkan berkunci / atau kosong." (c15). Angka ditulis dalam digit seperti permintaan, dan disebut dalam perkataan.
- **Masa:** ayat ini panjangnya 8.2 s, dari 103.45 s hingga 111.65 s. Ia bermula 0.45 s sebelum detik V7, ketika babak susulan sudah dipaparkan. Ini supaya baris "Penyelia menjadualkan…" kekal pada 112.00 s, dan klik penyelia (112.2 s) kekal di bawah sari katanya.
- **Yang lain tidak berubah:** 16 klip lain dikunci pada take yang sama. Trek narasi sama tepat dengan draf pertama di luar 103.3–111.9 s (0 sampel berbeza).

### Keputusan semakan V8

`node tools/check-player.js` menjalankan 77 semakan, dan **77/77 lulus** pada pemain akhir. Semakan yang baharu atau dikemas kini:

| Semakan | Bukti |
|---|---|
| C3 | 18 sari kata kit (teks kit; c14/c15 teks baharu 1:44) + 3 sari kata WhatsApp di dalam sisipan, semuanya pada masa dalam `penempatan-v8.json`. |
| N1 | Setiap sari kata dipaparkan dari sebelum perkataannya hingga ≥ 0.2 s selepasnya (21 sari kata, 17 klip). |
| N2 | Setiap baris bermula pada detik V7 atau ≤ 1.5 s kemudian (ayat 1:44: ≤ 0.5 s lebih awal); jarak ≥ 0.35 s; "84 peratus" tepat pada detiknya. |
| N3 | `narasi-v8.wav` mengandungi suara hanya dalam 17 klip, dan senyap digital di tempat lain. |
| E2 / E8 | Narasi terbenam sebagai FLAC (sha256 sama dengan fail), dan sampel yang dinyahkod sama tepat dengan `narasi-v8.wav`. |
| E4 | Muzik direndahkan 10 dB (14 dB semasa crescendo); 0 dB pada hentakan tajuk; suara ≥ 10 LU di atas muzik dalam setiap sari kata. |
| E9 | Limiter induk ≤ 1 dB (sebenar 0 dB). |
| F2 / F3 | Pemain melaporkan "narasi narasi-v8.wav", dan klik pertama memainkan campuran bernarasi. |

**Pengesahan MP4** (`NADI-Muallim-Pitch-137s-v8.mp4`):
- **ffprobe:** H.264 High 1920 × 1080 yuv420p bt709, 60/1, 8,220 bingkai, 137.000 s; AAC 48 kHz 2 saluran, 137.000 s.
- **Kenyaringan:** −16.0 LUFS, LRA 5.6 LU, puncak sebenar −2.8 dBFS.
- **Kehadiran narasi:** dalam setiap 21 sari kata, audio MP4 berkorelasi dengan narasi pada r = 0.929–0.982, dengan lag 0.00 ms.
- **Rangkaian:** 0 permintaan.
- **Gambar berbanding V7 (35 titik masa):** 14 titik sama bit demi bit. Di titik lain, perbezaan hanya pada kotak sari kata dan bayangnya (sari kata yang dipaparkan mengikut suara), serta hingar pengekodan.

### Perkara untuk perhatian (V8)

- **Sebutan:** belum disemak secara automatik, kerana tiada ASR setempat. Sila dengar terutamanya "Muallim", "Ketoyong", "survelan" dan angka. Mana-mana baris boleh ditukar ke take B atau dijana semula.
- **Lesen:** semak syarat pelan ElevenLabs (Starter) untuk suara pustaka sebelum filem dihantar. Semak juga sama ada pertandingan mewajibkan pendedahan suara AI. Perkara ini perlu disahkan.
- **Tuntutan dalam skrip:** dua baris kit kini disuarakan: "Ini menjimatkan masa menyediakan ringkasan" dan "Borang kertas tidak perlu dibawa untuk tugas ini". Teksnya sama seperti V7, tetapi kini lebih menonjol.

### Bina, semak dan render (V8)

```bash
python3 -I tools/place-narration-v8.py .                       # → narasi-v8/narasi-v8.wav + penempatan-v8.json (daripada narasi-v8/takes)
TAILWIND_BIN=/path/to/tailwindcss node tools/build-player.js   # → video-showcase-v8.html (narasi terbenam; enggan menulis atas v2–v7)
node tools/make-docs.js                                         # → sari-kata-bm-v8.srt
node tools/check-player.js                                      # semakan automatik
node render-video.js                                            # → NADI-Muallim-Pitch-137s-v8.mp4 (+ ffprobe, semakan kehadiran narasi)
```

Jika masa sari kata berubah (contohnya selepas `--take`), salin jadual `captions` daripada `penempatan-v8.json` ke `V8_CAPTIONS` dalam `src/data.js`. Semakan C3 akan gagal sehingga kedua-duanya sama.

## Dokumentasi V7 (137 s, muzik latar, disimpan untuk perbandingan)

Filem 02:17.000 (1920 × 1080, 60 fps, 8,220 bingkai) untuk **Pejabat Kesihatan Daerah Muallim**. V7 ialah V6 dengan tiga perubahan yang diminta:
- tahanan liputan pada 1:13–1:17 (V6) kini bergerak;
- babak pengisian manual diperlahankan kepada ≈ 10 s (6.5–16.35 s);
- susun atur nod "12 berkunci / kosong" dibetulkan.

Setup V6 yang lain dikekalkan. Semua rekod, nama dan angka ialah **data simulasi**. Tiada panggilan ke aplikasi langsung, Google Sheets, peta atau WhatsApp.

### Fail V7 (untuk dihantar)

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

### Perubahan V7 berbanding V6

#### 1. Tahanan liputan kini bergerak (V7 1:14–1:21)

- **Punca.** Dari 71.6 s hingga 77.5 s (masa cerita), kamera sengaja kekal pegun. Peraturan "close-up pegun untuk dibaca" diguna sejak V3. Yang berubah hanya sari kata, jadi ia kelihatan seperti dijeda.
- **Sekarang:**
  - **Kamera menolak perlahan** sebanyak 6% ke kad liputan sepanjang tahanan, dan monitor di belakang hanyut sedikit (paralaks). Tiada bingkai pegun.
  - **Panel baharu "Liputan setiap pasukan".** Garis putus-putus sasaran KKM 80% dilukis, kemudian enam bar P1–P6 naik satu demi satu: 85 / 83 / 84 / 82 / 83 / 83%, semuanya di atas garis.
    - Angka daripada rekod simulasi yang sama (`calcTeamPct`).
    - Paksi penuh 0–100% (tidak dipotong), jadi perbezaan kecil tidak dibesar-besarkan.
  - **Cahaya** menyapu pil "Capai Sasaran" pada penghujung tahanan.
- Angka "84%", "92 daripada 110 premis dilawati" dan "Capai Sasaran" kekal di skrin selama V6.

#### 2. Babak pengisian manual diperlahankan (6.5–16.35 s)

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

#### 3. Susun atur nod "12 berkunci / kosong"

- **Punca.** Kotak 100 px; label dua baris "berkunci / kosong" (48 + 6 + 2 × 22 px) melebihi ruang dalam. Nombor terhimpit ke atas dan "kosong" terkeluar di bawah.
- **Sekarang:**
  - Nod baris kedua 120 px, dengan nombor sebaris dari atas (92 · 12 · 6).
  - Nod tindakan "Semak semula status" dan "Rancang lawatan susulan" turut dilegakan (fon 17 px), kerana sebelum ini juga sesak.
  - Garisan penyambung dan baris tindakan dianjak 20 px.

#### 4. Dikekalkan seperti V6

Glob peta dan radius 200 m, sisipan WhatsApp, peralihan 1:01–1:03 yang licin (kini 1:04–1:06), dan semua bahagian lain.

### Keputusan semakan V7

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

### Bina, semak dan render (V7)

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
