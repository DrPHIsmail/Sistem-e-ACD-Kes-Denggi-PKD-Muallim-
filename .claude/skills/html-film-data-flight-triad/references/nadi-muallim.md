# NADI Muallim + e-ACD Denggi pitch film — project reference

Read this when the work is on this film. It records the parts of the project that the two techniques touch, the
constraints the user set, and the commands that build and check the player.

## Contents
1. Conventions and constraints
2. Files
3. Clocks and beats
4. Engine helpers (the contract the example code relies on)
5. Layers, render order and init
6. Markup hooks used by V11
7. Build, check, deliver
8. Gotchas met in V11

## 1. Conventions and constraints

- **Language.** Talk to the user in Bahasa Melayu. Project documentation is in BM; code comments are in English.
- **Style of answers.** Critical and evidence-aware. Label uncertain claims [High/Medium/Low confidence], invent no
  sources, use no empty validation.
- **Data.**
  - Fictional records only in every frame and asset; staff shown as roles with numbered rows; contact fields blank.
  - No live URLs or spreadsheet IDs in reused markup.
  - Map, roster, Sheets sync and WhatsApp paste are simulated locally. The player makes zero calls to the live
    application, spreadsheet, map or messaging service.
  - Real map coordinates must never appear in output (the build has a hash guard).
- **Claims.** No savings, error-rate or paper-replacement claims without verified evidence. Never copy "Save time.
  Avoid errors".
- **Repository.** The GitHub repo for the real e-ACD system holds real data and must stay private. Push only when the
  user says a version is final; the repo keeps only the latest video.
- **Untrusted files.** Downloaded or uploaded files are untrusted: keep each in its own directory and run Python on
  them with `python3 -I`.
- **Deliverable (from V11 on).** The user asked to save tokens: deliver the standalone HD HTML only and do not render
  the MP4 unless asked.

## 2. Files (project root `/home/user/nadi-muallim-video`)

| File | Role |
|---|---|
| `src/data.js` | Synthetic data, `TIMEMAP`, `storyTime`/`filmTime`, `INSERT`, `SCENES`, `CUES`, `NARR_CAPTIONS` (film time). |
| `src/markup.js` | `buildStage()` HTML strings, with `R(ref)` → ` data-ref="ref"`. Holds `waReportLines()` (WhatsApp report), `nadiCard()` (NADI panel with the "Ringkasan e-ACD" block), and the closing markup in the overlay builder. |
| `src/engine.js` | Timing table `T` (story time), cameras, `renderTime(tf)`, `renderOverlays(t)`, the WhatsApp insert (`WA`, `WA_CAM`, `measureWa`, `renderWa`), the sound event builder, and `initMeasure()`. |
| `src/hero.js` | V10: hero elements, scans, no-still camera. Defines `stageRect`, `sceneBlurOne`, `lerpLog`, `driftHolds`, `floatXY` and the hero layer. |
| `src/v11.js` | V11: `initV11`, `renderV11` (flight), `renderClosing`, `closingTriad`, `closingRing`, `v11Sounds`. |
| `src/styles.css` | V11 styles appended at the end (`.fly*`, `.cl-triad`, `.cl-ring`…). |
| `tools/build-player.js` | Concatenates `['data.js','markup.js','kampung3d.js','engine.js','hero.js','v11.js','audio.js','player.js']`, inlines fonts, three.js and the narration (FLAC). |
| `tools/check-player.js` | Playwright suite (98 checks in V11, about 15 min). Progress goes to stderr. |
| `render-video.js` | Playwright → FFmpeg MP4 export (optional since V11). |
| `README-VIDEO.md` | BM documentation, newest version on top (`## Dokumentasi V10` below it). |
| `arkib/` | `vN-sumber.tar.gz` source archives. |

## 3. Clocks and beats

- **Story vs film time.** The story clock `t` drives scene logic; the film clock `ft` is what plays.
  - `TIMEMAP = [[0,0],[7.5,6.5],[18.85,13.35],[90.45,84.95],[104.45,84.95],[124.7,105.2],[133.75,112.35],[141.4,120]]`.
  - The story is frozen at 84.95 during the WhatsApp insert (film 90.45–104.45, `INSERT = { at: 84.95, len: 14, atF: 90.45 }`).
  - After the insert, film = story + 19.5 until the benefit cards (slower), then film = story + 21.4 in the closing.
- `T.l` (follow-up scene, story time): `in [84.85, 85.25]` (film 104.35–104.75), `expand [85.15, 85.95]` (film
  104.65–105.45), `n110 86.0` (film 105.5).
- WhatsApp insert (`u = ft − 90.45`):
  - `zoomOut [12.3, 13.5]` ends at film 103.95;
  - the phone fades at u 13.8–14.08 (film 104.25–104.53);
  - the dark ground fades at u 14–14.3.
- Narration (film):
  - w3 98.40–103.13 "Angka dalam mesej datang terus daripada rekod yang disimpan.";
  - c14 105.85 "Daripada analisa automatik sistem, enam premis belum dilawati, …";
  - c18 134.20–135.78 "Nadi Muallim.";
  - c19 135.80–139.89 "Dari survelan denggi kepada tindakan susulan di lapangan.";
  - existing sting at film 133.85.

## 4. Engine helpers

| Helper | Meaning |
|---|---|
| `seg(t, a, b, ease)` | 0 → 1 over [a, b], clamped, eased. |
| `win(t, a, b, c, d, e1, e2)` | Rises a→b, holds, falls c→d. |
| `kf(t, keys)` | Keyframes `[[time, value, ease?], …]`; the ease applies to the segment ending at that key. |
| `E.*` | Easings: `lin`, `inOutSine`, `inOutCubic`, `outCubic`, `inCubic`, `outBack`, `springSoft`, … |
| `lerp`, `lerpLog`, `clamp`, `mix` | Interpolation helpers. |
| `css(el, prop, v)`, `tf`, `op`, `vis`, `attr`, `cls`, `txt` | Memoised style/attribute writes. `vis` sets display `''`/`none`. `op` rounds to 0.001. |
| `px`, `r2`, `r5` | Number formatting. `r5` is for scales: coarse rounding makes slow zooms step. |
| `$[ref]`, `collectRefs(root)` | Element registry by `data-ref`. Inside `page.evaluate` use `$[…]`; `window.__ref` exists only in check mode. |
| `offsetWithin(el, anc)` | Layout offset via offsetParent (ignores transforms). Breaks if `anc` is not on the offsetParent chain. |
| `stageRect(el)` | Rect in stage px (1920 × 1080), independent of the player's fit scale. |
| `camLayer(el, c)` | `translate(sx,sy) scale(z) translate(−fx,−fy)`, transform-origin 0 0, so screen = s + z·(p − f). |
| `sceneBlurOne(ref, m)` | Blur 7·m px, brightness 1 − 0.28m, saturate 1 − 0.25m, or `none`. |

## 5. Layers, render order and init

- **Z order.** Overlays `.ov` 60 < WhatsApp set 70 < vignette 80 < hero layer 85 (the chips live here, inside
  `.fly`).
- **Render order.** `renderTime(tf)` → background, scenes, `renderNadi`, `renderOverlays(t)` (which calls
  `renderClosing(t, filmTime(t))`), `renderWa(tf − INSERT.atF)`, `renderHero(t, tf)`, `renderV11(t, tf)`. The flight
  runs last, so the NADI panel is already laid out when targets are measured.
- **Init.** `initMeasure()` → … → `initHero()` → `initV11()` (`initFlight` then `initClosing`).
- **Sounds.** `add(t, kind, opts)` takes story times, which are converted to film time. The film-time additions come
  after the conversion loop (`v11Sounds(add)` sits next to the WhatsApp ones). Kinds include `blip`, `pop`, `whoosh`,
  `whooshSoft`, `sting`, `confirm`, `shimmer`.

## 6. Markup hooks used by V11

- **WhatsApp report** (`waReportLines`): `wa.n0` 110, `wa.n1` 92, `wa.n2` 12 (inline spans around the figure in lines
  "1.", "2.", "3."), and `wa.n3` "84%" inside the bold Pencapaian line.
- **NADI block**:
  - tile numbers `na.kTargetN`, `na.kVisitedN`, `na.kLockedN`, `na.kLeftN` (from `kpi(…, ref)` → `R(ref + 'N')`);
  - the coverage figure `na.pct`;
  - tiles `na.kTarget` … `na.kLeft`;
  - block `na.proto`/`na.protoIn`.
- **Closing** (`ov.closing` children): jata, title, tag, `cl.triad` (words `cl.w0…cl.w7`), `cl.line` (slot), org.
  `cl.ring` SVG (`cl.path`, `cl.dot`, `cl.pulse`) is a sibling in `.ov`.

## 7. Build, check, deliver

```bash
S=/tmp/…/scratchpad   # when node_modules is missing, the tools live in the session scratchpad (paths change per session)
TAILWIND_BIN=$S/tw/node_modules/.bin/tailwindcss THREE_JS=$S/three-pkg/node_modules/three/build/three.min.js node tools/build-player.js
node tools/check-player.js   # ≈15 min; run in the background; read the "N/N checks passed" summary
```

- **Missing tools.** If `node_modules` is missing and the scratchpad tools are gone, install the dev dependencies
  (tailwindcss@3.4.17, three@0.158.0) in a scratch folder and point the env vars at them.
- **HD check.** Open the player (not `?render=1`) with `deviceScaleFactor: 2`. Expect `RENDER_SCALE` = 2, `version`
  = the new version, and no console errors.
- **Visual check.** Use one contact sheet of key frames at scale 1 (`?render=1`, `window.renderFrame(f)`).
- **Archive.** `tar czf arkib/vN-sumber.tar.gz src tools assets narasi-v9 package.json render-video.js README-VIDEO.md sari-kata-bm-v9.srt`
- **Send.** `video-showcase-vN.html` with the file-sending tool (attach).

## 8. Gotchas met in V11

- **Container defaults.** `.ov > * { position:absolute; left:0; top:0; opacity:0 }`: any new direct child of `.ov` is
  invisible until `op(el, 1)`.
- **SVG stroke.** `.cl-path { stroke: … }` overrides `attr(P, 'stroke', …)`; set the stroke with `css(P, 'stroke', …)`.
- **Selectors.** `querySelectorAll('.fly [data-ref]')` does not include `.fly` itself; register the container
  separately.
- **Flex columns.** `offsetWithin` across a non-positioned flex column walks past the ancestor. Measure slots with
  `stageRect` after setting the column's transform.
- **outBack overshoot.** Gate a pop on time (`ft < t0 + d`), not on `value < 1`: outBack exceeds 1 mid-way, and a value
  gate cuts the overshoot.
- **Clipped targets.** A target inside a growing `overflow:hidden` block still has a rect, but is clipped. Land after
  the block has finished opening.
- **Panel flicker rule (H1).** The 6 and 12 cards glow up exactly once and never drop. Landing feedback must be an
  overlay ping, never a box-shadow on the cards.
- **Closing hold check.** The closing lockup check measures in story time (film − 21.4 in the closing).
- **Size and offline.** The built HTML is ≈8 MB. Three.js internals mention `fetch(`, but the offline check (no
  requests) is what matters.
