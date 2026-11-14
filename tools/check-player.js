#!/usr/bin/env node
/* Automated checks for the V7 player video-showcase-v7.html (run: node tools/check-player.js).
 * V7: P slower manual scene (film 6.5–16.35 s) · K moving coverage hold + team bars · L follow-up node layout.
 * V6: G opening globe + 200 m radius · W WhatsApp copy-and-paste insert (14 s, film 134 s) · J smooth
 *     1:01–1:03 reveal. Story-time checks from V5 run through filmTime() (window.__at takes STORY time;
 *     window.__atF takes FILM time).
 * V5: O opening flow chart · R record-entry pacing · S follow-up step flow · KKM target label.
 * A offline load · B one dataset · C labels, captions, Sheets write, coverage count-up · M paper
 * Borang ACD + Lampiran 1 · V hard gates (phone gate 00:24.30, re-typing by 00:11.85, title impact
 * 00:13.35, 3D angles, holds) · D frame determinism · E soundtrack (music + effects, no narration)
 * F player controls. Exit code 1 on failure. */
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const HTML = path.resolve(ROOT, process.argv[2] || 'video-showcase-v7.html');
const URL = pathToFileURL(HTML).href;
const WAV = path.join(ROOT, 'narration-bm.wav');
const SRT = path.join(ROOT, 'kit-suara', 'subtitles-bm.srt');
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail: detail === undefined ? '' : String(detail) }); };
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
    check('A3 timeline 137 s × 60 fps = 8,220 frames (120 s story, manual scene +3.0 s, WhatsApp +14 s)', meta.fps === 60 && meta.frames === 8220 && meta.dur === 137, JSON.stringify({ fps: meta.fps, frames: meta.frames, dur: meta.dur }));
    check('A4 V7 segments 0 · 16.13 · 27.3 · 52 · 65 · 81 · 87.95 · 101.95 · 122 · 129.35 · 137', meta.scenes.join() === '0,16.13,27.3,52,65,81,87.95,101.95,122,129.35,137', meta.scenes.join(' '));
    const kept = ['video-showcase.html', 'NADI-Muallim-120s.mp4', 'video-showcase-v3.html', 'NADI-Muallim-Pitch-120s-v3.mp4', 'video-showcase-v4.html', 'NADI-Muallim-Pitch-120s-v4.mp4', 'video-showcase-v5.html', 'NADI-Muallim-Pitch-120s-v5.mp4', 'video-showcase-v6.html', 'NADI-Muallim-Pitch-134s-v6.mp4'];
    check('A5 V2–V6 exports kept for comparison', kept.every(f => fs.existsSync(path.join(ROOT, f))) && !kept.includes(path.basename(HTML)), kept.join(', '));

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
    const retimed = ['c02', 'c05', 'c06', 'c14', 'c16', 'c17'];
    const kitCues = cues.filter(c => /^c\d\d$/.test(c.id)), waCues = cues.filter(c => /^w\d$/.test(c.id));
    const kitOf = c => srt[parseInt(c.id.slice(1), 10) - 1];
    const ins = await R.page.evaluate(() => INSERT);
    const kitFilm = await R.page.evaluate(times => times.map(x => Math.round(filmTime(x) * 100) / 100), srt.flatMap(k => [k.start, k.end]));
    const shift = x => { const i = srt.flatMap(k => [k.start, k.end]).indexOf(x); return kitFilm[i]; };   // kit (story) time → film time (V7 map)
    const textSame = kitCues.every(c => kitOf(c) && flat(kitOf(c).text) === flat(c.sub));
    const timeSame = kitCues.filter(c => !retimed.includes(c.id)).every(c => Math.abs(shift(kitOf(c).start) - c.start) < 0.0005 && Math.abs(shift(kitOf(c).end) - c.end) < 0.0005);
    const waIn = waCues.every(c => c.start >= ins.atF && c.end <= ins.atF + ins.len);
    const q = await R.page.evaluate(() => window.__ref('ov.fq').textContent.replace(/\s+/g, ' '));
    check('C3 18 kit captions (kit text, on the film clock: slower manual scene, 14 s insert) + 3 WhatsApp captions inside the insert; c01 heads the follow-up flow',
      srt.length === 19 && kitCues.length === 18 && waCues.length === 3 && waIn && !cues.some(c => c.id === 'c01') && textSame && timeSame && q.replace(/\s+/g, '').includes('Premismanayangmasihperludilawati?'),
      cues.length + ' kiu · ' + waCues.map(c => c.id + ' ' + c.start + '–' + c.end).join(', '));
    const caps = await R.page.evaluate(() => ({ lines: CUES.every(c => c.sub.split('\n').length <= 2), ordered: CUES.every((c, i) => !i || c.start >= CUES[i - 1].end), inScene: CUES.every(c => { const s = SCENES.find(q => q.id === c.scene); return c.start >= s.start && c.start < s.end; }) }));
    check('C4 captions: ≤ 2 lines, in order without overlap, each starts in its segment', caps.lines && caps.ordered && caps.inScene, JSON.stringify(caps));
    const capOk = [];
    for (const c of cues) capOk.push(await R.page.evaluate(([mid, sub]) => { window.__atF(mid); const b = window.__ref('subsBox'); return b.textContent === sub && parseFloat(getComputedStyle(b).opacity) > 0.95; }, [(c.start + c.end) / 2, c.sub]));
    check('C5 the caption on screen matches its cue at the middle of all ' + cues.length + ' cues', capOk.every(Boolean), capOk.filter(Boolean).length + '/' + cues.length);
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
    check('C8 the supervisor visibly selects "Rancang lawatan susulan" as the caption "Penyelia menjadualkan…" appears', sup.cur > 0.9 && sup.press && sup.dec > 0.98 && sup.click >= sup.c16[0] && sup.click < sup.c16[1], JSON.stringify(sup));

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
    check('V1 phone layer (frame, shadow, badges, tap marker) hidden before story 24.30 (film frame 1638); story frames 1027/1065/1160/1457 hidden', gate.on === 0 && gate.named.every(v => !v), gate.on + ' frames with phone before frame ' + gate.gateF + '; named ' + gate.named.join(','));
    check('V2 first phone frame = story 24.30 (film 27.30, frame 1638); no phone tap or reveal sound before it', gate.first >= gate.gateF && gate.gateF === 1638 && gate.early === 0, 'first frame ' + gate.first + ' (' + (gate.first / 60).toFixed(3) + ' s), early sounds ' + gate.early);
    const settle = await R.page.evaluate(() => { const st = t => { window.__at(t); return window.__ref('phone').style.transform + '|' + window.__ref('w.phone').style.transform; }; const a = st(25.6), b = st(28.0), c = st(32.4); window.__at(25.6); return { same: a === b && b === c, yaw: window.__yaw('phone') }; });
    check('V3 phone settled by 25.60 at a shallow three-quarter angle and still until the push-in', settle.same && Math.abs(settle.yaw) >= 8 && Math.abs(settle.yaw) <= 14, 'yaw ' + settle.yaw + '°');
    const typing = await R.page.evaluate(() => {
      const cell = () => document.querySelector('[data-ref="man.lapGrid"] [data-focus]');
      window.__at(11.85); const c = cell(), done = c.textContent === '14' && c.classList.contains('done'), lap = window.__eff(window.__ref('man.laptop'));
      window.__at(11.7); const mid = cell().textContent;
      const tf = t => { window.__at(t); return window.__ref('man').style.transform; };
      const hold = tf(11.85) === tf(12.33);
      window.__at(13.35); const title = window.__eff(window.__ref('ov.title')), impact = window.ACD.soundEvents().some(e => e.k === 'impact' && Math.abs(e.t - filmTime(13.35)) < 1e-6);
      const riser = window.ACD.soundEvents().find(e => e.k === 'riser');
      const tt = t => { window.__at(t); return window.__ref('ov.title').style.transform; };
      const settled = tt(13.8) === tt(16.0);
      return { done, lap, mid, hold, title, impact, riserEnd: riser ? +(riser.t + riser.d).toFixed(3) : null, settled };
    });
    check('V4 re-typing finished by 11.85 (cell "14" complete), held to 12.33 before the clear', typing.done && typing.lap > 0.98 && typing.hold, JSON.stringify({ done: typing.done, at11_7: typing.mid, hold: typing.hold }));
    check('V5 title on screen at the impact (story 13.35 = film 16.35; the riser ends there), settled by story 13.80', typing.title > 0.98 && typing.impact && typing.riserEnd === 16.35 && typing.settled, JSON.stringify({ title: typing.title, impact: typing.impact, riserEnd: typing.riserEnd, settled: typing.settled }));
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
    const fu = await R.page.evaluate(() => { window.__at(85.9); const q = window.__eff(window.__ref('ov.fq')) >= 0.98; window.__at(87.7); const six = window.__eff(window.__ref('ov.f6')) >= 0.98 && window.__textVisible('belum dilawati', 0.98); window.__at(90.42); const twelve = window.__eff(window.__ref('ov.lf12')) >= 0.98 && window.__ref('ov.lf12').classList.contains('hl'); return { q, six, twelve }; });
    check('V9 follow-up: the supervisor\'s question by 85.9 s, "6 belum dilawati" by 87.7 s, "12 berkunci / kosong" highlighted at 90.42 s', fu.q && fu.six && fu.twelve, JSON.stringify(fu));
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
    h = await longestRun(R.page, 105, 112.4, 'for (let i = 0; i < 4; i++) if (window.__eff(window.__ref("ov.bf" + i)) < 0.98) return false; return true;');
    const bf = await R.page.evaluate(() => { window.__at(108); return { titles: [0, 1, 2, 3].map(i => window.__ref('ov.bf' + i).textContent.replace(/\s+/g, ' ').trim()), proto: [0, 1, 2, 3].map(i => !!window.__ref('ov.bf' + i).querySelector('.proto-badge')) }; });
    const bfNames = ['Rekod ACD pada telefon', 'Kiraan liputan automatik', 'Pengesahan dan ringkasan', 'Perancangan lawatan susulan'];
    check('V10 four benefit cards, the last marked Prototaip Integrasi, full row held ≥ 5 s', h.sec >= 5 && bfNames.every((n, i) => bf.titles[i].includes(n)) && bf.proto.join() === 'false,false,false,true', h.sec.toFixed(2) + ' s (' + h.from.toFixed(2) + '–' + h.to.toFixed(2) + ')');
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
      window.__atF(2.0); const surface = read(G.cx, G.cy - 200);
      window.__atF(5.0); const e = globePoint(globeState(5.0), G.zone[0] + G.zoneR, G.zone[1]);
      let rose = 0; for (let dx = -4; dx <= 4; dx++) { const p = read(e.x + dx, e.y); rose = Math.max(rose, p[0] - p[1]); }
      const label = window.__eff(window.__ref('fc.zlabel')) > 0.98 && window.__ref('fc.zlabel').textContent.includes('radius 200 m');
      const credit = window.__textVisible('Imejan ©2026 Airbus, CNES / Airbus, Maxar Technologies · Data peta ©2026 Google', 0.5);
      window.__atF(1.5); const dashed = globeState(1.5).dash > 0.5 && globeState(1.5).trace === 0;
      return { ok, surface, rose, label, credit, dashed, zoneR: G.zoneR };
    });
    check('G1 opening background: the satellite map drawn as a globe (WebGL, deterministic), imagery credited (Airbus/CNES/Maxar, Google)', glb.ok && glb.surface[3] > 200 && glb.credit, JSON.stringify({ ok: glb.ok, surface: glb.surface, credit: glb.credit }));
    check('G2 the 200 m radius: 212 px on the 100 m = 106 px map scale, dashed from 1.5 s, traced when the outbreak is declared and labelled "radius 200 m"',
      glb.ok && Math.abs(glb.zoneR * 100 / 106 - 200) < 1 && glb.dashed && glb.rose > 80 && glb.label, JSON.stringify({ zoneR: glb.zoneR, metres: +(glb.zoneR * 100 / 106).toFixed(1), rose: glb.rose, label: glb.label }));

    /* ---------------- W. V6 WhatsApp copy-and-paste insert (film 84.95–98.95 s) */
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
    check('W4 the story is held under the insert (phone before film 87.95 s, the insert opaque at 93.95 s, NADI follow-up after 101.95 s)', wa.held && wa.before && wa.cover > 0.99 && wa.after, JSON.stringify({ held: wa.held, before: wa.before, cover: wa.cover, after: wa.after }));

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
    check('P1 manual scene slowed to ≈10 s (film 6.5 → title impact 16.35): handwriting ≥ 2.9 s, tally ≥ 1.75 s, captions c02/c03 ≥ 3.5 s each; the opening before 6.5 s unchanged',
      pm.papers === 6.5 && pm.impactF === 16.35 && pm.impactSnd === 16.35 && pm.writing >= 2.9 && pm.tally >= 1.75 && pm.c02 >= 3.5 && pm.c03 >= 3.5 && pm.before === 6.4 && pm.after === 23,
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

    /* ---------------- D. determinism */
    const frames = [120, 400, 640, 820, 981, 1638, 2830, 3640, 4040, 4560, 4700, 5400, 5700, 6000, 7400, 8219];
    const A = await open(browser, '?render=1'), B = await open(browser, '?render=1');
    let seekSame = 0;
    for (const f of frames) { await A.page.evaluate(i => window.renderFrame(i), f); await B.page.evaluate(i => window.renderFrame(i), f); if ((await shot(A)) === (await shot(B))) seekSame++; }
    check('D1 seeking to a frame is reproducible across fresh pages', seekSame === frames.length, seekSame + '/' + frames.length + ' identical');
    const stateHash = () => { const out = []; for (const el of document.querySelectorAll('#stage *')) { if (!el.getClientRects().length) continue; let o = 1, e = el; while (e && e.id !== 'stage') { const cs = getComputedStyle(e); o *= parseFloat(cs.opacity); if (cs.visibility === 'hidden') o = 0; e = e.parentElement; } if (o <= 0.001) continue; out.push(Array.from(el.style).sort().map(k => k + ':' + el.style.getPropertyValue(k)).join(';'), Array.from(el.classList).sort().join(' '), el.getAttribute('d') || '', el.getAttribute('opacity') || '', el.getAttribute('transform') || '', el.getAttribute('stroke-dashoffset') || '', el.childElementCount ? '' : el.textContent); } return out.join('|'); };
    let stateSame = 0; const sampled = [240, 600, 900, 1638, 3640, 4640, 5500, 5900, 7000, 8200];
    const P1 = await open(browser, '?render=1');
    for (let f = 0; f <= 8200; f += 2) { await P1.page.evaluate(i => window.renderFrame(i), f); if (sampled.includes(f)) { const a = sha(await P1.page.evaluate(stateHash)); await B.page.evaluate(i => window.renderFrame(i), f); const b = sha(await B.page.evaluate(stateHash)); if (a === b) stateSame++; } }
    check('D2 playing to frame N gives the same visible DOM state as seeking to N', stateSame === sampled.length, stateSame + '/' + sampled.length + ' identical hashes');
    await A.ctx.close(); await B.ctx.close(); await P1.ctx.close();

    /* ---------------- E. soundtrack and narration */
    const au = await R.page.evaluate(async () => { const m = await window.ACD.audio.render(); const ev = buildSoundEvents(); return { len: m.length, sr: m.sampleRate, info: m.info, events: ev.length, kinds: [...new Set(ev.map(e => e.k))] }; });
    const n = au.info.narration;
    const nr = await R.page.evaluate(() => window.ACD.audio.narrationPcm16());
    check('E1 one resolved mix, exactly 137.000 s at 48 kHz', au.len === 137 * 48000 && au.sr === 48000, au.len + ' samples');
    check('E2 no narration: the Osman voice-over is not embedded and not in the mix (music and effects only)', n === null && nr === null && !/id="narasi-flac"/.test(html), 'narasi: ' + (n ? n.label : 'tiada') + ', blok FLAC: ' + /id="narasi-flac"/.test(html));
    check('E3 programme −16 LUFS ±0.5, peak ≤ −1.4 dBFS (look-ahead limiter)', Math.abs(au.info.mix.lufs + 16) <= 0.5 && au.info.mix.peakDb <= -1.4, au.info.mix.lufs + ' LUFS, peak ' + au.info.mix.peakDb + ' dBFS, limiter ' + au.info.mix.limiter.maxReductionDb.toFixed(2) + ' dB');
    check('E4 the score is the programme (no ducking without a voice)', au.info.bed.target === -16 && Math.abs(au.info.mix.trimDb) < 1, 'skor ' + au.info.bed.lufsIn + ' → ' + au.info.bed.target + ' LUFS, laras ' + au.info.mix.trimDb + ' dB');
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
    check('F2 player reports music only (no narration)', /muzik latar sahaja/.test(status), status.trim());
    await U.page.click('#startOverlay');
    await sleep(1600);
    let s = await st();
    check('F3 first click starts the soundtrack and unlocks audio (no narration)', s.playing && s.t > 1.0 && s.ctx === 'running' && s.buffer && s.audioClock && !s.narrated, JSON.stringify({ t: +s.t.toFixed(2), ctx: s.ctx, audioClock: s.audioClock, narrated: s.narrated }));
    await U.page.keyboard.press('Space'); await sleep(100);
    const p1 = await st(); await sleep(500); const p2 = await st();
    check('F4 pause holds the frame', !p1.playing && p1.t === p2.t, 't=' + p1.t.toFixed(3));
    await U.page.click('.scene-btn[data-s="4"]'); await sleep(150);
    s = await st();
    check('F5 scene jump to segment 4 lands on 00:52.000 (frame 3120)', Math.abs(s.t - 52) < 1e-6 && s.frame === 3120, 't=' + s.t + ' frame=' + s.frame);
    await U.page.evaluate(() => { const r = document.getElementById('scrub'); r.value = '4500'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    s = await st();
    check('F6 scrubber seeks to frame 4500 (01:15.000)', s.frame === 4500 && Math.abs(s.t - 75) < 1e-6, 'frame=' + s.frame);
    await U.page.evaluate(() => { const r = document.getElementById('scrub'); r.value = '4590'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    const subOn = await U.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-ref="subsBox"]')).opacity));
    await U.page.keyboard.press('s'); await sleep(50);
    const subOff = await U.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-ref="subsBox"]')).opacity));
    await U.page.keyboard.press('s');
    check('F7 subtitle toggle hides/shows the caption', subOn > 0.9 && subOff === 0, 'on ' + subOn + ' / off ' + subOff);
    await U.page.click('#bMute'); s = await st();
    const muteTxt = await U.page.textContent('#bMute');
    check('F8 mute sets gain 0 and relabels the button', s.muted && s.gain === 0 && /Mati/.test(muteTxt), muteTxt.trim());
    await U.page.click('#bMute');
    await U.page.keyboard.press('7'); await sleep(100); s = await st(); const k7 = s.frame;
    await U.page.keyboard.press('0'); await sleep(100); s = await st();
    check('F9 key 7 jumps to the WhatsApp insert at 01:27.950 (frame 5277), key 0 to the closing at 02:09.350 (frame 7761)', k7 === 5277 && s.frame === 7761, 'frames ' + k7 + ', ' + s.frame);
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
    check('F15 time display shows the 02:17.00 length', /\/ 02:17\.00/.test(timeLbl), timeLbl.trim());
    check('F16 no page errors in preview mode', U.errors.length === 0, U.errors.join(' | '));
    await U.ctx.close();
  } finally { await browser.close(); }

  const w = Math.max(...results.map(r => r.name.length));
  let fail = 0;
  for (const r of results) { if (!r.ok) fail++; console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name.padEnd(w) + (r.detail ? '  · ' + r.detail : '')); }
  console.log('\n' + (results.length - fail) + '/' + results.length + ' checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
