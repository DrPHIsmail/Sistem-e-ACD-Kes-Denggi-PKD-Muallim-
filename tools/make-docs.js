#!/usr/bin/env node
/* Writes sari-kata-bm-v9.srt from src/data.js — the 29 captions of the V9 film (141.4 s): the 18 kit
 * captions (c07, c09, c10, c14, c15 reworded), the 3 WhatsApp captions and the 8 new V9 lines, each timed
 * to the ElevenLabs narration (NARR_CAPTIONS) — and reports, for every caption, the text check against
 * kit-suara/subtitles-bm.srt and the move from its beat ("rentak", V7_CUE_TIMES on the V9 clock).
 * Earlier SRTs (V2, V3, V5–V8) are left untouched. */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('../src/data.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'sari-kata-bm-v9.srt');
const KIT = path.join(ROOT, 'kit-suara', 'subtitles-bm.srt');

const srt = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + ',' + String(ms % 1000).padStart(3, '0'); };
let out = '';
D.CUES.forEach((c, i) => { out += (i + 1) + '\n' + srt(c.start) + ' --> ' + srt(c.end) + '\n' + c.sub + '\n\n'; });
fs.writeFileSync(OUT, out);
console.log('wrote ' + path.basename(OUT) + ' (' + D.CUES.length + ' captions, timed to the narration)');
const kit = fs.existsSync(KIT) ? fs.readFileSync(KIT, 'utf8').replace(/\r/g, '').trim().split(/\n\n+/).map(b => b.split('\n').slice(2).join('\n')) : null;
let textDiff = 0;
for (const c of D.CUES) {
  const v7 = D.V7_CUE_TIMES[c.id] || [NaN, NaN];   // V9 lines have no V7 time
  const kitText = kit && /^c\d\d$/.test(c.id) ? kit[parseInt(c.id.slice(1), 10) - 1] : null;
  if (kitText !== null && kitText !== c.sub) textDiff++;
  console.log('  ' + c.id.padEnd(4) + srt(c.start) + ' → ' + srt(c.end) + '   (rentak ' + v7[0].toFixed(2) + '–' + v7[1].toFixed(2) + ' s, start ' + ((c.start - v7[0]) >= 0 ? '+' : '') + (c.start - v7[0]).toFixed(2) + ' s)' + (kitText !== null && kitText !== c.sub ? '  TEXT DIFFERS FROM KIT' : ''));
}
if (kit) console.log(textDiff ? textDiff + ' kit caption(s) differ in text from kit-suara/subtitles-bm.srt' : 'caption text identical to kit-suara/subtitles-bm.srt (18 kit captions); 3 WhatsApp captions as in V6/V7');
