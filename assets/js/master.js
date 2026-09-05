(function () {
  var FAST = window.FAST = window.FAST || {};
  var LABELS = FAST.ADDR_LABELS || [];
  var TAG = { cadangan: 'Cadangan', menunggu: 'Menunggu', terbit: 'Terbit' };
  var TAG_CLS = { cadangan: 'wait', menunggu: 'mute', terbit: 'ok' };
  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function fillAddr(host) {
    var key = host.getAttribute('data-addr');
    var a = (FAST.ADDR || {})[key];
    if (!a) return;
    var own = host.getAttribute('data-addr-own') || 'f';
    var src = host.getAttribute('data-addr-src') || 'SPK';
    host.innerHTML = '';
    LABELS.forEach(function (f) {
      var row = el('div', 'frow locked');
      var mark = el('i', 'own ' + own);
      mark.textContent = own === 's' ? 'S' : own === 'a' ? 'A' : 'F';
      var lab = el('span', 'lab');
      lab.textContent = f.label;
      var val = el('span', 'val');
      val.textContent = a[f.id] || (f.id === 'line2' ? '—' : '');
      var s = el('span', 'src');
      s.textContent = src;
      row.appendChild(mark);
      row.appendChild(lab);
      row.appendChild(val);
      row.appendChild(s);
      host.appendChild(row);
    });
  }
  function fillNopol(host) {
    var rec = FAST.nopolRec ? FAST.nopolRec(host.getAttribute('data-nopol')) : null;
    if (!rec) return;
    host.innerHTML = '';
    function row(lab, val, src) {
      var r = el('div', 'frow locked');
      var mark = el('i', 'own s');
      mark.textContent = 'S';
      var l = el('span', 'lab');
      l.textContent = lab;
      var v = el('span', 'val');
      v.textContent = val;
      var s = el('span', 'src');
      s.textContent = src;
      r.appendChild(mark);
      r.appendChild(l);
      r.appendChild(v);
      r.appendChild(s);
      host.appendChild(r);
    }
    row('Nomor polisi', rec.nopol, rec.spk);
    row('Sales Order', rec.so, 'Satu SO per unit');
    row('Status nopol', TAG[rec.status] || rec.status, rec.note);
  }
  function fillNameRel(host) {
    var key = host.getAttribute('data-name-rel');
    var r = (FAST.NAME_REL || {})[key];
    if (!r) return;
    var st = 'draft';
    if (window.FAST && FAST.load && FAST.NAMA_KEY) {
      st = (FAST.load(FAST.NAMA_KEY) || {}).excNama || 'draft';
    }
    var gateTxt = r.same
      ? 'Nama sama · data gate lolos · bukan Approval Engine'
      : (st === 'approved'
        ? 'Nama berbeda · Approval Engine disetujui · syarat dokumen'
        : 'Nama berbeda · waivable · unggah supporting document → Approval Engine');
    var tagCls = r.same ? 'ok' : (st === 'approved' ? 'ok' : 'hold');
    var tagLab = r.same ? 'Sama' : (st === 'approved' ? 'Disetujui' : 'Perlu putusan');
    host.innerHTML = '';
    var h = el('h3');
    h.innerHTML = 'Hubungan nama pemesan &amp; STNK <span class="side">' + r.spk + '</span>';
    var fields = el('div', 'fields');
    function row(lab, val, src, own) {
      var fr = el('div', 'frow locked');
      var i = el('i', 'own ' + (own || 'f'));
      i.textContent = (own || 'f') === 's' ? 'S' : (own || 'f') === 'p' ? 'P' : 'F';
      var l = el('span', 'lab');
      l.textContent = lab;
      var v = el('span', 'val');
      v.textContent = val;
      var s = el('span', 'src');
      s.textContent = src;
      fr.appendChild(i);
      fr.appendChild(l);
      fr.appendChild(v);
      fr.appendChild(s);
      fields.appendChild(fr);
    }
    row('Nama pemesan', r.pemesan, 'SPK', 'f');
    row('Nama STNK', r.stnk, 'SPK · AFI/BPKB', 'f');
    row('Hubungan', r.rel, r.same ? 'Tidak perlu pernyataan' : 'Wajib dokumen pendukung', 's');
    row('Supporting document', r.docs, 'Vault SPK', 'f');
    row('Gate', gateTxt, r.same ? 'Data gate' : 'Approval Engine · Kepala Administrasi', r.same ? 's' : 'p');
    host.appendChild(h);
    host.appendChild(fields);
    var pad = el('div', 'pad');
    var p = el('p', 'hint');
    p.style.margin = '0';
    p.textContent = r.same
      ? 'Kalau nama sama, KTP/KK pemesan dipakai ulang. Bukan exception.'
      : 'Perbedaan nama ditahan sampai Kepala Administrasi memutuskan. Bukan waiver lunas/30%.';
    pad.appendChild(p);
    host.appendChild(pad);
    var tagHost = host.parentElement && host.parentElement.querySelector('[data-name-rel-tag="' + key + '"]');
    if (tagHost) {
      tagHost.className = 'tag ' + tagCls;
      tagHost.textContent = tagLab;
    }
  }
  FAST.renderMaster = function () {
    document.querySelectorAll('[data-addr]').forEach(fillAddr);
    document.querySelectorAll('[data-nopol]').forEach(fillNopol);
    document.querySelectorAll('[data-name-rel]').forEach(fillNameRel);
  };
})();
