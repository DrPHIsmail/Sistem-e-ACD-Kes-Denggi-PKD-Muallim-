# Voiceover script — Sistem e-ACD Kes Denggi (90 s)

Read-ready Bahasa Malaysia narration for the PKD Muallim competition film. Every time below is generated from `src/data.js`, the same cue table that drives the subtitles in `video-showcase.html` and the music ducking in `render-video.js`.

## Recording brief

- **Format:** WAV, 48 kHz, 24-bit or 16-bit, mono or stereo. Room tone only between lines.
- **Pre-timed file:** the file must start at film time 00:00.000 and be no longer than 90.000 s. Leave silence where there is no narration. `render-video.js` pads or trims it to exactly 90.000 s.
- **Level:** peaks no higher than −3 dBFS. `render-video.js --voiceover` normalises the narration to −16 LUFS (two-pass, linear) and ducks the music about 10–12 dB under it, so a clean, consistent read matters more than the absolute level.
- **Timing guide:** open `video-showcase.html`, turn the sound off (**M**) and keep subtitles on (**S**). Each caption appears exactly when its line should start, so the player works as a teleprompter. Alternatively record line by line and place each take at its **Start** time in an editor (OpenShot, Audacity).
- **Pace:** most phrases run at about 4–5.3 syllables per second (see the Pace column). The briskest are S6a (about 5.6) and S2b (about 5.4). Scene 5 runs its lines back to back with almost no pause, so read it crisply; in Scene 6 keep *e-ACD Kes Denggi* and the office name unhurried.

## Narration (read exactly as written)

| # | Scene | Start | End | Window | Narration |
|---|---|---|---|---|---|
| N1 | 1 | 00:00.800 | 00:06.600 | 5.80 s | Apabila wabak denggi berlaku, petugas perlu menyaring penduduk dari rumah ke rumah. |
| N2 | 1 | 00:07.200 | 00:13.200 | 6.00 s | Borang kertas dan kiraan manual menambah langkah sebelum dapatan boleh dirumuskan. |
| N3 | 2 | 00:15.500 | 00:22.700 | 7.20 s | Pejabat Kesihatan Daerah Muallim memperkenalkan Sistem e-ACD Kes Denggi untuk pengesanan kes aktif. |
| N4 | 2 | 00:23.300 | 00:28.200 | 4.90 s | Petugas boleh membuka sistem melalui ikon di skrin utama telefon. |
| N5 | 3 | 00:30.500 | 00:36.100 | 5.60 s | Petugas memilih pasukan, merekod status lawatan dan menyaring gejala denggi. |
| N6 | 3 | 00:36.800 | 00:45.100 | 8.30 s | Rekod yang sama merangkumi semakan takungan Aedes, tindakan Abate, edaran risalah dan catatan rujukan ke klinik. |
| N7 | 4 | 00:50.500 | 00:54.700 | 4.20 s | Sistem menjumlahkan dapatan enam pasukan secara automatik. |
| N8 | 4 | 00:55.300 | 01:01.700 | 6.40 s | Dalam simulasi ini, sembilan puluh dua daripada seratus sepuluh premis dilawati. |
| N9 | 4 | 01:02.300 | 01:07.400 | 5.10 s | Liputannya lapan puluh empat peratus, melepasi sasaran yang dipaparkan. |
| N10 | 5 | 01:10.250 | 01:14.700 | 4.45 s | Dapatan diselaraskan ke Google Sheets apabila sambungan tersedia. |
| N11 | 5 | 01:14.900 | 01:21.600 | 6.70 s | Pegawai merekod pengesahan, kemudian menyalin ringkasan ke WhatsApp atau memuat turun CSV. |
| N12 | 6 | 01:22.200 | 01:25.400 | 3.20 s | Daripada rekod rumah kepada laporan operasi. |
| N13 | 6 | 01:25.700 | 01:29.700 | 4.00 s | Sistem e-ACD Kes Denggi, Pejabat Kesihatan Daerah Muallim. |

## Line-by-line cue sheet (subtitle phrases)

Each narration sentence is split into the short phrases shown as captions. **Spoken text** is what the narrator says (numbers written out); **Caption** is what appears on screen (two lines at most, digits for readability).

| Cue | Start | End | Pace (syll/s) | Spoken text | Caption |
|---|---|---|---|---|---|
| S1a | 00:00.800 | 00:02.900 | 5.2 | Apabila wabak denggi berlaku, | Apabila wabak denggi berlaku, |
| S1b | 00:02.950 | 00:06.600 | 4.9 | petugas perlu menyaring penduduk dari rumah ke rumah. | petugas perlu menyaring penduduk / dari rumah ke rumah. |
| S1c | 00:07.200 | 00:10.500 | 4.2 | Borang kertas dan kiraan manual menambah langkah | Borang kertas dan kiraan manual / menambah langkah |
| S1d | 00:10.550 | 00:13.200 | 4.5 | sebelum dapatan boleh dirumuskan. | sebelum dapatan boleh dirumuskan. |
| S2a | 00:15.500 | 00:18.100 | 4.2 | Pejabat Kesihatan Daerah Muallim | Pejabat Kesihatan Daerah Muallim |
| S2b | 00:18.150 | 00:20.750 | 5.4 | memperkenalkan Sistem e-ACD Kes Denggi | memperkenalkan Sistem e-ACD Kes Denggi |
| S2c | 00:20.800 | 00:22.700 | 4.7 | untuk pengesanan kes aktif. | untuk pengesanan kes aktif. |
| S2d | 00:23.300 | 00:25.300 | 5.0 | Petugas boleh membuka sistem | Petugas boleh membuka sistem |
| S2e | 00:25.350 | 00:28.200 | 4.6 | melalui ikon di skrin utama telefon. | melalui ikon di skrin utama telefon. |
| S3a | 00:30.500 | 00:32.300 | 5.0 | Petugas memilih pasukan, | Petugas memilih pasukan, |
| S3b | 00:32.350 | 00:34.100 | 4.6 | merekod status lawatan | merekod status lawatan |
| S3c | 00:34.150 | 00:36.100 | 4.6 | dan menyaring gejala denggi. | dan menyaring gejala denggi. |
| S3d | 00:36.800 | 00:40.400 | 5.0 | Rekod yang sama merangkumi semakan takungan Aedes, | Rekod yang sama merangkumi / semakan takungan Aedes, |
| S3e | 00:40.450 | 00:42.900 | 4.9 | tindakan Abate, edaran risalah | tindakan Abate, edaran risalah |
| S3f | 00:42.950 | 00:45.100 | 4.7 | dan catatan rujukan ke klinik. | dan catatan rujukan ke klinik. |
| S4a | 00:50.500 | 00:54.700 | 5.0 | Sistem menjumlahkan dapatan enam pasukan secara automatik. | Sistem menjumlahkan dapatan / enam pasukan secara automatik. |
| S4b | 00:55.300 | 00:57.300 | 4.0 | Dalam simulasi ini, | Dalam simulasi ini, |
| S4c | 00:57.350 | 01:01.700 | 5.1 | sembilan puluh dua daripada seratus sepuluh premis dilawati. | 92 daripada 110 premis dilawati. |
| S4d | 01:02.300 | 01:04.900 | 5.0 | Liputannya lapan puluh empat peratus, | Liputannya 84 peratus, |
| S4e | 01:04.950 | 01:07.400 | 4.9 | melepasi sasaran yang dipaparkan. | melepasi sasaran yang dipaparkan. |
| S5a | 01:10.250 | 01:12.550 | 5.2 | Dapatan diselaraskan ke Google Sheets | Dapatan diselaraskan ke Google Sheets |
| S5b | 01:12.600 | 01:14.700 | 4.8 | apabila sambungan tersedia. | apabila sambungan tersedia. |
| S5c | 01:14.900 | 01:16.800 | 5.3 | Pegawai merekod pengesahan, | Pegawai merekod pengesahan, |
| S5d | 01:16.850 | 01:19.400 | 4.7 | kemudian menyalin ringkasan ke WhatsApp | kemudian menyalin ringkasan / ke WhatsApp |
| S5e | 01:19.450 | 01:21.600 | 4.2 | atau memuat turun CSV. | atau memuat turun CSV. |
| S6a | 01:22.200 | 01:25.400 | 5.6 | Daripada rekod rumah kepada laporan operasi. | Daripada rekod rumah / kepada laporan operasi. |
| S6b | 01:25.700 | 01:27.400 | 5.3 | Sistem e-ACD Kes Denggi, | Sistem e-ACD Kes Denggi, |
| S6c | 01:27.450 | 01:29.700 | 4.9 | Pejabat Kesihatan Daerah Muallim. | Pejabat Kesihatan Daerah Muallim. |

## Pronunciation and delivery notes (not part of the spoken text)

| Term | Direction |
|---|---|
| e-ACD | Say it as letters: "i-ei-si-di". |
| ACD | Letters: "ei-si-di". The narration expands it once in Scene 2 as *pengesanan kes aktif*. |
| CSV | Letters: "si-es-vi". |
| Google Sheets, WhatsApp | Use the usual English product names. |
| Aedes, Abate | Use the pronunciation the PKD vector-control unit uses in the field, and confirm it with the officer in charge before recording. |
| Muallim | Three clear syllables: "Mu-al-lim". |
| Numbers | Read in full exactly as written (*sembilan puluh dua*, *seratus sepuluh*, *lapan puluh empat peratus*). |
| Tone | Calm, confident and formal: a public-health briefing, not an advertisement. Slight emphasis on *automatik*, *lapan puluh empat peratus* and the closing name. |
| Accuracy | Scene 4 says *dalam simulasi ini* on purpose: the figures are demo data. Keep that phrase. |

## Scene map

| Scene | Time | Title |
|---|---|---|
| 1 | 00:00.000–00:15.000 | Cabaran operasi lapangan |
| 2 | 00:15.000–00:30.000 | Pengenalan sistem |
| 3 | 00:30.000–00:50.000 | Rekod lawatan rumah ke rumah |
| 4 | 00:50.000–01:10.000 | Kiraan automatik dan liputan ACD |
| 5 | 01:10.000–01:22.000 | Penyelarasan, pengesahan dan laporan |
| 6 | 01:22.000–01:30.000 | Impak dan penutup |
