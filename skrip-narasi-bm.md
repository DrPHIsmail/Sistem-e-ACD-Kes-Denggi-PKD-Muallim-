# Skrip Narasi BM — NADI Muallim (120 saat)

Narasi Bahasa Melayu untuk filem pertandingan PKD Muallim, dibahagikan kepada **7 rakaman mengikut babak**. Semua masa dalam dokumen ini dijana daripada `src/data.js`, iaitu jadual kiu yang sama yang memacu sari kata dalam `video-showcase.html`, fail `sari-kata-bm.srt` dan campuran audio dalam `render-video.js`.

> **Status masa:** masa di bawah ialah masa **dirancang**. Selepas rakaman disegerakkan dengan `tools/sync-narration.js`, jana semula dokumen ini supaya masa mengikut rakaman.

## Taklimat rakaman

- **Satu fail bagi setiap babak:** `narasi/babak-1.wav` hingga `narasi/babak-7.wav` (WAV 48 kHz disyorkan; `.m4a`, `.mp3`, `.flac` dan `.ogg` juga diterima). Mono atau stereo.
- **Cara membaca:** mulakan setiap fail dengan kira-kira 0.5 s senyap. Baca ayat dalam babak itu berturut-turut dengan jeda biasa: kira-kira 0.3 s antara frasa dan 0.6 s antara ayat. Tidak perlu mengikut masa filem. `tools/sync-narration.js` memotong rakaman pada jeda dan meletakkan setiap **ayat** pada masa mulanya dalam jadual di bawah, supaya ayat itu kedengaran ketika paparan berkaitan berada dalam bingkai.
- **Rentak:** frasa dirancang pada 4.0–5.4 suku kata sesaat (lajur *Rentak*). Bahagian paling padat ialah babak 6 dan ayat akhir babak 5. Alat penyegerak membenarkan setiap ayat bermula sehingga 1.0 s lebih awal atau 0.5 s lewat. Ujian sintetik menunjukkan bacaan yang kira-kira **3% lebih perlahan** daripada rancangan masih muat. Jika lebih perlahan, babak 6–7 tidak muat dan alat itu akan menamakan ayat yang perlu dirakam semula dengan sedikit lebih pantas.
- **Pilihan jika babak 6 terlalu padat:** buang frasa *"bagi lokaliti yang sama"* (≈9 suku kata, ≈1.7 s). Maksud ayat kekal, kerana kad NADI sudah menamakan Kg. Ketoyong. Ini perubahan teks; kemas kini `src/data.js` (kiu 6b) jika digunakan.
- **Paras:** puncak tidak melebihi −3 dBFS, tanpa muzik atau kesan bunyi. `render-video.js --voiceover` menormalkan narasi ke −16 LUFS (dua laluan, linear) dan merendahkan muzik kira-kira 11 dB ketika narator bercakap.
- **Selepas rakaman:**

```bash
node tools/sync-narration.js
```

```bash
node tools/build-player.js && node tools/make-docs.js
```

```bash
node render-video.js --voiceover narasi/narasi-penuh.wav
```

## Narasi mengikut babak (baca tepat seperti tertulis)

*Teks dibaca* ialah apa yang disebut oleh narator (nombor ditulis dalam perkataan). *Sari kata* ialah apa yang dipaparkan (maksimum dua baris, nombor dalam digit).

### Babak 1 · 00:00.00–00:12.00 · NADI: soalan operasi lokaliti

**Fail:** `narasi/babak-1.wav` · **Narasi:** 00:00.60–00:11.55 (11.0 s, 52 suku kata)

> Selepas operasi pengesanan kes aktif denggi, penyelia perlu tahu dua perkara. Premis mana sudah dilawati, dan di mana pasukan masih perlu turun?

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 1a | 00:00.60 | 00:03.65 | 5.2 | Selepas operasi pengesanan kes aktif denggi, | Selepas operasi pengesanan / kes aktif denggi, |
| 1b | 00:03.75 | 00:06.40 | 4.9 | penyelia perlu tahu dua perkara. | penyelia perlu tahu dua perkara. |
| 1c | 00:06.90 | 00:08.85 | 5.1 | Premis mana sudah dilawati, | Premis mana sudah dilawati, |
| 1d | 00:08.95 | 00:11.55 | 5.0 | dan di mana pasukan masih perlu turun? | dan di mana pasukan masih perlu turun? |

### Babak 2 · 00:12.00–00:28.00 · Daripada borang kepada satu telefon

**Fail:** `narasi/babak-2.wav` · **Narasi:** 00:12.30–00:24.20 (11.9 s, 55 suku kata)

> Borang dan fail rekod perlu dibawa ke lapangan. Selepas lawatan, angka dikira dan ditaip semula. Dengan e-ACD, petugas merekod lawatan terus pada telefon.

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 2a | 00:12.30 | 00:15.45 | 4.8 | Borang dan fail rekod perlu dibawa ke lapangan. | Borang dan fail rekod / perlu dibawa ke lapangan. |
| 2b | 00:15.60 | 00:19.20 | 4.7 | Selepas lawatan, angka dikira dan ditaip semula. | Selepas lawatan, angka dikira / dan ditaip semula. |
| 2c | 00:19.70 | 00:24.20 | 5.1 | Dengan e-ACD, petugas merekod lawatan terus pada telefon. | Dengan e-ACD, petugas merekod / lawatan terus pada telefon. |

### Babak 3 · 00:28.00–01:02.00 · Satu rekod lawatan premis

**Fail:** `narasi/babak-3.wav` · **Narasi:** 00:28.40–01:01.80 (33.4 s, 99 suku kata)

> Petugas memilih pasukan dan merekod status lawatan premis. Dalam contoh ini, seorang penghuni bergejala dan rujukannya ke klinik direkodkan. Petugas turut mencatat semakan takungan Aedes dan tindakan lapangan. Apabila disimpan, dapatan lawatan ini terus masuk dalam kiraan pasukan.

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 3a | 00:28.40 | 00:32.40 | 5.0 | Petugas memilih pasukan dan merekod status lawatan premis. | Petugas memilih pasukan dan / merekod status lawatan premis. |
| 3b | 00:38.40 | 00:41.60 | 5.0 | Dalam contoh ini, seorang penghuni bergejala | Dalam contoh ini, / seorang penghuni bergejala |
| 3c | 00:41.70 | 00:44.10 | 5.0 | dan rujukannya ke klinik direkodkan. | dan rujukannya ke klinik direkodkan. |
| 3d | 00:48.40 | 00:53.20 | 5.0 | Petugas turut mencatat semakan takungan Aedes dan tindakan lapangan. | Petugas turut mencatat semakan / takungan Aedes dan tindakan lapangan. |
| 3e | 00:56.40 | 00:57.80 | 5.0 | Apabila disimpan, | Apabila disimpan, |
| 3f | 00:57.90 | 01:01.80 | 5.1 | dapatan lawatan ini terus masuk dalam kiraan pasukan. | dapatan lawatan ini terus masuk / dalam kiraan pasukan. |

### Babak 4 · 01:02.00–01:24.00 · Kiraan agregat dan liputan ACD

**Fail:** `narasi/babak-4.wav` · **Narasi:** 01:02.40–01:17.80 (15.4 s, 70 suku kata)

> Sistem menjumlahkan dapatan enam pasukan secara automatik. Dalam simulasi ini, sembilan puluh dua daripada seratus sepuluh premis telah dilawati. Liputannya ialah lapan puluh empat peratus.

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 4a | 01:02.40 | 01:06.60 | 5.0 | Sistem menjumlahkan dapatan enam pasukan secara automatik. | Sistem menjumlahkan dapatan / enam pasukan secara automatik. |
| 4b | 01:07.30 | 01:09.30 | 4.0 | Dalam simulasi ini, | Dalam simulasi ini, |
| 4c | 01:09.40 | 01:14.30 | 5.1 | sembilan puluh dua daripada seratus sepuluh premis telah dilawati. | 92 daripada 110 premis / telah dilawati. |
| 4d | 01:14.70 | 01:17.80 | 5.2 | Liputannya ialah lapan puluh empat peratus. | Liputannya ialah 84 peratus. |

### Babak 5 · 01:24.00–01:43.00 · Pengesahan dan ringkasan

**Fail:** `narasi/babak-5.wav` · **Narasi:** 01:24.40–01:42.80 (18.4 s, 75 suku kata)

> Pegawai menyemak dan merekod pengesahan. Ringkasan boleh disalin untuk dikongsi melalui WhatsApp dari telefon. Petugas menjimatkan masa kerana maklumat lawatan yang sama terus digunakan untuk menyediakan laporan.

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 5a | 01:24.40 | 01:27.20 | 5.0 | Pegawai menyemak dan merekod pengesahan. | Pegawai menyemak dan merekod pengesahan. |
| 5b | 01:30.70 | 01:35.30 | 5.2 | Ringkasan boleh disalin untuk dikongsi melalui WhatsApp dari telefon. | Ringkasan boleh disalin untuk dikongsi / melalui WhatsApp dari telefon. |
| 5c | 01:35.50 | 01:37.20 | 5.3 | Petugas menjimatkan masa | Petugas menjimatkan masa |
| 5d | 01:37.30 | 01:40.70 | 5.3 | kerana maklumat lawatan yang sama terus digunakan | kerana maklumat lawatan yang sama / terus digunakan |
| 5e | 01:40.80 | 01:42.80 | 5.0 | untuk menyediakan laporan. | untuk menyediakan laporan. |

### Babak 6 · 01:43.00–01:54.00 · Keputusan penyelia di NADI

**Fail:** `narasi/babak-6.wav` · **Narasi:** 01:43.10–01:53.95 (10.9 s, 56 suku kata)

> Dalam prototaip integrasi ini, penyelia melihat baki operasi bagi lokaliti yang sama dan merancang lawatan susulan untuk enam premis yang belum dilawati.

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 6a | 01:43.10 | 01:45.35 | 4.9 | Dalam prototaip integrasi ini, | Dalam prototaip integrasi ini, |
| 6b | 01:45.45 | 01:49.55 | 5.4 | penyelia melihat baki operasi bagi lokaliti yang sama | penyelia melihat baki operasi / bagi lokaliti yang sama |
| 6c | 01:49.65 | 01:53.95 | 5.3 | dan merancang lawatan susulan untuk enam premis yang belum dilawati. | dan merancang lawatan susulan untuk / enam premis yang belum dilawati. |

### Babak 7 · 01:54.00–02:00.00 · Penutup

**Fail:** `narasi/babak-7.wav` · **Narasi:** 01:54.30–01:59.60 (5.3 s, 25 suku kata)

> NADI Muallim. Dari survelan denggi kepada tindakan susulan di lapangan.

| Kiu | Mula | Tamat | Rentak (suku kata/s) | Teks dibaca | Sari kata |
|---|---|---|---|---|---|
| 7a | 01:54.30 | 01:55.50 | 4.2 | NADI Muallim. | NADI Muallim. |
| 7b | 01:55.70 | 01:59.60 | 5.1 | Dari survelan denggi kepada tindakan susulan di lapangan. | Dari survelan denggi kepada / tindakan susulan di lapangan. |

## Nota sebutan dan penyampaian (bukan sebahagian teks)

| Istilah | Panduan |
|---|---|
| NADI | Sebut sebagai perkataan: "na-di". |
| e-ACD | Sebut huruf: "i-ei-si-di". |
| WhatsApp | Nama produk seperti biasa. |
| Aedes | Ikut sebutan yang digunakan Unit Vektor PKD; sahkan dengan pegawai bertugas sebelum rakaman. |
| Muallim | Tiga suku kata jelas: "Mu-al-lim". |
| Nombor | Baca penuh seperti tertulis: *sembilan puluh dua*, *seratus sepuluh*, *lapan puluh empat peratus*. |
| Nada | Tenang, yakin dan formal, seperti taklimat kesihatan awam, bukan iklan. Beri sedikit penekanan pada *automatik*, *lapan puluh empat peratus* dan *enam premis*. |
| Ketepatan | *"Dalam simulasi ini"* (babak 4) dan *"Dalam prototaip integrasi ini"* (babak 6) mesti dikekalkan: angka ialah data sintetik dan paparan NADI–e-ACD ialah prototaip. |

## Peta babak

| Babak | Masa | Tajuk | Paparan utama |
|---|---|---|---|
| 1 | 00:00.00–00:12.00 | NADI: soalan operasi lokaliti | Peta NADI dan kad Kg. Ketoyong; soalan penyelia |
| 2 | 00:12.00–00:28.00 | Daripada borang kepada satu telefon | Borang, fail rekod, kiraan manual dan taip semula; e-ACD dibuka pada telefon |
| 3 | 00:28.00–01:02.00 | Satu rekod lawatan premis | Satu rekod premis contoh pada telefon; "Rekod disimpan" |
| 4 | 01:02.00–01:24.00 | Kiraan agregat dan liputan ACD | Jadual enam pasukan; 92 daripada 110 premis, 84% liputan ACD |
| 5 | 01:24.00–01:43.00 | Pengesahan dan ringkasan | Pengesahan Bahagian D; ringkasan ditampal untuk WhatsApp |
| 6 | 01:43.00–01:54.00 | Keputusan penyelia di NADI | Kad NADI dengan ringkasan e-ACD (prototaip integrasi); 6 premis belum dilawati; rancang lawatan susulan |
| 7 | 01:54.00–02:00.00 | Penutup | Jata Negara, NADI Muallim, Pejabat Kesihatan Daerah Muallim |
