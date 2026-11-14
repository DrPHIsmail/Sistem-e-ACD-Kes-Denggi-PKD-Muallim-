# Voiceover NADI Muallim | 120 saat

Kit ini mengandungi `narration-bm.wav`, sari kata, skrip Bahasa Melayu dan pembina WAV untuk enam babak versi 120 saat. Narasi menggunakan suara stok Melayu Malaysia Osman yang dijana melalui FreeReadText. Saya menjana setiap babak secara berasingan dan melanjutkan jeda pada babak tiga hingga lima untuk memberi ruang kepada paparan. Fail WAV ialah mono PCM 16-bit, 48 kHz, tepat 120 saat. Muzik dan kesan bunyi dimasukkan semasa render video.

## Pilihan 1 | Rakaman telefon atau eksport AI

Gunakan satu suara dan baca enam bahagian dalam `voiceover-script-bm.md`. Untuk rakaman telefon, gunakan bilik senyap, kekalkan jarak mikrofon yang sama dan berhenti seketika selepas angka liputan. Sebut NADI sebagai "Nadi". [FreeReadText Bahasa Melayu Malaysia](https://freereadtext.com/en/text-to-speech/malay-malaysia) menyediakan suara stok Osman dan Yasmin serta eksport MP3. [FAQ FreeReadText](https://freereadtext.com/) menyatakan hak guna komersial terpakai pada pelan percuma dan berbayar.

Rakam atau eksport setiap bahagian ke folder `takes`. Namakan fail `scene-01` hingga `scene-06` dengan sambungan asal, contohnya `scene-01.m4a`, `scene-02.mp3` atau `scene-03.wav`. Simpan satu fail untuk setiap nombor babak. Jika perkhidmatan menjana satu trek panjang, potong pada sempadan enam perenggan narasi dahulu. Pembina menggunakan FFmpeg untuk menyamakan format dan memadankan setiap klip dengan masa babaknya.

```bash
python3 generate-voiceover.py --clips-dir ./takes --output narration-bm.wav
```

## Pilihan 2 | Suara stok melalui Azure Speech

Gunakan suara Osman melalui Azure Speech. Microsoft menyenaraikan suara ini sebagai `ms-MY-OsmanNeural`. Terma Azure membenarkan kegunaan komersial output suara neural prabina bagi pelanggan tier berbayar. Gunakan sumber Azure Speech sedia ada yang memenuhi terma berkenaan. Tetapkan `AZURE_SPEECH_REGION` dan `AZURE_SPEECH_KEY` dalam persekitaran setempat.

```bash
python3 generate-voiceover.py --output narration-bm.wav
```

Pembina menghantar enam bahagian skrip secara berasingan pada kadar pertuturan -8%. Dengar setiap bahagian, khususnya nama Muallim dan Ketoyong, sebelum memilih audio untuk tayangan.

## Masukkan ke dalam video Claude Code

Salin `narration-bm.wav`, `subtitles-bm.srt` dan `voiceover-script-bm.md` ke folder projek video 120 saat. Minta Claude Code masukkan kiu SRT ke sumber garis masa pemain sebelum membina semula HTML. Di dalam folder projek itu, jalankan arahan berikut.

```bash
node render-video.js --voiceover narration-bm.wav --out NADI-Muallim-Pitch-120s.mp4
```

Kiu sari kata disusun daripada sempadan ayat dan jeda audio. Semak padanan sari kata dan sebutan Muallim dan Ketoyong dalam eksport pendek sebelum render penuh. Renderer akan mencampur muzik dan kesan bunyi di bawah narasi.

## Semakan MeloTTS-MS

- Kod GitHub menggunakan lesen MIT. Fork ini menambah fonemisasi `ms`, normalisasi Malaya Speech dan BERT Bahasa Melayu.
- Notebook inferens menggunakan `TTS(language='MS', config_path=..., ckpt_path=...)`. Kad model memautkan `config.json` dan `model.pth`. Kebergantungan merangkumi eSpeak dan model BERT. Kad Hugging Face menyatakan model itu belum disediakan oleh Inference Providers.
- Kad model menyenaraikan tiga profil suara yang dinamakan. Saya tidak menemui lesen khusus untuk checkpoint pada kad tersebut. Gunakan suara stok dengan terma yang jelas untuk keluaran rasmi.
- Enam klip sebenar daripada FreeReadText disusun dalam WAV dan disemak dengan FFprobe. Sebutan nama lokaliti masih perlu disahkan melalui pendengaran. Pembina juga telah diuji dengan enam klip tiruan dalam format WAV, MP3 dan M4A. Sintesis melalui Azure memerlukan akses kepada sumber Speech.

### Rujukan

- [Repo MeloTTS-MS](https://github.com/mesolitica/MeloTTS-MS)
- [Lesen kod MeloTTS-MS](https://github.com/mesolitica/MeloTTS-MS/blob/main/LICENSE)
- [Kad checkpoint dan contoh inferens](https://huggingface.co/mesolitica/MeloTTS-MS)
- [Suara Azure Speech untuk Bahasa Melayu Malaysia](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
- [Rujukan Azure Speech REST](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech)
- [Terma komersial Microsoft Azure](https://www.microsoft.com/licensing/terms/product/MicrosoftAzure/all)
- [Suara Melayu Malaysia FreeReadText](https://freereadtext.com/en/text-to-speech/malay-malaysia)
- [Soalan lazim FreeReadText tentang penggunaan komersial](https://freereadtext.com/)
