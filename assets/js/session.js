window.FAST = window.FAST || {};
FAST.KEY = 'fast.spk.00418';
FAST.AFI_KEY = 'fast.spk.00418.afi';
FAST.BF_KEY = 'fast.spk.00426.bf';
FAST.QT_KEY = 'fast.spk.00426.qt';
FAST.DEL_KEY = 'fast.spk.00425';
FAST.GI_KEY = 'fast.spk.00424';
FAST.B2B_KEY = 'fast.spk.00421.b2b';
FAST.DRAFT_KEY = 'fast.spk.draft';
FAST.load = function (key) {
  try { return JSON.parse(localStorage.getItem(key || FAST.KEY) || 'null'); }
  catch (e) { return null; }
};
FAST.save = function (data, key) {
  var k = key || FAST.KEY;
  var next = Object.assign({ ts: Date.now() }, FAST.load(k) || {}, data);
  localStorage.setItem(k, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('fast-session', { detail: next }));
  return next;
};
FAST.B2B_SO = [
  { id: '1288', so: '4500091288', unit: 'Hiace Premio · unit 1', amt: 'Rp 348.400.000', dp: 69680000, dpLabel: 'Rp 69.680.000', financeLabel: 'Rp 278.720.000', kwt: 'KWT/26/CLD/009410' },
  { id: '1289', so: '4500091289', unit: 'Hiace Premio · unit 2', amt: 'Rp 348.300.000', dp: 69660000, dpLabel: 'Rp 69.660.000', financeLabel: 'Rp 278.640.000', kwt: 'KWT/26/CLD/009411' },
  { id: '1290', so: '4500091290', unit: 'Hiace Premio · unit 3', amt: 'Rp 348.300.000', dp: 69660000, dpLabel: 'Rp 69.660.000', financeLabel: 'Rp 278.640.000', kwt: 'KWT/26/CLD/009412' }
];
FAST.B2B_FLOW = ['submitted', 'docs_requested', 'docs_sent', 'contract_ready', 'ttd_uploaded', 'dp_received', 'billing_ready', 'paperless_sent', 'lunas'];
FAST.B2B_FLOW_LABEL = {
  submitted: 'Submit ke leasing',
  docs_requested: 'Dokumen diminta',
  docs_sent: 'Dokumen terkirim',
  contract_ready: 'Kontrak dari leasing',
  ttd_uploaded: 'Kontrak TTD',
  dp_received: 'Full DP masuk',
  billing_ready: 'Dokumen penagihan',
  paperless_sent: 'Penagihan paperless',
  lunas: 'Pelunasan'
};
FAST.b2bDocsComplete = function (u) {
  var d = (u && u.docs) || {};
  return !!(d.ktp && d.npwp && d.siup && d.spk);
};
FAST.b2bBillingComplete = function (u) {
  var b = (u && u.billing) || {};
  return !!(u.contractDownloaded && u.signedContract && b.bstkb && b.fotoSerah && b.fotoTtd);
};
FAST.b2bAdminCanBill = function (u) {
  return !!(u && u.dpReceived && FAST.b2bBillingComplete(u));
};
FAST.b2bDerive = function (u) {
  u = u || {};
  if (u.lunas) return 'lunas';
  if (u.paperlessSent) return 'paperless_sent';
  if (u.dpReceived && FAST.b2bBillingComplete(u)) return 'billing_ready';
  if (u.dpReceived) return 'dp_received';
  if (u.signedContract) return 'ttd_uploaded';
  if (u.contractFromLeasing) return 'contract_ready';
  if (FAST.b2bDocsComplete(u)) return 'docs_sent';
  if (u.backflow) return 'backflow';
  return u.status || 'submitted';
};
FAST.b2bDefault = function () {
  return {
    selected: '1288',
    tab: 'ringkas',
    units: {
      '1288': {
        status: 'contract_ready',
        backflow: false,
        backflowReason: '',
        docs: { ktp: true, npwp: true, siup: true, spk: true },
        contractFromLeasing: true,
        contractDownloaded: false,
        signedContract: false,
        billing: { bstkb: false, fotoSerah: false, fotoTtd: false },
        dpReceived: false,
        paperlessSent: false,
        kwtIssued: false,
        lunas: false
      },
      '1289': {
        status: 'docs_requested',
        backflow: true,
        backflowReason: 'NPWP badan tidak terbaca. Unggah ulang, lalu kirim kembali ke leasing.',
        docs: { ktp: true, npwp: false, siup: true, spk: true },
        contractFromLeasing: false,
        contractDownloaded: false,
        signedContract: false,
        billing: { bstkb: false, fotoSerah: false, fotoTtd: false },
        dpReceived: false,
        paperlessSent: false,
        kwtIssued: false,
        lunas: false
      },
      '1290': {
        status: 'docs_requested',
        backflow: false,
        backflowReason: '',
        docs: { ktp: false, npwp: false, siup: false, spk: true },
        contractFromLeasing: false,
        contractDownloaded: false,
        signedContract: false,
        billing: { bstkb: false, fotoSerah: false, fotoTtd: false },
        dpReceived: false,
        paperlessSent: false,
        kwtIssued: false,
        lunas: false
      }
    }
  };
};
FAST.b2bLoad = function () {
  var s = FAST.load(FAST.B2B_KEY);
  if (!s || !s.units) return FAST.b2bDefault();
  var base = FAST.b2bDefault();
  ['1288', '1289', '1290'].forEach(function (id) {
    base.units[id] = Object.assign({}, base.units[id], s.units[id] || {});
    base.units[id].docs = Object.assign({}, base.units[id].docs, (s.units[id] && s.units[id].docs) || {});
    base.units[id].billing = Object.assign({}, base.units[id].billing, (s.units[id] && s.units[id].billing) || {});
  });
  if (s.selected) base.selected = s.selected;
  if (s.tab) base.tab = s.tab;
  return base;
};
FAST.b2bSummary = function () {
  var s = FAST.b2bLoad();
  var ids = ['1288', '1289', '1290'];
  var ttd = 0, dp = 0, paper = 0, kwt = 0, lunas = 0, back = 0;
  ids.forEach(function (id) {
    var u = s.units[id];
    if (u.signedContract) ttd++;
    if (u.dpReceived) dp++;
    if (u.paperlessSent) paper++;
    if (u.kwtIssued) kwt++;
    if (u.lunas) lunas++;
    if (u.backflow) back++;
  });
  return { selected: s.selected, ttd: ttd, dp: dp, paper: paper, kwt: kwt, lunas: lunas, back: back, units: s.units, tab: s.tab };
};
FAST.NAMA_KEY = 'fast.spk.00426.nama';
FAST.ADDR_LABELS = [
  { id: 'line1', label: 'Alamat 1' },
  { id: 'line2', label: 'Alamat 2' },
  { id: 'rtrw', label: 'RT/RW' },
  { id: 'kelurahan', label: 'Kelurahan/desa' },
  { id: 'kecamatan', label: 'Kecamatan' },
  { id: 'kota', label: 'Kabupaten/kota' },
  { id: 'provinsi', label: 'Provinsi' }
];
FAST.ADDR = {
  dewi_pemesan: { line1: 'Jl. Cipete Raya No. 88', line2: 'Komplek Cipete Indah Blok B2', rtrw: '003/004', kelurahan: 'Cipete Selatan', kecamatan: 'Cilandak', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  dewi_stnk: { line1: 'Jl. Raya Sawangan No. 17', line2: '', rtrw: '001/002', kelurahan: 'Mampang', kecamatan: 'Pancoran Mas', kota: 'Kota Depok', provinsi: 'Jawa Barat' },
  budi: { line1: 'Jl. Kemang Selatan VIII No. 12', line2: 'Ruko Kemang Square Lt. 1', rtrw: '005/007', kelurahan: 'Bangka', kecamatan: 'Mampang Prapatan', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  sarah: { line1: 'Jl. Fatmawati Raya No. 45', line2: 'Apartemen One Park, tower A', rtrw: '002/006', kelurahan: 'Cipete Utara', kecamatan: 'Kebayoran Baru', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  agus: { line1: 'Jl. Cipete Raya No. 18', line2: '', rtrw: '008/003', kelurahan: 'Cipete Selatan', kecamatan: 'Cilandak', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  fajar: { line1: 'Jl. TB Simatupang No. 8', line2: 'Cluster Cilandak Town Square', rtrw: '011/002', kelurahan: 'Cilandak Barat', kecamatan: 'Cilandak', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  maria: { line1: 'Jl. Ampera Raya No. 20', line2: 'Komplek Ampera Elok', rtrw: '004/001', kelurahan: 'Ragunan', kecamatan: 'Pasar Minggu', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  hiace: { line1: 'Jl. Raya Pasar Minggu No. 10', line2: 'Gedung Danapura Lt. 5', rtrw: '006/002', kelurahan: 'Pejaten Barat', kecamatan: 'Pasar Minggu', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' },
  calya: { line1: 'Jl. Kemang Selatan VIII No. 12', line2: 'Ruko Kemang Square Lt. 1', rtrw: '005/007', kelurahan: 'Bangka', kecamatan: 'Mampang Prapatan', kota: 'Kota Jakarta Selatan', provinsi: 'DKI Jakarta' }
};
FAST.NOPOL = {
  'dewi.yaris': { spk: 'SPK/26/CLD/00426', so: '4500091426', nopol: 'B 1426 DPK', status: 'cadangan', note: 'Cadangan AFI · belum terbit STNK' },
  'dewi.agya': { spk: 'SPK/26/CLD/00426', so: '4500091428', nopol: '—', status: 'menunggu', note: 'SO tertahan booking fee Agya' },
  'budi': { spk: 'SPK/26/CLD/00418', so: '4500091238', nopol: 'B 1418 KL', status: 'cadangan', note: 'Plat standar · AFI dari SPK' },
  'hiace.1288': { spk: 'SPK/26/CLD/00421', so: '4500091288', nopol: 'B 1288 UA', status: 'cadangan', note: 'Tiga SO · nopol per unit' },
  'hiace.1289': { spk: 'SPK/26/CLD/00421', so: '4500091289', nopol: 'B 1289 UA', status: 'cadangan', note: 'Tiga SO · nopol per unit' },
  'hiace.1290': { spk: 'SPK/26/CLD/00421', so: '4500091290', nopol: 'B 1290 UA', status: 'cadangan', note: 'Tiga SO · nopol per unit' },
  'raize': { spk: 'SPK/26/CLD/00423', so: '—', nopol: '—', status: 'menunggu', note: 'SPK tertahan NPWP · nopol setelah AFI' },
  'agus': { spk: 'SPK/26/CLD/00425', so: '4500091301', nopol: 'B 1301 F', status: 'cadangan', note: 'Lunas · nopol cadangan sebelum GI' },
  'fajar': { spk: 'SPK/26/CLD/00424', so: '4500091424', nopol: 'B 1424 F', status: 'terbit', note: 'Terbit bersama GI · Rush' },
  'maria': { spk: 'SPK/26/CLD/00409', so: '4500091409', nopol: 'B 1409 B', status: 'terbit', note: 'STNK terbit · aging plat' },
  'calya': { spk: 'SPK/24/CLD/01990', so: '4500081990', nopol: 'B 1990 T', status: 'terbit', note: 'Delivered 2024' }
};
FAST.NAME_REL = {
  dewi: { pemesan: 'Dewi Lestari', stnk: 'Andi Pratama', same: false, rel: 'Pasangan', docs: 'KTP atas nama STNK, bukti alamat STNK, pernyataan', gate: 'approval', spk: 'SPK/26/CLD/00426' },
  budi: { pemesan: 'Budi Santoso', stnk: 'Budi Santoso', same: true, rel: 'Sama dengan pemesan', docs: 'KTP/KK pemesan dipakai ulang', gate: 'lolos', spk: 'SPK/26/CLD/00418' },
  hiace: { pemesan: 'PT Danapura Utama', stnk: 'PT Danapura Utama', same: true, rel: 'Badan · nama STNK = debitur', docs: 'NPWP badan + SIUP', gate: 'lolos', spk: 'SPK/26/CLD/00421' },
  raize: { pemesan: 'Sarah Wijaya', stnk: 'Sarah Wijaya', same: true, rel: 'Sama dengan pemesan', docs: 'Menunggu NPWP', gate: 'data', spk: 'SPK/26/CLD/00423' },
  agus: { pemesan: 'Agus Hermawan', stnk: 'Agus Hermawan', same: true, rel: 'Sama dengan pemesan', docs: 'Vault SPK', gate: 'lolos', spk: 'SPK/26/CLD/00425' },
  fajar: { pemesan: 'Fajar Nugroho', stnk: 'Fajar Nugroho', same: true, rel: 'Sama dengan pemesan', docs: 'Vault SPK', gate: 'lolos', spk: 'SPK/26/CLD/00424' },
  maria: { pemesan: 'Maria Sitompul', stnk: 'Maria Sitompul', same: true, rel: 'Sama dengan pemesan', docs: 'Vault SPK', gate: 'lolos', spk: 'SPK/26/CLD/00409' },
  calya: { pemesan: 'Budi Santoso', stnk: 'Budi Santoso', same: true, rel: 'Sama dengan pemesan', docs: 'Historis 2024', gate: 'lolos', spk: 'SPK/24/CLD/01990' }
};
FAST.addrOneLine = function (a) {
  if (!a) return '—';
  var parts = [a.line1, a.line2, a.rtrw ? 'RT/RW ' + a.rtrw : '', a.kelurahan, a.kecamatan, a.kota, a.provinsi];
  return parts.filter(Boolean).join(', ');
};
FAST.nopolRec = function (key) {
  if (key === 'hiace.active') {
    var sel = (FAST.b2bLoad && FAST.b2bLoad().selected) || '1288';
    return FAST.NOPOL['hiace.' + sel] || FAST.NOPOL['hiace.1288'];
  }
  return FAST.NOPOL[key] || null;
};
