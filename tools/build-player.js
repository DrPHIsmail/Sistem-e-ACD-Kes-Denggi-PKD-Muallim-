#!/usr/bin/env node
/* Builds the self-contained V10 player video-showcase-v10.html from src/ (141.4 s; music and effects
 * + the ElevenLabs narration narasi-v9/narasi-v9.wav, unchanged since V9; the V2–V9 players are left untouched):
 *   1. compiles Tailwind 3.4.17 utilities used by the mockups (offline),
 *   2. inlines Inter, Plus Jakarta Sans, JetBrains Mono, Caveat (woff2, OFL), the
 *      Jata Negara PNG and the opening map background (JPEG) as data URIs,
 *   3. optionally embeds a narration WAV (--voiceover) losslessly as FLAC in a
 *      non-executed <script type="application/octet-stream"> block; the page then
 *      builds one resolved mix (narration + ducked score),
 *   4. concatenates data → markup → engine → audio → player into one <script>,
 *   5. refuses to write the file if live URLs, the spreadsheet ID, map
 *      coordinates or real staff names from the source apps leak into it
 *      (V6: those identifiers are checked by hash, not stored in clear).
 * Usage: node tools/build-player.js [--voiceover narasi.wav | --no-narration] [--out video-showcase-v10.html]
 *        (needs tailwindcss: npm install, or TAILWIND_BIN=/path/to/tailwindcss; ffmpeg for the narration)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');
const ARGS = process.argv.slice(2);
const argVal = (k, d) => { const i = ARGS.indexOf(k); return i >= 0 && i + 1 < ARGS.length ? ARGS[i + 1] : d; };
const OUT = path.resolve(ROOT, argVal('--out', 'video-showcase-v10.html'));
// V8: the ElevenLabs narration (film clock) is embedded by default; --no-narration builds a music-only player
const VOICE = ARGS.includes('--no-narration') ? null : path.resolve(ROOT, argVal('--voiceover', path.join('narasi-v9', 'narasi-v9.wav')));
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
if (['video-showcase.html', 'video-showcase-v3.html', 'video-showcase-v4.html', 'video-showcase-v5.html', 'video-showcase-v6.html', 'video-showcase-v7.html', 'video-showcase-v8.html', 'video-showcase-v9.html'].includes(path.basename(OUT))) throw new Error(path.basename(OUT) + ' is an earlier export kept for comparison; choose another --out name');

function tailwindBin() {
  const cands = [process.env.TAILWIND_BIN, path.join(ROOT, 'node_modules', '.bin', 'tailwindcss')].filter(Boolean);
  for (const c of cands) if (fs.existsSync(c)) return c;
  throw new Error('tailwindcss not found. Run "npm install" (devDependency tailwindcss@3.4.17) or set TAILWIND_BIN.');
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'eacd-build-'));
const cssOut = path.join(tmp, 'styles.css');
execFileSync(tailwindBin(), ['-c', path.join(__dirname, 'tailwind.config.js'), '-i', path.join(SRC, 'styles.css'), '-o', cssOut, '--minify'], { stdio: ['ignore', 'ignore', 'inherit'] });
let css = fs.readFileSync(cssOut, 'utf8');
// keep Tailwind's MIT attribution banner, minus the URL scheme (the output must contain no URLs at all)
css = css.replace(/https:\/\/tailwindcss\.com/g, 'tailwindcss.com');
const fonts = {
  __FONT_400__: 'Inter-Regular', __FONT_500__: 'Inter-Medium', __FONT_600__: 'Inter-SemiBold', __FONT_700__: 'Inter-Bold', __FONT_800__: 'Inter-ExtraBold',
  __PJS_400__: 'PlusJakartaSans-400', __PJS_500__: 'PlusJakartaSans-500', __PJS_600__: 'PlusJakartaSans-600', __PJS_700__: 'PlusJakartaSans-700', __PJS_800__: 'PlusJakartaSans-800',
  __JBM_400__: 'JetBrainsMono-Regular', __JBM_600__: 'JetBrainsMono-SemiBold', __JBM_700__: 'JetBrainsMono-Bold',
  __CAV_500__: 'Caveat-500', __CAV_700__: 'Caveat-700'
};
for (const [ph, f] of Object.entries(fonts)) {
  if (css.split(ph).length !== 2) throw new Error('expected one ' + ph + ' placeholder in CSS');
  css = css.replace(ph, fs.readFileSync(path.join(ASSETS, f + '.woff2')).toString('base64'));
}
if (/__(FONT|PJS|JBM|CAV)_\d+__/.test(css)) throw new Error('font placeholder left in CSS');

/* V9 (draft 3): three.js r158 (MIT licence, banner kept) for the hypothetical 3D kampung, inlined so the player still
 * loads nothing. Its three URL strings are defanged for the offline guard below: the deprecation notice is dropped,
 * the forum link loses its scheme, and the XHTML namespace that createElementNS needs is written as two joined
 * strings (the same value at run time). */
function threeSource() {
  const f = [process.env.THREE_JS, path.join(ROOT, 'node_modules', 'three', 'build', 'three.min.js')].filter(Boolean).find(c => fs.existsSync(c));
  if (!f) throw new Error('three.min.js (r158) not found. Run "npm install" (devDependency three@0.158.0) or set THREE_JS.');
  let s = fs.readFileSync(f, 'utf8');
  s = s.replace(/^console\.warn\('Scripts "build\/three\.js"[^']*'\),/, 'void 0,');
  s = s.split('https://discourse.threejs.org').join('discourse.threejs.org');
  s = s.split('"http://www.w3.org/1999/xhtml"').join('"http:"+"//www.w3.org/1999/xhtml"');
  if (/https?:\/\//i.test(s)) throw new Error('three.js still contains a URL after patching (' + f + ')');
  if (!/\* @license/.test(s)) throw new Error('three.js licence banner missing');
  return s;
}
const order = ['data.js', 'markup.js', 'kampung3d.js', 'engine.js', 'hero.js', 'audio.js', 'player.js'];
let js = '/* ---- three.min.js (r158, MIT) ---- */\n' + threeSource() + '\n' + order.map(f => '/* ---- ' + f + ' ---- */\n' + fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
// V9: 29 captions timed to the narration (src/data.js NARR_CAPTIONS)
console.log('cues: ' + (js.match(/\{ id: '[a-z]\d+'/g) || []).length + ' from src/data.js (NARR_CAPTIONS, timed to narasi-v9/narasi-v9.wav)');
const jata = 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS, 'jata-negara.png')).toString('base64');
if ((js.match(/__JATA__/g) || []).length !== 1) throw new Error('expected exactly one __JATA__ placeholder');
js = js.replace('__JATA__', jata);
// V6: opening globe texture (tools/make-map-globe.py)
const peta = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ASSETS, 'peta-glob.jpg')).toString('base64');
if ((js.match(/__PETA__/g) || []).length !== 1) throw new Error('expected exactly one __PETA__ placeholder');
js = js.replace('__PETA__', peta);
// V9 (draft 3): the Google Earth view behind the NADI introduction (src/kampung3d.js)
const udara = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(ASSETS, 'udara-3d.jpg')).toString('base64');
if ((js.match(/__UDARA__/g) || []).length !== 1) throw new Error('expected exactly one __UDARA__ placeholder');
js = js.replace('__UDARA__', udara);

let html = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
html = html.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);

// narration: the supplied WAV, losslessly re-packed as FLAC (no metadata)
let voiceBlock = '';
if (VOICE) {
  if (!fs.existsSync(VOICE)) throw new Error('Narration file not found: ' + VOICE + '\n  Make it with: python3 -I tools/place-narration-v9.py . (needs narasi-v9/takes), pass --voiceover <file>, or build a music-only player with --no-narration.');
  const wav = fs.readFileSync(VOICE);
  if (wav.toString('ascii', 0, 4) !== 'RIFF' || wav.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Narration file is not a RIFF/WAVE file: ' + VOICE);
  const sha = require('crypto').createHash('sha256').update(wav).digest('hex');
  const flac = path.join(tmp, 'narasi.flac');
  try { execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', VOICE, '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact', '-c:a', 'flac', '-compression_level', '12', flac]); }
  catch (e) { throw new Error('FFmpeg could not convert the narration to FLAC (' + (e.message || e) + '). Install FFmpeg or set FFMPEG_PATH.'); }
  const b64 = fs.readFileSync(flac).toString('base64');
  voiceBlock = '<script type="application/octet-stream" id="narasi-flac" data-file="' + path.basename(VOICE) + '" data-sha256="' + sha + '">' + b64 + '</script>\n';
  console.log('narration: ' + path.basename(VOICE) + ' (sha256 ' + sha.slice(0, 12) + '…) embedded as FLAC, ' + (b64.length / 1048576).toFixed(2) + ' MB base64');
} else console.log('narration: none (music and effects only; pass --voiceover <wav> to embed one)');
if (html.split('<!--__NARASI__-->').length !== 2) throw new Error('expected one <!--__NARASI__--> placeholder in template.html');
html = html.replace('<!--__NARASI__-->', () => voiceBlock);

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
// privacy / offline guards
const forbidden = [/https?:\/\//i, /script\.google/i, /google\.com\/maps/i];
// binary payloads (fonts, images, FLAC) are base64 and cannot carry readable text; test everything else
const textOnly = html.replace(/[A-Za-z0-9+\/=]{400,}/g, '');
for (const re of forbidden) {
  const m = textOnly.match(re);
  if (m) throw new Error('forbidden content in output: ' + re + ' near "' + textOnly.substr(Math.max(0, m.index - 40), 100) + '"');
}
const leaks = bannedHits(textOnly);
if (leaks.length) throw new Error('forbidden identifier(s) in output (spreadsheet ID, source coordinates or a real name): ' + leaks.slice(0, 5).join(', '));
fs.writeFileSync(OUT, html);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote ' + path.relative(process.cwd(), OUT) + ' (' + (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB)');
