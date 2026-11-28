# Checks for the two techniques (Playwright, from the NADI Muallim V11 suite)

These run inside `tools/check-player.js` (`R.page` is a Playwright page on the built player; `window.__ref(name)` returns a ref, `window.__eff(el)` the effective opacity incl. ancestors and display, `window.__atF(t)` renders film time t, `window.renderFrame(f)` frame f at 60 fps). Port the measurements, not the plumbing: each check renders the exact frame of a hand-off and measures rects, styles and the SVG path.

What each check proves:

- **DM1 lift**: chip text centre within 1.5 px and size within 5 % of the source figure on the lift frame; source hidden from that frame; scene behind blurred ≥ 5 px; chips unfiltered.
- **DM2 landing**: chip centre within 1 px of the live target on the landing frame; target opacity 0 six frames before and ≥ 0.98 six frames after; ping covers the tile; chip gone; derived figure hidden until after the last landing; one blip per landing in the sound events.
- **DM3 motion**: three blurred echoes mid-flight, none at rest; the hover never repeats a transform two frames running.
- **TR1 ring**: the drawn ring is a circle (radius ± 0.5 px); after the unroll the path is a straight line on the divider slot (± 0.5 px) of length 2πR ± 1 px, final colour gold.
- **TR2 triad**: title hidden before its cue and in after; tagline hidden before its cue; words reach 50 % opacity in order; everything opaque and unfiltered by the lockup deadline.

Also re-run every existing check. In V11 the old panel-stability check (H1: each card glows up once and never drops) failed on the first draft because the landings flashed the cards themselves; the fix was overlay pings, not loosening H1. Update an existing check only when the design intentionally changes what it measures (V11: the closing lockup now completes at film 139.0 instead of 134.6), and say so in its name.

```js
    // V11 (src/v11.js): the figures move from the WhatsApp report to the NADI summary block
    const dm = await R.page.evaluate(() => {
      const q = r => window.__ref(r), F = t => Math.round(t * 60), out = { lift: [], land: [] };
      const box = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; };
      for (let i = 0; i < 4; i++) {
        const w = flyTimes(i), f0 = Math.ceil(w.lift[0] * 60);
        window.renderFrame(f0 - 1); const shownBefore = +getComputedStyle(q(FLY.src[i])).opacity;
        window.renderFrame(f0); const c = box(q('fly.c' + i).children[1]), s = box(q(FLY.src[i]));
        out.lift.push({ d: +Math.hypot(c.x - s.x, c.y - s.y).toFixed(2), size: +(c.h / s.h).toFixed(3), srcGone: +getComputedStyle(q(FLY.src[i])).opacity === 0 && shownBefore === 1,
          chipOn: window.__eff(q('fly.c' + i)) > 0.98 });
        const fl = Math.round(w.land * 60);
        window.renderFrame(fl - 6); const hidden = +getComputedStyle(q(FLY.dst[i])).opacity;
        window.renderFrame(fl); const lc = box(q('fly.c' + i).children[2]), ds = box(q(FLY.dst[i]));
        window.renderFrame(fl + 6); const shown = window.__eff(q(FLY.dst[i]));
        window.renderFrame(fl + 6); const pk = q('fly.k' + i).getBoundingClientRect(), tb = q(FLY.tile[i] || 'na.pct').getBoundingClientRect();   // the landing ping, over its tile
        const lit = window.__eff(q('fly.k' + i)) > 0.5 && pk.left <= tb.left && pk.right >= tb.right && pk.top <= tb.top && pk.bottom >= tb.bottom;
        window.renderFrame(F(w.land + 0.26)); const chipGone = !window.__eff(q('fly.c' + i));
        out.land.push({ d: +Math.hypot(lc.x - ds.x, lc.y - ds.y).toFixed(2), hidden, shown: +shown.toFixed(2), lit, chipGone });
      }
      const W0 = flyTimes(0), W3 = flyTimes(3);
      window.renderFrame(F(W0.lift[1] + 0.05)); const m = /blur\(([\d.]+)px\)/.exec(getComputedStyle(q('wa.camera')).filter); out.phoneBlur = m ? +m[1] : 0;
      out.chipSharp = getComputedStyle(q('fly.c0')).filter === 'none' && getComputedStyle(q('fly')).filter === 'none';
      window.renderFrame(F((W0.fly[0] + W0.fly[1]) / 2)); out.echoes = [1, 2, 3].map(k => window.__eff(q('fly.e0' + k)) > 0.05 && /blur/.test(q('fly.e0' + k).style.filter));
      window.renderFrame(F(W0.lift[1] + 0.1)); out.noEchoAtRest = [1, 2, 3].every(k => !window.__eff(q('fly.e0' + k)));
      window.renderFrame(F(FLY.six - 0.02)); out.sixBefore = +getComputedStyle(q('na.kLeftN')).opacity;
      window.renderFrame(F(FLY.six + 0.5)); out.sixAfter = +window.__eff(q('na.kLeftN')).toFixed(2); out.sixAfterLast = FLY.six > W3.land;
      // the hover between lift and flight is never still
      let still = 0, best = 0, prev = null; for (let f = F(W0.lift[1]); f <= F(W0.fly[0]); f++) { window.renderFrame(f); const v = q('fly.c0').style.transform; if (v === prev) { still++; best = Math.max(best, still); } else still = 0; prev = v; }
      out.hoverStill = best;
      const ev = window.ACD.soundEvents().filter(e => e.k === 'blip').map(e => e.t);
      out.blips = [0, 1, 2, 3].every(i => ev.some(x => Math.abs(x - flyTimes(i).land) < 0.002));
      return out;
    });
    check('DM1 V11 the figures move: 110, 92, 12 and 84% lift out of the WhatsApp report from their own place (≤ 1.5 px, size within 5 %) and leave it, sharp in front of the phone going out of focus (≥ 5 px)',
      dm.lift.every(x => x.d <= 1.5 && Math.abs(x.size - 1) <= 0.05 && x.srcGone && x.chipOn) && dm.phoneBlur >= 5 && dm.chipSharp, JSON.stringify({ lift: dm.lift, phoneBlur: dm.phoneBlur, chipSharp: dm.chipSharp }));
    check('DM2 V11 each figure lands on its place in the NADI "Ringkasan e-ACD" block (≤ 1 px): hidden there before, shown after, a ping over its tile, the chip gone; the 6 (not in the message) appears only after the last lands; a blip per landing',
      dm.land.every(x => x.d <= 1 && x.hidden === 0 && x.shown >= 0.98 && x.lit && x.chipGone) && dm.sixBefore === 0 && dm.sixAfter >= 0.98 && dm.sixAfterLast && dm.blips, JSON.stringify({ land: dm.land, six: [dm.sixBefore, dm.sixAfter], blips: dm.blips }));
    check('DM3 V11 the flight leaves an echo trail (three blurred echoes mid-flight, none at rest) and the hover before it drifts (no two equal frames in a row)',
      dm.echoes.every(Boolean) && dm.noEchoAtRest && dm.hoverStill <= 1, JSON.stringify({ echoes: dm.echoes, noEchoAtRest: dm.noEchoAtRest, hoverStill: dm.hoverStill }));
    // V11: the closing — the 200 m ring unrolls into the divider; the triad builds word by word on c19
    const tr = await R.page.evaluate(() => {
      const q = r => window.__ref(r), out = {};
      const pts = () => q('cl.path').getAttribute('d').slice(1).split('L').map(p => p.trim().split(' ').map(Number));
      window.__atF(CLOSE.ring[1] + 0.02); const A = CLM.anchor, c = [A.x, A.y - CLOSE.R], p0 = pts();
      out.circle = +Math.max(...p0.map(p => Math.abs(Math.hypot(p[0] - c[0], p[1] - c[1]) - CLOSE.R))).toFixed(2);
      out.drawn = +q('cl.path').getAttribute('stroke-dashoffset');
      window.__atF(CLOSE.unroll[1] + 0.4); const p1 = pts();
      out.lineY = +Math.max(...p1.map(p => Math.abs(p[1] - A.y))).toFixed(2);
      out.lineLen = +(Math.max(...p1.map(p => p[0])) - Math.min(...p1.map(p => p[0]))).toFixed(1); out.len = +(2 * Math.PI * CLOSE.R).toFixed(1);
      out.gold = getComputedStyle(q('cl.path')).stroke;
      const slot = q('cl.line').getBoundingClientRect(); out.slot = +Math.abs(slot.top + slot.height / 2 - A.y).toFixed(2);
      // word onsets in order, each on or after its group time
      const onset = el => { for (let f = Math.round(CLOSE.triad[0] * 60) - 2; f <= Math.round(139 * 60); f++) { window.renderFrame(f); if (window.__eff(el) >= 0.5) return f / 60; } return null; };
      out.onsets = CLM.words.map(onset);
      out.ordered = out.onsets.every((t, k) => t !== null && (k === 0 || t > out.onsets[k - 1]));
      window.__atF(CLOSE.title - 0.02); out.titleBefore = window.__eff(q('ov.closing').children[1]);
      window.__atF(CLOSE.title + 0.6); out.titleIn = +window.__eff(q('ov.closing').children[1]).toFixed(2);
      window.__atF(CLOSE.tag - 0.02); out.tagBefore = window.__eff(q('ov.closing').children[2]);
      window.__atF(139.0); out.allIn = [...q('ov.closing').children].filter((e, i) => i !== 4).every(e => window.__eff(e) > 0.98) && CLM.words.every(w => window.__eff(w) > 0.98 && getComputedStyle(w).filter === 'none');
      return out;
    });
    check('TR1 V11 closing ring: the 200 m ring is drawn as a full circle (radius within 0.5 px) and unrolls into the divider — a straight line on its layout slot (≤ 0.5 px) of the same length (2πr ± 1 px), turned gold',
      tr.circle <= 0.5 && tr.drawn <= 0.001 && tr.lineY <= 0.5 && Math.abs(tr.lineLen - tr.len) <= 1 && tr.gold === 'rgb(251, 191, 36)' && tr.slot <= 0.5, JSON.stringify(tr));
    check('TR2 V11 closing triad: "NADI Muallim" on c18, the tagline on c19, then "Rekod di lapangan. Terus ke NADI. Susulan terancang." word by word in order; everything in, sharp, by 139.0 s',
      tr.ordered && tr.titleBefore === 0 && tr.titleIn >= 0.98 && tr.tagBefore === 0 && tr.allIn, JSON.stringify({ onsets: tr.onsets, title: [tr.titleBefore, tr.titleIn], tagBefore: tr.tagBefore, allIn: tr.allIn }));
```
