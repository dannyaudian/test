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
  { id: '1288', so: '4500091288', unit: 'Hiace Premio · unit 1', amt: 'Rp 348.400.000', dp: 69680000, dpLabel: 'Rp 69.680.000', kwt: 'KWT/26/CLD/009410' },
  { id: '1289', so: '4500091289', unit: 'Hiace Premio · unit 2', amt: 'Rp 348.300.000', dp: 69660000, dpLabel: 'Rp 69.660.000', kwt: 'KWT/26/CLD/009411' },
  { id: '1290', so: '4500091290', unit: 'Hiace Premio · unit 3', amt: 'Rp 348.300.000', dp: 69660000, dpLabel: 'Rp 69.660.000', kwt: 'KWT/26/CLD/009412' }
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
