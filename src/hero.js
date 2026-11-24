/* V10 · three techniques from the reference film (a SaaS promo cut in After Effects), applied to NADI Muallim:
 *  1. hero elements — a key control is lifted out of its screen, enlarged in front of a blurred scene, used, and put back
 *     exactly where it was: the visit-status choice (c07 "…status lawatan…"), Save → progress ring → ✓ that flies onto
 *     the "Rekod disimpan" card and unrolls it (c09), and the supervisor's "Rancang lawatan susulan" (c16);
 *  2. scans — brackets and a sweep show the automatic count: the saved record is read line by line and the band reaches
 *     the team tally as it updates (c09); a radar sweep over Kg. Ketoyong finds the 6 premises not visited, then the 12
 *     locked or empty ones, each marker appearing as the sweep crosses it (c14–c15);
 *  3. no still camera — camera holds drift slowly (driftHolds) and the follow-up map breathes behind the panel (the panel
 *     itself stays still: the V9 shimmer fix).
 * Every value is a function of the film time; hero positions are read from the laid-out page each frame (deterministic). */

const HV = { ok: false };
/* hero windows in film time, from the story beats (engine.js T) */
function heroTimes() {
  const tap = filmTime(T.g.tapStatus), save = filmTime(T.h.save), tick = filmTime(T.h.tick), click = filmTime(T.l.click);
  return {
    status: { lift: [tap - 0.32, tap - 0.02], back: [tap + 1.13, tap + 1.48], tap, at: [990, 500], width: 800 },
    save: { lift: [save - 0.42, save - 0.1], tap: save, morph: [save + 0.05, save + 0.3], spin: [save + 0.08, tick - 0.12], tick: [tick - 0.15, tick],
            fly: [tick, tick + 0.36], unroll: [tick + 0.32, tick + 0.63], at: [960, 520], width: 760 },
    dec: { lift: [click - 0.28, click - 0.04], back: [click + 0.25, click + 0.6], click, at: [1290, 520], grow: 1.6,
           out: [filmTime(NCUR[1].out[0]), filmTime(NCUR[1].out[1])] }
  };
}
/* radar sweeps over Kg. Ketoyong (story time): first the 6 not visited, then the 12 locked / empty */
const RADAR = { sweeps: [[87.5, 89.9], [90.4, 92.4]], R: 88, brackets: [87.2, 92.9] };
const angOf = p => { const a = Math.atan2(p.y - KET.y, p.x - KET.x) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
function redT(i) { const s = RADAR.sweeps[0]; return s[0] + angOf(FOLLOW_POS[i]) / 360 * (s[1] - s[0]); }
function amberT(i) { const s = RADAR.sweeps[1]; return s[0] + angOf(LOCKED_POS[i]) / 360 * (s[1] - s[0]); }
/* the record scan (story time): brackets on the record + tally, the band reaching the tally as it updates (T.h.count) */
const SCAN_A = () => ({ in: [T.h.tick + 0.5, T.h.tick + 0.7], band: [T.h.tick + 0.62, T.h.count], out: [T.h.count + 0.2, T.h.count + 0.5] });

/* ---------------------------------------------------------------- markup (stage layer above the vignette) */
function heroLayer() {
  const touch = n => '<div class="touch hero-touch"' + R('hero.touch' + n) + '><i class="ripple"' + R('hero.rip' + n) + '></i></div>';
  return '<div class="hero"' + R('hero') + '>' +
    '<div class="hero-unit"' + R('hero.status') + '><div class="hero-bd"' + R('hero.statusBd') + '></div><div class="hero-body"' + R('hero.statusBody') + '></div>' + touch(1) + '</div>' +
    '<div class="hero-unit"' + R('hero.save') + '><div' + R('hero.pill') + '></div>' +
      '<svg class="hero-ring" viewBox="0 0 100 100"' + R('hero.ring') + '><circle class="hr-arc" cx="50" cy="50" r="40" pathLength="1"' + R('hero.arc') + '/>' +
      '<path class="hr-tick" d="M31 51 L44.5 64 L69.5 37.5" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"' + R('hero.tick') + '/></svg>' + touch(2) + '</div>' +
    '<div class="hero-unit"' + R('hero.dec') + '><div class="hero-bd"' + R('hero.decBd') + '></div><div class="hero-body"' + R('hero.decBody') + '></div></div>' +
    '<div class="cursor hero-cursor"' + R('hero.cursor') + '>' + ICON.cursor + '<i class="ripple"' + R('hero.crip') + '></i></div>' +
  '</div>';
}
function scanMarkup(ref) {
  return '<div class="scan"' + R(ref) + '><i class="sb tl"></i><i class="sb tr"></i><i class="sb bl"></i><i class="sb br"></i></div>';
}

/* ---------------------------------------------------------------- set-up (after the fonts and the first measure) */
function strippedClone(src) {
  const c = src.cloneNode(true);
  for (const e of [c, ...c.querySelectorAll('[data-ref]')]) { const r = e.getAttribute('data-ref'); if (r) { e.setAttribute('data-hero', r); e.removeAttribute('data-ref'); } }
  return c;
}
function copyFont(dst, src) {
  const cs = getComputedStyle(src);
  for (const p of ['fontFamily', 'fontSize', 'color', 'letterSpacing', 'fontWeight']) dst.style[p] = cs[p];
  // line height as a ratio, as it is inherited there (a px value would not follow the children's own font sizes)
  dst.style.lineHeight = /px$/.test(cs.lineHeight) ? String(+(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(4)) : cs.lineHeight;
}
function initHero() {
  // scan A: brackets + band over the record and the tally (stage coordinates, inside the overlay layer)
  $['ov'].insertAdjacentHTML('beforeend', scanMarkup('scan.a'));
  $['scan.a'] = $['ov'].querySelector('[data-ref="scan.a"]');
  $['scan.a'].insertAdjacentHTML('beforeend', '<div class="scan-band"' + R('scan.aBand') + '></div>');
  $['scan.aBand'] = $['scan.a'].querySelector('.scan-band');
  // scan B: radar + brackets over Kg. Ketoyong (map coordinates, under the card; drifts with the map)
  $['na.mapSvg'].insertAdjacentHTML('afterend', '<div class="scan-map"' + R('scan.map') + '>' + scanMarkup('scan.b') + '<div class="scan-radar"' + R('scan.radar') + '></div></div>');
  $['scan.map'] = $['na.map'].querySelector('[data-ref="scan.map"]');
  $['scan.b'] = $['scan.map'].querySelector('[data-ref="scan.b"]');
  $['scan.radar'] = $['scan.map'].querySelector('[data-ref="scan.radar"]');
  const R0 = RADAR.R, bx = 100, by = 78;
  Object.assign($['scan.radar'].style, { left: (KET.x - R0) + 'px', top: (KET.y - R0) + 'px', width: 2 * R0 + 'px', height: 2 * R0 + 'px' });
  Object.assign($['scan.b'].style, { left: (KET.x - bx) + 'px', top: (KET.y - by) + 'px', width: 2 * bx + 'px', height: 2 * by + 'px' });
  $['scan.map'].style.transformOrigin = KET.x + 'px ' + KET.y + 'px';
  $['na.mapSvg'].style.transformOrigin = KET.x + 'px ' + KET.y + 'px';
  HV.ok = true;
}
/* base boxes are measured the first time each source is laid out (its layer visible) */
function heroBase(key, src, body) {
  if (HV[key]) return HV[key];
  if (!src.offsetWidth) return null;
  const cs = getComputedStyle(src), b = { W: parseFloat(cs.width), H: parseFloat(cs.height) };   // exact (offsetWidth rounds down and can wrap a label)
  if (body) {
    body.innerHTML = ''; const c = strippedClone(src); c.style.width = cs.width; c.style.margin = '0'; c.style.display = cs.display;
    body.appendChild(c); copyFont(body, src.parentElement); b.clone = c;
  }
  HV[key] = b;
  return b;
}
function stageRect(el) {
  const s = document.getElementById('stage').getBoundingClientRect(), k = s.width / 1920, r = el.getBoundingClientRect();
  return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k };
}
/* place a unit: centre (cx, cy) in stage px, scale k of its base box (W × H), tilt in degrees */
function placeUnit(el, b, cx, cy, k, tilt) {
  tf(el, 'translate(' + px(cx) + ',' + px(cy) + ') rotateX(' + r2(tilt || 0) + 'deg) scale(' + r5(k) + ') translate(' + px(-b.W / 2) + ',' + px(-b.H / 2) + ')');
}
const lerpLog = (a, b, p) => Math.exp(lerp(Math.log(a), Math.log(b), p));
/* lift / hold / return: m = 0 in the slot, 1 at the hero position (the hold drifts 2 % — never a still frame) */
function heroPose(ft, w, slot, b, k1) {
  const up = seg(ft, w.lift[0], w.lift[1], E.inOutCubic), down = w.back ? seg(ft, w.back[0], w.back[1], E.inOutCubic) : 0, m = up * (1 - down);
  const hold = w.back ? seg(ft, w.lift[1], w.back[0], E.lin) : 0, k1d = k1 * (1 + 0.02 * hold);
  const scx = slot.x + slot.w / 2, scy = slot.y + slot.h / 2, k0 = slot.w / b.W;
  return { m, cx: lerp(scx, w.at[0], m), cy: lerp(scy, w.at[1], m), k: lerpLog(k0, k1d, m), k0, tilt: 9 * Math.sin(Math.PI * m) * (down > 0 ? -1 : 1) };
}
/* a touch marker inside a hero unit: drawn at the phone's own on-screen size (s = k0 / k) */
function heroTouch(n, ft, at, x, y, s) {
  const el = $['hero.touch' + n], rip = $['hero.rip' + n];
  const o = win(ft, at - 0.3, at - 0.12, at + 0.25, at + 0.42), press = 1 - 0.16 * win(ft, at - 0.05, at, at + 0.02, at + 0.14, E.outQuad, E.inQuad);
  op(el, o); tf(el, 'translate(' + px(x) + ',' + px(y) + ') scale(' + r5(s * press) + ')');
  const rp = seg(ft, at, at + 0.45, E.outCubic); op(rip, ft >= at ? 0.85 * (1 - rp) : 0); tf(rip, 'scale(' + r5(lerp(0.5, 2.1, rp)) + ')');
}
/* the blur behind a hero (rack focus) on one scene layer, never on the hero layer */
function sceneBlurOne(l, m) {
  css($[l], 'filter', m > 0.004 ? 'blur(' + r2(7 * m) + 'px) brightness(' + r2(1 - 0.28 * m) + ') saturate(' + r2(1 - 0.25 * m) + ')' : 'none');
}

/* ---------------------------------------------------------------- per frame (after every scene layer is set) */
function renderHero(t, ft) {
  if (!HV.ok) return;
  const H = heroTimes(), blur = { 'w.phone': 0, 'ov': 0, 'w.nadi': 0 };
  // 1 · status lawatan
  const S = H.status, sOn = ft >= S.lift[0] && ft <= S.back[1] && t < 60;
  let bS = sOn ? heroBase('status', $['ph.pills'], $['hero.statusBody']) : null;
  vis($['hero.status'], !!bS);
  if (bS) {
    const slot = stageRect($['ph.pills']), pose = heroPose(ft, S, slot, bS, S.width / bS.W);
    placeUnit($['hero.status'], bS, pose.cx, pose.cy, pose.k, pose.tilt);
    op($['hero.statusBd'], seg(pose.m, 0, 0.35));
    STATUS_CODES.forEach(s => { const o = $['ph.pill' + s.code], c = bS.clone.querySelector('[data-hero="ph.pill' + s.code + '"]'); if (c && c.className !== o.className) c.className = o.className; });
    const p1 = bS.clone.querySelector('[data-hero="ph.pill1"]'), pr = { x: p1.offsetLeft + p1.offsetWidth / 2, y: p1.offsetTop + p1.offsetHeight / 2 };
    heroTouch(1, ft, S.tap, pr.x, pr.y, pose.k0 / pose.k);
    blur['w.phone'] = Math.max(blur['w.phone'], pose.m); blur['ov'] = Math.max(blur['ov'], pose.m);
  }
  // 2 · Save → ring → ✓ → onto the "Rekod disimpan" card
  const V = H.save, vOn = ft >= V.lift[0] && ft <= V.fly[1] + 0.06 && t < 60;
  let bV = vOn ? heroBase('save', $['ph.saveBtn'], null) : null;
  vis($['hero.save'], !!bV);
  if (bV) {
    const pill = $['hero.pill'];
    if (!bV.ready) { pill.className = $['ph.saveBtn'].className; pill.textContent = $['ph.saveBtn'].textContent; copyFont($['hero.save'], $['ph.saveBtn']);
      Object.assign(pill.style, { whiteSpace: 'nowrap', overflow: 'hidden', boxSizing: 'border-box', position: 'absolute', left: '0', top: '0', height: bV.H + 'px' });
      Object.assign($['hero.ring'].style, { width: bV.H + 'px', height: bV.H + 'px', left: (bV.W / 2 - bV.H / 2) + 'px', top: '0' }); bV.ready = true; }
    pill.classList.toggle('hl', $['ph.saveBtn'].classList.contains('hl'));
    const slot = stageRect($['ph.saveBtn']), pose = heroPose(ft, V, slot, bV, V.width / bV.W);
    const mp = seg(ft, V.morph[0], V.morph[1], E.inOutCubic), w = lerp(bV.W, bV.H, mp);
    css(pill, 'width', px(w)); css(pill, 'left', px((bV.W - w) / 2)); css(pill, 'border-radius', px(lerp(12, bV.H / 2, mp)));
    css(pill, 'color', 'rgba(255,255,255,' + r2(1 - seg(ft, V.morph[0], V.morph[0] + 0.12)) + ')');
    const tp = seg(ft, V.tick[0], V.tick[1], E.inOutSine), bg = [lerp(15, 16, tp), lerp(118, 185, tp), lerp(110, 129, tp)].map(Math.round);
    css(pill, 'background-color', 'rgb(' + bg.join(',') + ')');
    css(pill, 'transform', 'scale(' + r5(1 - 0.05 * win(ft, V.tap - 0.05, V.tap, V.tap + 0.02, V.tap + 0.16, E.outQuad, E.inQuad)) + ')');
    // spinner, then the full circle and the tick (the card's own icon: emerald with a dark tick)
    const sp = seg(ft, V.spin[0], V.spin[1], E.inOutSine), done = seg(ft, V.spin[1] - 0.1, V.spin[1], E.outCubic);
    op($['hero.ring'], seg(ft, V.spin[0], V.spin[0] + 0.06));
    attr($['hero.arc'], 'stroke-dasharray', r2(lerp(0.22, 1, done)) + ' 1');
    attr($['hero.arc'], 'transform', 'rotate(' + r2(-90 + 760 * sp) + ' 50 50)');
    attr($['hero.arc'], 'opacity', String(r2(1 - seg(ft, V.tick[1] - 0.06, V.tick[1] + 0.04))));
    attr($['hero.tick'], 'stroke-dashoffset', String(r2(1 - tp)));
    // the flight: from the hero position to the card's icon, on a shallow arc; the blur clears meanwhile
    const ico = stageRect($['ov.saved'].querySelector('.sv-ico')), fp = seg(ft, V.fly[0], V.fly[1], E.inOutCubic);
    const k1 = V.width / bV.W, kLand = ico.h / bV.H, cX = V.at[0], cY = V.at[1], iX = ico.x + ico.w / 2, iY = ico.y + ico.h / 2;
    const qx = (cX + iX) / 2, qy = Math.min(cY, iY) - 110, bx = (1 - fp) * (1 - fp) * cX + 2 * (1 - fp) * fp * qx + fp * fp * iX, by = (1 - fp) * (1 - fp) * cY + 2 * (1 - fp) * fp * qy + fp * fp * iY;
    if (fp > 0) placeUnit($['hero.save'], bV, bx, by, lerpLog(k1, kLand, fp), 0);
    else placeUnit($['hero.save'], bV, pose.cx, pose.cy, pose.k, pose.tilt);
    op($['hero.save'], 1 - seg(ft, V.fly[1], V.fly[1] + 0.06));
    heroTouch(2, ft, V.tap, bV.W / 2, bV.H / 2, pose.k0 / pose.k);
    const bm = pose.m * (1 - seg(ft, V.fly[0], V.fly[1] - 0.06, E.inOutSine));
    blur['w.phone'] = Math.max(blur['w.phone'], bm); blur['ov'] = Math.max(blur['ov'], bm);
  }
  // the card unrolls from its icon (where the ring landed); before that it is not shown
  const un = seg(ft, V.unroll[0], V.unroll[1], E.outCubic), r0 = 100 - (26 + 62 + 6) / 700 * 100;
  css($['ov.saved'], 'clip-path', t < 60 && ft >= V.unroll[0] && un < 1 ? 'inset(-40px ' + r2(r0 * (1 - un)) + '% -64px -40px round 22px)' : 'none');
  // 3 · Rancang lawatan susulan
  const D = H.dec, dOn = ft >= D.lift[0] && ft <= D.back[1] && t >= 60;
  let bD = dOn ? heroBase('dec', $['na.decBtn'], $['hero.decBody']) : null;
  vis($['hero.dec'], !!bD); vis($['hero.cursor'], !!bD);
  if (bD) {
    if (bD.clone.className !== $['na.decBtn'].className) bD.clone.className = $['na.decBtn'].className;
    const slot = stageRect($['na.decBtn']), k0 = slot.w / bD.W, pose = heroPose(ft, D, slot, bD, k0 * D.grow);
    const press = 1 - 0.06 * win(ft, D.click - 0.06, D.click, D.click + 0.02, D.click + 0.14, E.outQuad, E.inQuad);
    placeUnit($['hero.dec'], bD, pose.cx, pose.cy, pose.k * press, pose.tilt);
    op($['hero.decBd'], seg(pose.m, 0, 0.35));
    // the pointer rides on the lifted button and clicks it there (the panel's own pointer is hidden meanwhile)
    const ax = (0.42 - 0.5) * bD.W * pose.k, ay = (0.55 - 0.5) * bD.H * pose.k;
    op($['hero.cursor'], 1 - seg(ft, D.out[0], D.out[1], E.inCubic));
    const cp = 1 - 0.12 * win(ft, D.click - 0.06, D.click, D.click + 0.02, D.click + 0.12, E.outQuad, E.inQuad);
    tf($['hero.cursor'], 'translate(' + px(pose.cx + ax) + ',' + px(pose.cy + ay) + ') scale(' + r5(k0 * cp) + ')');
    const rp = seg(ft, D.click, D.click + 0.5, E.outCubic);
    op($['hero.crip'], ft >= D.click ? 0.8 * (1 - rp) : 0); tf($['hero.crip'], 'scale(' + r5(lerp(0.4, 2.2, rp)) + ')');
    blur['w.nadi'] = Math.max(blur['w.nadi'], pose.m); blur['ov'] = Math.max(blur['ov'], pose.m);
  }
  for (const l in blur) sceneBlurOne(l, blur[l]);
  renderScanA(t); renderScanB(t); renderMapDrift(t);
}
/* the panel's own pointer is handed to the hero pointer while the button is lifted */
function heroCursorTake(ft) { const D = heroTimes().dec; return ft >= D.lift[0] && ft <= D.back[1] ? 1 : 0; }

/* ---------------------------------------------------------------- scans */
function bracketsIn(el, a) { op(el, a); tf(el, 'scale(' + r5(lerp(1.06, 1, a)) + ')'); }
function renderScanA(t) {
  const A = SCAN_A(), el = $['scan.a'], on = t >= A.in[0] && t <= A.out[1];
  vis(el, on); if (!on) { for (let i = 0; i < 5; i++) css($['ov.rl' + i], 'background-color', ''); return; }
  const top = 170, bot = 170 + M.recH + 20 + M.savedH;
  css(el, 'left', '86px'); css(el, 'top', px(top - 14)); css(el, 'width', '728px'); css(el, 'height', px(bot - top + 28));
  bracketsIn(el, seg(t, A.in[0], A.in[1], E.outCubic) * (1 - seg(t, A.out[0], A.out[1], E.inCubic)));
  // the band's leading edge runs from the top of the record to the tally's count, which changes as it arrives
  const yCount = M.savedCountY, y0 = top - 10, p = seg(t, A.band[0], A.band[1], E.inOutSine), yl = lerp(y0, yCount, p);
  op($['scan.aBand'], win(t, A.band[0], A.band[0] + 0.12, A.band[1], A.band[1] + 0.2));
  tf($['scan.aBand'], 'translateY(' + px(yl - (top - 14) - 120) + ')');
  for (let i = 0; i < 5; i++) {
    const tc = scanCross(A.band, y0, yCount, M.recLineY[i]), f = win(t, tc - 0.03, tc + 0.04, tc + 0.12, tc + 0.42);
    css($['ov.rl' + i], 'background-color', f > 0.01 ? 'rgba(45,212,191,' + r2(0.26 * f) + ')' : '');
  }
}
/* when the band's leading edge (inOutSine from y0 to y1 over w) crosses y */
function scanCross(w, y0, y1, y) { const q = clamp((y - y0) / (y1 - y0)); return w[0] + (Math.acos(1 - 2 * q) / Math.PI) * (w[1] - w[0]); }
function renderScanB(t) {
  const late = t >= 60, B = RADAR.brackets, on = late && t >= B[0] && t <= B[1] + 0.3;
  vis($['scan.b'], on); if (on) bracketsIn($['scan.b'], seg(t, B[0], B[0] + 0.3, E.outCubic) * (1 - seg(t, B[1], B[1] + 0.3, E.inCubic)));
  let a = -1, o = 0;
  for (const s of RADAR.sweeps) if (late && t >= s[0] - 0.15 && t <= s[1] + 0.3) { a = 360 * seg(t, s[0], s[1], E.lin); o = win(t, s[0] - 0.15, s[0], s[1], s[1] + 0.3); }
  vis($['scan.radar'], o > 0.002);
  if (o > 0.002) {
    op($['scan.radar'], o);
    css($['scan.radar'], 'background', 'conic-gradient(from ' + r2(a + 90 - 75) + 'deg, rgba(45,212,191,0) 0deg, rgba(45,212,191,.30) 73deg, rgba(204,251,241,.95) 75deg, rgba(45,212,191,0) 75.6deg)');
  }
}

/* ---------------------------------------------------------------- 3 · no still camera */
/* a camera hold (two equal keys) becomes a slow inOutSine drift: zoom × (1 + zps·d), a small rise; the next move
 * starts from the drifted frame. A last key before tEnd gets a final drift to tEnd. */
function driftHolds(keys, zps, yps, tEnd) {
  for (let i = 1; i < keys.length; i++) {
    if (keys[i][1] !== keys[i - 1][1]) continue;
    const d = keys[i][0] - keys[i - 1][0], v = keys[i][1];
    if (d < 0.3) continue;
    keys[i] = [keys[i][0], Object.assign({}, v, { z: v.z * (1 + zps * d), fy: v.fy - yps * d }), E.inOutSine];
  }
  const last = keys[keys.length - 1];
  if (tEnd !== undefined && last[0] < tEnd - 0.3) { const v = last[1], d = tEnd - last[0]; keys.push([tEnd, Object.assign({}, v, { z: v.z * (1 + zps * d), fy: v.fy - yps * d }), E.inOutSine]); }
  return keys;
}
/* a gentle float for a card on screen (Lissajous, ±5 × ±4 px, 7 s × 5.3 s: the turning points never coincide, so it is
 * never still), eased in from t0 */
function floatXY(t, t0) { const k = seg(t, t0, t0 + 1.2, E.inOutSine), u = t - t0; return [k * 5 * Math.sin(2 * Math.PI * u / 7), k * 4 * Math.sin(2 * Math.PI * u / 5.3 + 1)]; }

/* the follow-up map closes in on Kg. Ketoyong behind the still panel: slowly while the radar runs, then ≈2 %/s as the
 * route is planned (1 + 0.22 p²; at 0.5 %/s the last 8 s of the scene still read as frozen in the MP4) */
function renderMapDrift(t) {
  const p = seg(t, T.l.in[0], T.l.out[1], E.lin), v = t >= 60 ? 'scale(' + r5(1 + 0.22 * p * p) + ')' : 'none';
  tf($['na.mapSvg'], v); if ($['scan.map']) tf($['scan.map'], v);
}
