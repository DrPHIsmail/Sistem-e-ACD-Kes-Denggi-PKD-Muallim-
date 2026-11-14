/* ==========================================================================
 * markup.js — builds every actor of the film as static DOM (HTML strings).
 * App mockups reuse the Tailwind classes of the source app so the visual
 * hierarchy matches; English UI fragments are translated to Bahasa Malaysia.
 * No live URLs, spreadsheet IDs or real names appear anywhere.
 * ========================================================================== */

const ICON = {
  pin: '<svg class="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  ext: '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
  sync: '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>',
  phone: '<svg class="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>',
  plus: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
  navDash: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>',
  navHome: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
  navTeam: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>',
  navStaff: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1"/></svg>',
  addSquare: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 016.5 3H20v15H6.5A2.5 2.5 0 004 20.5z"/><path d="M4 20.5A2.5 2.5 0 016.5 18H20v3H6.5"/></svg>',
  tabs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="7" width="13" height="13" rx="2.5"/><path d="M8 4h9.5A2.5 2.5 0 0120 6.5V16"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17M3.5 15h17M9.5 9.5v11"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.99.99 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2A5 5 0 0121.5 19"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2"/></svg>',
  sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M15.5 8h-7l4 4-4 4h7"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></svg>',
  shareOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.9l7.6-4.2M8.2 13.1l7.6 4.2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/></svg>',
  device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8.5 11V7.8a3.5 3.5 0 017 0V11"/></svg>'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = name => ' data-ref="' + name + '"';
const JATA_SRC = '__JATA__'; // replaced by the build with the embedded Jata Negara PNG (from the source HTML)

/* Fictional-data annotation; styled as a film overlay, not as app UI. */
function simBadge(extra) {
  return '<div class="sim-badge ' + (extra || '') + '"><span class="sim-dot"></span>DATA SIMULASI</div>';
}

/* ---------------------------------------------------------------- app header */
function appHeader(p, mobile) {
  const btnRow = mobile
    ? '<div class="flex items-center gap-1 shrink-0">' +
        '<span class="w-8 h-8 rounded-lg bg-emerald-600/90 border border-emerald-400/40 text-white flex items-center justify-center shadow-sm"' + R(p + 'btnSync') + '>' + ICON.sync + '</span>' +
        '<span class="w-8 h-8 rounded-lg bg-white/15 border border-white/25 text-white flex items-center justify-center">' + ICON.phone + '</span>' +
      '</div>'
    : '<div class="flex items-center gap-1.5 shrink-0">' +
        '<span class="text-xs font-semibold bg-emerald-600/90 text-white px-2.5 py-1.5 rounded-lg border border-emerald-400/40 flex items-center gap-1 shadow-sm"' + R(p + 'btnSync') + '>' + ICON.sync + '<span>Selaraskan Sheet</span></span>' +
        '<span class="text-xs font-semibold bg-white/15 text-white px-2.5 py-1.5 rounded-lg border border-white/25 flex items-center gap-1">' + ICON.phone + '<span>Tambah ke Skrin Utama</span></span>' +
        '<span class="text-xs font-semibold bg-rose-500/80 text-white px-2.5 py-1.5 rounded-lg border border-rose-400/30">Set 0</span>' +
      '</div>';
  return '' +
  '<header class="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 text-white shadow-md relative z-30">' +
    '<div class="' + (mobile ? 'px-3 py-2' : 'max-w-5xl mx-auto px-4 py-3') + ' flex items-center justify-between gap-2">' +
      '<div class="flex items-center ' + (mobile ? 'gap-2.5' : 'gap-3') + ' min-w-0">' +
        '<img src="' + JATA_SRC + '" alt="Jata Negara" class="w-10 h-10 object-contain bg-white/95 rounded-lg p-1 shrink-0 shadow-sm" />' +
        '<div class="min-w-0">' +
          '<div class="flex items-center whitespace-nowrap ' + (mobile ? 'gap-1.5' : 'gap-2') + '">' +
            '<span class="' + (mobile ? 'text-[10px]' : 'text-[11px]') + ' font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">PKD Muallim</span>' +
            '<span class="' + (mobile ? 'text-[10px]' : 'text-[11px]') + ' font-semibold bg-teal-700/80 text-teal-100 px-2 py-0.5 rounded-full border border-teal-500/40 flex items-center gap-1">' +
              '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"' + R(p + 'syncDot') + '></span><span' + R(p + 'syncText') + '>Sistem Aktif</span></span>' +
          '</div>' +
          '<h1 class="' + (mobile ? 'text-[14.5px]' : 'text-lg') + ' font-extrabold tracking-tight truncate mt-0.5">Sistem e-ACD Kes Denggi</h1>' +
        '</div>' +
      '</div>' + btnRow +
    '</div>' +
    '<div class="bg-teal-950/60 border-t border-teal-700/50 ' + (mobile ? 'text-[11px]' : 'text-xs') + ' text-teal-100 relative">' +
      '<div class="' + (mobile ? 'px-3 py-1.5' : 'max-w-5xl mx-auto px-4 py-2') + ' flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex flex-wrap items-center ' + (mobile ? 'gap-x-3' : 'gap-x-4') + ' gap-y-0.5"' + R(p + 'locBar') + '>' +
          '<span class="font-semibold text-white flex items-center gap-1">' + ICON.pin + '<span>' + esc(META.locality) + '</span></span>' +
          '<span class="text-teal-200">' + esc(META.date) + ' • ' + esc(META.time) + '</span>' +
          '<span class="underline text-amber-300 font-medium flex items-center gap-1"' + R(p + 'meetPt') + '><span>' + esc(META.meetingPoint) + '</span>' + ICON.ext + '</span>' +
        '</div>' +
        (mobile ? simBadge('ph-sim') : '<div class="flex items-center gap-3"><span class="text-[11px] text-amber-300 underline font-medium">Tetapan Sheet</span><span class="text-[11px] text-teal-200 underline">Ubah Info Lokaliti</span></div>') +
      '</div>' +
    '</div>' +
  '</header>';
}

/* --------------------------------------------------------- dashboard pieces */
function heroCard(p) {
  return '' +
  '<div class="bg-gradient-to-br from-teal-800 to-emerald-900 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative"' + R(p + 'hero') + '>' +
    '<div>' +
      '<div class="flex items-center justify-between gap-2">' +
        '<span class="text-xs font-bold uppercase tracking-wider text-teal-200">Pencapaian Liputan ACD</span>' +
        '<span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-700 text-teal-100 whitespace-nowrap"' + R(p + 'kpiBadge') + '>Sasaran ≥ 80%</span>' +
      '</div>' +
      '<div class="mt-3 flex items-baseline gap-3">' +
        '<span class="text-5xl font-extrabold tracking-tight tnum"' + R(p + 'kpiPct') + '>0%</span>' +
        '<span class="text-sm text-teal-200 font-medium tnum"' + R(p + 'kpiRatio') + '>(0 / 0 premis)</span>' +
      '</div>' +
      '<div class="relative mt-3">' +
        '<div class="w-full bg-teal-950/70 h-3 rounded-full overflow-hidden border border-teal-700/50">' +
          '<div class="bg-amber-400 h-full rounded-full" style="width:0%"' + R(p + 'kpiBar') + '></div>' +
        '</div>' +
        '<div class="target-mark" style="left:80%"' + R(p + 'targetMark') + '><span>Sasaran 80%</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="mt-4 pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-100 gap-2">' +
      '<span>Formula: <code class="text-amber-300 font-mono">ROUND(Dilawati / Lokaliti × 100)</code></span>' +
      '<span class="font-bold whitespace-nowrap tnum"' + R(p + 'kpiTeams') + '>0/6 Pasukan Aktif</span>' +
    '</div>' +
  '</div>';
}

function metricCards(p, cols) {
  const card = (cls, labelCls, label, ref, valCls, unit, unitCls, sub, subCls, extra) =>
    '<div class="bg-white rounded-2xl p-4 shadow-sm border ' + cls + '"' + R(p + ref + 'Card') + '>' +
      '<span class="text-xs font-semibold ' + labelCls + ' block">' + label + '</span>' +
      '<div class="mt-1 flex items-baseline justify-between">' +
        (extra ? extra : '<span class="text-2xl font-extrabold tnum ' + valCls + '"' + R(p + ref) + '>0</span><span class="text-xs font-medium ' + unitCls + '">' + unit + '</span>') +
      '</div>' +
      '<p class="text-[11px] mt-1 ' + subCls + '">' + sub + '</p>' +
    '</div>';
  return '<div class="grid ' + cols + ' gap-3">' +
    card('border-slate-200', 'text-slate-500', '1. Rumah Dalam Lokaliti', 'mLoc', 'text-slate-900', 'buah', 'text-slate-400', 'Sasaran keseluruhan operasi', 'text-slate-500') +
    card('border-emerald-200 bg-emerald-50/30', 'text-emerald-800', '2. Rumah Dilawati', 'mVis', 'text-emerald-700', 'buah', 'text-emerald-600', 'Berjaya diperiksa petugas', 'text-emerald-700') +
    card('border-amber-200 bg-amber-50/30', 'text-amber-900', '3. Berkunci / Kosong', 'mLock', 'text-amber-700', 'buah', 'text-amber-700', 'Termasuk enggan / lot kosong', 'text-amber-800') +
    card('border-blue-200 bg-blue-50/30', 'text-blue-900', '4. Penduduk Diperiksa', 'mPop', 'text-blue-700', 'orang', 'text-blue-600', 'Jumlah disaring gejala ACD', 'text-blue-800') +
    card('border-rose-200 bg-rose-50/40', 'text-rose-900', '5. Kes Bergejala Dikesan', 'mSymp', 'text-rose-600', 'orang', 'text-rose-600', 'Demam / tanda klinikal denggi', 'text-rose-800') +
    card('border-purple-200 bg-purple-50/30', 'text-purple-900', '6. Rujukan & Sampel', 'mRef', '', '', '', 'Dirujuk ke KK / Hospital', 'text-purple-800',
      '<div><span class="text-2xl font-extrabold text-purple-700 tnum"' + R(p + 'mRef') + '>0</span> <span class="text-xs text-purple-600 font-medium">rujukan</span></div>' +
      '<span class="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full tnum"' + R(p + 'mSample') + '>0 sampel</span>') +
  '</div>';
}

function bahagianC(p, cols) {
  return '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">' +
    '<div class="mb-3"><h3 class="text-sm font-bold text-slate-800">Ringkasan Pemeriksaan Persekitaran & Pendidikan Kesihatan (Bahagian C)</h3>' +
    '<p class="text-xs text-slate-500">Status takungan pembiakan Aedes, penggunaan Abate, dan edaran risalah denggi.</p></div>' +
    '<div class="grid ' + cols + ' gap-3">' +
      '<div class="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between"><div><span class="text-xs font-bold text-rose-900 block">Takungan Berpotensi Aedes</span><span class="text-[11px] text-rose-700">Premis positif potensi pembiakan</span></div><span class="text-xl font-extrabold text-rose-700 tnum"' + R(p + 'envB') + '>0</span></div>' +
      '<div class="p-3 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between"><div><span class="text-xs font-bold text-teal-900 block">Tindakan Abate Diberi</span><span class="text-[11px] text-teal-700">Premis diletakkan ubat jentik-jentik</span></div><span class="text-xl font-extrabold text-teal-700 tnum"' + R(p + 'envA') + '>0</span></div>' +
      '<div class="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between"><div><span class="text-xs font-bold text-indigo-900 block">Risalah Kesihatan Diedar</span><span class="text-[11px] text-indigo-700">Pendidikan kesihatan diberikan</span></div><span class="text-xl font-extrabold text-indigo-700 tnum"' + R(p + 'envP') + '>0</span></div>' +
    '</div></div>';
}

/* SVG bar chart that mimics the Chart.js bar chart of the source (3 datasets, 6 teams). */
function barChartSvg(p, W, H) {
  const padL = 34, padR = 8, padT = 10, legendH = 34, xLabH = 22;
  const plotW = W - padL - padR, plotH = H - padT - legendH - xLabH, maxY = 20;
  let g = '';
  for (let v = 0; v <= maxY; v += 5) {
    const y = padT + plotH - (v / maxY) * plotH;
    g += '<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y + '" y2="' + y + '" stroke="#e2e8f0" stroke-width="1"/>' +
         '<text x="' + (padL - 7) + '" y="' + (y + 3.5) + '" text-anchor="end" font-size="11" fill="#64748b">' + v + '</text>';
  }
  const groupW = plotW / 6, catW = groupW * 0.8, barW = (catW / 3) * 0.9;
  const colors = ['#94a3b8', '#0d9488', '#f59e0b'];
  let bars = '';
  for (let t = 1; t <= 6; t++) {
    const gx = padL + groupW * (t - 1) + (groupW - catW) / 2;
    for (let k = 0; k < 3; k++) {
      const x = gx + (catW / 3) * k + ((catW / 3) - barW) / 2;
      bars += '<path fill="' + colors[k] + '" d=""' + R(p + 'bar' + t + '_' + k) + ' data-x="' + x.toFixed(2) + '" data-w="' + barW.toFixed(2) + '"/>';
    }
    g += '<text x="' + (padL + groupW * (t - 0.5)) + '" y="' + (padT + plotH + 16) + '" text-anchor="middle" font-size="11" fill="#64748b">Pasukan ' + t + '</text>';
  }
  const legend = [['Dalam Lokaliti', colors[0]], ['Dilawati', colors[1]], ['Berkunci / Kosong', colors[2]]];
  let lx = W / 2 - 150, ly = H - 12, lg = '';
  for (const [label, c] of legend) {
    lg += '<rect x="' + lx + '" y="' + (ly - 10) + '" width="12" height="12" fill="' + c + '"/><text x="' + (lx + 17) + '" y="' + ly + '" font-size="11" fill="#475569">' + label + '</text>';
    lx += 18 + label.length * 6.2 + 16;
  }
  return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"' + R(p + 'barSvg') + ' data-plot="' + [padL, padT, plotW, plotH, maxY].join(',') + '">' + g + bars + lg + '</svg>';
}

/* SVG doughnut mimicking the Chart.js doughnut (cutout 64%, white 2px borders). */
function doughnutSvg(p, W, H) {
  const legendH = 34, cx = W / 2, cy = (H - legendH) / 2 + 2, r = Math.min(W, H - legendH) / 2 - 8;
  const items = [['Dilawati', '#0d9488'], ['Berkunci / Kosong', '#f59e0b'], ['Belum Dilawati', '#cbd5e1']];
  let lg = '', lx = 8, ly = H - 12;
  const widths = items.map(([l]) => 18 + l.length * 6.1 + 12);
  const total = widths.reduce((a, b) => a + b, 0);
  lx = (W - total) / 2;
  items.forEach(([label, c], i) => {
    lg += '<rect x="' + lx + '" y="' + (ly - 10) + '" width="12" height="12" fill="' + c + '"/><text x="' + (lx + 17) + '" y="' + ly + '" font-size="11" fill="#475569">' + label + '</text>';
    lx += widths[i];
  });
  return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"' + R(p + 'donutSvg') + ' data-geo="' + [cx, cy, r, r * 0.64].join(',') + '">' +
    '<path fill="#0d9488" stroke="#fff" stroke-width="2" d=""' + R(p + 'arc0') + '/>' +
    '<path fill="#f59e0b" stroke="#fff" stroke-width="2" d=""' + R(p + 'arc1') + '/>' +
    '<path fill="#cbd5e1" stroke="#fff" stroke-width="2" d=""' + R(p + 'arc2') + '/>' + lg + '</svg>';
}

function summaryTable(p) {
  const rows = [
    ['locality', 'Jumlah Rumah/Premis dalam Lokaliti'], ['visited', 'Jumlah Rumah/Premis Dilawati'],
    ['locked', 'Jumlah Rumah/Premis Berkunci / Kosong'], ['pop', 'Jumlah Penduduk Diperiksa (ACD)'],
    ['symp', 'Jumlah Kes Bergejala Dikesan', 'rose'], ['ref', 'Jumlah Rujukan Ke Fasiliti Kesihatan'],
    ['sample', 'Jumlah Sampel Diambil di Lapangan'], ['pct', 'Pencapaian ACD (%)', 'pct']
  ];
  let body = '';
  for (const [key, label, kind] of rows) {
    let cells = '';
    for (let t = 1; t <= 6; t++) {
      const v = kind === 'pct' ? (calcTeamPct(TEAMS[t]) + '%') : TEAMS[t][key];
      cells += '<td class="p-2 text-center ' + (kind === 'pct' ? 'font-extrabold text-teal-900 bg-teal-50/60' : 'text-slate-700') + ' tnum">' + v + '</td>';
    }
    const tot = kind === 'pct' ? TOTALS.pct + '%' : TOTALS[key];
    body += '<tr class="' + (kind === 'pct' ? 'bg-teal-50/80 font-bold border-t-2 border-teal-200' : '') + '">' +
      '<td class="p-2 pl-3 font-semibold ' + (kind === 'rose' ? 'text-rose-700' : 'text-slate-800') + '">' + label + '</td>' + cells +
      '<td class="p-2 text-center font-extrabold tnum ' + (kind === 'rose' ? 'bg-rose-100 text-rose-800' : 'bg-amber-50 text-slate-950') + '">' + tot + '</td></tr>';
  }
  return '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"' + R(p + 'table') + '>' +
    '<div class="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">' +
      '<div><h3 class="text-sm font-extrabold text-slate-900 uppercase">Jadual Hasil Dapatan ACD Mengikut Pasukan</h3>' +
      '<p class="text-xs text-slate-500">Jumlah dan peratusan Pencapaian ACD (%) dikira secara automatik.</p></div>' +
      '<div class="flex items-center gap-2">' +
        '<span class="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm relative"' + R(p + 'btnWa') + '><span>Salin Laporan (WhatsApp)</span></span>' +
        '<span class="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"' + R(p + 'btnCsv') + '><span>Muat Turun CSV</span></span>' +
        '<span class="text-xs font-bold bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg">Cetak</span>' +
      '</div></div>' +
    '<table class="w-full text-xs text-left border-collapse"><thead><tr class="bg-teal-900 text-white font-bold text-center">' +
      '<th class="p-2.5 text-left">PERKARA</th>' + [1, 2, 3, 4, 5, 6].map(t => '<th class="p-2">Pasukan ' + t + '</th>').join('') +
      '<th class="p-2 bg-amber-500 text-slate-950">Jumlah</th></tr></thead><tbody class="divide-y divide-slate-200">' + body + '</tbody></table></div>';
}

function referralList(p) {
  const cards = REFERRALS.map(h =>
    '<div class="p-3 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-2">' +
      '<div><div class="flex items-center gap-2"><span class="text-[11px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-md">Pasukan ' + h.team + '</span>' +
      '<span class="text-xs font-bold text-slate-900">' + esc(h.address) + '</span></div>' +
      '<p class="text-xs text-rose-900 font-medium mt-1">Kes bergejala dikesan</p>' +
      '<div class="flex flex-wrap gap-1 mt-1">' + h.symptoms.map(s => '<span class="text-[10px] bg-white border border-rose-200 text-rose-800 px-2 py-0.5 rounded-md">' + esc(s) + '</span>').join('') + '</div></div>' +
      '<div class="text-right shrink-0"><span class="text-xs font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-lg inline-block">Rujuk Klinik Kesihatan</span></div>' +
    '</div>').join('');
  return '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"' + R(p + 'refList') + '>' +
    '<div class="flex items-center justify-between mb-3"><div><h3 class="text-sm font-bold text-slate-800">Senarai Kes Bergejala & Tindakan Rujukan (Bahagian B & Lampiran 1)</h3>' +
    '<p class="text-xs text-slate-500">Individu bergejala denggi yang dikesan semasa lawatan rumah ke rumah.</p></div>' +
    '<span class="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">' + TOTALS.symp + ' Kes Bergejala</span></div>' +
    '<div class="space-y-2">' + cards + '</div></div>';
}

/* ---------------------------------------------------------------- phone app */
function phoneDashboard() {
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.dashboard"' + R('ph.vDash') + '>' +
    '<div class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">' +
      '<div class="flex items-center gap-2"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>' +
      '<h2 class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ringkasan Eksekutif & Kiraan Automatik Operasi</h2></div>' +
      '<p class="text-[11px] text-slate-600 mt-0.5">Mengira secara automatik daripada semua 6 pasukan bertugas di lapangan.</p>' +
      '<div class="flex flex-wrap items-center gap-2 mt-2.5">' +
        '<span class="text-xs font-bold bg-teal-700 text-white px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5">' + ICON.plus + '<span>Rekod Rumah Baharu</span></span>' +
        '<span class="text-xs font-bold bg-slate-800 text-white px-3 py-2 rounded-xl shadow-sm">Isi Jadual Pasukan (1–6)</span>' +
      '</div></div>' +
    heroCard('ph.') + metricCards('ph.', 'grid-cols-2') + bahagianC('ph.', 'grid-cols-1') +
  '</section>';
}

function phoneBorang() {
  const pills = STATUS_CODES.map(s =>
    '<span class="status-pill py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 text-center' + (s.code === '6' ? ' col-span-2' : '') + '"' + R('ph.pill' + s.code) + '>' + esc(s.label) + '</span>').join('');
  const chips = SYMPTOMS.map((s, i) =>
    '<span class="symptom-chip text-xs px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-900 font-medium"' + R('ph.chip' + i) + '>' + esc(s) + '</span>').join('');
  const stepper = (label, ref, cls, val) =>
    '<div><label class="block text-xs font-bold ' + cls[0] + ' mb-1">' + label + '</label><div class="flex items-center">' +
      '<span class="w-10 h-9 rounded-l-xl ' + cls[1] + ' font-bold flex items-center justify-center">-</span>' +
      '<span class="w-full h-9 border-y ' + cls[2] + ' text-center font-bold text-sm flex items-center justify-center tnum"' + R(ref) + '>' + val + '</span>' +
      '<span class="w-10 h-9 rounded-r-xl ' + cls[3] + ' font-bold flex items-center justify-center"' + R(ref + 'Plus') + '>+</span></div></div>';
  const rose = ['text-rose-900', 'bg-rose-200 text-rose-900', 'border-rose-300 text-rose-900 bg-white', 'bg-rose-600 text-white'];
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.borang"' + R('ph.vBorang') + '>' +
    '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 relative">' +
      '<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4"><div>' +
        '<span class="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Borang Lapangan & Lampiran 1</span>' +
        '<h2 class="text-base font-extrabold text-slate-900 mt-1">Input Lawatan Rumah / Premis Baharu</h2></div>' +
        '<span class="text-[10px] text-slate-500 text-right leading-tight whitespace-nowrap">Terus ke<br>Papan Pemuka</span></div>' +
      '<div class="space-y-4">' +
        '<div class="grid grid-cols-1 gap-3">' +
          '<div class="relative"><label class="block text-xs font-bold text-slate-700 mb-1">Pasukan Bertugas *</label>' +
            '<div class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 flex items-center justify-between"' + R('ph.teamSel') + '><span' + R('ph.teamSelText') + '>Pasukan 2</span><span class="text-slate-400 text-[10px]">▼</span></div>' +
            '<div class="dropdown"' + R('ph.teamDrop') + '>' + [1, 2, 3, 4, 5, 6].map(t => '<div class="dd-item"' + R('ph.dd' + t) + '>Pasukan ' + t + '</div>').join('') + '</div>' +
          '</div>' +
          '<div><label class="block text-xs font-bold text-slate-700 mb-1">Alamat / No. Rumah / Lorong *</label>' +
            '<div class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 flex items-center min-h-[42px]"' + R('ph.addrBox') + '><span' + R('ph.addr') + '></span><span class="caret"' + R('ph.addrCaret') + '></span><span class="text-slate-400"' + R('ph.addrPh') + '>Masukkan No. Rumah / Lorong</span></div></div>' +
        '</div>' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1.5">Status Lawatan Premis (Kod Lampiran 1) *</label>' +
          '<div class="grid grid-cols-2 gap-2">' + pills + '</div></div>' +
        '<div class="space-y-4 pt-2 border-t border-slate-100">' +
          '<div class="grid grid-cols-1 gap-3">' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">Bil. Penghuni Diperiksa (Orang)</label><div class="flex items-center">' +
              '<span class="w-11 h-10 rounded-l-xl bg-slate-200 text-slate-800 font-extrabold text-lg flex items-center justify-center">-</span>' +
              '<span class="w-full h-10 border-y border-slate-300 text-center font-bold text-base text-slate-900 flex items-center justify-center tnum"' + R('ph.occ') + '>1</span>' +
              '<span class="w-11 h-10 rounded-r-xl bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center"' + R('ph.occPlus') + '>+</span></div></div>' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">Nama Ketua Rumah / Wakil</label><div class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-400">Nama ketua rumah / wakil</div></div>' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">No. Telefon Ketua Rumah</label><div class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-400">No. telefon</div></div>' +
          '</div>' +
          '<div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3"' + R('ph.secB') + '>' +
            '<div class="flex items-center justify-between gap-2"><div>' +
              '<span class="text-xs font-extrabold text-rose-950 uppercase block">Bahagian B: Saringan Gejala Denggi</span>' +
              '<span class="block text-[11px] leading-snug text-rose-800">Tandakan jika terdapat penghuni yang mengalami demam atau gejala denggi</span></div>' +
              '<span class="inline-flex items-center shrink-0"><span class="toggle"' + R('ph.toggle') + '><span class="knob"></span></span>' +
              '<span class="ml-2 text-xs font-bold text-rose-900 w-[46px]"' + R('ph.toggleLbl') + '>Tiada</span></span></div>' +
            '<div class="sym-box"' + R('ph.symBox') + '><div class="space-y-3 pt-2 border-t border-rose-200/80"' + R('ph.symInner') + '>' +
              '<div><span class="block text-xs font-bold text-rose-900 mb-1.5">Pilih Gejala Denggi Dikesan (Senarai Borang PKD Muallim):</span>' +
              '<div class="flex flex-wrap gap-1.5">' + chips + '</div></div>' +
              '<div class="grid grid-cols-1 gap-3">' +
                '<div class="relative"' + R('ph.sympWrap') + '>' + stepper('Bil. Kes Bergejala (Orang)', 'ph.sympCnt', rose, 0) + '</div>' +
                '<div class="relative"' + R('ph.refWrap') + '>' + stepper('Bil. Dirujuk Ke Klinik/KK', 'ph.refCnt', rose, 0) + '</div>' +
                stepper('Bil. Sampel Diambil', 'ph.sampleCnt', rose, 0) +
              '</div>' +
              '<div><label class="block text-xs font-bold text-rose-900 mb-1">Catatan Nama & No. Telefon Kes Bergejala</label>' +
              '<div class="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-slate-400">Nama pesakit, no. telefon & catatan rujukan</div></div>' +
            '</div></div>' +
          '</div>' +
          '<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"' + R('ph.secC') + '>' +
            '<span class="text-xs font-extrabold text-slate-800 uppercase block">Bahagian C: Status Pemeriksaan Persekitaran & Tindakan</span>' +
            '<div class="grid grid-cols-1 gap-2.5">' +
              '<div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"' + R('ph.cRow0') + '><span class="text-xs font-semibold text-slate-700">1. Takungan Berpotensi Aedes?</span><span class="cbox rose"' + R('ph.cb0') + '>' + ICON.check + '</span></div>' +
              '<div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"' + R('ph.cRow1') + '><span class="text-xs font-semibold text-slate-700">2. Tindakan Abate Diberi?</span><span class="cbox"' + R('ph.cb1') + '>' + ICON.check + '</span></div>' +
              '<div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"' + R('ph.cRow2') + '><span class="text-xs font-semibold text-slate-700">3. Risalah Denggi Diedarkan?</span><span class="cbox"' + R('ph.cb2') + '>' + ICON.check + '</span></div>' +
            '</div>' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">Tindakan Lapangan (Lampiran 1)</label>' +
              '<div class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 flex items-center justify-between"' + R('ph.action') + '><span' + R('ph.actionText') + '>Pendidikan Kesihatan</span><span class="text-slate-400 text-[10px]">▼</span></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="pt-2"><div class="w-full bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm text-center"' + R('ph.saveBtn') + '>+ Simpan Rekod Rumah dan Kira Automatik</div></div>' +
      '</div>' +
    '</div>' +
    /* Lampiran 1 list (compact on mobile) */
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"' + R('ph.lamp') + '>' +
      '<div class="p-3.5 border-b border-slate-200 bg-slate-50"><h3 class="text-sm font-bold text-slate-900">Senarai Rekod Lawatan Rumah (Lampiran 1 Borang ACD)</h3>' +
      '<p class="text-xs text-slate-500"' + R('ph.lampSub') + '>Memaparkan 0 rekod rumah dalam Lampiran 1.</p></div>' +
      '<div class="lamp-row new-row"' + R('ph.lampRow') + '>' +
        '<div class="flex items-center gap-2"><span class="text-[11px] font-bold text-slate-500">1</span><span class="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">P1</span>' +
        '<span class="font-semibold text-slate-900 text-xs">' + esc(HOUSE_DEMO.address) + '</span>' +
        '<span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 ml-auto">1 - Dilawati</span></div>' +
        '<div class="flex items-center gap-2 mt-1.5 text-[11px]"><span class="text-slate-600">Penghuni: <b class="text-slate-900">5</b></span>' +
        '<span class="font-bold text-rose-600">1 kes bergejala</span></div>' +
        '<div class="flex flex-wrap gap-1 mt-1.5"><span class="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">Takungan+</span>' +
        '<span class="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">Abate</span>' +
        '<span class="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Risalah</span>' +
        '<span class="text-[11px] text-slate-600 ml-1">Rujuk Klinik Kesihatan</span></div>' +
      '</div>' +
      '<div class="p-4 text-center text-slate-400 text-xs"' + R('ph.lampEmpty') + '>Tiada rekod rumah dimasukkan lagi.</div>' +
    '</div>' +
  '</section>';
}

function phonePasukan() {
  const fields = [
    ['1. Jumlah Rumah dalam Lokaliti (Sasaran)', 'locality', 'border-slate-200', 'text-slate-700', 'text-slate-900', 'bg-teal-600'],
    ['2. Jumlah Rumah/Premis Dilawati', 'visited', 'border-emerald-200', 'text-emerald-800', 'text-emerald-700', 'bg-emerald-600'],
    ['3. Jumlah Rumah Berkunci / Kosong', 'locked', 'border-amber-200', 'text-amber-900', 'text-amber-700', 'bg-amber-600'],
    ['4. Jumlah Penduduk Diperiksa (ACD)', 'pop', 'border-blue-200', 'text-blue-900', 'text-blue-700', 'bg-blue-600'],
    ['5. Jumlah Kes Bergejala Dikesan', 'symp', 'border-rose-200', 'text-rose-900', 'text-rose-600', 'bg-rose-600'],
    ['6. Jumlah Rujukan Fasiliti Kesihatan', 'ref', 'border-purple-200', 'text-purple-900', 'text-purple-700', 'bg-purple-600'],
    ['7. Jumlah Sampel Diambil di Lapangan', 'sample', 'border-slate-200', 'text-slate-700', 'text-slate-800', 'bg-slate-700']
  ];
  const fieldHtml = fields.map(([label, key, b, lc, vc, pc]) =>
    '<div class="bg-white p-3 rounded-xl border ' + b + '"><label class="block text-xs font-bold ' + lc + ' mb-1">' + label + '</label><div class="flex items-center">' +
      '<span class="w-10 h-9 rounded-l-lg bg-slate-200 font-bold text-lg flex items-center justify-center">-</span>' +
      '<span class="w-full h-9 border-y border-slate-300 text-center font-extrabold text-base flex items-center justify-center tnum ' + vc + '"' + R('ph.q_' + key) + '>0</span>' +
      '<span class="w-10 h-9 rounded-r-lg ' + pc + ' text-white font-bold text-lg flex items-center justify-center">+</span></div></div>').join('');
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.pasukan"' + R('ph.vPasukan') + '>' +
    '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">' +
      '<div class="border-b border-slate-100 pb-3 mb-3">' +
        '<span class="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">Input Terus Mengikut Pasukan (1–6)</span>' +
        '<h2 class="text-base font-extrabold text-slate-900 mt-1 leading-snug">Kemasukan Pantas Dapatan Pasukan (Selesai Operasi ACD)</h2>' +
        '<p class="text-xs text-slate-500 mt-0.5">Jumlah dan % Pencapaian ACD dikira automatik.</p>' +
        '<span class="inline-block mt-2 text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300 px-3 py-2 rounded-xl">Kira Semula Dari Lampiran 1</span>' +
      '</div>' +
      '<div class="overflow-hidden -mx-1 px-1"><div class="flex gap-1.5 pb-2 mb-2"' + R('ph.qtabsRow') + '>' +
        [1, 2, 3, 4, 5, 6].map(t => '<span class="qteam-btn min-w-[90px] py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 text-center"' + R('ph.qtab' + t) + '>Pasukan ' + t + '</span>').join('') +
      '</div></div>' +
      '<div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">' +
        '<div class="flex items-center justify-between border-b border-slate-200 pb-2.5"><div>' +
          '<h3 class="text-sm font-extrabold text-slate-900"' + R('ph.qHead') + '>Dapatan Pasukan 1</h3>' +
          '<p class="text-xs text-slate-500"' + R('ph.qMembers') + '>Anggota Pasukan 1: Petugas 01, 04, 08</p></div>' +
          '<div class="text-right"><span class="text-[11px] font-semibold text-slate-500 block">Pencapaian Pasukan</span>' +
          '<span class="text-lg font-extrabold text-teal-700 tnum"' + R('ph.qPct') + '>0%</span></div></div>' +
        '<div class="grid grid-cols-1 gap-2.5">' + fieldHtml + '</div>' +
        '<div class="flex justify-end pt-1"><span class="bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm text-center"' + R('ph.qSave') + '>Simpan & Hantar Dapatan Pasukan ke Google Sheet</span></div>' +
      '</div></div>' +
    /* Bahagian D */
    '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3"' + R('ph.secD') + '>' +
      '<div class="border-b border-slate-100 pb-3"><span class="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">Bahagian D Borang ACD</span>' +
      '<h3 class="text-base font-extrabold text-slate-900 mt-1 leading-snug">Pengesahan Pegawai di Lapangan (Peg Epid / PKP / PPKP)</h3>' +
      '<p class="text-xs text-slate-500">Ringkasan rumusan aktiviti lapangan di akhir operasi.</p></div>' +
      '<div class="grid grid-cols-1 gap-2.5">' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1">Nama Pegawai Pengesah</label><div class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm flex items-center min-h-[38px]"' + R('ph.vNameBox') + '><span' + R('ph.vName') + '></span><span class="caret"' + R('ph.vCaret') + '></span><span class="text-slate-400"' + R('ph.vNamePh') + '>Masukkan nama penuh pegawai</span></div></div>' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1">Jawatan Pegawai</label><div class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-medium flex items-center justify-between"><span>' + esc(VERIFICATION.officerRole) + '</span><span class="text-slate-400 text-[10px]">▼</span></div></div>' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1">Tarikh Pengesahan</label><div class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">' + esc(VERIFICATION.date) + '</div></div>' +
      '</div>' +
      '<div class="pt-1 space-y-2.5"><div class="text-xs text-slate-600 leading-snug"' + R('ph.vStatus') + '>Status: <span class="font-bold text-amber-700">Belum Disahkan</span></div>' +
      '<div class="w-full bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm text-center"' + R('ph.vBtn') + '>Sahkan Rumusan Operasi ACD</div></div>' +
    '</div>' +
  '</section>';
}

function phonePetugas() {
  const rows = STAFF.map((s, i) =>
    '<tr><td class="py-1.5 px-1 text-center font-bold text-slate-500 tnum">' + (i + 1) + '</td>' +
    '<td class="py-1.5 px-1 font-bold text-slate-900 leading-tight">' + esc(s.name) + '</td>' +
    '<td class="py-1.5 px-1 text-slate-700 leading-tight">' + esc(s.role) + '</td>' +
    '<td class="py-1.5 px-1"><span class="text-[9px] font-semibold bg-slate-100 px-1 py-0.5 rounded inline-block leading-tight">' + esc(s.unit) + '</span></td>' +
    '<td class="py-1.5 px-1"><span class="team-tag t' + s.team + '">Pasukan ' + s.team + '</span></td>' +
    '<td class="py-1.5 px-0.5 text-center"><span class="text-[8.5px] font-bold px-1 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Disahkan</span></td></tr>').join('');
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.petugas"' + R('ph.vPetugas') + '>' +
    '<div class="grid grid-cols-3 gap-2"' + R('ph.rosterKpi') + '>' +
      '<div class="bg-white rounded-2xl p-3 shadow-sm border border-amber-300 text-center relative"' + R('ph.rosterReq') + '><span class="text-[11px] font-semibold text-slate-500 block leading-tight">Keperluan Petugas</span><span class="text-2xl font-extrabold text-slate-900 mt-1 block">' + META.requiredStaff + '</span></div>' +
      '<div class="bg-white rounded-2xl p-3 shadow-sm border border-emerald-200 bg-emerald-50/40 text-center"><span class="text-[11px] font-semibold text-emerald-800 block leading-tight">Disahkan Hadir</span><span class="text-2xl font-extrabold text-emerald-700 mt-1 block">' + STAFF.length + '</span></div>' +
      '<div class="bg-white rounded-2xl p-3 shadow-sm border border-amber-200 bg-amber-50/40 text-center"><span class="text-[11px] font-semibold text-amber-900 block leading-tight">Baki Keperluan</span><span class="text-2xl font-extrabold text-amber-700 mt-1 block">' + (META.requiredStaff - STAFF.length) + '</span></div>' +
    '</div>' +
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">' +
      '<div class="p-3 border-b border-slate-200 bg-slate-50"><h3 class="text-sm font-bold text-slate-900">Senarai Pencalonan Petugas ACD Kg. Ketoyong</h3>' +
      '<p class="text-[11px] text-slate-500">Petugas diagihkan kepada Pasukan 1 hingga 6.</p></div>' +
      '<table class="w-full text-[9.5px] text-left border-collapse table-fixed"><colgroup><col style="width:18px"><col style="width:72px"><col><col style="width:50px"><col style="width:58px"><col style="width:48px"></colgroup><thead><tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">' +
      '<th class="py-1.5 px-1 text-center">Bil</th><th class="py-1.5 px-1">Nama Petugas</th><th class="py-1.5 px-1">Jawatan</th><th class="py-1.5 px-1">Fasiliti / Unit</th><th class="py-1.5 px-1">Pasukan</th><th class="py-1.5 px-1 text-center">Status</th></tr></thead>' +
      '<tbody class="divide-y divide-slate-200">' + rows + '</tbody></table></div>' +
  '</section>';
}

function phoneApp() {
  const nav = [['ph.nDash', ICON.navDash, 'Papan Pemuka'], ['ph.nBorang', ICON.navHome, 'Input Rumah'], ['ph.nPasukan', ICON.navTeam, 'Pasukan 1–6'], ['ph.nPetugas', ICON.navStaff, 'Petugas']];
  return '<div class="ph-app"' + R('ph.app') + '>' +
    '<div class="ph-statusbar"><span class="tnum">17:05</span><span class="sb-icons"><i></i><i></i><i></i><b></b></span></div>' +
    appHeader('ph.', true) +
    '<div class="ph-viewport"' + R('ph.viewport') + '><div class="ph-scroll"' + R('ph.scroll') + '>' +
      phoneDashboard() + phoneBorang() + phonePasukan() + phonePetugas() +
    '</div></div>' +
    '<nav class="ph-nav"><div class="grid grid-cols-4 h-16">' +
      nav.map(([ref, icon, label]) => '<span class="flex flex-col items-center justify-center gap-0.5 text-slate-500 font-medium"' + R(ref) + '>' + icon + '<span class="text-[11px]">' + label + '</span></span>').join('') +
    '</div><div class="home-ind"></div></nav>' +
    '<div class="toast"' + R('ph.toast') + '><span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span><span' + R('ph.toastText') + '>Berjaya disimpan</span></div>' +
  '</div>';
}

/* Home screen (generic placeholder icons, no third-party logos). */
function phoneHome() {
  const hues = ['#38bdf8', '#a78bfa', '#f472b6', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#60a5fa', '#c084fc', '#f87171', '#94a3b8', '#34d399', '#fbbf24', '#818cf8', '#22d3ee'];
  let icons = '';
  for (let i = 0; i < 15; i++) {
    if (i === 13) {
      icons += '<div class="hs-slot"><div class="hs-icon app-icon"' + R('ph.newIcon') + '><img src="' + JATA_SRC + '" alt=""/></div><div class="hs-label"' + R('ph.newIconLbl') + '>e-ACD Denggi</div></div>';
    } else {
      icons += '<div class="hs-slot"><div class="hs-icon" style="background:linear-gradient(145deg,' + hues[i] + ',' + hues[(i + 5) % hues.length] + ')"></div><div class="hs-label ph-bar"></div></div>';
    }
  }
  return '<div class="ph-home"' + R('ph.home') + '>' +
    '<div class="ph-statusbar light"><span class="tnum">17:05</span><span class="sb-icons"><i></i><i></i><i></i><b></b></span></div>' +
    '<div class="hs-grid">' + icons + '</div>' +
    '<div class="hs-dock">' + ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1'].map(c => '<div class="hs-icon" style="background:linear-gradient(145deg,' + c + ',#0f172a)"></div>').join('') + '</div>' +
    '<div class="ph-launch"' + R('ph.launch') + '><img src="' + JATA_SRC + '" alt=""/></div>' +
  '</div>';
}

function phone() {
  return '<div class="actor phone"' + R('phone') + '>' +
    '<div class="phone-back"></div>' +
    '<div class="phone-frame"><div class="phone-screen"' + R('ph.screen') + '>' +
      phoneApp() + phoneHome() +
      '<div class="island"></div><div class="glass"' + R('ph.glass') + '></div>' +
      '<div class="touch"' + R('ph.touch') + '><i class="ripple"' + R('ph.ripple') + '></i></div>' +
    '</div></div>' +
    '<span class="pbtn b1"></span><span class="pbtn b2"></span><span class="pbtn b3"></span>' +
  '</div>';
}

/* ---------------------------------------------------------------- desktop app */
function desktop() {
  const tabs = ['1. Papan Pemuka Hasil ACD', '2. Input Rumah (Lampiran 1)', '3. Input Pasukan dan Pengesahan', '4. Senarai Petugas (' + STAFF.length + '/' + META.requiredStaff + ')'];
  return '<div class="actor desktop"' + R('desktop') + '>' +
    '<div class="monitor"><div class="monitor-screen">' +
      '<div class="win-bar"><span class="dots"><i></i><i></i><i></i></span><span class="win-tab"><img src="' + JATA_SRC + '" alt=""/>Sistem e-ACD Denggi — PKD Muallim</span>' + simBadge('dk-sim') + '</div>' +
      '<div class="dk-app"' + R('dk.app') + '>' +
        appHeader('dk.', false) +
        '<div class="dk-viewport"' + R('dk.viewport') + '><div class="dk-scroll"' + R('dk.scroll') + '>' +
          '<nav class="max-w-5xl mx-auto px-4 pt-3"><div class="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-4 gap-1.5">' +
            tabs.map((l, i) => '<span class="py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center text-center ' + (i === 0 ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600') + '">' + l + '</span>').join('') +
          '</div></nav>' +
          '<main class="max-w-5xl mx-auto px-4 py-4 space-y-4">' +
            '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-3"><div>' +
              '<div class="flex items-center gap-2"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span><h2 class="text-sm font-bold uppercase tracking-wider text-slate-500">Ringkasan Eksekutif & Kiraan Automatik Operasi</h2></div>' +
              '<p class="text-xs text-slate-600 mt-0.5">Mengira secara automatik daripada semua 6 pasukan bertugas di lapangan.</p></div>' +
              '<div class="flex items-center gap-2"><span class="text-xs font-bold bg-teal-700 text-white px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5">' + ICON.plus + '<span>Rekod Rumah Baharu</span></span>' +
              '<span class="text-xs font-bold bg-slate-800 text-white px-3.5 py-2 rounded-xl shadow-sm">Isi Jadual Pasukan (1–6)</span></div></div>' +
            '<div class="grid grid-cols-3 gap-4"' + R('dk.heroRow') + '>' + heroCard('dk.') + '<div class="col-span-2">' + metricCards('dk.', 'grid-cols-3') + '</div></div>' +
            bahagianC('dk.', 'grid-cols-3') +
            '<div class="grid grid-cols-3 gap-4"' + R('dk.charts') + '>' +
              '<div class="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-200"><div class="mb-2"><h3 class="text-sm font-bold text-slate-800">Prestasi Dapatan Mengikut Pasukan (Pasukan 1 – 6)</h3>' +
              '<p class="text-xs text-slate-500">Perbandingan Rumah Dalam Lokaliti, Dilawati & Berkunci/Kosong</p></div>' + barChartSvg('dk.', 638, 256) + '</div>' +
              '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"><div class="mb-2"><h3 class="text-sm font-bold text-slate-800">Pecahan Status Premis & Saringan</h3>' +
              '<p class="text-xs text-slate-500">Taburan premis dilawati vs berkunci/kosong</p></div>' + doughnutSvg('dk.', 296, 256) + '</div>' +
            '</div>' +
            summaryTable('dk.') + referralList('dk.') +
          '</main>' +
        '</div></div>' +
        '<div class="toast"' + R('dk.toast') + '><span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span><span' + R('dk.toastText') + '>Berjaya</span></div>' +
        '<div class="touch"' + R('dk.touch') + '><i class="ripple"' + R('dk.ripple') + '></i></div>' +
      '</div>' +
    '</div><div class="monitor-glass"></div></div>' +
    '<div class="stand-neck"></div><div class="stand-base"></div>' +
  '</div>';
}

/* ------------------------------------------------- simulated Google Sheets view */
function sheetWindow() {
  const labels = ['Jumlah Rumah/Premis dalam Lokaliti', 'Jumlah Rumah/Premis Dilawati', 'Jumlah Rumah/Premis Berkunci / Kosong',
    'Jumlah Penduduk Diperiksa (ACD)', 'Jumlah Kes Bergejala Dikesan', 'Jumlah Rujukan Ke Fasiliti Kesihatan', 'Pencapaian ACD (%)'];
  const keys = ['locality', 'visited', 'locked', 'pop', 'symp', 'ref'];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let html = '<div class="sh-row sh-colhdr"><div class="sh-rn"></div>' + cols.map(c => '<div class="sh-c sh-' + c + '">' + c + '</div>').join('') + '</div>';
  html += '<div class="sh-row"><div class="sh-rn">7</div><div class="sh-c sh-A"></div><div class="sh-c sh-B hdr">PERKARA</div>' +
    [1, 2, 3, 4, 5, 6].map(t => '<div class="sh-c hdr">Pasukan ' + t + '</div>').join('') + '<div class="sh-c hdr tot">Jumlah</div></div>';
  for (let r = 0; r < 7; r++) {
    const rowNum = 8 + r;
    let cells = '';
    for (let t = 1; t <= 6; t++) {
      const v = r < 6 ? TEAMS[t][keys[r]] : calcTeamPct(TEAMS[t]) + '%';
      cells += '<div class="sh-c num' + (r < 6 ? ' data' : ' pct') + '"' + R('sh.c' + r + '_' + t) + '><span>' + v + '</span></div>';
    }
    const tot = r < 6 ? TOTALS[keys[r]] : TOTALS.pct + '%';
    html += '<div class="sh-row' + (r === 6 ? ' pctrow' : '') + '"><div class="sh-rn">' + rowNum + '</div><div class="sh-c sh-A"></div><div class="sh-c sh-B">' + labels[r] + '</div>' + cells +
      '<div class="sh-c num tot"' + R('sh.tot' + r) + '><span>' + tot + '</span></div></div>';
  }
  return '<div class="actor sheet"' + R('sheet') + '>' +
    '<div class="sh-title"><span class="sh-ico">' + ICON.grid + '</span><div><div class="sh-name">ACD Denggi Kg. Ketoyong</div><div class="sh-sub">Google Sheets · paparan simulasi</div></div>' + simBadge('sh-sim') + '</div>' +
    '<div class="sh-fx"><span class="sh-range"' + R('sh.range') + '>Hasil ACD!C8:H13</span><span class="sh-fxl">fx</span><span class="sh-fxv"' + R('sh.fxv') + '>saveAcdDataFromApp → setValues()</span></div>' +
    '<div class="sh-grid"' + R('sh.grid') + '>' + html + '<div class="sh-sel"' + R('sh.sel') + '></div></div>' +
    '<div class="sh-tabs"><span class="sh-tab on"' + R('sh.tab0') + '>Hasil ACD</span><span class="sh-tab"' + R('sh.tab1') + '>Pencalonan Petugas<i class="tick">' + ICON.check + '</i></span><span class="sh-tab"' + R('sh.tab2') + '>Lampiran 1 (Rekod Rumah)<i class="tick">' + ICON.check + '</i></span></div>' +
  '</div>';
}

function gasNode() {
  return '<div class="actor gas"' + R('gas') + '>' +
    '<div class="gas-head"><span class="gas-ico">' + ICON.code + '</span><div><div class="gas-t">Google Apps Script</div><div class="gas-s">Code.gs · Web App</div></div></div>' +
    '<div class="gas-fn"' + R('gas.save') + '><b>saveAcdDataFromApp</b>(payload)<em>tulis</em></div>' +
    '<div class="gas-fn"' + R('gas.get') + '><b>getAcdDataForApp</b>()<em>baca</em></div>' +
    '<div class="gas-props"' + R('gas.props') + '><span class="gp-k">Script Properties</span><span class="gp-v">ACD_EXTRA_STATE</span><span class="gp-d">sampel · Bahagian C · rekod rumah · pengesahan Bahagian D</span></div>' +
  '</div>';
}

function peerDevice() {
  return '<div class="actor peer"' + R('peer') + '>' +
    '<div class="peer-screen"><div class="peer-top"><span class="dot"' + R('peer.dot') + '></span><span' + R('peer.text') + '>Sistem Aktif</span></div>' +
    '<div class="peer-kpi"><span class="peer-pct tnum"' + R('peer.pct') + '>—</span><span class="peer-sub">Liputan ACD</span></div>' +
    '<div class="peer-toast"' + R('peer.toast') + '>Data terkini dimuatkan</div></div>' +
    '<div class="peer-label">Peranti pasukan lain</div>' +
  '</div>';
}

/* Generic message composer (no third-party branding). */
function chatPanel() {
  const lines = buildWhatsappSummary(META, TOTALS).split('\n').map(l => {
    if (!l.trim()) return '<div class="cl gap"></div>';
    let s = esc(l).replace(/\*(.+?)\*/g, '<b>$1</b>');
    s = s.replace('📍', '<i class="emo">' + ICON.pin.replace('w-3.5 h-3.5 text-amber-400 shrink-0', 'emo-svg') + '</i>')
         .replace('📅', '<i class="emo">' + ICON.calendar + '</i>')
         .replace('📊', '<i class="emo">' + ICON.chart + '</i>');
    return '<div class="cl">' + s + '</div>';
  }).join('');
  return '<div class="actor chat"' + R('chat') + '>' +
    '<div class="chat-head"><span class="chat-av">' + ICON.users + '</span><div><div class="chat-t">Kumpulan Operasi ACD</div><div class="chat-s">Draf mesej · WhatsApp (simulasi)</div></div>' + simBadge('chat-sim') + '</div>' +
    '<div class="chat-body"><div class="chat-paste-hint"' + R('chat.hint') + '>Tampal</div>' +
      '<div class="chat-bubble"' + R('chat.bubble') + '>' + lines + '</div></div>' +
    '<div class="chat-compose"><span class="chat-input"' + R('chat.input') + '>Ringkasan laporan ditampal · sedia dihantar</span><span class="chat-send"' + R('chat.send') + '>' + ICON.send + '</span></div>' +
  '</div>';
}

/* ------------------------------------------------------------- Scene 1 set */
function scene1() {
  return '<div class="set s1"' + R('s1') + '>' +
    '<div class="s1-map"' + R('s1.map') + '>' +
      '<svg viewBox="0 0 1920 1080" width="1920" height="1080"' + R('s1.mapSvg') + '></svg>' +
      '<div class="map-chip"' + R('s1.mapChip') + '>Peta Ilustrasi · bukan berskala</div>' +
      '<div class="map-district"' + R('s1.district') + '>Daerah Muallim</div>' +
      '<div class="map-pin"' + R('s1.pin') + '><div class="pin-ring"' + R('s1.pinRing') + '></div><div class="pin-head"></div><div class="pin-label"' + R('s1.pinLabel') + '>' + ICON.pin + '<span>Kg. Ketoyong</span></div></div>' +
    '</div>' +
    '<div class="s1-rain"' + R('s1.rain') + '></div>' +
    '<div class="paper p1"' + R('s1.paper1') + '><div class="paper-hd"><b>BORANG ACD DENGGI</b><span>Lampiran 1 · Rekod Lawatan Rumah</span></div><div class="paper-grid"' + R('s1.paperGrid1') + '></div><div class="dim"' + R('s1.dim1') + '></div></div>' +
    '<div class="paper p2"' + R('s1.paper2') + '><div class="paper-hd"><b>BORANG ACD DENGGI</b><span>Lampiran 1 · Rekod Lawatan Rumah</span></div><div class="paper-grid"' + R('s1.paperGrid2') + '></div><div class="dim"' + R('s1.dim2') + '></div></div>' +
    '<div class="paper p3"' + R('s1.paper3') + '><div class="paper-hd"><b>BORANG ACD DENGGI</b><span>Lampiran 1 · Rekod Lawatan Rumah</span></div><div class="paper-grid"' + R('s1.paperGrid3') + '></div><div class="dim"' + R('s1.dim3') + '></div></div>' +
    '<div class="tally"' + R('s1.tally') + '><div class="tally-hd">Kiraan manual · Pasukan 1–6</div><svg viewBox="0 0 400 420" width="400" height="420"' + R('s1.tallySvg') + '></svg><div class="dim"' + R('s1.dim4') + '></div></div>' +
    '<div class="laptop"' + R('s1.laptop') + '><div class="lap-screen"><div class="lap-bar"><i></i><i></i><i></i><span>Hasil ACD — salin semula daripada borang</span></div><div class="lap-grid"' + R('s1.lapGrid') + '></div></div><div class="lap-base"></div></div>' +
    '<div class="s1-text"' + R('s1.text') + '><span' + R('s1.w1') + '>Borang kertas.</span> <span' + R('s1.w2') + '>Kiraan manual.</span> <span' + R('s1.w3') + '>Entri semula.</span></div>' +
  '</div>';
}

/* ------------------------------------------------------------- Scene 2 set */
function scene2() {
  return '<div class="set s2"' + R('s2') + '>' +
    '<div class="brand"' + R('s2.brand') + '>' +
      '<div class="brand-jata"' + R('s2.jata') + '><img src="' + JATA_SRC + '" alt="Jata Negara"/></div>' +
      '<div class="brand-badge"' + R('s2.badge') + '>PKD Muallim</div>' +
      '<div class="brand-title"' + R('s2.title') + '><span' + R('s2.tw0') + '>Sistem</span> <span' + R('s2.tw1') + '>e-ACD</span><br><span' + R('s2.tw2') + '>Kes</span> <span' + R('s2.tw3') + '>Denggi</span></div>' +
      '<div class="brand-sub"' + R('s2.sub') + '>Pengesanan Kes Aktif</div>' +
    '</div>' +
    '<div class="callout c-loc"' + R('s2.cLoc') + '><div class="co-k">Lokaliti</div><div class="co-v">' + ICON.pin + ' Kg. Ketoyong</div>' +
      '<div class="co-k mt">Titik berkumpul</div><div class="co-v amber">Surau Kg. Ketoyong (Peta)</div></div>' +
    '<div class="callout c-staff"' + R('s2.cStaff') + '><div class="co-big">Keperluan petugas: <b>16 orang</b></div><div class="co-note">Angka perancangan operasi</div>' +
      '<div class="co-teams">' + [1, 2, 3, 4, 5, 6].map(t => '<span class="team-tag t' + t + '"' + R('s2.team' + t) + '>Pasukan ' + t + '</span>').join('') + '</div></div>' +
    '<div class="inset"' + R('s2.inset') + '>' +
      '<div class="inset-title"><span class="inset-ico">' + ICON.addSquare + '</span>Tambah ke Skrin Utama</div>' +
      '<div class="inset-screen">' +
        '<div class="sf-page"><div class="sf-hdr"><img src="' + JATA_SRC + '" alt=""/><div><b>Sistem e-ACD Kes Denggi</b><span>PKD Muallim</span></div></div><div class="sf-lines"><i></i><i></i><i></i><i></i></div></div>' +
        '<div class="sf-address"><span>Pautan Web App e-ACD</span></div>' +
        '<div class="sf-toolbar"><span>' + ICON.chevL + '</span><span>' + ICON.chevR + '</span><span class="sf-share"' + R('s2.share') + '>' + ICON.share + '</span><span>' + ICON.book + '</span><span>' + ICON.tabs + '</span></div>' +
        '<div class="sf-sheet"' + R('s2.sheet') + '><div class="sf-grab"></div><div class="sf-sheet-t">Kongsi</div>' +
          '<div class="sf-row"><span>Salin</span>' + ICON.copy + '</div>' +
          '<div class="sf-row target"' + R('s2.addRow') + '><span>Tambah ke Skrin Utama</span>' + ICON.addSquare + '</div>' +
          '<div class="sf-row"><span>Cari di Halaman</span>' + ICON.search + '</div></div>' +
        '<div class="sf-add"' + R('s2.addDlg') + '><div class="sf-add-bar"><span>Batal</span><b>Tambah ke Skrin Utama</b><span class="sf-add-btn"' + R('s2.addBtn') + '>Tambah</span></div>' +
          '<div class="sf-add-body"><div class="hs-icon app-icon big"><img src="' + JATA_SRC + '" alt=""/></div><div class="sf-add-name">e-ACD Denggi</div></div>' +
          '<p class="sf-add-note">Ikon akan dipaparkan pada skrin utama untuk akses pantas.</p></div>' +
        '<div class="touch"' + R('s2.touch') + '><i class="ripple"' + R('s2.ripple') + '></i></div>' +
      '</div>' +
      '<div class="inset-foot"><b>iPhone (Safari):</b> Kongsi → Tambah ke Skrin Utama<br><b>Android:</b> pelayar boleh memaparkan gesaan pemasangan</div>' +
    '</div>' +
  '</div>';
}

/* ------------------------------------------------------------- overlays */
function overlays() {
  const steps = ['Pilih pasukan', 'Status lawatan', 'Saringan gejala', 'Bahagian C', 'Simpan'];
  return '<div class="ov"' + R('ov') + '>' +
    '<div class="ov-title"' + R('ov.s3title') + '><span class="ov-kicker">Input Rumah (Lampiran 1)</span><span class="ov-h">Status lawatan, saringan gejala<br>dan tindakan lapangan</span></div>' +
    '<div class="ov-steps"' + R('ov.steps') + '>' + steps.map((s, i) => '<div class="ov-step"' + R('ov.step' + i) + '><i>' + (i + 1) + '</i><span>' + s + '</span></div>').join('') + '</div>' +
    '<div class="ov-tag rose"' + R('ov.tagSymp') + '><b>Kes bergejala</b><span>1 orang direkodkan</span></div>' +
    '<div class="ov-tag purple"' + R('ov.tagRef') + '><b>Rujukan</b><span>1 rujukan direkodkan</span></div>' +
    '<div class="ov-recalc"' + R('ov.recalc') + '><div class="rc-k">Pasukan 1 dikira semula</div><div class="rc-v"><span class="tnum"' + R('ov.rcVis') + '>16</span> → <b class="tnum">17</b> dilawati daripada <span class="tnum"' + R('ov.rcLoc') + '>19</span> → <b class="tnum">20</b> premis</div>' +
      '<div class="rc-pct">Liputan pasukan <span class="tnum">84%</span> → <b class="tnum">85%</b></div></div>' +
    '<div class="ov-title s4"' + R('ov.s4title') + '><span class="ov-kicker">Input Pasukan dan Pengesahan</span><span class="ov-h">Dapatan Pasukan<br>1 hingga 6</span></div>' +
    '<div class="ov-big"' + R('ov.cov') + '><span class="ob-k">Liputan ACD</span><span class="ob-v tnum">' + TOTALS.pct + '%</span><span class="ob-r tnum">' + TOTALS.visited + ' / ' + TOTALS.locality + ' premis</span><span class="ob-sim">' + simBadge('') + '</span></div>' +
    '<div class="ov-pill"' + R('ov.capai') + '>' + ICON.check + '<span>Capai Sasaran</span></div>' +
    '<div class="ov-formula"' + R('ov.formula') + '>ROUND(' + TOTALS.visited + ' / ' + TOTALS.locality + ' × 100) = <b>' + TOTALS.pct + '%</b> <span>· sasaran dalam aplikasi: ≥ ' + TARGET_PCT + '%</span></div>' +
    '<div class="ov-beat"' + R('ov.b1') + '><i>1</i><span>Penyelarasan Google Sheets</span></div>' +
    '<div class="ov-beat"' + R('ov.b2') + '><i>2</i><span>Pengesahan Bahagian D</span></div>' +
    '<div class="ov-beat"' + R('ov.b3') + '><i>3</i><span>Ringkasan sedia dikongsi</span></div>' +
    '<div class="ov-csv"' + R('ov.csv') + '><span class="ico">' + ICON.download + '</span><div><b>Muat Turun CSV</b><span>' + esc(CSV_FILENAME) + '</span></div></div>' +
    '<div class="ov-flow"' + R('ov.flow') + '><svg viewBox="0 0 1920 1080" width="1920" height="1080">' +
      '<path class="fl-path" d=""' + R('ov.fp1') + '/><path class="fl-path" d=""' + R('ov.fp2') + '/><path class="fl-path back" d=""' + R('ov.fp3') + '/>' +
      '<g' + R('ov.packets') + '></g></svg></div>' +
    '<div class="ov-verified"' + R('ov.verified') + '>' + ICON.shield + '<div><b>Pengesahan direkodkan</b><span>Nama · Jawatan · Tarikh</span></div></div>' +
    '<div class="s6-benefits"' + R('s6.benefits') + '>' +
      [['doc', 'Borang digital', 'Rekod rumah terus ke Lampiran 1'], ['sigma', 'Kiraan automatik', 'Jumlah & liputan dikira serta-merta'],
       ['shield', 'Pengesahan lapangan', 'Bahagian D: nama, jawatan, tarikh'], ['shareOut', 'Ringkasan sedia dikongsi', 'Salin ke WhatsApp atau muat turun CSV']]
        .map(([ic, h, s], i) => '<div class="bf"' + R('s6.bf' + i) + '><span class="bf-ico">' + ICON[ic] + '</span><b>' + h + '</b><span>' + s + '</span></div>').join('') +
    '</div>' +
    '<div class="s6-lockup"' + R('s6.lockup') + '><div class="lk-jata"><img src="' + JATA_SRC + '" alt="Jata Negara"/></div>' +
      '<div class="lk-title">Sistem e-ACD Kes Denggi</div><div class="lk-line"></div><div class="lk-org">Pejabat Kesihatan Daerah Muallim</div></div>' +
    '<div class="flash"' + R('ov.flash') + '></div>' +
  '</div>';
}

function buildStage() {
  return '' +
    '<div class="bg"' + R('bg') + '><div class="bg-grad"' + R('bg.grad') + '></div><div class="bg-grad"' + R('bg.s1') + '></div><div class="bg-grad"' + R('bg.s6') + '></div><div class="bg-glow g1"' + R('bg.g1') + '></div><div class="bg-glow g2"' + R('bg.g2') + '></div>' +
      '<svg class="bg-grid" viewBox="0 0 1920 1080" width="1920" height="1080"' + R('bg.grid') + '></svg><div class="bg-dust"' + R('bg.dust') + '></div></div>' +
    scene1() +
    '<div class="world"' + R('world') + '>' + desktop() + sheetWindow() + gasNode() + peerDevice() + chatPanel() + phone() + '</div>' +
    scene2() + overlays() +
    '<div class="sub-shade"' + R('subShade') + '></div>' +
    '<div class="subs"' + R('subs') + '><div class="subs-box"' + R('subsBox') + '></div></div>' +
    '<div class="vignette"></div>';
}
