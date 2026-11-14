/* ==========================================================================
 * markup.js — static DOM for the 120-second NADI Muallim film (V3).
 * NADI views follow src/components/Map/OutbreakMap.tsx (floating locality
 * card, map toolbar, legend) and Header.tsx (masthead) of the NADI repo, with
 * synthetic values only. e-ACD views reuse the source app's Tailwind classes.
 * No live URLs, coordinates, spreadsheet IDs or real names appear anywhere.
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
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2A5 5 0 0121.5 19"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.99.99 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/></svg>',
  nav: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-8-8 18-2-8z"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 109-9 9.5 9.5 0 00-6.5 2.7L3 8"/><path d="M3 3v5h5"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12.5l2.2 2.2 4.8-4.8"/></svg>',
  sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.9 4.2A10 10 0 0112 4c7 0 10 8 10 8a17 17 0 01-2.2 3.3M6.6 6.6A17 17 0 002 12s3 8 10 8a10 10 0 005.4-1.6"/><path d="M9.9 9.9a3 3 0 004.2 4.2M3 3l18 18"/></svg>',
  wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.8a15 15 0 0120 0M5 12.6a10.5 10.5 0 0114 0M8.5 16.3a5 5 0 017 0M12 20h.01"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9.5h17M3.5 15h17M9.5 9.5v11"/></svg>',
  sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M15.5 8h-7l4 4-4 4h7"/></svg>',
  phoneIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8.5 11V7.8a3.5 3.5 0 017 0V11"/></svg>',
  paperOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M3 3l18 18"/></svg>',
  cursor: '<svg viewBox="0 0 24 24"><path d="M4 2.5l15.5 10.2-7 1.3 4.2 7.6-3 1.6-4.2-7.7-5.5 4.5z" fill="#0f172a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const R = name => ' data-ref="' + name + '"';
const JATA_SRC = '__JATA__'; // replaced by the build with the Jata Negara PNG embedded in the e-ACD source
const PETA_SRC = '__PETA__'; // V6: replaced by the build with assets/peta-glob.jpg (globe texture, tools/make-map-globe.py)

function simBadge(extra) { return '<div class="sim-badge ' + (extra || '') + '"><span class="sim-dot"></span>DATA SIMULASI</div>'; }
function protoBadge(extra) { return '<div class="proto-badge ' + (extra || '') + '"><span class="proto-dot"></span>PROTOTAIP INTEGRASI</div>'; }

/* ================================================================ NADI window */
function nadiCard() {
  const c = NADI_CARD, T = TOTALS;
  const box = (label, value, sub, cls) => '<div class="bg-[#F8FAFC] border border-[#DDE5EC] rounded-[8px] p-2.5"><span class="text-slate-500 block text-[11px]">' + label + '</span>' +
    '<span class="' + cls + '">' + value + '</span><span class="text-[10px] text-slate-500 mt-0.5 block">' + sub + '</span></div>';
  const kpi = (n, l, ref, cls) => '<div class="na-kpi ' + (cls || '') + '"' + R(ref) + '><span class="na-kpi-n">' + n + '</span><span class="na-kpi-l">' + l + '</span></div>';
  return '<div class="na-card"' + R('na.card') + '>' +
    '<div class="na-card-head border-b border-slate-200 pb-2.5">' +
      '<div class="flex items-center justify-between gap-2">' +
        '<span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-[6px]"><i class="na-ico amber">' + ICON.alert + '</i>' + c.statusLabel + '</span>' +
        '<div class="flex items-center gap-1.5">' + simBadge('na-sim') + '<span class="na-x">×</span></div>' +
      '</div>' +
      '<h3 class="text-[16px] font-bold text-[#102A43] mt-1.5 leading-snug">' + esc(c.name) + '</h3>' +
      '<p class="text-[12px] text-slate-500 mt-0.5">' + esc(c.area) + '</p>' +
    '</div>' +
    '<div class="na-card-body"' + R('na.cardBody') + '><div class="na-card-scroll"' + R('na.cardScroll') + '><div class="space-y-3 pt-3">' +
    '<div class="grid grid-cols-2 gap-2 text-[12px]"' + R('na.grid') + '>' +
      box('Kes Wabak', c.outbreakCases + ' Kes', 'Kategori: WT', 'text-[18px] font-bold text-[#102A43] font-mono tabular-nums mt-0.5 block') +
      box('Jumlah Kes Lokaliti', c.cumulativeCases + ' Kes', 'Kumulatif Keseluruhan 2026', 'text-[18px] font-bold text-[#1E3A8A] font-mono tabular-nums mt-0.5 block') +
      box('Notifikasi Terakhir', c.lastNotification, 'ME ' + c.epidWeek, 'text-[12px] font-bold text-[#102A43] font-mono mt-0.5 block') +
      box('TJT Wabak (+14h)', c.expectedEnd, c.daysSince + 'h sejak notifikasi', 'text-[12px] font-bold font-mono mt-0.5 block text-amber-700') +
    '</div>' +
    /* prototype action: open the ACD operation in e-ACD (00:21–00:24) */
    '<div class="na-open"' + R('na.open') + '><div class="na-open-in"' + R('na.openIn') + '>' +
      '<div class="flex items-center gap-1.5 font-bold text-[#102A43] text-[12px]"><i class="na-ico teal">' + ICON.clipboard + '</i>Operasi ACD · e-ACD Denggi</div>' +
      '<div class="flex flex-wrap gap-1.5 mt-1.5">' + protoBadge() + simBadge() + '</div>' +
      '<div class="text-[11px] text-slate-600 mt-1.5">Pengesanan kes aktif · ' + esc(c.name) + ' · 04-11-2026 · 6 pasukan</div>' +
      '<span class="na-open-btn"' + R('na.openBtn') + '><i class="na-ico">' + ICON.phoneIcon + '</i><span' + R('na.openText') + '>Buka Operasi ACD</span><i class="na-ico">' + ICON.chevR + '</i></span>' +
    '</div></div>' +
    /* e-ACD summary in NADI: integration prototype (01:25–01:45) */
    '<div class="na-proto"' + R('na.proto') + '><div class="na-proto-in"' + R('na.protoIn') + '>' +
      '<div class="flex items-center justify-between gap-2"><span class="font-bold text-[#102A43] text-[12px] flex items-center gap-1.5"><i class="na-ico teal">' + ICON.clipboard + '</i>Ringkasan e-ACD · Operasi 04-11-2026</span></div>' +
      '<div class="flex flex-wrap gap-1.5 mt-1.5">' + protoBadge() + simBadge() + '</div>' +
      '<div class="grid grid-cols-4 gap-1.5 mt-2">' +
        kpi(T.locality, 'Sasaran premis', 'na.kTarget') + kpi(T.visited, 'Dilawati', 'na.kVisited', 'ok') +
        kpi(T.locked, 'Berkunci / kosong', 'na.kLocked', 'warn') + kpi(T.unvisited, 'Belum dilawati', 'na.kLeft', 'left') +
      '</div>' +
      '<div class="text-[11px] text-slate-600 mt-2">Liputan ACD <b class="font-mono text-[#102A43]">' + T.pct + '%</b> (' + T.visited + '/' + T.locality + ') · sasaran KKM ≥ ' + TARGET_PCT + '%</div>' +
      '<div class="na-decision">' +
        '<span class="na-dec-k">Keputusan<br>penyelia</span>' +
        '<span class="na-dec-btn"' + R('na.decBtn') + '><i class="na-ico">' + ICON.calendar + '</i><span' + R('na.decText') + '>Rancang lawatan susulan</span></span>' +
        '<div class="na-planned-wrap"' + R('na.plannedWrap') + '><div class="na-planned"' + R('na.planned') + '><div class="na-planned-h"><i class="na-ico teal">' + ICON.check + '</i>Lawatan susulan dirancang · ' + FOLLOW_UP.length + ' premis</div>' +
          '<div class="na-planned-list">' + FOLLOW_UP.map((p, i) => '<span><b>' + (i + 1) + '</b>' + esc(p) + '</span>').join('') + '</div>' +
          '<div class="na-recheck"' + R('na.recheck') + '><i class="na-ico amber">' + ICON.lock + '</i>Semak semula status · ' + T.locked + ' premis berkunci / kosong</div></div></div>' +
      '</div>' +
    '</div></div>' +
    '<div class="bg-[#F8FAFC] border border-[#DDE5EC] rounded-[8px] p-3 text-[12px] space-y-2">' +
      '<div class="font-bold text-[#102A43] flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="na-ico teal">' + ICON.calendar + '</i>Kawalan Kesihatan Awam</span>' +
      '<span class="text-[11px] font-mono text-[#006B5B] font-semibold">' + c.premisesInspected + ' Premis Diperiksa</span></div>' +
      '<div class="grid grid-cols-2 gap-1.5 font-mono text-[11px]">' +
        [['PTP P1', c.ptpP1], ['PTP P2', c.ptpP2], ['SRT P1', c.srtP1], ['SRT P2', c.srtP2]].map(([k, v]) =>
          '<div class="bg-white border border-[#DDE5EC] rounded-[6px] p-1.5"><span class="text-slate-500 na-sans block text-[10px]">' + k + '</span><span class="font-bold text-[#102A43]">' + v + '</span></div>').join('') +
      '</div></div>' +
    '<div class="pt-3 border-t border-slate-200"><span class="na-ai-btn"><i class="na-ico">' + ICON.sparkles + '</i><span>Analisis Kawalan AI (' + esc(c.name) + ')</span><i class="na-ico">' + ICON.chevR + '</i></span></div>' +
  '</div></div></div>' +
  '</div>';
}

function nadiApp() {
  return '<div class="nadi-app"' + R('na.app') + '>' +
    '<header class="na-head">' +
      '<div class="flex items-center gap-3 min-w-0">' +
        '<div class="na-logo">' + ICON.activity + '</div>' +
        '<div class="min-w-0"><div class="flex items-baseline gap-2"><h1 class="na-title"><span class="text-[#006B5B]">N.A.D.I</span> Muallim</h1></div>' +
        '<p class="na-sub">Notification, Assessment, Decision &amp; Intervention · Survelan &amp; Operasi Denggi</p></div>' +
      '</div>' +
      '<div class="flex items-center gap-3"><span class="na-head-btn amber"><i class="na-ico">' + ICON.eyeOff + '</i>Privasi: Dilindungi</span>' +
        '<span class="na-head-btn"><i class="na-ico teal">' + ICON.wifi + '</i></span><span class="na-div"></span>' +
        '<img class="na-jata" src="' + JATA_SRC + '" alt="Jata Negara"/><div class="leading-tight"><div class="na-pkd1">Pejabat Kesihatan Daerah</div><div class="na-pkd2">Muallim</div></div></div>' +
    '</header>' +
    '<div class="na-toolbar">' +
      '<div class="flex items-center gap-2 flex-wrap">' +
        '<span class="na-select"><i class="na-ico teal">' + ICON.nav + '</i><span class="text-slate-500 font-medium">Pilih:</span><b>[WABAK AKTIF WT] Kg. Ketoyong (' + NADI_CARD.cumulativeCases + ' kes)</b><span class="text-slate-400">▾</span></span>' +
        '<span class="na-btn"><i class="na-ico">' + ICON.rotate + '</i>Pandangan Daerah</span>' +
        '<span class="na-quick-k">Fokus Pantas:</span><span class="na-qbtn">Kg. Ketoyong <span class="font-mono">(' + NADI_CARD.cumulativeCases + ')</span></span>' +
      '</div>' +
      '<div class="na-legend"><b>Petunjuk GIS:</b><span><i class="dot" style="background:#d97706"></i>Wabak Aktif / WT</span><span><i class="dot" style="background:#059669"></i>Wabak Tamat</span>' +
        '<span><i class="dot sq" style="background:#0284c7"></i>Satu Kes</span><span><i class="dot" style="background:#dc2626"></i>WTK / Hotspot</span><span class="na-mode">Mod Paparan: Penanda Kes &amp; Lokaliti</span></div>' +
    '</div>' +
    '<div class="na-map"' + R('na.map') + '><svg class="na-map-svg" viewBox="0 0 1280 556" width="1280" height="556"' + R('na.mapSvg') + '></svg>' +
      '<div class="na-demo-chip"><b>Paparan Demonstrasi</b> · peta ilustrasi, bukan berskala' + simBadge('na-sim') + '</div>' +
      nadiCard() +
      '<div class="cursor"' + R('na.cursor') + '>' + ICON.cursor + '<i class="ripple"' + R('na.ripple') + '></i></div>' +
    '</div>' +
  '</div>';
}

function nadiWindow() {
  return '<div class="actor nadi"' + R('nadi') + '><div class="nadi-win">' +
    '<div class="nw-bar"><span class="dots"><i></i><i></i><i></i></span><span class="nw-tab"><span class="nw-ico">' + ICON.activity + '</span>N.A.D.I Muallim — Survelan &amp; Operasi Denggi</span></div>' +
    nadiApp() +
  '</div></div>';
}

/* ================================================================ e-ACD app pieces */
function appHeader(p, mobile) {
  const btnRow = mobile
    ? '<div class="flex items-center gap-1 shrink-0">' +
        '<span class="w-8 h-8 rounded-lg bg-emerald-600/90 border border-emerald-400/40 text-white flex items-center justify-center shadow-sm">' + ICON.sync + '</span>' +
        '<span class="w-8 h-8 rounded-lg bg-white/15 border border-white/25 text-white flex items-center justify-center">' + ICON.phone + '</span></div>'
    : '<div class="flex items-center gap-1.5 shrink-0">' +
        '<span class="text-xs font-semibold bg-emerald-600/90 text-white px-2.5 py-1.5 rounded-lg border border-emerald-400/40 flex items-center gap-1 shadow-sm">' + ICON.sync + '<span>Selaraskan Sheet</span></span>' +
        '<span class="text-xs font-semibold bg-white/15 text-white px-2.5 py-1.5 rounded-lg border border-white/25 flex items-center gap-1">' + ICON.phone + '<span>Tambah ke Skrin Utama</span></span>' +
        '<span class="text-xs font-semibold bg-rose-500/80 text-white px-2.5 py-1.5 rounded-lg border border-rose-400/30">Set 0</span></div>';
  return '<header class="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-800 text-white shadow-md relative z-30">' +
    '<div class="' + (mobile ? 'px-3 py-2' : 'max-w-5xl mx-auto px-4 py-3') + ' flex items-center justify-between gap-2">' +
      '<div class="flex items-center ' + (mobile ? 'gap-2.5' : 'gap-3') + ' min-w-0">' +
        '<img src="' + JATA_SRC + '" alt="Jata Negara" class="w-10 h-10 object-contain bg-white/95 rounded-lg p-1 shrink-0 shadow-sm" />' +
        '<div class="min-w-0"><div class="flex items-center whitespace-nowrap ' + (mobile ? 'gap-1.5' : 'gap-2') + '">' +
          '<span class="' + (mobile ? 'text-[10px]' : 'text-[11px]') + ' font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">PKD Muallim</span>' +
          '<span class="' + (mobile ? 'text-[10px]' : 'text-[11px]') + ' font-semibold bg-teal-700/80 text-teal-100 px-2 py-0.5 rounded-full border border-teal-500/40 flex items-center gap-1">' +
            '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"' + R(p + 'syncDot') + '></span><span' + R(p + 'syncText') + '>Sistem Aktif</span></span>' +
        '</div><h1 class="' + (mobile ? 'text-[14.5px]' : 'text-lg') + ' font-extrabold tracking-tight truncate mt-0.5">Sistem e-ACD Kes Denggi</h1></div>' +
      '</div>' + btnRow +
    '</div>' +
    '<div class="bg-teal-950/60 border-t border-teal-700/50 ' + (mobile ? 'text-[11px]' : 'text-xs') + ' text-teal-100 relative">' +
      '<div class="' + (mobile ? 'px-3 py-1.5' : 'max-w-5xl mx-auto px-4 py-2') + ' flex flex-wrap items-center justify-between gap-2">' +
        '<div class="flex flex-wrap items-center ' + (mobile ? 'gap-x-3' : 'gap-x-4') + ' gap-y-0.5">' +
          '<span class="font-semibold text-white flex items-center gap-1">' + ICON.pin + '<span>' + esc(META.locality) + '</span></span>' +
          '<span class="text-teal-200">' + esc(META.date) + ' • ' + esc(META.time) + '</span>' +
          '<span class="underline text-amber-300 font-medium flex items-center gap-1"><span>' + esc(META.meetingPoint) + '</span>' + ICON.ext + '</span>' +
        '</div>' +
        (mobile ? simBadge('ph-sim') : '<div class="flex items-center gap-3"><span class="text-[11px] text-amber-300 underline font-medium">Tetapan Sheet</span><span class="text-[11px] text-teal-200 underline">Ubah Info Lokaliti</span></div>') +
      '</div></div>' +
  '</header>';
}

function heroCard(p) {
  return '<div class="bg-gradient-to-br from-teal-800 to-emerald-900 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative"' + R(p + 'hero') + '>' +
    '<div><div class="flex items-center justify-between gap-2">' +
      '<span class="text-xs font-bold uppercase tracking-wider text-teal-200">Pencapaian Liputan ACD</span>' +
      '<span class="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-700 text-teal-100 whitespace-nowrap"' + R(p + 'kpiBadge') + '>Sasaran ≥ 80%</span></div>' +
      '<div class="mt-3 flex items-baseline gap-3"><span class="text-5xl font-extrabold tracking-tight tnum"' + R(p + 'kpiPct') + '>0%</span>' +
      '<span class="text-sm text-teal-200 font-medium tnum"' + R(p + 'kpiRatio') + '>(0 / 0 premis)</span></div>' +
      '<div class="relative mt-3"><div class="w-full bg-teal-950/70 h-3 rounded-full overflow-hidden border border-teal-700/50">' +
        '<div class="bg-amber-400 h-full rounded-full" style="width:0%"' + R(p + 'kpiBar') + '></div></div>' +
        '<div class="target-mark" style="left:80%"' + R(p + 'targetMark') + '><span>Sasaran 80%</span></div></div>' +
    '</div>' +
    '<div class="mt-4 pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-100 gap-2">' +
      '<span>Formula: <code class="text-amber-300 font-mono">ROUND(Dilawati / Lokaliti × 100)</code></span>' +
      '<span class="font-bold whitespace-nowrap tnum"' + R(p + 'kpiTeams') + '>0/6 Pasukan Aktif</span></div>' +
  '</div>';
}

function metricCards(p, cols) {
  const card = (cls, labelCls, label, ref, valCls, unit, unitCls, sub, subCls, extra) =>
    '<div class="bg-white rounded-2xl p-4 shadow-sm border ' + cls + '">' +
      '<span class="text-xs font-semibold ' + labelCls + ' block">' + label + '</span><div class="mt-1 flex items-baseline justify-between">' +
      (extra ? extra : '<span class="text-2xl font-extrabold tnum ' + valCls + '"' + R(p + ref) + '>0</span><span class="text-xs font-medium ' + unitCls + '">' + unit + '</span>') +
      '</div><p class="text-[11px] mt-1 ' + subCls + '">' + sub + '</p></div>';
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

/* Summary table "Jadual Hasil Dapatan ACD Mengikut Pasukan" (source summaryTableBody). */
function summaryTable(p, mobile) {
  const rows = [['locality', 'Jumlah Rumah/Premis dalam Lokaliti'], ['visited', 'Jumlah Rumah/Premis Dilawati'], ['locked', 'Jumlah Rumah/Premis Berkunci / Kosong'],
    ['pop', 'Jumlah Penduduk Diperiksa (ACD)'], ['symp', 'Jumlah Kes Bergejala Dikesan', 'rose'], ['ref', 'Jumlah Rujukan Ke Fasiliti Kesihatan'],
    ['sample', 'Jumlah Sampel Diambil di Lapangan'], ['pct', 'Pencapaian ACD (%)', 'pct']];
  let body = '';
  rows.forEach(([key, label, kind], r) => {
    let cells = '';
    for (let t = 1; t <= 6; t++) {
      const v = kind === 'pct' ? (calcTeamPct(TEAMS[t]) + '%') : TEAMS[t][key];
      cells += '<td class="p-2 text-center tnum ' + (kind === 'pct' ? 'font-extrabold text-teal-900 bg-teal-50/60' : 'text-slate-700') + '"' + R(p + 'tc' + r + '_' + t) + '>' + v + '</td>';
    }
    body += '<tr class="' + (kind === 'pct' ? 'bg-teal-50/80 font-bold border-t-2 border-teal-200' : '') + '"><td class="p-2 pl-3 font-semibold ' + (kind === 'rose' ? 'text-rose-700' : 'text-slate-800') + '">' + label + '</td>' + cells +
      '<td class="p-2 text-center font-extrabold tnum ' + (kind === 'rose' ? 'bg-rose-100 text-rose-800' : 'bg-amber-50 text-slate-950') + '"' + R(p + 'tt' + r) + '>' + (kind === 'pct' ? TOTALS.pct + '%' : TOTALS[key]) + '</td></tr>';
  });
  const buttons = '<div class="flex flex-wrap items-center gap-2' + (mobile ? ' mt-2.5' : '') + '">' +
    '<span class="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"' + R(p + 'btnWa') + '><span>Salin Laporan (WhatsApp)</span></span>' +
    '<span class="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-sm">Muat Turun CSV</span>' +
    '<span class="text-xs font-bold bg-white text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg">Cetak</span></div>';
  return '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative"' + R(p + 'table') + '>' +
    '<div class="p-4 border-b border-slate-200 ' + (mobile ? '' : 'flex items-center justify-between gap-3 ') + 'bg-slate-50"' + R(p + 'tableHead') + '>' +
      '<div><h3 class="text-sm font-extrabold text-slate-900 uppercase">Jadual Hasil Dapatan ACD Mengikut Pasukan</h3>' +
      '<p class="text-xs text-slate-500">Jumlah dan peratusan Pencapaian ACD (%) dikira secara automatik.</p></div>' + buttons + '</div>' +
    '<div class="' + (mobile ? 'overflow-hidden' : '') + '"><table class="' + (mobile ? 'w-[760px]' : 'w-full') + ' text-xs text-left border-collapse"><thead><tr class="bg-teal-900 text-white font-bold text-center">' +
      '<th class="p-2.5 text-left">PERKARA</th>' + [1, 2, 3, 4, 5, 6].map(t => '<th class="p-2"' + R(p + 'th' + t) + '>Pasukan ' + t + '</th>').join('') +
      '<th class="p-2 bg-amber-500 text-slate-950"' + R(p + 'thTot') + '>Jumlah</th></tr></thead><tbody class="divide-y divide-slate-200">' + body + '</tbody></table></div>' +
    '<div class="col-hl"' + R(p + 'colHl') + '></div></div>';
}

/* ---------------------------------------------------------------- phone views */
function phoneDashboard() {
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.dashboard"' + R('ph.vDash') + '>' +
    '<div class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">' +
      '<div class="flex items-center gap-2"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>' +
      '<h2 class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ringkasan Eksekutif & Kiraan Automatik Operasi</h2></div>' +
      '<p class="text-[11px] text-slate-600 mt-0.5">Mengira secara automatik daripada semua 6 pasukan bertugas di lapangan.</p>' +
      '<div class="flex flex-wrap items-center gap-2 mt-2.5"><span class="text-xs font-bold bg-teal-700 text-white px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5"' + R('ph.btnNew') + '>' + ICON.plus + '<span>Rekod Rumah Baharu</span></span>' +
      '<span class="text-xs font-bold bg-slate-800 text-white px-3 py-2 rounded-xl shadow-sm">Isi Jadual Pasukan (1–6)</span></div></div>' +
    heroCard('ph.') + metricCards('ph.', 'grid-cols-2') + summaryTable('ph.', true) +
  '</section>';
}

function phoneBorang() {
  const pills = STATUS_CODES.map(s => '<span class="status-pill py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-300 bg-white text-slate-700 text-center' + (s.code === '6' ? ' col-span-2' : '') + '"' + R('ph.pill' + s.code) + '>' + esc(s.label) + '</span>').join('');
  const chips = SYMPTOMS.map((s, i) => '<span class="symptom-chip text-xs px-2.5 py-1.5 rounded-lg border border-rose-300 bg-white text-rose-900 font-medium"' + R('ph.chip' + i) + '>' + esc(s) + '</span>').join('');
  const rose = ['text-rose-900', 'bg-rose-200 text-rose-900', 'border-rose-300 text-rose-900 bg-white', 'bg-rose-600 text-white'];
  const stepper = (label, ref, val) => '<div><label class="block text-xs font-bold ' + rose[0] + ' mb-1">' + label + '</label><div class="flex items-center">' +
    '<span class="w-10 h-9 rounded-l-xl ' + rose[1] + ' font-bold flex items-center justify-center">-</span>' +
    '<span class="w-full h-9 border-y ' + rose[2] + ' text-center font-bold text-sm flex items-center justify-center tnum"' + R(ref) + '>' + val + '</span>' +
    '<span class="w-10 h-9 rounded-r-xl ' + rose[3] + ' font-bold flex items-center justify-center">+</span></div></div>';
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.borang"' + R('ph.vBorang') + '>' +
    '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 relative">' +
      '<div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4"><div>' +
        '<span class="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Borang Lapangan & Lampiran 1</span>' +
        '<h2 class="text-base font-extrabold text-slate-900 mt-1">Input Lawatan Rumah / Premis Baharu</h2></div>' +
        '<span class="text-[10px] text-slate-500 text-right leading-tight whitespace-nowrap">Terus ke<br>Papan Pemuka</span></div>' +
      '<div class="space-y-4">' +
        '<div class="grid grid-cols-1 gap-3">' +
          '<div class="relative"' + R('ph.teamWrap') + '><label class="block text-xs font-bold text-slate-700 mb-1">Pasukan Bertugas *</label>' +
            '<div class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 flex items-center justify-between"' + R('ph.teamSel') + '><span' + R('ph.teamSelText') + '>Pasukan 2</span><span class="text-slate-400 text-[10px]">▼</span></div>' +
            '<div class="dropdown"' + R('ph.teamDrop') + '>' + [1, 2, 3, 4, 5, 6].map(t => '<div class="dd-item"' + R('ph.dd' + t) + '>Pasukan ' + t + '</div>').join('') + '</div></div>' +
          '<div><label class="block text-xs font-bold text-slate-700 mb-1">Alamat / No. Rumah / Lorong *</label>' +
            '<div class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 flex items-center min-h-[42px]"' + R('ph.addrBox') + '><span' + R('ph.addr') + '></span><span class="caret"' + R('ph.addrCaret') + '></span><span class="text-slate-400"' + R('ph.addrPh') + '>Masukkan No. Rumah / Lorong</span></div></div>' +
        '</div>' +
        '<div' + R('ph.pills') + '><label class="block text-xs font-bold text-slate-700 mb-1.5">Status Lawatan Premis (Kod Lampiran 1) *</label><div class="grid grid-cols-2 gap-2">' + pills + '</div></div>' +
        '<div class="space-y-4 pt-2 border-t border-slate-100">' +
          '<div class="grid grid-cols-1 gap-3">' +
            '<div' + R('ph.occWrap') + '><label class="block text-xs font-bold text-slate-700 mb-1">Bil. Penghuni Diperiksa (Orang)</label><div class="flex items-center">' +
              '<span class="w-11 h-10 rounded-l-xl bg-slate-200 text-slate-800 font-extrabold text-lg flex items-center justify-center">-</span>' +
              '<span class="w-full h-10 border-y border-slate-300 text-center font-bold text-base text-slate-900 flex items-center justify-center tnum"' + R('ph.occ') + '>1</span>' +
              '<span class="w-11 h-10 rounded-r-xl bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center"' + R('ph.occPlus') + '>+</span></div></div>' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">Nama Ketua Rumah / Wakil</label><div class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-400">Nama ketua rumah / wakil</div></div>' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">No. Telefon Ketua Rumah</label><div class="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-400">No. telefon</div></div>' +
          '</div>' +
          '<div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3"' + R('ph.secB') + '>' +
            '<div class="flex items-center justify-between gap-2"><div><span class="text-xs font-extrabold text-rose-950 uppercase block">Bahagian B: Saringan Gejala Denggi</span>' +
              '<span class="block text-[11px] leading-snug text-rose-800">Tandakan jika terdapat penghuni yang mengalami demam atau gejala denggi</span></div>' +
              '<span class="inline-flex items-center shrink-0"><span class="toggle"' + R('ph.toggle') + '><span class="knob"></span></span><span class="ml-2 text-xs font-bold text-rose-900 w-[46px]"' + R('ph.toggleLbl') + '>Tiada</span></span></div>' +
            '<div class="sym-box"' + R('ph.symBox') + '><div class="space-y-3 pt-2 border-t border-rose-200/80"' + R('ph.symInner') + '>' +
              '<div><span class="block text-xs font-bold text-rose-900 mb-1.5">Pilih Gejala Denggi Dikesan (Senarai Borang PKD Muallim):</span><div class="flex flex-wrap gap-1.5">' + chips + '</div></div>' +
              '<div class="grid grid-cols-1 gap-3"><div class="relative"' + R('ph.sympWrap') + '>' + stepper('Bil. Kes Bergejala (Orang)', 'ph.sympCnt', 0) + '</div>' +
              '<div class="relative"' + R('ph.refWrap') + '>' + stepper('Bil. Dirujuk Ke Klinik/KK', 'ph.refCnt', 0) + '</div>' + stepper('Bil. Sampel Diambil', 'ph.sampleCnt', 0) + '</div>' +
              '<div><label class="block text-xs font-bold text-rose-900 mb-1">Catatan Nama & No. Telefon Kes Bergejala</label><div class="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs text-slate-400">Nama pesakit, no. telefon & catatan rujukan</div></div>' +
            '</div></div></div>' +
          '<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"' + R('ph.secC') + '>' +
            '<span class="text-xs font-extrabold text-slate-800 uppercase block">Bahagian C: Status Pemeriksaan Persekitaran & Tindakan</span>' +
            '<div class="grid grid-cols-1 gap-2.5">' +
              '<div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"' + R('ph.cRow0') + '><span class="text-xs font-semibold text-slate-700">1. Takungan Berpotensi Aedes?</span><span class="cbox rose"' + R('ph.cb0') + '>' + ICON.check + '</span></div>' +
              '<div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"' + R('ph.cRow1') + '><span class="text-xs font-semibold text-slate-700">2. Tindakan Abate Diberi?</span><span class="cbox"' + R('ph.cb1') + '>' + ICON.check + '</span></div>' +
              '<div class="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200"' + R('ph.cRow2') + '><span class="text-xs font-semibold text-slate-700">3. Risalah Denggi Diedarkan?</span><span class="cbox"' + R('ph.cb2') + '>' + ICON.check + '</span></div>' +
            '</div>' +
            '<div><label class="block text-xs font-bold text-slate-700 mb-1">Tindakan Lapangan (Lampiran 1)</label><div class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 flex items-center justify-between"' + R('ph.action') + '><span' + R('ph.actionText') + '>Pendidikan Kesihatan</span><span class="text-slate-400 text-[10px]">▼</span></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="pt-2"><div class="w-full bg-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-sm text-center"' + R('ph.saveBtn') + '>+ Simpan Rekod Rumah dan Kira Automatik</div></div>' +
      '</div></div>' +
    '<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"' + R('ph.lamp') + '>' +
      '<div class="p-3.5 border-b border-slate-200 bg-slate-50"><h3 class="text-sm font-bold text-slate-900">Senarai Rekod Lawatan Rumah (Lampiran 1 Borang ACD)</h3><p class="text-xs text-slate-500"' + R('ph.lampSub') + '>Memaparkan 0 rekod rumah dalam Lampiran 1.</p></div>' +
      '<div class="lamp-row"' + R('ph.lampRow') + '>' +
        '<div class="flex items-center gap-2"><span class="text-[11px] font-bold text-slate-500">1</span><span class="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">P1</span><span class="font-semibold text-slate-900 text-xs">' + esc(HOUSE_DEMO.address) + '</span><span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 ml-auto">1 - Dilawati</span></div>' +
        '<div class="flex items-center gap-2 mt-1.5 text-[11px]"><span class="text-slate-600">Penghuni: <b class="text-slate-900">5</b></span><span class="font-bold text-rose-600">1 kes bergejala</span></div>' +
        '<div class="flex flex-wrap gap-1 mt-1.5"><span class="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">Takungan+</span><span class="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">Abate</span><span class="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Risalah</span><span class="text-[11px] text-slate-600 ml-1">Rujuk Klinik Kesihatan</span></div>' +
      '</div><div class="p-4 text-center text-slate-400 text-xs"' + R('ph.lampEmpty') + '>Tiada rekod rumah dimasukkan lagi.</div></div>' +
  '</section>';
}

function phonePasukan() {
  return '<section class="px-3 pt-3 pb-24 space-y-3" data-view="ph.pasukan"' + R('ph.vPasukan') + '>' +
    '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"><span class="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">Input Terus Mengikut Pasukan (1–6)</span>' +
      '<h2 class="text-base font-extrabold text-slate-900 mt-1 leading-snug">Kemasukan Pantas Dapatan Pasukan (Selesai Operasi ACD)</h2><p class="text-xs text-slate-500 mt-0.5">Jumlah dan % Pencapaian ACD dikira automatik.</p></div>' +
    '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3"' + R('ph.secD') + '>' +
      '<div class="border-b border-slate-100 pb-3"><span class="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">Bahagian D Borang ACD</span>' +
      '<h3 class="text-base font-extrabold text-slate-900 mt-1 leading-snug">Pengesahan Pegawai di Lapangan (Peg Epid / PKP / PPKP)</h3><p class="text-xs text-slate-500">Ringkasan rumusan aktiviti lapangan di akhir operasi.</p></div>' +
      '<div class="grid grid-cols-1 gap-2.5">' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1">Nama Pegawai Pengesah</label><div class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm flex items-center min-h-[38px]"' + R('ph.vNameBox') + '><span' + R('ph.vName') + '></span><span class="caret"' + R('ph.vCaret') + '></span><span class="text-slate-400"' + R('ph.vNamePh') + '>Masukkan nama penuh pegawai</span></div></div>' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1">Jawatan Pegawai</label><div class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-[12.5px] font-medium flex items-center justify-between"><span>' + esc(VERIFICATION.officerRole) + '</span><span class="text-slate-400 text-[10px]">▼</span></div></div>' +
        '<div><label class="block text-xs font-bold text-slate-700 mb-1">Tarikh Pengesahan</label><div class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">' + esc(VERIFICATION.date) + '</div></div>' +
      '</div>' +
      '<div class="pt-1 space-y-2.5"><div class="text-xs text-slate-600 leading-snug"' + R('ph.vStatus') + '>Status: <span class="font-bold text-amber-700">Belum Disahkan</span></div>' +
      '<div class="w-full bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm text-center"' + R('ph.vBtn') + '>Sahkan Rumusan Operasi ACD</div></div>' +
    '</div></section>';
}

function phoneApp() {
  const nav = [['ph.nDash', ICON.navDash, 'Papan Pemuka'], ['ph.nBorang', ICON.navHome, 'Input Rumah'], ['ph.nPasukan', ICON.navTeam, 'Pasukan 1–6'], ['ph.nPetugas', ICON.navStaff, 'Petugas']];
  return '<div class="ph-app"' + R('ph.app') + '>' +
    '<div class="ph-statusbar"><span class="tnum">17:05</span><span class="sb-icons"><i></i><i></i><i></i><b></b></span></div>' + appHeader('ph.', true) +
    '<div class="ph-viewport"' + R('ph.viewport') + '><div class="ph-scroll"' + R('ph.scroll') + '>' + phoneDashboard() + phoneBorang() + phonePasukan() + '</div>' +
      '<div class="ph-splash"' + R('ph.splash') + '><img src="' + JATA_SRC + '" alt=""/><b>Operasi ACD</b><span>' + esc(META.locality) + ' · 04/11/2026</span><i>Membuka borang lawatan…</i></div></div>' +
    '<nav class="ph-nav"><div class="grid grid-cols-4 h-16">' + nav.map(([ref, icon, label]) => '<span class="flex flex-col items-center justify-center gap-0.5 text-slate-500 font-medium"' + R(ref) + '>' + icon + '<span class="text-[11px]">' + label + '</span></span>').join('') + '</div><div class="home-ind"></div></nav>' +
    '<div class="toast"' + R('ph.toast') + '><span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span><span' + R('ph.toastText') + '>Berjaya disimpan</span></div>' +
  '</div>';
}

function phone() {
  return '<div class="actor phone"' + R('phone') + '><div class="phone-back"></div><div class="phone-frame"><div class="phone-screen"' + R('ph.screen') + '>' +
    phoneApp() +
    '<div class="island"></div><div class="glass"' + R('ph.glass') + '></div><div class="touch"' + R('ph.touch') + '><i class="ripple"' + R('ph.ripple') + '></i></div>' +
  '</div></div><span class="pbtn b1"></span><span class="pbtn b2"></span><span class="pbtn b3"></span></div>';
}

/* ---------------------------------------------------------------- charts from the 90-second film */
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
  let lg = '', lx;
  const widths = items.map(([l]) => 18 + l.length * 6.1 + 12);
  lx = (W - widths.reduce((a, b) => a + b, 0)) / 2;
  const ly = H - 12;
  items.forEach(([label, c], i) => {
    lg += '<rect x="' + lx + '" y="' + (ly - 10) + '" width="12" height="12" fill="' + c + '"/><text x="' + (lx + 17) + '" y="' + ly + '" font-size="11" fill="#475569">' + label + '</text>';
    lx += widths[i];
  });
  return '<svg class="chart-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"' + R(p + 'donutSvg') + ' data-geo="' + [cx, cy, r, r * 0.64].join(',') + '">' +
    '<path fill="#0d9488" stroke="#fff" stroke-width="2" d=""' + R(p + 'arc0') + '/>' +
    '<path fill="#f59e0b" stroke="#fff" stroke-width="2" d=""' + R(p + 'arc1') + '/>' +
    '<path fill="#cbd5e1" stroke="#fff" stroke-width="2" d=""' + R(p + 'arc2') + '/>' + lg + '</svg>';
}

/* ---------------------------------------------------------------- desktop e-ACD dashboard */
function desktop() {
  const tabs = ['1. Papan Pemuka Hasil ACD', '2. Input Rumah (Lampiran 1)', '3. Input Pasukan dan Pengesahan', '4. Senarai Petugas (15/' + META.requiredStaff + ')'];
  return '<div class="actor desktop"' + R('desktop') + '><div class="monitor"><div class="monitor-screen">' +
      '<div class="win-bar"><span class="dots"><i></i><i></i><i></i></span><span class="win-tab"><img src="' + JATA_SRC + '" alt=""/>Sistem e-ACD Denggi — PKD Muallim</span>' + simBadge('dk-sim') + '</div>' +
      '<div class="dk-app"' + R('dk.app') + '>' + appHeader('dk.', false) +
        '<div class="dk-viewport"' + R('dk.viewport') + '><div class="dk-scroll"' + R('dk.scroll') + '>' +
          '<nav class="max-w-5xl mx-auto px-4 pt-3"><div class="bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 grid grid-cols-4 gap-1.5">' +
            tabs.map((l, i) => '<span class="py-2.5 px-3 rounded-lg text-sm font-bold flex items-center justify-center text-center ' + (i === 0 ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-600') + '">' + l + '</span>').join('') + '</div></nav>' +
          '<main class="max-w-5xl mx-auto px-4 py-4 space-y-4">' +
            '<div class="grid grid-cols-3 gap-4"' + R('dk.heroRow') + '>' + heroCard('dk.') + '<div class="col-span-2">' + metricCards('dk.', 'grid-cols-3') + '</div></div>' +
            '<div class="grid grid-cols-3 gap-4"' + R('dk.charts') + '>' +
              '<div class="col-span-2 bg-white rounded-2xl p-4 shadow-sm border border-slate-200"><div class="mb-2"><h3 class="text-sm font-bold text-slate-800">Prestasi Dapatan Mengikut Pasukan (Pasukan 1 – 6)</h3>' +
              '<p class="text-xs text-slate-500">Perbandingan Rumah Dalam Lokaliti, Dilawati &amp; Berkunci/Kosong</p></div>' + barChartSvg('dk.', 638, 256) + '</div>' +
              '<div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"><div class="mb-2"><h3 class="text-sm font-bold text-slate-800">Pecahan Status Premis</h3>' +
              '<p class="text-xs text-slate-500">Dilawati, berkunci/kosong dan belum dilawati</p></div>' + doughnutSvg('dk.', 296, 256) + '</div>' +
            '</div>' +
            summaryTable('dk.', false) +
          '</main></div></div>' +
      '</div></div><div class="monitor-glass"></div></div><div class="stand-neck"></div><div class="stand-base"></div></div>';
}

/* ---------------------------------------------------------------- simulated Google Sheets write */
/* Range and layout follow the supplied Apps Script: tab 'Hasil ACD', C8:H13 = rows 8–13
 * (locality, visited, locked, pop, symp, ref) × columns C–H (Pasukan 1–6); I = Jumlah and
 * row 14 = % are sheet formulas. The values shown before the write are the pre-save state. */
function sheetWindow() {
  const labels = ['Jumlah Rumah/Premis dalam Lokaliti', 'Jumlah Rumah/Premis Dilawati', 'Jumlah Rumah/Premis Berkunci / Kosong',
    'Jumlah Penduduk Diperiksa (ACD)', 'Jumlah Kes Bergejala Dikesan', 'Jumlah Rujukan Ke Fasiliti Kesihatan', 'Pencapaian ACD (%)'];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  let h = '<div class="sh-row sh-colhdr"><div class="sh-rn"></div>' + cols.map(c => '<div class="sh-c sh-' + c + '">' + c + '</div>').join('') + '</div>';
  h += '<div class="sh-row"><div class="sh-rn">7</div><div class="sh-c sh-A"></div><div class="sh-c sh-B hdr">PERKARA</div>' +
    [1, 2, 3, 4, 5, 6].map(t => '<div class="sh-c hdr">Pasukan ' + t + '</div>').join('') + '<div class="sh-c hdr tot">Jumlah</div></div>';
  for (let r = 0; r < 7; r++) {
    let cells = '';
    for (let t = 1; t <= 6; t++) cells += '<div class="sh-c num' + (r < 6 ? ' data' : ' pct') + '"' + R('sh.c' + r + '_' + t) + '><span></span></div>';
    h += '<div class="sh-row' + (r === 6 ? ' pctrow' : '') + '"><div class="sh-rn">' + (8 + r) + '</div><div class="sh-c sh-A"></div><div class="sh-c sh-B">' + labels[r] + '</div>' + cells +
      '<div class="sh-c num tot"' + R('sh.tot' + r) + '><span></span></div></div>';
  }
  return '<div class="actor sheet"' + R('sheet') + '>' +
    '<div class="sh-title"><span class="sh-ico">' + ICON.grid + '</span><div><div class="sh-name">ACD Denggi Kg. Ketoyong</div><div class="sh-sub">Google Sheets · paparan simulasi</div></div>' + simBadge('sh-sim') + '</div>' +
    '<div class="sh-fx"><span class="sh-range">Hasil ACD!C8:H13</span><span class="sh-fxl">fx</span><span class="sh-fxv">saveAcdDataFromApp → setValues()</span></div>' +
    '<div class="sh-grid"' + R('sh.grid') + '>' + h + '<div class="sh-sel"' + R('sh.sel') + '></div></div>' +
    '<div class="sh-tabs"><span class="sh-tab on">Hasil ACD</span><span class="sh-tab">Pencalonan Petugas</span><span class="sh-tab">Lampiran 1 (Rekod Rumah)</span></div>' +
  '</div>';
}
function gasNode() {
  return '<div class="actor gas"' + R('gas') + '>' +
    '<div class="gas-head"><span class="gas-ico">' + ICON.code + '</span><div><div class="gas-t">Google Apps Script</div><div class="gas-s">Code.gs · simulasi tulis sehala</div></div></div>' +
    '<div class="gas-fn"' + R('gas.save') + '><b>saveAcdDataFromApp</b>(payload)<em>tulis</em></div>' +
    '<div class="gas-note">Berjaya hanya apabila sambungan tersedia</div>' +
  '</div>';
}

/* ---------------------------------------------------------------- 00:00–00:04 dark illustrative map (90-second film) */
function opening() {
  return '<div class="set s-open"' + R('op') + '>' +
    '<div class="op-map"' + R('op.map') + '><svg viewBox="0 0 1920 1080" width="1920" height="1080"' + R('op.mapSvg') + '></svg>' +
      '<div class="map-district"' + R('op.district') + '>Daerah Muallim</div>' +
      '<div class="map-pin"' + R('op.pin') + '><div class="pin-ring"' + R('op.pinRing') + '></div><div class="pin-head"></div>' +
        '<div class="pin-label"' + R('op.pinLabel') + '>' + ICON.pin + '<span>Kg. Ketoyong</span></div></div>' +
    '</div>' +
    '<div class="s1-rain"' + R('op.rain') + '></div>' +
    '<div class="map-chip"' + R('op.chip') + '><span>Peta ilustrasi · bukan berskala</span>' + simBadge() + '</div>' +
    '<div class="op-q"' + R('op.q') + '><span class="op-q-k">Soalan penyelia</span><span class="op-q-h">Premis mana yang masih<br>perlu dilawati?</span></div>' +
  '</div>';
}

/* ---------------------------------------------------------------- manual composition (00:04–00:13) */
/* ---------------------------------------------------------------- V5 · 00:00–00:06.5 opening flow chart
 * notification received → rise in cases → outbreak declared → active case detection (ACD) */
const FLOW_ICON = {
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  house: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>'
};
const FLOW_X = i => 135 + i * 430, FLOW_Y = 420;
function flowSet() {
  const fx = [
    '<div class="fx-note"' + R('fc.note') + '><i></i><span>1 notifikasi baharu</span></div>',
    '<div class="fx-bars">' + [0, 1, 2, 3, 4].map(i => '<i' + R('fc.bar' + i) + '></i>').join('') + '</div>',
    '<div class="fx-stamp"' + R('fc.stamp') + '>WABAK</div>',
    '<div class="fx-houses">' + [0, 1, 2, 3].map(i => '<span' + R('fc.h' + i) + '>' + FLOW_ICON.house + '<em>' + ICON.check + '</em></span>').join('') + '</div>'
  ];
  const node = (s, i) => '<div class="fc-node ' + s.tone + '" style="left:' + FLOW_X(i) + 'px;top:' + FLOW_Y + 'px"' + R('fc.n' + i) + '>' +
    '<div class="fc-top"><span class="fc-num">' + (i + 1) + '</span><span class="fc-ico"' + (i === 0 ? R('fc.bell') : '') + '>' + FLOW_ICON[s.icon] + (i === 0 ? '<i class="fc-dot"' + R('fc.badge') + '>1</i>' : '') + '</span></div>' +
    '<b class="fc-t">' + esc(s.title) + '</b><span class="fc-s">' + esc(s.sub) + '</span><div class="fc-fx">' + fx[i] + '</div></div>';
  let arrows = '';
  for (let i = 0; i < 3; i++) {
    const x0 = FLOW_X(i) + 368, x1 = FLOW_X(i + 1) - 14, y = FLOW_Y + 150;
    arrows += '<path d="M' + x0 + ' ' + y + ' H' + x1 + '" fill="none" stroke="#5eead4" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"' + R('fc.a' + i) + '/>' +
      '<path d="M' + (x1 - 2) + ' ' + (y - 11) + ' L' + (x1 + 12) + ' ' + y + ' L' + (x1 - 2) + ' ' + (y + 11) + 'z" fill="#5eead4" opacity="0"' + R('fc.ah' + i) + '/>';
  }
  // V6: the satellite map (Google Maps imagery, interface removed) as a globe drawn by engine.js (WebGL),
  // with the 200 m ACD radius round Kg. Ketoyong; the <img> is the texture source and the no-WebGL fallback
  return '<div class="set s-flow"' + R('fc') + '>' +
    '<div class="fc-map"' + R('fc.map') + '><canvas class="fc-globe" width="1320" height="960"' + R('fc.globe') + '></canvas>' +
    '<div class="fc-globe-fb"' + R('fc.globeFb') + '><img src="' + PETA_SRC + '" alt=""' + R('fc.globeImg') + '/></div>' +
    '<div class="fc-zlabel"' + R('fc.zlabel') + '><i></i><span>Kg. Ketoyong · radius 200 m</span></div></div>' +
    '<div class="fc-veil"' + R('fc.veil') + '></div>' +
    '<div class="fc-credit"' + R('fc.credit') + '>Imejan ©2026 Airbus, CNES / Airbus, Maxar Technologies · Data peta ©2026 Google</div>' +
    '<div class="fc-head"' + R('fc.head') + '><span>Aliran tindakan wabak denggi</span><b>Dari notifikasi kepada ACD</b></div>' +
    '<svg class="fc-arrows" viewBox="0 0 1920 1080" width="1920" height="1080">' + arrows + '</svg>' +
    FLOW_STEPS.map(node).join('') + '</div>';
}

/* ---------------------------------------------------------------- V4: paper Borang ACD + Lampiran 1
 * Layout of the PKD Muallim forms (kit PDFs). Handwriting (Caveat) is revealed by the engine;
 * entries are fictional (data.js PAPER_FORM / PAPER_ROWS). */
const hw = (ref, text, cls) => '<span class="hw' + (cls ? ' ' + cls : '') + '"' + R(ref) + '>' + esc(text) + '</span>';
const TICK_SVG = ref => '<svg class="tick" viewBox="0 0 16 14" width="16" height="14"><path d="M2 7.6 L6.2 11.6 L14.6 1.6" fill="none" stroke="#1d3a8a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"' + R(ref) + '/></svg>';
function acdForm() {
  const A = PAPER_FORM;
  const envQ = ['Ada takungan air berpotensi pembiakan Aedes?', 'Tindakan Abate (Ubat Jentik-jentik) diberi?', 'Risalah Pendidikan Kesihatan Denggi diedarkan?'];
  const sumL = [['Jumlah Rumah/Premis dalam Lokaliti:', 'buah'], ['Jumlah Rumah/Premis Dilawati:', 'buah'], ['Jumlah Rumah/Premis Berkunci / Kosong:', 'buah'],
    ['Jumlah Penduduk Diperiksa (ACD):', 'orang'], ['Jumlah Kes Bergejala Dikesan:', 'orang'], ['Jumlah Rujukan Ke Fasiliti Kesihatan:', 'orang'],
    ['Jumlah Sampel Diambil di Lapangan (jika berkaitan):', 'sampel']];
  return '<div class="paper acd-form"' + R('man.paper') + '>' +
    '<div class="af-jata"><img src="' + JATA_SRC + '" alt=""/></div>' +
    '<div class="af-pkd">PEJABAT KESIHATAN DAERAH MUALLIM</div>' +
    '<div class="af-title">PEJABAT KESIHATAN DAERAH MUALLIM BORANG PENGESANAN KES AKTIF (ACTIVE CASE DETECTION - ACD) DENGGI</div>' +
    '<div class="af-h">BAHAGIAN A: MAKLUMAT LOKALITI &amp; SIASATAN</div>' +
    '<table class="af-a"><tr><td class="k">TARIKH</td><td colspan="2">' + hw('man.f0', A.tarikh) + '</td></tr>' +
      '<tr><td class="k">MASA</td><td colspan="2">' + hw('man.f1', A.masa) + '</td></tr>' +
      '<tr class="tall"><td class="k">LOKALITI/<br>TAMAN/KG</td><td colspan="2">' + hw('man.f2', A.lokaliti) + '</td></tr>' +
      '<tr><td class="k" rowspan="3">NAMA<br>ANGGOTA/NO TEL</td><td>' + hw('man.f3', A.petugas[0]) + '</td><td></td></tr>' +
      '<tr><td>' + hw('man.f4', A.petugas[1]) + '</td><td></td></tr>' +
      '<tr><td>' + hw('man.f5', A.petugas[2]) + '</td><td></td></tr></table>' +
    '<div class="af-h">BAHAGIAN B: MAKLUMAT ISI RUMAH &amp; SARINGAN GEJALA DENGGI<i>(Senarai Gejala Denggi: Demam panas mengejut, Sakit kepala teruk, Sakit di belakang mata, Sakit sendi/tulang/otot, Ruam bintik merah, Loya/muntah, Pendarahan gusi/hidung, Sakit perut teruk) rujuk <b>Lampiran 1</b></i></div>' +
    '<div class="af-h">BAHAGIAN C: STATUS PEMERIKSAAN PERSEKITARAN</div>' +
    '<ul class="af-c">' + envQ.map((q, i) => '<li>' + q + ' <span class="cb">[' + TICK_SVG('man.fc' + i) + ']</span> Ya <span class="cb">[<i class="sp"></i>]</span> Tidak</li>').join('') + '</ul>' +
    '<div class="af-h">BAHAGIAN D: PENGESAHAN PEGAWAI DI LAPANGAN <i>(Peg Epid/ PKP/ PPKP)</i></div>' +
    '<div class="af-d0">Ringkasan Rumusan Aktiviti Lapangan (Diisi di akhir operasi)</div>' +
    '<ol class="af-d">' + sumL.map(([k, u]) => '<li><b>' + k + '</b> ________ ' + u + '</li>').join('') + '</ol>' +
    '<div class="af-sig"><b>Diterima oleh:</b><i>(Tandatangan &amp; Nama Pegawai Lapangan) :</i><span>Tarikh:</span></div>' +
    '<div class="dim"' + R('man.dim0') + '></div></div>';
}
function lampForm() {
  const hd = ['Bil', 'Alamat / No. Rumah', 'Status<br>Lawatan<br>1-dilawati<br>2-<br>berkunci<br>3-kosong<br>4-enggan<br>6-tanah/l<br>ot kosong', 'Bil.<br>Penghuni',
    'Nama dan no telefon ketua rumah/<br>wakil penghuni', 'Catatan Nama &amp; No telefon<br>(Kes Bergejala)', 'Tindakan<br>Lapangan<br>(Rujuk Klinik /<br>Ambil Sampel /<br>Pendidikan<br>Kesihatan)'];
  let h = '<div class="paper lamp-form"' + R('man.paper2') + '><div class="lp-top">LAMPIRAN 1</div><table class="lp"><colgroup>' +
    [3.4, 20.6, 7.6, 7.3, 24.8, 23.9, 12.4].map(w => '<col style="width:' + w + '%">').join('') + '</colgroup>' +
    '<tr>' + hd.map(x => '<th>' + x + '</th>').join('') + '</tr>';
  PAPER_ROWS.forEach((r, i) => {
    const sq = k => '<svg class="sq" viewBox="0 0 160 26" width="160" height="26"' + R('man.l' + i + '_' + k) + '></svg>';
    h += '<tr><td class="bil">' + (i + 1) + '</td><td>' + hw('man.l' + i + '_0', r.alamat) + '</td><td class="c">' + hw('man.l' + i + '_1', r.status) + '</td>' +
      '<td class="c">' + hw('man.l' + i + '_2', r.penghuni) + '</td><td>' + (r.nama ? sq(3) : '') + '</td><td>' + (r.kes ? sq(4) : '') + '</td>' +
      '<td>' + hw('man.l' + i + '_5', r.tindakan, 'sm') + '</td></tr>';
  });
  return h + '</table><div class="dim"' + R('man.dim4') + '></div></div>';
}
function manualSet() {
  return '<div class="set s-man"' + R('man') + '>' +
    '<div class="binder"' + R('man.binder') + '><div class="binder-spine"></div><div class="binder-label"><b>FAIL REKOD ACD</b><span>Kg. Ketoyong · 04/11/2026</span></div><div class="binder-tabs"><i></i><i></i><i></i><i></i></div><div class="dim"' + R('man.dim1') + '></div></div>' +
    lampForm() + acdForm() +
    '<div class="tally"' + R('man.tally') + '><div class="tally-hd">Kiraan manual · Pasukan 1–6</div><svg viewBox="0 0 400 420" width="400" height="420"' + R('man.tallySvg') + '></svg><div class="dim"' + R('man.dim2') + '></div></div>' +
    '<div class="laptop"' + R('man.laptop') + '><div class="lap-screen"><div class="lap-bar"><i></i><i></i><i></i><span>Hasil ACD — taip semula daripada borang</span></div><div class="lap-grid"' + R('man.lapGrid') + '></div></div><div class="lap-base"></div><div class="dim"' + R('man.dim3') + '></div></div>' +
    ['Borang ACD + Lampiran 1', 'Fail rekod', 'Kiraan manual', 'Taip semula'].map((s, i) => '<div class="man-tag"' + R('man.tag' + i) + '>' + s + '</div>').join('') +
  '</div>';
}

/* ---------------------------------------------------------------- overlays */
function overlays() {
  const rec = [['Pasukan dan alamat premis', 'Pasukan 1 · ' + HOUSE_DEMO.address, ''], ['Status lawatan', 'Status: 1 - Dilawati · 5 penghuni diperiksa', ''],
    ['Saringan gejala (Bahagian B)', '1 individu bergejala · 1 dirujuk ke klinik', 'rose'], ['Pemeriksaan persekitaran (Bahagian C)', 'Takungan Aedes · Abate · risalah', ''],
    ['Tindakan lapangan', 'Tindakan: Rujuk Klinik Kesihatan', '']];
  const sum = [['Lokaliti', META.locality + ' · 04/11/2026'], ['Premis dilawati', TOTALS.visited + ' / ' + TOTALS.locality + ' (' + TOTALS.pct + '%)'],
    ['Berkunci / kosong', TOTALS.locked + ' premis'], ['Saringan ACD', TOTALS.pop + ' diperiksa · ' + TOTALS.symp + ' bergejala · ' + TOTALS.ref + ' dirujuk'],
    ['Pengesahan', VERIFICATION.officerName + ' (PPKP)']];
  return '<div class="ov"' + R('ov') + '>' +
    '<div class="scrim"' + R('ov.scrim') + '></div>' +
    '<div class="bloom"' + R('ov.bloom') + '></div>' +
    '<div class="sys-tag"' + R('ov.sys') + '><span class="sys-name"' + R('ov.sysName') + '>NADI Muallim</span><span class="sys-view"' + R('ov.sysView') + '>Peta lokaliti</span>' + simBadge('sys-sim') + '</div>' +
    '<div class="opener"' + R('ov.title') + '><div class="cl-jata"><img src="' + JATA_SRC + '" alt="Jata Negara"/></div>' +
      '<div class="cl-title"><span class="cl-nadi">NADI</span> Muallim</div><div class="cl-tag">Dari Survelan ke Respons Denggi</div></div>' +
    '<div class="ov-one"' + R('ov.one') + '><span class="ov-one-h">Cukup satu telefon<br>untuk rekod ACD</span></div>' +
    '<div class="ov-rec"' + R('ov.rec') + '><div class="rec-k"><span>Rekod premis contoh · Lampiran 1</span><em' + R('ov.recSaved') + '>Disimpan</em></div>' +
      rec.map(([ph, v, c], i) => '<div class="rec-line ' + c + '"' + R('ov.rl' + i) + '><i>' + ICON.check + '</i><span class="rl-ph"' + R('ov.rlp' + i) + '>' + esc(ph) + '</span><span class="rl-v"' + R('ov.rlv' + i) + '>' + esc(v) + '</span></div>').join('') + '</div>' +
    '<div class="ov-saved"' + R('ov.saved') + '><div class="sv-ico">' + ICON.check + '</div><div><b>Rekod disimpan</b><span>Pasukan 1 kini <em class="tnum"' + R('ov.savedCount') + '>16 / 19</em> premis dilawati</span></div></div>' +
    '<div class="ov-sync"' + R('ov.sync') + '><span class="sy-ico">' + ICON.sync + '</span><div><b>Dapatan diselaraskan apabila sambungan tersedia</b><span>Simulasi tulisan ke Google Sheets · tiada sambungan langsung dalam demo</span></div></div>' +
    '<div class="ov-flow"' + R('ov.flow') + '><svg viewBox="0 0 1920 1080" width="1920" height="1080"><defs><marker id="flArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5eead4"/></marker></defs>' +
      '<path class="fl-path" d="" marker-end="url(#flArrow)"' + R('ov.fp1') + '/><path class="fl-path" d="" marker-end="url(#flArrow)"' + R('ov.fp2') + '/><g' + R('ov.packets') + '></g></svg></div>' +
    '<div class="ov-big"' + R('ov.res') + '><span class="ob-k">Liputan ACD · agregat 6 pasukan</span><span class="ob-v tnum">' + TOTALS.pct + '%</span>' +
      '<span class="ob-r"><b class="tnum">' + TOTALS.visited + '</b> daripada <b class="tnum">' + TOTALS.locality + '</b> premis dilawati</span><span class="ob-sim">' + simBadge() + '</span></div>' +
    '<div class="ov-pill"' + R('ov.capai') + '>' + ICON.check + '<span>Capai Sasaran</span><i class="pill-shine"' + R('ov.capaiShine') + '></i></div>' +
    '<div class="ov-formula"' + R('ov.formula') + '>ROUND(' + TOTALS.visited + ' / ' + TOTALS.locality + ' × 100) = <b>' + TOTALS.pct + '%</b> <span>· sasaran KKM: ≥ ' + TARGET_PCT + '%</span></div>' +
    // V7: coverage of each team (calcTeamPct of the same simulated records), against the KKM line, full 0–100% scale
    '<div class="ov-teams"' + R('ov.teams') + '><div class="ot-k"><b>Liputan setiap pasukan</b><span>- - - sasaran KKM ' + TARGET_PCT + '%</span></div>' +
      '<div class="ot-vals">' + [1, 2, 3, 4, 5, 6].map((t, i) => '<em class="tnum"' + R('ov.tv' + i) + '>' + calcTeamPct(TEAMS[t]) + '%</em>').join('') + '</div>' +
      '<div class="ot-area"><i class="ot-line"' + R('ov.tline') + '></i>' + [0, 1, 2, 3, 4, 5].map(i => '<div class="ot-col"><i' + R('ov.tb' + i) + '></i></div>').join('') + '</div>' +
      '<div class="ot-names">' + [1, 2, 3, 4, 5, 6].map(t => '<span>P' + t + '</span>').join('') + '</div></div>' +
    '<div class="ov-ver"' + R('ov.ver') + '>' + ICON.shield + '<div><b>Pengesahan direkodkan</b><span>' + esc(VERIFICATION.officerName) + ' · PPKP · ' + esc(VERIFICATION.date) + '</span></div></div>' +
    '<div class="ov-summary"' + R('ov.summary') + '><div class="sm-k"><span>Ringkasan sedia dikongsi</span>' + simBadge() + '</div>' +
      '<div class="sm-t">LAPORAN RINGKASAN ACD DENGGI · PKD MUALLIM</div>' +
      sum.map(([k, v]) => '<div class="sm-row"><span>' + esc(k) + '</span><b>' + esc(v) + '</b></div>').join('') +
      '<div class="sm-note">Sedia disalin ke WhatsApp pasukan (simulasi)</div></div>' +
    '<div class="ov-fu"' + R('ov.left') + '><div class="fu-badges">' + protoBadge() + simBadge() + '</div>' +
      '<div class="fu-q"' + R('ov.fq') + '><span>Soalan penyelia</span><b>Premis mana yang masih<br>perlu dilawati?</b></div>' +
      '<div class="fu-tree"><svg class="fu-lines" viewBox="0 0 620 490" width="620" height="490">' +
        ['M310 100 V135 H95 V170', 'M310 100 V170', 'M310 100 V135 H525 V170', 'M310 290 V335 H250 V380', 'M525 290 V335 H507 V380'].map((d, i) =>
          '<path d="' + d + '" fill="none" stroke="#5eead4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"' + R('ov.fl' + i) + '/>').join('') + '</svg>' +
        '<div class="fu-n total"' + R('ov.f110') + '><b class="tnum">' + TOTALS.locality + '</b><span>premis dalam lokaliti</span></div>' +
        '<div class="fu-n ok"' + R('ov.f92') + '><b class="tnum">' + TOTALS.visited + '</b><span>dilawati</span></div>' +
        '<div class="fu-n warn"' + R('ov.lf12') + '><b class="tnum">' + TOTALS.locked + '</b><span>berkunci / kosong</span></div>' +
        '<div class="fu-n bad"' + R('ov.f6') + '><b class="tnum">' + TOTALS.unvisited + '</b><span>belum dilawati</span></div>' +
        '<div class="fu-a recheck"' + R('ov.recheck') + '>' + ICON.lock + '<span>Semak semula status<br><b>' + TOTALS.locked + ' premis</b></span></div>' +
        '<div class="fu-a plan"' + R('ov.dec') + '>' + ICON.calendar + '<span>Rancang lawatan susulan<br><b>' + TOTALS.unvisited + ' premis</b></span></div>' +
      '</div></div>' +
    '<div class="bf-row"' + R('ov.bfRow') + '>' + BENEFITS.map((b, i) => '<div class="bf"' + R('ov.bf' + i) + '><span class="bf-ico">' + ICON[b.icon] + '</span><b>' + esc(b.title) + '</b><span>' + esc(b.text) + '</span>' +
      (b.proto ? protoBadge('bf-proto') : '') + '</div>').join('') + '</div>' +
    '<div class="closing"' + R('ov.closing') + '><div class="cl-jata"><img src="' + JATA_SRC + '" alt="Jata Negara"/></div>' +
      '<div class="cl-title"><span class="cl-nadi">NADI</span> Muallim</div><div class="cl-tag">Dari Survelan ke Respons Denggi</div><div class="cl-line"></div><div class="cl-org">Pejabat Kesihatan Daerah Muallim</div></div>' +
    '<div class="dip"' + R('ov.dip') + '></div>' +
  '</div>';
}

/* ---------------------------------------------------------------- V6: sharing the report to WhatsApp (2D)
 * One flat phone: the e-ACD dashboard's "Salin Laporan (WhatsApp)" (source button and toast), then a
 * WhatsApp-style group chat where the copied report is pasted and sent, then a close-up of the message.
 * Group name and members are roles only; the message is buildWhatsappSummary() of the film's simulated
 * totals; emoji are small SVG icons. Everything is local markup: no messaging service is involved. */
const WA_ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5L7.5 12l7.5 7.5"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="3.2"/><path d="M15.5 10.4l5.8-3.3v9.8l-5.8-3.3z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4.5v15M4.5 12h15"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M3.5 8h3.2l1.9-2.8h6.8L17.3 8h3.2v11h-17z"/><circle cx="12" cy="13.2" r="3.6"/></svg>',
  sticker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M20.5 13.5V6a2.5 2.5 0 00-2.5-2.5H6A2.5 2.5 0 003.5 6v12A2.5 2.5 0 006 20.5h7.5z"/><path d="M13.5 20.5v-4.5a2.5 2.5 0 012.5-2.5h4.5"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11.5" rx="3" fill="currentColor" stroke="none"/><path d="M5.8 11.5a6.2 6.2 0 0012.4 0M12 17.8V21"/></svg>',
  ticks: '<svg viewBox="0 0 18 11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6.2l3.1 3.1L10.7 2.2"/><path d="M7.4 9.3l6.9-7.1"/><path d="M6.6 8.4l.8.9"/></svg>',
  thumb: '<svg viewBox="0 0 24 24"><path d="M2.5 10.5h3.2v10H2.5z" fill="#f2b33d"/><path d="M7.2 10.6l4.6-7.1c.9-.6 2.3.1 2.3 1.4l-.7 4.3h5.1c1.3 0 2.3 1.2 2 2.5l-1.6 7.2c-.2 1-1.1 1.7-2.1 1.7H8.8c-.9 0-1.6-.7-1.6-1.6z" fill="#fcc21b" stroke="#e1a10f" stroke-width=".7" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 22.2s7.2-6.4 7.2-12.3a7.2 7.2 0 00-14.4 0c0 5.9 7.2 12.3 7.2 12.3z" fill="#e53935"/><ellipse cx="9.8" cy="7.4" rx="2.2" ry="1.5" fill="#ff8a80"/><circle cx="12" cy="10" r="2.5" fill="#b71c1c"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3" fill="#fff" stroke="#b0b8c1" stroke-width="1.1"/><path d="M3 7a3 3 0 013-3h12a3 3 0 013 3v2.2H3z" fill="#e53935"/><path d="M7 13h2.4M10.8 13h2.4M14.6 13H17M7 16.6h2.4M10.8 16.6h2.4" stroke="#8a96a3" stroke-width="1.6" stroke-linecap="round"/></svg>',
  bars: '<svg viewBox="0 0 24 24"><rect x="2.5" y="2.5" width="19" height="19" rx="3.5" fill="#fff" stroke="#b0b8c1" stroke-width="1.1"/><rect x="6" y="12.5" width="3" height="6" rx=".6" fill="#2f80ed"/><rect x="10.5" y="8" width="3" height="10.5" rx=".6" fill="#eb5757"/><rect x="15" y="5.5" width="3" height="13" rx=".6" fill="#27ae60"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 00-2.5-2.5H6A2.5 2.5 0 003.5 6v7A2.5 2.5 0 006 15.5h2.5"/></svg>'
};
const WA_EMO = { '📍': 'pin', '📅': 'cal', '📊': 'bars' };
function waReportLines() {
  return buildWhatsappSummary(META, TOTALS).split('\n').map(l => {
    if (!l.trim()) return '<div class="wl gap"></div>';
    let h = esc(l).replace(/\*(.+?)\*/g, '<b>$1</b>');
    for (const e in WA_EMO) h = h.replace(e, '<i class="we">' + WA_ICON[WA_EMO[e]] + '</i>');
    const kind = /^\d\./.test(l) ? ' num' : /^•/.test(l) ? ' bul' : '';
    return '<div class="wl' + kind + '"' + (l.indexOf('Pencapaian') >= 0 ? R('wa.pct') : '') + '>' + h + '</div>';
  }).join('');
}
function waPastePreview() {
  // the composer shows the copied text as typed: asterisks stay, emoji stay (as icons)
  return buildWhatsappSummary(META, TOTALS).split('\n').slice(0, 5).map(l => {
    let h = esc(l) || '&nbsp;';
    for (const e in WA_EMO) h = h.replace(e, '<i class="we">' + WA_ICON[WA_EMO[e]] + '</i>');
    return '<div>' + h + '</div>';
  }).join('');
}
function waSet() {
  const eacd = '<div class="wa-app wa-eacd"' + R('wa.eacd') + '>' +
    '<div class="ph-statusbar"><span class="tnum">17:12</span><span class="sb-icons"><i></i><i></i><i></i><b></b></span></div>' + appHeader('wa.', true) +
    '<div class="wa-eacd-body"><div class="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 pb-2">Papan Pemuka · ' + esc(META.locality) + '</div>' + summaryTable('wa.', true) + '</div>' +
    '<div class="toast wa-toast"' + R('wa.toast') + '><span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span><span>Ringkasan laporan disalin! Sedia ditampal ke WhatsApp.</span></div></div>';
  const chat = '<div class="wa-app wa-wa"' + R('wa.wa') + '>' +
    '<div class="wa-sbar"><span class="tnum">17:12</span><span class="sb-icons"><i></i><i></i><i></i><b></b></span></div>' +
    '<div class="wa-head"><span class="wa-hb">' + WA_ICON.back + '</span><span class="wa-av">' + ICON.users + '</span>' +
      '<div class="wa-ht"><b>Pasukan Vektor PKD Muallim</b><span>Pegawai Epid, PKP, PPKP, Pasukan 1–6</span></div><span class="wa-hv">' + WA_ICON.video + '</span></div>' +
    '<div class="wa-chat"' + R('wa.chat') + '><div class="wa-wall"><svg width="390" height="760"><defs><pattern id="waDoodle" width="92" height="92" patternUnits="userSpaceOnUse">' +
        '<g fill="none" stroke="#d8cfbf" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="14" cy="15" r="6"/><path d="M58 10l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/>' +
        '<path d="M24 62c-3-3-8-1-8 3 0 4 8 9 8 9s8-5 8-9c0-4-5-6-8-3z"/><path d="M66 58h16a3 3 0 013 3v9a3 3 0 01-3 3h-9l-5 4v-4h-2a3 3 0 01-3-3v-9a3 3 0 013-3z"/>' +
        '<path d="M38 34c4-3 8 3 12 0s8 3 12 0"/><path d="M8 84l6-6 6 6"/><circle cx="50" cy="84" r="2"/></g></pattern></defs>' +
        '<rect width="390" height="760" fill="url(#waDoodle)"/></svg></div>' +
      '<div class="wa-older"' + R('wa.older') + '><div class="wa-date">Hari ini</div>' +
        '<div class="wa-msg in"><b class="wa-from">Pegawai Epid</b><span>Mohon kongsi ringkasan ACD ' + esc(META.locality) + ' petang ini.</span><i class="wa-time">4.52 PTG</i></div></div>' +
      '<div class="wa-msg out wa-report"' + R('wa.bubble') + '>' + waReportLines() +
        '<i class="wa-time">5.12 PTG <span class="wa-ticks"' + R('wa.ticks') + '>' + WA_ICON.ticks + '</span></i>' +
        '<div class="wa-react"' + R('wa.react') + '>' + WA_ICON.thumb + '<span>3</span></div></div>' +
      '<div class="wa-hl"' + R('wa.hl') + '></div></div>' +
    '<div class="wa-menu"' + R('wa.menu') + '><span class="on">Tampal</span><span>Pilih</span><span>Pilih Semua</span><i></i></div>' +
    '<div class="wa-comp"' + R('wa.comp') + '><span class="wa-ci">' + WA_ICON.plus + '</span>' +
      '<div class="wa-input"' + R('wa.input') + '><div class="wa-paste"' + R('wa.paste') + '>' + waPastePreview() + '</div><span class="wa-sti">' + WA_ICON.sticker + '</span></div>' +
      '<span class="wa-ci"' + R('wa.cam') + '>' + WA_ICON.cam + '</span><span class="wa-mic"' + R('wa.mic') + '>' + WA_ICON.mic + '</span><span class="wa-send"' + R('wa.send') + '>' + ICON.send + '</span></div>' +
    '<div class="home-ind"></div></div>';
  return '<div class="wa-set"' + R('wa') + '><div class="wa-bg"></div>' +
    '<div class="wa-cam"' + R('wa.camera') + '><div class="actor phone wa-dev"' + R('wa.dev') + '><div class="phone-back"></div><div class="phone-frame"><div class="phone-screen"' + R('wa.screen') + '>' +
      eacd + chat + '<div class="island"></div><div class="touch"' + R('wa.touch') + '><i class="ripple"' + R('wa.ripple') + '></i></div>' +
    '</div></div><span class="pbtn b1"></span><span class="pbtn b2"></span><span class="pbtn b3"></span></div></div>' +
    '<div class="sys-tag wa-sys"' + R('wa.sys') + '><span class="sys-name">Kongsi laporan</span><span class="sys-view">WhatsApp (simulasi)</span>' + simBadge('sys-sim') + '</div>' +
  '</div>';
}

function buildStage() {
  return '<div class="bg"' + R('bg') + '><div class="bg-grad"' + R('bg.grad') + '></div><div class="bg-grad"' + R('bg.end') + '></div>' +
      '<div class="bg-glow g1"' + R('bg.g1') + '></div><div class="bg-glow g2"' + R('bg.g2') + '></div>' +
      '<svg class="bg-grid" viewBox="0 0 1920 1080" width="1920" height="1080"' + R('bg.grid') + '></svg><div class="bg-dust"' + R('bg.dust') + '></div></div>' +
    opening() + flowSet() + manualSet() +
    '<div class="world"' + R('w.nadi') + '>' + nadiWindow() + '</div>' +
    '<div class="world"' + R('w.sync') + '>' + gasNode() + sheetWindow() + '</div>' +
    '<div class="world"' + R('w.desk') + '>' + desktop() + '</div>' +
    '<div class="world"' + R('w.phone') + '>' + phone() + '</div>' +
    overlays() + waSet() +
    '<div class="sub-shade"' + R('subShade') + '></div><div class="subs"' + R('subs') + '><div class="subs-box"' + R('subsBox') + '></div></div><div class="vignette"></div>';
}
