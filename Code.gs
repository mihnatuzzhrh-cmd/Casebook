/**
 * CASEBOOK ZAHRO - Apps Script
 * Pasang di Google Sheets kamu: menu Ekstensi > Apps Script, tempel seluruh kode ini.
 * Ikuti PANDUAN.md untuk langkah deploy.
 */

// 1) GANTI kode ini dengan kode rahasia buatanmu sendiri (bebas, minimal 12 karakter).
const KODE_RAHASIA = 'GANTI-DENGAN-KODE-RAHASIA-KAMU';

// 2) Sheet yang TIDAK ditampilkan sebagai modul case/FAQ (nama persis seperti tab di Sheets).
const ABAIKAN = [];
// Sheet riwayat pelatihan (ditampilkan di menu Riwayat pelatihan, bukan sebagai modul).
const LOG_SHEET = 'Histori Log Pelatihan';
const LOG_F = {tanggal:'Tanggal', area:'Area', pelatihan:'Pelatihan', institusi:'Institusi / Proyek', audiens:'Audiens',
  tl:'TL / Co-Trainer', tujuan:'Tujuan / Agenda', catatan:'Catatan'};

// Nama kolom di sheet (harus sama dengan judul kolom di barismu).
const CASE_F = {id:'CASE ID', jenis:'Jenis Temuan', q:'Pertanyaan / Case', kondisi:'Kondisi / Cara Reproduksi',
  sistem:'Kemampuan Sistem', solusi:'Solusi / Alternatif / Step', sumber:'Sumber / Aturan', next:'Next Action'};
const FAQ_F = {q:'Pertanyaan Peserta', s:'Jawaban Singkat', d:'Cara Demo / Penjelasan'};
// Judul kolom untuk sheet yang masih benar-benar kosong (dibuat otomatis saat pertama diisi).
const HEAD_STD = ['CASE ID','Tanggal','Jenis Temuan','Pertanyaan / Case','Kondisi / Cara Reproduksi','Kemampuan Sistem',
  'Solusi / Alternatif / Step','Sumber / Aturan','Next Action','','Pertanyaan Peserta','Jawaban Singkat','Cara Demo / Penjelasan'];

function doGet() {
  return ContentService.createTextOutput('Casebook API aktif. Buka aplikasinya lewat alamat GitHub Pages-mu.');
}

function doPost(e) {
  let out;
  try {
    const a = JSON.parse(e.postData.contents);
    if (KODE_RAHASIA === 'GANTI-DENGAN-KODE-RAHASIA-KAMU' || a.kode !== KODE_RAHASIA) {
      out = {ok:false, code:'auth', error:'Kode rahasia salah.'};
    } else if (a.action === 'list') out = {ok:true, modules:semua(), log:logBaca()};
    else if (a.action === 'save') out = simpan(a);
    else if (a.action === 'delete') out = hapus(a);
    else if (a.action === 'log_save') out = logSimpan(a);
    else if (a.action === 'log_delete') out = logHapus(a);
    else out = {ok:false, error:'Aksi tidak dikenal.'};
  } catch (err) {
    out = {ok:false, error:String(err.message || err)};
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function semua() {
  return ss_().getSheets().filter(s => !s.isSheetHidden() && ABAIKAN.indexOf(s.getName()) < 0 && s.getName() !== LOG_SHEET).map(baca);
}

function tampil(n) {
  n = n.replace(/^Modul\s+/i, '');
  if (n.indexOf('(') > -1 && n.indexOf(')') < 0) n += ')';
  return n.replace(/Wi\)$/, 'Wisuda)');
}

function stdCol() {
  const c = {}; HEAD_STD.forEach((h, i) => { if (h) c[h] = i + 1; }); return c;
}

// Cari baris judul kolom (di 6 baris pertama) dan posisi tiap kolom.
function peta(sh) {
  if (sh.getLastRow() < 1 || sh.getLastColumn() < 1) return null;
  const n = Math.min(6, sh.getLastRow());
  const v = sh.getRange(1, 1, n, sh.getLastColumn()).getValues();
  for (let r = 0; r < n; r++) {
    const m = {};
    v[r].forEach((h, c) => { h = String(h).trim(); if (h && !m[h]) m[h] = c + 1; });
    if (m[CASE_F.q] || m[FAQ_F.q]) return {hr:r + 1, col:m};
  }
  return null;
}

function buatHeader(sh) {
  sh.getRange(1, 1, 1, HEAD_STD.length).setValues([HEAD_STD]).setFontWeight('bold');
  sh.setFrozenRows(1);
  return peta(sh);
}

function baca(sh) {
  const p = peta(sh), col = p ? p.col : stdCol();
  const m = {sheet:sh.getName(), name:tampil(sh.getName()), caps:{}, cases:[], faqs:[]};
  Object.keys(CASE_F).concat(['s', 'd']).forEach(k => { m.caps[k] = !!col[CASE_F[k] || FAQ_F[k]]; });
  if (p && sh.getLastRow() > p.hr) {
    const v = sh.getRange(p.hr + 1, 1, sh.getLastRow() - p.hr, sh.getLastColumn()).getDisplayValues();
    v.forEach((row, i) => {
      const r = p.hr + 1 + i, g = h => col[h] ? String(row[col[h] - 1]).trim() : '';
      const c = {row:r}; Object.keys(CASE_F).forEach(k => { c[k] = g(CASE_F[k]); });
      if (c.q) m.cases.push(c);
      const f = {row:r}; Object.keys(FAQ_F).forEach(k => { f[k] = g(FAQ_F[k]); });
      if (f.q) m.faqs.push(f);
    });
  }
  return m;
}

function aman(v) { v = String(v == null ? '' : v); return v.charAt(0) === '=' ? "'" + v : v; }

function cekBaris(sh, p, F, row, expect) {
  const cur = String(sh.getRange(row, p.col[F.q]).getDisplayValue()).trim();
  if (cur !== String(expect || '').trim()) throw new Error('Isi di sheet sudah berubah. Muat ulang data dulu, lalu coba lagi.');
}

function kolomIsi(p, F) { return Object.keys(F).filter(k => k !== 'id').map(k => p.col[F[k]]).filter(Boolean); }

function barisKosong(sh, p, F) {
  const cols = kolomIsi(p, F), last = sh.getLastRow();
  let row = Math.max(last, p.hr) + 1;
  if (last > p.hr) {
    const v = sh.getRange(p.hr + 1, 1, last - p.hr, sh.getLastColumn()).getValues();
    for (let i = 0; i < v.length; i++) {
      if (cols.every(c => String(v[i][c - 1]).trim() === '')) { row = p.hr + 1 + i; break; }
    }
  }
  if (row > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), row - sh.getMaxRows());
  return row;
}

function lengkapi(sh, p, row) {
  const ci = p.col[CASE_F.id], ct = p.col['Tanggal'];
  if (ci && !String(sh.getRange(row, ci).getValue()).trim()) {
    let pre = sh.getName().replace(/^Modul\s+/i, '').replace(/\(.*$/, '').split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 4) || 'NEW', max = 0;
    sh.getRange(p.hr + 1, ci, Math.max(sh.getLastRow() - p.hr, 1), 1).getValues().forEach(x => {
      const m = String(x[0]).match(/^(.*)-C(\d+)$/); if (m) { pre = m[1]; max = Math.max(max, +m[2]); }
    });
    sh.getRange(row, ci).setValue(pre + '-C' + ('00' + (max + 1)).slice(-3));
  }
  if (ct && !String(sh.getRange(row, ct).getValue()).trim()) sh.getRange(row, ct).setValue(new Date());
}

function simpan(a) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = ss_().getSheetByName(a.sheet); if (!sh) throw new Error('Sheet tidak ditemukan.');
    const p = peta(sh) || buatHeader(sh), F = a.type === 'c' ? CASE_F : FAQ_F;
    let row = a.row;
    if (row) cekBaris(sh, p, F, row, a.expect); else row = barisKosong(sh, p, F);
    Object.keys(F).filter(k => k !== 'id').forEach(k => { const c = p.col[F[k]]; if (c) sh.getRange(row, c).setValue(aman(a.data[k])); });
    if (a.type === 'c') lengkapi(sh, p, row);
    SpreadsheetApp.flush();
    return {ok:true, row:row, module:baca(sh)};
  } finally { lock.releaseLock(); }
}

function hapus(a) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = ss_().getSheetByName(a.sheet); if (!sh) throw new Error('Sheet tidak ditemukan.');
    const p = peta(sh); if (!p) throw new Error('Sheet belum punya judul kolom.');
    const F = a.type === 'c' ? CASE_F : FAQ_F;
    cekBaris(sh, p, F, a.row, a.expect);
    kolomIsi(p, F).forEach(c => sh.getRange(a.row, c).clearContent());
    SpreadsheetApp.flush();
    return {ok:true, module:baca(sh)};
  } finally { lock.releaseLock(); }
}

// ===================== RIWAYAT PELATIHAN =====================
const BLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function tglStr(d) {
  const z = Session.getScriptTimeZone(), f = x => Utilities.formatDate(d, z, x);
  const s = f('dd') + ' ' + BLN[+f('M') - 1] + ' ' + f('yyyy'), h = f('HH:mm');
  return h === '00:00' ? s : s + '\n' + h;
}
function sel(v) { return v instanceof Date ? tglStr(v) : String(v == null ? '' : v).trim(); }

function logPeta(sh) {
  if (!sh || sh.getLastRow() < 1 || sh.getLastColumn() < 1) return null;
  const n = Math.min(3, sh.getLastRow()), v = sh.getRange(1, 1, n, sh.getLastColumn()).getValues();
  for (let r = 0; r < n; r++) {
    const m = {}; v[r].forEach((h, c) => { h = String(h).trim(); if (h && !m[h]) m[h] = c + 1; });
    if (m[LOG_F.tanggal] && m[LOG_F.pelatihan]) return {hr:r + 1, col:m};
  }
  return null;
}

function logBaca() {
  const sh = ss_().getSheetByName(LOG_SHEET), p = logPeta(sh);
  if (!p || sh.getLastRow() <= p.hr) return [];
  const v = sh.getRange(p.hr + 1, 1, sh.getLastRow() - p.hr, sh.getLastColumn()).getValues(), out = [];
  v.forEach((row, i) => {
    const o = {row:p.hr + 1 + i};
    Object.keys(LOG_F).forEach(k => { const c = p.col[LOG_F[k]]; o[k] = c ? sel(row[c - 1]) : ''; });
    if (o.tanggal || o.pelatihan || o.institusi) out.push(o);
  });
  return out;
}

function logSiap() {
  let sh = ss_().getSheetByName(LOG_SHEET); if (!sh) sh = ss_().insertSheet(LOG_SHEET);
  let p = logPeta(sh);
  if (!p) {
    const h = Object.keys(LOG_F).map(k => LOG_F[k]);
    sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight('bold'); sh.setFrozenRows(1); p = logPeta(sh);
  }
  return {sh:sh, p:p};
}

function logKey(sh, p, row) {
  return sel(sh.getRange(row, p.col[LOG_F.tanggal]).getValue()) + '|' + sel(sh.getRange(row, p.col[LOG_F.pelatihan]).getValue());
}

function logSimpan(a) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const s = logSiap(), sh = s.sh, p = s.p; let row = a.row;
    if (row) {
      if (logKey(sh, p, row) !== String(a.expect || '').trim()) throw new Error('Isi di sheet sudah berubah. Muat ulang data dulu, lalu coba lagi.');
    } else {
      const last = sh.getLastRow(); row = Math.max(last, p.hr) + 1;
      const cs = [LOG_F.tanggal, LOG_F.pelatihan, LOG_F.institusi].map(h => p.col[h]).filter(Boolean);
      if (last > p.hr) {
        const v = sh.getRange(p.hr + 1, 1, last - p.hr, sh.getLastColumn()).getValues();
        for (let i = 0; i < v.length; i++) { if (cs.every(c => String(v[i][c - 1]).trim() === '')) { row = p.hr + 1 + i; break; } }
      }
      if (row > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), row - sh.getMaxRows());
    }
    Object.keys(LOG_F).forEach(k => {
      const c = p.col[LOG_F[k]]; if (!c) return;
      const cell = sh.getRange(row, c); if (k === 'tanggal') cell.setNumberFormat('@');
      cell.setValue(aman(a.data[k]));
    });
    SpreadsheetApp.flush();
    return {ok:true, row:row, items:logBaca()};
  } finally { lock.releaseLock(); }
}

function logHapus(a) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = ss_().getSheetByName(LOG_SHEET), p = logPeta(sh); if (!p) throw new Error('Sheet riwayat belum ada.');
    if (logKey(sh, p, a.row) !== String(a.expect || '').trim()) throw new Error('Isi di sheet sudah berubah. Muat ulang data dulu, lalu coba lagi.');
    Object.keys(LOG_F).forEach(k => { const c = p.col[LOG_F[k]]; if (c) sh.getRange(a.row, c).clearContent(); });
    SpreadsheetApp.flush();
    return {ok:true, items:logBaca()};
  } finally { lock.releaseLock(); }
}
