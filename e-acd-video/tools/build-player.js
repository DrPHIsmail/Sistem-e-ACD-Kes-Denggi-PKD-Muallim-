#!/usr/bin/env node
/* Builds the self-contained video-showcase.html from src/:
 *   1. compiles Tailwind 3.4.17 utilities used by the mockups (offline),
 *   2. inlines Inter (woff2, OFL) and the Jata Negara PNG as data URIs,
 *   3. concatenates data → markup → engine → audio → player into one <script>,
 *   4. refuses to write the file if live URLs, the spreadsheet ID, map
 *      coordinates or real staff names from the source app leak into it.
 * Usage: node tools/build-player.js   (needs tailwindcss: npm install, or TAILWIND_BIN=/path/to/tailwindcss)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const ASSETS = path.join(ROOT, 'assets');
const OUT = path.join(ROOT, 'video-showcase.html');

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
const fonts = { 400: 'Inter-Regular', 500: 'Inter-Medium', 600: 'Inter-SemiBold', 700: 'Inter-Bold', 800: 'Inter-ExtraBold' };
for (const [w, f] of Object.entries(fonts)) css = css.replace('__FONT_' + w + '__', fs.readFileSync(path.join(ASSETS, f + '.woff2')).toString('base64'));
if (/__FONT_\d+__/.test(css)) throw new Error('font placeholder left in CSS');

const order = ['data.js', 'markup.js', 'engine.js', 'audio.js', 'player.js'];
let js = order.map(f => '/* ---- ' + f + ' ---- */\n' + fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
const jata = 'data:image/png;base64,' + fs.readFileSync(path.join(ASSETS, 'jata-negara.png')).toString('base64');
if ((js.match(/__JATA__/g) || []).length !== 1) throw new Error('expected exactly one __JATA__ placeholder');
js = js.replace('__JATA__', jata);

let html = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
html = html.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);

// privacy / offline guards
const forbidden = [
  /https?:\/\//i, /script\.google/i, /google\.com\/maps/i, /3\.6993145/, /101\.510945/,
  /1w9P5Ikuv3gI312b_LhnG2Ko6VbHJr6j2NZEHVmpr8t8/,
  /LOGESVARAN|KUMARASAMY|SHAHIRAN|KHAIRULLAH|SOMUSUNDARAM|NAZREEN|SAIFUL BIN|HARTINI|IRDAWATY|SURYANI|AFZAN|NURUL DIANA|SAFIYYAH|HAPIZAH|AZLIN BINTI|AZRI A\/L/i
];
for (const re of forbidden) {
  const m = html.match(re);
  if (m) throw new Error('forbidden content in output: ' + re + ' near "' + html.substr(Math.max(0, m.index - 40), 100) + '"');
}
fs.writeFileSync(OUT, html);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote ' + path.relative(process.cwd(), OUT) + ' (' + (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB)');
