#!/usr/bin/env node
/* Generates voiceover-script-bm.md and subtitles-bm.srt from src/data.js, so the
 * narration timings in the documents are exactly the ones the player uses. */
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('../src/data.js');
const ROOT = path.resolve(__dirname, '..');

const ts = s => { const m = Math.floor(s / 60), r = s - m * 60; return String(m).padStart(2, '0') + ':' + r.toFixed(3).padStart(6, '0'); };
const srt = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s - h * 3600 - m * 60; return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(Math.floor(r)).padStart(2, '0') + ',' + String(Math.round((r % 1) * 1000)).padStart(3, '0'); };
// rough Malay syllable estimate (vowel groups; ai/au/oi count once; acronyms spelled out)
const SPELL = { 'e-ACD': 'i ei si di', CSV: 'si es vi', Google: 'gu gel', Sheets: 'syits', WhatsApp: 'wat sep', Aedes: 'a e des', Abate: 'a ba te' };
const syl = s => s.split(/\s+/).map(w => { const k = w.replace(/[.,]/g, ''); const x = SPELL[k] || k; return (x.toLowerCase().replace(/ai|au|oi/g, 'a').match(/[aeiou]+/g) || []).length; }).reduce((a, b) => a + b, 0);

let md = '';
md += '# Voiceover script — Sistem e-ACD Kes Denggi (90 s)\n\n';
md += 'Read-ready Bahasa Malaysia narration for the PKD Muallim competition film. Every time below is generated from `src/data.js`, the same cue table that drives the subtitles in `video-showcase.html` and the music ducking in `render-video.js`.\n\n';
md += '## Recording brief\n\n';
md += '- **Format:** WAV, 48 kHz, 24-bit or 16-bit, mono or stereo. Room tone only between lines.\n';
md += '- **Pre-timed file:** the file must start at film time 00:00.000 and be no longer than 90.000 s. Leave silence where there is no narration. `render-video.js` pads or trims it to exactly 90.000 s.\n';
md += '- **Level:** peaks no higher than −3 dBFS. `render-video.js --voiceover` normalises the narration to −16 LUFS (two-pass, linear) and ducks the music about 10–12 dB under it, so a clean, consistent read matters more than the absolute level.\n';
md += '- **Timing guide:** open `video-showcase.html`, turn the sound off (**M**) and keep subtitles on (**S**). Each caption appears exactly when its line should start, so the player works as a teleprompter. Alternatively record line by line and place each take at its **Start** time in an editor (OpenShot, Audacity).\n';
md += '- **Pace:** most phrases run at about 4–5.3 syllables per second (see the Pace column). The briskest are S6a (about 5.6) and S2b (about 5.4). Scene 5 runs its lines back to back with almost no pause, so read it crisply; in Scene 6 keep *e-ACD Kes Denggi* and the office name unhurried.\n\n';
md += '## Narration (read exactly as written)\n\n';
md += '| # | Scene | Start | End | Window | Narration |\n|---|---|---|---|---|---|\n';
for (const n of D.NARRATION) md += '| ' + n.id + ' | ' + n.scene + ' | ' + ts(n.start) + ' | ' + ts(n.end) + ' | ' + (n.end - n.start).toFixed(2) + ' s | ' + n.say + ' |\n';
md += '\n## Line-by-line cue sheet (subtitle phrases)\n\n';
md += 'Each narration sentence is split into the short phrases shown as captions. **Spoken text** is what the narrator says (numbers written out); **Caption** is what appears on screen (two lines at most, digits for readability).\n\n';
md += '| Cue | Start | End | Pace (syll/s) | Spoken text | Caption |\n|---|---|---|---|---|---|\n';
for (const c of D.CUES) md += '| ' + c.id + ' | ' + ts(c.start) + ' | ' + ts(c.end) + ' | ' + (syl(c.say) / (c.end - c.start)).toFixed(1) + ' | ' + c.say + ' | ' + c.sub.replace(/\n/g, ' / ') + ' |\n';
md += '\n## Pronunciation and delivery notes (not part of the spoken text)\n\n';
md += '| Term | Direction |\n|---|---|\n';
md += '| e-ACD | Say it as letters: "i-ei-si-di". |\n';
md += '| ACD | Letters: "ei-si-di". The narration expands it once in Scene 2 as *pengesanan kes aktif*. |\n';
md += '| CSV | Letters: "si-es-vi". |\n';
md += '| Google Sheets, WhatsApp | Use the usual English product names. |\n';
md += '| Aedes, Abate | Use the pronunciation the PKD vector-control unit uses in the field, and confirm it with the officer in charge before recording. |\n';
md += '| Muallim | Three clear syllables: "Mu-al-lim". |\n';
md += '| Numbers | Read in full exactly as written (*sembilan puluh dua*, *seratus sepuluh*, *lapan puluh empat peratus*). |\n';
md += '| Tone | Calm, confident and formal: a public-health briefing, not an advertisement. Slight emphasis on *automatik*, *lapan puluh empat peratus* and the closing name. |\n';
md += '| Accuracy | Scene 4 says *dalam simulasi ini* on purpose: the figures are demo data. Keep that phrase. |\n';
md += '\n## Scene map\n\n| Scene | Time | Title |\n|---|---|---|\n';
for (const s of D.SCENES) md += '| ' + s.id + ' | ' + ts(s.start) + '–' + ts(s.end) + ' | ' + s.title + ' |\n';
fs.writeFileSync(path.join(ROOT, 'voiceover-script-bm.md'), md);

let out = '';
D.CUES.forEach((c, i) => { out += (i + 1) + '\n' + srt(c.start) + ' --> ' + srt(c.end) + '\n' + c.sub + '\n\n'; });
fs.writeFileSync(path.join(ROOT, 'subtitles-bm.srt'), out);
console.log('wrote voiceover-script-bm.md and subtitles-bm.srt (' + D.CUES.length + ' cues, ' + D.NARRATION.length + ' sentences)');
