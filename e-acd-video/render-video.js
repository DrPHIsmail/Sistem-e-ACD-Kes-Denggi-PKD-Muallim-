#!/usr/bin/env node
/* ==========================================================================
 * render-video.js — deterministic MP4 export of video-showcase.html
 *
 *   node render-video.js                       # full film → e-ACD-Denggi-Pitch.mp4
 *   node render-video.js --voiceover vo.wav    # + pre-timed BM narration, music ducked
 *   node render-video.js --start 3000 --end 3599 --out test.mp4   # partial (frames)
 *   node render-video.js --probe e-ACD-Denggi-Pitch.mp4           # verify an MP4
 *   node render-video.js --audio-only soundtrack.wav              # music + effects WAV only
 *
 * Options: --out <file>  --voiceover <file>  --workers <n>  --start <frame>
 *          --end <frame>  --crf <n> (17)  --preset <x264 preset> (medium)
 *          --fast (JPEG frames, ~1.7x faster)  --keep-temp  --probe <file>
 *          --vo-level <LUFS> (narration loudness target, default -16)  --vo-raw (no normalisation)
 * Env:     FFMPEG_PATH, FFPROBE_PATH (default: ffmpeg/ffprobe on PATH)
 *          CHROMIUM_PATH (optional executablePath for Playwright)
 *
 * How it works: each worker opens the player in Playwright Chromium at
 * 1920×1080, device scale factor 1, with every non-file request blocked,
 * waits for fonts/images (window.ACD.ready), then for each frame calls
 * window.renderFrame(i) (t = i / 60) and pipes a PNG screenshot into its own
 * FFmpeg/x264 segment. Segments are concatenated without re-encoding and
 * muxed with the page's own audio mix (identical to browser playback).
 * ========================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

const FPS = 60, TOTAL = 5400, W = 1920, H = 1080, SR = 48000, DUR = 90;
const ROOT = __dirname;
const HTML = path.join(ROOT, 'video-showcase.html');
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe';

/* ---------------------------------------------------------------- args */
function parseArgs(argv) {
  const o = { out: path.join(ROOT, 'e-ACD-Denggi-Pitch.mp4'), voiceover: null, workers: Math.max(1, Math.min(4, os.cpus().length)),
    start: 0, end: TOTAL - 1, crf: 17, preset: 'medium', fast: false, keepTemp: false, probe: null, audioOnly: null, voLevel: -16, voRaw: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i], v = () => { if (i + 1 >= argv.length) throw new Error('missing value for ' + a); return argv[++i]; };
    if (a === '--out') o.out = path.resolve(v());
    else if (a === '--voiceover') o.voiceover = path.resolve(v());
    else if (a === '--workers') o.workers = Math.max(1, parseInt(v(), 10));
    else if (a === '--start') o.start = parseInt(v(), 10);
    else if (a === '--end') o.end = parseInt(v(), 10);
    else if (a === '--crf') o.crf = parseInt(v(), 10);
    else if (a === '--preset') o.preset = v();
    else if (a === '--fast') o.fast = true;
    else if (a === '--keep-temp') o.keepTemp = true;
    else if (a === '--probe') o.probe = path.resolve(v());
    else if (a === '--audio-only') o.audioOnly = path.resolve(v());
    else if (a === '--vo-level') o.voLevel = parseFloat(v());
    else if (a === '--vo-raw') o.voRaw = true;
    else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 22).join('\n')); process.exit(0); }
    else throw new Error('unknown option ' + a);
  }
  if (!(o.start >= 0 && o.end <= TOTAL - 1 && o.start <= o.end)) throw new Error('frame range must satisfy 0 <= start <= end <= ' + (TOTAL - 1));
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

/* ---------------------------------------------------------------- audio */
async function exportMix(browser, wavPath) {
  const { context, page, net, errors } = await openPage(browser);
  const chunks = await page.evaluate(() => window.ACD.audio.pcm16Chunks(480000));
  const bufs = chunks.map(c => Buffer.from(c, 'base64'));
  const data = Buffer.concat(bufs);
  fs.writeFileSync(wavPath, Buffer.concat([wavHeader(data.length, SR, 2), data]));
  await context.close();
  return { blocked: net.blocked, errors, samples: data.length / 4 };
}

/* ---------------------------------------------------------------- narration loudness (two-pass, linear) */
async function voLoudnorm(file, target) {
  const base = 'I=' + target + ':TP=-1.5:LRA=11';
  const err = await new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-af', 'loudnorm=' + base + ':print_format=json', '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let e = ''; p.stderr.on('data', d => (e += d)); p.on('error', reject); p.on('close', c => (c === 0 ? resolve(e) : reject(new Error('loudness analysis failed: ' + e.slice(-800)))));
  });
  const m = JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1));
  return { filter: 'loudnorm=' + base + ':measured_I=' + m.input_i + ':measured_TP=' + m.input_tp + ':measured_LRA=' + m.input_lra + ':measured_thresh=' + m.input_thresh + ':offset=' + m.target_offset + ':linear=true', inputI: m.input_i };
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
    if (!v || Number(v.nb_read_frames) !== TOTAL) problems.push('decoded frame count is not 5400');
    if (!v || Math.abs(Number(v.duration) - DUR) > 0.001) problems.push('video duration is not 90.000 s');
  }
  console.log(problems.length ? '  RESULT             FAIL — ' + problems.join('; ') : '  RESULT             OK');
  return problems;
}

/* ---------------------------------------------------------------- main */
async function main() {
  const o = parseArgs(process.argv);
  checkTools();
  if (o.probe) { const p = await probe(o.probe, true); process.exit(p.length ? 1 : 0); }
  if (!fs.existsSync(HTML)) throw new Error('video-showcase.html not found next to render-video.js');
  if (o.voiceover && !fs.existsSync(o.voiceover)) throw new Error('voiceover file not found: ' + o.voiceover);
  const { chromium } = require('playwright');
  if (o.audioOnly) {
    const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    try { const m = await exportMix(b, o.audioOnly); console.log('Wrote ' + o.audioOnly + ': ' + (m.samples / SR).toFixed(3) + ' s, ' + SR + ' Hz, 16-bit stereo'); }
    finally { await b.close(); }
    return;
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'eacd-render-'));
  const count = o.end - o.start + 1, full = o.start === 0 && o.end === TOTAL - 1;
  const workers = Math.min(o.workers, count);
  console.log('Rendering frames ' + o.start + '–' + o.end + ' (' + count + ' frames, ' + (count / FPS).toFixed(3) + ' s) with ' + workers + ' worker(s), ' + (o.fast ? 'JPEG' : 'PNG') + ' capture, x264 ' + o.preset + ' crf ' + o.crf);
  const launchOpts = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};
  const browser = await chromium.launch(Object.assign({ args: ['--force-color-profile=srgb', '--hide-scrollbars', '--disable-lcd-text'] }, launchOpts));
  const t0 = Date.now();
  let blocked = [], pageErrors = [];
  try {
    // 1. audio mix (same samples the browser plays)
    const mixWav = path.join(tmp, 'mix.wav');
    const mix = await exportMix(browser, mixWav);
    blocked = blocked.concat(mix.blocked); pageErrors = pageErrors.concat(mix.errors);
    console.log('Audio mix: ' + (mix.samples / SR).toFixed(3) + ' s @ ' + SR + ' Hz stereo');

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

    // 4. mux audio (optional narration with side-chain ducking), exact duration
    const dur = (count / FPS).toFixed(6), ss = (o.start / FPS).toFixed(6);
    const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', video, '-ss', ss, '-t', dur, '-i', mixWav];
    let map;
    if (o.voiceover) {
      args.push('-ss', ss, '-t', dur, '-i', o.voiceover);
      let norm = '';
      if (!o.voRaw) { const ln = await voLoudnorm(o.voiceover, o.voLevel); norm = ln.filter + ','; console.log('Narration loudness ' + ln.inputI + ' LUFS → normalised to ' + o.voLevel + ' LUFS (linear, two-pass)'); }
      const fc = '[2:a]' + norm + 'aresample=' + SR + ',aformat=sample_fmts=fltp:channel_layouts=stereo,apad,atrim=0:' + dur + ',asplit=2[vo][sc];' +
        '[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.85[mus];' +
        '[mus][sc]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=450:makeup=1[duck];' +
        '[duck][vo]amerge=inputs=2,pan=stereo|c0=c0+c2|c1=c1+c3,alimiter=limit=0.95:level=disabled,apad,atrim=0:' + dur + '[aout]';
      args.push('-filter_complex', fc); map = ['-map', '0:v', '-map', '[aout]'];
    } else {
      args.push('-af', 'apad,atrim=0:' + dur); map = ['-map', '0:v', '-map', '1:a'];
    }
    args.push(...map, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', String(SR), '-ac', '2', '-t', dur, '-movflags', '+faststart', o.out);
    await run(FFMPEG, args);
    console.log('\nWrote ' + o.out + ' in ' + fmtT((Date.now() - t0) / 1000) + (o.voiceover ? ' (with narration: ' + path.basename(o.voiceover) + ')' : ' (music + effects, no narration track)'));
    console.log('Network requests attempted by the page: ' + blocked.length + (blocked.length ? ' → ' + [...new Set(blocked)].slice(0, 5).join(', ') : ' (offline as designed)'));
    if (pageErrors.length) console.log('Page errors: ' + [...new Set(pageErrors)].join(' | '));
    const problems = await probe(o.out, full);
    if (problems.length) process.exitCode = 1;
  } finally {
    await browser.close();
    if (o.keepTemp) console.log('Temporary files kept in ' + tmp); else fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch(e => { console.error('\nERROR: ' + (e && e.message ? e.message : e)); process.exit(1); });
