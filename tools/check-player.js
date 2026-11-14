#!/usr/bin/env node
/* Automated checks for the V9 player video-showcase-v9.html (run: node tools/check-player.js).
 * V9 (draft 2): no captions in the film (C5, F7); the benefit cards float on an orbit and come into focus one by one on
 *     the narration (V10 focus per phrase, H2 orbit motion, N5 the beats are phrase onsets in the audio).
 * V9: 141.4 s film (opening 0–6.5 story → film 0–7.5 for four short lines; title impact at film 18.85);
 *     8 new narrated lines (a1–a4, n1, p1, b1, b2) and 3 reworded (c07, c09, c10) placed on their beats (N4),
 *     24 spoken lines / 29 captions (narasi-v9/narasi-v9.wav, penempatan-v9.json); T phone title on two
 *     lines + the two-worker example (Pasukan 1); H the "Ringkasan e-ACD" panel holds still (one glow rise
 *     per card, list space reserved, no layout move after the expand) and the caption box stays opaque
 *     between back-to-back captions.
 * V8: N narration (ElevenLabs "Ahmad", narasi-v8/narasi-v8.wav on the film clock) placed on the V7 caption
 *     beats, captions timed to the voice, score ducked under it (E2/E4/E8, F2/F3 now expect the narration).
 * V7: P slower manual scene (film 6.5–16.35 s) · K moving coverage hold + team bars · L follow-up node layout.
 * V6: G opening globe + 200 m radius · W WhatsApp copy-and-paste insert (14 s, film 134 s) · J smooth
 *     1:01–1:03 reveal. Story-time checks from V5 run through filmTime() (window.__at takes STORY time;
 *     window.__atF takes FILM time).
 * V5: O opening flow chart · R record-entry pacing · S follow-up step flow · KKM target label.
 * A offline load · B one dataset · C labels, captions, Sheets write, coverage count-up · M paper
 * Borang ACD + Lampiran 1 · V hard gates (phone gate 00:24.30, re-typing by 00:11.85, title impact
 * 00:13.35, 3D angles, holds) · D frame determinism · E soundtrack (narration + ducked score)
 * F player controls. Exit code 1 on failure. */
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.resolve(ROOT, process.argv[2] || 'video-showcase-v9.html');
const URL = pathToFileURL(HTML).href;
// V9: the narration track and its placement (tools/place-narration-v9.py)
const NARR_WAV = path.join(ROOT, 'narasi-v9', 'narasi-v9.wav');
const K3D_AT = (() => { const m = fs.readFileSync(HTML, 'utf8').match(/const K3D_SHOT = \{ z: [\d.]+, at: \[(\d+) \/ 1708, (\d+) \/ 1013\]/); return m ? [m[1] / 1708, m[2] / 1013] : [NaN, NaN]; })();   // V9 (draft 3): dome centre on the canvas
const PLACE = JSON.parse(fs.readFileSync(path.join(ROOT, 'narasi-v9', 'penempatan-v9.json'), 'utf8'));
const DUR = 141.4, NFRAMES = 8484;
function readWavMono16(file) {
  const b = fs.readFileSync(file);
  let p = 12, fmt = null;
  while (p + 8 <= b.length) {
    const id = b.toString('ascii', p, p + 4), size = b.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { ch: b.readUInt16LE(p + 10), sr: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    if (id === 'data') { const d = b.subarray(p + 8, p + 8 + size); return { fmt, pcm: new Int16Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.length)) }; }
    p += 8 + size + (size & 1);
  }
  throw new Error('no data chunk in ' + file);
}
const SRT = path.join(ROOT, 'kit-suara', 'subtitles-bm.srt');
const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok: !!ok, detail: detail === undefined ? '' : String(detail) });
  process.stderr.write((ok ? '  ok   ' : '  FAIL ') + name.slice(0, 60) + '\n');   // progress, in case a long run is cut short
};
const sha = b => crypto.createHash('sha1').update(b).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(browser, query) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const blocked = [], errors = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (/^(file|data|blob):/i.test(u)) return r.continue(); blocked.push(u); return r.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL + (query || ''));
  await page.evaluate(() => window.ACD.ready);
  return { ctx, page, blocked, errors, cdp: await ctx.newCDPSession(page) };
}
const shot = async X => sha(Buffer.from((await X.cdp.send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));

/* in-page helpers: effective opacity and on-stage visibility of an element */
const PAGE_HELPERS = () => {
  window.__eff = el => {
    if (!el || !el.getClientRects().length) return 0;
    let o = 1, e = el;
    while (e && e.id !== 'stage') { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= parseFloat(cs.opacity); e = e.parentElement; }
    const r = el.getBoundingClientRect();
    if (r.right < 0 || r.left > 1920 || r.bottom < 0 || r.top > 1080) return 0;
    return o;
  };
  window.__ref = r => document.querySelector('[data-ref="' + r + '"]');
  window.__at = t => window.renderFrame(Math.round(filmTime(t) * 60));   // V6: story time
  window.__atF = t => window.renderFrame(Math.round(t * 60));            // V6: film time
  window.__textVisible = (needle, min) => Array.from(document.querySelectorAll('#stage *')).some(el => el.childElementCount === 0 && el.textContent.includes(needle) && window.__eff(el) >= (min || 0.98));
  window.__visibleText = min => Array.from(document.querySelectorAll('#stage *')).filter(el => el.childElementCount === 0 && el.textContent.trim() && window.__eff(el) >= (min || 0.5)).map(el => el.textContent.trim()).join(' | ');
  window.__phoneOn = () => window.__eff(window.__ref('w.phone')) > 0.001;
  window.__yaw = ref => { const m = /rotateY\(([-\d.]+)deg\)/.exec(window.__ref(ref).style.transform || ''); return m ? +m[1] : 0; };
};
/* longest continuous run (seconds) in [t0, t1] where pred(frame) holds, sampled every frame */
async function longestRun(page, t0, t1, predSrc) {
  // V6: t0, t1, the predicate's t and the result are STORY times (frames are walked in film time)
  return page.evaluate(([a, b, src]) => {
    const pred = new Function('t', src);
    let best = 0, cur = 0, bestStart = -1, curStart = -1;
    for (let f = Math.round(filmTime(a) * 60); f <= Math.round(filmTime(b) * 60); f++) {
      window.renderFrame(f);
      const ts = +storyTime(f / 60).toFixed(6);
      if (pred(ts)) { if (cur === 0) curStart = ts; cur++; if (cur > best) { best = cur; bestStart = curStart; } } else cur = 0;
    }
    return { sec: best / 60, from: bestStart, to: bestStart + best / 60 };
  }, [t0, t1, predSrc]);
}
function parseSrt(file) {
  const t = s => { const m = /(\d+):(\d+):(\d+),(\d+)/.exec(s); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
  return fs.readFileSync(file, 'utf8').replace(/\r/g, '').trim().split(/\n\n+/).map(b => { const l = b.split('\n'); const [a, z] = l[1].split(' --> '); return { start: t(a), end: t(z), text: l.slice(2).join('\n') }; });
}
const flat = s => s.replace(/\s+/g, ' ').trim();
/* V6: identifiers that must never reach the output (the live spreadsheet ID, the source map coordinates
 * and the real staff names of the source apps) are kept as SHA-256 prefixes here, not in clear. */
const BANNED = new Set(["94183209c1361764", "c7fe5df5eca98da5", "f96635a3eaaed2d0", "c19c1fe745312d8f", "c38c633da59c4165", "00c474b40240f42a", "7f70f4b0706b460f", "b010cc6a6bd95202", "9d56d96cb023099f", "edb493645b7dd210", "60e64a08f4bf1dc6", "46f9a0779d618a8d", "f4a3df0b5cbe2d5c", "ac75678b4a1369bd", "c6ca8a5b8cb4c128", "c8de5e5d2e2130d2", "b7fb0d972b1bba2b", "5dcef36d26950690", "7562aa29b5db1bb5", "f4c8c6ecde051a0a"]);
function bannedHits(text) {
  const sha16 = w => require('crypto').createHash('sha256').update(w).digest('hex').slice(0, 16);
  const hits = [];
  for (const m of text.matchAll(/[A-Za-z0-9_-]{16,}/g)) { const t = m[0]; if (BANNED.has(sha16(t)) || BANNED.has(sha16(t.slice(0, 16))) || BANNED.has(sha16(t.slice(0, 44)))) hits.push(t.slice(0, 6) + '…'); }
  for (const m of text.matchAll(/\d{1,3}\.\d{5,}/g)) { const t = m[0]; for (let k = 7; k <= t.length; k++) if (BANNED.has(sha16(t.slice(0, k)))) { hits.push(t.slice(0, 4) + '…'); break; } }
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) for (let n = 1; n <= 3 && i + n <= words.length; n++) if (BANNED.has(sha16(words.slice(i, i + n).join(' ')))) hits.push('nama@' + i);
  return hits;
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] });
  try {
    /* ---------------- A. offline load */
    const R = await open(browser, '?render=1');
    await R.page.evaluate(PAGE_HELPERS);
    const html = fs.readFileSync(HTML, 'utf8'), textOnly = html.replace(/[A-Za-z0-9+/=]{400,}/g, '');
    check('A1 opens from file:// with every network request blocked', R.blocked.length === 0, R.blocked.length + ' request(s) attempted');
    const leaks = bannedHits(textOnly);
    check('A2 no live URL, spreadsheet ID, source map coordinates or real staff name in the file (identifiers checked by hash)', !/https?:\/\//i.test(textOnly) && leaks.length === 0, leaks.slice(0, 5).join(', ') || 'tiada');
    const meta = await R.page.evaluate(() => ({ fps: window.ACD.FPS, frames: window.ACD.TOTAL_FRAMES, dur: window.ACD.DURATION, scenes: SCENES.map(s => s.start).concat(SCENES[SCENES.length - 1].end) }));
    check('A3 timeline 141.4 s × 60 fps = 8,484 frames (120 s story; opening +1.0 s, manual scene +4.5 s, WhatsApp +14 s, benefit cards +1.9 s)', meta.fps === 60 && meta.frames === NFRAMES && meta.dur === DUR, JSON.stringify({ fps: meta.fps, frames: meta.frames, dur: meta.dur }));
    const segs = meta.scenes.map(x => +x.toFixed(3));
    check('A4 V9 segments 0 · 18.6 · 29.8 · 54.5 · 67.5 · 83.5 · 90.45 · 104.45 · 124.5 · 133.75 · 141.4', segs.join() === '0,18.6,29.8,54.5,67.5,83.5,90.45,104.45,124.5,133.75,141.4', segs.join(' '));
    const kept = ['video-showcase.html', 'NADI-Muallim-120s.mp4', 'video-showcase-v3.html', 'NADI-Muallim-Pitch-120s-v3.mp4', 'video-showcase-v4.html', 'NADI-Muallim-Pitch-120s-v4.mp4', 'video-showcase-v5.html', 'NADI-Muallim-Pitch-120s-v5.mp4', 'video-showcase-v6.html', 'NADI-Muallim-Pitch-134s-v6.mp4',
      'video-showcase-v7.html', 'NADI-Muallim-Pitch-137s-v7.mp4', 'video-showcase-v8.html', 'NADI-Muallim-Pitch-137s-v8.mp4'];
    check('A5 V2–V8 exports kept for comparison', kept.every(f => fs.existsSync(path.join(ROOT, f))) && !kept.includes(path.basename(HTML)), kept.join(', '));

    /* ---------------- B. one dataset (110 / 92 / 12 / 6 / 84%) */
    const T = await R.page.evaluate(() => window.ACD.TOTALS);
    check('B1 totals 110 / 92 / 12 / 337 / 3 / 3, unvisited 6', T.locality === 110 && T.visited === 92 && T.locked === 12 && T.pop === 337 && T.symp === 3 && T.ref === 3 && T.unvisited === 6, JSON.stringify(T));
    check('B2 coverage ROUND(92/110×100) = 84%', T.pct === 84, (92 / 110 * 100).toFixed(3) + '% → ' + T.pct + '%');
    const teamPct = await R.page.evaluate(() => [1, 2, 3, 4, 5, 6].map(t => calcTeamPct(TEAMS[t])));
    check('B3 team coverage 85/83/84/82/83/83 %', teamPct.join() === '85,83,84,82,83,83', teamPct.join(' '));
    const ds = await R.page.evaluate(() => {
      const g = r => window.__ref(r).textContent.replace(/\s+/g, ' ').trim();
      window.__at(70); const dash = { pct: g('dk.kpiPct'), ratio: g('dk.kpiRatio') }, res = g('ov.res');
      window.__at(90.5); const card = ['na.kTarget', 'na.kVisited', 'na.kLocked', 'na.kLeft'].map(r => window.__ref(r).querySelector('.na-kpi-n').textContent.trim()), left = ['ov.f110', 'ov.f92', 'ov.lf12', 'ov.f6'].map(r => window.__ref(r).querySelector('b').textContent.trim()).join(',');
      window.__at(83); const sum = g('ov.summary');
      return { dash, res, card, left, sum };
    });
    const oneSet = ds.dash.pct === '84%' && ds.dash.ratio === '(92 / 110 premis)' && /84%/.test(ds.res) && /92 daripada 110 premis dilawati/.test(ds.res) &&
      ds.card.join() === '110,92,12,6' && ds.left === '110,92,12,6' && /92 \/ 110 \(84%\)/.test(ds.sum) && /12\s*premis/.test(ds.sum);
    check('B4 the same numbers on the monitor, coverage card, NADI card, follow-up card and summary', oneSet, JSON.stringify(ds).slice(0, 300));
    const reveal = await R.page.evaluate(() => { const hits = []; for (let ts = 24.3; ts <= 33.0; ts += 0.1) { window.__at(ts); const tx = window.__visibleText(0.3); const m = tx.match(/\b(110|92|84 ?%|12 berkunci|6 premis)\b/); if (m) hits.push(ts.toFixed(2) + 's:' + m[0]); } return hits; });
    check('B5 no headline numbers during the phone reveal (00:24.30–00:33)', reveal.length === 0, reveal.slice(0, 4).join(' ') || 'none');
    const indiv = await R.page.evaluate(() => { window.__at(42); const rec = window.__ref('ov.rl2').textContent; window.__at(83); const sm = window.__ref('ov.summary').textContent; window.__at(18); const na = window.__ref('na.card').textContent; return { rec, sm, na }; });
    check('B6 screened / referred individuals kept distinct from notified cases', /individu bergejala/.test(indiv.rec) && !/\bkes\b/i.test(indiv.rec) && /337 diperiksa · 3 bergejala · 3 dirujuk/.test(indiv.sm) && /Kes Wabak/.test(indiv.na) && !/bergejala/.test(indiv.na), flat(indiv.rec));

    /* ---------------- C. labels, captions, the Sheets write */
    const simAt = [1, 5, 10, 18, 22, 26, 34, 45, 51, 58, 64, 72, 80, 87, 96, 102];
    const simVis = [];
    for (const t of simAt) simVis.push(await R.page.evaluate(x => { window.__at(x); return Array.from(document.querySelectorAll('#stage .sim-badge')).some(el => window.__eff(el) > 0.5); }, t));
    check('C1 "DATA SIMULASI" on screen at ' + simAt.join(', ') + ' s', simVis.every(Boolean), simVis.map((v, i) => simAt[i] + 's:' + (v ? 'ya' : 'TIDAK')).join(' '));
    const protoAt = [[22.5, true], [24.0, true], [87, true], [100, true], [107, true], [111, true], [30, false], [58, false], [70, false], [82, false], [116, false]];
    const protoVis = [];
    for (const [t] of protoAt) protoVis.push(await R.page.evaluate(x => { window.__at(x); return Array.from(document.querySelectorAll('#stage .proto-badge')).some(el => window.__eff(el) > 0.5); }, t));
    check('C2 "PROTOTAIP INTEGRASI" on the NADI action, the NADI follow-up and the last benefit card only', protoVis.every((v, i) => v === protoAt[i][1]), protoVis.map((v, i) => protoAt[i][0] + 's:' + (v ? 'ya' : 'tidak')).join(' '));
    const srt = parseSrt(SRT);
    const cues = await R.page.evaluate(() => CUES.map(c => ({ id: c.id, start: c.start, end: c.end, sub: c.sub, scene: c.scene })));
    const kitCues = cues.filter(c => /^c\d\d$/.test(c.id)), waCues = cues.filter(c => /^w\d$/.test(c.id));
    const kitOf = c => srt[parseInt(c.id.slice(1), 10) - 1];
    const ins = await R.page.evaluate(() => INSERT);
    // V8: c14/c15 reworded at 1:44; V9: c07, c09, c10 reworded at the user's request; every other kit caption keeps the kit text
    const REWORDED = { c14: 'Daripada analisa automatik sistem,\n6 premis belum dilawati,', c15: '12 direkodkan berkunci\natau kosong.',
      c07: 'Bagi premis yang ditugaskan, petugas merekod\nstatus lawatan, gejala dan rujukan.', c09: 'Selepas rekod disimpan, sistem mengira\ndapatan pasukan secara automatik.', c10: 'Ringkasan dijana terus daripada\nrekod yang sama.' };
    const NEW9 = { a1: 'Notifikasi denggi diterima.', a2: 'Kes bertambah.', a3: 'Wabak diisytiharkan.', a4: 'Pasukan turun untuk\npengesanan kes aktif.', n1: 'Inilah NADI Muallim.',
      p1: 'Setiap petugas boleh merekod dapatan\npada telefon masing-masing.', b1: 'Rekod di telefon, kiraan liputan automatik,\npengesahan dan ringkasan.', b2: 'Sistem membantu merancang\nlawatan susulan.' };
    const newCues = cues.filter(c => !/^c\d\d$/.test(c.id) && !/^w\d$/.test(c.id));
    const newSame = newCues.length === 8 && newCues.every(c => NEW9[c.id] === c.sub);
    const textSame = kitCues.every(c => REWORDED[c.id] ? c.sub === REWORDED[c.id] : kitOf(c) && flat(kitOf(c).text) === flat(c.sub));
    // V8/V9: every caption is timed to the narration (narasi-v9/penempatan-v9.json → src/data.js NARR_CAPTIONS)
    const timeSame = PLACE.captions.length === cues.length && PLACE.captions.every(p => { const c = cues.find(x => x.id === p.id); return c && Math.abs(c.start - p.start) < 0.0005 && Math.abs(c.end - p.end) < 0.0005; });
    const waIn = waCues.every(c => c.start >= ins.atF && c.end <= ins.atF + ins.len);
    const q = await R.page.evaluate(() => window.__ref('ov.fq').textContent.replace(/\s+/g, ' '));
    check('C3 29 captions: 18 kit (13 kit text, c07/c09/c10/c14/c15 reworded) + 3 WhatsApp inside the insert + 8 new V9 lines, all timed to the narration (penempatan-v9.json); c01 heads the follow-up flow',
      srt.length === 19 && cues.length === 29 && kitCues.length === 18 && waCues.length === 3 && waIn && newSame && !cues.some(c => c.id === 'c01') && textSame && timeSame && q.replace(/\s+/g, '').includes('Premismanayangmasihperludilawati?'),
      cues.length + ' kiu · ' + waCues.map(c => c.id + ' ' + c.start + '–' + c.end).join(', '));
    const caps = await R.page.evaluate(() => ({ lines: CUES.every(c => c.sub.split('\n').length <= 2), ordered: CUES.every((c, i) => !i || c.start >= CUES[i - 1].end), inScene: CUES.every(c => { const s = SCENES.find(q => q.id === c.scene); return c.start >= s.start && c.start < s.end; }) }));
    check('C4 caption cues (SRT file only): ≤ 2 lines, in order without overlap, each starts in its segment', caps.lines && caps.ordered && caps.inScene, JSON.stringify(caps));
    // V9: no captions in the film (removed at the user's request); the cue timings remain data for the audio balance and the SRT file
    const noCap = await R.page.evaluate(() => {
      const els = ['subsBox', 'subShade', 'subs'].filter(r => window.__ref(r)), seen = [];
      for (const c of CUES) {
        window.__atF((c.start + c.end) / 2);
        const want = c.sub.replace(/\s+/g, ' ').trim();
        if (Array.from(document.querySelectorAll('#stage *')).some(el => el.textContent.replace(/\s+/g, ' ').trim() === want && window.__eff(el) > 0.05)) seen.push(c.id);
      }
      return { els, seen, flag: CAPTIONS_IN_FILM };
    });
    check('C5 no captions in the film (V9): no caption box or shade in the page, CAPTIONS_IN_FILM is false, and none of the ' + cues.length + ' caption lines is on screen at its cue',
      noCap.els.length === 0 && noCap.seen.length === 0 && noCap.flag === false, JSON.stringify(noCap));
    const target = await R.page.evaluate(() => {
      const b = r => window.__ref(r).textContent.trim();
      window.__at(66.5); const before = [b('ph.kpiBadge'), b('dk.kpiBadge')], mark = window.__eff(window.__ref('dk.targetMark')) > 0.9 && window.__textVisible('Sasaran 80%', 0.5);
      window.__at(73); const after = [b('ph.kpiBadge'), b('dk.kpiBadge')], formula = window.__textVisible('sasaran KKM: ≥ 80%', 0.98), pill = window.__eff(window.__ref('ov.capai')) > 0.98;
      return { before, after, mark, formula, pill };
    });
    check('C6 target animation (v1): "Sedang Berjalan (<80%)" → "Capai Sasaran (≥80%)", "Sasaran 80%" marker, pill, formula labelled "sasaran KKM: ≥ 80%"',
      target.before.every(x => x === 'Sedang Berjalan (<80%)') && target.after.every(x => x === 'Capai Sasaran (≥80%)') && target.mark && target.formula && target.pill, JSON.stringify(target));
    const cu = await R.page.evaluate(() => {
      const pct = t => { window.__at(t); return [window.__ref('ph.kpiPct').textContent, window.__ref('dk.kpiPct').textContent, window.__ref('dk.mLoc').textContent, window.__ref('dk.mVis').textContent]; };
      const ev = window.ACD.soundEvents().find(e => e.k === 'success');
      return { s62: pct(62.5), s65: pct(65.2), s67: pct(67.0), s69: pct(69.1), cross: T_TARGET_CROSS, crossF: filmTime(T_TARGET_CROSS), success: ev ? ev.t : null };
    });
    const mid = parseInt(cu.s67[1], 10);
    check('C9 coverage counts up from zero (v1): 0% → 84%, locality to 110, visited to 92; target crossed during the count with a success sound',
      cu.s62[1] === '0%' && cu.s65[2] === '110' && mid > 0 && mid < 84 && cu.s69[0] === '84%' && cu.s69[1] === '84%' && cu.s69[3] === '92' && cu.cross > 64.7 && cu.cross < 69.0 && Math.abs(cu.success - cu.crossF) < 1e-6,
      '62.5 s ' + cu.s62[1] + ' · 65.2 s lokaliti ' + cu.s65[2] + ' · 67.0 s ' + cu.s67[1] + ' · 69.1 s ' + cu.s69[1] + ' (' + cu.s69[3] + '/110) · sasaran dicapai ' + cu.cross.toFixed(3) + ' s');
    const sheet = await R.page.evaluate(() => {
      const cell = (r, k) => window.__ref('sh.c' + r + '_' + k).textContent.trim();
      window.__at(57.2); const before = [cell(0, 1), cell(1, 1)];
      window.__at(58.4); const after = [cell(0, 1), cell(1, 1)], selAfter = window.__eff(window.__ref('sh.sel'));
      const range = window.__textVisible('Hasil ACD!C8:H13', 0.98), line = window.__textVisible('Dapatan diselaraskan apabila sambungan tersedia', 0.98), demo = window.__textVisible('tiada sambungan langsung dalam demo', 0.98);
      const paths = [window.__ref('ov.fp1'), window.__ref('ov.fp2')].map(p => ({ end: p.getAttribute('marker-end') || '', start: p.getAttribute('marker-start') || '' }));
      return { before, after, selAfter, range, line, demo, paths, saved: T.h.saved, write: T.i.write };
    });
    check('C7 Sheets: "Hasil ACD!C8:H13" written after the save (P1 19/16 → 20/17), one-way arrows, write conditional on connectivity, no live call',
      sheet.before.join() === '19,16' && sheet.after.join() === '20,17' && sheet.write > sheet.saved && sheet.selAfter > 0.9 && sheet.range && sheet.line && sheet.demo &&
      sheet.paths.every(p => /flArrow/.test(p.end) && !p.start), JSON.stringify({ before: sheet.before, after: sheet.after, save: sheet.saved, write: sheet.write, range: sheet.range, line: sheet.line }));
    const sup = await R.page.evaluate(() => { const c16 = CUES.find(c => c.id === 'c16'); window.__at(T.l.click - 0.05); const cur = window.__eff(window.__ref('na.cursor')); window.__at(T.l.click + 0.03); const press = window.__ref('na.decBtn').classList.contains('press'); window.__at(T.l.plan[1] + 0.6); const dec = window.__eff(window.__ref('ov.dec')); return { cur, press, dec, click: filmTime(T.l.click), c16: [c16.start, c16.end] }; });
    check('C8 the supervisor visibly selects "Rancang lawatan susulan" while the narration says "Penyelia menjadualkan…"', sup.cur > 0.9 && sup.press && sup.dec > 0.98 && sup.click >= sup.c16[0] && sup.click < sup.c16[1], JSON.stringify(sup));

    /* ---------------- N. V8 narration: lines on the V7 beats, captions carry the voice */
    const spans = [];   // spoken span of every caption on the film clock (merged units split for the captions)
    for (const u of PLACE.units) {
      if (u.cues.length === 1) spans.push({ id: u.cues[0], s: u.start, e: u.end, half: null });
      else { spans.push({ id: u.cues[0], s: u.start, e: u.split, half: 'a' }); spans.push({ id: u.cues[1], s: u.split, e: u.end, half: 'b' }); }
    }
    // V9: a caption followed by the next within 0.3 s keeps its text until the middle of the gap (H2), so its end on screen is that midpoint
    const carry = spans.map(sp => { const i = cues.findIndex(x => x.id === sp.id), c = cues[i], nx = cues[i + 1];
      const joined = !!nx && nx.start - c.end < 0.3, shownTo = joined ? (c.end + nx.start) / 2 : c.end;
      return { id: sp.id, after: +(shownTo - sp.e).toFixed(2), ok: !!c && (sp.half === 'b' ? c.start <= sp.s + 0.001 : c.start <= sp.s - 0.05) && (sp.half === 'a' ? c.end >= sp.e - 0.03 : shownTo >= sp.e + (joined ? 0.1 : 0.2)) }; });
    check('N1 SRT cues: every cue runs from just before its spoken words until ≥ 0.2 s after them (≥ 0.1 s when the next line follows at once) — 29 cues, 24 spoken lines', PLACE.units.length === 24 && carry.length === 29 && carry.every(x => x.ok),
      carry.filter(x => !x.ok).map(x => x.id + ' (' + x.after + ' s)').join(', ') || 'semua 29; paling rapat ' + carry.filter(x => x.after < 0.2 && x.after > -1).map(x => x.id + ' +' + x.after + ' s').join(', '));
    const gaps = PLACE.units.slice(1).map((u, i) => +(u.start - PLACE.units[i].end).toFixed(3));
    const c12u = PLACE.units.find(u => u.unit === 'c12'), waU = PLACE.units.filter(u => /^w/.test(u.unit));
    // V9: a kit / WhatsApp line's beat is its V7 caption beat on the V9 clock (V7_CUE_TIMES); c07/c09/c10 and the new lines have their own
    // beats (N4). c02/c03 follow the four opening lines (≤ 1.4 / 2.1 s late, c03 still ends before the impact); the 1:44 sentence may lead by ≤ 0.5 s
    const LAG = { c02: 1.4, c03: 2.1 }, LEAD = { c14c15: 0.5 }, own = u => /^(a\d|n1|p1|b1b2|c07n|c09n|c10n)$/.test(u.unit);
    const beatOk = PLACE.units.every(u => u.shift >= -(LEAD[u.unit] || 0) - 1e-6 && u.shift <= (LAG[u.unit] || 1.5) + 1e-6 && u.end <= u.scene_end + 1e-6);
    const v7 = await R.page.evaluate(() => V7_CUE_TIMES), seg8 = await R.page.evaluate(() => SCENES[7].start);
    const anchorsV7 = PLACE.units.every(u => own(u) || Math.abs(u.anchor - v7[u.cues[0]][0]) <= 0.01);   // ≤ 10 ms: rounding of the V7 → V9 clock conversion (< 1 frame)
    check('N2 each line starts on its beat or ≤ 1.5 s later (c02/c03 ≤ 1.4/2.1 s after the opening lines, the 1:44 sentence ≤ 0.5 s earlier and inside the follow-up segment), ≥ 0.25 s between lines, inside its segment; "84 peratus" exactly on its beat; WhatsApp lines inside the insert',
      beatOk && anchorsV7 && gaps.every(g => g >= 0.25 - 1e-6) && Math.abs(c12u.shift) < 1e-6 && waU.every(u => u.start >= ins.atF && u.end <= ins.atF + ins.len) && PLACE.units.find(u => u.unit === 'c14c15').start >= seg8,
      'anjakan: ' + PLACE.units.filter(u => Math.abs(u.shift) > 1e-6).map(u => u.unit + ' ' + (u.shift > 0 ? '+' : '') + u.shift.toFixed(2) + ' s').join(', ') + ' · jarak min ' + Math.min(...gaps).toFixed(2) + ' s' + (anchorsV7 ? '' : ' · RENTAK V7 TIDAK SEPADAN'));
    const W8 = readWavMono16(NARR_WAV), pcm = W8.pcm, SRN = 48000, inLine = new Uint8Array(pcm.length);
    for (const u of PLACE.units) for (let i = Math.max(0, Math.floor((u.start - 0.07) * SRN)); i < Math.min(pcm.length, Math.ceil((u.end + 0.21) * SRN)); i++) inLine[i] = 1;
    let stray = 0; for (let i = 0; i < pcm.length; i++) if (!inLine[i]) stray = Math.max(stray, Math.abs(pcm[i]));
    const lineDb = PLACE.units.map(u => { let s = 0, k = 0; for (let i = Math.floor(u.start * SRN); i < Math.floor(u.end * SRN); i++) { s += pcm[i] * pcm[i]; k++; } return 10 * Math.log10(s / k / 1073741824 + 1e-20); });
    check('N3 narasi-v9.wav (141.400 s, 48 kHz mono 16-bit) holds speech in the 24 placed lines and digital silence elsewhere',
      W8.fmt.sr === 48000 && W8.fmt.ch === 1 && W8.fmt.bits === 16 && pcm.length === Math.round(DUR * 48000) && stray === 0 && lineDb.every(d => d > -35),
      'di luar baris: puncak ' + stray + ' · paras baris ' + Math.min(...lineDb).toFixed(1) + ' hingga ' + Math.max(...lineDb).toFixed(1) + ' dBFS');
    // V9: the benefit focus beats are real phrase onsets in narasi-v9.wav (near-silence just before, speech just after)
    const rmsDb = (a, z) => { let q = 0, k = 0; for (let i = Math.floor(a * SRN); i < Math.floor(z * SRN); i++) { q += pcm[i] * pcm[i]; k++; } return +(10 * Math.log10(q / k / 1073741824 + 1e-20)).toFixed(1); };
    // (a phrase can open on a soft consonant, e.g. the "s" of "Sistem", so speech is measured over the 0.25 s after the beat)
    const beats = (await R.page.evaluate(() => BENEFIT_BEATS)).map(b => ({ b, before: rmsDb(b - 0.07, b - 0.01), after: rmsDb(b + 0.02, b + 0.25) }));
    check('N5 the four benefit-card beats are phrase onsets in narasi-v9.wav: near-silence in the 60 ms before (< −40 dBFS), speech in the 0.25 s after (> −30 dBFS, ≥ 10 dB above the pause)',
      beats.length === 4 && beats.every(x => x.before < -40 && x.after > -30 && x.after - x.before >= 10), JSON.stringify(beats));
    // V9: the new and reworded lines sit on the picture beats the user named (all read from the page's own timing)
    const bt = await R.page.evaluate(() => {
      const F = filmTime, first = (ref, f0, f1, min) => { for (let f = f0; f <= f1; f++) { window.renderFrame(f); if (window.__eff(window.__ref(ref)) >= min) return f / 60; } return null; };
      return { nodes: T.a.nodes.map(F), forms: F(T.b.paper2), impact: F(T.d.impact), settle: F(T.d.settle), mapIn: F(T.e.in[1]), status: F(T.g.tapStatus), save: F(T.h.save), write: F(T.i.write), closing: F(T.n.title),
        team2: first('ov.team2', Math.round(F(T.f.team2[0]) * 60), Math.round(F(T.f.team2[1]) * 60) + 30, 0.98), bf0: first('ov.bf0', Math.round(SCENES[8].start * 60), Math.round(SCENES[8].start * 60) + 120, 0.5),
        arrive0: (() => { for (let f = Math.round(SCENES[8].start * 60); f < Math.round(SCENES[8].end * 60); f++) { window.renderFrame(f); const el = window.__ref('ov.bf0'); if (!/perspective|scale/.test(el.style.transform) && parseFloat(getComputedStyle(el).opacity) > 0.99) return f / 60; } return null; })() };
    });
    const UN = id => PLACE.units.find(u => u.unit === id);
    const n4 = {
      opening: UN('a1').start <= bt.nodes[0] && [1, 2, 3].every(i => UN('a' + (i + 1)).start >= bt.nodes[i] - 0.05 && UN('a' + (i + 1)).start <= bt.nodes[i] + 0.6),
      a4IntoForms: UN('a4').end >= bt.forms + 0.5, c03BeforeImpact: UN('c03').end <= bt.impact - 0.3,
      n1AfterReveal: UN('n1').start >= bt.settle + 0.8 && UN('n1').start <= bt.settle + 1.5, c04OnMap: UN('c04').start >= bt.mapIn - 0.1 && UN('c04').start <= bt.mapIn + 0.5,
      p1WithCard: bt.team2 !== null && UN('p1').start >= bt.team2 - 0.4 && UN('p1').start <= bt.team2 + 0.5, c07OnStatus: UN('c07n').start >= bt.status - 0.5 && UN('c07n').start <= bt.status,
      c09OnSave: Math.abs(UN('c09n').start - bt.save) <= 0.1, c10OnWrite: Math.abs(UN('c10n').start - bt.write) <= 0.1,
      b1OnCard: bt.bf0 !== null && bt.arrive0 !== null && UN('b1b2').start >= bt.bf0 && UN('b1b2').start <= bt.arrive0, b2BeforeClosing: UN('b1b2').end <= UN('c18c19').start - 0.5 && UN('b1b2').end <= bt.closing
    };
    const r2 = x => x === null ? null : +x.toFixed(2);
    check('N4 V9 beats: a1–a4 on the four flow steps (a4 runs into the forms), c03 ends before the title impact, "Inilah NADI Muallim" 0.8–1.5 s after the title settles, c04 as the map lands, p1 with the two-worker card, c07 on the status tap, c09 on Save, c10 on the table write, b1 while the first benefit card lifts into focus, b2 done before the closing line',
      Object.values(n4).every(Boolean), (Object.entries(n4).filter(([, v]) => !v).map(([k]) => 'GAGAL ' + k).join(', ') + ' ') + JSON.stringify({ a: ['a1', 'a2', 'a3', 'a4'].map(k => UN(k).start), langkah: bt.nodes.map(r2), n1: UN('n1').start, tajuk: r2(bt.settle), c04: UN('c04').start, peta: r2(bt.mapIn), p1: UN('p1').start, kad2: r2(bt.team2), c07: UN('c07n').start, status: r2(bt.status), c09: UN('c09n').start, simpan: r2(bt.save), c10: UN('c10n').start, jadual: r2(bt.write), b1: UN('b1b2').start, kad1: r2(bt.bf0), kad1fokus: r2(bt.arrive0), b2tamat: UN('b1b2').end, c18: UN('c18c19').start }));

    /* ---------------- M. paper Borang ACD + Lampiran 1 (layout of the PKD Muallim forms) */
    const forms = await R.page.evaluate(() => {
      const f = window.__ref('man.paper').textContent.replace(/\s+/g, ' '), l = window.__ref('man.paper2').textContent.replace(/\s+/g, ' ');
      const clip = r => getComputedStyle(window.__ref(r)).clipPath;
      window.__at(6.9); const blank = ['man.f0', 'man.l0_0'].map(clip);
      window.__at(9.3);
      const written = ['man.f0', 'man.f2', 'man.f3', 'man.l0_0', 'man.l6_0', 'man.l6_5'].map(r => clip(r) === 'none');
      const ticks = [0, 1, 2].map(i => window.__ref('man.fc' + i).getAttribute('stroke-dashoffset'));
      const vis = window.__eff(window.__ref('man.paper')) > 0.98 && window.__eff(window.__ref('man.paper2')) > 0.98;
      const shown = window.__visibleText(0.3);
      return { f, l, blank, written, ticks, vis, phone: /\b0\d{1,2}[- ]?\d{7,8}\b/.test(f + l + shown), focus: T.b.write };
    });
    const formFields = ['PEJABAT KESIHATAN DAERAH MUALLIM BORANG PENGESANAN KES AKTIF (ACTIVE CASE DETECTION - ACD) DENGGI', 'BAHAGIAN A: MAKLUMAT LOKALITI & SIASATAN', 'TARIKH', 'MASA', 'NAMA ANGGOTA/NO TEL',
      'BAHAGIAN B: MAKLUMAT ISI RUMAH & SARINGAN GEJALA DENGGI', 'rujuk Lampiran 1', 'BAHAGIAN C: STATUS PEMERIKSAAN PERSEKITARAN', 'Ada takungan air berpotensi pembiakan Aedes?',
      'BAHAGIAN D: PENGESAHAN PEGAWAI DI LAPANGAN', 'Jumlah Sampel Diambil di Lapangan (jika berkaitan):', 'Diterima oleh:'];
    const lampFields = ['LAMPIRAN 1', 'Alamat / No. Rumah', '1-dilawati', '4-enggan', 'Bil. Penghuni', 'Nama dan no telefon ketua rumah/', 'Catatan Nama & No telefon (Kes Bergejala)', 'Tindakan Lapangan', 'Pendidikan Kesihatan'];
    const nz = x => x.replace(/\s+/g, '');   // line breaks in the form headings have no whitespace in textContent
    const hasF = x => nz(forms.f).includes(nz(x)), hasL = x => nz(forms.l).includes(nz(x));
    check('M1 manual scene shows the Borang ACD (Bahagian A–D) and Lampiran 1 (7 columns) as in the kit PDFs', formFields.every(hasF) && lampFields.every(hasL) && forms.vis,
      formFields.filter(x => !hasF(x)).concat(lampFields.filter(x => !hasL(x))).join(' | ') || 'semua medan ada');
    check('M2 the forms are filled by hand during 6.95–9.0 s (Bahagian A, C ticks, Lampiran rows 1–7), entries fictional, no phone numbers',
      forms.blank.every(c => c !== 'none') && forms.written.every(Boolean) && forms.ticks.every(x => x === '0') && !forms.phone, JSON.stringify({ written: forms.written, ticks: forms.ticks, phone: forms.phone }));

    /* ---------------- V. V3 hard gates */
    const gate = await R.page.evaluate(() => {
      const gateF = Math.round(filmTime(24.3) * 60);
      const on = []; for (let f = 0; f < gateF; f++) { window.renderFrame(f); if (window.__phoneOn()) on.push(f); }
      let first = -1; for (let f = gateF; f <= gateF + 42 && first < 0; f++) { window.renderFrame(f); if (window.__phoneOn()) first = f; }
      const named = [1027, 1065, 1160, 1457].map(fs => { window.__at(fs / 60); return window.__phoneOn(); });   // the V3 named story frames
      const early = window.ACD.soundEvents().filter(e => (e.k === 'tap' || e.k === 'whoosh') && e.t < filmTime(24.3));
      return { on: on.length, first, gateF, named, early: early.length };
    });
    check('V1 phone layer (frame, shadow, badges, tap marker) hidden before story 24.30 (film frame 1788); story frames 1027/1065/1160/1457 hidden', gate.on === 0 && gate.named.every(v => !v), gate.on + ' frames with phone before frame ' + gate.gateF + '; named ' + gate.named.join(','));
    check('V2 first phone frame = story 24.30 (film 29.80, frame 1788); no phone tap or reveal sound before it', gate.first >= gate.gateF && gate.gateF === 1788 && gate.early === 0, 'first frame ' + gate.first + ' (' + (gate.first / 60).toFixed(3) + ' s), early sounds ' + gate.early);
    const settle = await R.page.evaluate(() => { const st = t => { window.__at(t); return window.__ref('phone').style.transform + '|' + window.__ref('w.phone').style.transform; }; const a = st(25.6), b = st(28.0), c = st(32.4); window.__at(25.6); return { same: a === b && b === c, yaw: window.__yaw('phone') }; });
    check('V3 phone settled by 25.60 at a shallow three-quarter angle and still until the push-in', settle.same && Math.abs(settle.yaw) >= 8 && Math.abs(settle.yaw) <= 14, 'yaw ' + settle.yaw + '°');
    const typing = await R.page.evaluate(() => {
      const cell = () => document.querySelector('[data-ref="man.lapGrid"] [data-focus]');
      window.__at(11.85); const c = cell(), done = c.textContent === '14' && c.classList.contains('done'), lap = window.__eff(window.__ref('man.laptop'));
      window.__at(11.7); const mid = cell().textContent;
      // V9 (draft 3): no frozen hold — the camera keeps a slow push, but the typed cell stays put on screen while it is read
      const cellAt = t => { window.__at(t); const r = cell().getBoundingClientRect(); return [(r.left + r.right) / 2, (r.top + r.bottom) / 2]; };
      const c0 = cellAt(11.85), c1 = cellAt(12.33), drift = +Math.hypot(c1[0] - c0[0], c1[1] - c0[1]).toFixed(1);
      let still = 0, prevT = null;
      for (let f = Math.round(filmTime(11.85) * 60); f <= Math.round((filmTime(T.d.impact) - 0.5) * 60); f++) { window.renderFrame(f); const v = window.__ref('man').style.transform; if (v === prevT) still++; prevT = v; }
      const hold = drift <= 12 && still === 0;
      window.__at(13.35); const title = window.__eff(window.__ref('ov.title')), impact = window.ACD.soundEvents().some(e => e.k === 'impact' && Math.abs(e.t - filmTime(13.35)) < 1e-6);
      const riser = window.ACD.soundEvents().find(e => e.k === 'riser');
      const tt = t => { window.__at(t); return window.__ref('ov.title').style.transform; };
      const settled = tt(13.8) === tt(16.0);
      return { done, lap, mid, hold, drift, still, title, impact, riserEnd: riser ? +(riser.t + riser.d).toFixed(3) : null, settled };
    });
    check('V4 re-typing finished by 11.85 (cell "14" complete); V9 (draft 3): the camera keeps a slow push up to the dissolve (no frozen frame) while the cell stays put (≤ 12 px to 12.33)',
      typing.done && typing.lap > 0.98 && typing.hold, JSON.stringify({ done: typing.done, at11_7: typing.mid, drift: typing.drift, stillFrames: typing.still }));
    // V9 (draft 3): manual → title → NADI map in one smooth flow: no dark gap, no single-frame jump, no frozen stretch
    const flow13 = await R.page.evaluate(() => {
      const q = r => window.__ref(r), opa = el => el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' ? parseFloat(getComputedStyle(el).opacity) : 0;
      const fi = filmTime(T.d.impact), fo = filmTime(T.d.out[0]), fn = filmTime(T.e.in[1]);
      const names = ['man', 'bg.end', 'ov.title', 'ov.bloom', 'w.nadi'];
      let prev = null, maxStep = { }, gapA = 1, gapB = 1;
      for (let f = Math.round((fi - 1.2) * 60); f <= Math.round((fn + 0.3) * 60); f++) {
        window.renderFrame(f); const ft = f / 60, v = {};
        for (const n of names) v[n] = opa(q(n));
        if (prev) for (const n of names) maxStep[n] = Math.max(maxStep[n] || 0, Math.abs(v[n] - prev[n]));
        if (ft >= fi - 0.7 && ft <= fi + 0.3) gapA = Math.min(gapA, 1 - (1 - v['man']) * (1 - v['bg.end']));     // share of the frame not showing the dark base
        if (ft >= fo - 0.05 && ft <= fn + 0.05) gapB = Math.min(gapB, 1 - (1 - v['w.nadi']) * (1 - v['bg.end']));
        prev = v;
      }
      for (const n in maxStep) maxStep[n] = +maxStep[n].toFixed(3);
      return { maxStep, coverManualToTitle: +gapA.toFixed(3), coverTitleToMap: +gapB.toFixed(3) };
    });
    check('V13 manual → title → NADI map (V9, draft 3): every layer changes by ≤ 0.12 per frame (no single-frame jump or flash), the teal background is in before the manual scene has gone and the map crossfades with the title (no dip to black)',
      Object.values(flow13.maxStep).every(x => x <= 0.12) && flow13.coverManualToTitle >= 0.95 && flow13.coverTitleToMap >= 0.95, JSON.stringify(flow13));
    // V9 (draft 3): the Google Earth view in 3D behind the NADI introduction (src/kampung3d.js)
    const k3 = await R.page.evaluate(() => {
      const q = r => window.__ref(r), out = {}, T3 = K3D.T3;
      window.__atF(25.0);
      const cv = q('k3d'), cr = cv.getBoundingClientRect(), mr = q('na.map').getBoundingClientRect(), card = q('na.card').getBoundingClientRect(), lab = q('k3d.name').getBoundingClientRect(), rad = q('k3d.rad').getBoundingClientRect();
      out.ok = K3D.ok && !K3D.failed; out.err = K3D.err || null; out.visible = window.__eff(cv) > 0.98;
      out.photo = K3D.tex && K3D.tex.image ? [K3D.tex.image.naturalWidth, K3D.tex.image.naturalHeight] : null;
      out.canvas = [cr.left, cr.top, cr.right, cr.bottom].map(Math.round); out.panelVisible = [Math.max(0, mr.left), mr.top, Math.min(1920, mr.right), mr.bottom].map(Math.round);
      out.svgHidden = parseFloat(getComputedStyle(q('na.mapSvg')).opacity) === 0;
      out.credit = window.__eff(q('k3d.credit')) > 0.98 && /Google Earth/.test(q('k3d.credit').textContent);
      out.sys = window.__textVisible('imej udara', 0.98);
      const dome = K3D.scene.children.find(o => o.geometry && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.thetaLength < 2);
      out.domeR = dome ? dome.geometry.parameters.radius : null; out.labelsRight = Math.round(Math.max(lab.right, rad.right)); out.cardLeft = Math.round(card.left);
      // canvas px of a world point, and the ground point under a canvas pixel
      const toPx = (P, cam) => { const v = P.clone().project(cam); return [(v.x + 1) / 2 * K3D.bw, (1 - v.y) / 2 * K3D.bh]; };
      const ground = (x, y) => { const v = new T3.Vector3(x / K3D.bw * 2 - 1, 1 - y / K3D.bh * 2, 0.5).unproject(K3D.camera).sub(K3D.camera.position).normalize(); return K3D.camera.position.clone().addScaledVector(v, -K3D.camera.position.y / v.y); };
      // the photo covers every visible pixel (outside the card and the 30 px strips around it) at both ends of the turn
      const inPhoto = P => { const v = P.clone().project(K3D.cam0); const u = (v.x + 1) / 2 * K3D.vw / K3D_CAM.w, w = 1 - (1 - v.y) / 2 * K3D.vh / K3D_CAM.h; return u >= 0 && u <= 1 && w >= 0 && w <= 1; };
      const cardC = [card.left - cr.left, card.top - cr.top, card.right - cr.left, card.bottom - cr.top].map(v => v * K3D.bw / cr.width);
      const cover = () => { let n = 0, bad = 0; for (let y = 4; y < K3D.bh; y += 24) for (let x = 4; x < K3D.bw; x += 24) { const nearCard = x >= cardC[0] - 20 && x <= cardC[2] + 40 && y >= cardC[1] - 40 && y <= cardC[3] + 40; if (nearCard) continue; n++; if (!inPhoto(ground(x, y))) bad++; } return bad + '/' + n; };
      // the first and last frames in which the view is on screen (the NADI layer fades in at ≈22.05 s and out by 29.84 s)
      const seen = f => { window.renderFrame(f); return window.__eff(cv) > 0.001; };
      let fA = Math.ceil(K3D.win[0] * 60); while (!seen(fA)) fA++; let fB = Math.floor(K3D.win[1] * 60); while (!seen(fB)) fB--;
      out.seen = [+(fA / 60).toFixed(3), +(fB / 60).toFixed(3)];
      window.renderFrame(fA); out.coverStart = cover(); const c0 = toPx(new T3.Vector3(0, 0, 0), K3D.camera), turn0 = kampungTurn(fA / 60).deg, near = ground(K3D.bw * 0.357, K3D.bh * 0.95);
      window.renderFrame(fB); out.coverEnd = cover(); const c1 = toPx(new T3.Vector3(0, 0, 0), K3D.camera), turn1 = kampungTurn(fB / 60).deg;
      out.centre = [c0, c1].map(c => c.map(Math.round)); out.turn = +(turn1 - turn0).toFixed(1); out.nearMoves = Math.round(toPx(near, K3D.camera)[0] - K3D.bw * 0.357);
      const g = K3D.r.getContext(), sample = () => { const b = new Uint8Array(4 * 256); g.readPixels(Math.round(K3D.bw * 0.3), Math.round(K3D.bh * 0.35), 16, 16, g.RGBA, g.UNSIGNED_BYTE, b); return b; };
      window.__atF(25.0); const a0 = sample(); window.__atF(25.5); const a1 = sample();
      let diff = 0; for (let i = 0; i < a0.length; i++) diff += Math.abs(a0[i] - a1[i]); out.pixelChange = +(diff / a0.length).toFixed(2);
      window.__at(95); out.svgBack = parseFloat(getComputedStyle(q('na.mapSvg')).opacity) === 1 && getComputedStyle(q('k3d')).display === 'none' && getComputedStyle(q('k3d.credit')).display === 'none';
      return out;
    });
    const at = [K3D_AT[0] * 1708, K3D_AT[1] * 1013];
    check('K3 NADI introduction (V9, draft 3): the Google Earth view in 3D fills the visible map panel under the card (WebGL, offline, photo 2000 × 1253, credited), the 2D map hidden and back for the follow-up; a 200 m dome at the outbreak centre, held left of the card while the view turns ≥ 20° (foreground right → left); the photo covers every visible pixel',
      k3.ok && k3.visible && k3.svgHidden && k3.svgBack && k3.credit && k3.sys && k3.domeR === 200 && k3.labelsRight < k3.cardLeft && k3.photo && k3.photo[0] === 2000 && k3.photo[1] === 1253 &&
      k3.canvas.every((v, i) => Math.abs(v - k3.panelVisible[i]) <= 1) && k3.centre.every(c => Math.abs(c[0] - at[0]) <= 2 && Math.abs(c[1] - at[1]) <= 2) &&
      k3.turn >= 20 && k3.nearMoves < -40 && k3.coverStart.startsWith('0/') && k3.coverEnd.startsWith('0/') && k3.pixelChange > 1, JSON.stringify(k3));
    check('V5 title on screen at the impact (story 13.35 = film 18.85; the riser ends there), settled by story 13.80', typing.title > 0.98 && typing.impact && typing.riserEnd === 18.85 && typing.settled, JSON.stringify({ title: typing.title, impact: typing.impact, riserEnd: typing.riserEnd, settled: typing.settled }));
    const ang = await R.page.evaluate(() => {
      const at = t => { window.__at(t); return { ph: window.__yaw('phone'), dk: window.__yaw('desktop') }; };
      const tr = t => { window.__at(t); return window.__ref('phone').style.transform + '|' + window.__ref('desktop').style.transform + '|' + window.__ref('w.desk').style.transform; };
      return { entry: at(26), record: at(40), sync: at(58), joint: at(66), close: at(72), verify: at(80), complete: tr(64.5) === tr(69.5) };
    });
    const inYaw = v => Math.abs(v) >= 8 && Math.abs(v) <= 14;
    check('V6 3D yaw 8–14° on the phone (entry, Sheets, joint) and monitor; frontal for reading; reveal complete by 64.50 and still during the count-up',
      inYaw(ang.entry.ph) && ang.record.ph === 0 && inYaw(ang.sync.ph) && inYaw(ang.joint.ph) && inYaw(ang.joint.dk) && ang.close.ph === 0 && ang.verify.ph === 0 && ang.complete,
      'entry ' + ang.entry.ph + '° · rekod ' + ang.record.ph + '° · Sheets ' + ang.sync.ph + '° · telefon ' + ang.joint.ph + '° / monitor ' + ang.joint.dk + '° · kad liputan ' + ang.close.ph + '° · Bahagian D ' + ang.verify.ph + '° · tetap 64.5–69.5: ' + ang.complete);
    const vis = r => 'return window.__eff(window.__ref("' + r + '")) >= 0.98;';
    let h = await longestRun(R.page, 49, 56, vis('ov.saved'));
    const cnt = await R.page.evaluate(() => { window.__at(50.5); const a = window.__ref('ov.savedCount').textContent; window.__at(52.5); return a + ' → ' + window.__ref('ov.savedCount').textContent; });
    check('V7 "Rekod disimpan" held ≥ 4 s from the 49.32 cue; the count updates', h.sec >= 4 && h.from <= 49.95 && cnt === '16 / 19 → 17 / 20', h.sec.toFixed(2) + ' s (' + h.from.toFixed(2) + '–' + h.to.toFixed(2) + '), ' + cnt);
    h = await longestRun(R.page, 62, 78, 'const r = window.__ref("ov.res"); return window.__eff(r) >= 0.98 && /Liputan ACD/i.test(r.textContent) && /84%/.test(r.textContent) && /92 daripada 110 premis dilawati/.test(r.textContent);');
    const pillRun = await longestRun(R.page, 70, 78, 'return window.__eff(window.__ref("ov.capai")) >= 0.98;');
    const camStill = await longestRun(R.page, 70.9, 77.9, 'const v = window.__ref("w.phone").style.transform; const same = v === window.__p; window.__p = v; return same;');
    check('V8 after the count-up: "84%" + "92 daripada 110 premis dilawati" + "Capai Sasaran" held to ≥ 74.86 while the close-up keeps moving (V7: no still frame run)', h.from <= 71.0 && h.to >= 74.86 && pillRun.from <= 71.8 && pillRun.to >= 74.86 && camStill.sec <= 0.05,
      'angka ' + h.from.toFixed(2) + '–' + h.to.toFixed(2) + ' s, pil ' + pillRun.from.toFixed(2) + '–' + pillRun.to.toFixed(2) + ' s, kamera pegun paling lama ' + camStill.sec.toFixed(3) + ' s');
    const fu = await R.page.evaluate(() => { window.__at(85.9); const q = window.__eff(window.__ref('ov.fq')) >= 0.98; window.__at(87.7); const six = window.__eff(window.__ref('ov.f6')) >= 0.98 && window.__textVisible('belum dilawati', 0.98); window.__at(90.65); const twelve = window.__eff(window.__ref('ov.lf12')) >= 0.98 && /rgba\(251, 191, 36, 0\.95\) 0px 0px 0px 3px/.test(getComputedStyle(window.__ref('ov.lf12')).boxShadow); return { q, six, twelve }; });
    check('V9 follow-up: the supervisor\'s question by 85.9 s, "6 belum dilawati" by 87.7 s, "12 berkunci / kosong" highlighted by 90.65 s (V9: 0.3 s fade from 90.30)', fu.q && fu.six && fu.twelve, JSON.stringify(fu));
    /* ---------------- O. opening flow chart (V5) */
    const fl = await R.page.evaluate(() => {
      const titles = [0, 1, 2, 3].map(i => window.__ref('fc.n' + i).querySelector('.fc-t').textContent);
      const order = T.a.nodes.map((t0, i) => { window.__at(t0 - 0.05); const before = window.__eff(window.__ref('fc.n' + i)); window.__at(t0 + 0.4); return before < 0.05 && window.__eff(window.__ref('fc.n' + i)) > 0.98; });
      window.__at(4.75); const arrows = [0, 1, 2].map(i => window.__ref('fc.a' + i).getAttribute('stroke-dashoffset') === '0');
      let question = false; for (let f = 0; f <= Math.round(filmTime(13.2) * 60); f += 6) { window.renderFrame(f); if (window.__textVisible('Premis mana yang masih', 0.3)) { question = true; break; } }
      return { titles, order, arrows, question };
    });
    check('O1 the film opens with the flow "Notifikasi diterima → Peningkatan kes → Isytihar wabak → ACD", one step at a time, no supervisor question in 0–13.2 s',
      fl.titles.join('|') === 'Notifikasi diterima|Peningkatan kes|Isytihar wabak|Pengesanan Kes Aktif (ACD)' && fl.order.every(Boolean) && fl.arrows.every(Boolean) && !fl.question, JSON.stringify(fl));
    /* ---------------- R. record entry pacing (V5) */
    const pace = await R.page.evaluate(() => {
      const G = T.g, ev = [G.tapStatus, ...G.occ, G.toB[0], G.toggle, ...G.chips, G.hlSymp, G.hlRef, G.toC[0], G.cb0, G.cb1, G.hlRis, G.hlAct, G.hlSave, T.h.save].sort((a, b) => a - b);
      let maxGap = 0; for (let i = 1; i < ev.length; i++) maxGap = Math.max(maxGap, ev[i] - ev[i - 1]);
      const occGap = Math.min(...G.occ.slice(1).map((t, i) => t - G.occ[i]));
      return { maxGap: +maxGap.toFixed(2), occGap: +occGap.toFixed(2), first: ev[0], last: ev[ev.length - 1] };
    });
    check('R1 record entry paced evenly over 33–49 s: status, occupants (taps ≥ 0.4 s apart), symptoms, referral, Bahagian C, action, save — no gap > 2.2 s',
      pace.maxGap <= 2.2 && pace.occGap >= 0.4 && pace.first > 33.3 && pace.last > 49, JSON.stringify(pace));
    /* ---------------- S. follow-up step flow (V5) */
    const flow = await R.page.evaluate(() => {
      const L = T.l, ev = [L.q, L.n110, L.branch[0], L.n92, L.n12, L.n6, L.red[0], L.red[1], L.amber[0], L.amber[1], L.cursor[0], L.click, L.plan[1], L.marks, L.route[0], L.route[1], L.check[1], L.rings[1], L.dot[0]].sort((a, b) => a - b);
      let maxGap = 0; for (let i = 1; i < ev.length; i++) maxGap = Math.max(maxGap, ev[i] - ev[i - 1]);
      const dotAt = t => { window.__at(t); return window.__ref('na.mapSvg').querySelector('[data-mk="dot"] > g').getAttribute('transform'); };
      const moving = dotAt(101.0) !== dotAt(103.0);
      window.__at(97.5); const route = window.__ref('na.mapSvg').querySelector('[data-mk="route"]').children[1].getAttribute('opacity') === '1';
      window.__at(92.5); const amber = Array.from(window.__ref('na.mapSvg').querySelectorAll('[data-lk]')).filter(g => +g.getAttribute('opacity') > 0.9).length;
      window.__at(89.5); const red = Array.from(window.__ref('na.mapSvg').querySelectorAll('[data-rd]')).filter(g => +g.getAttribute('opacity') > 0.9).length;
      return { maxGap: +maxGap.toFixed(2), moving, route, amber, red };
    });
    check('S1 follow-up flows step by step (no gap > 2.5 s): 6 red and 12 amber premises on the map, planned route drawn, the team dot moves to the end',
      flow.maxGap <= 2.5 && flow.red === 6 && flow.amber === 12 && flow.route && flow.moving, JSON.stringify(flow));
    // V9: the benefit cards orbit; each one is in focus (centred, scale 1, sharp, glowing) while its phrase is spoken
    const orb = await R.page.evaluate(() => {
      const q = i => window.__ref('ov.bf' + i), B = BENEFIT_BEATS, f0 = Math.round(SCENES[8].start * 60), f1 = Math.round(SCENES[8].end * 60);
      const titles = [0, 1, 2, 3].map(i => q(i).querySelector('b').textContent.trim()), proto = [0, 1, 2, 3].map(i => !!q(i).querySelector('.proto-badge'));
      const rows = [];
      for (let f = f0; f <= f1; f++) {
        window.renderFrame(f);
        rows.push({ t: f / 60, c: [0, 1, 2, 3].map(i => { const el = q(i), bb = el.getBoundingClientRect(), cs = getComputedStyle(el), m = /blur\(([\d.]+)px\)/.exec(cs.filter);
          return { cx: (bb.left + bb.right) / 2, cy: (bb.top + bb.bottom) / 2, w: bb.width, h: bb.height, l: bb.left, r: bb.right, tp: bb.top, bt: bb.bottom, op: parseFloat(cs.opacity), blur: m ? +m[1] : 0, plain: !/perspective|rotate|scale/.test(el.style.transform), glow: /255, 255, 255/.test(cs.boxShadow) }; }) });
      }
      const inFocus = row => row.c.findIndex(c => c.plain && Math.abs(c.cx - 960) <= 0.5 && Math.abs(c.cy - 540) <= 0.5 && Math.abs(c.w - 600) <= 0.5 && c.blur === 0 && c.op > 0.99 && c.glow);
      const outF = filmTime(T.m.out[0]);   // the scene starts to fade here
      const spans = [0, 1, 2, 3].map(i => { const a = B[i] + 0.4, b = i < 3 ? B[i + 1] - 0.25 : outF - 0.02; const rs = rows.filter(r => r.t >= a && r.t <= b);
        return { card: i + 1, from: +a.toFixed(2), to: +b.toFixed(2), frames: rs.length, ok: rs.length > 30 && rs.every(r => inFocus(r) === i) }; });
      let minOp = 1, inside = true;
      for (const r of rows) { if (r.t < B[0] || r.t >= outF) continue; for (const c of r.c) { minOp = Math.min(minOp, c.op); if (c.l < 0 || c.r > 1920 || c.tp < 0 || c.bt > 1080) inside = false; } }   // until the scene fades
      return { titles, proto, spans, minOp: +minOp.toFixed(2), inside };
    });
    const bfNames = ['Rekod ACD pada telefon', 'Kiraan liputan automatik', 'Pengesahan dan ringkasan', 'Perancangan lawatan susulan'];
    check('V10 benefit cards (V9): card 1–4 each in focus — centred, scale 1, sharp, glowing — from ≤ 0.4 s after its phrase starts until the next is due; all four on screen (≥ 0.6) and inside the frame until the scene fades; the last marked Prototaip Integrasi',
      orb.spans.every(x => x.ok) && orb.minOp >= 0.6 && orb.inside && bfNames.every((n, i) => orb.titles[i] === n) && orb.proto.join() === 'false,false,false,true',
      JSON.stringify({ spans: orb.spans, minOp: orb.minOp, inside: orb.inside }));
    h = await longestRun(R.page, 112.35, 119.99, 'return window.__textVisible("NADI") && window.__textVisible("Dari Survelan ke Respons Denggi") && window.__textVisible("Pejabat Kesihatan Daerah Muallim");');
    check('V11 closing lockup fully in by 113.20 and held to the final frame', h.from <= 113.2 && h.to >= 119.98, h.sec.toFixed(2) + ' s (' + h.from.toFixed(2) + '–' + h.to.toFixed(2) + ')');
    const nadiAct = await R.page.evaluate(() => { window.__at(23.5); const shown = window.__eff(window.__ref('na.openBtn')) > 0.98 && window.__textVisible('Buka Operasi ACD', 0.98); window.__at(24.12); return { shown, pressed: window.__ref('na.openBtn').classList.contains('press') || window.__ref('na.openBtn').classList.contains('done'), click: T.e.click }; });
    check('V12 NADI locality card: "Buka Operasi ACD" prototype action activated at ≈24.10, before the phone', nadiAct.shown && nadiAct.pressed && Math.abs(nadiAct.click - 24.1) < 0.05, JSON.stringify(nadiAct));

    /* ---------------- G. V6 opening globe with the 200 m ACD radius */
    const glb = await R.page.evaluate(() => {
      const G = GLOBE, gl = G.gl;
      const ok = !!(G.ok && gl) && !window.__ref('fc.map').classList.contains('no-gl');
      const read = (x, y) => { const o = new Uint8Array(4); gl.readPixels(Math.round(x - G.box[0]), Math.round(G.box[3] - (y - G.box[1])), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, o); return Array.from(o); };
      if (!ok) return { ok };
      window.__at(2.0); const surface = read(G.cx, G.cy - 200);
      window.__at(5.0); const e = globePoint(globeState(5.0), G.zone[0] + G.zoneR, G.zone[1]);   // V9: story clock
      let rose = 0; for (let dx = -4; dx <= 4; dx++) { const p = read(e.x + dx, e.y); rose = Math.max(rose, p[0] - p[1]); }
      const label = window.__eff(window.__ref('fc.zlabel')) > 0.98 && window.__ref('fc.zlabel').textContent.includes('radius 200 m');
      const credit = window.__textVisible('Imejan ©2026 Airbus, CNES / Airbus, Maxar Technologies · Data peta ©2026 Google', 0.5);
      window.__at(1.5); const dashed = globeState(1.5).dash > 0.5 && globeState(1.5).trace === 0;
      return { ok, surface, rose, label, credit, dashed, zoneR: G.zoneR };
    });
    check('G1 opening background: the satellite map drawn as a globe (WebGL, deterministic), imagery credited (Airbus/CNES/Maxar, Google)', glb.ok && glb.surface[3] > 200 && glb.credit, JSON.stringify({ ok: glb.ok, surface: glb.surface, credit: glb.credit }));
    check('G2 the 200 m radius: 212 px on the 100 m = 106 px map scale, dashed from 1.5 s, traced when the outbreak is declared and labelled "radius 200 m"',
      glb.ok && Math.abs(glb.zoneR * 100 / 106 - 200) < 1 && glb.dashed && glb.rose > 80 && glb.label, JSON.stringify({ zoneR: glb.zoneR, metres: +(glb.zoneR * 100 / 106).toFixed(1), rose: glb.rose, label: glb.label }));

    /* ---------------- W. V6 WhatsApp copy-and-paste insert (V9 film 90.45–104.45 s) */
    const wa = await R.page.evaluate(() => {
      const u = x => window.__atF(INSERT.atF + x);
      u(0.85); const btn = window.__textVisible('Salin Laporan (WhatsApp)', 0.98), touch = window.__eff(window.__ref('wa.touch')) > 0.5;
      u(1.7); const toast = window.__textVisible('Ringkasan laporan disalin! Sedia ditampal ke WhatsApp.', 0.98);
      u(3.85); const menu = window.__eff(window.__ref('wa.menu')) > 0.98 && window.__textVisible('Tampal', 0.98);
      u(4.6); const pasted = window.__ref('wa.paste').offsetHeight > 40 && window.__eff(window.__ref('wa.send')) > 0.98;
      u(9.0); const bubble = window.__ref('wa.bubble').textContent.replace(/\s+/g, ' '), bubVis = window.__eff(window.__ref('wa.bubble')) > 0.98, hl = window.__eff(window.__ref('wa.hl')) > 0.9;
      const sim = window.__textVisible('WhatsApp (simulasi)', 0.9) && Array.from(document.querySelectorAll('#stage .wa-set .sim-badge')).some(el => window.__eff(el) > 0.5);
      u(11.6); const read = window.__ref('wa.ticks').classList.contains('read'), react = window.__eff(window.__ref('wa.react')) > 0.98;
      const head = document.querySelector('.wa-head').textContent.replace(/\s+/g, ' ').trim();
      const sh = f => { window.renderFrame(f); return ['w.nadi', 'w.phone', 'ov.left', 'ov.summary'].map(r => window.__ref(r).style.cssText).join('|'); };
      const held = sh(Math.round((INSERT.atF + 0.3) * 60)) === sh(Math.round((INSERT.atF + 13.5) * 60));
      window.__atF(INSERT.atF - 0.45); const before = window.__phoneOn();
      window.__atF(INSERT.atF + 6); const cover = parseFloat(getComputedStyle(window.__ref('wa')).opacity);
      window.__atF(INSERT.atF + INSERT.len + 0.45); const after = window.__eff(window.__ref('w.nadi')) > 0.98 && getComputedStyle(window.__ref('wa')).display === 'none';
      return { btn, touch, toast, menu, pasted, bubVis, hl, sim, read, react, head, held, before, cover, after, bubble };
    });
    const want = ['LAPORAN RINGKASAN ACD DENGGI - PKD MUALLIM', 'Lokaliti: Kg. Ketoyong', 'Jumlah Rumah/Premis dalam Lokaliti: 110 buah', 'Jumlah Rumah/Premis Dilawati: 92 buah',
      'Berkunci/Kosong: 12 buah', 'Jumlah Penduduk Diperiksa (ACD): 337 orang', 'Jumlah Kes Bergejala Dikesan: 3 orang', 'Pencapaian ACD (%): 84%', 'Takungan Berpotensi Aedes: 14 premis'];
    check('W1 the e-ACD "Salin Laporan (WhatsApp)" tap, its toast, a long press → "Tampal", the pasted text and Send, in order',
      wa.btn && wa.touch && wa.toast && wa.menu && wa.pasted, JSON.stringify({ btn: wa.btn, touch: wa.touch, toast: wa.toast, menu: wa.menu, pasted: wa.pasted }));
    check('W2 the message close-up carries the film\'s simulated totals (110 / 92 / 12 / 337 / 3 / 84%), the coverage line highlighted, read ticks and one reaction',
      want.every(x => wa.bubble.includes(x)) && wa.bubVis && wa.hl && wa.read && wa.react, want.filter(x => !wa.bubble.includes(x)).join(' | ') || 'semua baris ada');
    // the people and the group in the supplied WhatsApp screenshot, kept only as SHA-256 prefixes (the names are not stored here)
    const BANNED = new Set(["1b2fc9341a16ae4e", "4e62c1113653a511", "73b1a5faa3a3286d", "bec67900ba8b8ce5", "42328092b536a693"]);
    const hw = w => crypto.createHash('sha256').update(w).digest('hex').slice(0, 16);
    const words = textOnly.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const leaked = words.filter((w, i) => BANNED.has(hw(w)) || (i + 2 < words.length && BANNED.has(hw(w + ' ' + words[i + 1] + ' ' + words[i + 2]))));
    const doctor = /\bDr\.? [A-Z]/.test(textOnly);
    check('W3 group and members are roles only; labelled "WhatsApp (simulasi)" + DATA SIMULASI; none of the screenshot\'s names or group name anywhere in the file',
      wa.head.replace(/\s+/g, '') === 'PasukanVektorPKDMuallimPegawaiEpid,PKP,PPKP,Pasukan1–6' && wa.sim && leaked.length === 0 && !doctor, wa.head + ' · simulasi ' + wa.sim + ' · nama sebenar ditemui ' + leaked.length + ' · "Dr ..." ' + doctor);
    check('W4 the story is held under the insert (phone before film 90.45 s, the insert opaque at 96.45 s, NADI follow-up after 104.45 s)', wa.held && wa.before && wa.cover > 0.99 && wa.after, JSON.stringify({ held: wa.held, before: wa.before, cover: wa.cover, after: wa.after }));

    /* ---------------- J. V6 smooth 1:01–1:03 */
    const jt = await R.page.evaluate(() => {
      let maxJump = 0, at = 0, prev = null;
      for (let f = Math.round(filmTime(60.67) * 60); f <= Math.round(filmTime(65.0) * 60); f++) {
        window.renderFrame(f); const r = window.__ref('phone').getBoundingClientRect(); const c = [r.left + r.width / 2, r.top + r.height / 2, r.width];
        if (prev) { const d = Math.max(Math.abs(c[0] - prev[0]), Math.abs(c[1] - prev[1]), Math.abs(c[2] - prev[2])); if (d > maxJump) { maxJump = d; at = f; } }
        prev = c;
      }
      window.__at(61.3); const both = window.__eff(window.__ref('ph.vBorang')) > 0.5 && window.__eff(window.__ref('ph.vDash')) > 0.5;
      window.__at(61.05); const tab = window.__ref('ph.nDash').classList.contains('on');
      return { maxJump: +maxJump.toFixed(2), at, both, tab };
    });
    check('J1 the V6 fix of 1:01–1:03 (now film 1:04–1:06): no camera jump (phone ≤ 8 px per frame over story 60.7–65.0 s); a tab tap, then the form slides', jt.maxJump <= 8 && jt.both && jt.tab, JSON.stringify(jt));

    /* ---------------- P. V7 slower manual scene (story 6.5–13.35 s → film 6.5–16.35 s) */
    const pm = await R.page.evaluate(() => {
      const c = id => CUES.find(x => x.id === id);
      const impact = window.ACD.soundEvents().find(e => e.k === 'impact');
      return { impactF: filmTime(T.d.impact), impactSnd: impact ? +impact.t.toFixed(3) : null, papers: filmTime(T.b.paper2), typed: +filmTime(T.c.done).toFixed(3),
        writing: +(filmTime(T.b.write[1]) - filmTime(T.b.write[0])).toFixed(2), tally: +(filmTime(T.c.tallyDraw[1]) - filmTime(T.c.tallyDraw[0])).toFixed(2),
        c02: +(c('c02').end - c('c02').start).toFixed(2), c03: +(c('c03').end - c('c03').start).toFixed(2), before: filmTime(6.4), after: +filmTime(20).toFixed(3) };
    });
    const near = (a, b) => Math.abs(a - b) < 1e-6;
    check('P1 V9 clock: the opening flow (story 0–6.5) runs film 0–7.5 for the four short lines; the manual scene film 7.5 → title impact 18.85: handwriting ≥ 2.9 s, tally ≥ 1.75 s, captions c02/c03 ≥ 3.5 s each',
      near(pm.papers, 7.5) && near(pm.impactF, 18.85) && near(pm.impactSnd, 18.85) && pm.writing >= 2.9 && pm.tally >= 1.75 && pm.c02 >= 3.5 && pm.c03 >= 3.5 && near(pm.before, 6.4 * 7.5 / 6.5) && near(pm.after, 25.5),
      JSON.stringify(pm));

    /* ---------------- K. V7 the coverage hold keeps moving: team bars against the KKM line */
    const kb = await R.page.evaluate(() => {
      window.__at(76.9);
      const panel = window.__eff(window.__ref('ov.teams')) > 0.98, line = /scaleX\(1\)/.test(window.__ref('ov.tline').style.transform);
      const bars = [0, 1, 2, 3, 4, 5].map(i => ({ h: parseFloat(window.__ref('ov.tb' + i).style.height), v: window.__ref('ov.tv' + i).textContent, o: window.__eff(window.__ref('ov.tv' + i)) }));
      window.__at(74.0); const early = window.__eff(window.__ref('ov.teams'));
      const res = window.__eff(window.__ref('ov.res')) > 0.98;
      // every quarter second of story 72–77.4 differs from the previous one (no still stretch)
      let still = 0, prev = null;
      for (let ts = 72.0; ts <= 77.4; ts += 0.25) { window.__at(ts); const v = window.__ref('w.phone').style.transform + '|' + window.__ref('w.desk').style.transform; if (v === prev) still++; prev = v; }
      return { panel, line, bars, early, res, still };
    });
    const teamWant = [85, 83, 84, 82, 83, 83];
    check('K1 1:13–1:18 (story) is never a still frame: slow push on the card, six team bars 85/83/84/82/83/83% rise above the KKM 80% line (full 0–100% scale)',
      kb.panel && kb.line && kb.early < 0.05 && kb.res && kb.still === 0 && kb.bars.every((b, i) => b.v === teamWant[i] + '%' && b.o > 0.98 && Math.abs(b.h - 84 * teamWant[i] / 100) < 0.6),
      JSON.stringify({ panel: kb.panel, line: kb.line, still: kb.still, bars: kb.bars.map(b => b.v + '@' + b.h) }));

    /* ---------------- L. V7 follow-up node layout */
    const lay = await R.page.evaluate(() => {
      window.__at(103.0);
      return ['ov.f92', 'ov.lf12', 'ov.f6', 'ov.recheck', 'ov.dec'].map(r => {
        const el = window.__ref(r), box = el.getBoundingClientRect();
        const inside = Array.from(el.querySelectorAll('b, span, svg')).every(c => { const q = c.getBoundingClientRect(); return q.top >= box.top + 2 && q.bottom <= box.bottom - 2 && q.left >= box.left + 2 && q.right <= box.right - 2; });
        return { r, inside, fits: el.scrollHeight <= el.clientHeight + 1, text: el.textContent.replace(/\s+/g, ' ').trim() };
      });
    });
    check('L1 follow-up flow: "12 berkunci / kosong" and every other node keep number and label inside the box', lay.every(n => n.inside && n.fits), lay.map(n => n.text + ':' + (n.inside && n.fits ? 'ok' : 'TERKELUAR')).join(' · '));

    /* ---------------- T. V9 phone title and the two-worker example (Pasukan 1) */
    const tw = await R.page.evaluate(() => {
      window.__atF((filmTime(T.f.team2[1]) + filmTime(T.f.team2[2])) / 2);
      const one = window.__ref('ov.one'), h = one.querySelector('.ov-one-h'), team = window.__ref('ov.team2');
      const rg = document.createRange(); rg.selectNodeContents(h);
      const rects = Array.from(rg.getClientRects()).filter(q => q.width > 1);
      const cards = [0, 1].map(i => window.__ref('ov.t2c' + i).textContent.replace(/\s+/g, ' ').trim());
      return { title: h.innerText.replace(/\s+/g, ' ').trim(), lines: new Set(rects.map(q => Math.round(q.top))).size, textRight: Math.round(Math.max(...rects.map(q => q.right))),
        barBottom: Math.round(h.getBoundingClientRect().bottom), teamTop: Math.round(team.getBoundingClientRect().top), phoneLeft: Math.round(window.__ref('phone').getBoundingClientRect().left),
        head: team.querySelector('.t2-h').textContent.trim(), cards, prem: cards.map(x => (x.match(/Premis Contoh \d+/) || [''])[0]), vis: window.__eff(team), oneVis: window.__eff(one) };
    });
    check('T1 phone-scene title "Rekod ACD pada telefon masing-masing" on two lines ("masing-masing" unbroken), clear of the phone and of the example card below',
      tw.title === 'Rekod ACD pada telefon masing-masing' && tw.lines === 2 && tw.textRight <= tw.phoneLeft - 100 && tw.teamTop - tw.barBottom >= 20 && tw.oneVis > 0.98,
      JSON.stringify({ title: tw.title, lines: tw.lines, textRight: tw.textRight, phoneLeft: tw.phoneLeft, gapToCard: tw.teamTop - tw.barBottom }));
    const p1u = PLACE.units.find(u => u.unit === 'p1');
    const tt2 = await R.page.evaluate(() => T.f.team2);
    const t2run = await longestRun(R.page, tt2[0] - 0.2, tt2[3] + 0.2, 'return window.__eff(window.__ref("ov.team2")) >= 0.98;');
    const t2f = await R.page.evaluate(([a, b]) => [filmTime(a), filmTime(b)], [t2run.from, t2run.to]);
    check('T2 "Pasukan 1 · contoh dua petugas": Petugas 1 and Petugas 2 on two different premises, fully on screen while "Setiap petugas boleh merekod…" is spoken',
      /Pasukan 1/.test(tw.head) && /^Petugas 1(?!\d)/.test(tw.cards[0]) && /^Petugas 2(?!\d)/.test(tw.cards[1]) && !!tw.prem[0] && !!tw.prem[1] && tw.prem[0] !== tw.prem[1] && tw.vis > 0.98 &&
      t2f[0] <= p1u.start + 0.4 && t2f[1] >= p1u.end - 0.1,
      tw.head + ' · ' + tw.cards.join(' | ') + ' · kad penuh ' + t2f.map(x => x.toFixed(2)).join('–') + ' s, ayat p1 ' + p1u.start.toFixed(2) + '–' + p1u.end.toFixed(2) + ' s');

    /* ---------------- H. V9 the "Ringkasan e-ACD" panel holds still; captions hand over without a dip */
    const pan = await R.page.evaluate(() => {
      const q = r => window.__ref(r), refs = ['na.card', 'na.kTarget', 'na.kVisited', 'na.kLocked', 'na.kLeft', 'na.decBtn'];
      const glow = el => { const sh = getComputedStyle(el).boxShadow; if (sh === 'none') return 0; const m = /rgba?\([^)]*?,\s*([\d.]+)\)/.exec(sh); return m ? +m[1] : 1; };
      const title = Array.from(q('na.card').querySelectorAll('*')).find(e => e.childElementCount === 0 && e.textContent.trim() === 'Kg. Ketoyong');
      const s0 = Math.round(SCENES[7].start * 60), fx = Math.round(filmTime(T.l.expand[1]) * 60) + 6, f1 = Math.round(SCENES[7].end * 60) - 18;
      const fadeRefs = { left: () => glow(q('na.kLeft')), locked: () => glow(q('na.kLocked')), planned: () => parseFloat(getComputedStyle(q('na.planned')).opacity), recheck: () => parseFloat(getComputedStyle(q('na.recheck')).opacity) };
      let maxMove = 0, moveAt = null, prev = null, wMin = 1e9, wMax = 0, last = null;
      const drops = { left: 0, locked: 0, planned: 0, recheck: 0 }, rises = { left: 0, locked: 0, planned: 0, recheck: 0 };
      for (let f = s0; f <= f1; f++) {
        window.renderFrame(f);
        const tops = refs.map(r => q(r).getBoundingClientRect().top).concat(title.getBoundingClientRect().top);
        if (f >= fx) { if (prev) { const d = Math.max(...tops.map((v, i) => Math.abs(v - prev[i]))); if (d > maxMove) { maxMove = d; moveAt = +(f / 60).toFixed(3); } } prev = tops; }
        const wh = q('na.plannedWrap').offsetHeight; wMin = Math.min(wMin, wh); wMax = Math.max(wMax, wh);   // layout height (transforms excluded)
        const cur = {}; for (const k in fadeRefs) cur[k] = fadeRefs[k]();
        if (last) for (const k in cur) { if (cur[k] < last[k] - 0.005) drops[k]++; if (last[k] <= 0.005 && cur[k] > 0.005) rises[k]++; }
        last = cur;
      }
      return { from: +(s0 / 60).toFixed(2), still: +(fx / 60).toFixed(2), to: +(f1 / 60).toFixed(2), maxMove: +maxMove.toFixed(2), moveAt, wrap: [+wMin.toFixed(1), +wMax.toFixed(1)], drops, rises, end: last };
    });
    check('H1 "Ringkasan e-ACD" panel (Kg. Ketoyong, film 104.45–124.5): the 6 and 12 cards each glow up once and stay lit; the follow-up list and the recheck line fade in once; the list space is reserved from the start (constant layout height); after the expand nothing in the panel moves (V9: no camera push)',
      Object.values(pan.rises).every(v => v === 1) && Object.values(pan.drops).every(v => v === 0) && pan.end.left > 0.8 && pan.end.locked > 0.8 && pan.end.planned > 0.99 && pan.end.recheck > 0.99 && pan.wrap[1] - pan.wrap[0] < 0.5 && pan.wrap[0] > 100 && pan.maxMove <= 0.01,
      JSON.stringify(pan));
    const exm = await R.page.evaluate(() => {
      // V9: while the summary opens, every block moves one way only and settles without a final jump
      const q = r => window.__ref(r);
      const below = Array.from(q('na.card').querySelectorAll('*')).filter(e => e.textContent.trim() === 'Kawalan Kesihatan Awam').pop();
      if (!below) return { missing: true };
      const els = { kpi: q('na.kTarget'), btn: q('na.decBtn'), below };
      const f0 = Math.round(filmTime(T.l.expand[0]) * 60) - 6, f1 = Math.ceil(filmTime(T.l.expand[1]) * 60), f2 = f1 + 30;   // f1: first frame of the end state
      const path = {}; for (const k in els) path[k] = [];
      for (let f = f0; f <= f2; f++) { window.renderFrame(f); for (const k in els) path[k].push(els[k].getBoundingClientRect().top); }
      const out = {};
      for (const k in path) {
        const p = path[k], d = p.slice(1).map((v, i) => v - p[i]), dir = Math.sign(p[f1 - f0] - p[0]);
        out[k] = { travel: +(p[f1 - f0] - p[0]).toFixed(1), backSteps: d.filter(x => x * dir < -0.01).length, afterEnd: +Math.max(...p.slice(f1 - f0).map(v => Math.abs(v - p[f1 - f0]))).toFixed(2) };
      }
      return out;
    });
    check('H4 the summary opens in one smooth move (V9): its cards and button scroll up, the block under it moves down, each in one direction only, and nothing shifts after the move ends',
      !exm.missing && Object.values(exm).every(v => v.backSteps === 0 && v.afterEnd <= 0.01 && Math.abs(v.travel) > 5) && exm.kpi.travel < 0 && exm.below.travel > 0, JSON.stringify(exm));
    const fu12 = await R.page.evaluate(() => {
      // left follow-up nodes: each beat is one fade in and one fade out (no single-frame switch, no re-trigger inside a beat)
      const ring = el => { const m = /rgba\(251, 191, 36, ([\d.]+)\) 0px 0px 0px/.exec(getComputedStyle(el).boxShadow); return m ? +m[1] : 0; };
      const out = {};
      for (const r of ['ov.f6', 'ov.lf12']) {
        let prev = null, maxStep = 0, ups = 0, rising = false;
        for (let f = Math.round(SCENES[7].start * 60); f <= Math.round(SCENES[7].end * 60); f++) { window.renderFrame(f); const v = ring(window.__ref(r)); if (prev !== null) { maxStep = Math.max(maxStep, Math.abs(v - prev)); if (v > prev + 1e-4 && !rising) { ups++; rising = true; } if (v < prev - 1e-4) rising = false; } prev = v; }
        out[r] = { ups, maxStep: +maxStep.toFixed(3) };
      }
      return out;
    });
    check('H3 left follow-up nodes: "6 belum dilawati" glows once, "12 berkunci / kosong" twice (its line, then "premis yang selebihnya"), each a 0.3 s fade (no single-frame switch)',
      fu12['ov.f6'].ups === 1 && fu12['ov.lf12'].ups === 2 && fu12['ov.f6'].maxStep <= 0.35 && fu12['ov.lf12'].maxStep <= 0.35, JSON.stringify(fu12));
    // V9: the cards not in focus keep moving on the orbit: counter-clockwise on screen, smaller and blurred at the back
    const orbM = await R.page.evaluate(() => {
      const B = BENEFIT_BEATS, out = { still: 0, cw: 0, frames: 0, backBlur: [], frontBlur: [], backW: [], frontW: [] };
      const prev = {};
      for (let f = Math.round(B[0] * 60); f <= Math.round((B[3] + 3) * 60); f++) {
        window.renderFrame(f); const ft = f / 60;
        for (let i = 0; i < 4; i++) {
          if (benefitFocus(i, ft).f > 0) { delete prev[i]; continue; }          // only cards purely on the orbit
          const el = window.__ref('ov.bf' + i), bb = el.getBoundingClientRect(), m = /blur\(([\d.]+)px\)/.exec(getComputedStyle(el).filter);
          const cx = (bb.left + bb.right) / 2, cy = (bb.top + bb.bottom) / 2, th = Math.atan2((cy - 540) / 330, (cx - 960) / 680);
          if (cy < 330) { out.backBlur.push(m ? +m[1] : 0); out.backW.push(bb.width); }
          if (cy > 750) { out.frontBlur.push(m ? +m[1] : 0); out.frontW.push(bb.width); }
          if (prev[i]) { out.frames++; if (Math.hypot(cx - prev[i].cx, cy - prev[i].cy) < 0.05) out.still++; let d = th - prev[i].th; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; if (d > 0.004) out.cw++; }
          prev[i] = { cx, cy, th };
        }
      }
      const mean = a => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2) : null;
      return { frames: out.frames, still: out.still, clockwiseSteps: out.cw, backBlur: mean(out.backBlur), frontBlur: mean(out.frontBlur), backW: mean(out.backW), frontW: mean(out.frontW) };
    });
    check('H2 the cards not in focus float on the orbit (V9): they move in every frame, counter-clockwise on screen, smaller and blurred at the back, larger and sharper in front',
      orbM.frames > 600 && orbM.still === 0 && orbM.clockwiseSteps <= orbM.frames * 0.02 && orbM.backBlur > orbM.frontBlur + 0.8 && orbM.frontW > orbM.backW * 1.25, JSON.stringify(orbM));

    /* ---------------- D. determinism */
    const frames = [120, 400, 640, 820, 981, 1131, 1500, 1720, 1788, 2030, 3640, 4040, 4560, 4700, 5427, 5700, 6000, 6600, 6900, 7400, 7700, 8483];
    const A = await open(browser, '?render=1'), B = await open(browser, '?render=1');
    let seekSame = 0;
    for (const f of frames) { await A.page.evaluate(i => window.renderFrame(i), f); await B.page.evaluate(i => window.renderFrame(i), f); if ((await shot(A)) === (await shot(B))) seekSame++; }
    check('D1 seeking to a frame is reproducible across fresh pages', seekSame === frames.length, seekSame + '/' + frames.length + ' identical');
    const stateHash = () => { const out = []; for (const el of document.querySelectorAll('#stage *')) { if (!el.getClientRects().length) continue; let o = 1, e = el; while (e && e.id !== 'stage') { const cs = getComputedStyle(e); o *= parseFloat(cs.opacity); if (cs.visibility === 'hidden') o = 0; e = e.parentElement; } if (o <= 0.001) continue; out.push(Array.from(el.style).sort().map(k => k + ':' + el.style.getPropertyValue(k)).join(';'), Array.from(el.classList).sort().join(' '), el.getAttribute('d') || '', el.getAttribute('opacity') || '', el.getAttribute('transform') || '', el.getAttribute('stroke-dashoffset') || '', el.childElementCount ? '' : el.textContent); } return out.join('|'); };
    let stateSame = 0; const sampled = [240, 600, 900, 1788, 2030, 3640, 4640, 5500, 5900, 6700, 7000, 7600, 8480];
    const P1 = await open(browser, '?render=1');
    for (let f = 0; f <= 8480; f += 2) { await P1.page.evaluate(i => window.renderFrame(i), f); if (sampled.includes(f)) { const a = sha(await P1.page.evaluate(stateHash)); await B.page.evaluate(i => window.renderFrame(i), f); const b = sha(await B.page.evaluate(stateHash)); if (a === b) stateSame++; } }
    check('D2 playing to frame N gives the same visible DOM state as seeking to N', stateSame === sampled.length, stateSame + '/' + sampled.length + ' identical hashes');
    await A.ctx.close(); await B.ctx.close(); await P1.ctx.close();

    /* ---------------- E. soundtrack and narration */
    const au = await R.page.evaluate(async () => { const m = await window.ACD.audio.render(); const ev = buildSoundEvents(); return { len: m.length, sr: m.sampleRate, info: m.info, events: ev.length, kinds: [...new Set(ev.map(e => e.k))] }; });
    const n = au.info.narration;
    const nr = await R.page.evaluate(() => window.ACD.audio.narrationPcm16());
    check('E1 one resolved mix, exactly 141.400 s at 48 kHz', au.len === Math.round(DUR * 48000) && au.sr === 48000, au.len + ' samples');
    const flacEl = await R.page.evaluate(() => { const e = document.getElementById('narasi-flac'); return e ? { file: e.dataset.file, sha: e.dataset.sha256 } : null; });
    const wavSha = crypto.createHash('sha256').update(fs.readFileSync(NARR_WAV)).digest('hex');
    check('E2 narration: narasi-v9.wav (ElevenLabs "Ahmad") is embedded as FLAC and in the mix', !!n && n.label === 'narasi-v9.wav' && !!flacEl && flacEl.file === 'narasi-v9.wav' && flacEl.sha === wavSha && !!nr && nr.label === 'narasi-v9.wav',
      'narasi: ' + (n ? n.label + ' ' + n.lufsMono + ' LUFS → ' + n.target + ' LUFS' : 'tiada') + ' · blok FLAC sha256 ' + (flacEl ? flacEl.sha.slice(0, 12) + '…' : 'tiada') + (flacEl && flacEl.sha === wavSha ? ' (= fail)' : ''));
    check('E3 programme −16 LUFS ±0.5, peak ≤ −1.4 dBFS (look-ahead limiter)', Math.abs(au.info.mix.lufs + 16) <= 0.5 && au.info.mix.peakDb <= -1.4, au.info.mix.lufs + ' LUFS, peak ' + au.info.mix.peakDb + ' dBFS, limiter ' + au.info.mix.limiter.maxReductionDb.toFixed(2) + ' dB');
    const bal = n ? n.balance : [];
    check('E4 the score is ducked 10 dB under the voice (9 dB under the four opening lines so the tension music stays present, 14 dB over the manual-scene build-up) and back at full level on the title impact; in every caption the voice is ≥ 10 LU above the ducked score',
      !!n && n.duckDb === -10 && n.duckOpenDb === -9 && n.duckBuildDb === -14 && n.impactGainDb > -0.1 && au.info.bed.target === -19.5 && bal.length === 29 && bal.every(b => b.diff >= 10),
      'skor ' + au.info.bed.lufsIn + ' → ' + au.info.bed.target + ' LUFS, direndahkan ' + (n ? n.duckOpenDb + '/' + n.duckBuildDb + '/' + n.duckDb : '-') + ' dB (pembukaan/binaan/lain), pada hentakan ' + (n ? n.impactGainDb : '-') + ' dB · beza suara−skor ' + (bal.length ? Math.min(...bal.map(b => b.diff)).toFixed(1) + ' hingga ' + Math.max(...bal.map(b => b.diff)).toFixed(1) : '-') + ' LU');
    const nd = nr ? Buffer.concat(nr.chunks.map(c => Buffer.from(c, 'base64'))) : Buffer.alloc(0), dec = new Int16Array(nd.buffer.slice(nd.byteOffset, nd.byteOffset + nd.length));
    let nDiff = 0; for (let i = 0; i < Math.max(dec.length, pcm.length); i++) if (dec[i] !== pcm[i]) nDiff++;
    check('E8 the narration the page decodes is sample-exact to narasi-v9.wav (lossless FLAC)', dec.length === pcm.length && nDiff === 0, dec.length + ' sampel, ' + nDiff + ' berbeza');
    check('E9 the voice chain keeps speech peaks under the ceiling: the master limiter reduces ≤ 1 dB', au.info.mix.limiter.maxReductionDb >= -1 && au.info.mix.limiter.clamps === 0,
      'had ' + au.info.mix.limiter.maxReductionDb.toFixed(2) + ' dB, ' + au.info.mix.limiter.overs + ' sampel melebihi');
    check('E5 legacy score kept: drone + paired heartbeat + ticks + riser, impact on the title, success on the target', au.kinds.includes('riser') && au.kinds.includes('impact') && au.kinds.includes('success') && /tension drone/.test(textOnly) && /paired, accelerating/.test(textOnly), au.events + ' events: ' + au.kinds.join(' '));
    check('E6 no browser speech synthesis in the player', !/SpeechSynthesisUtterance|speechSynthesis\.speak/.test(textOnly) && !/id="bSpeech"/.test(textOnly));
    check('E7 no page errors in render mode', R.errors.length === 0, R.errors.join(' | '));
    await R.ctx.close();

    /* ---------------- F. player controls (preview mode) */
    const U = await open(browser, '');
    const st = () => U.page.evaluate(() => window.ACD.player.state);
    const visq = sel => U.page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05; }, sel);
    check('F1 start overlay and controls present; no Web Speech button', (await visq('#startOverlay')) && (await visq('#controls')) && !(await U.page.$('#bSpeech')));
    await U.page.waitForFunction(() => /Sedia/.test(document.getElementById('startStatus').textContent), null, { timeout: 120000 });
    const status = await U.page.textContent('#startStatus');
    check('F2 player reports the narration (narasi-v9.wav)', /narasi narasi-v9\.wav/.test(status), status.trim());
    await U.page.click('#startOverlay');
    await sleep(1600);
    let s = await st();
    check('F3 first click starts the soundtrack with the narration and unlocks audio', s.playing && s.t > 1.0 && s.ctx === 'running' && s.buffer && s.audioClock && s.narrated, JSON.stringify({ t: +s.t.toFixed(2), ctx: s.ctx, audioClock: s.audioClock, narrated: s.narrated }));
    await U.page.keyboard.press('Space'); await sleep(100);
    const p1 = await st(); await sleep(500); const p2 = await st();
    check('F4 pause holds the frame', !p1.playing && p1.t === p2.t, 't=' + p1.t.toFixed(3));
    await U.page.click('.scene-btn[data-s="4"]'); await sleep(150);
    s = await st();
    check('F5 scene jump to segment 4 lands on 00:54.500 (frame 3270)', Math.abs(s.t - 54.5) < 1e-6 && s.frame === 3270, 't=' + s.t + ' frame=' + s.frame);
    await U.page.evaluate(() => { const r = document.getElementById('scrub'); r.value = '4500'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    s = await st();
    check('F6 scrubber seeks to frame 4500 (01:15.000)', s.frame === 4500 && Math.abs(s.t - 75) < 1e-6, 'frame=' + s.frame);
    await U.page.evaluate(() => { const r = document.getElementById('scrub'); r.value = '4590'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    const keyState = x => JSON.stringify({ playing: x.playing, muted: x.muted, clean: x.clean, narrated: x.narrated });
    const ks0 = keyState(await st()); await U.page.keyboard.press('s'); await sleep(80); const ks1 = keyState(await st());
    const ctlTxt = await U.page.textContent('#controls');
    check('F7 no caption control (V9): no "Sari Kata" button or caption element, and the S key changes no player state',
      !(await U.page.$('#bSubs')) && !(await U.page.$('[data-ref="subsBox"]')) && !/sari kata/i.test(ctlTxt) && ks0 === ks1, 'butang ' + !!(await U.page.$('#bSubs')) + ' · teks kawalan ' + /sari kata/i.test(ctlTxt) + ' · keadaan ' + ks0 + (ks0 === ks1 ? ' (tidak berubah)' : ' → ' + ks1));
    await U.page.click('#bMute'); s = await st();
    const muteTxt = await U.page.textContent('#bMute');
    check('F8 mute sets gain 0 and relabels the button', s.muted && s.gain === 0 && /Mati/.test(muteTxt), muteTxt.trim());
    await U.page.click('#bMute');
    await U.page.keyboard.press('7'); await sleep(100); s = await st(); const k7 = s.frame;
    await U.page.keyboard.press('0'); await sleep(100); s = await st();
    check('F9 key 7 jumps to the WhatsApp insert at 01:30.450 (frame 5427), key 0 to the closing at 02:13.750 (frame 8025)', k7 === 5427 && s.frame === 8025, 'frames ' + k7 + ', ' + s.frame);
    await U.page.click('#bRestart'); await sleep(300); s = await st();
    check('F10 restart returns to 0 and plays the mix from its start', s.playing && s.t < 0.6 && s.audioT0 === 0 && s.audioClock, 't=' + s.t.toFixed(3) + ' audioT0=' + s.audioT0);
    await U.page.evaluate(() => { const r = document.getElementById('scrub'); r.dispatchEvent(new Event('pointerdown', { bubbles: true })); r.value = '3000'; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('pointerup', { bubbles: true })); });
    await sleep(400); s = await st();
    check('F11 a seek while playing restarts the mix at the new time (sound stays in sync)', s.playing && s.audioT0 === 50 && s.audioClock && s.t >= 50 && s.t < 51, 'audioT0=' + s.audioT0 + ' t=' + s.t.toFixed(3));
    await U.page.mouse.move(5, 5); await sleep(3000);
    check('F12 controls auto-hide during playback', await U.page.evaluate(() => document.getElementById('controls').classList.contains('hidden')));
    await U.page.keyboard.press('c'); await sleep(100);
    const cleanHidden = !(await visq('#controls')) && (await U.page.evaluate(() => getComputedStyle(document.body).cursor)) === 'none';
    await U.page.keyboard.press('Escape'); await sleep(100);
    check('F13 clean recording mode hides controls and cursor; Esc exits', cleanHidden && (await visq('#controls')));
    await U.page.keyboard.press('Space'); await sleep(50);
    await U.page.keyboard.press('ArrowRight'); s = await st();
    const tA = s.t; await U.page.keyboard.press('.'); const sB = await st();
    check('F14 keyboard seek ±1 s and single-frame step', Math.abs(sB.t - tA - 1 / 60) < 1e-6, 't ' + tA.toFixed(3) + ' → ' + sB.t.toFixed(3));
    const timeLbl = await U.page.textContent('#tTime');
    check('F15 time display shows the 02:21.40 length', /\/ 02:21\.40/.test(timeLbl), timeLbl.trim());
    check('F16 no page errors in preview mode', U.errors.length === 0, U.errors.join(' | '));
    await U.ctx.close();
  } finally { await browser.close(); }

  const w = Math.max(...results.map(r => r.name.length));
  let fail = 0;
  for (const r of results) { if (!r.ok) fail++; console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name.padEnd(w) + (r.detail ? '  · ' + r.detail : '')); }
  console.log('\n' + (results.length - fail) + '/' + results.length + ' checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
