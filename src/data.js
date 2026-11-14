/* ==========================================================================
 * data.js — single source of truth for the NADI Muallim film (V3–V8; V7 and V8 run 137 s).
 * V8 = V7 picture + an ElevenLabs narration (voice "Ahmad") of the 21 V7 captions; the captions
 * follow the voice (NARR_CAPTIONS below), the picture and the story clock are unchanged.
 * V9 adds 8 spoken lines (opening x4, "Inilah NADI Muallim", the two-phone line, the benefits x2),
 * re-voices c02, c03, c07, c09 and c10 (29 captions), and changes the phone title and the summary panel.
 * Every beat of the V5 story (engine.js T) keeps its STORY time (0–120 s). The FILM clock differs
 * in two places (TIMEMAP): V7 plays the manual scene (story 6.5–13.35 s) 1.44× slower, over film
 * 6.5–16.35 s, and V6 holds the story at 84.95 s for the 14-second WhatsApp segment.
 * SCENES and CUES below are in film time (computed from story times with filmTime).
 * Segment times from the V3 brief, the 19 narration cues of the supplied
 * kit (kit-suara/subtitles-bm.srt, timed to narration-bm.wav), the synthetic
 * Kg. Ketoyong scenario and the calculations copied from the e-ACD source.
 * Every figure is SYNTHETIC ("Data Simulasi"). The cue times below drive the
 * player's captions, sari-kata-bm-v3.srt and the MP4; V3 has no timing
 * override (the V2 recording-sync hook was removed).
 * ========================================================================== */

const FPS = 60;
const DURATION = 141.4;              // 02:21.400 (V9: 120 s story, longer opening/manual scene/benefit cards for the narration, WhatsApp +14 s)
const TOTAL_FRAMES = Math.round(FPS * DURATION); // 8484 frames: 0 .. 8483
/* V7 clock map: breakpoints [film, story], linear in between.
 *   film 6.5–16.35  ↔ story 6.5–13.35  the manual scene, played 1.438× slower (V7)
 *   film 87.95–101.95 ↔ story 84.95     the WhatsApp segment; the story is held (V6) */
/* V9 clock map (the narration gets the room it needs):
 *   film 0–7.5        ↔ story 0–6.5      the opening flow chart, 1.15× slower (one line per step)
 *   film 7.5–18.85    ↔ story 6.5–13.35  the manual scene, 1.66× slower (V7: 1.44×); title impact 18.85 s
 *   film 90.45–104.45 ↔ story 84.95      the WhatsApp segment (held story)
 *   film 124.7–133.75 ↔ story 105.2–112.35  the benefit cards, 1.27× slower (the benefits line is read in full)
 * V7/V8 map: [[0,0],[6.5,6.5],[16.35,13.35],[87.95,84.95],[101.95,84.95],[137,120]]. */
const TIMEMAP = [[0, 0], [7.5, 6.5], [18.85, 13.35], [90.45, 84.95], [104.45, 84.95], [124.7, 105.2], [133.75, 112.35], [141.4, 120]];
const INSERT = { at: 84.95, len: 14, atF: 90.45 };   // story time, length, film start of the WhatsApp segment
function storyTime(tf) {
  for (let i = 1; i < TIMEMAP.length; i++) {
    const [f0, s0] = TIMEMAP[i - 1], [f1, s1] = TIMEMAP[i];
    if (tf < f1 || i === TIMEMAP.length - 1) return s0 + (s1 - s0) * Math.min(1, Math.max(0, (tf - f0) / (f1 - f0)));
  }
}
function filmTime(ts) {
  // inverse of storyTime; a story time at the hold (84.95) maps to the end of the WhatsApp segment
  for (let i = 1; i < TIMEMAP.length; i++) {
    const [f0, s0] = TIMEMAP[i - 1], [f1, s1] = TIMEMAP[i];
    if (s1 === s0) continue;
    if (ts < s1 || i === TIMEMAP.length - 1) return f0 + (f1 - f0) * (ts - s0) / (s1 - s0);
  }
}
const ft2 = ts => Math.round(filmTime(ts) * 100) / 100;

/* V3 edit anchors (seconds) from the V3 brief; the player's scene markers. */
const SCENES = [   // film time (V7)
  { id: 1, start: 0,                  end: ft2(13.2),          key: 'Pembukaan', title: 'Aliran wabak (glob peta) dan proses manual' },
  { id: 2, start: ft2(13.2),          end: ft2(24.3),          key: 'NADI',      title: 'Tajuk NADI dan kad lokaliti Kg. Ketoyong' },
  { id: 3, start: ft2(24.3),          end: ft2(49),            key: 'Rekod',     title: 'Satu telefon, satu rekod premis' },
  { id: 4, start: ft2(49),            end: ft2(62),            key: 'Simpan',    title: 'Rekod disimpan dan diselaraskan ke Sheets' },
  { id: 5, start: ft2(62),            end: ft2(78),            key: 'Liputan',   title: 'Telefon dan monitor: 92/110, 84%' },
  { id: 6, start: ft2(78),            end: INSERT.atF,         key: 'Sahkan',    title: 'Pengesahan Bahagian D' },
  { id: 7, start: INSERT.atF,         end: INSERT.atF + INSERT.len, key: 'Kongsi', title: 'Salin dan tampal ringkasan ACD ke WhatsApp (simulasi)' },
  { id: 8, start: INSERT.atF + INSERT.len, end: ft2(105),     key: 'Susulan',   title: 'NADI: 6 premis belum dilawati, lawatan susulan' },
  { id: 9, start: ft2(105),           end: ft2(112.35),        key: 'Manfaat',   title: 'Kad manfaat' },
  { id: 10, start: ft2(112.35),       end: DURATION,           key: 'Penutup',   title: 'Penutup' }
];

/* e-ACD locality metadata (source app state.meta). */
const META = { locality: 'Kg. Ketoyong', date: '04/11/2026 (Rabu)', time: '5.00 petang', meetingPoint: 'Surau Kg. Ketoyong (Peta)', requiredStaff: 16 };

/* Synthetic team totals (same set as the 90-second film). The followed visit is part of Pasukan 1. */
const TEAMS = {
  1: { locality: 20, visited: 17, locked: 2, pop: 61, symp: 1, ref: 1, sample: 0, breeding: 3, abate: 3, pamphlet: 17 },
  2: { locality: 18, visited: 15, locked: 2, pop: 55, symp: 0, ref: 0, sample: 0, breeding: 2, abate: 2, pamphlet: 15 },
  3: { locality: 19, visited: 16, locked: 2, pop: 58, symp: 1, ref: 1, sample: 0, breeding: 3, abate: 2, pamphlet: 16 },
  4: { locality: 17, visited: 14, locked: 2, pop: 50, symp: 0, ref: 0, sample: 0, breeding: 1, abate: 1, pamphlet: 14 },
  5: { locality: 18, visited: 15, locked: 2, pop: 56, symp: 1, ref: 1, sample: 0, breeding: 3, abate: 3, pamphlet: 15 },
  6: { locality: 18, visited: 15, locked: 2, pop: 57, symp: 0, ref: 0, sample: 0, breeding: 2, abate: 2, pamphlet: 15 }
};
const TEAM1_BEFORE = { locality: 19, visited: 16, locked: 2, pop: 56, symp: 0, ref: 0, sample: 0, breeding: 2, abate: 2, pamphlet: 16 };
const HOUSE_DEMO = {
  team: 1, address: 'Premis Contoh 012', status: '1', occupants: 5,
  symptoms: ['Demam panas mengejut', 'Sakit kepala teruk', 'Sakit sendi/tulang/otot'],
  symptomCount: 1, referredCount: 1, sampleCount: 0, breeding: true, abate: true, pamphlet: true, fieldAction: 'Rujuk Klinik Kesihatan'
};
const SYMPTOMS = ['Demam panas mengejut', 'Sakit kepala teruk', 'Sakit di belakang mata', 'Sakit sendi/tulang/otot',
  'Ruam bintik merah', 'Loya/muntah', 'Pendarahan gusi/hidung', 'Sakit perut teruk'];
const STATUS_CODES = [
  { code: '1', label: '1 - Dilawati' }, { code: '2', label: '2 - Berkunci' }, { code: '3', label: '3 - Kosong' },
  { code: '4', label: '4 - Enggan' }, { code: '6', label: '6 - Tanah/Lot Kosong' }
];
const VERIFICATION = { officerName: 'Pegawai Contoh', officerRole: 'Penolong Pegawai Kesihatan Persekitaran (PPKP)', date: '04/11/2026' };

/* ---- NADI locality card (OutbreakMap.tsx floating card), synthetic values only.
 * Kg. Ketoyong does not appear in the NADI repository's data. */
const NADI_CARD = {
  statusLabel: 'Wabak Aktif (WT)', name: 'Kg. Ketoyong', area: 'Daerah Muallim · paparan demonstrasi',
  outbreakCases: 3, cumulativeCases: 4, lastNotification: '02-11-2026', epidWeek: 44, expectedEnd: '16-11-2026', daysSince: 2,
  premisesInspected: 64, ptpP1: '03-11-2026', ptpP2: 'Tiada maklumat', srtP1: '03-11-2026', srtP2: 'Tiada maklumat'
};
/* Simulated target premises still to visit (follow-up list). */
const BENEFITS = [
  { icon: 'phoneIcon', title: 'Rekod ACD pada telefon', text: 'Satu rekod lawatan premis terus ke Lampiran 1' },
  { icon: 'sigma', title: 'Kiraan liputan automatik', text: 'Jumlah enam pasukan dan peratus liputan' },
  { icon: 'shield', title: 'Pengesahan dan ringkasan', text: 'Bahagian D dan ringkasan sedia dikongsi' },
  { icon: 'calendar', title: 'Perancangan lawatan susulan', text: 'Premis belum dilawati dipaparkan di NADI', proto: true }
];
/* V9: the benefit cards come into focus one by one on the narration. Onsets (film s) of "Rekod di telefon",
 * "kiraan liputan automatik", "pengesahan dan ringkasan" and "Sistem membantu merancang…" in narasi-v9.wav, read from
 * 20 ms band energies: "Rekod" voiced at 124.95; the "k" of "kiraan" at 126.51 after the comma pause; "pengesahan"
 * voiced at 128.34; the "S" of "Sistem" at 130.57 — the voice takes a breath first (130.18–130.46). */
const BENEFIT_BEATS = [124.95, 126.51, 128.33, 130.57];
/* V9: no captions in the film (the user's request); the cue timings stay for the audio balance and the SRT file */
const CAPTIONS_IN_FILM = false;
const FOLLOW_UP = ['Premis Contoh 018', 'Premis Contoh 033', 'Premis Contoh 061', 'Premis Contoh 074', 'Premis Contoh 096', 'Premis Contoh 105'];

/* ---- calculations copied from the e-ACD source (computeTotals / calcTeamPct) */
function calcTeamPct(teamObj) {
  if (!teamObj || !teamObj.locality || teamObj.locality <= 0) return null;
  return Math.round((teamObj.visited / teamObj.locality) * 100);
}
function computeTotals(teams) {
  const totals = { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0, activeTeams: 0 };
  for (let t = 1; t <= 6; t++) {
    const d = teams[t];
    for (const k of ['locality', 'visited', 'locked', 'pop', 'symp', 'ref', 'sample', 'breeding', 'abate', 'pamphlet']) totals[k] += Number(d[k]) || 0;
    if ((Number(d.locality) || 0) > 0 || (Number(d.visited) || 0) > 0) totals.activeTeams++;
  }
  totals.pct = totals.locality > 0 ? Math.round((totals.visited / totals.locality) * 100) : 0;
  totals.unvisited = Math.max(0, totals.locality - totals.visited - totals.locked);
  return totals;
}
const TOTALS = computeTotals(TEAMS);
const TARGET_PCT = 80; // V5: the KKM coverage target (≥ 80%), as confirmed by PKD; the e-ACD badge uses the same threshold

function buildWhatsappSummary(meta, totals) {
  return [
    '*LAPORAN RINGKASAN ACD DENGGI - PKD MUALLIM*',
    '📍 Lokaliti: ' + meta.locality,
    '📅 Tarikh/Masa: ' + meta.date + ' (' + meta.time + ')',
    '',
    '*RINGKASAN DAPATAN KESELURUHAN:*',
    '1. Jumlah Rumah/Premis dalam Lokaliti: ' + totals.locality + ' buah',
    '2. Jumlah Rumah/Premis Dilawati: ' + totals.visited + ' buah',
    '3. Jumlah Rumah/Premis Berkunci/Kosong: ' + totals.locked + ' buah',
    '4. Jumlah Penduduk Diperiksa (ACD): ' + totals.pop + ' orang',
    '5. Jumlah Kes Bergejala Dikesan: ' + totals.symp + ' orang',
    '6. Jumlah Rujukan Fasiliti Kesihatan: ' + totals.ref + ' orang',
    '7. Jumlah Sampel Diambil: ' + totals.sample + ' sampel',
    '📊 *Pencapaian ACD (%): ' + totals.pct + '%*',
    '',
    '*Pemeriksaan Persekitaran (Bahagian C):*',
    '• Takungan Berpotensi Aedes: ' + totals.breeding + ' premis',
    '• Tindakan Abate Diberi: ' + totals.abate + ' premis',
    '• Risalah Kesihatan Diedar: ' + totals.pamphlet + ' premis'
  ].join('\n');
}

/* ==========================================================================
 * NARRATION (V3) — the 19 cues of the supplied voice kit (subtitles-bm.srt),
 * spoken in narration-bm.wav. `say` is what the voice says (numbers in words),
 * `sub` is the caption (≤ 2 lines). Times are the SRT times, checked against
 * the WAV by tools/check-narration.js: every onset is within −0.05/+0.06 s of
 * its cue. One change: the SRT splits cue 5/6 at 24.03 s, but in the WAV
 * "…kes aktif | di Kampung Ketoyong" falls at 25.66–25.69 s (energy dip and
 * syllable count; 24.16 s is the end of "membuka"), so the split is moved there.
 * ========================================================================== */
/* V7: kit cues are written in STORY time (s) and WhatsApp captions relative to the segment start (u);
 * start/end below are the resulting FILM times, used by the captions, the SRT and the checks. */
const CUES = [
  // V9 · 00:00–00:08 the opening flow chart: one short line per step; the last one runs into the paper forms
  { id: 'a1', scene: 1, s: [0.15, 2.3],      say: 'Notifikasi denggi diterima.', sub: 'Notifikasi denggi diterima.' },
  { id: 'a2', scene: 1, s: [2.4, 3.8],       say: 'Kes bertambah.', sub: 'Kes bertambah.' },
  { id: 'a3', scene: 1, s: [3.9, 5.8],       say: 'Wabak diisytiharkan.', sub: 'Wabak diisytiharkan.' },
  { id: 'a4', scene: 1, s: [5.9, 6.6],       say: 'Pasukan turun untuk pengesanan kes aktif.', sub: 'Pasukan turun untuk\npengesanan kes aktif.' },
  { id: 'c02', scene: 1, s: [6.6, 9.2],      say: 'Dalam operasi denggi, borang kertas dan fail perlu dibawa ke lapangan.', sub: 'Dalam operasi denggi, borang kertas\ndan fail perlu dibawa ke lapangan.' },
  { id: 'c03', scene: 1, s: [9.39, 12.33],   say: 'Dapatan lawatan kemudian dikira dan ditaip semula.', sub: 'Dapatan lawatan kemudian dikira\ndan ditaip semula.' },
  // V9 · the title card has settled: a moment for the reveal music, then the name
  { id: 'n1', scene: 2, s: [14.5, 16.8],     say: 'Inilah Nadi Muallim.', sub: 'Inilah NADI Muallim.' },
  { id: 'c04', scene: 2, s: [16.94, 20.54],  say: 'Nadi Muallim memaparkan situasi denggi mengikut lokaliti.', sub: 'NADI Muallim memaparkan situasi\ndenggi mengikut lokaliti.' },
  { id: 'c05', scene: 2, s: [21.22, 25.66],  say: 'Dalam prototaip ini, penyelia membuka operasi pengesanan kes aktif', sub: 'Dalam prototaip ini, penyelia membuka\noperasi pengesanan kes aktif' },
  { id: 'c06', scene: 3, s: [25.69, 27.02],  say: 'di Kampung Ketoyong.', sub: 'di Kampung Ketoyong.' },
  // V9 · every officer records on their own phone (two officers of Pasukan 1, two premises on screen)
  { id: 'p1', scene: 3, s: [27.9, 32.7],     say: 'Setiap petugas boleh merekod dapatan pada telefon masing-masing.', sub: 'Setiap petugas boleh merekod dapatan\npada telefon masing-masing.' },
  { id: 'c07', scene: 3, s: [33.92, 38.95],  say: 'Bagi premis yang ditugaskan, petugas merekod status lawatan, gejala dan rujukan.', sub: 'Bagi premis yang ditugaskan, petugas merekod\nstatus lawatan, gejala dan rujukan.' },
  { id: 'c08', scene: 3, s: [40.73, 44.02],  say: 'Borang kertas tidak perlu dibawa untuk tugas ini.', sub: 'Borang kertas tidak perlu dibawa\nuntuk tugas ini.' },
  // V9: on the Save tap, then when the table fills (where the time saving comes from)
  { id: 'c09', scene: 4, s: [49.32, 53.63],  say: 'Selepas rekod disimpan, sistem mengira dapatan pasukan secara automatik.', sub: 'Selepas rekod disimpan, sistem mengira\ndapatan pasukan secara automatik.' },
  { id: 'c10', scene: 4, s: [57.35, 61.2],   say: 'Ringkasan dijana terus daripada rekod yang sama.', sub: 'Ringkasan dijana terus daripada\nrekod yang sama.' },
  { id: 'c11', scene: 5, s: [64.93, 70.69],  say: 'Dalam simulasi ini, enam pasukan melawati sembilan puluh dua daripada seratus sepuluh premis.', sub: 'Dalam simulasi ini, enam pasukan\nmelawati 92 daripada 110 premis.' },
  { id: 'c12', scene: 5, s: [72.38, 74.86],  say: 'Liputannya lapan puluh empat peratus.', sub: 'Liputannya 84 peratus.' },
  { id: 'c13', scene: 6, s: [78.92, 81.25],  say: 'Pegawai merekodkan pengesahan dapatan.', sub: 'Pegawai merekodkan pengesahan dapatan.' },
  // V6: the WhatsApp segment (captions only, no narration); u = seconds from the segment start
  { id: 'w1', scene: 7, u: [0.6, 3.2],       say: 'Ringkasan laporan disalin dengan satu ketikan.', sub: 'Ringkasan laporan disalin\ndengan satu ketikan.' },
  { id: 'w2', scene: 7, u: [4.05, 6.95],     say: 'Ringkasan ditampal ke kumpulan WhatsApp pasukan.', sub: 'Ringkasan ditampal ke kumpulan\nWhatsApp pasukan.' },
  { id: 'w3', scene: 7, u: [8.05, 11.65],    say: 'Angka dalam mesej datang terus daripada rekod yang disimpan.', sub: 'Angka dalam mesej datang terus\ndaripada rekod yang disimpan.' },
  // V8 (1:44): reworded at the user's request; spoken as one sentence, numbers in words for the voice, digits on screen
  { id: 'c14', scene: 8, s: [86.9, 88.9],    say: 'Daripada analisa automatik sistem, enam premis belum dilawati,', sub: 'Daripada analisa automatik sistem,\n6 premis belum dilawati,' },
  { id: 'c15', scene: 8, s: [90.42, 93.28],  say: 'dua belas direkodkan berkunci atau kosong.', sub: '12 direkodkan berkunci\natau kosong.' },
  { id: 'c16', scene: 8, s: [95.0, 97.7],    say: 'Penyelia menjadualkan lawatan ke enam premis itu', sub: 'Penyelia menjadualkan lawatan\nke enam premis itu' },
  { id: 'c17', scene: 8, s: [97.9, 100.6],   say: 'dan menyemak status premis yang selebihnya.', sub: 'dan menyemak status premis\nyang selebihnya.' },
  // V9 · 02:02 the benefit cards
  { id: 'b1', scene: 9, s: [105.0, 110.0],   say: 'Rekod di telefon, kiraan liputan automatik, pengesahan dan ringkasan.', sub: 'Rekod di telefon, kiraan liputan automatik,\npengesahan dan ringkasan.' },
  { id: 'b2', scene: 9, s: [110.05, 112.3],  say: 'Sistem membantu merancang lawatan susulan.', sub: 'Sistem membantu merancang\nlawatan susulan.' },
  { id: 'c18', scene: 10, s: [112.90, 114.02], say: 'Nadi Muallim.', sub: 'NADI Muallim.' },
  { id: 'c19', scene: 10, s: [114.68, 118.16], say: 'Dari survelan denggi kepada tindakan susulan di lapangan.', sub: 'Dari survelan denggi kepada\ntindakan susulan di lapangan.' }
].map(c => Object.assign(c, c.s ? { start: ft2(c.s[0]), end: ft2(c.s[1]) } : { start: +(INSERT.atF + c.u[0]).toFixed(2), end: +(INSERT.atF + c.u[1]).toFixed(2) }));
/* V8: every caption (kit cues and the three WhatsApp captions) is spoken by the ElevenLabs voice "Ahmad"
 * (narasi-v8/narasi-v8.wav, FILM clock). tools/place-narration-v8.py placed each line at its V7 caption
 * start, later only where the previous line was still speaking (c03 +1.29 s, c05 +0.31 s, w2 +0.18 s),
 * and wrote these caption times: 0.10 s before the voice, 0.40 s after it, never past the segment end.
 * 1:44 rewording: c14 + c15 are one new sentence ("Daripada analisa automatik sistem, …"), 8.2 s long; it starts
 * 0.45 s before its V7 beat (103.45 s) so that "Penyelia menjadualkan…" keeps its 112.00 s beat and the click.
 * The V7 film-clock times stay in V7_CUE_TIMES for the audit trail. */
const V7_CUE_TIMES = Object.fromEntries(CUES.map(c => [c.id, [c.start, c.end]]));
const NARR_CAPTIONS = {a1: [0.20, 2.48], a2: [2.52, 3.97], a3: [4.01, 5.94], a4: [5.98, 8.91], c02: [8.95, 14.22], c03: [14.26, 18.57], n1: [20.20, 22.54], c04: [22.58, 27.13], c05: [27.17, 32.09], c06: [32.11, 33.49], p1: [33.53, 38.36], c07: [39.40, 46.09], c08: [46.13, 49.77], c09: [54.82, 60.54], c10: [62.85, 66.72], c11: [70.33, 77.71], c12: [77.78, 80.98], c13: [84.32, 87.48], w1: [90.95, 94.54], w2: [94.58, 98.21], w3: [98.40, 103.13], c14: [105.85, 110.92], c15: [110.94, 114.36], c16: [114.40, 117.83], c17: [117.85, 120.84], b1: [124.85, 130.15], b2: [130.17, 133.69], c18: [134.20, 135.78], c19: [135.80, 139.89]};
for (const c of CUES) [c.start, c.end] = NARR_CAPTIONS[c.id];
const NARR_CLOCK = 'film';   // V8: the narration WAV runs on the film clock (V3: story clock)
/* cue times exactly as supplied in kit-suara/subtitles-bm.srt (for the audit trail) */
const SRT_SUPPLIED = { c05: [21.22, 24.03], c06: [24.03, 27.02] };
const PLANNED = CUES.map(c => ({ id: c.id, start: c.start, end: c.end }));

/* V4: the paper Borang ACD and Lampiran 1 in the manual scene (layout of the PKD Muallim forms,
 * kit PDFs), filled by hand with FICTIONAL entries. Staff appear as roles; the household-head and
 * symptomatic-case name/phone columns are illegible scribbles, so no personal data is shown. */
const PAPER_FORM = { tarikh: '04/11/2026', masa: '9.00 pagi', lokaliti: 'Kg. Ketoyong', petugas: ['Petugas 1', 'Petugas 2', 'Petugas 3'] };
const PAPER_ROWS = [
  { alamat: 'Premis Contoh 001', status: '1', penghuni: '4', nama: 1, kes: 0, tindakan: 'Pend. Kesihatan' },
  { alamat: 'Premis Contoh 002', status: '1', penghuni: '5', nama: 1, kes: 1, tindakan: 'Rujuk Klinik' },
  { alamat: 'Premis Contoh 003', status: '2', penghuni: '-', nama: 0, kes: 0, tindakan: 'Notis' },
  { alamat: 'Premis Contoh 004', status: '1', penghuni: '3', nama: 1, kes: 0, tindakan: 'Pend. Kesihatan' },
  { alamat: 'Premis Contoh 005', status: '3', penghuni: '-', nama: 0, kes: 0, tindakan: 'Notis' },
  { alamat: 'Premis Contoh 006', status: '1', penghuni: '6', nama: 1, kes: 0, tindakan: 'Pend. Kesihatan' },
  { alamat: 'Premis Contoh 007', status: '1', penghuni: '2', nama: 1, kes: 0, tindakan: 'Pend. Kesihatan' }
];

/* V3: cue times come from the supplied SRT (checked against the WAV), not from a sync tool. */
/* V5 (music only): the kit captions stay as on-screen text. c01 (the supervisor's question) now heads the
 * follow-up flow instead of opening the film; c02, c14, c16 and c17 are retimed to the new visual beats. */
const NARRATION_SOURCE = 'kit-suara/subtitles-bm.srt (V5 on-screen text, retimed)';
/* V5 · 00:00–00:06.5 the opening flow chart */
const FLOW_STEPS = [
  { icon: 'bell', tone: 'teal', title: 'Notifikasi diterima', sub: 'Kes denggi dinotifikasi kepada PKD' },
  { icon: 'trend', tone: 'amber', title: 'Peningkatan kes', sub: 'Kes bertambah di Kg. Ketoyong' },
  { icon: 'alert', tone: 'rose', title: 'Isytihar wabak', sub: 'Lokaliti diisytihar wabak aktif' },
  { icon: 'house', tone: 'go', title: 'Pengesanan Kes Aktif (ACD)', sub: 'Lawatan rumah ke rumah di lokaliti wabak' }
];

/* Narration per scene (one take per scene). */
const NARRATION = SCENES.filter(s => CUES.some(c => c.scene === s.id)).map(s => {
  const cs = CUES.filter(c => c.scene === s.id);
  return { id: 'N' + s.id, scene: s.id, cues: cs.map(c => c.id), start: cs[0].start, end: cs[cs.length - 1].end, say: cs.map(c => c.say).join(' ') };
});

if (typeof module !== 'undefined') {
  module.exports = { FPS, DURATION, TOTAL_FRAMES, TIMEMAP, INSERT, filmTime, storyTime, SCENES, SRT_SUPPLIED, BENEFITS, BENEFIT_BEATS, CAPTIONS_IN_FILM, PAPER_FORM, PAPER_ROWS, FLOW_STEPS, META, TEAMS, TEAM1_BEFORE, TOTALS, TARGET_PCT, HOUSE_DEMO, SYMPTOMS, STATUS_CODES,
    VERIFICATION, NADI_CARD, FOLLOW_UP, CUES, PLANNED, NARRATION, V7_CUE_TIMES, NARR_CAPTIONS, NARR_CLOCK, calcTeamPct, computeTotals, buildWhatsappSummary,
    get NARRATION_SOURCE() { return NARRATION_SOURCE; } };
}
