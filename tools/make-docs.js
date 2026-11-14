#!/usr/bin/env node
/* Writes sari-kata-bm-v7.srt from src/data.js — the on-screen caption cues of the V7 film (137 s):
 * 18 kit captions as text on the film clock (slower manual scene, 14 s WhatsApp segment; c01 heads the
 * follow-up flow) + 3 WhatsApp captions (w1–w3) — and reports every difference from the supplied
 * kit-suara/subtitles-bm.srt. Earlier SRTs (V2, V3, V5, V6) are left untouched. */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('../src/data.js');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'sari-kata-bm-v7.srt');
const KIT = path.join(ROOT, 'kit-suara', 'subtitles-bm.srt');

const srt = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + ',' + String(ms % 1000).padStart(3, '0'); };
let out = '';
D.CUES.forEach((c, i) => { out += (i + 1) + '\n' + srt(c.start) + ' --> ' + srt(c.end) + '\n' + c.sub + '\n\n'; });
fs.writeFileSync(OUT, out);
console.log('wrote ' + path.basename(OUT) + ' (' + D.CUES.length + ' cues)');
if (fs.existsSync(KIT)) {
  // compare by cue id (cNN ↔ kit cue NN), so a removed cue does not shift the comparison
  const kit = fs.readFileSync(KIT, 'utf8').replace(/\r/g, '').trim().split(/\n\n+/).map(b => { const l = b.split('\n'); return { time: l[1], text: l.slice(2).join('\n') }; });
  let diffs = 0, shiftedOnly = 0;
  kit.forEach((k, i) => {
    const c = D.CUES.find(q => q.id === 'c' + String(i + 1).padStart(2, '0'));
    if (!c) { diffs++; console.log('  kit cue ' + (i + 1) + ' (' + k.time + ') not shown as a caption'); return; }
    const time = srt(c.start) + ' --> ' + srt(c.end);
    // V7: a kit cue is expected at its story time on the film clock (filmTime)
    const kt = k.time.split(' --> ').map(x => { const m = /(\d+):(\d+):(\d+),(\d+)/.exec(x); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; });
    const shifted = srt(Math.round(D.filmTime(kt[0]) * 100) / 100) + ' --> ' + srt(Math.round(D.filmTime(kt[1]) * 100) / 100);
    if (time === shifted && c.sub === k.text) { if (shifted !== k.time) shiftedOnly++; return; }
    diffs++;
    console.log('  ' + c.id + ': ' + k.time + '  →  ' + time + (c.sub !== k.text ? '  (text differs)' : '  (time only)'));
  });
  console.log(shiftedOnly + ' kit cue(s) only moved by the film clock (slower manual scene, ' + D.INSERT.len + ' s WhatsApp segment); ' + D.CUES.filter(c => /^w/.test(c.id)).length + ' WhatsApp caption(s) added');
  console.log(diffs ? diffs + ' cue(s) otherwise differ from kit-suara/subtitles-bm.srt' : 'otherwise identical to kit-suara/subtitles-bm.srt');
}
