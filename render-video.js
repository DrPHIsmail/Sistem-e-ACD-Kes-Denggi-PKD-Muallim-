#!/usr/bin/env node
/* ==========================================================================
 * render-video.js (V3/V4) — deterministic MP4 export of the film player
 *
 *   node render-video.js                                   # V9: narration (ElevenLabs "Ahmad") + ducked score → NADI-Muallim-Pitch-141s-v9.mp4
 *   node render-video.js --start 0 --end 1799 --out pratonton-0-30s.mp4     # partial (frames)
 *   node render-video.js --voiceover narasi.wav --out filem-bernarasi.mp4   # add a narration WAV (ducked mix)
 *   node render-video.js --probe NADI-Muallim-Pitch-141s-v9.mp4             # verify an MP4
 *   node render-video.js --audio-only campuran.wav                          # the final mix as WAV
 *
 * Options: --out <file>  --html <file> (video-showcase-v9.html)  --voiceover <wav>
 *          --no-narration  --workers <n>  --start <frame>  --end <frame>
 *          --crf <n> (17)  --preset <x264 preset> (medium)  --fast (JPEG frames)
 *          --keep-temp  --probe <file>  --audio-only <wav>
 * Env:     FFMPEG_PATH, FFPROBE_PATH (default: ffmpeg/ffprobe on PATH)
 *          CHROMIUM_PATH (optional executablePath for Playwright)
 *
 * How it works: each worker opens the player in Playwright Chromium at
 * 1920×1080, device scale factor 1, with every non-file request blocked,
 * waits for fonts/images (window.ACD.ready), then for each frame calls
 * window.renderFrame(i) (t = i / 60) and pipes a PNG screenshot into its own
 * FFmpeg/x264 segment. The soundtrack is the page's own resolved mix
 * (narration + ducked score, src/audio.js) — the same samples the HTML player
 * plays. With --voiceover the WAV's PCM is passed into the page before the
 * mix is computed. After muxing, the MP4's audio is decoded and correlated
 * with the narration, cue by cue: present when a narration was mixed in, and
 * absent (V4, music only) when narration-bm.wav is beside the script.
 * ========================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT = __dirname;
// film length comes from the timeline itself (src/data.js): V9 141.4 s × 60 fps = 8,484 frames
const DATA = require(path.join(ROOT, 'src', 'data.js'));
const FPS = DATA.FPS, TOTAL = DATA.TOTAL_FRAMES, DUR = DATA.DURATION, W = 1920, H = 1080, SR = 48000;
let HTML = path.join(ROOT, 'video-showcase-v9.html');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

/* ---------------------------------------------------------------- args */
function parseArgs(argv) {
  const o = { out: path.join(ROOT, 'NADI-Muallim-Pitch-141s-v9.mp4'), html: HTML, voiceover: null, noNarration: false, workers: Math.max(1, Math.min(4, os.cpus().length)),
    start: 0, end: TOTAL - 1, crf: 17, preset: 'medium', fast: false, keepTemp: false, probe: null, audioOnly: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i], v = () => { if (i + 1 >= argv.length) throw new Error('missing value for ' + a); return argv[++i]; };
    if (a === '--out') o.out = path.resolve(v());
    else if (a === '--voiceover') o.voiceover = path.resolve(v());
    else if (a === '--no-narration') o.noNarration = true;
    else if (a === '--html') o.html = path.resolve(v());
    else if (a === '--workers') o.workers = Math.max(1, parseInt(v(), 10));
    else if (a === '--start') o.start = parseInt(v(), 10);
    else if (a === '--end') o.end = parseInt(v(), 10);
    else if (a === '--crf') o.crf = parseInt(v(), 10);
    else if (a === '--preset') o.preset = v();
    else if (a === '--fast') o.fast = true;
    else if (a === '--keep-temp') o.keepTemp = true;
    else if (a === '--probe') o.probe = path.resolve(v());
    else if (a === '--audio-only') o.audioOnly = path.resolve(v());
    else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 30).join('\n')); process.exit(0); }
    else throw new Error('unknown option ' + a);
  }
  if (!(o.start >= 0 && o.end <= TOTAL - 1 && o.start <= o.end)) throw new Error('frame range must satisfy 0 <= start <= end <= ' + (TOTAL - 1));
  if (o.voiceover && o.noNarration) throw new Error('--voiceover and --no-narration cannot be used together');
  HTML = o.html;
  return o;
}

/* ---------------------------------------------------------------- helpers */
const fmtT = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + 'm' + String(s % 60).padStart(2, '0') + 's'; };
function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, Object.assign({ stdio: ['ignore', 'pipe', 'pipe'] }, opts || {}));
    let out = '', err = '';
    p.stdout.on('data', d => (out += d)); p.stderr.on('data', d => (err += d));
    p.on('error', reject);
    p.on('close', code => (code === 0 ? resolve(out) : reject(new Error(cmd + ' exited ' + code + ':\n' + err.slice(-2000)))));
  });
}
function checkTools() {
  for (const [bin, name] of [[FFMPEG, 'ffmpeg'], [FFPROBE, 'ffprobe']]) {
    try { execFileSync(bin, ['-version'], { stdio: 'ignore' }); }
    catch (e) { throw new Error(name + ' not found (' + bin + '). Install FFmpeg or set ' + name.toUpperCase() + '_PATH.'); }
  }
}
function wavHeader(dataBytes, sampleRate, channels) {
  const b = Buffer.alloc(44);
  b.write('RIFF', 0); b.writeUInt32LE(36 + dataBytes, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(channels, 22); b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * channels * 2, 28); b.writeUInt16LE(channels * 2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(dataBytes, 40); return b;
}

/* ---------------------------------------------------------------- browser */
async function openPage(browser) {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const net = { blocked: [] }, errors = [];
  await context.route('**/*', route => {
    const u = route.request().url();
    if (/^(file|data|blob):/i.test(u)) return route.continue();
    net.blocked.push(u); return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(pathToFileURL(HTML).href + '?render=1', { waitUntil: 'load' });
  await page.evaluate(() => window.ACD.ready);
  await page.evaluate(() => document.fonts.ready);
  const pg = await page.evaluate(() => ({ fps: window.ACD.FPS, frames: window.ACD.TOTAL_FRAMES, dur: window.ACD.DURATION }));
  if (pg.fps !== FPS || pg.frames !== TOTAL || pg.dur !== DUR) throw new Error('player timeline (' + JSON.stringify(pg) + ') does not match src/data.js — rebuild the player: node tools/build-player.js');
  return { context, page, net, errors };
}

async function renderSegment(browser, w, from, to, segPath, opts, progress) {
  const { context, page, net, errors } = await openPage(browser);
  const cdp = await context.newCDPSession(page);
  const shotFmt = opts.fast ? { format: 'jpeg', quality: 95 } : { format: 'png' };
  const ffArgs = ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', opts.fast ? 'mjpeg' : 'png', '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', opts.preset, '-crf', String(opts.crf), '-profile:v', 'high', '-level:v', '4.2',
    '-g', '120', '-r', String(FPS),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-an', segPath];
  const ff = spawn(FFMPEG, ffArgs, { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = ''; ff.stderr.on('data', d => (ffErr += d));
  const done = new Promise((res, rej) => { ff.on('error', rej); ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg segment ' + w + ' failed: ' + ffErr.slice(-1500))))); });
  for (let f = from; f <= to; f++) {
    await page.evaluate(i => window.renderFrame(i), f);
    let shot;
    try { shot = await cdp.send('Page.captureScreenshot', Object.assign({ optimizeForSpeed: true }, shotFmt)); }
    catch (e) { shot = await cdp.send('Page.captureScreenshot', shotFmt); } // older Chromium: no optimizeForSpeed
    const buf = Buffer.from(shot.data, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    progress(w);
  }
  ff.stdin.end();
  await done;
  await context.close();
  return { blocked: net.blocked, errors };
}

/* ---------------------------------------------------------------- narration WAV */
/* Reads a WAV as 48 kHz mono 16-bit PCM. Other WAV layouts (stereo, 24-bit, float, other rates) are
 * converted with FFmpeg first. Errors say what to do. */
async function loadVoiceWav(file, tmp) {
  if (!fs.existsSync(file)) throw new Error('Narration file not found: ' + file + '\n  Put the supplied narration-bm.wav next to render-video.js (or pass its path with --voiceover <file>).\n  To export without narration on purpose, use --no-narration.');
  const st = fs.statSync(file);
  if (!st.isFile() || st.size < 64) throw new Error('Narration file is empty or not a file: ' + file);
  const head = Buffer.alloc(12); const fd = fs.openSync(file, 'r'); fs.readSync(fd, head, 0, 12, 0); fs.closeSync(fd);
  if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Narration file is not a RIFF/WAVE file: ' + file + '\n  Export the narration as WAV (PCM, 48 kHz preferred) and try again.');
  const parse = b => { let o = 12, fmt = null, data = null; while (o + 8 <= b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4);
      if (id === 'fmt ') fmt = { tag: b.readUInt16LE(o + 8), ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
      if (id === 'data') data = b.subarray(o + 8, Math.min(b.length, o + 8 + sz)); o += 8 + sz + (sz & 1); } return { fmt, data }; };
  let buf = fs.readFileSync(file), w = parse(buf), converted = false;
  if (!w.fmt || !w.data) throw new Error('Narration WAV has no fmt/data chunk: ' + file);
  if (!(w.fmt.tag === 1 && w.fmt.bits === 16 && w.fmt.ch === 1 && w.fmt.sr === SR)) {
    const conv = path.join(tmp, 'narasi-48k-mono.wav');
    try { await run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', file, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', conv]); }
    catch (e) { throw new Error('FFmpeg could not convert the narration (' + w.fmt.ch + ' ch, ' + w.fmt.sr + ' Hz, ' + w.fmt.bits + '-bit) to 48 kHz mono PCM: ' + e.message); }
    buf = fs.readFileSync(conv); w = parse(buf); converted = true;
  }
  const samples = w.data.length >> 1, seconds = samples / SR;
  if (samples === 0) throw new Error('Narration WAV contains no audio samples: ' + file);
  if (seconds > DUR + 0.0005) throw new Error('Narration is ' + seconds.toFixed(3) + ' s, longer than the ' + DUR.toFixed(3) + ' s film; trim it to ' + DUR.toFixed(3) + ' s so no speech is cut.');
  let peak = 0; for (let i = 0; i < samples; i++) { const v = Math.abs(w.data.readInt16LE(2 * i)); if (v > peak) peak = v; }
  if (peak < 33) throw new Error('Narration WAV is silent (peak below −60 dBFS): ' + file);
  return { pcm: Buffer.from(w.data.subarray(0, samples * 2)), samples, seconds, converted, label: path.basename(file),
    sha256: require('crypto').createHash('sha256').update(fs.readFileSync(file)).digest('hex') };
}

/* ---------------------------------------------------------------- audio */
async function prepareNarration(page, o, voice) {
  if (o.noNarration) { await page.evaluate(() => window.ACD.audio.disableNarration()); return; }
  if (voice) {
    await page.evaluate(([sr, n, label]) => window.ACD.audio.narrationBegin(sr, n, label), [SR, voice.samples, voice.label]);
    const step = 480000;
    for (let s = 0; s < voice.samples; s += step) {
      const n = Math.min(step, voice.samples - s);
      await page.evaluate(([off, b64]) => window.ACD.audio.narrationChunk(off, b64), [s, voice.pcm.subarray(2 * s, 2 * (s + n)).toString('base64')]);
    }
    await page.evaluate(meta => window.ACD.audio.narrationEnd(meta), { sha256: voice.sha256, converted: voice.converted });
    return;
  }
  // no --voiceover: use a narration embedded in the player if there is one, otherwise music and effects only (V4)
  const embedded = await page.evaluate(() => window.ACD.audio.hasEmbeddedNarration());
  if (!embedded) await page.evaluate(() => window.ACD.audio.disableNarration());
}
async function exportMix(browser, wavPath, o, voice, narrPath) {
  const { context, page, net, errors } = await openPage(browser);
  await prepareNarration(page, o, voice);
  let info;
  try { info = await page.evaluate(async () => (await window.ACD.audio.render()).info); }
  catch (e) { throw new Error('The page could not build the soundtrack: ' + e.message); }
  if (voice && !info.narration) throw new Error('The soundtrack was built without the --voiceover narration. Check the WAV and rebuild the player.');
  const chunks = await page.evaluate(() => window.ACD.audio.pcm16Chunks(480000));
  const data = Buffer.concat(chunks.map(c => Buffer.from(c, 'base64')));
  fs.writeFileSync(wavPath, Buffer.concat([wavHeader(data.length, SR, 2), data]));
  if (narrPath && info.narration) {
    const nr = await page.evaluate(() => window.ACD.audio.narrationPcm16());
    const nd = Buffer.concat(nr.chunks.map(c => Buffer.from(c, 'base64')));
    fs.writeFileSync(narrPath, Buffer.concat([wavHeader(nd.length, SR, 1), nd]));
  }
  await context.close();
  return { blocked: net.blocked, errors, samples: data.length / 4, info };
}

/* ---------------------------------------------------------------- narration present in the MP4? */
/* Decodes the MP4's audio (mono), then for each narration cue inside the rendered range computes the
 * normalised correlation with the narration samples the page used. A narrated mix gives r close to 1;
 * a music-only track gives r near 0. */
async function verifyNarration(mp4, narrWav, fromSec, toSec) {
  const raw = await new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-i', mp4, '-vn', '-af', 'pan=mono|c0=0.5*c0+0.5*c1', '-ar', String(SR), '-f', 'f32le', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    const parts = []; let err = '';
    p.stdout.on('data', d => parts.push(d)); p.stderr.on('data', d => (err += d)); p.on('error', reject);
    p.on('close', c => (c === 0 ? resolve(Buffer.concat(parts)) : reject(new Error('could not decode the MP4 audio: ' + err.slice(-400)))));
  });
  const m = new Float32Array(raw.buffer, raw.byteOffset, raw.length >> 2);
  const nb = fs.readFileSync(narrWav).subarray(44), nv = new Float32Array(nb.length >> 1);
  for (let i = 0; i < nv.length; i++) { const v = nb.readInt16LE(2 * i); nv[i] = v > 0 ? v / 32767 : v / 32768; }
  const off = Math.round(fromSec * SR);
  // cue windows are in FILM time. V8: the narration WAV runs on the film clock and every caption (kit cues and
  // the WhatsApp captions) is spoken. V6/V7: the kit narration ran on the 120 s STORY clock, kit cues only.
  const filmClock = DATA.NARR_CLOCK === 'film';
  const story = filmClock ? (x => x) : (DATA.storyTime || (x => x));
  const cues = DATA.CUES.filter(c => (filmClock || /^c\d\d$/.test(c.id)) && c.start >= fromSec && c.end <= toSec + 0.001 && story(c.end) * SR <= nv.length);
  const corr = (f0, f1, n0, lag) => { let sm = 0, sv = 0, smv = 0; for (let k = 0; k < f1 - f0; k++) { const j = f0 + k - off + lag, i = n0 + k; if (j < 0 || j >= m.length || i >= nv.length) continue; const x = m[j], y = nv[i]; sm += x * x; sv += y * y; smv += x * y; } return { r: smv / Math.sqrt(sm * sv + 1e-30), a: smv / (sv + 1e-30) }; };
  if (!cues.length) return { cues: [], ok: true, note: 'no complete narration cue inside the rendered range' };
  const win = c => [Math.round(c.start * SR), Math.round(c.end * SR), Math.round(story(c.start) * SR)];
  // global lag from the first cue (±20 ms), then each cue at that lag ± 2 samples
  const [a0, a1, n0] = win(cues[0]);
  let best = { lag: 0, r: -2 };
  for (let lag = -960; lag <= 960; lag += 4) { const v = corr(a0, a1, n0, lag).r; if (v > best.r) best = { lag, r: v }; }
  for (let lag = best.lag - 4; lag <= best.lag + 4; lag++) { const v = corr(a0, a1, n0, lag).r; if (v > best.r) best = { lag, r: v }; }
  const rows = cues.map(c => { const [f0, f1, s0] = win(c); let b = { r: -2, a: 0 }; for (let lag = best.lag - 2; lag <= best.lag + 2; lag++) { const v = corr(f0, f1, s0, lag); if (v.r > b.r) b = v; } return { id: c.id, start: c.start, end: c.end, r: b.r, gainDb: 20 * Math.log10(Math.max(1e-9, b.a)) }; });
  const minR = Math.min(...rows.map(r => r.r));
  return { cues: rows, lagMs: best.lag / SR * 1000, minR, ok: minR >= 0.8 && Math.abs(best.lag) <= 96 };
}

/* ---------------------------------------------------------------- probe */
async function probe(file, expectFull) {
  const j = JSON.parse(await run(FFPROBE, ['-v', 'error', '-count_frames', '-show_entries',
    'stream=index,codec_type,codec_name,profile,width,height,pix_fmt,r_frame_rate,avg_frame_rate,nb_read_frames,duration,sample_rate,channels,color_space:format=duration,size,bit_rate',
    '-of', 'json', file]));
  const v = j.streams.find(s => s.codec_type === 'video'), a = j.streams.find(s => s.codec_type === 'audio');
  const rows = [
    ['file', path.basename(file) + ' (' + (j.format.size / 1048576).toFixed(1) + ' MB)'],
    ['container duration', Number(j.format.duration).toFixed(3) + ' s'],
    ['video', v ? v.codec_name + ' ' + (v.profile || '') + ' ' + v.width + 'x' + v.height + ' ' + v.pix_fmt + ' ' + (v.color_space || '') : 'MISSING'],
    ['frame rate', v ? v.r_frame_rate + ' (avg ' + v.avg_frame_rate + ')' : '-'],
    ['decoded frames', v ? v.nb_read_frames : '-'],
    ['video duration', v ? Number(v.duration).toFixed(3) + ' s' : '-'],
    ['audio', a ? a.codec_name + ' ' + a.sample_rate + ' Hz ' + a.channels + ' ch, ' + Number(a.duration).toFixed(3) + ' s' : 'MISSING']
  ];
  console.log('\nffprobe:'); for (const [k, val] of rows) console.log('  ' + k.padEnd(19) + val);
  const problems = [];
  if (!v || v.width !== W || v.height !== H) problems.push('resolution is not 1920x1080');
  if (!v || v.r_frame_rate !== '60/1') problems.push('frame rate is not 60/1');
  if (!v || v.pix_fmt !== 'yuv420p') problems.push('pixel format is not yuv420p');
  if (!a || a.codec_name !== 'aac' || a.sample_rate !== String(SR)) problems.push('audio is not 48 kHz AAC');
  if (expectFull) {
    if (!v || Number(v.nb_read_frames) !== TOTAL) problems.push('decoded frame count is not ' + TOTAL);
    if (!v || Math.abs(Number(v.duration) - DUR) > 0.001) problems.push('video duration is not ' + DUR.toFixed(3) + ' s');
    if (!a || Math.abs(Number(a.duration) - DUR) > 0.03) problems.push('audio duration is not ' + DUR.toFixed(3) + ' s');
  }
  console.log(problems.length ? '  RESULT             FAIL — ' + problems.join('; ') : '  RESULT             OK');
  return problems;
}

/* ---------------------------------------------------------------- main */
async function main() {
  const o = parseArgs(process.argv);
  checkTools();
  if (o.probe) { const p = await probe(o.probe, true); process.exit(p.length ? 1 : 0); }
  if (!fs.existsSync(HTML)) throw new Error(path.basename(HTML) + ' not found next to render-video.js — build it first: node tools/build-player.js');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nadi-v3-render-'));
  const voice = o.voiceover ? await loadVoiceWav(o.voiceover, tmp) : null;
  if (voice) console.log('Narration: ' + voice.label + ' · ' + voice.seconds.toFixed(3) + ' s · sha256 ' + voice.sha256.slice(0, 12) + '…' + (voice.converted ? ' (converted to 48 kHz mono)' : '') + (voice.seconds < DUR - 0.0005 ? ' · padded with silence to ' + DUR.toFixed(3) + ' s' : ''));
  const { chromium } = require('playwright');
  const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  if (o.audioOnly) {
    const b = await chromium.launch(launchOpts);
    try { const m = await exportMix(b, o.audioOnly, o, voice, null); console.log('Wrote ' + o.audioOnly + ': ' + (m.samples / SR).toFixed(3) + ' s, ' + SR + ' Hz, 16-bit stereo · ' + describeMix(m.info)); }
    finally { await b.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
    return;
  }
  const count = o.end - o.start + 1, full = o.start === 0 && o.end === TOTAL - 1;
  const workers = Math.min(o.workers, count);
  console.log('Rendering ' + path.basename(HTML) + ' frames ' + o.start + '–' + o.end + ' (' + count + ' frames, ' + (count / FPS).toFixed(3) + ' s) with ' + workers + ' worker(s), ' + (o.fast ? 'JPEG' : 'PNG') + ' capture, x264 ' + o.preset + ' crf ' + o.crf);
  const browser = await chromium.launch(Object.assign({ args: ['--force-color-profile=srgb', '--hide-scrollbars', '--disable-lcd-text'] }, launchOpts));
  const t0 = Date.now();
  let blocked = [], pageErrors = [], failed = false;
  try {
    // 1. the resolved soundtrack (same samples the browser plays)
    const mixWav = path.join(tmp, 'mix.wav'), narrWav = path.join(tmp, 'narasi-guna.wav');
    const mix = await exportMix(browser, mixWav, o, voice, narrWav);
    blocked = blocked.concat(mix.blocked); pageErrors = pageErrors.concat(mix.errors);
    console.log('Soundtrack: ' + (mix.samples / SR).toFixed(3) + ' s @ ' + SR + ' Hz stereo · ' + describeMix(mix.info));

    // 2. video segments in parallel
    const per = Math.ceil(count / workers), segs = [];
    let doneFrames = 0, lastLog = 0;
    const progress = () => {
      doneFrames++;
      const now = Date.now();
      if (now - lastLog > 4000 || doneFrames === count) {
        lastLog = now; const el = (now - t0) / 1000, rate = doneFrames / el;
        console.log('  ' + doneFrames + '/' + count + ' frames · ' + rate.toFixed(1) + ' fps · elapsed ' + fmtT(el) + ' · ETA ' + fmtT((count - doneFrames) / rate));
      }
    };
    const jobs = [];
    for (let w = 0; w < workers; w++) {
      const from = o.start + w * per, to = Math.min(o.end, from + per - 1);
      if (from > to) continue;
      const seg = path.join(tmp, 'seg' + String(w).padStart(2, '0') + '.mp4'); segs.push(seg);
      jobs.push(renderSegment(browser, w, from, to, seg, o, progress));
    }
    const results = await Promise.all(jobs);
    for (const r of results) { blocked = blocked.concat(r.blocked); pageErrors = pageErrors.concat(r.errors); }

    // 3. concatenate segments (stream copy)
    const list = path.join(tmp, 'segments.txt');
    fs.writeFileSync(list, segs.map(s => "file '" + s.replace(/'/g, "'\\''") + "'").join('\n') + '\n');
    const video = path.join(tmp, 'video.mp4');
    await run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);

    // 4. mux the page's mix (AAC 48 kHz), exact duration
    const dur = (count / FPS).toFixed(6), ss = (o.start / FPS).toFixed(6);
    await run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', video, '-ss', ss, '-t', dur, '-i', mixWav, '-af', 'apad,atrim=0:' + dur,
      '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', String(SR), '-ac', '2', '-t', dur, '-movflags', '+faststart', o.out]);
    console.log('\nWrote ' + o.out + ' in ' + fmtT((Date.now() - t0) / 1000) + (mix.info.narration ? ' (narrated: ' + mix.info.narration.label + ')' : ' (music and effects only, no narration)'));
    console.log('Network requests attempted by the page: ' + blocked.length + (blocked.length ? ' → ' + [...new Set(blocked)].slice(0, 5).join(', ') : ' (offline as designed)'));
    if (pageErrors.length) { console.log('Page errors: ' + [...new Set(pageErrors)].join(' | ')); failed = true; }
    const problems = await probe(o.out, full);
    if (problems.length) failed = true;

    // 5. is the narration audible in the file?
    if (mix.info.narration) {
      const v = await verifyNarration(o.out, narrWav, o.start / FPS, (o.end + 1) / FPS);
      console.log('\nNarration check (MP4 audio vs ' + mix.info.narration.label + ', per cue):');
      for (const r of v.cues) console.log('  ' + r.id + '  ' + r.start.toFixed(2).padStart(6) + '–' + r.end.toFixed(2).padStart(6) + ' s   r = ' + r.r.toFixed(3) + '   level ' + (r.gainDb >= 0 ? '+' : '') + r.gainDb.toFixed(1) + ' dB');
      console.log(v.cues.length ? '  lag ' + v.lagMs.toFixed(2) + ' ms · min r ' + v.minR.toFixed(3) + ' → ' + (v.ok ? 'OK, narration present and aligned' : 'FAIL, narration missing, quiet or misaligned') : '  ' + v.note);
      if (!v.ok) failed = true;
    } else if (fs.existsSync(path.join(ROOT, 'narration-bm.wav'))) {
      // V4: the supplied narration must NOT be in the file (music and effects only)
      const v = await verifyNarration(o.out, path.join(ROOT, 'narration-bm.wav'), o.start / FPS, (o.end + 1) / FPS);
      const maxR = v.cues.length ? Math.max(...v.cues.map(r => Math.abs(r.r))) : 0;
      console.log('\nNarration absence check (MP4 audio vs narration-bm.wav over ' + v.cues.length + ' cue windows): max |r| = ' + maxR.toFixed(3) + ' → ' + (maxR < 0.15 ? 'OK, no narration in the MP4' : 'FAIL, the narration is still audible'));
      if (maxR >= 0.15) failed = true;
    }
    if (failed) process.exitCode = 1;
  } finally {
    await browser.close();
    if (o.keepTemp) console.log('Temporary files kept in ' + tmp); else fs.rmSync(tmp, { recursive: true, force: true });
  }
}
function describeMix(info) {
  const n = info.narration, m = info.mix;
  return (n ? 'narration ' + n.label + ' ' + n.lufsMono.toFixed(1) + ' LUFS (mono) ' + (n.gainDb >= 0 ? '+' : '') + n.gainDb.toFixed(2) + ' dB, score ducked ' + n.duckDb + ' dB under speech' + (n.duckBuildDb != null ? ' (' + n.duckBuildDb + ' dB over the build-up)' : '') : 'no narration') +
    ' · programme ' + m.lufs.toFixed(1) + ' LUFS, peak ' + m.peakDb.toFixed(1) + ' dBFS, limiter max ' + m.limiter.maxReductionDb.toFixed(1) + ' dB';
}

main().catch(e => { console.error('\nERROR: ' + (e && e.message ? e.message : e)); process.exit(1); });
