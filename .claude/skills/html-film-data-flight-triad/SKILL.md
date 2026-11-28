---
name: html-film-data-flight-triad
description: >-
  Adds two motion techniques to a deterministic HTML/JS film player (renders any frame on demand, e.g. window.renderFrame(f); MP4 via Playwright/FFmpeg): (1) a "data moves" transition - figures lift out of one UI (phone message, report), fly on arcs with an echo trail and land exactly on their places in another UI (dashboard tiles) with overlay pings, derived figures appearing only in the target; (2) a closing triad lockup - a ring drawn as a stroke unrolls into the divider (same length, 2*pi*r) while title, tagline, a three-part phrase (word-by-word blur-in) and organisation build on the narration. Use whenever the user wants numbers or data to fly, move or flow between screens, to link a WhatsApp or report view to a dashboard such as NADI, to add a tagline triad, kinetic typography or end-card lockup, to morph a ring into a line, or to apply After Effects-style reference techniques to the NADI Muallim / e-ACD film or a similar HTML film, even without these words (e.g. "angka terbang ke NADI").
---

# Data flight + closing triad for deterministic HTML films

This skill captures an edit that worked: V11 of the NADI Muallim pitch film. It passed 98/98 player checks and was
delivered as an HD standalone HTML.
- `assets/v11-example.js` is the working implementation.
- `assets/v11-styles.css` holds its styles.
- `references/checks.md` holds the checks that proved it.
- `references/nadi-muallim.md` describes the project: files, engine helpers, clocks, constraints and commands. Read it
  first when the work is on that film.

For another film, adapt the same recipe to that engine's helpers.

## Why the approach looks like this

A film player that renders frames on demand has one rule that shapes everything: **every visual must be a pure
function of film time.** The exporter renders frames in order, but checks and scrubbing jump to arbitrary frames, so
nothing may depend on what an earlier frame did. This rule leads to three habits:

- **Read layout every frame for moving targets.** Use `getBoundingClientRect` relative to the stage, divided by the
  stage scale. A target block that is expanding or scrolling is then hit exactly.
- **Compute sources analytically when their layer may be hidden.** An element under `display:none` returns a zero
  rect. Measure its layout offset once (at init, with the layer shown briefly), then project it through the layer's
  camera keyframes for any time.
- **Never cache state between frames.** Style writes may be memoised (only write a value that changed), but the value
  itself comes from the time.

A hand-off is only convincing if it is invisible:
- **On the lift frame,** the flying chip must match the source glyph: same font face, same on-screen size (computed
  font-size × camera zoom), `line-height: normal` so the centres agree. Hide the original in that same frame.
- **On the landing frame,** the chip must sit on the live target (≤ 1 px). Keep the chip opaque until the target is
  fully shown, so the crossfade has no brightness dip.

## Technique 1 — the figures move (source UI → target UI)

**Plan the beats before writing code.**
1. List the carried figures and their exact target elements. List the derived figures separately (V11: 6 not visited
   = 110 − 92 − 12). Derived figures are not carried; they appear in the target after the carried ones land, which
   shows the target system computing them.
2. Find the windows:
   - when the source view is settled (camera move ended);
   - when the source layer fades;
   - when the target block is fully open and no longer moving.

   Land on that last moment, not before. In the first V11 draft the chips flew while the target block was still
   clipped, and they appeared to land on unrelated cards.
3. Pick an existing beat to land on (a matching node popping elsewhere, a narration onset). V11 landed "110" at 105.45 s,
   the same moment the question tree's 110 appeared (105.5 s).

**Honest data flow.** A flight from app A to app B reads as "A sends data to B".
- Remove A's chrome (blur and fade the phone) before the flight starts, so the picture says "the same figures arrive
  in B".
- Keep B's simulation/prototype badges visible.
- In your report, flag the remaining risk that viewers still read it as A feeding B. Say whether a technical audience
  would care.

**Recipe (V11 values, film seconds).** Code: `flyTimes`, `flySrc`, `flyDst`, `flyState`, `placeChip` and
`renderFlight` in `assets/v11-example.js`.

| Phase | What happens | V11 numbers |
|---|---|---|
| Lift | Chip appears exactly over the source figure, rises 10 px and grows 14 %. A white pill with a teal ring fades in around it. The source layer blurs (7 px) and dims. The original figure is hidden from this frame on. | 0.32 s each, 0.05 s stagger, inOutCubic |
| Hover | Chips drift slowly (+10 px x, −6 px y) while the scenes cross-fade, so no frame is still. | until the flight |
| Flight | Quadratic Bézier from the lifted point to the live target. The control point sits above the higher end by an arc height. Scale goes from source size to target size in log space (`lerpLog`). The typeface crossfades from the source font to the target font at fp 0.3–0.7. The pill fades out at fp 0.78–1. | 0.7 s each, 0.06 s stagger, inOutCubic; arcs 60–150 px |
| Echo trail | Three copies of the chip drawn at `state(t − lag)`, with opacity × sin(π·fp), so they only show while moving. | lags 0.035/0.07/0.105 s; opacity 0.38/0.22/0.12; blur 1.5/3/4.5 px |
| Landing | Target figure fades in at its place (hidden until then). Chip fades out 0.1–0.24 s later. An overlay ping (rounded ring over the tile) scales to 1.12 and fades in 0.55 s. One soft blip per landing. | — |
| Derived | The derived figure pops (scale 0.6 → 1, outBack) after the last landing, with its own ping. | +0.2 s after the last landing |

Render the chips in a stage-level layer above every scene (V11: the hero layer, z 85). Build them once at init: one
chip plus three echoes per figure, each with a pill and two text faces whose fonts are copied from source and target
via `getComputedStyle`. Hide the layer outside its window.

**Do not restyle the target panel to celebrate a landing.** Projects that fought panel flicker often have a rule such
as "each card glows up once and stays" (NADI's H1 check). Box-shadow flashes on the cards broke that rule in V11. Pings
in the overlay layer give the same feedback without touching the panel.

## Technique 2 — closing triad with a ring that becomes the divider

**Layout.**
- Put the lockup in one centred column: emblem, title, tagline, triad row, a divider *slot*, organisation.
- The slot is an empty 1 × 3 px element that reserves the space; the SVG draws the line.
- At init, measure the column height, choose `y0` to keep the previous optical centre, then measure the slot's stage
  rect. That rect's centre is the ring's anchor.

**Ring path (constant length).** The ring of radius R is an arc of fixed length L = 2πR, tangent to the divider at the
anchor, with curvature (1 − m)/R:
- m = 0 gives the full circle sitting on the anchor;
- m = 1 gives the straight divider, of length 2πR.

For 0 < m < 1:

```
ρ = R/(1 − m),  θ = s/ρ  for s ∈ [−L/2, L/2]
x = A.x + ρ·sin θ,  y = A.y − ρ·(1 − cos θ)
```

Sample about 120 points into the path `d` each frame (`ringPath` in the example). To draw the ring on, set
`pathLength="1"`, `stroke-dasharray: 1 1`, and take the dashoffset from 1 to 0. Change the stroke colour through
`style`, not the `stroke` attribute: a CSS rule on the class silently overrides presentation attributes, which is why
V11's first draft stayed teal.

**Build on the narration.**

| Element | V11 timing (film s) |
|---|---|
| Ring draw (with a centre dot and one heartbeat pulse) | 133.78–134.32 |
| Emblem | 134.05 |
| Title, blur-in, on c18 "NADI Muallim." | 134.20 |
| Ring unrolls (teal → gold) | 134.85–135.55 |
| Tagline, on c19 | 135.80 |
| Triad groups, words 0.12 s apart | 136.5 / 137.1 / 137.7 |
| Organisation | 138.45 |

`blurIn` (in the example) fades, un-blurs (10–14 px → 0) and rises (10–12 px). It ends with `filter: none` and
`transform: none`, because filtered or transformed text is not drawn as sharply. Each word's colour settles from
amber-200 (#fde68a) to its final colour over 0.7 s; a word that carries the product name settles to the title's green.

**Content rules.**
- The triad describes the workflow shown in the film ("Rekod di lapangan. Terus ke NADI. Susulan terancang."). It
  makes no outcome claims: never "save time" or "avoid errors" without evidence.
- Do not put rings or badges around a national emblem (Jata Negara). Altering or framing an official emblem can be seen
  as misuse.
- Tell the user the trade-offs:
  - a lockup that builds over ~5 s leaves less hold time for the complete end card (V11: 2.45 s, V10: 7 s);
  - on-screen triad text that differs from the spoken line competes with it.

## Wiring (any engine)

1. **Markup hooks.**
   - Wrap each source figure in a span with a ref (inline spans do not change layout).
   - Give refs to the target figure elements.
   - Add the triad markup, the divider slot and the ring SVG.
   - Check for container defaults that hide new direct children (NADI: `.ov > * { opacity: 0 }`) and set their opacity
     explicitly.
2. **Init after first measure.** Build the chips, measure source offsets and font sizes, measure the lockup and its
   anchor.
3. **Per frame.**
   - Call the flight renderer after every scene layer has been set, so targets are measured in place.
   - Render the closing from the overlay renderer.
4. **Sounds.** Add film-time events: a soft blip per landing and a soft whoosh for the unroll. Keep them sparse; the
   music and narration carry the scene.
5. **Checks.** Add the DM1–DM3 and TR1–TR2 equivalents from `references/checks.md`, then run the whole suite. A failure
   in an older check usually means the new effect broke an earlier promise. Fix the effect rather than the check,
   unless the design change is intentional and documented.

## Look before you finish

Render a handful of frames at scale 1 (lift, mid-flight, landing, ring drawn, unroll, final lockup) and put them in one
contact sheet to save tokens. Look for:
- chips crossing unrelated content;
- landings while the target is clipped or moving;
- text that is still blurred at rest;
- a wrong final colour.

Then run the full check suite.

## Delivery conventions that worked

- **Versioning.** Bump the version everywhere: build output name, checks default, render defaults, package scripts,
  player `version`. Keep earlier players and exports for comparison, and archive the sources (`arkib/vN-sumber.tar.gz`).
- **Documentation.** Write a README section with a timing table per technique, the new checks, and a "Perlu perhatian"
  list of honest caveats. Use confidence labels where interpretation is uncertain.
- **Deliverable.** Deliver the standalone HD HTML (canvases follow stage scale × devicePixelRatio). Render the MP4 only
  if the user wants it. When the MP4 is skipped, say which MP4-only checks (freeze, panel blink, narration correlation)
  did not run.
- **Pushing.** Never push until the user says the version is final.
