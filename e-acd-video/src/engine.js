/* ==========================================================================
 * engine.js — deterministic timeline. renderFrame(frameIndex) is a pure
 * function of the frame number (t = frameIndex / 60): it recomputes every
 * animated property from t, so seeking to a frame and playing up to it give
 * the same pixels. No CSS transitions, no CSS animations, no Math.random().
 * ========================================================================== */
'use strict';

/* ---------------------------------------------------------------- math */
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, p) => a + (b - a) * p;
function makeOutBack(s) { return p => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2); }
/* Analytic damped spring, normalised so f(0)=0 and f(1)=1 (subtle overshoot). */
function makeSpring(zeta, w) {
  const wd = w * Math.sqrt(1 - zeta * zeta);
  const f = p => 1 - Math.exp(-zeta * w * p) * (Math.cos(wd * p) + (zeta * w / wd) * Math.sin(wd * p));
  const end = f(1);
  return p => (p <= 0 ? 0 : p >= 1 ? 1 : f(p) / end);
}
const E = {
  lin: p => p,
  outQuad: p => 1 - (1 - p) * (1 - p),
  inQuad: p => p * p,
  inCubic: p => p * p * p,
  outCubic: p => 1 - Math.pow(1 - p, 3),
  inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2), // as Motion Canvas easeInOutCubic
  outQuart: p => 1 - Math.pow(1 - p, 4),
  inOutQuart: p => (p < 0.5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2),
  outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: makeOutBack(1.25),
  spring: makeSpring(0.62, 11),
  springSoft: makeSpring(0.78, 10)
};
/* progress of t through [t0, t1] with easing; 0 before, 1 after */
function seg(t, t0, t1, e) { if (t <= t0) return 0; if (t >= t1) return 1; return (e || E.inOutCubic)((t - t0) / (t1 - t0)); }
/* in a→b, hold, out c→d */
function win(t, a, b, c, d, ein, eout) { return Math.min(seg(t, a, b, ein || E.outCubic), 1 - seg(t, c, d, eout || E.inCubic)); }
function mix(a, b, p) {
  if (typeof a === 'number') return lerp(a, b, p);
  const o = {}; for (const k in a) o[k] = lerp(a[k], b[k] === undefined ? a[k] : b[k], p); return o;
}
/* keyframes: [[time, value, easingIntoThisKey?], ...] */
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const k0 = keys[i - 1], k1 = keys[i];
      return mix(k0[1], k1[1], (k1[2] || E.inOutCubic)((t - k0[0]) / (k1[0] - k0[0])));
    }
  }
  return keys[keys.length - 1][1];
}
/* step keyframes (constant interpolation): [[time, value], ...] */
function step(t, keys) { let v = keys[0][1]; for (const [k, val] of keys) { if (t >= k) v = val; } return v; }

/* ---------------------------------------------------------------- seeded randomness */
function mulberry32(a) {
  return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const rng = seed => mulberry32(typeof seed === 'string' ? hashStr(seed) : seed);
/* smooth deterministic noise in [-1, 1] */
function noise(t, seed) {
  const r = rng(seed * 7919 + 13);
  let v = 0; for (let i = 0; i < 3; i++) { const f = 3 + r() * 9, ph = r() * 6.283; v += Math.sin(t * f + ph) / (i + 1); }
  return v / 1.83;
}

/* ---------------------------------------------------------------- DOM helpers (cached writes) */
const $ = {};
function collectRefs(root) { root.querySelectorAll('[data-ref]').forEach(el => { $[el.dataset.ref] = el; }); }
function css(el, prop, val) { const c = el.__s || (el.__s = {}); if (c[prop] !== val) { el.style.setProperty(prop, val); c[prop] = val; } }
function tf(el, v) { css(el, 'transform', v); }
function op(el, v) { css(el, 'opacity', (Math.round(clamp(v) * 1000) / 1000).toString()); }
function vis(el, on) { css(el, 'display', on ? '' : 'none'); }
function txt(el, s) { if (el.__t !== s) { el.textContent = s; el.__t = s; } }
function html(el, s) { if (el.__h !== s) { el.innerHTML = s; el.__h = s; } }
function cls(el, c, on) { const k = '__c' + c; if (el[k] !== on) { el.classList.toggle(c, !!on); el[k] = on; } }
function attr(el, a, v) { const k = '__a' + a; if (el[k] !== v) { el.setAttribute(a, v); el[k] = v; } }
const px = v => (Math.round(v * 100) / 100) + 'px';
const r2 = v => Math.round(v * 1000) / 1000;

/* ==========================================================================
 * NAMED TIME EVENTS (seconds) — the beat sheet. Visual states, taps, typing
 * and sound cues all read from here (Motion Canvas-style named events).
 * ========================================================================== */
const T = {
  s1: { mapIn: 0, pinDrop: 1.1, houses: 1.6, papers: [3.9, 4.3, 4.75], text: [4.3, 6.9, 9.3], rain: [5.2, 10.0], tally: 6.2, laptop: 8.8, typing: [9.4, 12.3], shake: 10.4, collapse: 14.35, flash: 14.72 },
  s2: { jata: 15.05, badge: 15.75, phoneIn: 16.4, title: 18.15, locCallout: 19.2, sub: 20.75, tapStaff: 21.2, staffCallout: 21.7, insetIn: 23.25, tapShare: 24.1, tapAddRow: 24.75, tapAdd: 25.55, home: 25.95, iconPop: 26.3, tapIcon: 27.6, launch: 27.72, appIn: 28.45 },
  s3: { tapNav: 30.5, tapTeam: 31.0, pickTeam: 31.55, tapAddr: 31.9, type: [31.95, 33.35], tapStatus: 33.55, occ: [34.15, 34.4, 34.65, 34.9], toggle: 35.3, chips: [36.15, 36.65, 37.15], tagSymp: 37.7, tagRef: 38.3, cb0: 40.1, cb1: 40.8, risalah: 41.4, action: 42.4, save: 44.15, saved: 44.35 },
  s4: { tapNav: 50.2, teams: [50.6, 51.3, 52.0, 52.7, 53.4, 54.1], tapDash: 54.75, desk: 54.8, loc: [56.0, 57.3], vis: [57.6, 61.1], rest: [57.6, 60.6], zoom: [61.2, 62.4], cov: 62.35, capai: 64.95, pull: [66.6, 68.2] },
  s5: { b1: 70.0, tapSend: 70.65, up: [70.8, 71.6], write: 71.8, synced: 72.8, back: [73.1, 73.85], b2: 74.4, tapName: 75.0, type: [75.1, 75.8], tapVerify: 76.4, b3: 77.4, tapWa: 78.25, chat: 78.7, paste: 79.6, csv: 79.9 },
  s6: { benefits: 82.3, lockup: 85.3 }
};

/* Lampiran 1 form label values that change over time (constant keyframes, like the app's state). */
const ADDRESS = HOUSE_DEMO.address;
const OFFICER = VERIFICATION.officerName;

/* Taps per surface: { t, ref, ax, ay } (ax/ay = anchor within the element, 0..1). */
const TAPS = {
  ph: [
    { t: T.s2.tapStaff, ref: 'ph.nPetugas' },
    { t: T.s2.tapIcon, ref: 'ph.newIcon', layer: 'home' },
    { t: T.s3.tapNav, ref: 'ph.nBorang' },
    { t: T.s3.tapTeam, ref: 'ph.teamSel' },
    { t: T.s3.pickTeam, ref: 'ph.dd1' },
    { t: T.s3.tapAddr, ref: 'ph.addrBox', ax: 0.3 },
    { t: T.s3.tapStatus, ref: 'ph.pill1' },
    ...T.s3.occ.map(t => ({ t, ref: 'ph.occPlus' })),
    { t: T.s3.toggle, ref: 'ph.toggle' },
    { t: T.s3.chips[0], ref: 'ph.chip0' }, { t: T.s3.chips[1], ref: 'ph.chip1' }, { t: T.s3.chips[2], ref: 'ph.chip3' },
    { t: T.s3.cb0, ref: 'ph.cb0' }, { t: T.s3.cb1, ref: 'ph.cb1' },
    { t: T.s3.save, ref: 'ph.saveBtn' },
    { t: T.s4.tapNav, ref: 'ph.nPasukan' },
    ...T.s4.teams.map((t, i) => ({ t, ref: 'ph.qtab' + (i + 1) })),
    { t: T.s4.tapDash, ref: 'ph.nDash' },
    { t: T.s5.tapSend, ref: 'ph.qSave' },
    { t: T.s5.tapName, ref: 'ph.vNameBox', ax: 0.3 },
    { t: T.s5.tapVerify, ref: 'ph.vBtn' }
  ],
  s2: [{ t: T.s2.tapShare, ref: 's2.share' }, { t: T.s2.tapAddRow, ref: 's2.addRow' }, { t: T.s2.tapAdd, ref: 's2.addBtn' }],
  dk: [{ t: T.s5.tapWa, ref: 'dk.btnWa' }]
};
const TYPING = [
  { t0: T.s3.type[0], t1: T.s3.type[1], text: ADDRESS },
  { t0: T.s5.type[0], t1: T.s5.type[1], text: OFFICER }
];
function typed(t, k) { const ty = TYPING[k]; const n = Math.floor(seg(t, ty.t0, ty.t1, E.lin) * ty.text.length + 1e-6); return ty.text.slice(0, n); }

/* ---------------------------------------------------------------- dashboard data over time */
function zeroTeams() { const o = {}; for (let t = 1; t <= 6; t++) o[t] = { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 }; return o; }
/* Team values shown by the dashboards at time t (Scene 4 count-up uses the same dataset). */
function teamsAt(t) {
  if (t < T.s4.tapDash) return zeroTeams();
  const pL = seg(t, T.s4.loc[0], T.s4.loc[1], E.outCubic);
  const pV = seg(t, T.s4.vis[0], T.s4.vis[1], E.inOutSine);
  const pR = seg(t, T.s4.rest[0], T.s4.rest[1], E.outCubic);
  const o = {};
  for (let k = 1; k <= 6; k++) {
    const d = TEAMS[k];
    o[k] = {
      locality: Math.round(d.locality * pL), visited: Math.round(d.visited * pV), locked: Math.round(d.locked * pR),
      pop: Math.round(d.pop * pR), symp: Math.round(d.symp * pR), ref: Math.round(d.ref * pR), sample: Math.round(d.sample * pR),
      breeding: Math.round(d.breeding * pR), abate: Math.round(d.abate * pR), pamphlet: Math.round(d.pamphlet * pR)
    };
  }
  return o;
}
/* First time the displayed coverage reaches the configured target (badge flips). */
let T_TARGET_CROSS = 0;
function computeTargetCross() {
  for (let f = Math.floor(T.s4.vis[0] * FPS); f < TOTAL_FRAMES; f++) {
    const tot = computeTotals(teamsAt(f / FPS));
    if (tot.locality > 0 && tot.pct >= TARGET_PCT) { T_TARGET_CROSS = f / FPS; return; }
  }
}

/* ---------------------------------------------------------------- sound event table (shared with audio.js) */
function buildSoundEvents() {
  const ev = [];
  const add = (t, k, o) => ev.push(Object.assign({ t, k }, o || {}));
  // Scene 1
  add(0.0, 'drone'); add(T.s1.pinDrop, 'drop');
  T.s1.papers.forEach(t => add(t, 'paper'));
  T.s1.text.forEach(t => add(t, 'stab'));
  add(T.s1.tally, 'whooshSoft'); add(T.s1.laptop, 'whooshSoft');
  for (let i = 0; i < 92; i++) if (i % 3 === 0) add(6.5 + i * (2.7 / 92), 'pencil');
  for (let i = 0; i < 42; i++) add(T.s1.typing[0] + i * ((T.s1.typing[1] - T.s1.typing[0]) / 42), 'key', { soft: 1 });
  add(12.2, 'riser', { d: 2.7 }); add(14.95, 'impact');
  // Scene 2
  add(T.s2.jata, 'shimmer'); add(T.s2.badge, 'pop'); add(T.s2.phoneIn, 'whoosh'); add(T.s2.title, 'swell');
  add(T.s2.locCallout, 'pop', { soft: 1 }); add(T.s2.staffCallout, 'pop', { soft: 1 });
  add(T.s2.insetIn, 'whooshSoft'); add(T.s2.tapShare + 0.05, 'slide'); add(T.s2.iconPop, 'sparkle'); add(T.s2.launch, 'whoosh');
  // Scene 3
  add(T.s3.saved, 'confirm'); add(T.s3.tagSymp, 'pop', { soft: 1 }); add(T.s3.tagRef, 'pop', { soft: 1 }); add(T.s3.saved + 0.35, 'pop', { soft: 1 });
  // Scene 4
  add(T.s4.desk, 'whoosh'); add(T.s4.loc[0], 'dataRise', { d: T.s4.vis[1] - T.s4.loc[0] });
  add(T_TARGET_CROSS, 'success'); add(T.s4.zoom[0], 'whooshSoft'); add(T.s4.cov, 'hit'); add(T.s4.capai, 'pop');
  add(T.s4.pull[0], 'whooshSoft');
  // Scene 5
  add(T.s5.b1 + 0.1, 'whoosh');
  for (let i = 0; i < 5; i++) add(T.s5.up[0] + i * 0.11, 'blip', { f: 1500 + i * 120 });
  for (let i = 0; i < 6; i++) add(T.s5.write + i * 0.11, 'blip', { f: 2100 + i * 90, soft: 1 });
  add(T.s5.synced, 'confirm');
  for (let i = 0; i < 4; i++) add(T.s5.back[0] + i * 0.13, 'blip', { f: 1300 - i * 80, soft: 1 });
  add(T.s5.back[1], 'pop', { soft: 1 });
  add(T.s5.b2 + 0.05, 'whooshSoft'); add(T.s5.tapVerify + 0.05, 'confirm'); add(T.s5.b3, 'whooshSoft');
  add(T.s5.tapWa + 0.1, 'pop', { soft: 1 }); add(T.s5.chat, 'whoosh'); add(T.s5.paste, 'paste'); add(T.s5.csv, 'pop', { soft: 1 });
  // Scene 6
  for (let i = 0; i < 4; i++) add(T.s6.benefits + i * 0.25, 'pop', { soft: 1, f: 660 + i * 110 });
  add(T.s6.lockup, 'sting');
  // UI taps + typing
  for (const k of Object.keys(TAPS)) for (const tp of TAPS[k]) add(tp.t, 'tap');
  for (const ty of TYPING) for (let i = 0; i < ty.text.length; i++) add(ty.t0 + (i + 0.5) * ((ty.t1 - ty.t0) / ty.text.length), 'key');
  ev.sort((a, b) => a.t - b.t);
  return ev;
}

/* ==========================================================================
 * MEASUREMENT (run once after fonts load). Offsets ignore transforms, so the
 * results are layout positions that the renderer combines with its own
 * scroll/camera values.
 * ========================================================================== */
const M = {};
function offsetWithin(el, anc) {
  let x = 0, y = 0, e = el;
  while (e && e !== anc) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
function measure() {
  // show every phone view (and open the symptom box) while measuring
  const views = ['ph.vDash', 'ph.vBorang', 'ph.vPasukan', 'ph.vPetugas'];
  views.forEach(v => { $[v].style.display = 'block'; });
  $['ph.symBox'].style.height = 'auto';
  $['ph.app'].style.display = ''; $['ph.app'].style.opacity = '1';
  const screen = $['ph.screen'], scroll = $['ph.scroll'];
  M.phViewportTop = offsetWithin($['ph.viewport'], screen).y;
  M.phViewportH = $['ph.viewport'].offsetHeight;
  M.symH = $['ph.symInner'].offsetHeight;
  // each view's top within the scroll container, then refs relative to their view
  M.ph = {};
  const refsIn = ['ph.teamSel', 'ph.dd1', 'ph.addrBox', 'ph.pill1', 'ph.occPlus', 'ph.toggle', 'ph.chip0', 'ph.chip1', 'ph.chip3', 'ph.sympWrap', 'ph.refWrap',
    'ph.secB', 'ph.secC', 'ph.cb0', 'ph.cb1', 'ph.cRow2', 'ph.action', 'ph.saveBtn', 'ph.qtabsRow', 'ph.qSave', 'ph.secD', 'ph.vNameBox', 'ph.vBtn', 'ph.hero',
    'ph.rosterReq', 'ph.q_locality', 'ph.q_sample', 'ph.qtab1', 'ph.vStatus', 'ph.lamp'];
  for (const r of refsIn) M.ph[r] = offsetWithin($[r], scroll);
  for (let i = 1; i <= 6; i++) M.ph['ph.qtab' + i] = offsetWithin($['ph.qtab' + i], scroll);
  // fixed (non-scrolling) refs relative to the phone screen
  for (const r of ['ph.nDash', 'ph.nBorang', 'ph.nPasukan', 'ph.nPetugas', 'ph.locBar', 'ph.meetPt']) M.ph[r] = offsetWithin($[r], screen);
  // the home-screen icon (home layer is visible only in Scene 2)
  $['ph.home'].style.opacity = '1';
  M.ph['ph.newIcon'] = offsetWithin($['ph.newIcon'], screen);
  $['ph.home'].style.opacity = '';
  M.phContentH = { borang: $['ph.vBorang'].offsetHeight, pasukan: $['ph.vPasukan'].offsetHeight, dash: $['ph.vDash'].offsetHeight, petugas: $['ph.vPetugas'].offsetHeight };
  M.viewTop = {}; for (const v of views) M.viewTop[v] = $[v].offsetTop;
  views.forEach(v => { $[v].style.display = ''; });
  $['ph.symBox'].style.height = '';
  // desktop
  const dk = $['dk.scroll'];
  M.dkViewportTop = offsetWithin($['dk.viewport'], $['dk.app']).y;
  M.dkViewportH = $['dk.viewport'].offsetHeight;
  M.dk = {};
  for (const r of ['dk.heroRow', 'dk.charts', 'dk.table', 'dk.refList', 'dk.btnWa', 'dk.btnCsv']) M.dk[r] = offsetWithin($[r], dk);
  M.dkContentH = dk.offsetHeight;
  // inset (Scene 2)
  const ins = $['s2.inset'].querySelector('.inset-screen');
  M.s2 = {}; for (const r of ['s2.share', 's2.addRow', 's2.addBtn']) M.s2[r] = offsetWithin($[r], ins);
  // bar chart geometry
  M.bar = $['dk.barSvg'].dataset.plot.split(',').map(Number);
  M.donut = $['dk.donutSvg'].dataset.geo.split(',').map(Number);
  // sheet selection rectangle C8:H13
  const c0 = $['sh.c0_1'], c1 = $['sh.c5_6'], g = $['sh.grid'];
  const a = offsetWithin(c0, g), b = offsetWithin(c1, g);
  M.shSel = { x: a.x, y: a.y, w: b.x + b.w - a.x, h: b.y + b.h - a.y };
}

/* ---------------------------------------------------------------- phone: views, scroll, coordinates */
const PH_SCREEN_W = 390, PH_SCREEN_H = 842;
function phView(t) {
  if (t < 21.35) return 'dash';
  if (t < T.s2.home) return 'petugas';
  if (t < 30.62) return 'dash';
  if (t < 50.32) return 'borang';
  if (t < 54.82) return 'pasukan';
  if (t < 70.3) return 'dash';
  return 'pasukan';
}
const VIEW_REF = { dash: 'ph.vDash', borang: 'ph.vBorang', pasukan: 'ph.vPasukan', petugas: 'ph.vPetugas' };
const NAV_REF = { dash: 'ph.nDash', borang: 'ph.nBorang', pasukan: 'ph.nPasukan', petugas: 'ph.nPetugas' };
function symOpen(t) { return t >= T.s3.toggle && t < T.s3.saved; }
function symH(t) {
  const open = seg(t, T.s3.toggle + 0.02, T.s3.toggle + 0.42, E.outCubic);
  const close = seg(t, T.s3.saved, T.s3.saved + 0.25, E.inOutCubic);
  return M.symH * Math.min(open, 1 - close);
}
/* y of a borang element in content coordinates, accounting for the symptom box height at t */
function phRefY(ref, t) {
  const m = M.ph[ref];
  const view = ref.startsWith('ph.q') || ref === 'ph.secD' || ref === 'ph.vNameBox' || ref === 'ph.vBtn' || ref === 'ph.vStatus' ? 'ph.vPasukan' : null;
  let y = m.y;
  // elements below the symptom box shift by (current height - full height)
  if (['ph.secC', 'ph.cb0', 'ph.cb1', 'ph.cRow2', 'ph.action', 'ph.saveBtn', 'ph.lamp'].includes(ref)) y += symH(t) - M.symH;
  return { x: m.x, y, w: m.w, h: m.h, view };
}
function clampScroll(v, view) { const max = Math.max(0, M.phContentH[view] - M.phViewportH); return clamp(v, 0, max); }
function scrollToRef(ref, offset, t) { const r = phRefY(ref, t || 40); const viewTop = M.viewTop[ref.startsWith('ph.q') || ref === 'ph.secD' || ref === 'ph.vNameBox' || ref === 'ph.vBtn' ? 'ph.vPasukan' : 'ph.vBorang']; return r.y - viewTop - offset; }
/* phone content scroll (px) for the active view */
function phScroll(t) {
  const v = phView(t);
  if (v === 'borang') {
    const sOcc = clampScroll(scrollToRef('ph.pill1', 40, 34), 'borang');
    const sChips = clampScroll(scrollToRef('ph.secB', 10, 36), 'borang');
    const sCounts = clampScroll(scrollToRef('ph.sympWrap', 30, 38), 'borang');
    const sC = clampScroll(scrollToRef('ph.secC', 6, 40), 'borang');
    const sSave = clampScroll(scrollToRef('ph.saveBtn', 300, 44), 'borang');
    if (t >= T.s3.saved) {
      const keep = sSave - (M.symH - symH(t));
      const lamp = Math.max(0, M.ph['ph.lamp'].y - M.viewTop['ph.vBorang'] - M.symH - 230);
      return lerp(keep, lamp, seg(t, T.s3.saved + 0.45, T.s3.saved + 1.15));
    }
    return kf(t, [[30.6, 0], [33.75, 0], [34.15, sOcc], [35.32, sOcc], [35.85, sChips], [37.35, sChips], [37.6, sCounts], [39.25, sCounts], [39.9, sC], [43.4, sC], [43.95, sSave], [46, sSave]]);
  }
  if (v === 'pasukan') {
    const sTabs = clampScroll(scrollToRef('ph.qtabsRow', 12, 50), 'pasukan');
    const sSend = clampScroll(scrollToRef('ph.qSave', 330, 71), 'pasukan');
    const sD = clampScroll(scrollToRef('ph.secD', -80, 75), 'pasukan');
    if (t < 60) return kf(t, [[50.32, 0], [50.45, sTabs, E.outCubic]]);
    return kf(t, [[70.3, sSend], [74.45, sSend], [74.95, sD], [80, sD]]);
  }
  return 0;
}
/* phone-screen coordinates of a ref at time t (centre point + anchor) */
function phRefScreen(ref, t, ax, ay) {
  ax = ax === undefined ? 0.5 : ax; ay = ay === undefined ? 0.5 : ay;
  if (['ph.nDash', 'ph.nBorang', 'ph.nPasukan', 'ph.nPetugas', 'ph.newIcon', 'ph.locBar', 'ph.meetPt'].includes(ref)) {
    const m = M.ph[ref]; return { x: m.x + m.w * ax, y: m.y + m.h * ay };
  }
  let r = phRefY(ref, t);
  const view = r.view || 'ph.vBorang';
  let x = r.x + r.w * ax;
  if (ref.startsWith('ph.qtab')) x -= qTabsShift(t);
  return { x, y: M.phViewportTop + (r.y - M.viewTop[view]) - phScroll(t) + r.h * ay };
}

/* ---------------------------------------------------------------- actor placement + camera */
/* Phone placement keyframes: x, y = centre in world px; s = scale; rx/ry = degrees. */
const PHONE_KEYS = [
  [16.4, { x: 1250, y: 1520, s: 0.95, rx: 10, ry: -30, o: 1 }],
  [17.85, { x: 1250, y: 540, s: 0.95, rx: 4, ry: -14, o: 1 }, E.springSoft],
  [21.0, { x: 1250, y: 540, s: 0.95, rx: 3, ry: -10, o: 1 }, E.inOutSine],
  [23.1, { x: 1250, y: 540, s: 0.95, rx: 3, ry: -10, o: 1 }],
  [23.8, { x: 1470, y: 540, s: 0.86, rx: 3, ry: -18, o: 1 }],
  [25.9, { x: 1470, y: 540, s: 0.86, rx: 3, ry: -18, o: 1 }],
  [26.5, { x: 1250, y: 540, s: 0.95, rx: 2, ry: -8, o: 1 }],
  [29.4, { x: 1250, y: 540, s: 1.0, rx: 0, ry: -3, o: 1 }, E.inOutSine],
  [30.2, { x: 1250, y: 540, s: 1.0, rx: 0, ry: 0, o: 1 }],
  [54.75, { x: 1250, y: 540, s: 1.0, rx: 0, ry: 0, o: 1 }],
  [56.1, { x: 600, y: 560, s: 0.92, rx: 2, ry: 14, o: 1 }],
  [61.0, { x: 600, y: 560, s: 0.92, rx: 2, ry: 14, o: 1 }],
  [62.2, { x: 600, y: 560, s: 0.92, rx: 0, ry: 3, o: 1 }],
  [66.6, { x: 600, y: 560, s: 0.92, rx: 0, ry: 3, o: 1 }],
  [68.2, { x: 600, y: 560, s: 0.92, rx: 2, ry: 12, o: 1 }],
  [69.6, { x: 600, y: 560, s: 0.92, rx: 2, ry: 12, o: 1 }],
  [70.45, { x: 300, y: 520, s: 0.78, rx: 2, ry: 10, o: 1 }],
  [74.2, { x: 300, y: 520, s: 0.78, rx: 2, ry: 10, o: 1 }],
  [74.95, { x: 1250, y: 540, s: 1.0, rx: 0, ry: 0, o: 1 }],
  [77.2, { x: 1250, y: 540, s: 1.0, rx: 0, ry: 0, o: 1 }],
  [77.8, { x: 1500, y: 600, s: 0.9, rx: 0, ry: -10, o: 0 }]
];
const DESK_KEYS = [
  [54.8, { x: 1300, y: 1560, s: 0.9, rx: 8, ry: -16, o: 1 }],
  [56.15, { x: 1300, y: 560, s: 0.9, rx: 3, ry: -12, o: 1 }, E.springSoft],
  [61.3, { x: 1300, y: 560, s: 0.9, rx: 3, ry: -12, o: 1 }],
  [62.3, { x: 1300, y: 560, s: 0.9, rx: 3, ry: -12, o: 0.1 }],
  [66.6, { x: 1300, y: 560, s: 0.9, rx: 3, ry: -12, o: 0.1 }],
  [67.6, { x: 1300, y: 560, s: 0.9, rx: 3, ry: -12, o: 1 }],
  [69.2, { x: 1300, y: 560, s: 0.9, rx: 3, ry: -12, o: 1 }],
  [70.0, { x: 1900, y: 560, s: 0.84, rx: 3, ry: -20, o: 0 }],
  [77.4, { x: -500, y: 560, s: 1.42, rx: 0, ry: 14, o: 0 }],
  [78.05, { x: 620, y: 556, s: 1.42, rx: 0, ry: 6, o: 1 }],
  [81.6, { x: 620, y: 556, s: 1.42, rx: 0, ry: 6, o: 1 }],
  [82.25, { x: 480, y: 556, s: 1.3, rx: 0, ry: 10, o: 0 }]
];
/* camera: world point (fx, fy) appears at stage point (sx, sy) with zoom z */
const ID = { sx: 960, sy: 540, fx: 960, fy: 540, z: 1 };
function camKeys() {
  // phone close-up framing helpers (phone centre (1250,540), s = 1, no rotation)
  const phW = (sx, sy) => ({ x: 1250 + (sx - PH_SCREEN_W / 2), y: 540 + (sy - PH_SCREEN_H / 2) });
  const s3 = phW(195, 300);
  const s3save = phW(195, 420);
  const s4q = phW(195, 330);
  const s5d = phW(195, 400);
  // phone hero card in Scene 4: phone at (600,560), s=.92
  const heroScreenY = M.phViewportTop + (M.ph['ph.hero'].y - M.viewTop['ph.vDash']) + M.ph['ph.hero'].h / 2;
  const heroW = { x: 600, y: 560 + (heroScreenY - PH_SCREEN_H / 2) * 0.92 };
  return [
    [0, ID],
    [19.2, ID],
    [20.6, { sx: 1250, sy: 330, fx: 1250, fy: 330, z: 1.08 }, E.inOutSine],
    [21.6, ID],
    [30.7, ID],
    [31.45, { sx: 1250, sy: 465, fx: s3.x, fy: s3.y, z: 1.45 }],
    [43.7, { sx: 1250, sy: 470, fx: s3.x, fy: s3.y, z: 1.45 }, E.inOutSine],
    [44.4, { sx: 1250, sy: 470, fx: s3save.x, fy: s3save.y, z: 1.18 }],
    [50.3, { sx: 1250, sy: 470, fx: s3save.x, fy: s3save.y, z: 1.18 }],
    [51.15, { sx: 1250, sy: 455, fx: s4q.x, fy: s4q.y, z: 1.35 }],
    [54.4, { sx: 1250, sy: 455, fx: s4q.x, fy: s4q.y, z: 1.35 }],
    [55.6, ID],
    [T.s4.zoom[0], ID],
    [T.s4.zoom[1], { sx: 700, sy: 470, fx: heroW.x, fy: heroW.y, z: 2.05 }],
    [T.s4.pull[0], { sx: 700, sy: 474, fx: heroW.x, fy: heroW.y, z: 2.05 }, E.inOutSine],
    [T.s4.pull[1], ID],
    [74.4, ID],
    [75.0, { sx: 1250, sy: 470, fx: s5d.x, fy: s5d.y, z: 1.25 }],
    [77.15, { sx: 1250, sy: 474, fx: s5d.x, fy: s5d.y, z: 1.25 }, E.inOutSine],
    [77.75, ID],
    [90, ID]
  ];
}
let CAM = null;
function camAt(t) { return kf(t, CAM); }
function camApply(c, wx, wy) { return { x: c.sx + (wx - c.fx) * c.z, y: c.sy + (wy - c.fy) * c.z }; }
function placeDevice(el, st, extra) {
  vis(el, st.o > 0.002);
  if (st.o <= 0.002) return;
  op(el, st.o);
  tf(el, 'translate(' + px(st.x) + ',' + px(st.y) + ') translate(-50%,-50%) perspective(2667px) rotateX(' + r2(st.rx) + 'deg) rotateY(' + r2(st.ry) + 'deg) scale(' + r2(st.s) + ')' + (extra || ''));
}
/* stage position of a phone-screen point (ignores the small residual rotation; used for overlays) */
function phoneScreenToStage(t, sx, sy) {
  const p = kf(t, PHONE_KEYS), c = camAt(t);
  const wx = p.x + (sx - PH_SCREEN_W / 2) * p.s, wy = p.y + (sy - PH_SCREEN_H / 2) * p.s;
  return camApply(c, wx, wy);
}

/* ---------------------------------------------------------------- touch indicator */
function touchState(taps, t, posFn) {
  // finger visible from 0.45 s before a tap to 0.3 s after; glides between close taps
  let cur = -1;
  for (let i = 0; i < taps.length; i++) { if (taps[i].t - 0.5 <= t) cur = i; }
  if (cur < 0) return null;
  const tp = taps[cur];
  const prev = cur > 0 ? taps[cur - 1] : null;
  const next = cur < taps.length - 1 ? taps[cur + 1] : null;
  const glide = prev && tp.t - prev.t < 0.95 && tp.layer === prev.layer;
  let o, x, y;
  const target = posFn(tp, t);
  if (glide) {
    const from = posFn(prev, t);
    const p = seg(t, prev.t + 0.1, tp.t - 0.06, E.inOutCubic);
    x = lerp(from.x, target.x, p); y = lerp(from.y, target.y, p); o = 1;
  } else {
    x = target.x; y = target.y + 26 * (1 - seg(t, tp.t - 0.5, tp.t - 0.12, E.outCubic));
    o = seg(t, tp.t - 0.5, tp.t - 0.25, E.outCubic);
  }
  const willGlide = next && next.t - tp.t < 0.95 && next.layer === tp.layer;
  if (!willGlide) o = Math.min(o, 1 - seg(t, tp.t + 0.12, tp.t + 0.4, E.inCubic));
  const press = 1 - 0.14 * win(t, tp.t - 0.07, tp.t, tp.t + 0.02, tp.t + 0.12, E.outQuad, E.inQuad);
  const rp = seg(t, tp.t, tp.t + 0.5, E.outCubic);
  const ripple = t >= tp.t ? { s: lerp(0.5, 2.3, rp), o: 0.75 * (1 - rp) } : { s: 0.5, o: 0 };
  return { x, y, o, press, ripple };
}
function renderTouch(el, rip, st) {
  if (!st || st.o <= 0.002) { op(el, 0); return; }
  op(el, st.o);
  tf(el, 'translate(' + px(st.x) + ',' + px(st.y) + ') scale(' + r2(st.press) + ')');
  op(rip, st.ripple.o); tf(rip, 'scale(' + r2(st.ripple.s) + ')');
}

/* ---------------------------------------------------------------- Scene 1 builders (seeded) */
const S1 = { houses: [], scribbles: [], tally: [], cells: [] };
function buildScene1() {
  const svg = $['s1.mapSvg'];
  const r = rng('peta-ilustrasi-muallim');
  // district blob (abstract, not real geography)
  const cx = 930, cy = 560; let d = '';
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * Math.PI * 2, rad = 380 + Math.sin(a * 3 + 1.2) * 46 + Math.sin(a * 5 + 0.4) * 24 + (r() - 0.5) * 18;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad * 1.28).toFixed(1) + ' ' + (cy + Math.sin(a) * rad * 0.92).toFixed(1);
  }
  let g = '<defs><pattern id="mgrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="rgba(148,163,184,.07)" stroke-width="1"/></pattern></defs>' +
    '<rect width="1920" height="1080" fill="url(#mgrid)"/>' +
    '<path d="' + d + 'Z" fill="rgba(20,184,166,.07)" stroke="rgba(94,234,212,.45)" stroke-width="2.5" stroke-dasharray="10 8"/>' +
    '<path d="M180 820 C 520 700, 640 760, 860 640 S 1240 380, 1740 300" fill="none" stroke="rgba(56,189,248,.38)" stroke-width="9" stroke-linecap="round"/>';
  const roads = ['M260 300 C 560 420, 820 470, 1010 560 S 1500 720, 1700 860', 'M760 980 C 860 820, 940 680, 1010 560 S 1080 330, 1180 160',
    'M1010 560 C 1180 520, 1380 500, 1620 470', 'M420 640 C 620 600, 820 600, 1010 560'];
  for (const rd of roads) g += '<path d="' + rd + '" fill="none" stroke="rgba(203,213,225,.22)" stroke-width="5" stroke-linecap="round"/>';
  // 110 premises around the pin (seeded positions)
  const hr = rng('premis-110');
  let houses = '';
  for (let i = 0; i < 110; i++) {
    const a = hr() * Math.PI * 2, rad = 40 + Math.sqrt(hr()) * 230;
    const x = 1010 + Math.cos(a) * rad * 1.35, y = 560 + Math.sin(a) * rad * 0.85;
    houses += '<rect x="' + (x - 5).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" width="10" height="10" rx="2" fill="#cbd5e1" opacity="0" data-h="' + i + '"/>';
  }
  svg.innerHTML = g + '<g>' + houses + '</g>';
  S1.houses = Array.from(svg.querySelectorAll('rect[data-h]'));
  tf($['s1.district'], 'translate(560px, 214px)');
  // handwriting scribbles on the paper forms
  for (let p = 1; p <= 3; p++) {
    const host = $['s1.paperGrid' + p], pr = rng('kertas-' + p);
    const W = 468, rowH = 40, rows = 12, colX = [0, 44, 230, 300, 380, 468];
    let s = '<svg width="' + W + '" height="' + (rowH * (rows + 1) + 4) + '" viewBox="0 0 ' + W + ' ' + (rowH * (rows + 1) + 4) + '">';
    const heads = ['Bil', 'Alamat', 'Kod', 'Penghuni', 'Gejala'];
    heads.forEach((h, i) => { s += '<text x="' + (colX[i] + 6) + '" y="26" font-size="13" font-weight="700" fill="#334155">' + h + '</text>'; });
    for (let rI = 0; rI <= rows + 1; rI++) s += '<line x1="0" x2="' + W + '" y1="' + (rI * rowH) + '" y2="' + (rI * rowH) + '" stroke="#94a3b8" stroke-width="1"/>';
    for (let c = 1; c < colX.length - 1; c++) s += '<line x1="' + colX[c] + '" x2="' + colX[c] + '" y1="0" y2="' + (rowH * (rows + 1)) + '" stroke="#94a3b8" stroke-width="1"/>';
    for (let rI = 1; rI <= rows; rI++) {
      for (let c = 0; c < 5; c++) {
        const x0 = colX[c] + 7, x1 = colX[c + 1] - 7, yb = rI * rowH + 27;
        const width = c === 1 ? (x1 - x0) * (0.55 + pr() * 0.4) : c === 4 ? (x1 - x0) * (0.3 + pr() * 0.6) : (x1 - x0) * (0.4 + pr() * 0.35);
        let path = 'M' + x0.toFixed(1) + ' ' + (yb - 4).toFixed(1);
        let x = x0;
        while (x < x0 + width) {
          const w = 5 + pr() * 7, up = 7 + pr() * 9;
          path += ' c ' + (w * 0.3).toFixed(1) + ' ' + (-up).toFixed(1) + ' ' + (w * 0.7).toFixed(1) + ' ' + (-up).toFixed(1) + ' ' + w.toFixed(1) + ' ' + (pr() * 6 - 1).toFixed(1);
          x += w;
        }
        s += '<path d="' + path + '" fill="none" stroke="#1e3a8a" stroke-width="1.7" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" data-row="' + rI + '" data-col="' + c + '"/>';
      }
    }
    s += '</svg>';
    host.innerHTML = s;
    S1.scribbles[p] = Array.from(host.querySelectorAll('path[data-row]'));
  }
  // tally marks: one row per team, groups of five
  const ts = $['s1.tallySvg']; let tg = ''; const tr = rng('tally');
  let mark = 0;
  for (let k = 1; k <= 6; k++) {
    const y = 34 + (k - 1) * 58;
    tg += '<text x="4" y="' + (y + 22) + '" font-size="22" font-weight="700" font-style="italic" fill="#1e3a8a">P' + k + '</text>';
    const n = TEAMS[k].visited;
    for (let i = 0; i < n; i++) {
      const grp = Math.floor(i / 5), j = i % 5, gx = 52 + grp * 70;
      let p;
      if (j < 4) { const x = gx + j * 11 + (tr() - 0.5) * 2; p = 'M' + x.toFixed(1) + ' ' + (y + (tr() - 0.5) * 3).toFixed(1) + ' L' + (x + (tr() - 0.5) * 3).toFixed(1) + ' ' + (y + 30).toFixed(1); }
      else { p = 'M' + (gx - 6) + ' ' + (y + 24) + ' L' + (gx + 42) + ' ' + (y + 6); }
      tg += '<path d="' + p + '" stroke="#1e3a8a" stroke-width="2.6" stroke-linecap="round" fill="none" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" data-m="' + (mark++) + '"/>';
    }
  }
  tg += '<text x="4" y="404" font-size="26" font-weight="800" font-style="italic" fill="#7c2d12" opacity="0" data-sum="1">Jumlah dilawati: ' + TOTALS.visited + '</text>';
  ts.innerHTML = tg;
  S1.tally = Array.from(ts.querySelectorAll('path[data-m]'));
  S1.tallySum = ts.querySelector('[data-sum]');
  // laptop re-entry grid
  const lg = $['s1.lapGrid'];
  const rows = [['Lokaliti', 'locality'], ['Dilawati', 'visited'], ['Berkunci/Kosong', 'locked'], ['Penduduk', 'pop'], ['Bergejala', 'symp'], ['Rujukan', 'ref']];
  let lh = '<div class="lg-row lg-hd"><span class="lg-l">PERKARA</span>' + [1, 2, 3, 4, 5, 6].map(k => '<span>P' + k + '</span>').join('') + '<span>Jumlah</span></div>';
  rows.forEach(([label, key]) => {
    lh += '<div class="lg-row"><span class="lg-l">' + label + '</span>';
    for (let k = 1; k <= 6; k++) lh += '<span class="lg-c" data-v="' + TEAMS[k][key] + '"></span>';
    lh += '<span class="lg-c" data-v="' + TOTALS[key] + '"></span></div>';
  });
  lg.innerHTML = lh + '<div class="lg-sim">' + simBadge('') + '</div>';
  S1.cells = Array.from(lg.querySelectorAll('.lg-c'));
}

/* ---------------------------------------------------------------- background */
const DUST = [];
function buildBackground() {
  css($['bg.grad'], 'background', 'linear-gradient(160deg, #020617 0%, #0b1324 42%, #0e2a2c 74%, #134e4a 100%)');
  css($['bg.s1'], 'background', 'radial-gradient(ellipse 80% 70% at 52% 52%, #170a14 0%, #080b16 52%, #020409 100%)');
  css($['bg.s6'], 'background', 'radial-gradient(ellipse 90% 80% at 50% 40%, #0f766e 0%, #115e59 32%, #0b3b37 64%, #031b1a 100%)');
  let g = '';
  for (let x = 0; x <= 1920; x += 96) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="1080" stroke="rgba(94,234,212,.045)" stroke-width="1"/>';
  for (let y = 0; y <= 1080; y += 96) g += '<line x1="0" y1="' + y + '" x2="1920" y2="' + y + '" stroke="rgba(94,234,212,.045)" stroke-width="1"/>';
  $['bg.grid'].innerHTML = g;
  const r = rng('dust'); let d = '';
  for (let i = 0; i < 34; i++) { d += '<i></i>'; DUST.push({ x: r() * 1920, y: r() * 1080, vx: (r() - 0.5) * 14, vy: -6 - r() * 12, a: 0.2 + r() * 0.5, s: 0.6 + r() * 1.4, ph: r() * 6.28 }); }
  $['bg.dust'].innerHTML = d;
  DUST.forEach((p, i) => { p.el = $['bg.dust'].children[i]; });
}
function renderBg(t) {
  op($['bg.s1'], 1 - seg(t, 14.95, 15.7, E.outCubic));
  op($['bg.s6'], seg(t, 81.9, 83.6, E.inOutSine));
  const glow = lerp(0.18, 1, seg(t, 15.0, 16.6, E.outCubic));
  op($['bg.g1'], glow); op($['bg.g2'], glow * 0.9);
  tf($['bg.g1'], 'translate(' + px(560 + Math.sin(t * 0.11) * 220) + ',' + px(-760 + Math.cos(t * 0.09) * 120) + ')');
  tf($['bg.g2'], 'translate(' + px(-420 + Math.cos(t * 0.08) * 200) + ',' + px(80 + Math.sin(t * 0.1) * 110) + ')');
  op($['bg.grid'], lerp(0.5, 1, seg(t, 15, 16.5)));
  tf($['bg.grid'], 'translate(' + px(-((t * 6) % 96)) + ',' + px(-((t * 4) % 96)) + ')');
  const dustOn = 0.35 + 0.65 * seg(t, 15, 16.5);
  for (const p of DUST) {
    const x = ((p.x + p.vx * t) % 1920 + 1920) % 1920, y = ((p.y + p.vy * t) % 1080 + 1080) % 1080;
    tf(p.el, 'translate(' + px(x) + ',' + px(y + Math.sin(t * 0.7 + p.ph) * 10) + ') scale(' + r2(p.s) + ')');
    op(p.el, p.a * dustOn * (0.6 + 0.4 * Math.sin(t * 1.3 + p.ph)));
  }
}

/* ---------------------------------------------------------------- subtitles */
function renderSubs(t) {
  let best = null, a = 0;
  for (const c of CUES) {
    const w = win(t, c.start - 0.08, c.start + 0.1, c.end - 0.06, c.end + 0.1, E.outQuad, E.inQuad);
    if (w > a) { a = w; best = c; }
  }
  // bridge short gaps so the box does not flicker between phrases
  const box = $['subsBox'];
  if (!best) {
    let prev = null, next = null;
    for (const c of CUES) { if (c.end <= t) prev = c; if (!next && c.start > t) next = c; }
    if (prev && next && next.start - prev.end < 0.65 && t - prev.end < 0.65) { best = prev; a = 0; }
  }
  const showSubs = window.ACD_SUBS !== false;
  op(box, showSubs ? a : 0);
  if (best) txt(box, best.sub);
}

/* ==========================================================================
 * SCENE 1 — Cabaran operasi lapangan (0–15 s)
 * ========================================================================== */
function renderS1(t) {
  const on = t < 15.2;
  vis($.s1, on); if (!on) return;
  const shake = 7 * seg(t, T.s1.shake, 14.4, E.inQuad);
  const collapse = seg(t, T.s1.collapse, T.s1.collapse + 0.5, E.inCubic);
  const sc = lerp(1, 1.05, seg(t, 0, 14, E.inOutSine)) * lerp(1, 0.8, collapse);
  tf($.s1, 'translate(' + px(shake * noise(t, 1)) + ',' + px(shake * noise(t, 2)) + ') translate(960px,540px) scale(' + r2(sc) + ') translate(-960px,-540px)');
  op($.s1, 1 - collapse);
  // map
  op($['s1.map'], seg(t, 0, 1.3, E.outCubic) * lerp(1, 0.32, seg(t, 3.7, 4.7)));
  const mz = lerp(1.08, 1, seg(t, 0, 3.4, E.outCubic)) * lerp(1, 1.16, seg(t, 3.4, 13, E.inOutSine));
  tf($['s1.map'], 'translate(1010px,560px) scale(' + r2(mz) + ') translate(-1010px,-560px)');
  op($['s1.mapChip'], seg(t, 0.5, 1.1) * (1 - seg(t, 3.7, 4.3)));
  op($['s1.district'], seg(t, 0.8, 1.6) * (1 - seg(t, 3.7, 4.3)));
  const drop = seg(t, T.s1.pinDrop, T.s1.pinDrop + 0.7, E.spring);
  op($['s1.pin'], seg(t, T.s1.pinDrop, T.s1.pinDrop + 0.15));
  tf($['s1.pin'], 'translate(1010px,' + px(560 - 110 * (1 - drop)) + ')');
  if (t > 1.5) { const rp = ((t - 1.5) % 1.6) / 1.6; op($['s1.pinRing'], 0.9 * (1 - rp)); tf($['s1.pinRing'], 'scale(' + r2(0.3 + rp * 1.5) + ')'); } else op($['s1.pinRing'], 0);
  op($['s1.pinLabel'], seg(t, 1.5, 1.95)); tf($['s1.pinLabel'], 'translateX(' + px(-14 * (1 - seg(t, 1.5, 1.95, E.outCubic))) + ')');
  for (let i = 0; i < S1.houses.length; i++) attr(S1.houses[i], 'opacity', String(r2(seg(t, T.s1.houses + i * 0.018, T.s1.houses + 0.3 + i * 0.018))));
  // paper forms
  const P = [
    { el: 's1.paper1', tIn: T.s1.papers[0], from: [380, 1400, -18], to: [600, 610, -7], mid: [520, 600, -9] },
    { el: 's1.paper2', tIn: T.s1.papers[1], from: [1640, 1400, 16], to: [1290, 590, 5], mid: [1150, 600, 7] },
    { el: 's1.paper3', tIn: T.s1.papers[2], from: [950, -520, -4], to: [950, 625, -1.5], mid: [860, 630, -3] }
  ];
  P.forEach((p, i) => {
    const a = seg(t, p.tIn, p.tIn + 0.75, E.springSoft);
    const m = seg(t, T.s1.tally, T.s1.tally + 0.6, E.inOutCubic);
    const out = seg(t, 12.6, 14.4, E.inCubic);
    let x = lerp(lerp(p.from[0], p.to[0], a), p.mid[0], m), y = lerp(lerp(p.from[1], p.to[1], a), p.mid[1], m), r = lerp(lerp(p.from[2], p.to[2], a), p.mid[2], m);
    x += (i - 1) * 140 * out; r += (i - 1) * 9 * out + noise(t, 10 + i) * 2 * out;
    vis($[p.el], t > p.tIn - 0.05);
    tf($[p.el], 'translate(' + px(x) + ',' + px(y) + ') translate(-50%,-50%) rotate(' + r2(r) + 'deg) scale(' + r2(lerp(1, 0.9, seg(t, T.s1.laptop, T.s1.laptop + 0.6))) + ')');
    op($['s1.dim' + (i + 1)], 0.42 * seg(t, T.s1.laptop, T.s1.laptop + 0.6));
    const sc = S1.scribbles[i + 1], w0 = p.tIn + 0.6;
    for (let k = 0; k < sc.length; k++) {
      const row = +sc[k].dataset.row, col = +sc[k].dataset.col;
      const t0 = w0 + (row - 1) * 0.24 + col * 0.045;
      attr(sc[k], 'stroke-dashoffset', String(r2(1 - seg(t, t0, t0 + 0.12, E.lin))));
    }
  });
  // rain (field conditions)
  op($['s1.rain'], 0.75 * win(t, T.s1.rain[0], T.s1.rain[0] + 0.8, T.s1.rain[1] - 0.9, T.s1.rain[1]));
  tf($['s1.rain'], 'translate(' + px(-((t * 260) % 120)) + ',' + px((t * 1150) % 120) + ')');
  // tally pad
  const ta = seg(t, T.s1.tally, T.s1.tally + 0.7, E.springSoft), tout = seg(t, 12.6, 14.4, E.inCubic);
  vis($['s1.tally'], t > T.s1.tally - 0.05);
  tf($['s1.tally'], 'translate(' + px(lerp(2200, 1490, ta) + 120 * tout) + ',' + px(600) + ') translate(-50%,-50%) rotate(' + r2(lerp(12, 4, ta) + 8 * tout) + 'deg) scale(' + r2(lerp(1, 0.9, seg(t, T.s1.laptop, T.s1.laptop + 0.6))) + ')');
  op($['s1.dim4'], 0.34 * seg(t, T.s1.laptop, T.s1.laptop + 0.6));
  for (let i = 0; i < S1.tally.length; i++) { const t0 = 6.5 + i * (2.7 / 92); attr(S1.tally[i], 'stroke-dashoffset', String(r2(1 - seg(t, t0, t0 + 0.06, E.lin)))); }
  attr(S1.tallySum, 'opacity', String(r2(seg(t, 9.3, 9.7))));
  // laptop re-entry
  const la = seg(t, T.s1.laptop, T.s1.laptop + 0.7, E.springSoft), lout = seg(t, 12.8, 14.4, E.inCubic);
  vis($['s1.laptop'], t > T.s1.laptop - 0.05);
  tf($['s1.laptop'], 'translate(' + px(960) + ',' + px(lerp(1500, 650, la) + 40 * lout) + ') translate(-50%,-50%) scale(' + r2(0.9 - 0.06 * lout) + ') rotate(' + r2(noise(t, 33) * 1.6 * lout) + 'deg)');
  const n = S1.cells.length, dt = (T.s1.typing[1] - T.s1.typing[0]) / n;
  for (let i = 0; i < n; i++) {
    const c = S1.cells[i], t0 = T.s1.typing[0] + i * dt;
    txt(c, t >= t0 ? c.dataset.v : '');
    cls(c, 'cur', t >= t0 - dt && t < t0 + dt * 0.6 && t < T.s1.typing[1] + 0.2);
  }
  // problem statement
  const words = ['s1.w1', 's1.w2', 's1.w3'];
  words.forEach((w, i) => {
    const t0 = T.s1.text[i], a = seg(t, t0, t0 + 0.45, E.outCubic);
    const dim = i < 2 ? lerp(1, 0.55, seg(t, T.s1.text[i + 1], T.s1.text[i + 1] + 0.4)) : 1;
    const back = seg(t, 11.8, 12.3);
    op($[w], a * lerp(dim, 1, back));
    tf($[w], 'translateY(' + px(24 * (1 - a)) + ')');
  });
  op($['s1.text'], 1 - seg(t, 13.9, 14.4));
}

/* ==========================================================================
 * SCENE 2 — Pengenalan sistem (15–30 s)
 * ========================================================================== */
function renderS2(t) {
  const on = t > 14.9 && t < 30.4;
  vis($.s2, on); if (!on) return;
  // brand block → shrinks to a top-left lockup while the inset plays
  // emblem + badge reveal centred, then glide left as the phone rises; later shrink to a lockup
  const lk = seg(t, 23.0, 23.8, E.inOutCubic), gl = seg(t, 16.3, 17.4, E.springSoft);
  const bx = lerp(872, 150, gl), by = lerp(330, 150, gl);
  tf($['s2.brand'], 'translate(' + px(lerp(bx, 96, lk)) + ',' + px(lerp(by, 58, lk)) + ') scale(' + r2(lerp(1, 0.44, lk)) + ')');
  op($['s2.brand'], 1 - seg(t, 29.3, 30.05));
  const j = seg(t, T.s2.jata, T.s2.jata + 0.9, E.spring);
  op($['s2.jata'], seg(t, T.s2.jata, T.s2.jata + 0.3)); tf($['s2.jata'], 'scale(' + r2(lerp(0.6, 1, j)) + ')');
  const b = seg(t, T.s2.badge, T.s2.badge + 0.55, E.spring);
  op($['s2.badge'], seg(t, T.s2.badge, T.s2.badge + 0.15)); tf($['s2.badge'], 'scale(' + r2(lerp(0.7, 1, b)) + ')');
  for (let i = 0; i < 4; i++) {
    const a = seg(t, T.s2.title + i * 0.13, T.s2.title + i * 0.13 + 0.55, E.outCubic);
    op($['s2.tw' + i], a); tf($['s2.tw' + i], 'translateY(' + px(30 * (1 - a)) + ')');
  }
  const sb = seg(t, T.s2.sub, T.s2.sub + 0.5, E.outCubic);
  op($['s2.sub'], sb); tf($['s2.sub'], 'translateY(' + px(18 * (1 - sb)) + ')');
  // locality + meeting point callout (right of the phone)
  const cl = win(t, T.s2.locCallout, T.s2.locCallout + 0.45, 21.0, 21.35, E.outBack);
  op($['s2.cLoc'], cl); tf($['s2.cLoc'], 'translate(' + px(1478 + 20 * (1 - cl)) + ',' + px(150) + ') scale(' + r2(lerp(0.94, 1, cl)) + ')');
  // staff requirement callout (left, under the title)
  const cs = win(t, T.s2.staffCallout, T.s2.staffCallout + 0.45, 23.0, 23.35, E.outBack);
  op($['s2.cStaff'], cs); tf($['s2.cStaff'], 'translate(' + px(150) + ',' + px(652 + 16 * (1 - cs)) + ')');
  for (let k = 1; k <= 6; k++) { const a = seg(t, T.s2.staffCallout + 0.25 + k * 0.07, T.s2.staffCallout + 0.5 + k * 0.07, E.outBack); tf($['s2.team' + k], 'scale(' + r2(lerp(0.6, 1, a)) + ')'); op($['s2.team' + k], a); }
  // add-to-home inset
  const ia = seg(t, T.s2.insetIn, T.s2.insetIn + 0.55, E.spring), iout = seg(t, 25.75, 26.15, E.inCubic);
  vis($['s2.inset'], t > T.s2.insetIn - 0.05 && t < 26.3);
  op($['s2.inset'], Math.min(seg(t, T.s2.insetIn, T.s2.insetIn + 0.25), 1 - iout));
  tf($['s2.inset'], 'translate(560px,' + px(196 + 20 * (1 - ia)) + ') scale(' + r2(lerp(0.92, 1, ia) - 0.05 * iout) + ')');
  const sh = seg(t, T.s2.tapShare + 0.05, T.s2.tapShare + 0.45, E.outCubic);
  tf($['s2.sheet'], 'translateY(' + (100 * (1 - sh)).toFixed(2) + '%)');
  cls($['s2.addRow'], 'on', t >= T.s2.tapAddRow - 0.05);
  const ad = seg(t, T.s2.tapAddRow + 0.2, T.s2.tapAddRow + 0.5, E.outCubic);
  op($['s2.addDlg'], ad); tf($['s2.addDlg'], 'translateY(' + px(24 * (1 - ad)) + ')');
  cls($['s2.addBtn'], 'on', t >= T.s2.tapAdd - 0.05);
  const st = touchState(TAPS.s2, t, tp => { const m = M.s2[tp.ref]; return { x: m.x + m.w / 2, y: m.y + m.h / 2 }; });
  renderTouch($['s2.touch'], $['s2.ripple'], t < 26 ? st : null);
}

/* ==========================================================================
 * PHONE (world actor, Scenes 2–5)
 * ========================================================================== */
const QTAB_W = 96;
function qTeam(t) { return step(t, [[0, 1], [T.s4.teams[1], 2], [T.s4.teams[2], 3], [T.s4.teams[3], 4], [T.s4.teams[4], 5], [T.s4.teams[5], 6]]); }
function qTabsShift(t) {
  const target = k => clamp((k - 1) * QTAB_W + 45 - 167, 0, 6 * 90 + 5 * 6 - 334);
  const keys = [[0, target(1)]];
  for (let i = 1; i < 6; i++) keys.push([T.s4.teams[i] - 0.05, keys[keys.length - 1][1]], [T.s4.teams[i] + 0.22, target(i + 1), E.outCubic]);
  return kf(t, keys);
}
function setSync(prefix, t, states) {
  const s = step(t, states);
  txt($[prefix + 'syncText'], s[0]);
  css($[prefix + 'syncDot'], 'background-color', s[1] ? '#fbbf24' : '#34d399');
}
function renderDash(p, t) {
  const teams = teamsAt(t), tot = computeTotals(teams);
  txt($[p + 'kpiPct'], tot.pct + '%');
  txt($[p + 'kpiRatio'], '(' + tot.visited + ' / ' + tot.locality + ' premis)');
  css($[p + 'kpiBar'], 'width', Math.min(100, tot.pct) + '%');
  css($[p + 'kpiBar'], 'background-color', tot.pct >= TARGET_PCT ? '#34d399' : '#fbbf24');
  const badge = $[p + 'kpiBadge'];
  if (tot.locality === 0) { txt(badge, 'Sasaran ≥ 80%'); css(badge, 'background-color', '#0f766e'); css(badge, 'color', '#ccfbf1'); }
  else if (tot.pct >= TARGET_PCT) { txt(badge, 'Capai Sasaran (≥80%)'); css(badge, 'background-color', '#34d399'); css(badge, 'color', '#020617'); }
  else { txt(badge, 'Sedang Berjalan (<80%)'); css(badge, 'background-color', '#fbbf24'); css(badge, 'color', '#020617'); }
  txt($[p + 'kpiTeams'], tot.activeTeams + '/6 Pasukan Aktif');
  txt($[p + 'mLoc'], String(tot.locality)); txt($[p + 'mVis'], String(tot.visited)); txt($[p + 'mLock'], String(tot.locked));
  txt($[p + 'mPop'], String(tot.pop)); txt($[p + 'mSymp'], String(tot.symp)); txt($[p + 'mRef'], String(tot.ref));
  txt($[p + 'mSample'], tot.sample + ' sampel');
  txt($[p + 'envB'], String(tot.breeding)); txt($[p + 'envA'], String(tot.abate)); txt($[p + 'envP'], String(tot.pamphlet));
  op($[p + 'targetMark'], seg(t, 57.8, 58.4) * (1 - seg(t, 69.5, 70)));
  return { teams, tot };
}
function renderPhone(t) {
  const on = t > 16.3 && t < 77.9;
  vis($.phone, on); if (!on) return;
  placeDevice($.phone, kf(t, PHONE_KEYS));
  const pk = kf(t, PHONE_KEYS);
  css($['ph.glass'], 'background-position', r2(50 + pk.ry * 2.2) + '% 0');
  // layers: app vs home screen (Scene 2)
  const homeO = win(t, T.s2.home, T.s2.home + 0.3, T.s2.appIn + 0.05, T.s2.appIn + 0.45);
  op($['ph.home'], homeO); vis($['ph.home'], homeO > 0.002);
  const appO = 1 - win(t, T.s2.home, T.s2.home + 0.3, T.s2.appIn, T.s2.appIn + 0.45);
  op($['ph.app'], appO); vis($['ph.app'], appO > 0.002);
  if (homeO > 0.002) {
    const ip = seg(t, T.s2.iconPop, T.s2.iconPop + 0.6, E.spring);
    const press = 1 - 0.1 * win(t, T.s2.tapIcon - 0.06, T.s2.tapIcon, T.s2.tapIcon + 0.05, T.s2.tapIcon + 0.15);
    tf($['ph.newIcon'], 'scale(' + r2(ip * press) + ')'); op($['ph.newIcon'], seg(t, T.s2.iconPop, T.s2.iconPop + 0.15));
    op($['ph.newIconLbl'], seg(t, T.s2.iconPop + 0.25, T.s2.iconPop + 0.55));
    const m = M.ph['ph.newIcon'], lp = seg(t, T.s2.launch, T.s2.launch + 0.7, E.inOutCubic);
    const L = $['ph.launch'];
    op(L, t >= T.s2.launch ? 1 : 0);
    css(L, 'left', px(lerp(m.x, 0, lp))); css(L, 'top', px(lerp(m.y, 0, lp)));
    css(L, 'width', px(lerp(m.w, PH_SCREEN_W, lp))); css(L, 'height', px(lerp(m.h, PH_SCREEN_H, lp)));
    css(L, 'border-radius', px(lerp(16, 56, lp)));
  }
  // active view + nav
  const v = phView(t);
  for (const k in VIEW_REF) { vis($[VIEW_REF[k]], k === v); cls($[NAV_REF[k]], 'on', k === v); }
  tf($['ph.scroll'], 'translateY(' + px(-phScroll(t)) + ')');
  // header sync badge (states follow the app's setSyncBadge calls)
  setSync('ph.', t, [[0, ['Sistem Aktif', 0]], [T.s3.saved + 0.05, ['Menyimpan ke Sheet...', 1]], [T.s3.saved + 0.85, ['Sheet Diselaraskan', 0]],
    [T.s5.tapSend + 0.05, ['Menyimpan ke Sheet...', 1]], [T.s5.synced, ['Sheet Diselaraskan', 0]]]);
  if (v === 'dash') renderDash('ph.', t);
  if (v === 'borang') renderBorang(t);
  if (v === 'pasukan') renderPasukan(t);
  // toasts
  const toasts = [
    [T.s3.saved, T.s3.saved + 2.5, 'Rekod rumah disimpan dan ditambah ke Pasukan ' + HOUSE_DEMO.team],
    [T.s5.synced, T.s5.synced + 1.45, 'Data berjaya diselaraskan ke Google Sheet'],
    [T.s5.tapVerify + 0.05, T.s5.tapVerify + 1.0, 'Pengesahan Bahagian D telah direkodkan']
  ];
  let ta = 0, tt = '';
  for (const [a, b, s] of toasts) { const w = win(t, a, a + 0.18, b - 0.2, b); if (w > ta) { ta = w; tt = s; } }
  op($['ph.toast'], ta); tf($['ph.toast'], 'translateY(' + px(12 * (1 - ta)) + ')'); if (tt) txt($['ph.toastText'], tt);
  // finger
  const st = touchState(TAPS.ph, t, tp => phRefScreen(tp.ref, t, tp.ax, tp.ay));
  renderTouch($['ph.touch'], $['ph.ripple'], st);
}
function renderBorang(t) {
  const S = T.s3;
  txt($['ph.teamSelText'], t < S.pickTeam ? 'Pasukan 2' : 'Pasukan ' + HOUSE_DEMO.team);
  const dd = win(t, S.tapTeam + 0.05, S.tapTeam + 0.18, S.pickTeam + 0.08, S.pickTeam + 0.22);
  op($['ph.teamDrop'], dd); tf($['ph.teamDrop'], 'scaleY(' + r2(lerp(0.9, 1, dd)) + ')');
  for (let k = 1; k <= 6; k++) cls($['ph.dd' + k], 'on', t < S.pickTeam - 0.06 ? k === 2 : k === 1);
  // address (cleared after save, like the app's submit handler)
  const addr = t < S.saved ? typed(t, 0) : '';
  txt($['ph.addr'], addr); vis($['ph.addrPh'], addr.length === 0);
  const focused = t >= S.tapAddr && t < S.tapStatus - 0.1;
  op($['ph.addrCaret'], focused && (t < S.type[1] || Math.floor(t * 2.4) % 2 === 0) ? 1 : 0);
  cls($['ph.addrBox'], 'focus-ring', focused);
  // status pills: previous record left "2 - Berkunci" selected
  for (const s of STATUS_CODES) cls($['ph.pill' + s.code], 'on', t < S.tapStatus ? s.code === '2' : s.code === HOUSE_DEMO.status);
  const occ = t < S.tapStatus ? 0 : 1 + S.occ.filter(x => t >= x).length;
  txt($['ph.occ'], String(occ));
  // Bahagian B
  const tog = symOpen(t);
  cls($['ph.toggle'], 'on', tog); txt($['ph.toggleLbl'], tog ? 'Ada Kes' : 'Tiada');
  css($['ph.symBox'], 'height', px(symH(t)));
  const chipOn = [S.chips[0], S.chips[1], null, S.chips[2]];
  for (let i = 0; i < 8; i++) cls($['ph.chip' + i], 'on', chipOn[i] !== undefined && chipOn[i] !== null && t >= chipOn[i] && t < S.saved);
  txt($['ph.sympCnt'], tog ? String(HOUSE_DEMO.symptomCount) : '0');
  txt($['ph.refCnt'], tog ? String(HOUSE_DEMO.referredCount) : '0');
  txt($['ph.sampleCnt'], '0');
  cls($['ph.sympWrap'], 'hl-rose', t >= S.tagSymp - 0.05 && t < 39.15);
  cls($['ph.refWrap'], 'hl-purple', t >= S.tagRef - 0.05 && t < 39.15);
  // Bahagian C
  cls($['ph.cb0'], 'on', t >= S.cb0 && t < S.saved);
  cls($['ph.cb1'], 'on', t >= S.cb1 && t < S.saved);
  cls($['ph.cb2'], 'on', t >= S.tapStatus);
  cls($['ph.cRow2'], 'hl-emerald', t >= S.risalah && t < S.risalah + 0.85);
  txt($['ph.actionText'], t < S.tapStatus ? 'Notis / Kad Lawatan Ditinggalkan' : t < S.toggle ? 'Pendidikan Kesihatan' : HOUSE_DEMO.fieldAction);
  cls($['ph.action'], 'hl', t >= S.action && t < S.action + 1.15);
  cls($['ph.saveBtn'], 'press', t >= S.save - 0.02 && t < S.save + 0.16);
  vis($['ph.lampRow'], t >= S.saved); vis($['ph.lampEmpty'], t < S.saved);
  txt($['ph.lampSub'], 'Memaparkan ' + (t >= S.saved ? 1 : 0) + ' rekod rumah dalam Lampiran 1.');
}
function renderPasukan(t) {
  const k = qTeam(t), d = TEAMS[k];
  for (let i = 1; i <= 6; i++) cls($['ph.qtab' + i], 'on', i === k);
  tf($['ph.qtabsRow'], 'translateX(' + px(-qTabsShift(t)) + ')');
  txt($['ph.qHead'], 'Dapatan Pasukan ' + k);
  const members = STAFF.filter(s => s.team === k).map(s => s.name.replace('PETUGAS ', 'Petugas '));
  txt($['ph.qMembers'], 'Anggota Pasukan ' + k + ': ' + members.join(', '));
  txt($['ph.qPct'], (calcTeamPct(d) === null ? 0 : calcTeamPct(d)) + '%');
  for (const f of ['locality', 'visited', 'locked', 'pop', 'symp', 'ref', 'sample']) txt($['ph.q_' + f], String(d[f]));
  cls($['ph.qSave'], 'press', t >= T.s5.tapSend - 0.02 && t < T.s5.tapSend + 0.16);
  // Bahagian D
  const name = typed(t, 1);
  txt($['ph.vName'], name); vis($['ph.vNamePh'], name.length === 0);
  op($['ph.vCaret'], t >= T.s5.tapName && t < T.s5.tapVerify - 0.1 && (t < T.s5.type[1] || Math.floor(t * 2.4) % 2 === 0) ? 1 : 0);
  const verified = t >= T.s5.tapVerify;
  html($['ph.vStatus'], verified
    ? 'Status: <span class="font-bold text-emerald-700">Telah Disahkan oleh ' + esc(OFFICER) + ' (' + esc(VERIFICATION.officerRole) + ') pada ' + esc(VERIFICATION.date) + '</span>'
    : 'Status: <span class="font-bold text-amber-700">Belum Disahkan</span>');
  cls($['ph.vBtn'], 'press', t >= T.s5.tapVerify - 0.02 && t < T.s5.tapVerify + 0.16);
  cls($['ph.secD'], 'hl-emerald', verified && t < T.s5.tapVerify + 0.9);
}

/* ==========================================================================
 * DESKTOP (world actor, Scenes 4–5)
 * ========================================================================== */
function dkScroll(t) {
  const max = Math.max(0, M.dkContentH - M.dkViewportH);
  const chart = clamp(M.dk['dk.charts'].y + M.dk['dk.charts'].h - M.dkViewportH + 16, 0, max);
  const refs = clamp(M.dk['dk.refList'].y + M.dk['dk.refList'].h - M.dkViewportH + 16, 0, max);
  const table = clamp(M.dk['dk.table'].y - 18, 0, max);
  if (t < 75) return kf(t, [[56.5, 0], [57.6, chart], [T.s4.pull[0], chart], [T.s4.pull[1] - 0.2, refs]]);
  return table;
}
function barPath(x, y, w, h, r) {
  if (h <= 0.01) return '';
  r = Math.min(r, w / 2, h);
  return 'M' + x.toFixed(2) + ' ' + (y + h).toFixed(2) + 'V' + (y + r).toFixed(2) + 'Q' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + (x + r).toFixed(2) + ' ' + y.toFixed(2) +
    'H' + (x + w - r).toFixed(2) + 'Q' + (x + w).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (x + w).toFixed(2) + ' ' + (y + r).toFixed(2) + 'V' + (y + h).toFixed(2) + 'Z';
}
function arcPath(cx, cy, R, r, a0, a1) {
  if (a1 - a0 < 0.0005) return '';
  if (a1 - a0 >= Math.PI * 2 - 1e-4) a1 = a0 + Math.PI * 2 - 1e-4;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p = (rad, a) => (cx + Math.cos(a) * rad).toFixed(2) + ' ' + (cy + Math.sin(a) * rad).toFixed(2);
  return 'M' + p(R, a0) + 'A' + R + ' ' + R + ' 0 ' + large + ' 1 ' + p(R, a1) + 'L' + p(r, a1) + 'A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + p(r, a0) + 'Z';
}
function renderDesktop(t) {
  const on = t > 54.75 && t < 70.05 || t > 77.35 && t < 82.3;
  vis($.desktop, on); if (!on) return;
  placeDevice($.desktop, kf(t, DESK_KEYS));
  tf($['dk.scroll'], 'translateY(' + px(-dkScroll(t)) + ')');
  setSync('dk.', t, [[0, ['Sheet Diselaraskan', 0]]]);
  const { teams, tot } = renderDash('dk.', t);
  // bar chart (same per-team values as the dashboard)
  const [pl, pt, pw, ph, maxY] = M.bar;
  for (let k = 1; k <= 6; k++) {
    const vals = [teams[k].locality, teams[k].visited, teams[k].locked];
    for (let j = 0; j < 3; j++) {
      const el = $['dk.bar' + k + '_' + j], x = +el.dataset.x, w = +el.dataset.w, h = (vals[j] / maxY) * ph;
      attr(el, 'd', barPath(x, pt + ph - h, w, h, 6));
    }
  }
  // doughnut: [Dilawati, Berkunci / Kosong, Belum Dilawati] as in the source
  const [cx, cy, R, r] = M.donut;
  const dData = tot.locality > 0 ? [tot.visited, tot.locked, tot.unvisited] : [0, 0, 1];
  const sum = dData.reduce((a, b) => a + b, 0);
  let a0 = -Math.PI / 2;
  const sweep = seg(t, T.s4.loc[0], T.s4.loc[0] + 0.9, E.outCubic);
  for (let i = 0; i < 3; i++) {
    const a1 = a0 + (dData[i] / sum) * Math.PI * 2 * sweep;
    attr($['dk.arc' + i], 'd', arcPath(cx, cy, R, r, a0, a1)); a0 = a1;
  }
  // toast + finger (Scene 5, beat 3)
  const ta = win(t, T.s5.tapWa + 0.1, T.s5.tapWa + 0.28, 80.6, 80.85);
  op($['dk.toast'], ta); txt($['dk.toastText'], 'Ringkasan laporan disalin! Sedia ditampal ke WhatsApp.');
  cls($['dk.btnWa'], 'press', t >= T.s5.tapWa - 0.02 && t < T.s5.tapWa + 0.16);
  cls($['dk.btnCsv'], 'hl', t >= T.s5.csv && t < 81.7);
  const st = t > 77 ? touchState(TAPS.dk, t, tp => { const m = M.dk[tp.ref]; return { x: m.x + m.w / 2, y: M.dkViewportTop + m.y - dkScroll(t) + m.h / 2 }; }) : null;
  renderTouch($['dk.touch'], $['dk.ripple'], st);
}

/* ==========================================================================
 * SCENE 5 actors — Sheets, Apps Script, peer device, chat, data flow
 * ========================================================================== */
function renderSheetBeat(t) {
  const S = T.s5;
  const on = t > 69.9 && t < 74.8;
  for (const k of ['sheet', 'gas', 'peer']) vis($[k], on);
  if (!on) { op($['ov.flow'], 0); return; }
  const inA = seg(t, S.b1 + 0.1, S.b1 + 0.75, E.springSoft), outA = seg(t, 74.1, 74.6, E.inCubic);
  placeDevice($.sheet, { x: lerp(2350, 1430, inA) + 200 * outA, y: 450, s: 0.82, rx: 0, ry: -8, o: Math.min(seg(t, S.b1 + 0.1, S.b1 + 0.3), 1 - outA) });
  const g = seg(t, S.b1 + 0.2, S.b1 + 0.7, E.spring);
  placeDevice($.gas, { x: 760, y: 380, s: lerp(0.9, 1, g), rx: 0, ry: 0, o: Math.min(seg(t, S.b1 + 0.2, S.b1 + 0.4), 1 - outA) });
  const pe = seg(t, S.b1 + 0.35, S.b1 + 0.85, E.spring);
  placeDevice($.peer, { x: 760, y: lerp(840, 770, pe), s: 0.78, rx: 0, ry: 0, o: Math.min(seg(t, S.b1 + 0.35, S.b1 + 0.55), 1 - outA) });
  // Apps Script functions
  cls($['gas.save'], 'active', t >= S.up[0] + 0.3 && t < S.synced - 0.05);
  cls($['gas.get'], 'active', t >= S.back[0] && t < S.back[1]);
  cls($['gas.props'], 'hl', t >= 72.45 && t < 73.05);
  // sheet cells C8:H13 written by setValues(), totals + % by sheet formulas
  const sel = $['sh.sel'];
  op(sel, win(t, 71.62, 71.78, 73.6, 74.0));
  css(sel, 'left', px(M.shSel.x)); css(sel, 'top', px(M.shSel.y)); css(sel, 'width', px(M.shSel.w)); css(sel, 'height', px(M.shSel.h));
  for (let k = 1; k <= 6; k++) {
    const tw = S.write + (k - 1) * 0.11;
    for (let r = 0; r < 7; r++) {
      const c = $['sh.c' + r + '_' + k], when = r < 6 ? tw : 72.62;
      op(c.firstChild, t >= when ? 1 : 0);
      const f = t >= when ? 1 - seg(t, when, when + 0.55, E.outQuad) : 0;
      css(c, 'background-color', f > 0.001 ? 'rgba(167,243,208,' + r2(f) + ')' : 'transparent');
    }
  }
  for (let r = 0; r < 7; r++) { const c = $['sh.tot' + r], when = r < 6 ? 72.5 : 72.62; op(c.firstChild, t >= when ? 1 : 0); }
  txt($['sh.fxv'], t < S.back[0] ? 'saveAcdDataFromApp → setValues()' : 'getAcdDataForApp → getValues()');
  txt($['sh.range'], t < S.back[0] ? 'Hasil ACD!C8:H13' : 'Hasil ACD!C8:H13 (baca)');
  cls($['sh.tab1'], 'pulse', t >= 72.55 && t < 73.3); op($['sh.tab1'].querySelector('.tick'), seg(t, 72.55, 72.7));
  cls($['sh.tab2'], 'pulse', t >= 72.65 && t < 73.4); op($['sh.tab2'].querySelector('.tick'), seg(t, 72.65, 72.8));
  // peer device pulls the latest data (getAcdDataForApp)
  const got = t >= S.back[1];
  txt($['peer.text'], got ? 'Sheet Diselaraskan' : 'Sistem Aktif');
  txt($['peer.pct'], got ? TOTALS.pct + '%' : '—');
  op($['peer.toast'], win(t, S.back[1], S.back[1] + 0.15, 74.3, 74.5));
  // flow lines + packets (screen space; camera is identity in this beat)
  const fl = Math.min(seg(t, S.b1 + 0.5, S.b1 + 0.9), 1 - outA);
  op($['ov.flow'], fl);
  renderPackets(t);
}
const FLOW = { paths: null, lens: null, pk: [] };
function buildFlow() {
  const p1 = 'M 465 400 C 520 400, 540 330, 580 330';
  const p2 = 'M 940 330 C 1000 330, 1000 400, 1061 400';
  const p3 = 'M 760 548 L 760 642';
  attr($['ov.fp1'], 'd', p1); attr($['ov.fp2'], 'd', p2); attr($['ov.fp3'], 'd', p3);
  FLOW.paths = [$['ov.fp1'], $['ov.fp2'], $['ov.fp3']];
  FLOW.lens = FLOW.paths.map(p => p.getTotalLength());
  let g = '';
  for (let i = 0; i < 16; i++) g += '<circle r="7" fill="#5eead4" opacity="0"/>';
  $['ov.packets'].innerHTML = g;
  FLOW.pk = Array.from($['ov.packets'].children);
}
function renderPackets(t) {
  const S = T.s5;
  // [path index, start, reverse, colour]
  const plan = [];
  for (let i = 0; i < 5; i++) plan.push([0, S.up[0] + i * 0.11, false, '#5eead4']);
  for (let i = 0; i < 5; i++) plan.push([1, S.up[0] + 0.62 + i * 0.11, false, '#5eead4']);
  for (let i = 0; i < 3; i++) plan.push([1, S.back[0] + i * 0.12, true, '#fbbf24']);
  for (let i = 0; i < 3; i++) plan.push([2, S.back[0] + 0.38 + i * 0.12, false, '#fbbf24']);
  plan.forEach((pl, i) => {
    const el = FLOW.pk[i], [pi, t0, rev, col] = pl, q = seg(t, t0, t0 + 0.5, E.inOutQuad);
    const live = t >= t0 && t <= t0 + 0.5;
    attr(el, 'opacity', live ? '1' : '0');
    if (!live) return;
    const L = FLOW.lens[pi], pt = FLOW.paths[pi].getPointAtLength(L * (rev ? 1 - q : q));
    attr(el, 'cx', pt.x.toFixed(1)); attr(el, 'cy', pt.y.toFixed(1)); attr(el, 'fill', col);
  });
  attr(FLOW.paths[0], 'stroke-dashoffset', String(-((t * 60) % 20)));
  attr(FLOW.paths[1], 'stroke-dashoffset', String(-((t * 60) % 20)));
  attr(FLOW.paths[2], 'stroke-dashoffset', String(-((t * 60) % 20)));
}
function renderChat(t) {
  const S = T.s5;
  const on = t > S.chat - 0.05 && t < 82.3;
  vis($.chat, on); if (!on) return;
  const a = seg(t, S.chat, S.chat + 0.55, E.springSoft), out = seg(t, 81.6, 82.25, E.inCubic);
  placeDevice($.chat, { x: lerp(2350, 1545, a) + 300 * out, y: 520, s: 0.92, rx: 0, ry: -6, o: 1 - out });
  op($['chat.hint'], win(t, S.paste - 0.35, S.paste - 0.2, S.paste - 0.02, S.paste + 0.1));
  const b = seg(t, S.paste, S.paste + 0.45, E.spring);
  op($['chat.bubble'], seg(t, S.paste, S.paste + 0.12)); tf($['chat.bubble'], 'scale(' + r2(lerp(0.94, 1, b)) + ')');
  txt($['chat.input'], t >= S.paste ? 'Ringkasan laporan ditampal · sedia dihantar' : 'Tulis mesej');
  const pulse = t > 80.2 ? 1 + 0.07 * Math.max(0, Math.sin((t - 80.2) * 6.5)) : 1;
  tf($['chat.send'], 'scale(' + r2(pulse) + ')');
}

/* ==========================================================================
 * OVERLAYS (screen space) — titles, step list, tags, coverage, beats, S6
 * ========================================================================== */
function ovWin(el, t, a, b, c, d, dy, ein) {
  const w = win(t, a, b, c, d, ein || E.outCubic, E.inCubic);
  op(el, w); return w;
}
function renderOverlays(t) {
  const S3 = T.s3, S4 = T.s4, S5 = T.s5;
  // flash into the reveal (global overlay: must be set on every frame, not only while Scene 1 is active)
  op($['ov.flash'], 0.92 * win(t, T.s1.flash, T.s1.flash + 0.22, 15.0, 15.55, E.inQuad, E.outCubic));
  // Scene 3 title + steps
  const w3 = ovWin($['ov.s3title'], t, 30.6, 31.1, 49.4, 49.9);
  tf($['ov.s3title'], 'translate(96px,' + px(96 + 18 * (1 - seg(t, 30.6, 31.1, E.outCubic))) + ')');
  const stepT = [30.9, 31.9, 35.2, 39.25, 43.9, 44.9];
  const ws = ovWin($['ov.steps'], t, 31.0, 31.5, S3.saved + 0.3, S3.saved + 0.65);
  tf($['ov.steps'], 'translate(96px,' + px(330) + ')');
  for (let i = 0; i < 5; i++) {
    const active = t >= stepT[i] && t < stepT[i + 1];
    cls($['ov.step' + i], 'on', active); cls($['ov.step' + i], 'done', t >= stepT[i + 1]);
    op($['ov.step' + i], seg(t, 31.0 + i * 0.08, 31.35 + i * 0.08));
  }
  // symptom / referral tags next to the phone, aligned with their fields
  if (t > 37 && t < 39.6) {
    const ps = phRefScreen('ph.sympWrap', t), pr = phRefScreen('ph.refWrap', t);
    const ss = phoneScreenToStage(t, ps.x, ps.y), sr = phoneScreenToStage(t, pr.x, pr.y);
    const leftEdge = phoneScreenToStage(t, 0, 0).x;
    const a1 = ovWin($['ov.tagSymp'], t, S3.tagSymp, S3.tagSymp + 0.3, 39.05, 39.4, 0, E.outBack);
    tf($['ov.tagSymp'], 'translate(' + px(leftEdge - 330 - 14 * (1 - a1)) + ',' + px(ss.y - 40) + ')');
    const a2 = ovWin($['ov.tagRef'], t, S3.tagRef, S3.tagRef + 0.3, 39.05, 39.4, 0, E.outBack);
    tf($['ov.tagRef'], 'translate(' + px(leftEdge - 330 - 14 * (1 - a2)) + ',' + px(sr.y - 40) + ')');
  } else { op($['ov.tagSymp'], 0); op($['ov.tagRef'], 0); }
  // recalculation chip after save
  const rc = ovWin($['ov.recalc'], t, S3.saved + 0.45, S3.saved + 0.9, 49.4, 49.9, 0, E.outBack);
  tf($['ov.recalc'], 'translate(96px,' + px(330 + 14 * (1 - rc)) + ')');
  txt($['ov.rcVis'], String(TEAM1_BEFORE.visited)); txt($['ov.rcLoc'], String(TEAM1_BEFORE.locality));
  // Scene 4 title (quick entry)
  ovWin($['ov.s4title'], t, 50.35, 50.85, 54.5, 55.0);
  tf($['ov.s4title'], 'translate(96px,' + px(96 + 18 * (1 - seg(t, 50.35, 50.85, E.outCubic))) + ')');
  // coverage hold
  const cv = ovWin($['ov.cov'], t, S4.cov, S4.cov + 0.5, S4.pull[0] + 0.3, S4.pull[0] + 0.8);
  tf($['ov.cov'], 'translate(' + px(1170 + 30 * (1 - cv)) + ',' + px(250) + ')');
  const cp = ovWin($['ov.capai'], t, S4.capai, S4.capai + 0.45, S4.pull[0] + 0.3, S4.pull[0] + 0.8, 0, E.outBack);
  tf($['ov.capai'], 'translate(' + px(1170) + ',' + px(624) + ') scale(' + r2(lerp(0.85, 1, cp)) + ')');
  const fm = ovWin($['ov.formula'], t, S4.cov + 0.9, S4.cov + 1.3, S4.pull[0] + 0.3, S4.pull[0] + 0.8);
  tf($['ov.formula'], 'translate(' + px(1170) + ',' + px(742) + ')');
  // Scene 5 beat titles
  const beats = [['ov.b1', 70.15, 74.15], ['ov.b2', 74.5, 77.3], ['ov.b3', 77.55, 81.7]];
  for (const [r, a, b] of beats) { const w = ovWin($[r], t, a, a + 0.4, b, b + 0.35); tf($[r], 'translate(96px,' + px(84 + 14 * (1 - w)) + ')'); }
  const vf = ovWin($['ov.verified'], t, S5.tapVerify + 0.15, S5.tapVerify + 0.5, 77.3, 77.6, 0, E.outBack);
  tf($['ov.verified'], 'translate(96px,' + px(200 + 10 * (1 - vf)) + ')');
  // CSV chip pinned under the "Muat Turun CSV" button
  if (t > S5.csv - 0.1 && t < 82) {
    const pk = kf(t, DESK_KEYS), m = M.dk['dk.btnCsv'];
    const sx = pk.x + ((14 + (m.x + m.w / 2) * 0.86545) - 490) * pk.s, sy = pk.y + ((14 + 29.4 + (M.dkViewportTop + m.y - dkScroll(t)) * 0.86545) - 395) * pk.s;
    const w = ovWin($['ov.csv'], t, S5.csv, S5.csv + 0.35, 81.55, 81.85, 0, E.outBack);
    tf($['ov.csv'], 'translate(' + px(sx - 150) + ',' + px(sy - 92 - 10 * (1 - w)) + ')');
  } else op($['ov.csv'], 0);
  // Scene 6 — benefits, then the closing lockup (held ≥ 3 s)
  const B = T.s6;
  for (let i = 0; i < 4; i++) {
    const a = seg(t, B.benefits + i * 0.25, B.benefits + i * 0.25 + 0.6, E.springSoft);
    const out = seg(t, 85.0, 85.5, E.inCubic);
    op($['s6.bf' + i], Math.min(seg(t, B.benefits + i * 0.25, B.benefits + i * 0.25 + 0.25), 1 - out));
    tf($['s6.bf' + i], 'translateY(' + px(40 * (1 - a) - 30 * out) + ') scale(' + r2(lerp(0.95, 1, a)) + ')');
  }
  tf($['s6.benefits'], 'translate(0px,' + px(330) + ')');
  const lk = seg(t, B.lockup, B.lockup + 0.8, E.outCubic);
  op($['s6.lockup'], lk); tf($['s6.lockup'], 'translate(0px,' + px(250 + 26 * (1 - lk)) + ')');
}

/* ==========================================================================
 * FRAME
 * ========================================================================== */
let lastFrame = -1;
function renderTime(t) {
  t = clamp(t, 0, DURATION - 1 / FPS);
  const c = camAt(t);
  tf($.world, 'translate(' + px(c.sx) + ',' + px(c.sy) + ') scale(' + r2(c.z) + ') translate(' + px(-c.fx) + ',' + px(-c.fy) + ')');
  renderBg(t);
  renderS1(t);
  renderS2(t);
  renderPhone(t);
  renderDesktop(t);
  renderSheetBeat(t);
  renderChat(t);
  renderOverlays(t);
  renderSubs(t);
}
function renderFrame(frameIndex) {
  const f = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameIndex)));
  lastFrame = f;
  renderTime(f / FPS);
  return f;
}

/* ---------------------------------------------------------------- init */
function initStage(stage) {
  stage.innerHTML = buildStage();
  collectRefs(stage);
  buildBackground();
  buildScene1();
  buildFlow();
}
function initMeasure() {
  measure();
  CAM = camKeys();
  computeTargetCross();
}
