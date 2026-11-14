/* ==========================================================================
 * data.js — single source of truth for the film.
 * Every number, label and time cue the player, the subtitles, the audio
 * engine and render-video.js use comes from this file.
 * All records are FICTIONAL demo data ("Data Simulasi").
 * ========================================================================== */

const FPS = 60;
const DURATION = 90;               // seconds (90.000 s)
const TOTAL_FRAMES = FPS * DURATION; // 5400 frames: 0 .. 5399

/* Scene boundaries from the storyboard (seconds). */
const SCENES = [
  { id: 1, start: 0,  end: 15, key: 'Cabaran',    title: 'Cabaran operasi lapangan' },
  { id: 2, start: 15, end: 30, key: 'Pengenalan', title: 'Pengenalan sistem' },
  { id: 3, start: 30, end: 50, key: 'Rekod Rumah', title: 'Rekod lawatan rumah ke rumah' },
  { id: 4, start: 50, end: 70, key: 'Liputan',    title: 'Kiraan automatik dan liputan ACD' },
  { id: 5, start: 70, end: 82, key: 'Laporan',    title: 'Penyelarasan, pengesahan dan laporan' },
  { id: 6, start: 82, end: 90, key: 'Penutup',    title: 'Impak dan penutup' }
];

/* Locality metadata as configured in the source app (state.meta). */
const META = {
  locality: 'Kg. Ketoyong',
  date: '04/11/2026 (Rabu)',
  time: '5.00 petang',
  meetingPoint: 'Surau Kg. Ketoyong (Peta)', // label only — the live map link is stripped
  requiredStaff: 16
};

/* Simulated team totals (storyboard table). The Scene 3 visit is included in Pasukan 1.
 * sample / breeding / abate / pamphlet are illustrative values for Bahagian C and the
 * WhatsApp summary (the storyboard does not fix them): sample = 0 matches the Scene 3
 * entry (the app's "Ada Kes" toggle sets 1 symptomatic + 1 referral, 0 samples). */
const TEAMS = {
  1: { locality: 20, visited: 17, locked: 2, pop: 61, symp: 1, ref: 1, sample: 0, breeding: 3, abate: 3, pamphlet: 17 },
  2: { locality: 18, visited: 15, locked: 2, pop: 55, symp: 0, ref: 0, sample: 0, breeding: 2, abate: 2, pamphlet: 15 },
  3: { locality: 19, visited: 16, locked: 2, pop: 58, symp: 1, ref: 1, sample: 0, breeding: 3, abate: 2, pamphlet: 16 },
  4: { locality: 17, visited: 14, locked: 2, pop: 50, symp: 0, ref: 0, sample: 0, breeding: 1, abate: 1, pamphlet: 14 },
  5: { locality: 18, visited: 15, locked: 2, pop: 56, symp: 1, ref: 1, sample: 0, breeding: 3, abate: 3, pamphlet: 15 },
  6: { locality: 18, visited: 15, locked: 2, pop: 57, symp: 0, ref: 0, sample: 0, breeding: 2, abate: 2, pamphlet: 15 }
};

/* The Scene 3 house record (Lampiran 1). Contact fields are left blank on purpose. */
const HOUSE_DEMO = {
  team: 1, address: 'Premis Contoh 012', status: '1', occupants: 5,
  headName: '', headPhone: '', hasSymptom: true,
  symptoms: ['Demam panas mengejut', 'Sakit kepala teruk', 'Sakit sendi/tulang/otot'],
  symptomCount: 1, referredCount: 1, sampleCount: 0, patientNote: '',
  breeding: true, abate: true, pamphlet: true, fieldAction: 'Rujuk Klinik Kesihatan'
};

/* Pasukan 1 before the Scene 3 record is saved (the source adds +1 locality, +1 visited,
 * +occupants, +symptomCount, +referredCount and Bahagian C flags on submit). */
const TEAM1_BEFORE = { locality: 19, visited: 16, locked: 2, pop: 56, symp: 0, ref: 0, sample: 0, breeding: 2, abate: 2, pamphlet: 16 };

/* One fictional referral record each for Pasukan 1, 3 and 5. */
const REFERRALS = [
  { team: 1, address: 'Premis Contoh 012', symptoms: ['Demam panas mengejut', 'Sakit kepala teruk', 'Sakit sendi/tulang/otot'] },
  { team: 3, address: 'Premis Contoh 047', symptoms: ['Demam panas mengejut', 'Ruam bintik merah'] },
  { team: 5, address: 'Premis Contoh 083', symptoms: ['Demam panas mengejut', 'Sakit di belakang mata'] }
];

/* The eight symptom options, verbatim from the source form. */
const SYMPTOMS = [
  'Demam panas mengejut', 'Sakit kepala teruk', 'Sakit di belakang mata', 'Sakit sendi/tulang/otot',
  'Ruam bintik merah', 'Loya/muntah', 'Pendarahan gusi/hidung', 'Sakit perut teruk'
];

/* The five Lampiran 1 status codes, verbatim from the source form. */
const STATUS_CODES = [
  { code: '1', label: '1 - Dilawati' },
  { code: '2', label: '2 - Berkunci' },
  { code: '3', label: '3 - Kosong' },
  { code: '4', label: '4 - Enggan' },
  { code: '6', label: '6 - Tanah/Lot Kosong' }
];

/* Anonymized roster: roles, units and team assignment mirror the source's INITIAL_STAFF
 * structure; names are replaced with numbered placeholders. No contact data. */
const STAFF = [
  { id: 1,  name: 'PETUGAS 01', role: 'PPP', unit: 'KKTM', team: 1 },
  { id: 2,  name: 'PETUGAS 02', role: 'PPP', unit: 'KKTM', team: 2 },
  { id: 3,  name: 'PETUGAS 03', role: 'PPP', unit: 'KKTM', team: 3 },
  { id: 4,  name: 'PETUGAS 04', role: 'PPK', unit: 'KKTM', team: 1 },
  { id: 5,  name: 'PETUGAS 05', role: 'PPK', unit: 'KKTM', team: 2 },
  { id: 6,  name: 'PETUGAS 06', role: 'PPK', unit: 'KKTM', team: 4 },
  { id: 7,  name: 'PETUGAS 07', role: 'PPK', unit: 'KKTM', team: 5 },
  { id: 8,  name: 'PETUGAS 08', role: 'JURURAWAT KESIHATAN U6 TBK', unit: 'KKTM', team: 1 },
  { id: 9,  name: 'PETUGAS 09', role: 'JURURAWAT U5', unit: 'KKTM', team: 2 },
  { id: 10, name: 'PETUGAS 10', role: 'JURURAWAT U5', unit: 'KKTM', team: 3 },
  { id: 11, name: 'PETUGAS 11', role: 'JURURAWAT U5', unit: 'KKTM', team: 4 },
  { id: 12, name: 'PETUGAS 12', role: 'JURURAWAT U6 TBK', unit: 'KKTM', team: 5 },
  { id: 13, name: 'PETUGAS 13', role: 'JURURAWAT U6 TBK', unit: 'KKTM', team: 6 },
  { id: 14, name: 'PETUGAS 14', role: 'JURURAWAT MASYARAKAT U2 TBK', unit: 'KD KETOYONG', team: 6 },
  { id: 15, name: 'PETUGAS 15', role: 'JURURAWAT MASYARAKAT U2 TBK', unit: 'KKTM', team: 3 }
];

/* Bahagian D confirmation shown in Scene 5 (fictional officer). */
const VERIFICATION = {
  officerName: 'Pegawai Contoh',
  officerRole: 'Penolong Pegawai Kesihatan Persekitaran (PPKP)',
  date: '04/11/2026'
};

/* ---- Calculations copied from the source app (computeTotals / calcTeamPct) ---- */
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
  totals.unvisited = Math.max(0, totals.locality - totals.visited - totals.locked); // doughnut "Belum Dilawati"
  return totals;
}
const TOTALS = computeTotals(TEAMS);
const TEAMS_BEFORE = Object.assign({}, TEAMS, { 1: TEAM1_BEFORE });
const TOTALS_BEFORE = computeTotals(TEAMS_BEFORE);
const TARGET_PCT = 80; // target configured in the app (badge threshold: totals.pct >= 80)

/* WhatsApp summary text, built exactly like the source's btnCopyWhatsapp handler. */
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

/* CSV file name, built like the source's btnExportCSV handler. */
const CSV_FILENAME = 'Hasil_ACD_' + META.locality.replace(/\s+/g, '_') + '.csv';

/* ==========================================================================
 * NARRATION + SUBTITLE CUES (seconds). One table drives subtitles, the
 * optional Web Speech preview, voiceover-script-bm.md and the audio ducking
 * windows. `say` is what the narrator reads; `sub` is the on-screen caption
 * (max two lines, "\n" = line break). Numbers are written out in `say`.
 * ========================================================================== */
const CUES = [
  // Scene 1 — Cabaran operasi lapangan
  { id: 'S1a', scene: 1, start: 0.80,  end: 2.90,  say: 'Apabila wabak denggi berlaku,', sub: 'Apabila wabak denggi berlaku,' },
  { id: 'S1b', scene: 1, start: 2.95,  end: 6.60,  say: 'petugas perlu menyaring penduduk dari rumah ke rumah.', sub: 'petugas perlu menyaring penduduk\ndari rumah ke rumah.' },
  { id: 'S1c', scene: 1, start: 7.20,  end: 10.50, say: 'Borang kertas dan kiraan manual menambah langkah', sub: 'Borang kertas dan kiraan manual\nmenambah langkah' },
  { id: 'S1d', scene: 1, start: 10.55, end: 13.20, say: 'sebelum dapatan boleh dirumuskan.', sub: 'sebelum dapatan boleh dirumuskan.' },
  // Scene 2 — Pengenalan sistem
  { id: 'S2a', scene: 2, start: 15.50, end: 18.10, say: 'Pejabat Kesihatan Daerah Muallim', sub: 'Pejabat Kesihatan Daerah Muallim' },
  { id: 'S2b', scene: 2, start: 18.15, end: 20.75, say: 'memperkenalkan Sistem e-ACD Kes Denggi', sub: 'memperkenalkan Sistem e-ACD Kes Denggi' },
  { id: 'S2c', scene: 2, start: 20.80, end: 22.70, say: 'untuk pengesanan kes aktif.', sub: 'untuk pengesanan kes aktif.' },
  { id: 'S2d', scene: 2, start: 23.30, end: 25.30, say: 'Petugas boleh membuka sistem', sub: 'Petugas boleh membuka sistem' },
  { id: 'S2e', scene: 2, start: 25.35, end: 28.20, say: 'melalui ikon di skrin utama telefon.', sub: 'melalui ikon di skrin utama telefon.' },
  // Scene 3 — Rekod lawatan rumah ke rumah
  { id: 'S3a', scene: 3, start: 30.50, end: 32.30, say: 'Petugas memilih pasukan,', sub: 'Petugas memilih pasukan,' },
  { id: 'S3b', scene: 3, start: 32.35, end: 34.10, say: 'merekod status lawatan', sub: 'merekod status lawatan' },
  { id: 'S3c', scene: 3, start: 34.15, end: 36.10, say: 'dan menyaring gejala denggi.', sub: 'dan menyaring gejala denggi.' },
  { id: 'S3d', scene: 3, start: 36.80, end: 40.40, say: 'Rekod yang sama merangkumi semakan takungan Aedes,', sub: 'Rekod yang sama merangkumi\nsemakan takungan Aedes,' },
  { id: 'S3e', scene: 3, start: 40.45, end: 42.90, say: 'tindakan Abate, edaran risalah', sub: 'tindakan Abate, edaran risalah' },
  { id: 'S3f', scene: 3, start: 42.95, end: 45.10, say: 'dan catatan rujukan ke klinik.', sub: 'dan catatan rujukan ke klinik.' },
  // Scene 4 — Kiraan automatik dan liputan ACD
  { id: 'S4a', scene: 4, start: 50.50, end: 54.70, say: 'Sistem menjumlahkan dapatan enam pasukan secara automatik.', sub: 'Sistem menjumlahkan dapatan\nenam pasukan secara automatik.' },
  { id: 'S4b', scene: 4, start: 55.30, end: 57.30, say: 'Dalam simulasi ini,', sub: 'Dalam simulasi ini,' },
  { id: 'S4c', scene: 4, start: 57.35, end: 61.70, say: 'sembilan puluh dua daripada seratus sepuluh premis dilawati.', sub: '92 daripada 110 premis dilawati.' },
  { id: 'S4d', scene: 4, start: 62.30, end: 64.90, say: 'Liputannya lapan puluh empat peratus,', sub: 'Liputannya 84 peratus,' },
  { id: 'S4e', scene: 4, start: 64.95, end: 67.40, say: 'melepasi sasaran yang dipaparkan.', sub: 'melepasi sasaran yang dipaparkan.' },
  // Scene 5 — Penyelarasan, pengesahan dan laporan
  { id: 'S5a', scene: 5, start: 70.25, end: 72.55, say: 'Dapatan diselaraskan ke Google Sheets', sub: 'Dapatan diselaraskan ke Google Sheets' },
  { id: 'S5b', scene: 5, start: 72.60, end: 74.70, say: 'apabila sambungan tersedia.', sub: 'apabila sambungan tersedia.' },
  { id: 'S5c', scene: 5, start: 74.90, end: 76.80, say: 'Pegawai merekod pengesahan,', sub: 'Pegawai merekod pengesahan,' },
  { id: 'S5d', scene: 5, start: 76.85, end: 79.40, say: 'kemudian menyalin ringkasan ke WhatsApp', sub: 'kemudian menyalin ringkasan\nke WhatsApp' },
  { id: 'S5e', scene: 5, start: 79.45, end: 81.60, say: 'atau memuat turun CSV.', sub: 'atau memuat turun CSV.' },
  // Scene 6 — Impak dan penutup
  { id: 'S6a', scene: 6, start: 82.20, end: 85.40, say: 'Daripada rekod rumah kepada laporan operasi.', sub: 'Daripada rekod rumah\nkepada laporan operasi.' },
  { id: 'S6b', scene: 6, start: 85.70, end: 87.40, say: 'Sistem e-ACD Kes Denggi,', sub: 'Sistem e-ACD Kes Denggi,' },
  { id: 'S6c', scene: 6, start: 87.45, end: 89.70, say: 'Pejabat Kesihatan Daerah Muallim.', sub: 'Pejabat Kesihatan Daerah Muallim.' }
];

/* Narration sentences for the voiceover script / Web Speech (grouped cues). */
const NARRATION = [
  { id: 'N1',  scene: 1, cues: ['S1a', 'S1b'] },
  { id: 'N2',  scene: 1, cues: ['S1c', 'S1d'] },
  { id: 'N3',  scene: 2, cues: ['S2a', 'S2b', 'S2c'] },
  { id: 'N4',  scene: 2, cues: ['S2d', 'S2e'] },
  { id: 'N5',  scene: 3, cues: ['S3a', 'S3b', 'S3c'] },
  { id: 'N6',  scene: 3, cues: ['S3d', 'S3e', 'S3f'] },
  { id: 'N7',  scene: 4, cues: ['S4a'] },
  { id: 'N8',  scene: 4, cues: ['S4b', 'S4c'] },
  { id: 'N9',  scene: 4, cues: ['S4d', 'S4e'] },
  { id: 'N10', scene: 5, cues: ['S5a', 'S5b'] },
  { id: 'N11', scene: 5, cues: ['S5c', 'S5d', 'S5e'] },
  { id: 'N12', scene: 6, cues: ['S6a'] },
  { id: 'N13', scene: 6, cues: ['S6b', 'S6c'] }
].map(n => {
  const cs = n.cues.map(id => CUES.find(c => c.id === id));
  return Object.assign(n, { start: cs[0].start, end: cs[cs.length - 1].end, say: cs.map(c => c.say).join(' ') });
});

/* Expose for Node (render-video.js / tools) and the browser. */
if (typeof module !== 'undefined') {
  module.exports = { FPS, DURATION, TOTAL_FRAMES, SCENES, META, TEAMS, TEAMS_BEFORE, TEAM1_BEFORE, TOTALS, TOTALS_BEFORE, TARGET_PCT,
    HOUSE_DEMO, REFERRALS, SYMPTOMS, STATUS_CODES, STAFF, VERIFICATION, CUES, NARRATION, CSV_FILENAME,
    calcTeamPct, computeTotals, buildWhatsappSummary };
}
