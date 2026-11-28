/* V11 · two more techniques from the reference film (src/hero.js has the V10 three):
 *  4. the figures move — at the end of the WhatsApp insert the four figures of the report (110, 92, 12, 84 %) lift out
 *     of the message while the phone dissolves around them, then fly on short arcs with an echo trail to their places in
 *     the NADI "Ringkasan e-ACD" block, where a ping ripples out as each one lands (an overlay: the panel's own cards keep
 *     the V9 rule — one glow rise each, never switched off). The sixth figure (6 not visited) is not in the
 *     message: it appears in NADI once the three have landed. The WhatsApp chrome is gone before the flight, so the
 *     picture shows the same figures arriving in NADI, not a message being forwarded to it;
 *  5. a closing triad — the 200 m ring of the outbreak area is drawn as a line around a pulsing centre and unrolls into
 *     the lockup's divider (same length, 2πr); the lockup builds on the narration: title (c18), tagline (c19), then
 *     "Rekod di lapangan. Terus ke NADI. Susulan terancang." word by word (blur in, colour settles), then the
 *     organisation. The triad describes the workflow shown in the film; it states no outcome.
 * Every value is a function of the film time; positions are read from the laid-out page each frame (deterministic). */

/* ---------------------------------------------------------------- 4 · the figures move (film time) */
const FLY = {
  src: ['wa.n0', 'wa.n1', 'wa.n2', 'wa.n3'],                     // in the WhatsApp report: 110, 92, 12, 84%
  dst: ['na.kTargetN', 'na.kVisitedN', 'na.kLockedN', 'na.pct'],  // in the NADI summary block
  tile: ['na.kTarget', 'na.kVisited', 'na.kLocked', null],
  lift: 103.98, liftLen: 0.32, liftStep: 0.05,   // out of the message once the zoom-out has ended (103.95)
  fly: 104.75, flyLen: 0.7, flyStep: 0.06,       // after a short hover over the dissolve, to the block: the 110 lands as the block
                                                 // finishes opening (105.45) and the question tree's 110 appears (105.5)
  six: 105.82,                                   // the sixth figure appears (computed in NADI, not carried)
  arc: [120, 70, 150, 60], B: 40,                // arc height (px); chip text is set at B px and scaled
  echo: [[0.035, 0.38, 1.5], [0.07, 0.22, 3], [0.105, 0.12, 4.5]]   // echo trail: lag (s), opacity, blur (px)
};
const FLYM = { ok: false };
function flyTimes(i) {
  const l0 = FLY.lift + FLY.liftStep * i, f0 = FLY.fly + FLY.flyStep * i;
  return { lift: [l0, l0 + FLY.liftLen], fly: [f0, f0 + FLY.flyLen], land: f0 + FLY.flyLen };
}
function flyChip(ref) { return '<div class="fly-chip"' + R(ref) + '><i class="fly-pill"></i><span class="fly-src"></span><span class="fly-dst"></span></div>'; }
function copyFace(dst, src) {
  const cs = getComputedStyle(src);
  for (const p of ['fontFamily', 'fontWeight', 'color', 'letterSpacing']) dst.style[p] = cs[p];
  dst.style.fontSize = FLY.B + 'px';
}
/* where figure i is in the WhatsApp camera at film time ft: centre (stage px) and on-screen scale. Computed from the
 * camera keys and the layout offset (measured once), so it is defined after the insert has ended too. */
function flySrc(i, ft) {
  const c = kf(ft - INSERT.atF, WA_CAM), o = FLYM.src[i];
  const x0 = WA.ph.x + 12 + o.x + o.w / 2, y0 = WA.ph.y + 12 + o.y + o.h / 2;   // the screen sits 12 px inside the phone (measureWa)
  return { x: c.sx + c.z * (x0 - c.fx), y: c.sy + c.z * (y0 - c.fy), s: c.z };
}
/* where figure i belongs in the NADI block now (read from the page: the block grows and the panel scrolls meanwhile) */
function flyDst(i) {
  const el = $[FLY.dst[i]], r = stageRect(el);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2, s: el.offsetWidth ? r.w / el.offsetWidth : 1 };
}
/* chip state at film time ft: lift (rises 10 px, grows 14 %), then a quadratic arc onto the live target */
function flyState(i, ft) {
  const w = flyTimes(i), L = seg(ft, w.lift[0], w.lift[1], E.inOutCubic), fp = seg(ft, w.fly[0], w.fly[1], E.inOutCubic);
  const H = seg(ft, w.lift[1], w.fly[0], E.inOutSine);   // the hover drifts (never a still frame)
  const lifted = s => ({ x: s.x + 10 * H, y: s.y - 10 * L - 6 * H, k: s.s * FLYM.fsSrc[i] / FLY.B * (1 + 0.14 * L) });
  let x, y, k;
  if (ft < w.fly[0]) { const s = lifted(flySrc(i, ft)); x = s.x; y = s.y; k = s.k; }
  else {
    const a = lifted(flySrc(i, w.fly[0])), d = flyDst(i), kd = d.s * FLYM.fsDst[i] / FLY.B;
    const qx = (a.x + d.x) / 2, qy = Math.min(a.y, d.y) - FLY.arc[i], u = 1 - fp;
    x = u * u * a.x + 2 * u * fp * qx + fp * fp * d.x; y = u * u * a.y + 2 * u * fp * qy + fp * fp * d.y; k = lerpLog(a.k, kd, fp);
  }
  return { x, y, k, fp, mix: seg(fp, 0.3, 0.7, E.inOutSine), pill: L * (1 - seg(fp, 0.78, 1, E.inOutSine)) };
}
function placeChip(el, i, st, a) {
  const pill = el.children[0], fs = el.children[1], fd = el.children[2], w = FLYM.w[i];
  tf(el, 'translate(' + px(st.x) + ',' + px(st.y) + ') scale(' + r5(st.k) + ')');
  op(el, a); op(fs, 1 - st.mix); op(fd, st.mix);
  css(pill, 'width', px(lerp(w[0], w[1], st.mix) + 0.9 * FLY.B)); css(pill, 'height', px(1.3 * FLY.B)); op(pill, st.pill);
}
function initFlight() {
  let h = '<div class="fly"' + R('fly') + '>';
  for (let j = 0; j < 5; j++) h += '<i class="fly-ping"' + R('fly.k' + j) + '></i>';   // landing pings: 110, 92, 12, 84 %, 6
  for (let i = 0; i < 4; i++) { for (let k = 3; k >= 1; k--) h += flyChip('fly.e' + i + k); h += flyChip('fly.c' + i); }
  $['hero'].insertAdjacentHTML('beforeend', h + '</div>');
  $['fly'] = $['hero'].querySelector('.fly');
  $['fly'].querySelectorAll('[data-ref]').forEach(el => { $[el.dataset.ref] = el; });
  const L = $.wa; L.style.display = 'block';   // layout offsets of the figures inside the phone screen (as measureWa)
  FLYM.src = FLY.src.map(r => offsetWithin($[r], $['wa.screen']));
  L.style.display = '';
  FLYM.fsSrc = FLY.src.map(r => parseFloat(getComputedStyle($[r]).fontSize));
  FLYM.fsDst = FLY.dst.map(r => parseFloat(getComputedStyle($[r]).fontSize));
  FLYM.w = [];
  for (let i = 0; i < 4; i++) {
    for (const ref of ['fly.c' + i, 'fly.e' + i + '1', 'fly.e' + i + '2', 'fly.e' + i + '3']) {
      const fs = $[ref].children[1], fd = $[ref].children[2];
      fs.textContent = $[FLY.src[i]].textContent; fd.textContent = $[FLY.dst[i]].textContent;
      copyFace(fs, $[FLY.src[i]]); copyFace(fd, $[FLY.dst[i]]);
    }
    FLYM.w.push([$['fly.c' + i].children[1].offsetWidth, $['fly.c' + i].children[2].offsetWidth]);
  }
  vis($['fly'], false);
  FLYM.ok = true;
}
function renderFlight(t, ft) {
  if (!FLYM.ok) return;
  const late = t >= 60, W3 = flyTimes(3);
  // the figures leave the message: hidden under their chips from the lift on
  for (let i = 0; i < 4; i++) op($[FLY.src[i]], ft >= flyTimes(i).lift[0] ? 0 : 1);
  // the phone goes out of focus around the lifted figures (it fades out anyway at 104.25–104.53)
  const u = ft - INSERT.atF;
  sceneBlurOne('wa.camera', u >= 0 && u <= INSERT.len + 0.3 ? seg(ft, FLY.lift, FLY.lift + 0.35, E.inOutSine) : 0);
  // NADI: each figure shows when its chip lands; the sixth is computed once the three are in
  for (let i = 0; i < 4; i++) { const w = flyTimes(i); op($[FLY.dst[i]], late ? seg(ft, w.land - 0.04, w.land + 0.06) : 1); }
  const six = $['na.kLeftN'];
  op(six, late ? seg(ft, FLY.six, FLY.six + 0.12) : 1);
  tf(six, late && ft < FLY.six + 0.45 ? 'scale(' + r5(Math.max(0.01, lerp(0.6, 1, seg(ft, FLY.six, FLY.six + 0.45, E.outBack)))) + ')' : 'none');
  // landing pings: a ring ripples out from the tile (the 84 %: its text) and fades — an overlay, the panel is not restyled
  const on = ft >= FLY.lift && ft <= FLY.six + 0.6;
  vis($['fly'], on); if (!on) return;
  [[FLY.tile[0], flyTimes(0).land], [FLY.tile[1], flyTimes(1).land], [FLY.tile[2], flyTimes(2).land], ['na.pct', W3.land], ['na.kLeft', FLY.six]].forEach(([ref, t0], j) => {
    const el = $['fly.k' + j], live = late && ft >= t0 && ft <= t0 + 0.55;
    vis(el, live); if (!live) return;
    const r = stageRect($[ref]), p = seg(ft, t0, t0 + 0.55, E.outCubic), pad = ref === 'na.pct' ? 4 : 2;
    css(el, 'left', px(r.x - pad)); css(el, 'top', px(r.y - pad)); css(el, 'width', px(r.w + 2 * pad)); css(el, 'height', px(r.h + 2 * pad));
    tf(el, 'scale(' + r5(1 + 0.12 * p) + ')'); op(el, win(ft, t0, t0 + 0.05, t0 + 0.12, t0 + 0.55, E.outCubic, E.inOutSine));
  });
  // the chips and their echo trails (echoes only while moving)
  for (let i = 0; i < 4; i++) {
    const w = flyTimes(i), alive = ft >= w.lift[0] && ft <= w.land + 0.25, c = $['fly.c' + i];
    vis(c, alive);
    const st = alive ? flyState(i, ft) : null, speed = st ? Math.sin(Math.PI * st.fp) : 0;
    if (st) placeChip(c, i, st, 1 - seg(ft, w.land + 0.1, w.land + 0.24));
    for (let k = 1; k <= 3; k++) {
      const e = $['fly.e' + i + k], [lag, o, b] = FLY.echo[k - 1], eo = o * speed;
      vis(e, eo > 0.01);
      if (eo > 0.01) { placeChip(e, i, flyState(i, ft - lag), eo); css(e, 'filter', 'blur(' + b + 'px)'); }
    }
  }
}

/* ---------------------------------------------------------------- 5 · closing triad (film time) */
const TRIAD = [['Rekod', 'di', 'lapangan.'], ['Terus', 'ke', 'NADI.'], ['Susulan', 'terancang.']];
const CLOSE = {
  ring: [133.78, 134.32], dot: 133.8, pulse: [134.0, 134.75], R: 56,   // the 200 m ring, drawn as the benefit cards leave (sting 133.85)
  jata: 134.05, title: 134.2,                                         // c18 "NADI Muallim." 134.20
  unroll: [134.85, 135.55],                                           // ring → divider
  tag: 135.8, triad: [136.5, 137.1, 137.7], step: 0.12,              // c19 135.80–139.89
  org: 138.45
};
const CLM = { ok: false };
function closingTriad() {
  let k = 0;
  return '<div class="cl-triad"' + R('cl.triad') + '>' + TRIAD.map(g => '<span class="cl-g">' +
    g.map(w => '<span class="cl-w"' + R('cl.w' + (k++)) + '>' + (w === 'NADI.' ? '<b class="cl-wn">NADI</b>.' : w) + '</span>').join(' ') + '</span>').join('') + '</div>';
}
function closingRing() {
  return '<svg class="cl-ring"' + R('cl.ring') + ' width="1920" height="1080" viewBox="0 0 1920 1080">' +
    '<circle class="cl-pulse"' + R('cl.pulse') + ' r="8"/><path class="cl-path"' + R('cl.path') + ' pathLength="1"/><circle class="cl-dot"' + R('cl.dot') + ' r="7"/></svg>';
}
function initClosing() {
  const cl = $['ov.closing'];
  CLM.y0 = Math.round(444 - cl.offsetHeight / 2);   // the V9 lockup's optical centre (y ≈ 444)
  tf(cl, 'translate(0px,' + px(CLM.y0) + ')');
  const r = stageRect($['cl.line']);
  CLM.anchor = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
  CLM.words = TRIAD.flat().map((w, k) => $['cl.w' + k]);
  CLM.ok = true;
}
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function mixHex(a, b, p) { const A = hexRgb(a), B = hexRgb(b); return 'rgb(' + A.map((v, i) => Math.round(lerp(v, B[i], p))).join(',') + ')'; }
/* fade + blur + rise; settles to no filter and no transform (sharp text) */
function blurIn(el, ft, t0, d, b, dy) {
  const a = seg(ft, t0, t0 + d, E.outCubic);
  op(el, seg(ft, t0, t0 + d * 0.7));
  css(el, 'filter', a > 0 && a < 0.999 ? 'blur(' + r2(b * (1 - a)) + 'px)' : 'none');
  tf(el, a < 0.999 ? 'translateY(' + px(dy * (1 - a)) + ') scale(' + r5(lerp(0.97, 1, a)) + ')' : 'none');
}
/* the ring: an arc of fixed length 2πR tangent to the divider at its centre; curvature (1 − m) / R — a full circle at
 * m = 0, the straight divider at m = 1 */
function ringPath(m) {
  const A = CLM.anchor, R0 = CLOSE.R, L = 2 * Math.PI * R0, N = 120;
  let d = '';
  for (let j = 0; j <= N; j++) {
    const s = -L / 2 + L * j / N;
    let x = A.x + s, y = A.y;
    if (m < 0.9999) { const rho = R0 / (1 - m), th = s / rho; x = A.x + rho * Math.sin(th); y = A.y - rho * (1 - Math.cos(th)); }
    d += (j ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return d;
}
function renderClosing(t, ft) {
  const cl = $['ov.closing'];
  op(cl, t >= T.n.title - 0.05 ? 1 : 0);
  if (!CLM.ok) return;
  tf(cl, 'translate(0px,' + px(CLM.y0) + ')');
  const [jata, title, tag, , , org] = cl.children;
  const aj = seg(ft, CLOSE.jata, CLOSE.jata + 0.45, E.outCubic);
  op(jata, aj); tf(jata, 'translateY(' + px(20 * (1 - aj)) + ') scale(' + r5(lerp(0.88, 1, seg(ft, CLOSE.jata, CLOSE.jata + 0.55, E.springSoft))) + ')');
  blurIn(title, ft, CLOSE.title, 0.5, 14, 0);
  blurIn(tag, ft, CLOSE.tag, 0.45, 10, 10);
  op($['cl.triad'], 1);
  let k = 0;
  TRIAD.forEach((g, gi) => g.forEach((w, j) => {
    const el = CLM.words[k++], t0 = CLOSE.triad[gi] + CLOSE.step * j, c = seg(ft, t0 + 0.1, t0 + 0.8, E.inOutSine);
    blurIn(el, ft, t0, 0.45, 10, 12);
    css(el, 'color', mixHex('#fde68a', '#d1fae5', c));
    if (w === 'NADI.') css(el.firstElementChild, 'color', mixHex('#fde68a', '#34d399', c));
  }));
  const ao = seg(ft, CLOSE.org, CLOSE.org + 0.5, E.outCubic);
  op(org, ao); tf(org, 'translateY(' + px(14 * (1 - ao)) + ')');
  // the ring and its divider
  const rg = $['cl.ring'], on = ft >= CLOSE.ring[0];
  op(rg, on ? 1 : 0); vis(rg, on);
  if (!on) return;
  const m = seg(ft, CLOSE.unroll[0], CLOSE.unroll[1], E.inOutCubic), P = $['cl.path'];
  attr(P, 'd', ringPath(m));
  attr(P, 'stroke-dashoffset', String(r2(1 - seg(ft, CLOSE.ring[0], CLOSE.ring[1], E.inOutCubic))));
  css(P, 'stroke', mixHex('#34d399', '#fbbf24', seg(ft, CLOSE.unroll[0] + 0.15, CLOSE.unroll[1] + 0.15, E.inOutSine)));
  const cx = String(CLM.anchor.x), cy = String(r2(CLM.anchor.y - CLOSE.R));
  const dp = seg(ft, CLOSE.dot, CLOSE.dot + 0.35, E.outBack), dOut = seg(ft, CLOSE.unroll[0], CLOSE.unroll[0] + 0.25);
  attr($['cl.dot'], 'cx', cx); attr($['cl.dot'], 'cy', cy); attr($['cl.dot'], 'r', String(r2(7 * Math.max(0.01, dp))));
  attr($['cl.dot'], 'opacity', String(r2((ft >= CLOSE.dot ? 1 : 0) * (1 - dOut))));
  const pp = seg(ft, CLOSE.pulse[0], CLOSE.pulse[1], E.outCubic);
  attr($['cl.pulse'], 'cx', cx); attr($['cl.pulse'], 'cy', cy); attr($['cl.pulse'], 'r', String(r2(lerp(8, CLOSE.R * 1.9, pp))));
  attr($['cl.pulse'], 'opacity', String(r2(ft >= CLOSE.pulse[0] && ft <= CLOSE.pulse[1] ? 0.7 * (1 - pp) : 0)));
}

/* ---------------------------------------------------------------- set-up, frame, sound */
function initV11() { initFlight(); initClosing(); }
function renderV11(t, ft) { renderFlight(t, ft); }
function v11Sounds(add) {   // film time
  for (let i = 0; i < 4; i++) add(flyTimes(i).land, 'blip', { f: 1250 + 120 * i, soft: 1 });
  add(CLOSE.unroll[0] + 0.05, 'whooshSoft');
}
