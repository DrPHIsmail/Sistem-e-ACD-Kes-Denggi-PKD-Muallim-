/**
 * SKRIP BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Sistem e-ACD Kes Denggi — Pejabat Kesihatan Daerah Muallim
 *
 * CARA PENGGUNAAN DI GOOGLE SHEETS:
 * 1. Buka Google Sheet ACD Denggi Kg. Ketoyong:
 *    https://docs.google.com/spreadsheets/d/1w9P5Ikuv3gI312b_LhnG2Ko6VbHJr6j2NZEHVmpr8t8/edit
 * 2. Klik menu Extensions > Apps Script.
 * 3. Padam kod asal dalam fail `Code.gs` dan tampal (paste) keseluruhan kod ini.
 * 4. Klik tanda tambah (+) pada bahagian Files > pilih HTML > namakan sebagai `Index`
 *    (Google akan menjadikannya `Index.html`), kemudian tampal kod daripada fail `acd_denggi_app.html`.
 * 5. Klik butang biru "Deploy" > "New deployment" > pilih jenis "Web app":
 *    - Description: Sistem e-ACD Denggi PKD Muallim
 *    - Execute as: Me (Akaun anda)
 *    - Who has access: Anyone (Supaya semua 16 petugas boleh akses terus di telefon)
 * 6. Klik "Deploy" dan kongsikan pautan Web App (atau kod QR) kepada semua petugas.
 */

const SPREADSHEET_ID = '1w9P5Ikuv3gI312b_LhnG2Ko6VbHJr6j2NZEHVmpr8t8';
const SHEET_HASIL = 'Hasil ACD';
const SHEET_PETUGAS = 'Pencalonan Petugas';
const SHEET_LAMPIRAN = 'Lampiran 1 (Rekod Rumah)';

function getSpreadsheet_() {
  try {
    return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
}

/**
 * Memaparkan aplikasi e-ACD Denggi apabila dibuka melalui pelayar telefon pintar
 * atau memulangkan JSON jika dipanggil melalui parameter ?action=getAll
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getAll') {
    const data = getAcdDataForApp();
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Sistem e-ACD Denggi — PKD Muallim')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

/**
 * Menerima kemas kini data secara luaran (jika menggunakan mod Hibrid / Fetch)
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body && body.payload) {
      const result = saveAcdDataFromApp(body.payload);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Tiada payload diterima' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Membaca data terkini daripada tab 'Hasil ACD', 'Pencalonan Petugas', dan 'Lampiran 1'
 */
function getAcdDataForApp() {
  const ss = getSpreadsheet_();
  const hasilSheet = ss.getSheetByName(SHEET_HASIL);
  const petugasSheet = ss.getSheetByName(SHEET_PETUGAS);
  const props = PropertiesService.getScriptProperties();

  const teams = {
    1: { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 },
    2: { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 },
    3: { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 },
    4: { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 },
    5: { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 },
    6: { locality: 0, visited: 0, locked: 0, pop: 0, symp: 0, ref: 0, sample: 0, breeding: 0, abate: 0, pamphlet: 0 }
  };

  // Baca C8:H13 daripada tab 'Hasil ACD'
  if (hasilSheet) {
    const values = hasilSheet.getRange('C8:H13').getValues();
    for (let col = 0; col < 6; col++) {
      const teamNum = col + 1;
      teams[teamNum].locality = Number(values[0][col]) || 0;
      teams[teamNum].visited  = Number(values[1][col]) || 0;
      teams[teamNum].locked   = Number(values[2][col]) || 0;
      teams[teamNum].pop      = Number(values[3][col]) || 0;
      teams[teamNum].symp     = Number(values[4][col]) || 0;
      teams[teamNum].ref      = Number(values[5][col]) || 0;
    }
  }

  // Baca data tambahan (sampel, pemeriksaan persekitaran, senarai rumah & pengesahan)
  const extraJson = props.getProperty('ACD_EXTRA_STATE');
  let houses = [];
  let verification = null;
  let meta = null;
  let staff = [];

  if (extraJson) {
    try {
      const parsed = JSON.parse(extraJson);
      if (parsed.teamsExtra) {
        for (let t = 1; t <= 6; t++) {
          if (parsed.teamsExtra[t]) {
            teams[t].sample   = Number(parsed.teamsExtra[t].sample) || 0;
            teams[t].breeding = Number(parsed.teamsExtra[t].breeding) || 0;
            teams[t].abate    = Number(parsed.teamsExtra[t].abate) || 0;
            teams[t].pamphlet = Number(parsed.teamsExtra[t].pamphlet) || 0;
          }
        }
      }
      if (Array.isArray(parsed.houses)) houses = parsed.houses;
      if (parsed.verification) verification = parsed.verification;
      if (parsed.meta) meta = parsed.meta;
      if (Array.isArray(parsed.staff)) staff = parsed.staff;
    } catch (e) {}
  }

  // Jika senarai petugas belum disimpan dalam Properties, baca daripada tab 'Pencalonan Petugas'
  if (staff.length === 0 && petugasSheet) {
    const lastRow = Math.max(23, petugasSheet.getLastRow());
    const staffVals = petugasSheet.getRange(9, 4, lastRow - 8, 6).getValues();
    staffVals.forEach((row, idx) => {
      const name = String(row[1] || '').trim();
      if (name) {
        staff.push({
          id: idx + 1,
          name: name,
          role: String(row[2] || '').trim(),
          unit: String(row[3] || '').trim(),
          status: String(row[4] || 'Disahkan').trim(),
          team: (idx % 6) + 1
        });
      }
    });
  }

  return {
    status: 'ok',
    teams: teams,
    houses: houses,
    staff: staff,
    meta: meta,
    verification: verification
  };
}

/**
 * Menyimpan dapatan Pasukan 1–6 terus ke dalam tab 'Hasil ACD' (C8:H13),
 * mengemas kini tab 'Pencalonan Petugas', dan merekodkan senarai rumah ke tab 'Lampiran 1 (Rekod Rumah)'
 */
function saveAcdDataFromApp(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = getSpreadsheet_();
    const hasilSheet = ss.getSheetByName(SHEET_HASIL);
    const petugasSheet = ss.getSheetByName(SHEET_PETUGAS);

    // 1. Kemas kini C8:H13 dalam tab 'Hasil ACD' (Formula Jumlah di I8:I14 & % di baris 14 kekal automatik)
    if (hasilSheet && payload.teams) {
      const matrix = [
        [], // Row 8: Jumlah Rumah/Premis dalam Lokaliti
        [], // Row 9: Jumlah Rumah/Premis Dilawati
        [], // Row 10: Jumlah Rumah/Premis Berkunci / Kosong
        [], // Row 11: Jumlah Penduduk Diperiksa (ACD)
        [], // Row 12: Jumlah Kes Bergejala Dikesan
        []  // Row 13: Jumlah Rujukan Ke Fasiliti Kesihatan
      ];

      for (let t = 1; t <= 6; t++) {
        const d = payload.teams[t] || {};
        matrix[0].push(d.locality > 0 ? Number(d.locality) : '');
        matrix[1].push(d.visited > 0 || d.locality > 0 ? Number(d.visited || 0) : '');
        matrix[2].push(d.locked > 0 || d.locality > 0 ? Number(d.locked || 0) : '');
        matrix[3].push(d.pop > 0 || d.locality > 0 ? Number(d.pop || 0) : '');
        matrix[4].push(d.symp > 0 || d.locality > 0 ? Number(d.symp || 0) : '');
        matrix[5].push(d.ref > 0 || d.locality > 0 ? Number(d.ref || 0) : '');
      }

      hasilSheet.getRange('C8:H13').setValues(matrix);
    }

    // 2. Kemas kini tab 'Pencalonan Petugas' jika terdapat penambahan petugas baharu
    if (petugasSheet && Array.isArray(payload.staff) && payload.staff.length > 0) {
      if (payload.meta && payload.meta.requiredStaff) {
        petugasSheet.getRange('E6').setValue(Number(payload.meta.requiredStaff));
      }
      const staffRows = payload.staff.map((s, idx) => [
        idx + 1,
        s.name,
        s.role,
        s.unit,
        s.status,
        'Pasukan ' + (s.team || 1)
      ]);
      petugasSheet.getRange(9, 4, staffRows.length, 6).setValues(staffRows);
      // Pastikan formula Disahkan (G6) merangkumi semua baris petugas
      const endRow = 8 + staffRows.length;
      petugasSheet.getRange('G6').setFormula('=COUNTIF(H9:H' + endRow + ',"Disahkan")');
    }

    // 3. Simpan rekod rumah ke dalam tab 'Lampiran 1 (Rekod Rumah)'
    if (Array.isArray(payload.houses)) {
      let lampiranSheet = ss.getSheetByName(SHEET_LAMPIRAN);
      if (!lampiranSheet) {
        lampiranSheet = ss.insertSheet(SHEET_LAMPIRAN);
      }
      lampiranSheet.clearContents();
      const headers = [[
        'Bil',
        'Pasukan',
        'Alamat / No. Rumah',
        'Kod Status Lawatan',
        'Bil. Penghuni Diperiksa',
        'Nama Ketua Rumah / Wakil',
        'No. Telefon',
        'Bil. Kes Bergejala',
        'Gejala Dikesan',
        'Catatan Kes Bergejala',
        'Bil. Rujukan Klinik',
        'Bil. Sampel Diambil',
        'Takungan Aedes (Bahagian C)',
        'Tindakan Abate (Bahagian C)',
        'Risalah Diedar (Bahagian C)',
        'Tindakan Lapangan'
      ]];
      lampiranSheet.getRange(1, 1, 1, headers[0].length).setValues(headers).setFontWeight('bold');

      if (payload.houses.length > 0) {
        const houseRows = payload.houses.map((h, i) => [
          i + 1,
          'Pasukan ' + h.team,
          h.address || '',
          h.status || '1',
          Number(h.occupants) || 0,
          h.headName || '',
          h.headPhone || '',
          Number(h.symptomCount) || 0,
          (h.symptoms || []).join(', '),
          h.patientNote || '',
          Number(h.referredCount) || 0,
          Number(h.sampleCount) || 0,
          h.breeding ? 'Ya' : 'Tidak',
          h.abate ? 'Ya' : 'Tidak',
          h.pamphlet ? 'Ya' : 'Tidak',
          h.fieldAction || ''
        ]);
        lampiranSheet.getRange(2, 1, houseRows.length, headers[0].length).setValues(houseRows);
      }
    }

    // 4. Simpan state tambahan dalam ScriptProperties untuk penyelarasan segera antara peranti
    const teamsExtra = {};
    if (payload.teams) {
      for (let t = 1; t <= 6; t++) {
        teamsExtra[t] = {
          sample: payload.teams[t] ? payload.teams[t].sample : 0,
          breeding: payload.teams[t] ? payload.teams[t].breeding : 0,
          abate: payload.teams[t] ? payload.teams[t].abate : 0,
          pamphlet: payload.teams[t] ? payload.teams[t].pamphlet : 0
        };
      }
    }
    PropertiesService.getScriptProperties().setProperty('ACD_EXTRA_STATE', JSON.stringify({
      teamsExtra: teamsExtra,
      houses: payload.houses || [],
      staff: payload.staff || [],
      meta: payload.meta || {},
      verification: payload.verification || {}
    }));

    return { status: 'ok', updatedAt: new Date().toISOString() };
  } finally {
    lock.releaseLock();
  }
}