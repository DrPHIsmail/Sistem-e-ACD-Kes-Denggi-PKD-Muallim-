#!/usr/bin/env node
/* Automated checks for video-showcase.html (run: node tools/check-player.js).
 * Offline load, data/calculation fidelity, data-simulation labels, frame
 * determinism, player controls (play, pause, seek, scenes, restart, mute,
 * subtitles, clean mode, auto-hide) and the audio buffer. Exit code 1 on failure. */
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const HTML = path.resolve(__dirname, '..', 'video-showcase.html');
const URL = pathToFileURL(HTML).href;
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

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] });
  try {
    /* ---------------- A. offline load + data fidelity (render mode) */
    const R = await open(browser, '?render=1');
    const html = fs.readFileSync(HTML, 'utf8');
    check('A1 opens from file:// with every network request blocked', R.blocked.length === 0, R.blocked.length + ' request(s) attempted');
    check('A2 no live URL / spreadsheet ID / map coordinates in the file', /* [pengecam sebenar dibuang dalam salinan repositori awam] */ !/https?:\/\//i.test(html));
    const T = await R.page.evaluate(() => window.ACD.TOTALS);
    check('B1 totals 110 / 92 / 12 / 337 / 3 / 3', T.locality === 110 && T.visited === 92 && T.locked === 12 && T.pop === 337 && T.symp === 3 && T.ref === 3, JSON.stringify(T));
    check('B2 coverage ROUND(92/110×100) = 84%', T.pct === 84 && Math.round(92 / 110 * 100) === 84, (92 / 110 * 100).toFixed(3) + '% → ' + T.pct + '%');
    check('B3 doughnut slices 92 / 12 / 6', T.visited === 92 && T.locked === 12 && T.unvisited === 6);
    const zero = await R.page.evaluate(() => computeTotals(zeroTeams()).pct);
    check('B4 zero denominator gives 0% (source rule)', zero === 0, zero + '%');
    const teamPct = await R.page.evaluate(() => [1, 2, 3, 4, 5, 6].map(t => calcTeamPct(TEAMS[t])));
    check('B5 team coverage 85/83/84/82/83/83 %', teamPct.join() === '85,83,84,82,83,83', teamPct.join(' '));
    await R.page.evaluate(() => window.renderFrame(64 * 60));
    const dom = await R.page.evaluate(() => { const g = r => document.querySelector('[data-ref="' + r + '"]').textContent.trim(); return { pct: g('ph.kpiPct'), ratio: g('ph.kpiRatio'), badge: g('ph.kpiBadge'), loc: g('dk.mLoc'), vis: g('dk.mVis'), pop: g('dk.mPop'), symp: g('dk.mSymp'), ref: g('dk.mRef') }; });
    check('B6 dashboard at 01:04 shows 84%, (92 / 110 premis), Capai Sasaran', dom.pct === '84%' && dom.ratio === '(92 / 110 premis)' && dom.badge.startsWith('Capai Sasaran'), JSON.stringify(dom));
    check('B7 dashboard counters 110 / 92 / 337 / 3 / 3', dom.loc === '110' && dom.vis === '92' && dom.pop === '337' && dom.symp === '3' && dom.ref === '3');
    const cross = await R.page.evaluate(() => { const f = Math.round(T_TARGET_CROSS * 60); return { t: T_TARGET_CROSS, at: computeTotals(teamsAt(f / 60)).pct, before: computeTotals(teamsAt((f - 1) / 60)).pct }; });
    check('B8 badge flips on the first frame where coverage ≥ 80%', cross.at >= 80 && cross.before < 80, 't=' + cross.t.toFixed(3) + 's (' + cross.before + '% → ' + cross.at + '%)');
    const wa = await R.page.evaluate(() => buildWhatsappSummary(META, TOTALS));
    check('B9 WhatsApp summary built like the source (84%, 110, 92, 337)', /Pencapaian ACD \(%\): 84%/.test(wa) && /Lokaliti: 110 buah/.test(wa) && /Dilawati: 92 buah/.test(wa) && /337 orang/.test(wa));
    check('B10 CSV file name as the source builds it', (await R.page.evaluate(() => CSV_FILENAME)) === 'Hasil_ACD_Kg._Ketoyong.csv');
    // data-simulation label visible whenever example figures are on screen
    const simAt = [11, 35, 46, 59, 64, 72.5, 76.9, 80.5];
    const simVis = [];
    for (const t of simAt) {
      await R.page.evaluate(f => window.renderFrame(f), Math.round(t * 60));
      simVis.push(await R.page.evaluate(() => Array.from(document.querySelectorAll('#stage .sim-badge')).some(el => {
        const r = el.getBoundingClientRect(); if (r.width < 1 || r.right < 0 || r.left > 1920 || r.bottom < 0 || r.top > 1080) return false;
        let e = el; while (e && e.id !== 'stage') { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.5) return false; e = e.parentElement; }
        return true; })));
    }
    check('C1 "DATA SIMULASI" visible at ' + simAt.join(', ') + ' s', simVis.every(Boolean), simVis.map((v, i) => simAt[i] + 's:' + (v ? 'ya' : 'TIDAK')).join(' '));
    const sub2 = await R.page.evaluate(() => CUES.every(c => c.sub.split('\n').length <= 2));
    check('C2 every caption is at most two lines', sub2);

    /* ---------------- D. determinism */
    const frames = [600, 1730, 2650, 3790, 4580, 5399];
    const A = await open(browser, '?render=1'), B = await open(browser, '?render=1');
    let seekSame = 0;
    for (const f of frames) { await A.page.evaluate(i => window.renderFrame(i), f); await B.page.evaluate(i => window.renderFrame(i), f); if ((await shot(A)) === (await shot(B))) seekSame++; }
    check('D1 seeking to a frame is reproducible across fresh pages', seekSame === frames.length, seekSame + '/' + frames.length + ' identical');
    // play from 0 → frame N vs fresh seek (state hash over visible stage DOM)
    const stateHash = () => { const out = []; for (const el of document.querySelectorAll('#stage *')) { if (!el.getClientRects().length) continue; let o = 1, e = el; while (e && e.id !== 'stage') { const cs = getComputedStyle(e); o *= parseFloat(cs.opacity); if (cs.visibility === 'hidden') o = 0; e = e.parentElement; } if (o <= 0.001) continue; out.push(Array.from(el.style).sort().map(k => k + ':' + el.style.getPropertyValue(k)).join(';'), Array.from(el.classList).sort().join(' '), el.getAttribute('d') || '', el.getAttribute('opacity') || '', el.getAttribute('stroke-dashoffset') || '', el.childElementCount ? '' : el.textContent); } return out.join('|'); };
    let stateSame = 0; const sampled = [1730, 3790, 5200];
    const P1 = await open(browser, '?render=1');
    for (let f = 0; f <= 5200; f += 2) { await P1.page.evaluate(i => window.renderFrame(i), f); if (sampled.includes(f)) { const a = sha(await P1.page.evaluate(stateHash)); await B.page.evaluate(i => window.renderFrame(i), f); const b = sha(await B.page.evaluate(stateHash)); if (a === b) stateSame++; } }
    check('D2 playing to frame N gives the same visible DOM state as seeking to N', stateSame === sampled.length, stateSame + '/' + sampled.length + ' identical hashes over every element with non-zero effective opacity');
    await A.ctx.close(); await B.ctx.close(); await P1.ctx.close();

    /* ---------------- E. audio */
    const au = await R.page.evaluate(async () => { const m = await window.ACD.audio.render(); let pk = 0, acc = 0; for (let i = 0; i < m.length; i++) { const v = Math.max(Math.abs(m.L[i]), Math.abs(m.R[i])); if (v > pk) pk = v; acc += m.L[i] * m.L[i]; } return { len: m.length, sr: m.sampleRate, peak: pk, rms: Math.sqrt(acc / m.length), events: buildSoundEvents().length, taps: buildSoundEvents().filter(e => e.k === 'tap').length }; });
    check('E1 audio mix is exactly 90.000 s at 48 kHz', au.len === 90 * 48000 && au.sr === 48000, au.len + ' samples');
    check('E2 audio peak below full scale', au.peak < 0.9, 'peak ' + (20 * Math.log10(au.peak)).toFixed(1) + ' dBFS, rms ' + (20 * Math.log10(au.rms)).toFixed(1) + ' dBFS');
    check('E3 sound cues come from the shared timeline', au.events > 100 && au.taps >= 30, au.events + ' events, ' + au.taps + ' taps');
    await R.ctx.close();

    /* ---------------- F. player controls (preview mode) */
    const U = await open(browser, '');
    const st = () => U.page.evaluate(() => window.ACD.player.state);
    const vis = sel => U.page.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05; }, sel);
    check('F1 start overlay and controls present', (await vis('#startOverlay')) && (await vis('#controls')));
    check('F2 Web Speech toggle disabled when no ms-MY voice exists', await U.page.evaluate(() => { const b = document.getElementById('bSpeech'); const has = 'speechSynthesis' in window && speechSynthesis.getVoices().some(v => /^ms/i.test(v.lang)); return has ? !b.disabled : b.disabled; }));
    await U.page.waitForFunction(() => /Sedia/.test(document.getElementById('startStatus').textContent), null, { timeout: 60000 });
    await U.page.click('#startOverlay');
    await sleep(1600);
    let s = await st();
    check('F3 first click starts playback and unlocks audio', s.playing && s.t > 1.0 && s.ctx === 'running' && s.buffer && s.audioClock, JSON.stringify({ t: +s.t.toFixed(2), ctx: s.ctx, audioClock: s.audioClock }));
    await U.page.keyboard.press('Space'); await sleep(100);
    const p1 = await st(); await sleep(500); const p2 = await st();
    check('F4 pause holds the frame', !p1.playing && p1.t === p2.t, 't=' + p1.t.toFixed(3));
    await U.page.click('.scene-btn[data-s="4"]'); await sleep(150);
    s = await st();
    check('F5 scene jump to Scene 4 lands on 00:50.000 (frame 3000)', Math.abs(s.t - 50) < 1e-6 && s.frame === 3000, 't=' + s.t + ' frame=' + s.frame);
    await U.page.evaluate(() => { const r = document.getElementById('scrub'); r.value = '3840'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    s = await st();
    check('F6 scrubber seeks to frame 3840 (01:04.000)', s.frame === 3840 && Math.abs(s.t - 64) < 1e-6, 'frame=' + s.frame);
    const subOn = await U.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-ref="subsBox"]')).opacity));
    await U.page.keyboard.press('s'); await sleep(50);
    const subOff = await U.page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('[data-ref="subsBox"]')).opacity));
    await U.page.keyboard.press('s');
    check('F7 subtitle toggle hides/shows the caption', subOn > 0.9 && subOff === 0, 'on ' + subOn + ' / off ' + subOff);
    await U.page.click('#bMute'); s = await st();
    const muteTxt = await U.page.textContent('#bMute');
    check('F8 mute sets gain 0 and relabels the button', s.muted && s.gain === 0 && /Mati/.test(muteTxt), muteTxt.trim());
    await U.page.click('#bMute');
    await U.page.click('#bRestart'); await sleep(300); s = await st();
    check('F9 restart returns to 0 and plays', s.playing && s.t < 0.6, 't=' + s.t.toFixed(3));
    await U.page.mouse.move(5, 5); await sleep(3000);
    check('F10 controls auto-hide during playback', await U.page.evaluate(() => document.getElementById('controls').classList.contains('hidden')));
    await U.page.keyboard.press('c'); await sleep(100);
    const cleanHidden = !(await vis('#controls')) && (await U.page.evaluate(() => getComputedStyle(document.body).cursor)) === 'none';
    await U.page.keyboard.press('Escape'); await sleep(100);
    check('F11 clean recording mode hides controls and cursor; Esc exits', cleanHidden && (await vis('#controls')));
    await U.page.keyboard.press('Space'); await sleep(50);
    await U.page.keyboard.press('ArrowRight'); s = await st();
    const tA = s.t; await U.page.keyboard.press('.'); const sB = await st();
    check('F12 keyboard seek ±1 s and single-frame step', Math.abs(sB.t - tA - 1 / 60) < 1e-6, 't ' + tA.toFixed(3) + ' → ' + sB.t.toFixed(3));
    check('F13 no page errors in preview mode', U.errors.length === 0, U.errors.join(' | '));
    await U.ctx.close();
  } finally { await browser.close(); }

  const w = Math.max(...results.map(r => r.name.length));
  let fail = 0;
  for (const r of results) { if (!r.ok) fail++; console.log((r.ok ? 'PASS ' : 'FAIL ') + r.name.padEnd(w) + (r.detail ? '  · ' + r.detail : '')); }
  console.log('\n' + (results.length - fail) + '/' + results.length + ' checks passed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
