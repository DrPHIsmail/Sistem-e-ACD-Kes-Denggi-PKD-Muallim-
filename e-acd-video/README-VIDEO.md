# Sistem e-ACD Kes Denggi — 90-second competition film

A 90.000-second, 1920×1080, 60 fps product film for **Pejabat Kesihatan Daerah Muallim (PKD Muallim)**. It shows the dengue active-case-detection (*Pengesanan Kes Aktif*, ACD) workflow: the field problem, house-to-house recording, automatic totals, Google Sheets sync, Bahagian D confirmation and the shareable summary. All on-screen and spoken text is in Bahasa Malaysia, and every figure is labelled **DATA SIMULASI**.

## Deliverables

| File | Purpose |
|---|---|
| `video-showcase.html` | Self-contained player (inline HTML/CSS/JS, embedded Inter font and Jata Negara). Opens by double-click and works offline. |
| `render-video.js` | Automated MP4 export: Playwright Chromium → PNG frames 0–5399 → FFmpeg H.264 + 48 kHz AAC → `e-ACD-Denggi-Pitch.mp4`. |
| `e-ACD-Denggi-Pitch.mp4` | Rendered film: subtitled, original music and sound effects, **no recorded narration**. |
| `voiceover-script-bm.md` | Read-ready BM narration with start/end times, the subtitle cue sheet and pronunciation notes. |
| `subtitles-bm.srt` | The same 28 caption cues as an SRT file, for editors or video platforms. |
| `package.json` | Pinned dependencies: `playwright@1.63.0`; `tailwindcss@3.4.17` (dev, only for rebuilding the player). |
| `src/`, `assets/`, `tools/` | Editable sources, the build script, the doc generator and the automated check suite. |

## 1. Open the player

Double-click `video-showcase.html`, or run:

```bash
open video-showcase.html
```

On Windows use `start video-showcase.html`; on Linux use `xdg-open video-showcase.html`. The first click (**Tekan untuk mula**) starts playback and unlocks browser audio. The page makes no network requests.

| Control | Button / key |
|---|---|
| Play / pause | **Main / Jeda**, `Space` |
| Restart | **Mula Semula**, `R` |
| Scrub | timeline slider; `←`/`→` ±1 s (`Shift` ±5 s); `,` / `.` one frame |
| Scene jumps | **1 · Cabaran** … **6 · Penutup**, keys `1`–`6` |
| Sound on/off | **Bunyi**, `M` |
| Subtitles on/off | **Sari Kata**, `S` |
| Browser voice preview | **Suara BM (ms-MY)**. Enabled only when the browser has a Malay voice; preview aid only, not used in the MP4. |
| Fullscreen | **Skrin Penuh**, `F` |
| Clean recording mode | **Mod Rakaman Bersih**, `C` (hides all controls and the cursor; `Esc` exits) |

URL options (append to the `file:///…/video-showcase.html` address): `?t=50` starts at 50 s, `?clean=1` opens in clean mode, `?mute=1` starts muted, `?subs=0` hides captions. `?render=1` is the exporter's mode: no UI and no audio playback.

## 2. Export the MP4

One-time setup (Node.js 18+ and FFmpeg on `PATH`; or set `FFMPEG_PATH` / `FFPROBE_PATH`):

```bash
npm install
```

```bash
npx playwright install chromium
```

Full export without narration (about 10 minutes on 4 CPU cores):

```bash
node render-video.js
```

With a pre-timed Bahasa Malaysia narration. The file starts at 00:00.000 and is at most 90 s; see `voiceover-script-bm.md`. The narration is loudness-normalised to −16 LUFS (FFmpeg `loudnorm`, two-pass, linear: it keeps the reading's dynamics; change it with `--vo-level -18` or skip it with `--vo-raw`). The music is side-chain ducked by about 10–12 dB while the voice speaks, and the mix is padded or trimmed to exactly 90.000 s:

```bash
node render-video.js --voiceover narration-bm.wav
```

Quick test of a 5-second section (frames 3600–3899):

```bash
node render-video.js --start 3600 --end 3899 --out test-clip.mp4
```

Verify a finished file (1920×1080, 60/1, 5400 decoded frames, 90.000 s, AAC 48 kHz):

```bash
node render-video.js --probe e-ACD-Denggi-Pitch.mp4
```

The equivalent raw check:

```bash
ffprobe -v error -count_frames -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_read_frames,duration,sample_rate -of compact e-ACD-Denggi-Pitch.mp4
```

Export the soundtrack only (music and effects, 48 kHz WAV) for an external editor:

```bash
node render-video.js --audio-only soundtrack.wav
```

Other options: `--workers <n>` (default: up to 4), `--crf <n>` (default 17), `--preset <x264 preset>` (default medium), `--fast` (JPEG frame capture, about 1.7× faster, slightly lossy), `--keep-temp`. If you need a specific browser binary, set `CHROMIUM_PATH`.

How the export stays repeatable: each worker blocks every non-`file:` request, waits for `window.ACD.ready` (fonts and images decoded), then calls `window.renderFrame(i)` (t = i / 60) and screenshots the stage. RGB is converted with an explicit BT.709 matrix and the stream is tagged BT.709, so the teal palette is not shifted by a BT.601 default. Segments from parallel workers are concatenated with stream copy and muxed with the page's own audio buffer, the same samples the browser plays.

## 3. Fullscreen recording fallback (OBS Studio)

**Option A (recommended): OBS Browser source.** Audio goes straight into the OBS mixer.

1. In OBS **Settings → Video**, set **Base (Canvas) Resolution** and **Output (Scaled) Resolution** to 1920×1080 and **Common FPS Values** to 60. In **Settings → Audio**, set **Sample Rate** to 48 kHz.
2. Add a **Browser** source. Tick **Local file** and choose `video-showcase.html`. Set Width 1920, Height 1080, tick **Use custom frame rate** with FPS 60, and tick **Control audio via OBS**.
3. In **Edit → Advanced Audio Properties**, set the browser source's **Audio Monitoring** to **Monitoring Enabled** so you can hear it while recording.
4. Right-click the source and choose **Interact**. Press `C` (clean mode hides the start overlay, controls and cursor).
5. Start recording in OBS, then press `R` in the **Interact** window. `R` restarts from 00:00.000, and that key press is also the gesture that unlocks audio. Stop recording after the film ends and trim the head and tail to exactly 90.000 s.

**Option B: window or display capture.** Open the player in Chrome or Edge on a 1920×1080 display. Press `F` (fullscreen) and then `C` (clean mode). Add a Display Capture source with **Desktop Audio**, start recording, and press `R` to play from the start.

Both options depend on real-time playback, so frame timing can vary with machine load. Prefer `render-video.js` for the competition copy.

## 4. Repository review (one takeaway per project)

The official documentation sites (motioncanvas.io, remotion.dev, obsproject.com, ffmpeg.org, docs.blender.org, openshot.org) were blocked by this session's network policy, and the GitHub API was not enabled. I read each project's README plus the repository-hosted docs or source files listed below.

| Project | What I inspected | Takeaway | Applied as |
|---|---|---|---|
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) | README; [`packages/core/src/flow/scheduling.ts`](https://github.com/motion-canvas/motion-canvas/blob/main/packages/core/src/flow/scheduling.ts); [`transitions/fadeTransition.ts`](https://github.com/motion-canvas/motion-canvas/blob/main/packages/core/src/transitions/fadeTransition.ts); `tweening/timingFunctions.ts` | `waitUntil('event')` syncs animation to *named time events* that are shown on the timeline and editable, and `waitFor` advances in whole frames (`framesToSeconds(1)`). The default `fadeTransition` is 0.6 s. | Every beat lives in one named table (`T` and `CUES` in `src/engine.js` / `src/data.js`) that drives visuals, captions and audio together. The easing formulas match `easeInOutCubic` / back-out. |
| [Remotion](https://github.com/remotion-dev/remotion) | README; [`packages/docs/docs/flickering.mdx`](https://github.com/remotion-dev/remotion/blob/main/packages/docs/docs/flickering.mdx); `random.mdx` | "Think of your component as a function that transforms a frame number into an image": the same output on every call, no dependence on render order, no animation while paused, no unseeded randomness. Wait for fonts and assets before capture. | `renderFrame(i)` recomputes every property from `t`. Seeded `mulberry32` randomness, no CSS transitions or animations, and parallel workers render disjoint frame ranges after `document.fonts.ready`. |
| [OBS Studio](https://github.com/obsproject/obs-studio) | README.rst; `frontend/data/locale/en-US.ini`; [obs-browser `data/locale/en-US.ini`](https://github.com/obsproject/obs-browser) (the Browser source plugin) | The Browser source has **Local file**, **Use custom frame rate** and **Control audio via OBS**. Monitoring is set per source (**Monitor Off / Monitor Only (mute output) / Monitoring Enabled**). | Section 3 records a local-file Browser source at 1920×1080/60 with OBS-controlled audio and monitoring, instead of desktop-audio capture. |
| [FFmpeg](https://github.com/FFmpeg/FFmpeg) | README.md; `doc/demuxers.texi`, `doc/filters.texi`, `doc/ffprobe.texi` | The image2 demuxer's `framerate` "defaults to 25", so piped frames need an explicit `-framerate`. Concat requires identical streams. `sidechaincompress` ducks one input by another. `-count_frames` reports decoded frames. | `-f image2pipe -framerate 60` → x264 segments → concat (stream copy) → `sidechaincompress` ducking for narration → `ffprobe -count_frames` check for 5400 frames. |
| [Blender](https://github.com/blender/blender) | README.md; [`source/blender/makesdna/DNA_camera_types.h`](https://github.com/blender/blender/blob/main/source/blender/makesdna/DNA_camera_types.h) | The default camera is `lens = 50.0f` on a `DEFAULT_SENSOR_WIDTH 36.0f` sensor, a horizontal field of view of 2·atan(18/50) ≈ 39.6°. | Device shots use `perspective(2667px)`, which equals that 50 mm camera on a 1920 px frame (960 / tan 19.8°). Small 3–18° turns avoid wide-angle distortion; depth comes from a back plate at `translateZ(-16px)` plus a glass highlight that follows rotation. |
| [OpenShot](https://github.com/OpenShot/openshot-qt) | README.md; `doc/transitions.rst`; `doc/animation.rst` | "Transitions **do not** affect **audio**", so fades must be keyed separately, and transparent clips can "pop" under a transition. Keyframes are Bézier, linear or *constant*. | Audio cues are separate entries from visual dissolves. Discrete UI states (badge text, selected pill, toggle) switch on constant keyframes. The closing title holds 4.7 s, more than the 3 s minimum. |

## 5. Faithfulness to the supplied sources

The film mirrors `sistem_e_acd_denggi_pkd_muallim.html` (read-only) and `code_appsscript (2).js` (`Code.gs`). Tabs, labels, colours (Tailwind 3.4.17, the source's CDN version, compiled offline), the formula, the badge and progress-bar logic, the eight symptoms, the five status codes, the WhatsApp text format and the CSV file name are reproduced from the code. The film's dashboard calls the source's own `computeTotals` / `calcTeamPct` logic (copied into `src/data.js`).

### Material differences and why

| Item in the source | Shown in the film | Reason |
|---|---|---|
| Desktop tab `1. Dashboard Hasil ACD` (line 93); mobile nav `Dashboard` (line 795) | `1. Papan Pemuka Hasil ACD`, `Papan Pemuka` | Brief: BM UI text. |
| Buttons `Sync Sheet` (line 55), `Add to Home` (line 59); install modal steps in English (lines 852–866) | `Selaraskan Sheet`, `Tambah ke Skrin Utama`; Safari steps `Kongsi` → `Tambah ke Skrin Utama` → `Tambah` | Brief: translate English UI fragments. |
| Header `e-ACD Kes Denggi (Active Case Detection)` (line 48) | `Sistem e-ACD Kes Denggi`; *Pengesanan Kes Aktif* introduced once in Scene 2 | Brief: real product title; ACD expanded once. |
| `+ Simpan Rekod Rumah & Auto-Kira` (line 509), `Ringkasan Eksekutif & Auto-Kira Operasi` (line 118), `3. Input Pasukan & Pengesahan` (line 99) | `+ Simpan Rekod Rumah dan Kira Automatik`, `…& Kiraan Automatik Operasi`, `3. Input Pasukan dan Pengesahan` | Brief wording; removes the English "Auto". |
| Badge `Sasaran KKM ≥ 80%` (`kpiTargetBadge`, lines 140 and 1288) | `Sasaran ≥ 80%`; narration says *sasaran yang dipaparkan* | Brief: present 80% as the target configured in the app. Verify the KKM attribution before restoring it. `Sedang Berjalan (<80%)` and `Capai Sasaran (≥80%)` are unchanged. |
| `INITIAL_STAFF` lists 15 real names (lines 917–933) | `PETUGAS 01`–`PETUGAS 15` with the same roles, units (KKTM, KD KETOYONG) and team assignment; 16 required, 15 confirmed, 1 remaining, as `renderStaffTable` computes | No personal data in any frame. |
| Phone header shows `Set 0` | Omitted on the phone mockup (kept on desktop) | Keeps the status badges on one line at 390 px. |
| Status 6: form pill `6 - Tanah/Lot Kosong` (line 383), table badge `6 - Lot Kosong` (line 1383) | Form label used | The source is inconsistent; the brief names the form label. |
| Map link `google.com/maps?q=3.699…,101.510…` (line 76) | Plain text `Surau Kg. Ketoyong (Peta)` | Live URL and coordinates stripped. |
| Emoji in the WhatsApp text (lines 1938–1949) | Small icons in the mock message | Rendering does not depend on an emoji font. |
| No "Data Simulasi" label in the app | Dashed amber `DATA SIMULASI` tag in each device's header or window chrome, and on the Sheets, chat and coverage overlays | Required by the brief. Styled as a film annotation, not app UI. |

### Data-model notes (affect what the film can honestly show)

- **House entry vs. totals.** The submit handler adds +1 locality and +1 visited or +1 locked for each house (lines 1655–1670), so house-entered data always has *lokaliti = dilawati + berkunci*. The storyboard's 110 = 92 + 12 + 6 *belum dilawati* is only possible through the quick-entry view (`bindTeamInputs`, lines 1730–1768), which is how Scene 4 presents it. Scene 3's record is shown as Pasukan 1 moving from 16/19 to 17/20.
- **Illustrative values not fixed by the storyboard:** samples 0 (matches the `Ada Kes` toggle default, lines 1590–1593); Bahagian C totals of 14 breeding sites, 13 Abate and 92 leaflets.
- **What reaches the sheet.** `saveAcdDataFromApp` writes only six rows to `Hasil ACD!C8:H13` (lines 173–195). Samples, Bahagian C, house records, roster, meta and the **Bahagian D confirmation are stored in Script Properties** (`ACD_EXTRA_STATE`, lines 266–284), not in sheet cells. Scene 5 shows exactly that. Row 14 (%) and column I (totals) are drawn as sheet formulas, per the comment on line 173. The real sheet's layout outside C8:H13 was not available, so the Sheets view is labelled *paparan simulasi*.
- **Home-screen icon.** The Jata icon on the home screen depends on the `apple-touch-icon` and the blob manifest (lines 10, 1099–1122). [Medium confidence] When the app is served by `HtmlService` (`doGet`), it runs inside Google's sandboxed iframe, and those tags are probably not used for the home-screen icon; the film's depiction matches the hybrid mode (HTML on a static host plus the Web App URL). This needs a device test.

### Risks in the source worth raising before the judging (not shown in the film)

1. **Last-writer-wins sync.** [High confidence, from the code] Every save sends the whole state, and `saveAcdDataFromApp` overwrites C8:H13 and rewrites `Lampiran 1 (Rekod Rumah)` with that device's copy. `LockService` only serialises writes; it does not merge them. Two phones saving close together can erase each other's entries. The film therefore says *diselaraskan … apabila sambungan tersedia* and claims no real-time merge.
2. **Pull overwrites local work.** `Selaraskan Sheet` calls `pullStateFromGoogleSheet` (lines 1050–1094), which replaces local teams and houses with sheet data. There is no retry queue, so offline entries survive only if the device saves again before it pulls.
3. **Script Properties size.** [Medium confidence: needs verification against Google's current Apps Script quotas page, which I could not open] Property values are limited to roughly 9 KB each. `ACD_EXTRA_STATE` stores every house record, so a full Lampiran 1 can make `setProperty` throw after the sheet write; the app then shows `Disimpan (Peranti)`.
4. **Roster read-back.** `getAcdDataForApp` assigns `team: (idx % 6) + 1` instead of reading the "Pasukan" column (line 144) whenever Script Properties are empty.

### Claims

The closing benefits (`Borang digital`, `Kiraan automatik`, `Pengesahan lapangan`, `Ringkasan sedia dikongsi`) describe visible capabilities only. The film makes no claim about time or cost savings, error rates or full replacement of paper. Any such claim needs verified evaluation evidence first.

## 6. Verification performed

All checks below ran in headless Chromium (Playwright 1.63.0) with FFmpeg 6.1.1, against the final `video-showcase.html`.

**Player: `node tools/check-player.js` passed 32/32**

| Area | Checks |
|---|---|
| Offline | Opens from `file://` with every non-file request blocked; 0 requests attempted. No URL, spreadsheet ID or map coordinate anywhere in the file. |
| Calculations | Totals 110 / 92 / 12 / 337 / 3 / 3. ROUND(92/110×100) = 83.636 → **84%**. Doughnut 92 / 12 / 6. A zero denominator gives 0%, as in the source. Team coverage 85 / 83 / 84 / 82 / 83 / 83%. |
| On-screen data | At 01:04 the dashboard reads `84%`, `(92 / 110 premis)`, `Capai Sasaran (≥80%)` and counters 110 / 92 / 337 / 3 / 3. The badge flips on the first frame where coverage reaches 80% (01:00.700, 79% → 82%). |
| Copy / export | The WhatsApp summary text uses the source's format and figures; CSV file name `Hasil_ACD_Kg._Ketoyong.csv`. |
| Labels | `DATA SIMULASI` visible at 0:11, 0:35, 0:46, 0:59, 1:04, 1:12.5, 1:16.9 and 1:20.5. Every caption is at most two lines. |
| Determinism | Seeking to the same frame in fresh pages gives byte-identical screenshots (6/6). Playing to frame N gives the same visible DOM state as seeking to N (3/3). |
| Audio buffer | Exactly 4,320,000 samples (90.000 s at 48 kHz); peak −1.6 dBFS; 200 sound cues (33 taps) from the shared timeline. |
| Controls | First click starts playback and unlocks audio (AudioContext running, audio clock driving the frames); pause holds the frame; scene jump lands on 00:50.000; scrubber seeks to frame 3840; subtitle toggle; mute (gain 0); restart from 0; auto-hide while playing; clean mode hides controls and cursor, `Esc` exits; ±1 s and single-frame keys; no page errors. |

**MP4: `node render-video.js --probe e-ACD-Denggi-Pitch.mp4`.** H.264 High, 1920×1080, yuv420p, BT.709, `r_frame_rate` 60/1, **5400 decoded frames, 90.000 s**, AAC-LC 48 kHz stereo 90.000 s, container 90.000 s. The page attempted 0 network requests during the export. Cross-correlating the MP4's decoded audio with the source mix gives **0-sample lag** (correlation ≥ 0.999) at 14.6 s, 44.0 s, 60.4 s and 85.0 s, so sound cues stay frame-locked. Frames decoded from the MP4 were inspected against browser frames: colours and small UI text hold up.

**Soundtrack, measured on the delivered MP4.** −19.2 LUFS integrated, true peak −1.6 dBTP, LRA 5.1 LU. Per scene: Scene 1 −16.9 LUFS (tension and impact), Scenes 2–6 −18.7 to −20.7 LUFS. The MP4 was rendered from the delivered `video-showcase.html` (SHA-256 `16785461e87d9d75…`).

**Narration path, tested with a synthetic pre-timed track** (noise bursts inside the 28 cue windows):
- `--voiceover` exports pass the same probe (exact duration, 60/1, AAC 48 kHz).
- A −31.2 LUFS mono track was normalised to −16 LUFS; the mixed result measures −15.9 LUFS.
- Under speech-level narration the music bed drops from about −20 dB to −31.7 dB RMS; between lines only a 1.4 dB trim applies.

**Visual review.** Contact sheets every 1.5 s across the full 90 s, plus targeted frames at each transition and interaction.

**Pixel-level note.** Comparing screenshots of "played to frame N" and "seeked to N" in Chromium found 0 differing pixels at frames 3790 and 4580. Elsewhere the differences were small raster-cache effects: ≤ 64 anti-aliased pixels (≤ 6/255) on scaled text, a 1-px seam along the 3D phone edge, and ±1–2/255 gradient dithering. These come from the browser's tile and layer caching, not the timeline; the exporter always seeks, so the MP4 is reproducible.

**Not verified here:**
- Playback in Safari or Firefox, or on Windows/macOS hardware.
- An actual OBS recording (OBS is not available in this environment).
- A real narrator recording; the MP4 has **no narration**, only music and effects with subtitles.
- The Web Speech toggle with a real `ms-MY` voice; headless Chromium has none, so the check only confirmed the toggle disables itself.
- The real app's add-to-home behaviour on iOS or Android devices.

## 7. Rebuilding and editing

The film's data, cue times and labels live in `src/data.js` (`TEAMS`, `CUES`, `META`). After editing:

```bash
node tools/build-player.js
```

```bash
node tools/make-docs.js
```

```bash
node tools/check-player.js
```

The build refuses to write the player if a URL, the spreadsheet ID, the map coordinates or any real staff name from the source leaks into it.

## 8. Credits, licences and permissions

- Inter 4.000, © 2016 The Inter Project Authors, SIL Open Font License 1.1 (subset and embedded). Tailwind CSS 3.4.17, MIT. Playwright, Apache-2.0. FFmpeg/x264 run locally under their own licences.
- The music and sound effects are original and synthesised in code (`src/audio.js`); no samples are used.
- The Jata Negara image is the one embedded in the supplied app. Its use is regulated in Malaysia, so confirm PKD Muallim's approval for using it in the film.
- Map, messaging app, spreadsheet and home screen are generic simulations without third-party logos.
