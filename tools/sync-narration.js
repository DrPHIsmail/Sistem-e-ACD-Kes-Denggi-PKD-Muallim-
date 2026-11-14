#!/usr/bin/env node
/* ==========================================================================
 * tools/sync-narration.js — fit the recorded BM narration (one take per
 * scene) to the 120-second film, and make the captions follow the recording.
 *
 *   node tools/sync-narration.js                # reads narasi/babak-1 … babak-7 (.wav .m4a .mp3 .flac .ogg)
 *   node tools/sync-narration.js --dir rakaman  # another folder
 *   node tools/sync-narration.js --selftest     # synthetic takes with known timing; checks the alignment
 *   node tools/sync-narration.js --clear        # delete src/narration-timing.json (back to planned times)
 *   node tools/sync-narration.js --demo-takes narasi-demo   # synthetic tone takes to test the pipeline
 *
 * Why sentences are placed separately: a narrator reads a scene's sentences
 * back to back, but the picture needs some of them at fixed moments (e.g.
 * "Dalam contoh ini…" when the symptom toggle is tapped at 00:38.75). The tool
 * finds speech by short-term energy, splits each take at pauses into the
 * scene's sentences (a sentence ends with "." or "?" in data.js) and caption
 * phrases, keeps the narrator's own timing inside a sentence, and starts each
 * sentence at its planned time, or up to 1.0 s earlier / 0.5 s later when the
 * takes run long (every visual cue has at least that much lead). If a
 * sentence still does not fit, the tool stops and says which one to re-record.
 *
 * Writes
 *   narasi/narasi-penuh.wav    120.000 s, 48 kHz, 16-bit stereo, for
 *                              render-video.js --voiceover (which normalises
 *                              it to −16 LUFS and ducks the music under it)
 *   src/narration-timing.json  measured start/end of every caption cue
 * Then rebuild and render:
 *   node tools/build-player.js && node tools/make-docs.js
 *   node render-video.js --voiceover narasi/narasi-penuh.wav
 * Needs ffmpeg on PATH (or FFMPEG_PATH) to decode the takes.
 * ========================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TIMING = path.join(ROOT, 'src', 'narration-timing.json');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const SR = 48000, HOP = 0.01;                  // analysis hop 10 ms
const PRE = 0.12, POST = 0.25, FADE = 0.015;   // keep breath/consonant edges around speech
const MAX_EARLY = 1.0, MAX_LATE = 0.5;         // how far a sentence may move from its planned start
const GAP_MIN = 0.15;                          // silence kept between sentences

const D = require(path.join(ROOT, 'src', 'data.js'));
/* anchors always come from the planned times (data.js keeps them in PLANNED even when a timing file exists) */
const PL = Object.fromEntries(D.PLANNED.map(p => [p.id, p]));

/* BM syllables ≈ vowel nuclei (diphthongs ai/au/oi count once) */
const syl = s => (s.toLowerCase().replace(/ai|au|oi/g, 'a').match(/[aeiou]/g) || []).length;

/* sentences ("beats") per scene: consecutive cues up to one ending in . or ? */
function beatsOf(scene) {
  const cues = D.CUES.filter(c => c.scene === scene.id), beats = [];
  let cur = [];
  for (const c of cues) { cur.push(c); if (/[.?!]\s*$/.test(c.say)) { beats.push(cur); cur = []; } }
  if (cur.length) beats.push(cur);
  return beats.map(cs => ({ cues: cs, anchor: PL[cs[0].id].start, plannedEnd: PL[cs[cs.length - 1].id].end, syl: cs.reduce((a, c) => a + syl(c.say), 0) }));
}

/* ---------------------------------------------------------------- audio I/O */
function decode(file) {
  const buf = execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
}
function writeWav(file, L, R) {
  const n = L.length, pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), i * 4);
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([h, pcm]));
}

/* ---------------------------------------------------------------- speech analysis */
function analyse(x) {
  const hop = Math.round(HOP * SR), win = hop * 2, n = Math.max(1, Math.floor((x.length - win) / hop) + 1);
  const db = new Float32Array(n);
  for (let f = 0; f < n; f++) {
    let acc = 0; const o = f * hop;
    for (let i = 0; i < win; i++) { const v = x[o + i] || 0; acc += v * v; }
    db[f] = 10 * Math.log10(acc / win + 1e-12);
  }
  const sorted = Array.from(db).sort((a, b) => a - b);
  const floor = sorted[Math.floor(n * 0.1)], loud = sorted[Math.floor(n * 0.95)];
  if (loud - floor < 10) throw new Error('no clear speech found (level range ' + (loud - floor).toFixed(1) + ' dB)');
  const on = floor + Math.max(8, 0.35 * (loud - floor)), off = on - 4;   // hysteresis
  const v = new Uint8Array(n); let state = 0;
  for (let f = 0; f < n; f++) { state = state ? (db[f] > off ? 1 : 0) : (db[f] > on ? 1 : 0); v[f] = state; }
  // fill gaps < 0.10 s (inside words), drop blips < 0.06 s
  const runs = m => { const r = []; let s = 0; for (let f = 1; f <= n; f++) if (f === n || m[f] !== m[s]) { r.push([s, f, m[s]]); s = f; } return r; };
  for (const [a, b, val] of runs(v)) if (!val && a > 0 && b < n && (b - a) * HOP < 0.10) v.fill(1, a, b);
  for (const [a, b, val] of runs(v)) if (val && (b - a) * HOP < 0.06) v.fill(0, a, b);
  const r = runs(v), voiced = r.filter(q => q[2]).map(q => [q[0] * HOP, q[1] * HOP + HOP]);
  if (!voiced.length) throw new Error('no speech found');
  const pauses = [];
  for (let i = 1; i < voiced.length; i++) pauses.push({ start: voiced[i - 1][1], end: voiced[i][0], len: voiced[i][0] - voiced[i - 1][1] });
  return { speechStart: voiced[0][0], speechEnd: voiced[voiced.length - 1][1], pauses, floorDb: floor, loudDb: loud };
}

/* choose k ordered pauses closest to expected boundary times (prefers longer pauses) */
function pickPauses(cands, expected, tol) {
  const K = expected.length, P = cands.length;
  if (!K) return [];
  const cost = (k, p) => Math.pow((((cands[p].start + cands[p].end) / 2) - expected[k]) / tol, 2) - 0.6 * Math.min(cands[p].len, 1.2);
  // dp[k][p]: best cost choosing pause p for boundary k
  const INF = 1e18, dp = [], from = [];
  for (let k = 0; k < K; k++) { dp.push(new Array(P).fill(INF)); from.push(new Array(P).fill(-1)); }
  for (let p = 0; p < P; p++) dp[0][p] = cost(0, p);
  for (let k = 1; k < K; k++) for (let p = 0; p < P; p++) for (let q = 0; q < p; q++) {
    const c = dp[k - 1][q] + cost(k, p); if (c < dp[k][p]) { dp[k][p] = c; from[k][p] = q; }
  }
  let best = -1, bc = INF;
  for (let p = 0; p < P; p++) if (dp[K - 1][p] < bc) { bc = dp[K - 1][p]; best = p; }
  if (best < 0) return null;
  const out = new Array(K);
  for (let k = K - 1; k >= 0; k--) { out[k] = cands[best]; best = from[k][best]; }
  // reject picks far from expectation
  return out.map((p, k) => (Math.abs((p.start + p.end) / 2 - expected[k]) <= 2.5 * tol ? p : null));
}

/* split a span [s, e] of a take into parts with given syllable weights */
function splitSpan(s, e, weights, pauses, minLen, warnings, label) {
  const total = weights.reduce((a, b) => a + b, 0), dur = e - s;
  const expected = []; let acc = 0;
  for (let i = 0; i < weights.length - 1; i++) { acc += weights[i]; expected.push(s + dur * acc / total); }
  const cands = pauses.filter(p => p.start > s + 0.2 && p.end < e - 0.2 && p.len >= minLen);
  const tol = Math.max(0.6, 0.12 * dur);
  const picks = cands.length >= expected.length ? pickPauses(cands, expected, tol) : null;
  const parts = []; let cur = s;
  expected.forEach((x, i) => {
    const p = picks && picks[i];
    if (p && p.start > cur) { parts.push([cur, p.start]); cur = p.end; }
    else { warnings.push(label + ': no pause found near ' + x.toFixed(2) + ' s in the take, split by syllable count'); parts.push([cur, x - 0.05]); cur = x + 0.05; }
  });
  parts.push([cur, e]);
  return parts;
}

/* ---------------------------------------------------------------- alignment */
function alignScene(scene, x, warnings) {
  const beats = beatsOf(scene), A = analyse(x);
  const spans = splitSpan(A.speechStart, A.speechEnd, beats.map(b => b.syl), A.pauses, 0.18, warnings, 'babak ' + scene.id);
  const out = [];
  beats.forEach((b, i) => {
    const [s, e] = spans[i];
    const inside = A.pauses.filter(p => p.start >= s && p.end <= e);
    const cueSpans = b.cues.length > 1 ? splitSpan(s, e, b.cues.map(c => syl(c.say)), inside, 0.08, warnings, 'babak ' + scene.id + ' ayat ' + (i + 1)) : [[s, e]];
    // audio extent: speech plus a little room, never into the neighbouring sentence
    const prevEnd = i > 0 ? spans[i - 1][1] : 0, nextStart = i < spans.length - 1 ? spans[i + 1][0] : x.length / SR;
    const a0 = Math.max(prevEnd + (s - prevEnd) / 2, s - PRE, 0), a1 = Math.min(nextStart - (nextStart - e) / 2, e + POST, x.length / SR);
    out.push({ beat: b, s, e, a0, a1, cueSpans });
  });
  return { beats: out, analysis: A };
}

function place(scenes, warnings) {
  const placed = []; let prevEnd = 0;
  const all = [];
  for (const sc of scenes) for (const b of sc.beats) all.push(Object.assign({ scene: sc.scene }, b));
  all.forEach((b, i) => {
    const dur = b.e - b.s, next = all[i + 1], anchor = b.beat.anchor;
    const say = '"' + b.beat.cues.map(c => c.say).join(' ') + '"';
    const lo = Math.max(prevEnd + GAP_MIN, anchor - MAX_EARLY), hi = anchor + MAX_LATE;
    if (lo > hi) throw new Error('babak ' + b.scene.id + ': the sentence before ' + say + ' runs too long; it would start ' + (lo - anchor).toFixed(2) + ' s late (limit ' + MAX_LATE + ' s).');
    // latest end that still lets the next sentence start within its tolerance
    const limit = next ? next.beat.anchor + MAX_LATE - GAP_MIN : D.DURATION - 0.25;
    let start = Math.min(Math.max(anchor, lo), hi);
    if (start + dur > limit) start = Math.max(lo, limit - dur);
    if (start + dur > limit + 1e-6) throw new Error('babak ' + b.scene.id + ', ayat ' + say + ' is ' + dur.toFixed(2) + ' s; it must end by ' + limit.toFixed(2) +
      ' s (' + (start + dur - limit).toFixed(2) + ' s too long). Re-record it a little faster or with shorter pauses.');
    if (Math.abs(start - anchor) > 0.02) warnings.push('babak ' + b.scene.id + ' ayat ' + b.beat.cues[0].id + '…: starts ' + (start - anchor > 0 ? '+' : '') + (start - anchor).toFixed(2) + ' s from plan');
    const off = start - b.s;   // take time → film time
    const cues = b.beat.cues.map((c, k) => ({ id: c.id, start: +(b.cueSpans[k][0] + off).toFixed(2), end: +(b.cueSpans[k][1] + off).toFixed(2) }));
    if (start < b.scene.start + 0.05 || start + dur > b.scene.end + 0.3) warnings.push('babak ' + b.scene.id + ' ayat ' + b.beat.cues[0].id + '…: runs outside its scene (' + start.toFixed(2) + '–' + (start + dur).toFixed(2) + ' s)');
    placed.push({ b, off, start, end: start + dur, cues });
    prevEnd = start + dur;
  });
  return placed;
}

function assemble(placed, takes) {
  const N = Math.round(D.DURATION * SR), L = new Float32Array(N), R = new Float32Array(N), fl = Math.round(FADE * SR);
  for (const p of placed) {
    const x = takes[p.b.scene.id], i0 = Math.round(p.b.a0 * SR), i1 = Math.round(p.b.a1 * SR), dst = Math.round((p.b.a0 + p.off) * SR);
    for (let i = i0; i < i1; i++) {
      const k = i - i0, rem = i1 - 1 - i, g = Math.min(1, k / fl, rem / fl), j = dst + k;
      if (j >= 0 && j < N) { L[j] += x[i] * g; R[j] += x[i] * g; }
    }
  }
  return { L, R };
}

function report(placed) {
  console.log('\n  kiu   rancangan        rakaman          Δmula   tempoh');
  for (const p of placed) for (const c of p.cues) {
    const pl = PL[c.id];
    console.log('  ' + c.id.padEnd(4) + '  ' + (pl.start.toFixed(2) + '–' + pl.end.toFixed(2)).padEnd(15) + '  ' + (c.start.toFixed(2) + '–' + c.end.toFixed(2)).padEnd(15) +
      '  ' + ((c.start - pl.start >= 0 ? '+' : '') + (c.start - pl.start).toFixed(2)).padStart(6) + '  ' + (c.end - c.start).toFixed(2) + ' s');
  }
}

function run(dir, outWav, outJson, quiet) {
  const exts = ['.wav', '.m4a', '.mp3', '.flac', '.ogg', '.aac'];
  const takes = {}, scenes = [], warnings = [];
  for (const sc of D.SCENES) {
    const f = exts.map(e => path.join(dir, 'babak-' + sc.id + e)).find(p => fs.existsSync(p));
    if (!f) throw new Error('missing take for scene ' + sc.id + ': expected ' + path.join(dir, 'babak-' + sc.id + '.wav') + ' (or .m4a/.mp3/.flac/.ogg)');
    takes[sc.id] = decode(f);
    const al = alignScene(sc, takes[sc.id], warnings);
    scenes.push(Object.assign({ scene: sc, file: path.basename(f) }, al));
    if (!quiet) console.log('babak ' + sc.id + ': ' + path.basename(f) + ', speech ' + al.analysis.speechStart.toFixed(2) + '–' + al.analysis.speechEnd.toFixed(2) + ' s, ' + al.beats.length + ' ayat');
  }
  const placed = place(scenes, warnings);
  const cues = {};
  for (const p of placed) for (const c of p.cues) cues[c.id] = { start: c.start, end: c.end };
  // validation: order, gaps, scene bounds, caption length
  const ids = D.CUES.map(c => c.id);
  for (let i = 0; i < ids.length; i++) {
    const c = cues[ids[i]], n = cues[ids[i + 1]];
    if (!(c.end > c.start)) throw new Error('cue ' + ids[i] + ' has no duration');
    if (n && n.start < c.end) throw new Error('cues ' + ids[i] + ' and ' + ids[i + 1] + ' overlap');
    if (c.end - c.start < 0.8) warnings.push('cue ' + ids[i] + ' is on screen only ' + (c.end - c.start).toFixed(2) + ' s');
  }
  if (cues[ids[ids.length - 1]].end > D.DURATION - 0.2) throw new Error('narration runs past 01:59.80');
  const mix = assemble(placed, takes);
  writeWav(outWav, mix.L, mix.R);
  fs.writeFileSync(outJson, JSON.stringify({ source: 'recording', takes: scenes.map(s => s.file), cues }, null, 1) + '\n');
  if (!quiet) {
    report(placed);
    warnings.forEach(w => console.log('  ! ' + w));
    console.log('\nwrote ' + path.relative(process.cwd(), outWav) + ' (' + D.DURATION.toFixed(3) + ' s) and ' + path.relative(process.cwd(), outJson));
    console.log('next: node tools/build-player.js && node tools/make-docs.js && node render-video.js --voiceover ' + path.relative(process.cwd(), outWav));
  }
  return { cues, warnings, placed };
}

/* ---------------------------------------------------------------- self-test */
/* Synthetic takes: voiced "syllables" (120 Hz harmonics, vowel-like band) at
 * ~4.6 syl/s, short gaps inside phrases, 0.32 s between phrases, 0.75 s between
 * sentences, room noise at −62 dBFS. The test knows every phrase boundary. */
function selftest() {
  let fails = 0;
  for (const tempo of [0.92, 1.0, 1.03]) fails += selftestPass(tempo);
  process.exit(fails ? 1 : 0);
}
/* writes babak-1..7.wav with synthetic voiced bursts; returns the true phrase times */
function synthTakes(dir, tempo) {
  const r = (seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; })(7);
  const truth = {};
  for (const sc of D.SCENES) {
    const beats = beatsOf(sc), parts = []; let t = 0.5 + r() * 0.3;
    beats.forEach((b, bi) => {
      if (bi) t += 0.6 + r() * 0.25;
      b.cues.forEach((c, ci) => {
        if (ci) t += 0.22 + r() * 0.08;
        const n = syl(c.say), s0 = t, per = (PL[c.id].end - PL[c.id].start) / n * tempo * 0.97;
        for (let k = 0; k < n; k++) { const d = per * (0.8 + r() * 0.06); parts.push([t, t + d]); t += k < n - 1 ? per : d; }
        truth[c.id] = { start: s0, end: t, beat: bi, scene: sc.id };
      });
    });
    const len = t + 0.8, N = Math.round(len * SR), x = new Float32Array(N);
    for (let i = 0; i < N; i++) x[i] = (r() * 2 - 1) * 0.0008;
    for (const [a, b] of parts) {
      const i0 = Math.round(a * SR), i1 = Math.round(b * SR), f0 = 110 + r() * 30;
      for (let i = i0; i < i1; i++) {
        const q = (i - i0) / (i1 - i0), env = Math.sin(Math.PI * q) ** 0.6, tt = i / SR;
        let v = 0; for (let h = 1; h <= 12; h++) v += Math.sin(2 * Math.PI * f0 * h * tt) * Math.exp(-Math.pow((f0 * h - 700) / 500, 2));
        x[i] += v * 0.12 * env;
      }
    }
    const pcm = Buffer.alloc(N * 2); for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), i * 2);
    const h = Buffer.alloc(44);
    h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
    h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'babak-' + sc.id + '.wav'), Buffer.concat([h, pcm]));
  }
  return truth;
}
function selftestPass(tempo) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'narasi-test-'));
  const truth = synthTakes(dir, tempo);
  let res;
  try { res = run(dir, path.join(dir, 'narasi-penuh.wav'), path.join(dir, 'timing.json'), true); }
  catch (e) { console.log('selftest tempo ' + tempo.toFixed(2) + ': FAILED — ' + e.message); fs.rmSync(dir, { recursive: true, force: true }); return 1; }
  let fails = 0, maxErr = 0;
  // every sentence starts at its anchor (or ≤ 1 s early); phrase lengths match the take
  for (const sc of D.SCENES) for (const b of beatsOf(sc)) {
    const got = res.cues[b.cues[0].id].start;
    if (got > b.anchor + MAX_LATE + 0.03 || got < b.anchor - MAX_EARLY - 0.03) { fails++; console.log('  FAIL sentence ' + b.cues[0].id + ' starts at ' + got + ' (anchor ' + b.anchor + ')'); }
    const off = got - truth[b.cues[0].id].start;
    for (const c of b.cues) {
      const e1 = Math.abs(res.cues[c.id].start - (truth[c.id].start + off)), e2 = Math.abs(res.cues[c.id].end - (truth[c.id].end + off));
      maxErr = Math.max(maxErr, e1, e2);
      if (e1 > 0.06 || e2 > 0.06) { fails++; console.log('  FAIL cue ' + c.id + ' start err ' + e1.toFixed(3) + ', end err ' + e2.toFixed(3)); }
    }
  }
  const wav = fs.statSync(path.join(dir, 'narasi-penuh.wav')).size;
  const expectBytes = 44 + Math.round(D.DURATION * SR) * 4;
  if (wav !== expectBytes) { fails++; console.log('  FAIL narasi-penuh.wav is ' + wav + ' bytes, expected ' + expectBytes); }
  console.log('selftest tempo ' + tempo.toFixed(2) + ': ' + D.CUES.length + ' cues in ' + D.SCENES.length + ' takes, max boundary error ' + (maxErr * 1000).toFixed(0) + ' ms, ' +
    res.warnings.length + ' notes → ' + (fails ? fails + ' FAILED' : 'OK'));
  res.warnings.forEach(w => console.log('  · ' + w));
  fs.rmSync(dir, { recursive: true, force: true });
  return fails;
}

/* ---------------------------------------------------------------- main */
function main() {
  const a = process.argv.slice(2);
  if (a.includes('--selftest')) return selftest();
  const dt = a.indexOf('--demo-takes');
  if (dt >= 0) {   // synthetic (non-speech) takes to try the whole pipeline before the real recording
    const out = path.resolve(a[dt + 1] || path.join(ROOT, 'narasi-demo'));
    synthTakes(out, 1.0);
    console.log('wrote synthetic takes babak-1..' + D.SCENES.length + '.wav to ' + path.relative(process.cwd(), out) + ' (tones, not speech — for testing only)');
    return;
  }
  if (a.includes('--clear')) { if (fs.existsSync(TIMING)) fs.unlinkSync(TIMING); console.log('removed ' + path.relative(process.cwd(), TIMING) + ' — captions use the planned times'); return; }
  const di = a.indexOf('--dir'), dir = path.resolve(di >= 0 ? a[di + 1] : path.join(ROOT, 'narasi'));
  run(dir, path.join(dir, 'narasi-penuh.wav'), TIMING, false);
}
try { main(); } catch (e) { console.error('sync-narration: ' + e.message); process.exit(1); }
