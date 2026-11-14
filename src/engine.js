/* ==========================================================================
 * engine.js — deterministic timeline for the NADI Muallim film (V3; V7 = 137 s).
 * T below is the STORY clock of the V5 film (120 s). renderTime maps film time → story time through
 * data.js TIMEMAP: V7 plays the manual scene 1.44× slower, V6 holds the story at INSERT.at for the
 * 14-second WhatsApp segment drawn on top. Sound events are returned in film time.
 * renderFrame(frameIndex) is a pure function of the frame number
 * (t = frameIndex / 60): it recomputes every animated property from t, so
 * seeking to a frame and playing up to it give the same pixels. No CSS
 * transitions or animations, no Math.random().
 *
 * V3 follows the 19 supplied narration cues: dark illustrative map and the
 * supervisor's question (0–4 s), the manual process with the re-typing beat
 * finished by 11.85 s, the title impact at 13.35 s, the NADI locality card,
 * and the phone layer gated at 24.30 s (frame 1458). Devices use a shallow
 * 3D angle while moving and settle near frontal for reading.
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
/* V6: scales need more precision: at 0.001 steps a slow zoom moves in visible 1–2 px jumps away from its origin */
const r5 = v => Math.round(v * 100000) / 100000;

/* ==========================================================================
 * NAMED TIME EVENTS (seconds) — the V3 beat sheet. Visual states, taps,
 * typing, camera moves and sound cues all read from here. Word times come
 * from narration-bm.wav (energy segments): "borang kertas" ≈5.65, "fail"
 * ≈6.55, "dikira" ≈10.81, "ditaip semula" ≈11.42, "membuka" ends ≈24.16,
 * "status premis" ≈35.2, "saringan gejala" 36.06, "rujukan" ≈37.2.
 * ========================================================================== */
const T = {
  // 1 · 00:00–00:04 dark illustrative map, one pin pulse, the question (cue 1 at 0.92)
  a: { head: 0.15, nodes: [0.5, 1.9, 3.35, 4.8], arrows: [[1.2, 1.7], [2.65, 3.15], [4.1, 4.6]], ring: [0.75, 1.9], bars: [2.05, 2.9], stamp: 3.65, houses: [5.15, 5.95], out: [6.15, 6.6], pulse: [0.8, 2.3] },
  // 2 · 00:04–00:09.2 form (≈5.65) then file (≈6.55)
  b: { paper2: 6.5, paper: 6.65, file: 8.55, focusPaper: 6.95, focusFile: 8.9, write: [6.95, 9.0], camF: [6.75, 7.45, 8.45, 9.05] },
  // 3 · 00:09.2–00:13.2 tally on "dikira", laptop cell on "ditaip semula" (typing done by 11.85)
  c: { tally: 9.2, tallyFocus: 10.55, tallyDraw: [9.7, 10.95], laptop: 10.7, laptopFocus: 11.15, push: [11.05, 11.5], typing: [11.45, 11.85], done: 11.85, clear: [12.85, 13.3], riser: [9.9, 13.35] },
  // 4 · 00:13.2–00:16.8 title, impact 13.35, settled by 13.8, held to the dashboard cut
  d: { impact: 13.35, settle: 13.8, out: [16.55, 16.85] },
  // 5 · 00:16.8–00:24.3 NADI locality card; prototype action, activated 24.10
  e: { in: [16.75, 17.1], open: [21.3, 21.75], cursor: [22.95, 23.85], click: 24.1, out: [24.16, 24.34] },
  // 6 · 00:24.3–00:33 phone gate 24.30 (frame 1458), settled 25.6, "Cukup satu telefon"
  f: { gate: 24.3, rise: [24.3, 25.6], splash: [24.3, 24.4, 24.95, 25.35], one: [25.75, 26.15, 32.45, 32.85], team2: [28.0, 28.4, 32.45, 32.85], tapTeam: 28.6, pickTeam: 29.2, tapAddr: 29.75, type: [29.85, 30.95], front: [32.45, 33.35] },
  // 7 · 00:33–00:49 the record (cue 7 33.92–38.95, cue 8 40.73–44.02), Bahagian C in the pause
  // V5: one step at a time, evenly over 33–49 s (status → occupants → symptoms and referral → Bahagian C → action → save)
  g: { tapStatus: 34.3, hlStatus: [34.4, 35.7], hlOcc: [35.8, 38.0], occ: [36.0, 36.45, 36.9, 37.35], toB: [38.2, 38.8], toggle: 39.3, chips: [40.0, 40.7], hlSymp: 41.0, hlRef: 41.9,
       toC: [43.2, 43.8], cb0: 44.3, cb1: 44.9, hlRis: 45.5, hlAct: 46.3, hlSave: 47.9, rec: [33.4, 37.6, 42.1, 45.7, 46.9], recWin: [32.9, 33.3, 54.75, 55.05] },
  // 8 · 00:49–00:55 save near the 49.32 cue; "Rekod disimpan" ≥ 4 s; count updates on "sistem mengira…"
  h: { save: 49.42, saved: 49.55, count: 51.3, pull: [49.95, 50.75], savedWin: [49.6, 49.9, 54.75, 55.05] },
  // 9 · 00:55–01:02 phone → Apps Script → Sheets, one way, then hold
  i: { move: [54.85, 55.75], actorsIn: [55.4, 55.85], dots1: [55.9, 56.75], dots2: [56.75, 57.6], write: 57.45, synced: 57.7, line: [55.6, 56.0, 61.5, 61.9], out: [61.45, 62.0] },
  // 10 · 01:02–01:18 phone + monitor reveal, move complete by 64.5, coverage held past 74.86
  // V6: the dashboard tab is tapped at 60.95 and the screen slides (61.1–61.5) while the phone is still;
  //     the reveal is then one camera-fixed move (no zoom jump at 62.0)
  // V7: during the hold the six team bars rise against the KKM line (74.2–76.4) and the pill catches a light (76.6)
  j: { teams: [74.2, 74.6], tline: [74.45, 74.85], tbar: 74.7, shine: [76.55, 77.15], tapDash: 60.95, slide: [61.1, 61.5], reveal: [62.0, 64.5], view: 61.3, countLoc: [62.7, 63.9], mark: [63.9, 64.4], countVis: [64.7, 69.0], countRest: [64.7, 68.6], zoom: [69.6, 70.8], res: [70.6, 71.0, 77.5, 77.85], capai: 71.25, formula: 71.6 },
  // 11 · 01:18–01:25 Bahagian D (cue 13 78.92–81.25) and a static share-ready summary
  k: { cut: 78.05, tapName: 78.45, type: [78.55, 79.3], tapVerify: 80.35, ver: [80.5, 80.75, 84.55, 84.85], summary: [81.4, 81.8, 84.55, 84.85] },
  // 12 · 01:25–01:45 NADI follow-up (cue 14 85.92, cue 15 90.42, cue 16 99.01)
  // V5: a step flow — question → 110 → 92 / 12 / 6 → the 6 and the 12 on the map → plan the follow-up → route and re-check
  l: { in: [84.85, 85.25], expand: [85.15, 85.95], left: [85.2, 85.6, 104.6, 104.95], q: 85.3, n110: 86.0, branch: [86.5, 87.0], n92: 86.85, n12: 87.05, n6: 87.25, red: [87.6, 89.4],
       hl12: [90.3, 92.8], amber: [90.5, 92.3], cursor: [93.2, 94.9], click: 95.2, planned: [95.35, 95.65], plan: [95.3, 95.6], marks: 95.7, route: [96.0, 97.4], check: [97.9, 98.2],
       rings: [98.2, 98.9], recheck: 98.4, dot: [100.6, 104.0], push: [99.5, 104.6], out: [104.6, 105.0] },
  // 13 · 01:45–01:52.35 benefit cards (in over ~1 s, full row held ≥ 5 s)
  m: { in: 105.2, out: [111.95, 112.35] },
  // 14 · 01:52.35–02:00 closing lockup, fully in by 113.2, held to the last frame
  n: { title: 112.4 }
};

/* ---------------------------------------------------------------- layout constants (world px) */
const PH = { x: 1330, y: 540, s: 0.95 };      // phone (close-ups) centre and scale
const NW = { x: 960, y: 540, s: 1.36 };       // NADI browser window centre and scale
const NADI_W = 1280, NADI_H = 756;            // window incl. 36 px chrome bar
const PH_SCREEN_W = 390, PH_SCREEN_H = 842;
const DK_S = 0.86545;                         // desktop app scale inside the monitor
const KET = { x: 830, y: 222 };               // Kg. Ketoyong centroid on the NADI map (map px)
const OPIN = { x: 1010, y: 560 };             // Kg. Ketoyong pin on the opening map (stage px)
const FOLLOW_POS = [[30, 50], [75, 46], [120, 52], [160, 44], [200, 50], [345, 47]]
  .map(([a, r]) => ({ x: KET.x + Math.cos(a * Math.PI / 180) * r, y: KET.y + Math.sin(a * Math.PI / 180) * r }));
/* V5: the 12 locked / empty premises around Kg. Ketoyong (illustrative positions) and the follow-up route through the 6 */
const LOCKED_POS = (() => {
  const r = rng('berkunci-kosong-12'), out = [];
  for (let guard = 0; out.length < 12 && guard < 2000; guard++) {
    const a = r() * Math.PI * 2, rad = 24 + r() * 36, p = { x: KET.x + Math.cos(a) * rad * 1.2, y: KET.y + Math.sin(a) * rad * 0.9 };
    if (p.y < KET.y - 22 && Math.abs(p.x - KET.x) < 60) continue;            // keep the locality label clear
    if (Math.hypot(p.x - KET.x, p.y - KET.y) < 22) continue;                  // and the case marker
    if (FOLLOW_POS.concat(out).some(q => Math.hypot(q.x - p.x, q.y - p.y) < 16)) continue;
    out.push(p);
  }
  return out;
})();
const ROUTE = (() => { const segs = []; let tot = 0; for (let i = 1; i < FOLLOW_POS.length; i++) { const a = FOLLOW_POS[i - 1], b = FOLLOW_POS[i], l = Math.hypot(b.x - a.x, b.y - a.y); segs.push({ a, b, l, s: tot }); tot += l; } return { segs, tot }; })();
function routePoint(p) {
  const d = p * ROUTE.tot;
  for (const g of ROUTE.segs) if (d <= g.s + g.l + 1e-9) { const k = g.l ? (d - g.s) / g.l : 0; return { x: lerp(g.a.x, g.b.x, k), y: lerp(g.a.y, g.b.y, k) }; }
  return FOLLOW_POS[FOLLOW_POS.length - 1];
}
/* device placements in the joint phone + monitor composition (01:02–01:18) and the Sheets shot */
const J_PHONE = { x: 405, y: 668, s: 0.76, rx: 2, ry: 12 };
const J_FRONT = { x: J_PHONE.x, y: J_PHONE.y, s: J_PHONE.s, rx: 0, ry: 0 };   // V4: turned to face the camera for the coverage close-up
const J_DESK = { x: 1190, y: 715, s: 0.82, rx: 2, ry: -9 };
const I_PHONE = { x: 235, y: 590, s: 0.68, rx: 2, ry: 14 };
const I_GAS = { x: 645, y: 470, s: 0.8 };
const I_SHEET = { x: 1365, y: 545, s: 0.98, ry: -6 };

/* ---------------------------------------------------------------- one simulated dataset */
const TEAMS_BEFORE = (() => { const o = {}; for (let k = 1; k <= 6; k++) o[k] = Object.assign({}, TEAMS[k]); o[1] = Object.assign({}, TEAM1_BEFORE); return o; })();
const TOTALS_BEFORE = computeTotals(TEAMS_BEFORE);
/* the followed record joins Pasukan 1 when it is saved (source: locality +1, visited +1) */
function teamsAt(t) { return t < T.h.saved ? TEAMS_BEFORE : TEAMS; }
/* V4 · 01:02–01:18 the dashboards count up from zero, as in the 90-second film: premises in the locality
 * first, then visited premises and the other results. The badge flips when coverage first reaches the
 * in-app 80% target (T_TARGET_CROSS). */
const ZERO_TEAMS = (() => { const o = {}; for (let k = 1; k <= 6; k++) { o[k] = {}; for (const key in TEAMS[k]) o[k][key] = typeof TEAMS[k][key] === 'number' ? 0 : TEAMS[k][key]; } return o; })();
function teamsDash(t) {
  const J = T.j;
  if (t >= J.countVis[1] && t >= J.countRest[1]) return TEAMS;
  if (t < J.countLoc[0]) return ZERO_TEAMS;
  const pL = seg(t, J.countLoc[0], J.countLoc[1], E.outCubic), pV = seg(t, J.countVis[0], J.countVis[1], E.inOutSine), pR = seg(t, J.countRest[0], J.countRest[1], E.outCubic);
  const o = {};
  for (let k = 1; k <= 6; k++) {
    const d = TEAMS[k], r = {};
    for (const key in d) r[key] = typeof d[key] === 'number' ? Math.round(d[key] * (key === 'locality' ? pL : key === 'visited' ? pV : pR)) : d[key];
    o[k] = r;
  }
  return o;
}
const T_TARGET_CROSS = (() => {
  for (let f = Math.floor(T.j.countVis[0] * FPS); f < TOTAL_FRAMES; f++) { const tot = computeTotals(teamsDash(f / FPS)); if (tot.locality > 0 && tot.pct >= TARGET_PCT) return f / FPS; }
  return T.j.countVis[1];
})();

/* ---------------------------------------------------------------- interactions */
const TAPS = [
  { t: T.f.tapTeam, ref: 'ph.teamSel' }, { t: T.f.pickTeam, ref: 'ph.dd1' }, { t: T.f.tapAddr, ref: 'ph.addrBox', ax: 0.3 },
  { t: T.g.tapStatus, ref: 'ph.pill1' }, ...T.g.occ.map(t => ({ t, ref: 'ph.occPlus' })),
  { t: T.g.toggle, ref: 'ph.toggle' }, { t: T.g.chips[0], ref: 'ph.chip0' }, { t: T.g.chips[1], ref: 'ph.chip1' },
  { t: T.g.cb0, ref: 'ph.cb0' }, { t: T.g.cb1, ref: 'ph.cb1' },
  { t: T.h.save, ref: 'ph.saveBtn' }, { t: T.j.tapDash, ref: 'ph.nDash' },
  { t: T.k.tapName, ref: 'ph.vNameBox', ax: 0.3 }, { t: T.k.tapVerify, ref: 'ph.vBtn' }
];
const TYPING = [
  { t0: T.f.type[0], t1: T.f.type[1], text: HOUSE_DEMO.address },
  { t0: T.k.type[0], t1: T.k.type[1], text: VERIFICATION.officerName }
];
function typed(t, k) { const ty = TYPING[k]; const n = Math.floor(seg(t, ty.t0, ty.t1, E.lin) * ty.text.length + 1e-6); return ty.text.slice(0, n); }
/* NADI mouse: open the ACD operation (segment 5), take the follow-up decision (segment 12) */
const NCUR = [
  { from: [560, 430], t0: T.e.cursor[0], t1: T.e.cursor[1], click: T.e.click, out: [24.18, 24.34], target: t => btnMap('na.openBtn', t, 0.5) },
  { from: [690, 330], t0: T.l.cursor[0], t1: T.l.cursor[1], click: T.l.click, out: [95.7, 96.0], target: t => btnMap('na.decBtn', t, 0.42) }
];
/* system label, top left */
const SYS = [
  [0.25, 6.2, 'Aliran wabak denggi', 'ilustrasi'],
  [6.5, 12.9, 'Proses manual', 'ilustrasi situasi semasa'],
  [17.3, 24.25, 'NADI Muallim', 'Kad lokaliti · imej udara'],   // V9 (draft 3): the Google Earth view (src/kampung3d.js)
  [24.7, 54.8, 'e-ACD Denggi', 'Telefon petugas'],
  [55.7, 61.9, 'e-ACD → Google Sheets', 'Simulasi penyelarasan'],
  [78.3, 84.8, 'e-ACD Denggi', 'Bahagian D · pengesahan'],
  [85.3, 104.9, 'NADI Muallim', 'Prototaip integrasi e-ACD · peta ilustrasi']
];

/* ---------------------------------------------------------------- sound event table (shared with audio.js) */
function buildSoundEvents() {
  const ev = [];
  const add = (t, k, o) => ev.push(Object.assign({ t, k }, o || {}));
  // 1–4 · opening: accents on the pin, form, file, tally, completed entry and the title impact
  // 1 · opening flow: notification → rise in cases → outbreak declared → ACD
  T.a.nodes.forEach((t0, i) => add(t0, 'pop', { f: [620, 700, 560, 760][i] }));
  T.a.arrows.forEach(([a0]) => add(a0, 'whooshSoft'));
  add(T.a.ring[0] + 0.05, 'blip', { f: 1800 });
  for (let i = 0; i < 5; i++) add(T.a.bars[0] + i * 0.12, 'blip', { f: 900 + i * 140, soft: 1 });
  add(T.a.stamp, 'hit', { soft: 1 });
  for (let i = 0; i < 4; i++) add(T.a.houses[0] + i * 0.2, 'pop', { soft: 1, f: 880 + i * 60 });
  add(T.b.paper2, 'paper'); add(T.b.file, 'paper', { soft: 1 });
  add(T.b.paper, 'paper', { soft: 1 });
  for (const w of MAN_WRITE) if (w.snd) add(w.t0, 'pencil');
  add(T.c.tally, 'whooshSoft'); for (let i = 0; i < 14; i++) add(T.c.tallyDraw[0] + i * ((T.c.tallyDraw[1] - T.c.tallyDraw[0]) / 14), 'pencil');
  add(T.c.laptop, 'whooshSoft');
  add(T.c.done, 'confirm', { soft: 1 });
  add(T.c.riser[0], 'riser', { d: T.c.riser[1] - T.c.riser[0] }); add(T.d.impact, 'impact'); add(T.d.impact + 0.25, 'shimmer');
  // 5 · NADI card
  add(T.e.in[0] + 0.1, 'whooshSoft'); add(T.e.open[0] + 0.1, 'pop', { soft: 1 }); add(T.e.click, 'click');
  // 6–8 · phone (the reveal sound is gated with the phone layer: never before 24.30)
  add(T.f.gate + 0.02, 'whoosh'); add(T.f.one[0] + 0.15, 'swell');
  T.g.rec.forEach(t => add(t, 'pop', { soft: 1, f: 620 }));
  add(T.h.saved, 'confirm'); add(T.h.count, 'blip', { f: 1500 }); add(T.h.pull[0] + 0.05, 'whooshSoft');
  // 9 · one-way write to Sheets
  add(T.i.move[0] + 0.1, 'whooshSoft');
  for (let i = 0; i < 5; i++) add(T.i.dots1[0] + i * 0.11, 'blip', { f: 1500 + i * 120 });
  for (let i = 0; i < 5; i++) add(T.i.dots2[0] + i * 0.11, 'blip', { f: 2000 + i * 90, soft: 1 });
  add(T.i.synced, 'confirm');
  // 10 · phone + monitor reveal
  add(T.j.slide[0], 'slide'); add(T.j.reveal[0] + 0.35, 'whoosh');   // V6: in-app slide; whoosh as the monitor enters add(T.j.countLoc[0], 'blip', { f: 1400, soft: 1 }); add(T.j.countVis[0], 'dataRise', { d: T.j.countVis[1] - T.j.countVis[0] });
  add(T_TARGET_CROSS, 'success'); add(T.j.zoom[0], 'whooshSoft'); add(T.j.res[0], 'hit', { soft: 1 }); add(T.j.capai, 'pop', { f: 760 });
  // 11 · Bahagian D
  add(T.k.cut, 'whooshSoft'); add(T.k.tapVerify + 0.12, 'confirm'); add(T.k.summary[0], 'pop', { soft: 1 });
  // 12 · NADI follow-up
  add(T.l.in[0] + 0.1, 'whoosh'); add(T.l.expand[0], 'pop', { soft: 1 }); add(T.l.n110, 'pop', { f: 600 });
  [T.l.n92, T.l.n12, T.l.n6].forEach((t0, i) => add(t0, 'pop', { soft: 1, f: [700, 520, 460][i] }));
  for (let i = 0; i < 6; i++) add(T.l.red[0] + i * 0.3, 'blip', { f: 1300 + i * 70, soft: 1 });
  for (let i = 0; i < 12; i++) add(T.l.amber[0] + i * 0.15, 'blip', { f: 900 + (i % 4) * 60, soft: 1 });
  add(T.l.click, 'click'); add(T.l.planned[0], 'confirm');
  for (let i = 0; i < 6; i++) add(T.l.marks + i * 0.12, 'blip', { f: 1500 + i * 90, soft: 1 });
  add(T.l.route[0], 'whooshSoft'); add(T.l.check[1], 'pop', { soft: 1, f: 480 });
  // 13–14 · benefit cards, closing
  for (let i = 0; i < 4; i++) add(T.m.in + i * 0.22, 'pop', { f: 660 + i * 110 });
  add(T.n.title + 0.05, 'sting');
  // phone taps + typing
  for (const tp of TAPS) add(tp.t, 'tap');
  for (const ty of TYPING) for (let i = 0; i < ty.text.length; i++) add(ty.t0 + (i + 0.5) * ((ty.t1 - ty.t0) / ty.text.length), 'key');
  for (let i = 0; i < 2; i++) add(T.c.typing[0] + 0.08 + i * 0.18, 'key');
  // V6/V7: story events → film time (a duration is mapped too, so the riser still ends on the title
  // impact in the slower manual scene), then the WhatsApp segment (film time)
  for (const e of ev) { if (e.d) e.d = filmTime(e.t + e.d) - filmTime(e.t); e.t = filmTime(e.t); }
  const W = u => INSERT.atF + u;
  add(W(0.05), 'whooshSoft'); add(W(WA.tapCopy + 0.15), 'confirm', { soft: 1 }); add(W(WA.sw[0] + 0.05), 'slide');
  add(W(WA.menu[0]), 'pop', { soft: 1, f: 900 }); add(W(WA.paste[0]), 'pop', { soft: 1, f: 680 }); add(W(WA.send[0] + 0.02), 'slide');
  add(W(WA.bubble[0] + 0.1), 'pop', { f: 760 }); add(W(WA.zoomIn[0] + 0.1), 'whooshSoft'); add(W(WA.hl[0]), 'blip', { f: 1500, soft: 1 });
  add(W(WA.read), 'blip', { f: 1900, soft: 1 }); add(W(WA.react), 'pop', { f: 820 }); add(W(WA.zoomOut[0] + 0.1), 'whooshSoft');
  for (const tp of WA_TAPS) add(W(tp.t), 'tap');
  ev.sort((a, b) => a.t - b.t);
  return ev;
}

/* ==========================================================================
 * MEASUREMENT (once, after fonts load). Offsets ignore transforms.
 * ========================================================================== */
const M = {};
function offsetWithin(el, anc) {
  let x = 0, y = 0, e = el;
  while (e && e !== anc) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
const PH_VIEWS = { dash: 'ph.vDash', borang: 'ph.vBorang', pasukan: 'ph.vPasukan' };
const PH_NAV = { dash: 'ph.nDash', borang: 'ph.nBorang', pasukan: 'ph.nPasukan' };
const PH_REFS = {
  dash: ['ph.hero', 'ph.table', 'ph.tableHead'],
  borang: ['ph.teamWrap', 'ph.teamSel', 'ph.dd1', 'ph.addrBox', 'ph.pills', 'ph.pill1', 'ph.occWrap', 'ph.occPlus', 'ph.secB', 'ph.toggle', 'ph.chip0', 'ph.chip1',
    'ph.sympWrap', 'ph.refWrap', 'ph.secC', 'ph.cRow0', 'ph.cRow1', 'ph.cRow2', 'ph.cb0', 'ph.cb1', 'ph.action', 'ph.saveBtn', 'ph.lamp', 'ph.lampRow'],
  pasukan: ['ph.secD', 'ph.vNameBox', 'ph.vBtn']
};
const VIEW_OF = {};
for (const v in PH_REFS) for (const r of PH_REFS[v]) VIEW_OF[r] = v;
const BELOW_SYM = new Set(['ph.secC', 'ph.cRow0', 'ph.cRow1', 'ph.cRow2', 'ph.cb0', 'ph.cb1', 'ph.action', 'ph.saveBtn', 'ph.lamp', 'ph.lampRow']);
const SCREEN_REFS = ['ph.nDash', 'ph.nBorang', 'ph.nPasukan', 'ph.nPetugas'];

function measure() {
  Object.values(PH_VIEWS).forEach(v => { $[v].style.display = 'block'; });
  $['ph.symBox'].style.height = 'auto';
  const screen = $['ph.screen'], scroll = $['ph.scroll'];
  M.phViewportTop = offsetWithin($['ph.viewport'], screen).y;
  M.phViewportH = $['ph.viewport'].offsetHeight;
  M.symH = $['ph.symInner'].offsetHeight;
  M.ph = {};
  for (const v in PH_REFS) for (const r of PH_REFS[v]) M.ph[r] = offsetWithin($[r], scroll);
  for (const r of SCREEN_REFS) M.ph[r] = offsetWithin($[r], screen);
  M.viewTop = {}; M.phContentH = {};
  for (const v in PH_VIEWS) { M.viewTop[v] = $[PH_VIEWS[v]].offsetTop; M.phContentH[v] = $[PH_VIEWS[v]].offsetHeight; }
  Object.values(PH_VIEWS).forEach(v => { $[v].style.display = ''; });
  $['ph.symBox'].style.height = '';
  /* desktop */
  M.dkViewportTop = offsetWithin($['dk.viewport'], $['dk.app']).y;
  M.dk = {}; for (const r of ['dk.hero', 'dk.heroRow', 'dk.charts']) M.dk[r] = offsetWithin($[r], $['dk.scroll']);
  M.bar = $['dk.barSvg'].dataset.plot.split(',').map(Number);
  M.donut = $['dk.donutSvg'].dataset.geo.split(',').map(Number);
  /* NADI card: action block and the integration summary, each measured open */
  M.na = {};
  M.na.mapTop = offsetWithin($['na.map'], $.nadi).y;
  M.na.card0 = offsetWithin($['na.card'], $['na.map']);
  $['na.open'].style.height = 'auto';
  M.na.openH = $['na.open'].offsetHeight;
  M.na.openBtn = offsetWithin($['na.openBtn'], $['na.map']);
  $['na.open'].style.height = '';
  $['na.proto'].style.height = 'auto';
  $['na.plannedWrap'].style.height = '0px';
  M.na.protoBaseH = $['na.proto'].offsetHeight;
  $['na.plannedWrap'].style.height = 'auto';
  M.na.plannedH = $['na.plannedWrap'].offsetHeight;
  M.na.protoTop = offsetWithin($['na.proto'], $['na.cardScroll']).y;
  M.na.protoFullH = parseFloat(getComputedStyle($['na.proto']).height);   // V9: exact used height (fractional, no transforms)
  M.na.decBtn = offsetWithin($['na.decBtn'], $['na.map']);
  $['na.proto'].style.height = ''; $['na.plannedWrap'].style.height = '';
  /* sheet: the C8:H13 selection */
  const a = offsetWithin($['sh.c0_1'], $['sh.grid']), b = offsetWithin($['sh.c5_6'], $['sh.grid']);
  M.shSel = { x: a.x, y: a.y, w: b.x + b.w - a.x, h: b.y + b.h - a.y };
  M.gas = { w: $.gas.offsetWidth, h: $.gas.offsetHeight };
  M.sheet = { w: $.sheet.offsetWidth, h: $.sheet.offsetHeight };
  /* overlays */
  M.recH = $['ov.rec'].offsetHeight;
}

/* ---------------------------------------------------------------- phone: views, scroll, coordinates */
function phView(t) {
  if (t < T.j.view) return 'borang';
  if (t < T.k.cut) return 'dash';
  return 'pasukan';
}
function symOpen(t) { return t >= T.g.toggle && t < T.h.saved; }
function symH(t) {
  const open = seg(t, T.g.toggle + 0.02, T.g.toggle + 0.4, E.outCubic);
  const close = seg(t, T.h.saved, T.h.saved + 0.25, E.inOutCubic);
  return M.symH * Math.min(open, 1 - close);
}
function phRefY(ref, t) {
  const m = M.ph[ref], view = VIEW_OF[ref];
  let y = m.y - M.viewTop[view];
  if (BELOW_SYM.has(ref)) y += symH(t) - M.symH;
  return { x: m.x, y, w: m.w, h: m.h, view };
}
function clampScroll(v, view, closed) { const max = Math.max(0, M.phContentH[view] - (closed ? M.symH : 0) - M.phViewportH); return clamp(v, 0, max); }
function phVisRange(F) {
  const toScreen = sy => 421 + ((F.fy + (sy - F.sy) / F.z) - PH.y) / PH.s;
  return [toScreen(120), toScreen(860)];
}
const SC = {};
function computeScrollTargets() {
  const yIn = r => M.ph[r].y - M.viewTop[VIEW_OF[r]];
  const off3 = phVisRange(CAM_F.F3)[0] - M.phViewportTop;
  SC.A = clampScroll(yIn('ph.teamWrap') - off3 - 12, 'borang');
  SC.B = clampScroll(yIn('ph.secB') - off3 - 10, 'borang');
  SC.C = clampScroll(yIn('ph.secC') - off3 - 10, 'borang');
  SC.list = clampScroll(yIn('ph.lampRow') - M.symH - (300 - M.phViewportTop), 'borang', true);
  SC.D = clampScroll(yIn('ph.secD') - (phVisRange(CAM_F.F5d)[0] - M.phViewportTop) - 10, 'pasukan');
}
function phScroll(t) { return phScrollFor(phView(t), t); }
function phScrollFor(v, t) {
  if (v === 'borang') {
    if (t >= T.h.saved) {
      const keep = SC.C - (M.symH - symH(t)); // the symptom box collapses above the save button; hold, then scroll to Lampiran 1
      return lerp(keep, SC.list, seg(t, T.h.pull[0], T.h.pull[1]));
    }
    return kf(t, [[T.f.front[0], 0], [T.f.front[1], SC.A], [T.g.toB[0], SC.A], [T.g.toB[1], SC.B], [T.g.toC[0], SC.B], [T.g.toC[1], SC.C]]);
  }
  if (v === 'pasukan') return SC.D;
  return 0;
}
function phRefScreen(ref, t, ax, ay) {
  ax = ax === undefined ? 0.5 : ax; ay = ay === undefined ? 0.5 : ay;
  if (!VIEW_OF[ref]) { const m = M.ph[ref]; return { x: m.x + m.w * ax, y: m.y + m.h * ay }; }
  const r = phRefY(ref, t);
  return { x: r.x + r.w * ax, y: M.phViewportTop + r.y - phScroll(t) + r.h * ay };
}

/* ---------------------------------------------------------------- layers + cameras */
/* camera: world point (fx, fy) appears at stage point (sx, sy) with zoom z */
const ID = { sx: 960, sy: 540, fx: 960, fy: 540, z: 1 };
const CAM_F = {};
const CAMS = {};
function phFrame(z, screenY, sy, sx) { return { sx, sy, fx: PH.x, fy: PH.y + (screenY - 421) * PH.s, z }; }
function nadiWorld(mx, my) { return { x: NW.x + (mx - NADI_W / 2) * NW.s, y: NW.y + (my + M.na.mapTop - NADI_H / 2) * NW.s }; }
function computeCameras() {
  CAM_F.F3 = phFrame(1.7, 380, 490, 1300);                           // record entry close-up (frontal)
  CAM_F.FO = { sx: 1360, sy: 500, fx: PH.x, fy: PH.y, z: 1.0 };      // whole phone after save
  CAM_F.F5d = phFrame(1.55, 461, 490, 1300);                         // Bahagian D
  // V6: the joint phone + monitor reveal keeps the camera still (the V5 pullback started with a one-frame
  // zoom jump at 62.0); only the devices move, with one shared easing
  // V4: after the count-up, push in on the phone's coverage card (90-second film); the monitor stays as a dim backdrop
  const hero = M.ph['ph.hero'], hx = hero.x + hero.w / 2, hy = M.phViewportTop + (hero.y - M.viewTop.dash) + hero.h / 2;
  CAM_F.ZK = { sx: 700, sy: 500, fx: J_FRONT.x + (hx - PH_SCREEN_W / 2) * J_FRONT.s, fy: J_FRONT.y + (hy - PH_SCREEN_H / 2) * J_FRONT.s, z: 690 / (hero.w * J_FRONT.s) };
  CAM_F.ZD = { sx: 1430, sy: 560, fx: J_DESK.x + 60, fy: J_DESK.y + 40, z: 1.45 };
  // V7: the coverage hold (70.8–78.05) is never a still frame: a slow 6% push on the card, the monitor drifts behind it
  CAM_F.ZK2 = Object.assign({}, CAM_F.ZK, { z: CAM_F.ZK.z * 1.06, fy: CAM_F.ZK.fy + 10 });
  CAM_F.ZD2 = Object.assign({}, CAM_F.ZD, { z: CAM_F.ZD.z * 1.04, fx: CAM_F.ZD.fx + 40 });
  CAMS.phone = [[0, ID], [T.f.front[0], ID], [T.f.front[1], CAM_F.F3], [T.h.pull[0], CAM_F.F3], [T.h.pull[1], CAM_F.FO],
    [T.i.move[0], CAM_F.FO], [T.i.move[1], ID],
    [T.j.zoom[0], ID], [T.j.zoom[1], CAM_F.ZK, E.inOutCubic], [T.k.cut - 0.01, CAM_F.ZK2, E.inOutSine], [T.k.cut, CAM_F.F5d, E.lin]];
  CAMS.desk = [[0, ID], [T.j.zoom[0], ID], [T.j.zoom[1], CAM_F.ZD, E.inOutCubic], [T.k.cut, CAM_F.ZD2, E.inOutSine]];
  // NADI: a clean crop on the locality card (little browser chrome, light GIS detail); same frame in both NADI shots
  const c0 = nadiWorld(M.na.card0.x, M.na.card0.y), c1 = nadiWorld(M.na.card0.x + M.na.card0.w, M.na.card0.y);
  CAM_F.FC = { sx: 1360, sy: 470, fx: (c0.x + c1.x) / 2, fy: c0.y + (470 - 70) / 1.34, z: 1.34 };
  /* V9: no slow push at the end of the follow-up scene (was 5% over T.l.push). The push moved the panel's text by
   * sub-pixel steps, so in the MP4 lines of text jumped one pixel on different frames: a shimmer on the
   * "Ringkasan e-ACD" panel exactly while it should be read. The view now holds still; the team dot keeps moving. */
  CAMS.nadi = [[0, CAM_F.FC]];
}
function camAt(layer, t) { return kf(t, CAMS[layer]); }
function camLayer(el, c) { tf(el, 'translate(' + px(c.sx) + ',' + px(c.sy) + ') scale(' + r5(c.z) + ') translate(' + px(-c.fx) + ',' + px(-c.fy) + ')'); }
/* Layer visibility. The phone layer — frame, shadow, app, badges and tap marker — does not exist before 00:24.30. */
function layerOps(t) {
  const d = (a, b) => seg(t, a, b, E.inOutSine);
  return {
    open: 0,   // V5: the dark map opening is replaced by the flow chart
    flow: t < T.a.out[1] + 0.02 ? d(0, 0.35) * (1 - d(T.a.out[0], T.a.out[1])) : 0,
    // V9 (draft 3): dissolve on the film clock (the story clock changes speed at the impact), finishing on the beat
    man: d(T.b.paper2 - 0.15, T.b.paper2 + 0.1) * (1 - seg(filmTime(t), filmTime(T.d.impact) - 0.45, filmTime(T.d.impact), E.inOutSine)),
    // V9 (draft 3): the map starts 0.2 s earlier, so it crossfades with the title instead of following a dip to black
    nadi: t < 60 ? d(T.e.in[0] - 0.2, T.e.in[1]) * (1 - d(T.e.out[0], T.e.out[1])) : d(T.l.in[0], T.l.in[1]) * (1 - d(T.l.out[0], T.l.out[1])),
    phone: t < T.f.gate ? 0 : t < 70 ? seg(t, T.f.gate, T.f.gate + 0.25, E.inOutSine) : (t < 85.2 ? 1 - d(84.6, 84.95) : 0),
    sync: d(T.i.actorsIn[0], T.i.actorsIn[1]) * (1 - d(T.i.out[0], T.i.out[1])),
    desk: t < T.k.cut ? d(T.j.reveal[0], T.j.reveal[0] + 0.35) * (1 - 0.68 * d(T.j.zoom[0], T.j.zoom[1])) : 0
  };
}
/* device placements (x, y = centre in world px; s = scale; rx/ry = degrees) */
const PHONE_KEYS = [
  [T.f.gate, { x: 1560, y: 640, s: 0.9, rx: 6, ry: -26 }],
  [T.f.rise[1], { x: 1330, y: 545, s: 0.95, rx: 2, ry: -12 }, E.springSoft],
  [T.f.front[0], { x: 1330, y: 545, s: 0.95, rx: 2, ry: -12 }],
  [T.f.front[1], { x: PH.x, y: PH.y, s: PH.s, rx: 0, ry: 0 }],
  [T.i.move[0], { x: PH.x, y: PH.y, s: PH.s, rx: 0, ry: 0 }],
  [T.i.move[1], I_PHONE, E.inOutCubic],
  [T.j.reveal[0], I_PHONE],
  [T.j.reveal[1], J_PHONE, E.inOutSine],
  [T.j.zoom[0], J_PHONE],
  [T.j.zoom[1], J_FRONT, E.inOutCubic],
  [T.k.cut - 0.01, J_FRONT],
  [T.k.cut, { x: PH.x, y: PH.y, s: PH.s, rx: 0, ry: 0 }, E.lin]
];
const DESK_KEYS = [
  [T.j.reveal[0], { x: 1205, y: 1410, s: J_DESK.s, rx: 6, ry: -14 }],
  [T.j.reveal[1], J_DESK, E.inOutSine]
];
function placeDevice(el, st) {
  const d3 = Math.abs(st.rx) > 0.05 || Math.abs(st.ry) > 0.05;
  cls(el, 'd3', d3);
  tf(el, 'translate(' + px(st.x) + ',' + px(st.y) + ') translate(-50%,-50%)' +
    (d3 ? ' perspective(2667px) rotateX(' + r2(st.rx) + 'deg) rotateY(' + r2(st.ry) + 'deg)' : '') + ' scale(' + r5(st.s) + ')');
}
/* stage position of a phone-screen point for a phone placed by world keys under a camera */
function phoneScreenToStage(t, sx, sy) {
  const p = kf(t, PHONE_KEYS), c = camAt('phone', t);
  const wx = p.x + (sx - PH_SCREEN_W / 2) * p.s, wy = p.y + (sy - PH_SCREEN_H / 2) * p.s;
  return { x: c.sx + (wx - c.fx) * c.z, y: c.sy + (wy - c.fy) * c.z };
}

/* ---------------------------------------------------------------- touch indicator (phone) */
function touchState(taps, t, posFn) {
  // finger visible from 0.5 s before a tap to 0.4 s after; glides between close taps
  let cur = -1;
  for (let i = 0; i < taps.length; i++) { if (taps[i].t - 0.5 <= t) cur = i; }
  if (cur < 0) return null;
  const tp = taps[cur], prev = cur > 0 ? taps[cur - 1] : null, next = cur < taps.length - 1 ? taps[cur + 1] : null;
  const hold = tp.hold || 0;   // V6: long press (seconds the finger stays down)
  const glide = prev && tp.t - prev.t < 0.95 && tp.layer === prev.layer;
  let o, x, y;
  const target = posFn(tp, t);
  if (glide) {
    const from = posFn(prev, t), p = seg(t, prev.t + 0.1 + (prev.hold || 0), tp.t - 0.06, E.inOutCubic);
    x = lerp(from.x, target.x, p); y = lerp(from.y, target.y, p); o = 1;
  } else {
    x = target.x; y = target.y + 26 * (1 - seg(t, tp.t - 0.5, tp.t - 0.12, E.outCubic));
    o = seg(t, tp.t - 0.5, tp.t - 0.25, E.outCubic);
  }
  const willGlide = next && next.t - tp.t < 0.95 && next.layer === tp.layer;
  if (!willGlide) o = Math.min(o, 1 - seg(t, tp.t + 0.12 + hold, tp.t + 0.4 + hold, E.inCubic));
  const press = 1 - 0.14 * win(t, tp.t - 0.07, tp.t, tp.t + 0.02 + hold, tp.t + 0.12 + hold, E.outQuad, E.inQuad);
  const rp = seg(t, tp.t, tp.t + 0.5, E.outCubic);
  const ripple = t >= tp.t ? { s: lerp(0.5, 2.3, rp), o: 0.75 * (1 - rp) } : { s: 0.5, o: 0 };
  return { x, y, o, press, ripple };
}
function renderTouch(el, rip, st) {
  if (!st || st.o <= 0.002) { op(el, 0); op(rip, 0); return; }
  op(el, st.o);
  tf(el, 'translate(' + px(st.x) + ',' + px(st.y) + ') scale(' + r5(st.press) + ')');
  op(rip, st.ripple.o); tf(rip, 'scale(' + r5(st.ripple.s) + ')');
}


/* ==========================================================================
 * BUILDERS (seeded, run once)
 * ========================================================================== */
const MAP = {};
/* Illustrative district map in the OpenStreetMap palette — not real geography. V3 keeps
 * only Kg. Ketoyong on it (less GIS detail in the crop). */
function buildNadiMap() {
  const r = rng('peta-ilustrasi-nadi');
  const blob = (cx, cy, rx, ry, n, jit) => {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2, k = 1 + (r() - 0.5) * jit;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rx * k).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * k).toFixed(1);
    }
    return d + 'Z';
  };
  let g = '<defs><filter id="mkShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#0f172a" flood-opacity=".35"/></filter></defs>' +
    '<rect width="1280" height="556" fill="#f2efe9"/>';
  const land = [[140, 110, 150, 80, '#e3ebd0'], [380, 470, 170, 70, '#dcebc9'], [610, 70, 140, 60, '#d6e7c4'], [1060, 470, 180, 80, '#e3ebd0'],
    [250, 300, 90, 60, '#e9e4dc'], [KET.x, KET.y, 128, 86, '#ebe5dc'], [520, 250, 70, 50, '#e9e4dc'], [80, 520, 120, 50, '#cfe3bd'], [700, 520, 110, 45, '#cfe3bd']];
  for (const [x, y, rx, ry, c] of land) g += '<path d="' + blob(x, y, rx, ry, 18, 0.22) + '" fill="' + c + '"/>';
  g += '<path d="M-20 470 C 180 420, 330 520, 520 450 S 760 330, 930 360 S 1150 470, 1300 420" fill="none" stroke="#aad3df" stroke-width="17" stroke-linecap="round"/>';
  const roads = [
    ['M-20 150 C 160 170, 300 215, 420 205 S 640 150, 760 168 S 1060 250, 1300 250', '#c99a5b', '#fcd6a4', 11.5, 9],
    ['M620 580 C 660 470, 700 400, 760 330 S 850 250, 860 150 S 880 40, 900 -20', '#cbc3b4', '#ffffff', 8, 6],
    ['M-20 330 C 120 315, 220 290, 330 300 S 470 330, 560 318', '#cbc3b4', '#ffffff', 8, 6]
  ];
  for (const [d, c0, c1, w0, w1] of roads) g += '<path d="' + d + '" fill="none" stroke="' + c0 + '" stroke-width="' + w0 + '" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + c1 + '" stroke-width="' + w1 + '" stroke-linecap="round"/>';
  const lanes = ['M760 300 L 900 285', 'M770 250 L 720 190', 'M840 200 L 930 215', 'M790 270 L 800 330', 'M860 260 L 905 300', 'M700 230 L 760 238'];
  for (const d of lanes) g += '<path d="' + d + '" fill="none" stroke="#cbc3b4" stroke-width="5" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>';
  const hr = rng('rumah-ketoyong');
  for (let i = 0; i < 70; i++) {
    const a = hr() * Math.PI * 2, rad = 18 + Math.sqrt(hr()) * 100, x = KET.x + Math.cos(a) * rad * 1.25, y = KET.y + Math.sin(a) * rad * 0.8;
    if (x > 905) continue;
    g += '<rect x="' + (x - 3.5).toFixed(1) + '" y="' + (y - 3).toFixed(1) + '" width="7" height="6" rx="1" fill="#d9d0c9" transform="rotate(' + ((hr() - 0.5) * 50).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
  }
  g += '<circle data-mk="buf" cx="' + KET.x + '" cy="' + KET.y + '" r="60" fill="#d97706" fill-opacity=".18" stroke="#d97706" stroke-opacity=".95" stroke-width="2"/>';
  g += '<g data-mk="route"></g><g data-mk="lk"></g><g data-mk="rd"></g><g data-mk="fu"></g><g data-mk="dot"></g>';
  g += '<g filter="url(#mkShadow)"><circle data-mk="mk" cx="' + KET.x + '" cy="' + KET.y + '" r="18" fill="#d97706" stroke="#fff" stroke-width="2.5"/>' +
    '<text x="' + KET.x + '" y="' + (KET.y + 5.5) + '" text-anchor="middle" font-size="15" fill="#fff" class="mk-num">' + NADI_CARD.cumulativeCases + '</text></g>';
  g += '<g transform="translate(' + KET.x + ' ' + (KET.y - 40) + ')"><rect x="-49" y="-12" width="98" height="22" rx="6" fill="#fff" stroke="#d97706" stroke-width="1.2"/>' +
    '<text x="0" y="3.6" text-anchor="middle" font-size="11.5" fill="#102A43" class="mk-label">Kg. Ketoyong</text></g>';
  const svg = $['na.mapSvg'];
  svg.innerHTML = g;
  const fu = svg.querySelector('[data-mk="fu"]');
  fu.innerHTML = FOLLOW_POS.map((p, i) => '<g data-fu="' + i + '" opacity="0"><g filter="url(#mkShadow)"><circle r="9.5" fill="#006B5B" stroke="#fff" stroke-width="2"/>' +
    '<text y="3.6" text-anchor="middle" font-size="10" fill="#fff" class="mk-num">' + (i + 1) + '</text></g></g>').join('');
  MAP.fu = Array.from(fu.querySelectorAll('[data-fu]'));
  // V5 follow-up flow: the 6 unvisited premises (red, pulsing), the 12 locked / empty premises (amber, re-check ring),
  // the planned route through the 6 (drawn, then marching dashes) and a dot for the team travelling it
  const routeD = 'M' + FOLLOW_POS.map(p => p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' L');
  const rt = svg.querySelector('[data-mk="route"]');
  rt.innerHTML = '<path d="' + routeD + '" fill="none" stroke="#0f766e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>' +
    '<path d="' + routeD + '" fill="none" stroke="#0f766e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="7 6" opacity="0"/>';
  MAP.routeDraw = rt.children[0]; MAP.routeDash = rt.children[1];
  const lk = svg.querySelector('[data-mk="lk"]');
  lk.innerHTML = LOCKED_POS.map((p, i) => '<g data-lk="' + i + '" opacity="0"><circle r="11.5" fill="none" stroke="#b45309" stroke-width="2" stroke-dasharray="3 2.5" opacity="0"/>' +
    '<rect x="-6" y="-6" width="12" height="12" rx="3" fill="#f59e0b" stroke="#fff" stroke-width="1.8"/></g>').join('');
  MAP.lk = Array.from(lk.querySelectorAll('[data-lk]')); MAP.lkRing = MAP.lk.map(g => g.firstChild);
  const rd = svg.querySelector('[data-mk="rd"]');
  rd.innerHTML = FOLLOW_POS.map((p, i) => '<g data-rd="' + i + '" opacity="0"><circle r="10" fill="#e11d48" fill-opacity=".3"/><g filter="url(#mkShadow)"><circle r="8.5" fill="#e11d48" stroke="#fff" stroke-width="2"/></g></g>').join('');
  MAP.rd = Array.from(rd.querySelectorAll('[data-rd]')); MAP.rdPulse = MAP.rd.map(g => g.firstChild);
  const dot = svg.querySelector('[data-mk="dot"]');
  dot.innerHTML = '<g opacity="0"><circle r="10" fill="#14b8a6" fill-opacity=".3"/><circle r="5.8" fill="#0f766e" stroke="#fff" stroke-width="2"/></g>';
  MAP.dot = dot.firstChild;
}

/* Dark illustrative district map from the 90-second film (abstract outline, not real geography). */
const OP = { houses: [] };
function buildOpeningMap() {
  const svg = $['op.mapSvg'], r = rng('peta-ilustrasi-muallim');
  const cx = 930, cy = 560; let d = '';
  for (let i = 0; i <= 36; i++) {
    const a = (i / 36) * Math.PI * 2, rad = 380 + Math.sin(a * 3 + 1.2) * 46 + Math.sin(a * 5 + 0.4) * 24 + (r() - 0.5) * 18;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad * 1.28).toFixed(1) + ' ' + (cy + Math.sin(a) * rad * 0.92).toFixed(1);
  }
  let g = '<defs><pattern id="mgrid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="rgba(148,163,184,.07)" stroke-width="1"/></pattern></defs>' +
    '<rect width="1920" height="1080" fill="url(#mgrid)"/>' +
    '<path d="' + d + 'Z" fill="rgba(20,184,166,.07)" stroke="rgba(94,234,212,.45)" stroke-width="2.5" stroke-dasharray="10 8"/>' +
    '<path d="M180 820 C 520 700, 640 760, 860 640 S 1240 380, 1740 300" fill="none" stroke="rgba(56,189,248,.38)" stroke-width="9" stroke-linecap="round"/>';
  for (const rd of ['M260 300 C 560 420, 820 470, 1010 560 S 1500 720, 1700 860', 'M760 980 C 860 820, 940 680, 1010 560 S 1080 330, 1180 160',
    'M1010 560 C 1180 520, 1380 500, 1620 470', 'M420 640 C 620 600, 820 600, 1010 560']) g += '<path d="' + rd + '" fill="none" stroke="rgba(203,213,225,.22)" stroke-width="5" stroke-linecap="round"/>';
  const hr = rng('premis-110');
  let houses = '';
  for (let i = 0; i < 110; i++) {
    const a = hr() * Math.PI * 2, rad = 40 + Math.sqrt(hr()) * 230;
    const x = OPIN.x + Math.cos(a) * rad * 1.35, y = OPIN.y + Math.sin(a) * rad * 0.85;
    houses += '<rect x="' + (x - 5).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" width="10" height="10" rx="2" fill="#cbd5e1" opacity="0" data-h="' + i + '"/>';
  }
  svg.innerHTML = g + '<g>' + houses + '</g>';
  OP.houses = Array.from(svg.querySelectorAll('rect[data-h]'));
  tf($['op.district'], 'translate(560px,214px)');
  tf($['op.chip'], 'translate(96px,48px)');
}

/* paper forms, tally and the re-entry laptop */
const MAN = { tally: [], cells: [], focus: null, sq: {} };
function buildManual() {
  // illegible handwriting in the Lampiran 1 name / phone columns (no personal data)
  const sr = rng('lampiran-1-tulisan');
  PAPER_ROWS.forEach((r, i) => {
    for (const k of [3, 4]) {
      const svg = $['man.l' + i + '_' + k]; if (!svg) continue;
      const end = 8 + 150 * (k === 3 ? 0.62 + sr() * 0.28 : 0.45 + sr() * 0.3);
      let d = 'M4 ' + (17 + sr() * 2).toFixed(1), x = 4;
      while (x < end) {
        const w = 5 + sr() * 6, up = 6 + sr() * 9;
        d += ' c ' + (w * 0.3).toFixed(1) + ' ' + (-up).toFixed(1) + ' ' + (w * 0.7).toFixed(1) + ' ' + (-up).toFixed(1) + ' ' + w.toFixed(1) + ' ' + (sr() * 4 - 1.5).toFixed(1);
        x += w;
        if (sr() < 0.14) { d += ' m 6 ' + (sr() * 3 - 1.5).toFixed(1); x += 6; }
      }
      svg.innerHTML = '<path d="' + d + '" fill="none" stroke="#1d3a8a" stroke-width="1.6" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"/>';
      MAN.sq['man.l' + i + '_' + k] = svg.firstChild;
    }
  });
  const ts = $['man.tallySvg'], tr = rng('tally');
  let tg = '', mark = 0;
  for (let k = 1; k <= 6; k++) {
    const y = 34 + (k - 1) * 62;
    tg += '<text x="4" y="' + (y + 22) + '" font-size="22" font-weight="700" font-style="italic" fill="#1e3a8a">P' + k + '</text>';
    for (let i = 0; i < TEAMS[k].visited; i++) {
      const grp = Math.floor(i / 5), j = i % 5, gx = 52 + grp * 70;
      let p;
      if (j < 4) { const x = gx + j * 11 + (tr() - 0.5) * 2; p = 'M' + x.toFixed(1) + ' ' + (y + (tr() - 0.5) * 3).toFixed(1) + ' L' + (x + (tr() - 0.5) * 3).toFixed(1) + ' ' + (y + 30).toFixed(1); }
      else p = 'M' + (gx - 6) + ' ' + (y + 24) + ' L' + (gx + 42) + ' ' + (y + 6);
      tg += '<path d="' + p + '" stroke="#1e3a8a" stroke-width="2.6" stroke-linecap="round" fill="none" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" data-m="' + (mark++) + '"/>';
    }
  }
  ts.innerHTML = tg;
  MAN.tally = Array.from(ts.querySelectorAll('path[data-m]'));
  // re-entry grid: every team cell already typed except the focus cell (Pasukan 4 · Dilawati); totals not yet worked out
  const lg = $['man.lapGrid'];
  const rowsL = [['Lokaliti', 'locality'], ['Dilawati', 'visited'], ['Berkunci/Kosong', 'locked'], ['Penduduk', 'pop'], ['Bergejala', 'symp'], ['Rujukan', 'ref']];
  let lh = '<div class="lg-row lg-hd"><span class="lg-l">PERKARA</span>' + [1, 2, 3, 4, 5, 6].map(k => '<span>P' + k + '</span>').join('') + '<span>Jumlah</span></div>';
  rowsL.forEach(([label, key], ri) => {
    lh += '<div class="lg-row"><span class="lg-l">' + label + '</span>';
    for (let k = 1; k <= 6; k++) lh += '<span class="lg-c"' + (ri === 1 && k === 4 ? ' data-focus="1"' : '') + '>' + (ri === 1 && k === 4 ? '' : TEAMS[k][key]) + '</span>';
    lh += '<span class="lg-c lg-tot">–</span></div>';
  });
  lg.innerHTML = lh + '<div class="lg-sim">' + simBadge('') + '</div>';
  MAN.focus = lg.querySelector('[data-focus]');
}

const FLOW = { paths: null, lens: null, pk: [] };
function buildFlow() {
  // one-way path: phone (left) → Apps Script → Sheets (screen coordinates; identity camera in this shot)
  const ph = { r: I_PHONE.x + 207 * I_PHONE.s - 10, y: I_PHONE.y - 60 };
  const gl = I_GAS.x - M.gas.w * I_GAS.s / 2, gr = I_GAS.x + M.gas.w * I_GAS.s / 2;
  const sl = I_SHEET.x - M.sheet.w * I_SHEET.s / 2 + 8;
  const p1 = 'M ' + ph.r.toFixed(0) + ' ' + ph.y.toFixed(0) + ' C ' + (ph.r + 70).toFixed(0) + ' ' + ph.y.toFixed(0) + ', ' + (gl - 70).toFixed(0) + ' ' + I_GAS.y + ', ' + (gl - 6).toFixed(0) + ' ' + I_GAS.y;
  const p2 = 'M ' + (gr + 6).toFixed(0) + ' ' + I_GAS.y + ' C ' + (gr + 60).toFixed(0) + ' ' + I_GAS.y + ', ' + (sl - 60).toFixed(0) + ' ' + (I_SHEET.y - 40) + ', ' + (sl - 4).toFixed(0) + ' ' + (I_SHEET.y - 40);
  attr($['ov.fp1'], 'd', p1); attr($['ov.fp2'], 'd', p2);
  FLOW.paths = [$['ov.fp1'], $['ov.fp2']];
  FLOW.lens = FLOW.paths.map(p => p.getTotalLength());
  let g = '';
  for (let i = 0; i < 10; i++) g += '<circle r="7" fill="#5eead4" opacity="0"/>';
  $['ov.packets'].innerHTML = g;
  FLOW.pk = Array.from($['ov.packets'].children);
}

const DUST = [];
let CLOSING = [], TITLE = [];
function buildBackground() {
  css($['bg.grad'], 'background', 'linear-gradient(160deg, #020617 0%, #0b1324 42%, #0e2a2c 74%, #134e4a 100%)');
  css($['bg.end'], 'background', 'radial-gradient(ellipse 90% 80% at 50% 40%, #0f766e 0%, #115e59 32%, #0b3b37 64%, #031b1a 100%)');
  css($['bg.end'], 'opacity', '0');
  let g = '';
  for (let x = 0; x <= 1920; x += 96) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="1080" stroke="rgba(94,234,212,.045)" stroke-width="1"/>';
  for (let y = 0; y <= 1080; y += 96) g += '<line x1="0" y1="' + y + '" x2="1920" y2="' + y + '" stroke="rgba(94,234,212,.045)" stroke-width="1"/>';
  $['bg.grid'].innerHTML = g;
  const r = rng('dust'); let d = '';
  for (let i = 0; i < 30; i++) { d += '<i></i>'; DUST.push({ x: r() * 1920, y: r() * 1080, vx: (r() - 0.5) * 12, vy: -5 - r() * 10, a: 0.2 + r() * 0.45, s: 0.6 + r() * 1.4, ph: r() * 6.28 }); }
  $['bg.dust'].innerHTML = d;
  DUST.forEach((p, i) => { p.el = $['bg.dust'].children[i]; });
  CLOSING = Array.from($['ov.closing'].children);
  TITLE = Array.from($['ov.title'].children);
}

/* ==========================================================================
 * RENDERERS
 * ========================================================================== */
function renderBg(t) {
  // V9 (draft 3): the teal title background is in before the manual scene has gone (no dark gap), on the film clock
  const fi = filmTime(T.d.impact), ft = filmTime(t);
  // (in 0.85–0.4 s before the impact, under the manual scene; out only once the NADI map is almost fully in)
  op($['bg.end'], Math.max(t < 60 ? seg(ft, fi - 0.85, fi - 0.4, E.inOutSine) * (1 - seg(t, T.e.in[1] - 0.15, T.e.in[1] + 0.15, E.inOutSine)) : 0, seg(t, 104.7, 105.25, E.inOutSine)));
  // V9 (draft 3): during the title the light behind it drifts slowly, so the card is never a frozen frame
  if (t > 13 && t < 17.2) css($['bg.end'], 'background', 'radial-gradient(ellipse 90% 80% at ' + r2(50 + 4 * Math.sin(ft * 0.6)) + '% ' + r2(40 + 3 * Math.cos(ft * 0.45)) + '%, #0f766e 0%, #115e59 32%, #0b3b37 64%, #031b1a 100%)');
  else css($['bg.end'], 'background', 'radial-gradient(ellipse 90% 80% at 50% 40%, #0f766e 0%, #115e59 32%, #0b3b37 64%, #031b1a 100%)');
  op($['bg.grid'], 1 - seg(t, 0, 0.01) * (t < 4 ? 1 : 0));
  op($['bg.g1'], 0.85); op($['bg.g2'], 0.75);
  tf($['bg.g1'], 'translate(' + px(560 + Math.sin(t * 0.11) * 220) + ',' + px(-760 + Math.cos(t * 0.09) * 120) + ')');
  tf($['bg.g2'], 'translate(' + px(-420 + Math.cos(t * 0.08) * 200) + ',' + px(80 + Math.sin(t * 0.1) * 110) + ')');
  tf($['bg.grid'], 'translate(' + px(-((t * 6) % 96)) + ',' + px(-((t * 4) % 96)) + ')');
  for (const p of DUST) {
    const x = ((p.x + p.vx * t) % 1920 + 1920) % 1920, y = ((p.y + p.vy * t) % 1080 + 1080) % 1080;
    tf(p.el, 'translate(' + px(x) + ',' + px(y + Math.sin(t * 0.7 + p.ph) * 10) + ') scale(' + r5(p.s) + ')');
    op(p.el, p.a * (0.6 + 0.4 * Math.sin(t * 1.3 + p.ph)));
  }
}

/* ---------------------------------------------------------------- 1 · dark map + question */
function renderOpening(t, o) {
  const S = $.op;
  vis(S, o > 0.002); if (o <= 0.002) return;
  op(S, o);
  const A = T.a;
  // slow push-in on Kg. Ketoyong (continues gently while the map is the dimmed backdrop)
  const z = lerp(1, 1.085, seg(t, A.push[0], A.push[1], E.inOutSine)) * lerp(1, 1.05, seg(t, A.push[1], 13.2, E.lin));
  tf($['op.map'], 'translate(' + OPIN.x + 'px,' + OPIN.y + 'px) scale(' + r5(z) + ') translate(' + (-OPIN.x) + 'px,' + (-OPIN.y) + 'px)');
  op($['op.map'], seg(t, A.mapIn[0], A.mapIn[1], E.outCubic));
  op($['op.district'], seg(t, 0.4, 1.1) * (1 - seg(t, A.dim[0], A.dim[1])));
  op($['op.chip'], 0);   // V3: the system label (top left) carries 'Peta ilustrasi · bukan berskala' + DATA SIMULASI
  const drop = seg(t, A.pin, A.pin + 0.7, E.spring);
  op($['op.pin'], seg(t, A.pin, A.pin + 0.15));
  tf($['op.pin'], 'translate(' + OPIN.x + 'px,' + px(OPIN.y - 110 * (1 - drop)) + ')');
  // one purposeful pulse
  const rp = seg(t, A.pulse[0], A.pulse[1], E.outCubic);
  op($['op.pinRing'], t >= A.pulse[0] && t < A.pulse[1] ? 0.95 * (1 - rp) : 0);
  tf($['op.pinRing'], 'scale(' + r5(0.4 + 1.9 * rp) + ')');
  const lb = seg(t, A.pin + 0.2, A.pin + 0.6, E.outCubic);
  op($['op.pinLabel'], lb * (1 - seg(t, A.dim[0], A.dim[1])));
  tf($['op.pinLabel'], 'translateX(' + px(-14 * (1 - lb)) + ')');
  for (let i = 0; i < OP.houses.length; i++) attr(OP.houses[i], 'opacity', String(r2(seg(t, A.houses + i * 0.012, A.houses + 0.3 + i * 0.012))));
  const q = win(t, A.q[0], A.q[1], A.q[2], A.q[3]);
  op($['op.q'], q); tf($['op.q'], 'translate(110px,' + px(300 + 18 * (1 - q)) + ')');
  op($['op.rain'], 0);
}

/* ---------------------------------------------------------------- 1 · V6 opening globe
 * The satellite map (tools/make-map-globe.py: Google Maps imagery without the interface, plus the GIS
 * imagery north of it so the circle is complete) is wrapped on a sphere and drawn with WebGL in the
 * flow chart's background. Every uniform is a function of t (deterministic); the texture is uploaded
 * once after the <img> has decoded. The ring is the 200 m ACD radius: 212 texture px, from the map's
 * own scale bar (100 m = 106 px); its centre is the outbreak circle of the PKD GIS map, registered onto
 * this imagery. No house-level markers are drawn. Without WebGL the same image is shown as a flat disc. */
const GLOBE = {
  box: [300, 120, 1320, 960],          // canvas placement on the stage
  cx: 960, cy: 790, R: 600,            // sphere (stage px)
  k: 1.41,                             // texture px per arc px at the surface
  zone: [745.5, 310.6], zoneR: 212,    // ACD centre and 200 m radius (texture px)
  latZ: -0.2,                          // the ring sits 11.5° below the front point, under the flow cards
  rects: [[0, 145, 2000, 1277], [440, 0, 1080, 169]],   // where the texture has imagery
  texScale: [0.75 / 2048, 0.75 / 1024],
  gl: null, prog: null, u: {}, ok: false
};
const GLOBE_FS = [
  'precision highp float;',
  'uniform sampler2D uTex; uniform vec2 uBox; uniform vec2 uC; uniform float uR; uniform float uLon; uniform vec2 uA; uniform float uK;',
  'uniform vec2 uZone; uniform float uZoneR; uniform vec4 uRing; uniform float uPing; uniform float uMapA; uniform vec4 uR0; uniform vec4 uR1; uniform vec2 uTexScale; uniform float uPR;',
  'float rectA(vec2 p, vec4 r) { vec2 d = min(p - r.xy, r.zw - p); return clamp(min(d.x, d.y) / 110.0, 0.0, 1.0); }',
  'float grid(float a, float step) { float f = abs(fract(a / step + 0.5) - 0.5) * step; return 1.0 - smoothstep(0.0, 0.006, f); }',
  'void main() {',
  '  vec2 p = vec2(gl_FragCoord.x, uBox.y - gl_FragCoord.y) / uPR;',   // V9 (HD): device px → stage px
  '  vec2 d = (p - uC) / uR; float r2 = dot(d, d);',
  '  vec3 teal = vec3(0.176, 0.831, 0.749);',
  '  float aa = clamp((1.0 - sqrt(r2)) * uR * uPR + 0.5, 0.0, 1.0);',
  '  float rr = sqrt(r2); float halo = exp(-max(rr - 1.0, 0.0) * 22.0) * 0.5 * (1.0 - smoothstep(1.05, 1.095, rr));',   // fades out inside the canvas box
  '  if (r2 > 1.0) { gl_FragColor = vec4(teal * halo, halo) * uMapA; return; }',
  '  float z = sqrt(1.0 - r2); vec3 n = vec3(d.x, -d.y, z);',
  '  float lat = asin(clamp(n.y, -1.0, 1.0)); float lon = atan(n.x, n.z) - uLon;',
  '  vec2 tp = uA + vec2(lon, -lat) * uR * uK;',
  '  float nx = (tp.x - uZone.x) / 190.0; float nN = 95.0 + 150.0 * exp(-nx * nx);',
  '  float da = max(rectA(tp, uR0), rectA(tp, uR1)) * (1.0 - smoothstep(nN - 75.0, nN, uZone.y - tp.y));',   // soft dome over the ring to the north
  '  vec3 map = texture2D(uTex, tp * uTexScale).rgb;',
  '  float g = max(grid(lat, 0.2618), grid(lon, 0.2618));',
  '  vec3 col = mix(vec3(0.035, 0.075, 0.15) + teal * g * 0.22, map * 0.92, da);',
  '  vec3 L = normalize(vec3(-0.45, 0.6, 0.66));',
  '  col *= 0.42 + 0.68 * max(dot(n, L), 0.0);',
  '  col *= 0.55 + 0.45 * sqrt(z);',
  '  vec2 dz = tp - uZone; float dist = length(dz);',
  '  float ang = atan(dz.x, -dz.y); if (ang < 0.0) ang += 6.2831853; float af = ang / 6.2831853;',
  '  float core = 1.0 - smoothstep(2.2, 4.0, abs(dist - uZoneR));',
  '  float glow = 1.0 - smoothstep(0.0, 22.0, abs(dist - uZoneR));',
  '  float dash = step(fract(af * 44.0), 0.55);',
  '  vec3 amber = vec3(0.984, 0.749, 0.141); vec3 rose = vec3(0.984, 0.443, 0.522);',
  '  float traced = step(af, uRing.y);',
  '  col = mix(col, rose, uRing.w * step(dist, uZoneR));',
  '  col = mix(col, amber, core * dash * uRing.x * (1.0 - traced * uRing.z));',
  '  col = mix(col, rose, core * traced * uRing.z);',
  '  col += rose * glow * 0.32 * traced * uRing.z;',
  '  if (uPing > 0.0 && uPing < 1.0) { float pr = uZoneR * (1.0 + 0.32 * uPing); col = mix(col, rose, (1.0 - smoothstep(1.5, 5.0, abs(dist - pr))) * (1.0 - uPing) * 0.85); }',
  '  col += teal * pow(1.0 - z, 3.0) * 0.45;',
  '  vec4 o = vec4(col, 1.0) * aa + vec4(teal * halo, halo) * (1.0 - aa);',
  '  gl_FragColor = o * uMapA;',
  '}'
].join('\n');
function initGlobe() {
  const cv = $['fc.globe'], img = $['fc.globeImg'];
  let gl = null;
  try { gl = cv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: true, alpha: true }); } catch (e) { gl = null; }
  if (!gl || !img.naturalWidth) { cls($['fc.map'], 'no-gl', true); return; }
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  try {
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 aP; void main() { gl_Position = vec4(aP, 0.0, 1.0); }'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, GLOBE_FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aP'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for (const n of ['uTex', 'uBox', 'uC', 'uR', 'uLon', 'uA', 'uK', 'uZone', 'uZoneR', 'uRing', 'uPing', 'uMapA', 'uR0', 'uR1', 'uTexScale', 'uPR']) GLOBE.u[n] = gl.getUniformLocation(prog, n);
    GLOBE.gl = gl; GLOBE.prog = prog; GLOBE.ok = true;
    cv.width = Math.round(GLOBE.box[2] * RENDER_SCALE); cv.height = Math.round(GLOBE.box[3] * RENDER_SCALE);   // V9 (HD)
  } catch (e) { cls($['fc.map'], 'no-gl', true); GLOBE.ok = false; }
}
/* time-dependent globe state (shared by the shader uniforms and the ring label) */
function globeState(t) {
  const A = T.a, G = GLOBE;
  const rise = seg(t, 0, 1.5, E.outCubic);
  return {
    cy: G.cy + 70 * (1 - rise), R: G.R * lerp(0.94, 1, rise),
    lon: lerp(-0.24, 0.24, clamp(t / A.out[1])),                  // one slow, constant spin: the zone drifts left to right
    dash: 0.75 * seg(t, 0.9, 1.6),                                 // the 200 m radius, dashed (as on the GIS map)
    trace: seg(t, A.stamp + 0.05, A.stamp + 0.95, E.inOutCubic),  // traced solid when the outbreak is declared
    ring: seg(t, A.stamp, A.stamp + 0.1),
    fill: 0.07 * seg(t, A.stamp + 0.2, A.stamp + 0.8) + 0.08 * win(t, A.stamp + 0.2, A.stamp + 0.6, A.stamp + 0.8, A.stamp + 1.6, E.outCubic, E.inOutSine),
    ping: t >= A.stamp + 0.95 && t < A.stamp + 1.9 ? seg(t, A.stamp + 0.95, A.stamp + 1.9, E.outCubic) : -1
  };
}
/* stage position of a texture point on the globe (null when it is on the far side) */
function globePoint(gs, tx, ty) {
  const G = GLOBE, Rk = gs.R * G.k;
  const ax = G.zone[0], ay = G.zone[1] + G.latZ * Rk;           // texture point at the front of the sphere
  const lonT = (tx - ax) / Rk, lat = -(ty - ay) / Rk, lon = lonT + gs.lon;
  const nx = Math.cos(lat) * Math.sin(lon), ny = Math.sin(lat), nz = Math.cos(lat) * Math.cos(lon);
  if (nz <= 0) return null;
  return { x: G.cx + gs.R * nx, y: gs.cy - gs.R * ny };
}
function renderGlobe(t) {
  const G = GLOBE, gs = globeState(t);
  // ring label: at the east edge of the 200 m circle
  const e = globePoint(gs, G.zone[0] + G.zoneR, G.zone[1]);
  const la = seg(t, T.a.stamp + 0.7, T.a.stamp + 1.1, E.outCubic);
  op($['fc.zlabel'], e ? la : 0);
  if (e) tf($['fc.zlabel'], 'translate(' + px(e.x + 16 + 10 * (1 - la)) + ',' + px(e.y - 19) + ')');
  if (!G.ok) {
    tf($['fc.globeFb'], 'translate(' + px(-gs.lon * G.R) + ',' + px(gs.cy - G.cy) + ')');
    return;
  }
  const gl = G.gl, u = G.u, B = G.box, cv = $['fc.globe'];
  gl.viewport(0, 0, cv.width, cv.height);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1i(u.uTex, 0);
  gl.uniform2f(u.uBox, cv.width, cv.height); gl.uniform1f(u.uPR, cv.width / B[2]);
  gl.uniform2f(u.uC, G.cx - B[0], gs.cy - B[1]);
  gl.uniform1f(u.uR, gs.R);
  gl.uniform1f(u.uLon, gs.lon);
  gl.uniform2f(u.uA, G.zone[0], G.zone[1] + G.latZ * gs.R * G.k);
  gl.uniform1f(u.uK, G.k);
  gl.uniform2f(u.uZone, G.zone[0], G.zone[1]);
  gl.uniform1f(u.uZoneR, G.zoneR);
  gl.uniform4f(u.uRing, gs.dash, gs.trace, gs.ring, gs.fill);
  gl.uniform1f(u.uPing, gs.ping);
  gl.uniform1f(u.uMapA, 1);
  gl.uniform4f(u.uR0, ...G.rects[0]); gl.uniform4f(u.uR1, ...G.rects[1]);
  gl.uniform2f(u.uTexScale, G.texScale[0], G.texScale[1]);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

/* ---------------------------------------------------------------- 1 · V5 opening flow chart */
const FX_BAR_H = [14, 22, 31, 44, 62];
function renderFlowOpening(t, o) {
  const S = $.fc;
  vis(S, o > 0.002); if (o <= 0.002) return;
  op(S, o);
  const A = T.a;
  // the camera eases toward the ACD step as the flow hands over to the manual process
  const out = seg(t, A.out[0], A.out[1], E.inCubic);
  tf(S, 'translate(1605px,570px) scale(' + r5(1 + 0.1 * out) + ') translate(-1605px,-570px)');
  // V6: satellite globe with the 200 m ACD radius (see GLOBE below)
  op($['fc.map'], seg(t, 0, 0.8, E.inOutSine));
  op($['fc.credit'], seg(t, 0.6, 1.2) * (1 - seg(t, A.out[0] - 0.3, A.out[0])));
  renderGlobe(t);
  op($['fc.head'], seg(t, A.head, A.head + 0.45));
  A.nodes.forEach((t0, i) => {
    const a = seg(t, t0, t0 + 0.55, E.springSoft), el = $['fc.n' + i];
    op(el, seg(t, t0, t0 + 0.2));
    tf(el, 'translateY(' + px(28 * (1 - a)) + ') scale(' + r5(lerp(0.9, 1, a)) + ')');
    cls(el, 'on', t >= t0 + 0.2 && (i === 3 || t < A.nodes[i + 1] + 0.2));   // the active step moves along the flow
  });
  A.arrows.forEach(([a0, a1], i) => {
    attr($['fc.a' + i], 'stroke-dashoffset', String(r2(1 - seg(t, a0, a1, E.inOutCubic))));
    attr($['fc.ah' + i], 'opacity', String(r2(seg(t, a1 - 0.06, a1 + 0.04))));
  });
  // 1 notification: the bell rings and a badge appears
  const rt = t - A.ring[0];
  tf($['fc.bell'], 'rotate(' + r2(rt > 0 && t < A.ring[1] ? 16 * Math.sin(rt * 26) * Math.exp(-rt * 3.2) : 0) + 'deg)');
  const b = seg(t, A.ring[0] + 0.05, A.ring[0] + 0.4, E.outBack);
  op($['fc.badge'], seg(t, A.ring[0] + 0.05, A.ring[0] + 0.15)); tf($['fc.badge'], 'scale(' + r5(Math.max(0.01, b)) + ')');
  const nt = seg(t, A.ring[0] + 0.3, A.ring[0] + 0.7, E.outCubic);
  op($['fc.note'], nt); tf($['fc.note'], 'translateY(' + px(10 * (1 - nt)) + ')');
  // 2 rise in cases: bars grow one after another
  FX_BAR_H.forEach((h, i) => { const t0 = A.bars[0] + i * 0.12; css($['fc.bar' + i], 'height', px(h * seg(t, t0, t0 + 0.35, E.outCubic))); });
  // 3 outbreak declared: the stamp lands
  const st = seg(t, A.stamp, A.stamp + 0.22, E.inCubic);
  op($['fc.stamp'], seg(t, A.stamp, A.stamp + 0.08)); tf($['fc.stamp'], 'rotate(-8deg) scale(' + r5(lerp(1.9, 1, st)) + ')');
  // 4 ACD: houses checked one by one
  for (let i = 0; i < 4; i++) {
    const t0 = A.houses[0] + i * 0.2, c = seg(t, t0, t0 + 0.3, E.outBack);
    cls($['fc.h' + i], 'done', t >= t0);
    const em = $['fc.h' + i].querySelector('em');
    op(em, seg(t, t0, t0 + 0.12)); tf(em, 'scale(' + r5(Math.max(0.01, c)) + ')');
  }
}

/* ---------------------------------------------------------------- 2–3 · manual process */
const MAN_ITEMS = [
  { el: 'man.paper2', x: 520, y: 640, r: -3.5, s: 0.84, t: T.b.paper2, from: [300, 1500, -16] },   // Lampiran 1 (landscape)
  { el: 'man.paper', x: 1090, y: 565, r: 2.2, s: 0.84, t: T.b.paper, from: [1250, 1520, 12] },     // Borang ACD (portrait)
  { el: 'man.binder', x: 1530, y: 625, r: 4, s: 0.72, t: T.b.file, from: [1800, 1500, 12] },
  { el: 'man.tally', x: 1580, y: 600, r: -3, s: 0.78, t: T.c.tally, from: [2300, 600, 12] },
  { el: 'man.laptop', x: 960, y: 655, r: 0, s: 0.72, t: T.c.laptop, from: [960, 1500, 0] }
];
const MAN_TAGS = [[430, 372, T.b.focusPaper], [1530, 398, T.b.focusFile], [1580, 372, T.c.tallyFocus], [960, 425, T.c.laptopFocus]];
/* V4: handwriting on the paper forms. Bahagian A and the Bahagian C ticks on the Borang ACD, and
 * Lampiran 1 row by row, written side by side under the camera push (fictional entries, data.js). */
const MAN_WRITE = (() => {
  const w = [];
  let t = T.b.write[0];
  for (const [ref, d] of [['man.f0', 0.24], ['man.f1', 0.2], ['man.f2', 0.26], ['man.f3', 0.17], ['man.f4', 0.17], ['man.f5', 0.17]]) { w.push({ ref, t0: t, d, kind: 'hw', snd: 1 }); t += d + 0.03; }
  for (let i = 0; i < 3; i++) { w.push({ ref: 'man.fc' + i, t0: t, d: 0.1, kind: 'tick', snd: 1 }); t += 0.12; }
  let u = T.b.write[0] + 0.15;
  PAPER_ROWS.forEach((r, i) => {
    const cells = [[0, 0.085, 'hw'], [1, 0.025, 'hw'], [2, 0.025, 'hw']];
    if (r.nama) cells.push([3, 0.05, 'sq']);
    if (r.kes) cells.push([4, 0.045, 'sq']);
    cells.push([5, 0.045, 'hw']);
    cells.forEach(([k, d, kind], j) => { w.push({ ref: 'man.l' + i + '_' + k, t0: u, d, kind, snd: j === 0 ? 1 : 0 }); u += d + 0.004; });
    u += 0.02;
  });
  return w;
})();
const MAN_CAM = [];   // camera on the manual set: push on the forms, back out, then the laptop cell (filled in initMeasure)
function manualBright(t) {
  // one focal element at a time: forms → file → tally → laptop cell
  const B = T.b, C = T.c, w = (a, b) => win(t, a - 0.2, a + 0.1, b - 0.1, b + 0.2, E.lin, E.lin);
  return [w(B.paper2, B.focusFile), w(B.paper2, B.focusFile), Math.max(w(B.focusFile, C.tally + 0.7), t < B.focusFile ? 0.45 : 0), w(C.tally + 0.7, C.laptopFocus), seg(t, C.laptopFocus - 0.2, C.laptopFocus + 0.1, E.lin)];
}
function cellStage() {
  // laptop focus cell centre in set (stage) coordinates
  const c = MAN.focus, lap = $['man.laptop'];
  const m = offsetWithin(c, lap), L = MAN_ITEMS[4];
  return { x: L.x + (m.x + m.w / 2 - lap.offsetWidth / 2) * L.s, y: L.y + (m.y + m.h / 2 - lap.offsetHeight / 2) * L.s };
}
function renderManual(t, o) {
  const S = $.man;
  vis(S, o > 0.002); if (o <= 0.002) return;
  op(S, o);
  const C = T.c;
  // camera: push on the two forms while they are filled, back out for the file, then the laptop cell on "ditaip semula"
  const cam = kf(t, MAN_CAM);
  tf(S, 'translate(' + px(cam.tx) + ',' + px(cam.ty) + ') scale(' + r5(cam.z) + ') translate(' + px(-cam.cx) + ',' + px(-cam.cy) + ')');
  const bright = manualBright(t);
  MAN_ITEMS.forEach((it, i) => {
    const a = seg(t, it.t, it.t + 0.75, E.springSoft);
    const x = lerp(it.from[0], it.x, a), y = lerp(it.from[1], it.y, a), r = lerp(it.from[2], it.r, a);
    vis($[it.el], t > it.t - 0.05);
    tf($[it.el], 'translate(' + px(x) + ',' + px(y) + ') translate(-50%,-50%) rotate(' + r2(r) + 'deg) scale(' + it.s + ')');
    op($['man.dim' + [4, 0, 1, 2, 3][i]], 0.55 * (1 - bright[i]));
  });
  MAN_TAGS.forEach(([x, y, t0], i) => {
    const tg = $['man.tag' + i], a = seg(t, t0, t0 + 0.4, E.outBack);
    op(tg, seg(t, t0, t0 + 0.2) * bright[i + 1] * (1 - seg(t, C.clear[0], C.clear[0] + 0.2)));
    tf(tg, 'translate(' + px(x) + ',' + px(y) + ') translate(-50%,-50%) scale(' + r5(lerp(0.7, 1, a)) + ')');
  });
  // handwriting: Caveat text revealed left to right; ticks and illegible name/phone scribbles drawn as strokes
  for (const w of MAN_WRITE) {
    const p = seg(t, w.t0, w.t0 + w.d, E.lin);
    if (w.kind === 'hw') css($[w.ref], 'clip-path', p >= 1 ? 'none' : 'inset(-30% ' + r2(100 * (1 - p)) + '% -30% -6%)');
    else attr(w.kind === 'sq' ? MAN.sq[w.ref] : $[w.ref], 'stroke-dashoffset', String(r2(1 - p)));
  }
  const nT = MAN.tally.length, dT = (C.tallyDraw[1] - C.tallyDraw[0]) / nT;
  for (let i = 0; i < nT; i++) { const t0 = C.tallyDraw[0] + i * dT; attr(MAN.tally[i], 'stroke-dashoffset', String(r2(1 - seg(t, t0, t0 + 0.05, E.lin)))); }
  // the typed cell: "1" then "14", completed (green) at 11.85
  const tw = C.typing, typedTxt = t < tw[0] + 0.15 ? '' : t < tw[0] + 0.33 ? '1' : '14';
  txt(MAN.focus, typedTxt);
  cls(MAN.focus, 'cur', t >= C.push[0] && t < C.done);
  cls(MAN.focus, 'done', t >= C.done);
}

/* ---------------------------------------------------------------- 5, 12 · NADI */
/* V9: KPI-card highlight as a fade (k = 0..1) from the base card style to the .hl look */
const KPI_GLOW = { warn: { ring: [245, 158, 11, 0.9], bg: [255, 251, 235], bd: [245, 158, 11] },
                   left: { ring: [225, 29, 72, 0.85], bg: [255, 241, 242], bd: [251, 113, 133] } };
function kpiGlow(el, k, kind) {
  const g = KPI_GLOW[kind], mix = (a, b) => Math.round(a + (b - a) * k), rgb = (a, b) => 'rgb(' + mix(a[0], b[0]) + ',' + mix(a[1], b[1]) + ',' + mix(a[2], b[2]) + ')';
  const [r, gg, b, al] = g.ring;
  css(el, 'background', k > 0 ? rgb([255, 255, 255], g.bg) : '');
  css(el, 'border-color', k > 0 ? rgb([221, 229, 236], g.bd) : '');
  css(el, 'box-shadow', k > 0 ? '0 0 0 ' + r5(2.5 * k) + 'px rgba(' + r + ',' + gg + ',' + b + ',' + r5(al * k) + '), 0 0 0 ' + r5(6 * k) + 'px rgba(' + r + ',' + gg + ',' + b + ',' + r5(0.18 * k) + ')' : '');
}
/* V9: the follow-up flow nodes on the left fade their highlight in and out over 0.3 s instead of switching in
 * one frame; the end state is the V8 .hl look as rendered (amber ring 3 + 7 px, tinted fill, no drop shadow). */
const FU_TINT = { warn: [120, 53, 15, 0.55], bad: [136, 19, 55, 0.5] };
function fuGlow(el, k, kind) {
  const c = FU_TINT[kind], m = (a, b) => a + (b - a) * k;
  css(el, 'background', k > 0 ? 'rgba(' + Math.round(m(2, c[0])) + ',' + Math.round(m(6, c[1])) + ',' + Math.round(m(23, c[2])) + ',' + r5(m(0.94, c[3])) + ')' : '');
  css(el, 'box-shadow', k > 0 ? '0 0 0 ' + r5(3 * k) + 'px rgba(251,191,36,' + r5(0.95 * k) + '), 0 0 0 ' + r5(7 * k) + 'px rgba(251,191,36,' + r5(0.28 * k) + '), 0 20px 44px -18px rgba(0,0,0,' + r5(0.75 * (1 - k)) + ')' : '');
  css(el, 'z-index', k > 0 ? '5' : '');
}
/* V9: the expand moves every block of the card in one direction only. The card scrolls by a layout offset (top), not a
 * transform, so scroll and growth are snapped once; both advance in whole CSS px (growth floored) and the growth ends
 * on the measured height. V8 rounded them separately and switched to 'auto' at the end: blocks under the summary
 * stepped back 0.85 px and then jumped 1.84 px as the panel settled. */
function cardScroll(t) { return t > 60 ? Math.round(M.na.protoTop * seg(t, T.l.expand[0], T.l.expand[1], E.inOutCubic)) : 0; }
function protoHeight(t, ex) { return ex >= 1 ? M.na.protoFullH : cardScroll(t) + Math.floor((M.na.protoFullH - M.na.protoTop) * ex); }
function btnMap(ref, t, ax) {
  const b = ref === 'na.openBtn' ? M.na.openBtn : M.na.decBtn;
  return { x: b.x + b.w * ax, y: b.y - (ref === 'na.decBtn' ? cardScroll(t) : 0) + b.h * 0.55 };
}
/* V9 (draft 3): the Google Earth view in 3D (src/kampung3d.js) fills the map panel during the NADI introduction
 * (film K3D.win); the 2D map is hidden meanwhile and returns for the follow-up scene. The canvas covers the visible part
 * of the panel at the stage's own pixel size (measured once; the NADI camera holds still in the introduction). */
function renderK3dLayer(t) {
  const ft = filmTime(t), on = t < 60 && ft >= K3D.win[0] && ft <= K3D.win[1], cv = $['k3d'];
  if (on && !K3D.ok && !K3D.failed) {
    const st = document.getElementById('stage').getBoundingClientRect(), ss = st.width / 1920, mr = $['na.map'].getBoundingClientRect(), sc = mr.width / 1280;
    if (ss > 0 && sc > 0) {   // measured only once the panel is laid out
      const leftCss = Math.max(0, (st.left - mr.left) / sc), wCss = 1280 - leftCss;
      css(cv, 'left', px(leftCss)); css(cv, 'width', px(wCss)); css(cv, 'height', '556px');
      K3D.left = leftCss; K3D.scale = sc / ss;
      initKampung(cv, $['k3d.img'], Math.round(wCss * K3D.scale), Math.round(556 * K3D.scale));
    }
  }
  const show = on && K3D.ok;
  vis(cv, show); vis($['k3d.name'], show); vis($['k3d.rad'], show); vis($['k3d.credit'], show); op($['na.mapSvg'], show ? 0 : 1);
  if (!show) return;
  const lab = renderKampung(ft), a = [K3D.left + lab.name[0] / K3D.scale, lab.name[1] / K3D.scale], b = [K3D.left + lab.radius[0] / K3D.scale, lab.radius[1] / K3D.scale];
  const fade = seg(ft, K3D.win[0] + 0.5, K3D.win[0] + 1.1, E.outCubic);
  op($['k3d.name'], fade); op($['k3d.rad'], seg(ft, K3D.win[0] + 0.9, K3D.win[0] + 1.5, E.outCubic));
  tf($['k3d.name'], 'translate(' + px(a[0]) + ',' + px(a[1]) + ') translate(-50%,-100%)');
  tf($['k3d.rad'], 'translate(' + px(b[0]) + ',' + px(b[1]) + ') translate(-50%,7px)');
  tf($['k3d.credit'], 'translate(' + px(K3D.left + 9) + ',' + px(556 - 15) + ')');   // imagery credit, bottom left of the view
}
function renderNadi(t, o) {
  const L = $['w.nadi'];
  vis(L, o > 0.002); if (o <= 0.002) return;
  op(L, o);
  camLayer(L, camAt('nadi', t));
  tf($.nadi, 'translate(' + px(NW.x) + ',' + px(NW.y) + ') translate(-50%,-50%) scale(' + NW.s + ')');
  const late = t > 60;
  // prototype action (segment 5): "Buka Operasi ACD", activated at 24.10
  const op1 = late ? 0 : seg(t, T.e.open[0], T.e.open[1], E.inOutCubic);
  css($['na.open'], 'height', op1 >= 1 ? 'auto' : px(M.na.openH * op1));
  op($['na.openIn'], late ? 0 : seg(t, T.e.open[0] + 0.2, T.e.open[1]));
  cls($['na.openBtn'], 'hl', !late && t >= T.e.cursor[1] && t < T.e.click);
  cls($['na.openBtn'], 'press', !late && t >= T.e.click - 0.02 && t < T.e.click + 0.05);
  cls($['na.openBtn'], 'done', !late && t >= T.e.click + 0.05);
  txt($['na.openText'], !late && t >= T.e.click + 0.05 ? 'Membuka e-ACD…' : 'Buka Operasi ACD');
  // e-ACD summary (segment 12)
  const ex = late ? seg(t, T.l.expand[0], T.l.expand[1], E.inOutCubic) : 0;
  // V9: the follow-up list's space is part of the expanded section from the start, so nothing moves when it appears
  css($['na.proto'], 'height', late ? px(protoHeight(t, ex)) : '0px');
  op($['na.protoIn'], late ? seg(t, T.l.expand[0] + 0.2, T.l.expand[1]) : 0);
  css($['na.cardScroll'], 'top', px(-cardScroll(t)));
  // V9: each highlight runs once — a 0.3 s fade-in on its beat, then held to the end of the scene (V8 switched
  // the 12-card highlight on, off and on again, and both switched in a single frame)
  kpiGlow($['na.kLeft'], late ? seg(t, T.l.n6, T.l.n6 + 0.3, E.outCubic) : 0, 'left');
  kpiGlow($['na.kLocked'], late ? seg(t, T.l.hl12[0], T.l.hl12[0] + 0.3, E.outCubic) : 0, 'warn');
  // V9: the list fades in over its reserved space (V8 grew its height by 252 px in 0.25 s and pushed the panel)
  const pl = late ? seg(t, T.l.planned[0], T.l.planned[1] + 0.25, E.outCubic) : 0;
  css($['na.plannedWrap'], 'height', late ? 'auto' : '0px');
  op($['na.planned'], pl);   // V9: fades in place (the 8 px slide rendered as one-pixel steps in the MP4)
  op($['na.recheck'], late ? seg(t, T.l.recheck, T.l.recheck + 0.3) : 0);
  cls($['na.decBtn'], 'press', late && t >= T.l.click - 0.02 && t < T.l.click + 0.14);
  cls($['na.decBtn'], 'done', late && t >= T.l.planned[0]);
  const L5 = T.l;
  for (let i = 0; i < 6; i++) {
    const p = FOLLOW_POS[i], tf0 = L5.marks + i * 0.12, a = late ? seg(t, tf0, tf0 + 0.45, E.outBack) : 0;
    // planned: teal, numbered in route order
    attr(MAP.fu[i], 'opacity', String(r2(late ? seg(t, tf0, tf0 + 0.12) : 0)));
    attr(MAP.fu[i], 'transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') scale(' + r5(Math.max(0.01, a)) + ')');
    // not yet visited: red, pulsing, until the plan replaces it
    const tr0 = L5.red[0] + i * 0.3, ar = late ? seg(t, tr0, tr0 + 0.35, E.outBack) : 0, gone = late ? seg(t, tf0, tf0 + 0.2) : 0;
    attr(MAP.rd[i], 'opacity', String(r2(late ? seg(t, tr0, tr0 + 0.1) * (1 - gone) : 0)));
    attr(MAP.rd[i], 'transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') scale(' + r5(Math.max(0.01, ar)) + ')');
    const pp = late && t >= tr0 ? ((t - tr0) % 1.2) / 1.2 : 0;
    attr(MAP.rdPulse[i], 'r', String(r2(10 + 13 * pp))); attr(MAP.rdPulse[i], 'fill-opacity', String(r2(0.38 * (1 - pp))));
  }
  for (let i = 0; i < LOCKED_POS.length; i++) {
    const p = LOCKED_POS[i], t0 = L5.amber[0] + i * 0.15, a = late ? seg(t, t0, t0 + 0.3, E.outBack) : 0;
    attr(MAP.lk[i], 'opacity', String(r2(late ? seg(t, t0, t0 + 0.08) : 0)));
    attr(MAP.lk[i], 'transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') scale(' + r5(Math.max(0.01, a)) + ')');
    const rt0 = L5.rings[0] + i * ((L5.rings[1] - L5.rings[0]) / LOCKED_POS.length);
    attr(MAP.lkRing[i], 'opacity', String(r2(late ? seg(t, rt0, rt0 + 0.15) : 0)));
  }
  // the planned route is drawn, then its dashes march; a dot travels it for the team's follow-up visits
  const rdw = late ? seg(t, L5.route[0], L5.route[1], E.inOutCubic) : 0;
  attr(MAP.routeDraw, 'stroke-dashoffset', String(r2(1 - rdw)));
  attr(MAP.routeDraw, 'opacity', rdw >= 1 ? '0' : '1');
  attr(MAP.routeDash, 'opacity', rdw >= 1 ? '1' : '0');
  attr(MAP.routeDash, 'stroke-dashoffset', String(r2(-((t * 14) % 13))));
  attr(MAP.dot, 'opacity', String(r2(late ? win(t, L5.dot[0] - 0.25, L5.dot[0], L5.out[0], L5.out[0] + 0.2) : 0)));
  const q = routePoint(late ? seg(t, L5.dot[0], L5.dot[1], E.inOutSine) : 0);
  attr(MAP.dot, 'transform', 'translate(' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) + ')');
  renderCursor(t);
}
function renderCursor(t) {
  const c = $['na.cursor'], rip = $['na.ripple'];
  let ev = null;
  for (const e of NCUR) if (t >= e.t0 - 0.3 && t <= e.out[1]) ev = e;
  if (!ev) { op(c, 0); op(rip, 0); return; }
  const tg = ev.target(t), p = seg(t, ev.t0, ev.t1, E.inOutCubic);
  const x = lerp(ev.from[0], tg.x, p), y = lerp(ev.from[1], tg.y, p);
  op(c, Math.min(seg(t, ev.t0 - 0.3, ev.t0, E.outCubic), 1 - seg(t, ev.out[0], ev.out[1], E.inCubic)));
  const press = 1 - 0.12 * win(t, ev.click - 0.06, ev.click, ev.click + 0.02, ev.click + 0.12, E.outQuad, E.inQuad);
  tf(c, 'translate(' + px(x) + ',' + px(y) + ') scale(' + r5(press) + ')');
  const rp = seg(t, ev.click, ev.click + 0.5, E.outCubic);
  op(rip, t >= ev.click ? 0.8 * (1 - rp) : 0); tf(rip, 'scale(' + r5(lerp(0.4, 2.2, rp)) + ')');
}

/* ---------------------------------------------------------------- e-ACD dashboards */
function setSync(prefix, t, states) {
  const s = step(t, states);
  txt($[prefix + 'syncText'], s[0]);
  css($[prefix + 'syncDot'], 'background-color', s[1] ? '#fbbf24' : '#34d399');
}
function renderDash(p, t, teams) {
  const tot = computeTotals(teams);
  txt($[p + 'kpiPct'], tot.pct + '%');
  txt($[p + 'kpiRatio'], '(' + tot.visited + ' / ' + tot.locality + ' premis)');
  const ok = tot.locality > 0 && tot.pct >= TARGET_PCT;
  css($[p + 'kpiBar'], 'width', Math.min(100, tot.pct) + '%');
  css($[p + 'kpiBar'], 'background-color', ok ? '#34d399' : '#fbbf24');
  // in-app badge states, as in the e-ACD source and the 90-second film
  const badge = $[p + 'kpiBadge'];
  if (tot.locality === 0) { txt(badge, 'Sasaran ≥ 80%'); css(badge, 'background-color', '#0f766e'); css(badge, 'color', '#ccfbf1'); }
  else if (ok) { txt(badge, 'Capai Sasaran (≥80%)'); css(badge, 'background-color', '#34d399'); css(badge, 'color', '#020617'); }
  else { txt(badge, 'Sedang Berjalan (<80%)'); css(badge, 'background-color', '#fbbf24'); css(badge, 'color', '#020617'); }
  const pop = t >= T_TARGET_CROSS ? win(t, T_TARGET_CROSS, T_TARGET_CROSS + 0.12, T_TARGET_CROSS + 0.2, T_TARGET_CROSS + 0.6, E.outQuad, E.inOutSine) : 0;
  tf(badge, 'scale(' + r5(1 + 0.22 * pop) + ')');
  op($[p + 'targetMark'], seg(t, T.j.mark[0], T.j.mark[1]));
  txt($[p + 'kpiTeams'], tot.activeTeams + '/6 Pasukan Aktif');
  txt($[p + 'mLoc'], String(tot.locality)); txt($[p + 'mVis'], String(tot.visited)); txt($[p + 'mLock'], String(tot.locked));
  txt($[p + 'mPop'], String(tot.pop)); txt($[p + 'mSymp'], String(tot.symp)); txt($[p + 'mRef'], String(tot.ref));
  txt($[p + 'mSample'], tot.sample + ' sampel');
  return tot;
}

/* ---------------------------------------------------------------- 6–8, 10–11 · phone */
function renderPhone(t, o) {
  const L = $['w.phone'];
  vis(L, o > 0.002); if (o <= 0.002) return;
  op(L, o);
  camLayer(L, camAt('phone', t));
  const pk = kf(t, PHONE_KEYS);
  placeDevice($.phone, pk);
  css($['ph.glass'], 'background-position', r2(46 - pk.ry * 2.2) + '% 0');
  op($['ph.splash'], win(t, T.f.splash[0], T.f.splash[1], T.f.splash[2], T.f.splash[3], E.lin, E.inOutCubic));
  const v = phView(t);
  // V6: borang → dashboard is an in-app slide (both views drawn side by side), not a one-frame swap;
  // the tab highlights on the tap, before the content moves
  const sl = T.j.slide, sliding = t >= sl[0] && t < sl[1], sp = seg(t, sl[0], sl[1], E.inOutCubic);
  const nav = t >= T.j.tapDash + 0.05 && t < T.j.view ? 'dash' : v;
  for (const k in PH_VIEWS) {
    const el = $[PH_VIEWS[k]], inSlide = sliding && (k === 'borang' || k === 'dash');
    vis(el, sliding ? inSlide : k === v);
    cls($[PH_NAV[k]], 'on', k === nav);
    css(el, 'position', inSlide ? 'absolute' : '');
    css(el, 'left', inSlide ? '0px' : ''); css(el, 'top', inSlide ? '0px' : ''); css(el, 'width', inSlide ? '100%' : '');
    tf(el, inSlide ? 'translate(' + r2((k === 'borang' ? -sp : 1 - sp) * 100) + '%,' + px(-phScrollFor(k, t)) + ')' : 'none');
  }
  tf($['ph.scroll'], 'translateY(' + px(sliding ? 0 : -phScroll(t)) + ')');
  // sync badge: saved locally first, "Sheet Diselaraskan" once the simulated write completes
  setSync('ph.', t, [[0, ['Sistem Aktif', 0]], [T.h.saved + 0.05, ['Menyimpan ke Sheet...', 1]], [T.i.synced, ['Sheet Diselaraskan', 0]]]);
  if (v === 'dash' || sliding) renderDash('ph.', t, teamsDash(t));
  if (v === 'borang' || sliding) renderBorang(t);
  if (v === 'pasukan') renderPasukan(t);
  const toasts = [
    [T.h.saved, T.h.saved + 2.8, 'Rekod rumah disimpan & ditambah ke Pasukan ' + HOUSE_DEMO.team],
    [T.k.tapVerify + 0.05, T.k.tapVerify + 2.3, 'Pengesahan Bahagian D telah direkodkan']
  ];
  let ta = 0, tt = '';
  for (const [a, b, s] of toasts) { const w = win(t, a, a + 0.18, b - 0.2, b); if (w > ta) { ta = w; tt = s; } }
  op($['ph.toast'], ta); tf($['ph.toast'], 'translateY(' + px(12 * (1 - ta)) + ')'); if (tt) txt($['ph.toastText'], tt);
  const st = touchState(TAPS, t, tp => phRefScreen(tp.ref, t, tp.ax, tp.ay));
  renderTouch($['ph.touch'], $['ph.ripple'], st);
}
function renderBorang(t) {
  const F = T.f, S = T.g;
  txt($['ph.teamSelText'], t < F.pickTeam ? 'Pasukan 2' : 'Pasukan ' + HOUSE_DEMO.team);
  const dd = win(t, F.tapTeam + 0.05, F.tapTeam + 0.18, F.pickTeam + 0.08, F.pickTeam + 0.22);
  op($['ph.teamDrop'], dd); tf($['ph.teamDrop'], 'scaleY(' + r2(lerp(0.9, 1, dd)) + ')');
  for (let k = 1; k <= 6; k++) cls($['ph.dd' + k], 'on', t < F.pickTeam - 0.06 ? k === 2 : k === 1);
  cls($['ph.teamSel'], 'focus-ring', t >= F.tapTeam && t < F.pickTeam + 0.3);
  const addr = t < T.h.saved ? typed(t, 0) : '';
  txt($['ph.addr'], addr); vis($['ph.addrPh'], addr.length === 0);
  const focused = t >= F.tapAddr && t < S.tapStatus - 0.1;
  op($['ph.addrCaret'], focused && (t < F.type[1] || Math.floor(t * 2.4) % 2 === 0) ? 1 : 0);
  cls($['ph.addrBox'], 'focus-ring', focused);
  // status: the previous record left "2 - Berkunci" selected (not reset by the source)
  for (const s of STATUS_CODES) cls($['ph.pill' + s.code], 'on', t < S.tapStatus ? s.code === '2' : s.code === HOUSE_DEMO.status);
  cls($['ph.pills'], 'hl', t >= S.hlStatus[0] && t < S.hlStatus[1]);
  cls($['ph.occWrap'], 'hl', t >= S.hlOcc[0] && t < S.hlOcc[1]);
  const occ = t < S.tapStatus ? 0 : 1 + S.occ.filter(x => t >= x).length;
  txt($['ph.occ'], String(occ));
  // Bahagian B — "Ada Kes" sets 1 symptomatic, 1 referral and "Rujuk Klinik Kesihatan" (source)
  const tog = symOpen(t);
  cls($['ph.toggle'], 'on', tog); txt($['ph.toggleLbl'], tog ? 'Ada Kes' : 'Tiada');
  css($['ph.symBox'], 'height', px(symH(t)));
  const chipOn = [S.chips[0], S.chips[1]];
  for (let i = 0; i < 8; i++) cls($['ph.chip' + i], 'on', chipOn[i] != null && t >= chipOn[i] && t < T.h.saved);
  txt($['ph.sympCnt'], tog ? String(HOUSE_DEMO.symptomCount) : '0');
  txt($['ph.refCnt'], tog ? String(HOUSE_DEMO.referredCount) : '0');
  txt($['ph.sampleCnt'], '0');
  cls($['ph.sympWrap'], 'hl-rose', t >= S.hlSymp && t < S.hlRef);
  cls($['ph.refWrap'], 'hl-purple', t >= S.hlRef && t < S.toC[0]);
  // Bahagian C
  cls($['ph.cb0'], 'on', t >= S.cb0 && t < T.h.saved);
  cls($['ph.cb1'], 'on', t >= S.cb1 && t < T.h.saved);
  cls($['ph.cb2'], 'on', t >= S.tapStatus);
  cls($['ph.cRow0'], 'hl-rose', t >= S.cb0 - 0.05 && t < S.cb1 - 0.05);
  cls($['ph.cRow1'], 'hl-emerald', t >= S.cb1 - 0.05 && t < S.hlRis);
  cls($['ph.cRow2'], 'hl-emerald', t >= S.hlRis && t < S.hlAct);
  txt($['ph.actionText'], t < S.tapStatus ? 'Notis / Kad Lawatan Ditinggalkan' : t < S.toggle ? 'Pendidikan Kesihatan' : HOUSE_DEMO.fieldAction);
  cls($['ph.action'], 'hl', t >= S.hlAct && t < S.hlSave);
  cls($['ph.saveBtn'], 'hl', t >= S.hlSave && t < T.h.save);
  cls($['ph.saveBtn'], 'press', t >= T.h.save - 0.02 && t < T.h.save + 0.16);
  vis($['ph.lampRow'], t >= T.h.saved); vis($['ph.lampEmpty'], t < T.h.saved);
  cls($['ph.lampRow'], 'fresh', t >= T.h.saved);
  txt($['ph.lampSub'], 'Memaparkan ' + (t >= T.h.saved ? 1 : 0) + ' rekod rumah dalam Lampiran 1.');
}
function renderPasukan(t) {
  const K = T.k, name = typed(t, 1);
  txt($['ph.vName'], name); vis($['ph.vNamePh'], name.length === 0);
  op($['ph.vCaret'], t >= K.tapName && t < K.tapVerify - 0.1 && (t < K.type[1] || Math.floor(t * 2.4) % 2 === 0) ? 1 : 0);
  cls($['ph.vNameBox'], 'focus-ring', t >= K.tapName && t < K.tapVerify - 0.1);
  const verified = t >= K.tapVerify;
  html($['ph.vStatus'], verified
    ? 'Status: <span class="font-bold text-emerald-700">Telah Disahkan oleh ' + esc(VERIFICATION.officerName) + ' (' + esc(VERIFICATION.officerRole) + ') pada ' + esc(VERIFICATION.date) + '</span>'
    : 'Status: <span class="font-bold text-amber-700">Belum Disahkan</span>');
  cls($['ph.vBtn'], 'press', t >= K.tapVerify - 0.02 && t < K.tapVerify + 0.16);
  cls($['ph.secD'], 'hl-emerald', verified);
}

/* ---------------------------------------------------------------- 9 · Apps Script → Sheets (one way) */
const SH_KEYS = ['locality', 'visited', 'locked', 'pop', 'symp', 'ref'];
function renderSync(t, o) {
  const L = $['w.sync'];
  vis(L, o > 0.002); if (o <= 0.002) { op($['ov.flow'], 0); return; }
  op(L, o);
  camLayer(L, ID);
  const a = seg(t, T.i.actorsIn[0], T.i.actorsIn[1] + 0.3, E.springSoft);
  placeDevice($.gas, { x: I_GAS.x, y: I_GAS.y + 30 * (1 - a), s: I_GAS.s, rx: 0, ry: 0 });
  placeDevice($.sheet, { x: I_SHEET.x + 260 * (1 - a), y: I_SHEET.y, s: I_SHEET.s, rx: 0, ry: I_SHEET.ry });
  cls($['gas.save'], 'active', t >= T.i.dots1[1] - 0.1 && t < T.i.write + 0.1);
  // C8:H13 written by setValues(): the pre-save matrix, then the post-save matrix (only Pasukan 1 changes);
  // Jumlah (I8:I13) and row 14 (%) are sheet formulas
  const after = t >= T.i.write, teams = after ? TEAMS : TEAMS_BEFORE, tot = computeTotals(teams);
  for (let k = 1; k <= 6; k++) {
    for (let r = 0; r < 7; r++) {
      const c = $['sh.c' + r + '_' + k], v = r < 6 ? String(teams[k][SH_KEYS[r]]) : calcTeamPct(teams[k]) + '%';
      txt(c.firstChild, v);
      const changed = r < 6 ? TEAMS[k][SH_KEYS[r]] !== TEAMS_BEFORE[k][SH_KEYS[r]] : calcTeamPct(TEAMS[k]) !== calcTeamPct(TEAMS_BEFORE[k]);
      const f = after && changed ? 1 - seg(t, T.i.write, T.i.write + 1.2, E.outQuad) : 0;
      css(c, 'background-color', f > 0.001 ? 'rgba(167,243,208,' + r2(0.25 + 0.75 * f) + ')' : (after && changed ? 'rgba(167,243,208,.25)' : 'transparent'));
    }
  }
  for (let r = 0; r < 7; r++) txt($['sh.tot' + r].firstChild, r < 6 ? String(tot[SH_KEYS[r]]) : tot.pct + '%');
  const sel = $['sh.sel'];
  op(sel, seg(t, T.i.write - 0.15, T.i.write + 0.05));
  css(sel, 'left', px(M.shSel.x)); css(sel, 'top', px(M.shSel.y)); css(sel, 'width', px(M.shSel.w)); css(sel, 'height', px(M.shSel.h));
  // one set of data dots, one way
  op($['ov.flow'], o * seg(t, T.i.line[0], T.i.line[1]));
  FLOW.pk.forEach((el, i) => {
    const pi = i < 5 ? 0 : 1, t0 = (pi ? T.i.dots2[0] : T.i.dots1[0]) + (i % 5) * 0.11, q = seg(t, t0, t0 + 0.5, E.inOutCubic);
    const live = t >= t0 && t <= t0 + 0.5;
    attr(el, 'opacity', live ? '1' : '0');
    if (!live) return;
    const pt = FLOW.paths[pi].getPointAtLength(FLOW.lens[pi] * q);
    attr(el, 'cx', pt.x.toFixed(1)); attr(el, 'cy', pt.y.toFixed(1));
  });
  for (const p of FLOW.paths) attr(p, 'stroke-dashoffset', String(-((t * 60) % 20)));
}

/* ---------------------------------------------------------------- 10 · monitor */
function barPath(x, y, w, h, r) {
  if (h <= 0.01) return '';
  r = Math.min(r, w / 2, h);
  return 'M' + x.toFixed(2) + ' ' + (y + h).toFixed(2) + 'V' + (y + r).toFixed(2) + 'Q' + x.toFixed(2) + ' ' + y.toFixed(2) + ' ' + (x + r).toFixed(2) + ' ' + y.toFixed(2) +
    'H' + (x + w - r).toFixed(2) + 'Q' + (x + w).toFixed(2) + ' ' + y.toFixed(2) + ' ' + (x + w).toFixed(2) + ' ' + (y + r).toFixed(2) + 'V' + (y + h).toFixed(2) + 'Z';
}
function arcPath(cx, cy, Rr, r, a0, a1) {
  if (a1 - a0 < 0.0005) return '';
  if (a1 - a0 >= Math.PI * 2 - 1e-4) a1 = a0 + Math.PI * 2 - 1e-4;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const p = (rad, a) => (cx + Math.cos(a) * rad).toFixed(2) + ' ' + (cy + Math.sin(a) * rad).toFixed(2);
  return 'M' + p(Rr, a0) + 'A' + Rr + ' ' + Rr + ' 0 ' + large + ' 1 ' + p(Rr, a1) + 'L' + p(r, a1) + 'A' + r + ' ' + r + ' 0 ' + large + ' 0 ' + p(r, a0) + 'Z';
}
function renderDesktop(t, o) {
  const L = $['w.desk'];
  vis(L, o > 0.002); if (o <= 0.002) return;
  op(L, o);
  camLayer(L, camAt('desk', t));
  placeDevice($.desktop, kf(t, DESK_KEYS));
  tf($['dk.scroll'], 'translateY(0px)');
  setSync('dk.', t, [[0, ['Sheet Diselaraskan', 0]]]);
  // the charts follow the same count-up as the figures (secondary to the coverage card)
  const teams = teamsDash(t), tot = renderDash('dk.', t, teams);
  const [pl, pt, pw, ph, maxY] = M.bar;
  for (let k = 1; k <= 6; k++) {
    const vals = [teams[k].locality, teams[k].visited, teams[k].locked];
    for (let j = 0; j < 3; j++) {
      const el = $['dk.bar' + k + '_' + j], x = +el.dataset.x, w = +el.dataset.w, h = (vals[j] / maxY) * ph;
      attr(el, 'd', barPath(x, pt + ph - h, w, h, 6));
    }
  }
  const [cx, cy, Rr, r] = M.donut, dData = [tot.visited, tot.locked, tot.unvisited], sum = dData.reduce((a, b) => a + b, 0);
  let a0 = -Math.PI / 2;
  for (let i = 0; i < 3; i++) { const a1 = sum > 0 ? a0 + (dData[i] / sum) * Math.PI * 2 : a0; attr($['dk.arc' + i], 'd', arcPath(cx, cy, Rr, r, a0, a1)); a0 = a1; }
}

/* ---------------------------------------------------------------- overlays (screen space) */
const TEAM_PCT = [1, 2, 3, 4, 5, 6].map(t => calcTeamPct(TEAMS[t]));   // 85 83 84 82 83 83
const OT_BAR_H = 84;                                                    // px for 100% (full scale, no truncated axis)
function ovWin(el, t, w4, ein) { const w = win(t, w4[0], w4[1], w4[2], w4[3], ein || E.outCubic, E.inCubic); op(el, w); return w; }
function renderOverlays(t) {
  op($['ov.dip'], Math.max(1 - seg(t, 0, 0.5, E.inOutSine), 0.6 * win(t, T.k.cut - 0.15, T.k.cut, T.k.cut, T.k.cut + 0.2, E.inQuad, E.outQuad)));
  let sw = 0, sv = SYS[0];
  for (const s of SYS) { const w = win(t, s[0], s[0] + 0.3, s[1] - 0.3, s[1]); if (w > sw) { sw = w; sv = s; } }
  op($['ov.sys'], sw); txt($['ov.sysName'], sv[2]); txt($['ov.sysView'], sv[3]);
  tf($['ov.sys'], 'translate(64px,40px)');
  op($['ov.scrim'], win(t, T.l.left[0] - 0.2, T.l.left[1], T.l.left[2], T.l.left[3] + 0.2));
  // 4 · title. V9 (draft 3): it rises out of the dissolving manual scene in one continuous move on the film clock — no
  // pre-roll on black, no single-frame jump at the impact (13.35) — fully in on the beat and settled by 13.8; a soft
  // glow marks the beat instead of the old one-frame flash.
  const D = T.d, ti = $['ov.title'], fiT = filmTime(D.impact), ftT = filmTime(t);
  op(ti, seg(ftT, fiT - 0.45, fiT - 0.02, E.inOutSine) * (1 - seg(t, D.out[0], D.out[1], E.inOutSine)));
  const sc = lerp(1.045, 1, seg(ftT, fiT - 0.32, filmTime(D.settle), E.outCubic));
  tf(ti, 'translate(0px,' + px(330) + ') translate(960px,0) scale(' + r5(sc) + ') translate(-960px,0)');
  TITLE.forEach((el, i) => { const t0 = fiT - 0.3 + i * 0.08, a = seg(ftT, t0, t0 + 0.45 + i * 0.05, E.outCubic); op(el, a); tf(el, 'translateY(' + px(14 * (1 - a)) + ')'); });
  op($['ov.bloom'], 0.35 * Math.min(seg(ftT, fiT - 0.06, fiT + 0.02, E.outQuad), 1 - seg(ftT, fiT + 0.02, fiT + 0.85, E.outCubic)));
  // V9 (draft 3): the light sweeps over "NADI Muallim" from 0.5 s into the line "Inilah NADI Muallim" (1.1 s, left to right)
  const sheenP = seg(ftT, NARR_CAPTIONS.n1[0] + 0.5, NARR_CAPTIONS.n1[0] + 1.6, E.inOutSine);
  css($['ov.sheen'], 'background-position', r2(120 - 140 * sheenP) + '% 0');
  // 6 · one phone
  const w1 = ovWin($['ov.one'], t, T.f.one);
  tf($['ov.one'], 'translate(130px,' + px(370 + 22 * (1 - w1)) + ')');
  // V9 · two officers of Pasukan 1, each on their own phone and premise (with "Setiap petugas boleh merekod…")
  const w2 = ovWin($['ov.team2'], t, T.f.team2);
  tf($['ov.team2'], 'translate(130px,' + px(612 + 18 * (1 - w2)) + ')');
  [0, 1].forEach(i => { const a = seg(t, T.f.team2[0] + 0.15 + i * 0.4, T.f.team2[0] + 0.6 + i * 0.4, E.outCubic); op($['ov.t2c' + i], a); tf($['ov.t2c' + i], 'translateY(' + px(12 * (1 - a)) + ')'); });
  // 7–8 · the record, then saved (≥ 4 s) with the automatic count
  const G = T.g;
  const rw = ovWin($['ov.rec'], t, G.recWin);
  tf($['ov.rec'], 'translate(100px,' + px(170 + 16 * (1 - rw)) + ')');
  for (let i = 0; i < 5; i++) {
    const filled = t >= G.rec[i], a = seg(t, G.rec[i], G.rec[i] + 0.35, E.outCubic);
    cls($['ov.rl' + i], 'pending', !filled);
    vis($['ov.rlp' + i], !filled); vis($['ov.rlv' + i], filled);
    op($['ov.rl' + i], filled ? lerp(0.4, 1, a) : 0.4);
    tf($['ov.rlv' + i], 'translateX(' + px(-14 * (1 - a)) + ')');
    cls($['ov.rl' + i], 'fresh', filled && t < Math.min(G.rec[i] + 1.8, i < 4 ? G.rec[i + 1] : 1e9) && t < T.h.saved);
  }
  op($['ov.recSaved'], seg(t, T.h.saved, T.h.saved + 0.25));
  const sv2 = ovWin($['ov.saved'], t, T.h.savedWin, E.outBack);
  tf($['ov.saved'], 'translate(100px,' + px(170 + M.recH + 20 + 14 * (1 - sv2)) + ')');
  txt($['ov.savedCount'], t < T.h.count ? '16 / 19' : '17 / 20');
  tf($['ov.savedCount'], 'scale(' + r5(1 + 0.18 * win(t, T.h.count, T.h.count + 0.12, T.h.count + 0.2, T.h.count + 0.5)) + ')');
  // 9 · sync line
  const sy = ovWin($['ov.sync'], t, T.i.line);
  tf($['ov.sync'], 'translate(' + px(960 - M.syncW / 2) + ',' + px(70 + 14 * (1 - sy)) + ')');
  // 10 · coverage, held together through the 84% line
  const rs = ovWin($['ov.res'], t, T.j.res);
  tf($['ov.res'], 'translate(' + px(1170 + 30 * (1 - rs)) + ',' + px(225) + ')');
  const cp = ovWin($['ov.capai'], t, [T.j.capai, T.j.capai + 0.45, T.j.res[2], T.j.res[3]], E.outBack);
  tf($['ov.capai'], 'translate(' + px(1170) + ',' + px(225 + M.resH + 26) + ') scale(' + r5(lerp(0.85, 1, cp)) + ')');
  ovWin($['ov.formula'], t, [T.j.formula, T.j.formula + 0.4, T.j.res[2], T.j.res[3]]);
  tf($['ov.formula'], 'translate(' + px(1170) + ',' + px(225 + M.resH + 26 + 100) + ')');
  // V7: coverage of each team against the KKM line (full 0–100% scale), then a light across the pill
  const J = T.j, tw = ovWin($['ov.teams'], t, [J.teams[0], J.teams[1], J.res[2], J.res[3]]);
  tf($['ov.teams'], 'translate(' + px(1170) + ',' + px(225 + M.resH + 26 + 166 + 14 * (1 - tw)) + ')');
  tf($['ov.tline'], 'scaleX(' + r5(seg(t, J.tline[0], J.tline[1], E.inOutCubic)) + ')');
  for (let i = 0; i < 6; i++) {
    const t0 = J.tbar + 0.2 * i, g = seg(t, t0, t0 + 0.6, E.outCubic);
    css($['ov.tb' + i], 'height', px(OT_BAR_H * TEAM_PCT[i] / 100 * g));
    op($['ov.tv' + i], seg(t, t0 + 0.4, t0 + 0.65));
  }
  const sh = seg(t, J.shine[0], J.shine[1], E.inOutSine);
  op($['ov.capaiShine'], t > J.shine[0] && t < J.shine[1] ? 0.85 : 0);
  tf($['ov.capaiShine'], 'translateX(' + r2(-140 + 380 * sh) + '%) skewX(-18deg)');
  // 11 · confirmation + share-ready summary
  const vw = ovWin($['ov.ver'], t, T.k.ver, E.outBack);
  tf($['ov.ver'], 'translate(100px,' + px(190 + 12 * (1 - vw)) + ')');
  const sm = ovWin($['ov.summary'], t, T.k.summary);
  tf($['ov.summary'], 'translate(100px,' + px(345 + 14 * (1 - sm)) + ')');
  // 12 · follow-up
  // V5: question → 110 → 92 / 12 / 6 → plan the 6, re-check the 12
  const L5 = T.l, lw = ovWin($['ov.left'], t, L5.left);
  tf($['ov.left'], 'translate(60px,' + px(112 + 14 * (1 - lw)) + ')');
  const pop = (ref, t0) => { const a = seg(t, t0, t0 + 0.45, E.outBack); op($[ref], seg(t, t0, t0 + 0.15)); tf($[ref], 'scale(' + r5(lerp(0.85, 1, a)) + ')'); };
  const fq = seg(t, L5.q, L5.q + 0.35, E.outCubic);
  op($['ov.fq'], fq); tf($['ov.fq'], 'translateY(' + px(12 * (1 - fq)) + ')');
  pop('ov.f110', L5.n110); pop('ov.f92', L5.n92); pop('ov.lf12', L5.n12); pop('ov.f6', L5.n6); pop('ov.dec', L5.plan[1]); pop('ov.recheck', L5.check[1]);
  for (let i = 0; i < 3; i++) attr($['ov.fl' + i], 'stroke-dashoffset', String(r2(1 - seg(t, L5.branch[0] + i * 0.08, L5.branch[1] + i * 0.08, E.inOutCubic))));
  attr($['ov.fl4'], 'stroke-dashoffset', String(r2(1 - seg(t, L5.plan[0], L5.plan[1], E.inOutCubic))));
  attr($['ov.fl3'], 'stroke-dashoffset', String(r2(1 - seg(t, L5.check[0], L5.check[1], E.inOutCubic))));
  // V9: one fade in and one fade out per beat (6: the red premises; 12: "12 direkodkan…" and the recheck of "premis yang selebihnya")
  fuGlow($['ov.f6'], win(t, L5.red[0], L5.red[0] + 0.3, L5.marks - 0.3, L5.marks, E.outCubic, E.inOutSine), 'bad');
  fuGlow($['ov.lf12'], Math.max(win(t, L5.hl12[0], L5.hl12[0] + 0.3, L5.hl12[1] - 0.3, L5.hl12[1], E.outCubic, E.inOutSine),
    win(t, L5.check[1], L5.check[1] + 0.3, L5.check[1] + 1.3, L5.check[1] + 1.6, E.outCubic, E.inOutSine)), 'warn');
  // 13 · benefit cards: V9 orbit, one card in focus per phrase (renderBenefits)
  renderBenefits(t);
  // 14 · closing, fully in by 113.2, held to the last frame
  const cl = $['ov.closing'];
  op(cl, seg(t, T.n.title - 0.05, T.n.title + 0.1)); tf(cl, 'translate(0px,210px)');
  CLOSING.forEach((el, i) => {
    const t0 = T.n.title + [0, 0.08, 0.18, 0.26, 0.34][i], a = seg(t, t0, t0 + 0.4, E.outCubic);
    op(el, a); tf(el, 'translateY(' + px(20 * (1 - a)) + ')' + (i === 0 ? ' scale(' + r5(lerp(0.88, 1, seg(t, t0, t0 + 0.5, E.springSoft))) + ')' : ''));
  });
}

/* ---------------------------------------------------------------- V9 · benefit cards on an orbit
 * After the reference (a Three.js promo: app icons orbiting a floating panel that is then brought into focus): the four
 * cards float on a slow elliptical orbit around the centre of the frame, counter-clockwise on screen. At the back (top)
 * a card is smaller, dimmer and softly blurred; in front (bottom) it is larger; each one bobs a little and turns its
 * face towards the centre. On its phrase in the narration (BENEFIT_BEATS) a card leaves the orbit 0.2 s before the
 * words and reaches the centre in 0.55 s at full size with a soft glow, while the previous card returns to its moving
 * place on the orbit. The card in focus holds still at whole-pixel position and scale 1, so its text stays sharp.
 * Card 1 lifts out as the scene opens. Everything runs on the film clock. */
const BF = { cx: 960, cy: 540, rx: 680, ry: 330, sBack: 0.42, sFront: 0.62, w: 600, h: 360, period: 18, th0: 112, lead: 0.2, move: 0.55 };
function benefitOrbit(i, ft) {
  const th = (BF.th0 + i * 90 - 360 * (ft - SCENES[8].start) / BF.period) * Math.PI / 180;   // decreasing angle: counter-clockwise on screen
  return { x: BF.cx + BF.rx * Math.cos(th), y: BF.cy + BF.ry * Math.sin(th), d: (Math.sin(th) + 1) / 2, c: Math.cos(th) };
}
function benefitFocus(i, ft) {
  const start = k => (k === 0 ? SCENES[8].start + 0.1 : BENEFIT_BEATS[k] - BF.lead);
  const rise = seg(ft, start(i), start(i) + BF.move, E.inOutCubic);
  const fall = i < 3 ? seg(ft, start(i + 1), start(i + 1) + BF.move, E.inOutCubic) : 0;
  return { f: Math.min(rise, 1 - fall), rising: rise > 0 && rise < 1 };
}
function renderBenefits(t) {
  const ft = filmTime(t), s0 = SCENES[8].start, out = seg(t, T.m.out[0], T.m.out[1], E.inCubic);
  for (let i = 0; i < 4; i++) {
    const el = $['ov.bf' + i];
    if (ft < s0 - 0.05 || ft > SCENES[8].end + 0.05) { op(el, 0); continue; }
    const o = benefitOrbit(i, ft), { f, rising } = benefitFocus(i, ft), g = 1 - f;
    const app = i === 0 ? seg(ft, s0 + 0.05, s0 + 0.35, E.outCubic) : seg(ft, s0 + 0.08 * i, s0 + 0.08 * i + 0.4, E.outBack);
    const bob = 9 * Math.sin(2 * Math.PI * ft / 3.3 + 1.7 * i), rz = 2 * Math.sin(2 * Math.PI * ft / 4.2 + i);
    const s = lerp(BF.sBack + (BF.sFront - BF.sBack) * o.d, 1, f) * lerp(0.82, 1, app) * (1 - 0.04 * out);
    const x = lerp(o.x, BF.cx, f), y = lerp(o.y + bob, BF.cy, f);
    op(el, Math.min(app, 1 - out) * lerp(0.62 + 0.3 * o.d, 1, f));
    css(el, 'z-index', String(10 + Math.round(10 * o.d) + (f > 0 ? (rising ? 80 : 50) : 0)));   // orbit by depth; leaving card above; arriving card on top
    css(el, 'filter', g * (1 - o.d) > 0.02 ? 'blur(' + r2(2.4 * g * (1 - o.d)) + 'px)' : 'none');
    css(el, 'box-shadow', '0 30px 60px -20px rgba(0,0,0,.6)' + (f > 0.001 ? ', 0 0 0 ' + r2(2 * f) + 'px rgba(255,255,255,' + r5(0.75 * f) + '), 0 0 ' + r2(60 * f) + 'px rgba(94,234,212,' + r5(0.35 * f) + ')' : ''));
    // in focus: a plain 2D translate at whole pixels and scale 1 (no 3D layer), so the text is drawn sharp
    tf(el, 'translate(' + px(x - BF.w / 2) + ',' + px(y - BF.h / 2) + ')' + (g > 0.0005 || out > 0 ? ' perspective(1400px) rotateY(' + r2(-24 * o.c * g) + 'deg) rotate(' + r2(rz * g) + 'deg) scale(' + r5(s) + ')' : ''));
  }
}

/* V9: the film carries no captions (removed at the user's request); CUES remain as narration timing data. */

/* ---------------------------------------------------------------- V6 · WhatsApp insert (2D)
 * u = film time − INSERT.atF (0 .. INSERT.len); the story clock is held at INSERT.at meanwhile.
 * One flat phone: the e-ACD "Salin Laporan (WhatsApp)" tap and its toast, an app switch, then the
 * copied report pasted into a team group chat (roles only) and sent; the camera then reads the
 * message up close. All local markup and simulated totals — no messaging service is involved. */
const WA = {
  ph: { x: 753, y: 40 },                            // phone top-left on the stage (identity camera)
  tapCopy: 0.9, toast: [1.05, 1.25, 2.2, 2.45], sw: [2.15, 2.75],
  press: 3.1, hold: 0.45, menu: [3.55, 3.7, 3.96, 4.08], tapPaste: 3.95, paste: [4.05, 4.4],
  tapSend: 4.95, send: [5.05, 5.33], bubble: [5.1, 5.55], zoomIn: [5.8, 7.1], pan: [7.5, 11.2],
  hl: [8.1, 8.5, 10.6, 11.0], read: 10.6, react: 11.2, zoomOut: [12.3, 13.5], sys: [0.3, 0.7, 13.6, 14.0]
};
const WA_TAPS = [
  { t: WA.tapCopy, ref: 'wa.btnWa' },
  { t: WA.press, ref: 'wa.input', hold: WA.hold, ax: 0.3 },
  { t: WA.tapPaste, ref: 'wa.menuPaste' },
  { t: WA.tapSend, ref: 'wa.send' }
];
const WA_CAM = [];
function measureWa() {
  const L = $.wa, scr = $['wa.screen'];
  L.style.display = 'block';
  M.wa = {};
  for (const r of ['wa.btnWa', 'wa.input', 'wa.send', 'wa.bubble']) M.wa[r] = offsetWithin($[r], scr);
  M.wa['wa.menuPaste'] = offsetWithin($['wa.menu'].firstElementChild, scr);
  M.wa.bubbleH = $['wa.bubble'].offsetHeight;
  M.wa.pasteH = $['wa.paste'].scrollHeight;
  const pct = offsetWithin($['wa.pct'], $['wa.chat']);
  css($['wa.hl'], 'left', px(pct.x - 5)); css($['wa.hl'], 'top', px(pct.y - 2));
  css($['wa.hl'], 'width', px(pct.w + 10)); css($['wa.hl'], 'height', px(pct.h + 4));
  L.style.display = '';
  // cameras (stage point fx, fy shown at sx, sy with zoom z)
  const S = { x: WA.ph.x + 12, y: WA.ph.y + 12 }, btn = M.wa['wa.btnWa'], b = M.wa['wa.bubble'];
  const bx = S.x + b.x + b.w / 2, by = S.y + b.y;
  const CA = { sx: 960, sy: 450, fx: S.x + 195, fy: S.y + btn.y + btn.h / 2 + 24, z: 1.3 };
  const C1 = { sx: 960, sy: 473, fx: 960, fy: 473, z: 1 };
  const CZ1 = { sx: 960, sy: 430, fx: bx, fy: by + b.h * 0.32, z: 1.62 };
  const CZ2 = { sx: 960, sy: 430, fx: bx, fy: by + b.h * 0.68, z: 1.62 };
  const CZo = { sx: 960, sy: 470, fx: bx, fy: by + b.h * 0.6, z: 1.3 };
  WA_CAM.length = 0;
  WA_CAM.push([-0.3, CA], [2.1, CA], [2.85, C1, E.inOutCubic], [WA.zoomIn[0], C1], [WA.zoomIn[1], CZ1, E.inOutCubic],
    [WA.pan[0], CZ1], [WA.pan[1], CZ2, E.inOutSine], [WA.zoomOut[0], CZ2], [WA.zoomOut[1], CZo, E.inOutCubic]);
}
function waRef(ref, ax, ay) {
  const m = M.wa[ref];
  return { x: m.x + m.w * (ax === undefined ? 0.5 : ax), y: m.y + m.h * (ay === undefined ? 0.5 : ay) };
}
function renderWa(u) {
  const L = $.wa;
  const o = win(u, -0.3, 0, INSERT.len, INSERT.len + 0.3, E.inOutSine, E.inOutSine);
  vis(L, o > 0.002); if (o <= 0.002) return;
  op(L, o);
  camLayer($['wa.camera'], kf(u, WA_CAM));
  // the dark ground covers the story first, then the phone appears; at the end the phone leaves first, then the ground
  op($['wa.camera'], Math.min(seg(u, -0.08, 0.22, E.outCubic), 1 - seg(u, INSERT.len - 0.2, INSERT.len + 0.08, E.inOutSine)));
  tf($['wa.dev'], 'translate(' + px(WA.ph.x) + ',' + px(WA.ph.y) + ')');
  op($['wa.sys'], win(u, WA.sys[0], WA.sys[1], WA.sys[2], WA.sys[3]));
  // e-ACD → WhatsApp: the apps slide past each other
  const sw = seg(u, WA.sw[0], WA.sw[1], E.inOutCubic);
  vis($['wa.eacd'], sw < 0.999); tf($['wa.eacd'], 'translateX(' + r2(-100 * sw) + '%)');
  vis($['wa.wa'], sw > 0.001); tf($['wa.wa'], 'translateX(' + r2(100 * (1 - sw)) + '%)');
  const ta = win(u, WA.toast[0], WA.toast[1], WA.toast[2], WA.toast[3]);
  op($['wa.toast'], ta); tf($['wa.toast'], 'translateY(' + px(12 * (1 - ta)) + ')');
  // long press on the message field → "Tampal"
  const mn = win(u, WA.menu[0], WA.menu[1], WA.menu[2], WA.menu[3], E.outBack, E.inQuad);
  op($['wa.menu'], mn); tf($['wa.menu'], 'scale(' + r5(lerp(0.85, 1, mn)) + ')');
  // the pasted text in the field, then sent
  const pin = seg(u, WA.paste[0], WA.paste[1], E.outCubic), pout = seg(u, WA.send[0], WA.send[1], E.inOutCubic);
  css($['wa.paste'], 'height', px(M.wa.pasteH * Math.min(pin, 1 - pout)));
  const filled = u >= WA.paste[0] && u < WA.send[0];
  op($['wa.send'], filled ? 1 : 0); op($['wa.mic'], filled ? 0 : 1); op($['wa.cam'], filled ? 0 : 1);
  const b = seg(u, WA.bubble[0], WA.bubble[1], E.outCubic);
  op($['wa.bubble'], seg(u, WA.bubble[0], WA.bubble[0] + 0.18));
  tf($['wa.bubble'], 'translateY(' + px(28 * (1 - b)) + ') scale(' + r5(lerp(0.96, 1, b)) + ')');
  tf($['wa.older'], 'translateY(' + px(-(M.wa.bubbleH + 22) * b) + ')');
  // read by the group, one reaction, the coverage line highlighted while the camera reads it
  cls($['wa.ticks'], 'read', u >= WA.read);
  const rc = seg(u, WA.react, WA.react + 0.45, E.outBack);
  op($['wa.react'], seg(u, WA.react, WA.react + 0.12)); tf($['wa.react'], 'scale(' + r5(Math.max(0.01, lerp(0.4, 1, rc))) + ')');
  op($['wa.hl'], win(u, WA.hl[0], WA.hl[1], WA.hl[2], WA.hl[3], E.outCubic, E.inOutSine));
  renderTouch($['wa.touch'], $['wa.ripple'], touchState(WA_TAPS, u, tp => waRef(tp.ref, tp.ax, tp.ay)));
}

/* ==========================================================================
 * FRAME
 * ========================================================================== */
let lastFrame = -1;
/* V9 (HD): device pixels per stage pixel for the two WebGL canvases (opening globe, 3D view of the outbreak area), so
 * they are drawn at the screen's own resolution like the rest of the (vector) stage: stage scale × devicePixelRatio,
 * in quarter steps from 1 to 3 (4K at full screen = 2). Export and checks run at 1920 × 1080, scale 1. */
let RENDER_SCALE = 1;
function setRenderScale(rs) {
  rs = Math.max(1, Math.min(3, Math.round(rs * 4) / 4));
  if (rs === RENDER_SCALE) return false;
  RENDER_SCALE = rs;
  if (GLOBE.ok) { const cv = $['fc.globe']; cv.width = Math.round(GLOBE.box[2] * rs); cv.height = Math.round(GLOBE.box[3] * rs); }
  if (K3D.ok) kampungScale(rs);
  return true;
}
function renderTime(tf) {
  tf = clamp(tf, 0, DURATION - 1 / FPS);
  // V6: the V5 story runs on its own clock, held at INSERT.at while the WhatsApp segment plays
  const t = storyTime(tf);
  const o = layerOps(t);
  renderBg(t);
  renderOpening(t, o.open);
  renderFlowOpening(t, o.flow);
  renderManual(t, o.man);
  renderNadi(t, o.nadi);
  if (o.nadi > 0.002) renderK3dLayer(t);   // V9 (draft 3): after every NADI transform is set, so the panel is measured in place
  renderSync(t, o.sync);
  renderDesktop(t, o.desk);
  renderPhone(t, o.phone);
  renderOverlays(t);
  renderWa(tf - INSERT.atF);
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
  buildOpeningMap();
  buildNadiMap();
  buildManual();
}
function initMeasure() {
  measure();
  measureWa();
  M.cell = cellStage();
  M.syncW = $['ov.sync'].offsetWidth;
  // record card height in its final state (values shown, placeholders hidden)
  for (let i = 0; i < 5; i++) { vis($['ov.rlp' + i], false); vis($['ov.rlv' + i], true); }
  M.recH = $['ov.rec'].offsetHeight;
  M.decH = $['ov.dec'].offsetHeight;
  M.resW = $['ov.res'].offsetWidth;
  M.resH = $['ov.res'].offsetHeight;
  computeCameras();
  computeScrollTargets();
  buildFlow();
  initGlobe();
  const B = T.b, C = T.c;
  const Z0 = { cx: 960, cy: 540, tx: 960, ty: 540, z: 1 }, ZF = { cx: 758, cy: 560, tx: 960, ty: 520, z: 1.24 };
  /* V9 (draft 3): no dead hold after the re-typing (V8/V9 froze the picture for 1.6 s, which read as a stall). From the
   * cell the camera keeps easing in — barely moving while the typed "14" is read, then gathering pace — and pushes on
   * into the screen as the scene dissolves into the title (V9: it used to pull back and cut to black first). */
  const ZL = { cx: M.cell.x, cy: M.cell.y, tx: 960, ty: 470, z: 1.85 }, ZT = Object.assign({}, ZL, { z: 1.85 * 1.28 });
  MAN_CAM.length = 0;
  MAN_CAM.push([0, Z0], [B.camF[0], Z0], [B.camF[1], ZF, E.inOutCubic], [B.camF[2], ZF], [B.camF[3], Z0, E.inOutCubic],
    [C.push[0], Z0], [C.push[1], ZL, E.inOutCubic], [T.d.impact, ZT, E.inCubic]);
}
