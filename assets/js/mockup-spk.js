/* Draft SPK Dewi, booking, AFI */
  function draftData(){
    var d=window.FAST && FAST.load ? FAST.load(FAST.DRAFT_KEY) : null;
    return Object.assign({
      step:'pemesan', saved:false, sameStnk:false, cash:true,
      fields:{}, docs:{}
    }, d||{});
  }
  function draftSaved(){ return !!(draftData().saved); }
  function requiredDocs(d){
    var list=['ktp','kk','npwp','alamat'];
    if(!d.sameStnk) list.push('ktpStnk','alamatStnk','pernyataan');
    return list;
  }
  function docsReady(d){
    return requiredDocs(d).every(function(k){ return !!(d.docs&&d.docs[k]); });
  }
  function fieldsReady(group, d){
    var f=d.fields||{};
    if(group==='pemesan') return !!(f.nama&&f.nik&&f.hp&&f.pemAddr1&&f.pemRt&&f.pemKel&&f.pemKec&&f.pemKota&&f.pemProv);
    if(group==='stnk') return !!(f.stnkNama&&f.stnkAddr1&&f.stnkRt&&f.stnkKel&&f.stnkKec&&f.stnkKota&&f.stnkProv);
    if(group==='unit') return !!(f.tipe&&f.warna);
    return false;
  }
  function poFromKota(kota){
    var k=(kota||'').toLowerCase();
    if(/depok/.test(k)) return {prov:'Jawa Barat',po:'Depok · PO-DPK',otr:'Rp 296.800.000',bf:'Rp 3.000.000 · master Yaris'};
    if(/jakarta/.test(k)) return {prov:'DKI Jakarta',po:'Jakarta Selatan · PO-JKT',otr:'Rp 302.400.000',bf:'Rp 3.000.000 · master Yaris'};
    if(kota) return {prov:'—',po:'Dari kota STNK',otr:'Mengikuti area PO',bf:'Dari master unit'};
    return {prov:'—',po:'—',otr:'Menunggu kota STNK',bf:'Dari master unit, setelah SPK'};
  }
  function applySpkDraft(){
    var d=draftData();
    var pem=fieldsReady('pemesan',d), st=fieldsReady('stnk',d), un=fieldsReady('unit',d), doc=docsReady(d);
    var nReq=requiredDocs(d).length;
    var nOk=requiredDocs(d).filter(function(k){ return d.docs&&d.docs[k]; }).length;
    var el;
    el=document.querySelector('[data-draft-pemesan]'); if(el) el.textContent=pem?'Lengkap':'Kosong';
    el=document.querySelector('[data-draft-stnk]'); if(el) el.textContent=st?'Lengkap':'Kosong';
    el=document.querySelector('[data-draft-unit]'); if(el) el.textContent=un?'Lengkap':'Kosong';
    el=document.querySelector('[data-draft-docs]'); if(el) el.textContent=nOk+' / '+nReq;
    var docCard=document.querySelector('[data-draft-docs-card]');
    if(docCard) docCard.classList.toggle('alert', !doc);
    document.querySelectorAll('#spk_baru .worktabs [data-spk-step]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-spk-step')===(d.step||'pemesan')?'true':'false');
    });
    document.querySelectorAll('[data-spk-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-spk-panel')!==(d.step||'pemesan');
    });
    document.querySelectorAll('#spk_baru [data-draft-f]').forEach(function(inp){
      var k=inp.getAttribute('data-draft-f');
      if(document.activeElement!==inp) inp.value=(d.fields&&d.fields[k])||'';
    });
    document.querySelectorAll('[data-spk-same]').forEach(function(b){
      var same=!!d.sameStnk;
      b.setAttribute('aria-pressed', (b.getAttribute('data-spk-same')==='1')===same?'true':'false');
    });
    document.querySelectorAll('[data-spk-pay]').forEach(function(b){
      var cash=d.cash!==false;
      b.setAttribute('aria-pressed', (b.getAttribute('data-spk-pay')==='cash')===cash?'true':'false');
    });
    var payHint=document.querySelector('[data-spk-pay-hint]');
    if(payHint) payHint.textContent=d.cash!==false
      ? 'Tunai: billing ≥30% dan delivery lunas, keduanya non-waivable. Belum ditagih di langkah ini.'
      : 'Leasing: DP wajib muncul di struktur harga SO dari B2B (read-only). Billing setelah full DP, delivery setelah TTD. Bukan diketik di SPK.';
    var sameHint=document.querySelector('[data-spk-same-hint]');
    if(sameHint) sameHint.textContent=d.sameStnk
      ? 'Nama STNK = pemesan. KTP/KK/alamat pemesan dipakai ulang. Pernyataan nama tidak wajib.'
      : 'Nama STNK berbeda: unggah supporting document di langkah 4, lalu Approval Engine (Kepala Administrasi).';
    var po=poFromKota((d.fields||{}).stnkKota);
    var poMap={prov:po.prov,po:po.po,otr:po.otr,bf:po.bf};
    Object.keys(poMap).forEach(function(k){
      document.querySelectorAll('[data-draft-po="'+k+'"]').forEach(function(inp){ inp.value=poMap[k]; });
    });
    document.querySelectorAll('[data-spk-doc]').forEach(function(box){
      var key=box.getAttribute('data-spk-doc');
      var on=!!(d.docs&&d.docs[key]);
      var need=requiredDocs(d).indexOf(key)>-1;
      box.classList.toggle('miss', !on);
      var tag=box.querySelector('.tag');
      var meta=box.querySelector('.meta');
      if(on){
        if(tag){ tag.className='tag ok'; tag.textContent='Valid'; }
        if(meta) meta.textContent='Di vault SPK · siap dipakai AFI';
      } else {
        if(tag){ tag.className=need?'tag stop':'tag mute'; tag.textContent=need?'Belum':'Opsional'; }
      }
      if(key==='pernyataan' || key==='ktpStnk' || key==='alamatStnk') box.hidden=!!d.sameStnk;
    });
    var save=document.querySelector('[data-spk-save]');
    var ready=pem&&st&&un&&doc;
    if(save) save.disabled=!ready;
    var hint=document.querySelector('[data-spk-save-hint]');
    if(hint){
      if(ready) hint.innerHTML='Siap disimpan. Sistem memberi nomor SPK. Booking fee ditagih <b>setelah</b> ini.';
      else hint.textContent='Masih kurang: '+(pem?'':'pemesan ')+(st?'':'STNK ')+(un?'':'unit ')+(doc?'':'dokumen')+'. Surat kuasa dan BSTKB bukan di sini.';
    }
    var paid=!!(window.FAST && FAST.load && FAST.load(FAST.BF_KEY) && FAST.load(FAST.BF_KEY).paid);
    document.querySelectorAll('[data-dewi-card]').forEach(function(card){
      card.setAttribute('data-go', paid?'so':(d.saved?'spk':'spk_baru'));
    });
    if(!paid){
      document.querySelectorAll('[data-dewi-oid]').forEach(function(oid){ oid.textContent=d.saved?'SPK/26/CLD/00426 · baru tersimpan':'Draft · belum nomor SPK'; });
      document.querySelectorAll('[data-dewi-spec]').forEach(function(spec){ spec.textContent=d.saved?'Tindakan: quotation → booking · Yaris & Agya tetap di SPK ini':'Tindakan: isi pemesan, STNK, unit, lalu unggah dokumen · Yaris + Agya di SPK yang sama'; });
      document.querySelectorAll('[data-dewi-tag]').forEach(function(tag){ tag.textContent=d.saved?'Belum bayar':'Isi dari awal'; tag.className='tag wait'; });
      document.querySelectorAll('[data-dewi-amt]').forEach(function(amt){ amt.textContent=d.saved?'OTR Depok':'Belum OTR'; });
      document.querySelectorAll('[data-dewi-cta]').forEach(function(cta){ cta.textContent=d.saved?'Data pemesan · STNK · unit →':'Input & unggah →'; });
    }
    if(window.FAST && FAST.renderLineage) FAST.renderLineage({payJob:payJobId, screen:(document.querySelector('.screen.on')||{}).id});
  }
  function saveDraft(patch){
    if(window.FAST && FAST.save) FAST.save(patch, FAST.DRAFT_KEY);
    applySpkDraft();
  }
  function applyBooking(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null;
    var paid=!!(s && s.paid);
    document.querySelectorAll('[data-bf-hide-paid]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-bf-show-paid]').forEach(function(el){ el.hidden=!paid; });
    var block=document.querySelector('[data-so-block]');
    var ready=document.querySelector('[data-so-ready]');
    if(block) block.hidden=paid;
    if(ready) ready.hidden=!paid;
    document.querySelectorAll('[data-dewi-card]').forEach(function(card){ card.setAttribute('data-go', paid?'so':'spk'); });
    document.querySelectorAll('[data-dewi-oid]').forEach(function(oid){ oid.textContent=paid?'SO 4500091426 · dari SPK/26/CLD/00426':'SPK/26/CLD/00426 · baru tersimpan'; });
    document.querySelectorAll('[data-dewi-spec]').forEach(function(spec){ spec.textContent=paid?'Tindakan: SO Yaris → AFI → DO → billing · Agya di quotation yang sama':'Tindakan: quotation → booking cashless · Yaris & Agya di SPK ini'; });
    document.querySelectorAll('[data-dewi-tag]').forEach(function(tag){ tag.textContent=paid?'SO terbuka':'Belum bayar'; tag.className='tag '+(paid?'ok':'wait'); });
    document.querySelectorAll('[data-dewi-amt]').forEach(function(amt){ amt.textContent=paid?'AR Rp 299,15 Jt':'OTR Depok'; });
    document.querySelectorAll('[data-dewi-cta]').forEach(function(cta){ cta.textContent=paid?'Sales Order →':'Data pemesan · STNK · unit →'; });
    applyDewiProc();
    applySpkDraft();
  }
  document.querySelectorAll('[data-spk-step]').forEach(function(b){
    b.addEventListener('click',function(){ saveDraft({step:b.getAttribute('data-spk-step')}); });
  });
  document.querySelectorAll('[data-spk-fill]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-spk-fill');
      var d=draftData();
      var fields=Object.assign({}, d.fields||{});
      if(kind==='pemesan'){
        var pa=FAST.ADDR && FAST.ADDR.dewi_pemesan;
        Object.assign(fields,{
          nama:'Dewi Lestari',nik:'3276••••••••0012',hp:'0812••••8831',email:'dewi.lestari@mail.test',
          pemAddr1:pa.line1,pemAddr2:pa.line2,pemRt:pa.rtrw,pemKel:pa.kelurahan,pemKec:pa.kecamatan,pemKota:pa.kota,pemProv:pa.provinsi
        });
        saveDraft({fields:fields,step:'stnk'});
        toast('Pemesan tersimpan di SPK. Lanjut nama dan alamat STNK.');
      } else if(kind==='stnk'){
        if(d.sameStnk){
          Object.assign(fields,{
            stnkNama:fields.nama||'Dewi Lestari', stnkRel:'Sama dengan pemesan',
            stnkAddr1:fields.pemAddr1, stnkAddr2:fields.pemAddr2, stnkRt:fields.pemRt,
            stnkKel:fields.pemKel, stnkKec:fields.pemKec, stnkKota:fields.pemKota, stnkProv:fields.pemProv
          });
        } else {
          var sa=FAST.ADDR && FAST.ADDR.dewi_stnk;
          Object.assign(fields,{
            stnkNama:'Andi Pratama', stnkRel:'Pasangan',
            stnkAddr1:sa.line1, stnkAddr2:sa.line2, stnkRt:sa.rtrw,
            stnkKel:sa.kelurahan, stnkKec:sa.kecamatan, stnkKota:sa.kota, stnkProv:sa.provinsi
          });
        }
        saveDraft({fields:fields,step:'unit'});
        toast('Kota STNK mengisi area PO. OTR mengikuti area itu.');
      } else if(kind==='unit'){
        Object.assign(fields,{tipe:'Yaris 1.5 G CVT',warna:'Putih Metalik',tipe2:'Agya 1.2 G CVT · Hitam',aksesoris:'Kaca film full + karpet premium',nopol1:'B 1426 DPK',nopol2:''});
        saveDraft({fields:fields,cash:true,step:'docs'});
        toast('Unit dari master. Booking fee belum ditagih.');
      }
    });
  });
  document.querySelectorAll('[data-spk-same]').forEach(function(b){
    b.addEventListener('click',function(){
      var same=b.getAttribute('data-spk-same')==='1';
      var patch={sameStnk:same};
      if(same){
        var f=Object.assign({}, draftData().fields||{});
        if(f.nama) f.stnkNama=f.nama;
        f.stnkRel='Sama dengan pemesan';
        if(f.pemAddr1) f.stnkAddr1=f.pemAddr1;
        f.stnkAddr2=f.pemAddr2||'';
        if(f.pemRt) f.stnkRt=f.pemRt;
        if(f.pemKel) f.stnkKel=f.pemKel;
        if(f.pemKec) f.stnkKec=f.pemKec;
        if(f.pemKota) f.stnkKota=f.pemKota;
        if(f.pemProv) f.stnkProv=f.pemProv;
        patch.fields=f;
      }
      saveDraft(patch);
    });
  });
  document.querySelectorAll('[data-spk-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      saveDraft({cash:b.getAttribute('data-spk-pay')==='cash'});
    });
  });
  document.querySelectorAll('[data-spk-up]').forEach(function(b){
    b.addEventListener('click',function(){
      var key=b.getAttribute('data-spk-up');
      var docs=Object.assign({}, draftData().docs||{});
      docs[key]=true;
      if(key==='kkStnk') toast('KK pemesan dipakai ulang dari vault.');
      else toast('Dokumen masuk vault. Administrasi verifikasi, bukan unggah ulang.');
      saveDraft({docs:docs});
    });
  });
  document.querySelectorAll('[data-spk-save]').forEach(function(b){
    b.addEventListener('click',function(){
      var d=draftData();
      if(!(fieldsReady('pemesan',d)&&fieldsReady('stnk',d)&&fieldsReady('unit',d)&&docsReady(d))){
        toast('Lengkapi input dan unggah wajib dulu.');
        return;
      }
      saveDraft({saved:true,step:'docs'});
      toast('SPK/26/CLD/00426 tersimpan. Booking fee menyusul. Bukan ketik ulang di SO.');
      show('spk');
    });
  });
  document.querySelectorAll('[data-spk-reset]').forEach(function(b){
    b.addEventListener('click',function(){
      if(window.FAST && FAST.save){
        localStorage.removeItem(FAST.DRAFT_KEY);
      }
      applySpkDraft();
      toast('Draft dikosongkan. Isi dari awal lagi.');
    });
  });
  document.querySelectorAll('#spk_baru [data-draft-f]').forEach(function(inp){
    function persist(){
      var fields=Object.assign({}, draftData().fields||{});
      fields[inp.getAttribute('data-draft-f')]=inp.value.trim();
      saveDraft({fields:fields});
    }
    inp.addEventListener('change', persist);
    inp.addEventListener('blur', persist);
  });
  function procSteps(){
    return [
    {id:'spk',label:'SPK'},
    {id:'quot',label:'Quotation'},
    {id:'so',label:'SO'},
    {id:'afi_d',label:'AFI'},
    {id:'do',label:'DO'},
    {id:'bill_d',label:'Billing'},
    {id:'kirim_d',label:'Delivery'},
    {id:'stnk_d',label:'STNK'}
    ];
  }
  function qtData(){ return (window.FAST && FAST.load ? FAST.load(FAST.QT_KEY) : null) || {rev:1,stale:false,afi:false,dof:false}; }
  function bfPaid(){ var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null; return !!(s && s.paid); }
  function applyDewiProc(){
    var paid=bfPaid();
    var q=qtData();
    var rev=q.rev||1;
    var soRev=q.soRev||1;
    var stale=!!q.stale;
    var y=q.otrYaris||296800000;
    var a=q.otrAgya||175900000;
    document.querySelectorAll('[data-qt-rev]').forEach(function(el){ el.textContent=String(rev); });
    document.querySelectorAll('[data-so-rev]').forEach(function(el){ el.textContent=String(soRev); });
    document.querySelectorAll('[data-qt-otr="yaris"]').forEach(function(el){ el.textContent=formatRp(y); });
    document.querySelectorAll('[data-qt-otr="agya"]').forEach(function(el){ el.textContent=formatRp(a); });
    document.querySelectorAll('[data-qt-fresh]').forEach(function(el){ el.hidden=stale; });
    document.querySelectorAll('[data-qt-stale]').forEach(function(el){ el.hidden=!stale; });
    document.querySelectorAll('[data-so-stale]').forEach(function(el){ el.hidden=!(paid && stale); });
    var ready=document.querySelector('[data-so-ready]');
    if(ready) ready.hidden=!paid || stale;
    var qtPush=document.querySelector('[data-qt-push]');
    if(qtPush) qtPush.hidden=!stale;
    var so2tag=document.querySelector('[data-so2-tag]');
    if(so2tag){
      so2tag.textContent=stale?'QT berubah · SO Agya harus ikut harga baru':'Booking belum · SO tertahan';
      so2tag.className='tag '+(stale?'hold':'mute');
    }
    document.querySelectorAll('[data-afi-d-wait]').forEach(function(el){ el.hidden=paid && !stale; });
    document.querySelectorAll('[data-afi-need-so]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-afi-need-qt]').forEach(function(el){ el.hidden=!paid || !stale; });
    document.querySelectorAll('[data-afi-d-open]').forEach(function(el){ el.hidden=!paid || stale || !!q.afi; });
    document.querySelectorAll('[data-afi-d-sent]').forEach(function(el){ el.hidden=!q.afi || stale; });
    document.querySelectorAll('[data-dewi-afi-done]').forEach(function(el){ el.hidden=!q.afi || stale; });
    document.querySelectorAll('[data-do-wait]').forEach(function(el){ el.hidden=!!q.afi && !stale; });
    document.querySelectorAll('[data-do-open]').forEach(function(el){ el.hidden=!q.afi || stale || !!q.dof; });
    document.querySelectorAll('[data-do-sent]').forEach(function(el){ el.hidden=!q.dof || stale; });
    document.querySelectorAll('[data-bill-need-do]').forEach(function(el){ el.hidden=!!q.dof; });
    document.querySelectorAll('[data-bill-has-do]').forEach(function(el){ el.hidden=!q.dof; });
    var billDo=document.querySelector('[data-bill-do]');
    if(billDo) billDo.textContent=q.dof?'Terbit':'Menunggu';
    var stnkAfi=document.querySelector('[data-stnk-afi]');
    if(stnkAfi){
      stnkAfi.classList.toggle('done', !!q.afi);
      var t=stnkAfi.querySelector('.t');
      if(t) t.textContent=q.afi?'Pengajuan terkirim':'Menunggu SO / pengajuan';
    }
    if(window.FAST && FAST.renderLineage) FAST.renderLineage({payJob:payJobId, screen:(document.querySelector('.screen.on')||{}).id});
  }
  document.querySelectorAll('[data-qt-revise]').forEach(function(b){
    b.addEventListener('click',function(){
      var q=qtData();
      if(window.FAST && FAST.save) FAST.save({
        rev:(q.rev||1)+1,
        stale:true,
        otrYaris:298400000,
        otrAgya:177200000
      }, FAST.QT_KEY);
      applyDewiProc();
      toast('Quotation berubah. SO Yaris dan SO Agya harus ikut harga baru.');
    });
  });
  document.querySelectorAll('[data-qt-push]').forEach(function(b){
    b.addEventListener('click',function(){
      var q=qtData();
      if(window.FAST && FAST.save) FAST.save({stale:false, soRev:q.rev||1}, FAST.QT_KEY);
      applyDewiProc();
      toast('Semua SO terkait mengikuti quotation rev '+(q.rev||1)+'. SO Yaris diperbarui. SO Agya memakai OTR baru saat booking meet.');
    });
  });
  document.querySelectorAll('[data-dewi-afi]').forEach(function(b){
    b.addEventListener('click',function(){
      if(!bfPaid()){ toast('SO Yaris belum terbuka. Booking fee dulu.'); return; }
      if(qtData().stale){ toast('Refresh SO dari quotation dulu.'); return; }
      if(window.FAST && FAST.save) FAST.save({afi:true}, FAST.QT_KEY);
      applyDewiProc();
      toast('AFI terkirim. Data STNK dari SPK. Lanjut DO.');
    });
  });
  document.querySelectorAll('[data-dewi-do]').forEach(function(b){
    b.addEventListener('click',function(){
      if(!qtData().afi){ toast('AFI dulu sebelum DO.'); return; }
      if(window.FAST && FAST.save) FAST.save({dof:true}, FAST.QT_KEY);
      applyDewiProc();
      toast('DO/26/CLD/01426 terbit. Billing menunggu ≥30%.');
    });
  });
  function applyDelivery(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.DEL_KEY) : null;
    var sent=!!(s && s.requested);
    document.querySelectorAll('[data-del-open]').forEach(function(el){ el.hidden=sent; });
    document.querySelectorAll('[data-del-sent]').forEach(function(el){ el.hidden=!sent; });
    document.querySelectorAll('[data-del-spec]').forEach(function(el){ el.textContent=sent?'Menunggu jadwal armada · Deliverable 3':'Tindakan: ajukan pengiriman'; });
    document.querySelectorAll('[data-del-tag]').forEach(function(el){ el.textContent=sent?'Request terkirim':'Siap kirim'; el.className='tag '+(sent?'wait':'ok'); });
  }
  var afiKind='none';
  var afiExcKind='early';
  var afiKindLabel={none:'Standar · tanpa pilih nomor',pilih:'Pilih nomor',ganjil:'Plat ganjil',genap:'Plat genap'};
  function afiKindText(s){
    var labels={none:'Standar · tanpa pilih nomor',pilih:'Pilih nomor',ganjil:'Plat ganjil',genap:'Plat genap'};
    var k=(s&&s.kind)||'none';
    var label=labels[k]||labels.none;
    if(k==='pilih' && s && s.plate) label='Pilih nomor · '+s.plate;
    return label;
  }
  function afiData(){ return (window.FAST && FAST.load ? FAST.load(FAST.AFI_KEY) : null) || {}; }
  function afiExcSt(kind){
    var s=afiData();
    return (kind==='nobill' ? s.excNobill : s.excEarly) || 'draft';
  }
  function setAfiExcView(kind){
    afiExcKind=kind==='nobill'?'nobill':'early';
    document.querySelectorAll('#exc_afi [data-afi-exc]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-afi-exc')===afiExcKind);
    });
    document.querySelectorAll('[data-afi-exc-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-afi-exc-panel')!==afiExcKind;
    });
    var title=document.querySelector('[data-afi-exc-title]');
    var lead=document.querySelector('[data-afi-exc-lead]');
    var reason=document.getElementById('excAfiReason');
    if(title) title.textContent=afiExcKind==='nobill'?'Billing tanpa AFI':'AFI sebelum billing';
    if(lead) lead.textContent=afiExcKind==='nobill'
      ?'Budi Santoso · SPK/26/CLD/00418. Billing tanpa AFI. Data STNK tetap lengkap di SPK. Bukan waiver 30%.'
      :'Budi Santoso · SPK/26/CLD/00418. AFI dulu, billing menyusul. Data STNK dari SPK. Bukan waiver 30%.';
    if(reason && !reason.dataset.locked){
      reason.value=afiExcKind==='nobill'
        ?'Billing perlu terbit minggu ini untuk closing cabang. AFI menyusul. Nama dan alamat STNK sudah lengkap di SPK. Bukan melewati 30%.'
        :'Unit perlu proses STNK lebih dulu karena jadwal Samsat cabang. Billing tetap diajukan minggu ini. Bukan melewati 30%.';
    }
    applyAfiExcPath();
  }
  function applyAfiExcPath(){
    var st=afiExcSt(afiExcKind);
    var notes={
      draft:'Belum diajukan. Jelaskan kenapa urutan billing dan AFI harus dipecah.',
      submitted:'Pengajuan masuk. Admin Cilandak cek alasan, lalu teruskan ke Kepala Administrasi.',
      verified:'Admin sudah cek. Kepala Administrasi memutuskan pecah urutan.',
      approved:afiExcKind==='nobill'?'Disetujui. Billing boleh tanpa AFI. AFI tetap wajib menyusul. 30% tidak di-waive.':'Disetujui. AFI boleh sebelum billing. Billing tetap wajib. 30% tidak di-waive.',
      returned:'Revisi: lengkapi alasan sesuai komentar Kepala Cabang.',
      rejected:'Ditolak. Pakai jalur billing + AFI bersama. 30% tidak di-waive.'
    };
    var note=document.querySelector('[data-exc-afi-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf((st==='returned'||st==='rejected')?'draft':st);
    document.querySelectorAll('[data-exc-afi-path] [data-step]').forEach(function(el){
      var si=order.indexOf(el.getAttribute('data-step'));
      el.classList.remove('on','ok');
      if(st==='approved' && si<=3) el.classList.add('ok');
      else if(si<idx) el.classList.add('ok');
      else if(si===idx) el.classList.add('on');
    });
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui',returned:'Revisi',rejected:'Ditolak'};
    if(currentRole==='mgmt' && (st==='draft'||st==='submitted')) tags[st]='Siap diputuskan';
    var sel=afiExcKind==='nobill'?'[data-afi-nobill-tag]':'[data-afi-early-tag]';
    document.querySelectorAll(sel).forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':(st==='returned'||st==='rejected')?'stop':'hold');
    });
    renderMgmtLog('afi');
  }
  function applyAfi(){
    var s=afiData();
    var pair=!!s.pair;
    var afi=!!s.afi;
    var bill=!!s.bill;
    var done=pair||(afi&&bill);
    var early=afiExcSt('early');
    var nobill=afiExcSt('nobill');
    var canAfiOnly=!afi && !pair && (early==='approved' || bill);
    var canBillOnly=!bill && !pair && (nobill==='approved' || afi);
    document.querySelectorAll('[data-afi-open]').forEach(function(el){ el.hidden=done||afi; });
    document.querySelectorAll('[data-afi-sent]').forEach(function(el){ el.hidden=!done && !afi && !bill; });
    document.querySelectorAll('[data-afi-submit]').forEach(function(el){ el.hidden=!canAfiOnly; });
    document.querySelectorAll('[data-afi-bill]').forEach(function(el){ el.hidden=!canBillOnly; });
    document.querySelectorAll('[data-afi-pair]').forEach(function(el){ el.hidden=done||afi||bill; });
    document.querySelectorAll('[data-afi-admin]').forEach(function(el){ el.hidden=!afi && !pair; });
    document.querySelectorAll('[data-afi-cust-wait]').forEach(function(el){ el.hidden=afi||pair; });
    document.querySelectorAll('[data-afi-cust-sent]').forEach(function(el){ el.hidden=!(afi||pair); });
    var spec='Tindakan: ajukan billing + AFI bersama · data STNK dari SPK';
    var tag='Berpasangan';
    var tagCls='wait';
    var status='Berpasangan';
    var sentCopy='Billing dan AFI masuk berpasangan. Proses terbit STNK menyusul.';
    var billSrc='Diajukan bersama AFI';
    var billRule='Bersama AFI · data STNK SPK lengkap · ≥30%';
    var money='62,7% terbayar · data STNK lengkap di SPK · ajukan billing + AFI bersama';
    var hint='Belum ada exception. Pakai jalur berpasangan.';
    if(done||(afi&&bill)||pair){
      spec='Billing + AFI sudah diajukan';
      tag='Selesai'; tagCls='ok'; status='Masuk';
      billSrc='Billing diajukan · AFI memakai data SPK';
      billRule='AFI & billing masuk · ≥30% terpenuhi';
      money='Billing dan AFI sudah diajukan · delivery menunggu lunas';
    } else if(afi && !bill){
      spec='AFI masuk (exception) · billing menyusul';
      tag='AFI dulu'; tagCls='wait'; status='AFI dulu';
      sentCopy='AFI diajukan lebih dulu (exception). Billing belum.';
      billSrc='AFI masuk · billing belum';
      money='AFI sudah (exception) · billing masih menunggu';
    } else if(bill && !afi){
      spec='Billing masuk (exception) · AFI menyusul';
      tag='Billing dulu'; tagCls='wait'; status='Billing dulu';
      sentCopy='Billing diajukan tanpa AFI (exception). AFI belum.';
      billSrc='Billing diajukan · AFI belum';
      money='Billing sudah (exception) · AFI masih menunggu';
    }
    if(canAfiOnly) hint=bill?'Billing sudah (exception). Lanjutkan AFI.':'Exception AFI dulu disetujui. Tombol AFI saja terbuka.';
    if(canBillOnly) hint=afi?'AFI sudah (exception). Lanjutkan billing.':'Exception billing tanpa AFI disetujui. Tombol billing saja terbuka.';
    if(early==='submitted'||early==='verified') hint='Exception AFI dulu sedang diputuskan.';
    if(nobill==='submitted'||nobill==='verified') hint='Exception billing tanpa AFI sedang diputuskan.';
    document.querySelectorAll('[data-afi-spec]').forEach(function(el){ el.textContent=spec; });
    document.querySelectorAll('[data-afi-tag]').forEach(function(el){ el.textContent=tag; el.className='tag '+tagCls; });
    document.querySelectorAll('[data-afi-status]').forEach(function(el){ el.textContent=status; });
    document.querySelectorAll('[data-afi-sent-copy]').forEach(function(el){ el.textContent=sentCopy; });
    document.querySelectorAll('[data-afi-billing-src]').forEach(function(el){ el.textContent=billSrc; });
    document.querySelectorAll('[data-afi-bill-rule]').forEach(function(el){ el.textContent=billRule; });
    document.querySelectorAll('[data-afi-money-hint]').forEach(function(el){ el.textContent=money; });
    document.querySelectorAll('[data-afi-exc-hint]').forEach(function(el){ el.textContent=hint; });
    document.querySelectorAll('[data-afi-kind-out]').forEach(function(el){ el.textContent=afiKindText(s); });
    document.querySelectorAll('[data-afi-pair-gate]').forEach(function(li){
      var mark=li.querySelector('.mark');
      var why=li.querySelector('.why');
      var tg=li.querySelector('.tag');
      if(done||pair){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Billing dan AFI diajukan berpasangan · data STNK dari SPK';
        if(tg){ tg.textContent='Masuk'; tg.className='tag ok'; }
      } else if(afi && !bill){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Exception: AFI sebelum billing · billing menyusul';
        if(tg){ tg.textContent='AFI dulu'; tg.className='tag wait'; }
      } else if(bill && !afi){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Exception: billing tanpa AFI · AFI menyusul';
        if(tg){ tg.textContent='Billing dulu'; tg.className='tag wait'; }
      } else {
        if(mark){ mark.className='mark idle'; mark.textContent='•'; }
        if(why) why.textContent='Diajukan berpasangan. AFI dulu atau billing tanpa AFI = Approval Engine';
        if(tg){ tg.textContent='Berpasangan'; tg.className='tag mute'; }
      }
    });
    document.querySelectorAll('[data-afi-step="pair"]').forEach(function(el){
      el.classList.toggle('now', !done);
      el.classList.toggle('done', done);
    });
    var mile=document.querySelector('[data-afi-mile]');
    if(mile){
      mile.classList.toggle('done', afi||pair);
      var m=mile.querySelector('.m');
      if(m) m.textContent=(afi||pair)?'✓':'•';
    }
    document.querySelectorAll('[data-afi-early-tag]').forEach(function(el){
      var st=early;
      el.textContent=st==='approved'?'Disetujui':st==='returned'?'Dikembalikan':st==='draft'?'Menunggu pengajuan':'Dalam proses';
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
    });
    document.querySelectorAll('[data-afi-nobill-tag]').forEach(function(el){
      var st=nobill;
      el.textContent=st==='approved'?'Disetujui':st==='returned'?'Dikembalikan':st==='draft'?'Menunggu pengajuan':'Dalam proses';
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
    });
    applyAfiExcPath();
  }
  function plateVal(){
    var plateEl=document.getElementById('afiPlate');
    return (plateEl&&plateEl.value||'').trim();
  }
  function setAfiKind(kind){
    afiKind=kind||'none';
    document.querySelectorAll('[data-afi-kind]').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-afi-kind')===afiKind);
    });
    var wrap=document.querySelector('[data-afi-plate-wrap]');
    if(wrap) wrap.hidden = afiKind!=='pilih';
    var hint=document.querySelector('[data-afi-kind-hint]');
    if(hint){
      hint.textContent=afiKind==='pilih'?'Tulis nomor yang diminta. Proses alokasi nomor menyusul.'
        :afiKind==='ganjil'?'Meminta plat ganjil. Proses menyusul.'
        :afiKind==='genap'?'Meminta plat genap. Proses menyusul.'
        :'Plat standar. Tidak memilih nomor, ganjil, atau genap.';
    }
  }
  document.querySelectorAll('[data-afi-kind]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiKind(b.getAttribute('data-afi-kind')); });
  });
  document.querySelectorAll('#exc_afi [data-afi-exc]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiExcView(b.getAttribute('data-afi-exc')); });
  });
  function saveAfi(extra){
    var payload=Object.assign({spk:'SPK/26/CLD/00418',kind:afiKind,plate:plateVal(),name:'Budi Santoso',addr:'Jl. Kemang Selatan VIII No. 12, Jakarta Selatan'}, extra);
    if(window.FAST && FAST.save) FAST.save(payload, FAST.AFI_KEY);
    applyAfi();
  }
  document.querySelectorAll('[data-afi-pair]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiKind==='pilih' && !plateVal()){ toast('Isi nomor yang diminta, atau pilih ganjil/genap/standar.'); return; }
      saveAfi({pair:true,afi:true,bill:true});
      toast('Billing dan AFI diajukan bersama. Data STNK dari SPK.');
    });
  });
  document.querySelectorAll('[data-afi-submit]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt('early')!=='approved' && !afiData().bill){ toast('AFI dulu butuh Approval Engine.'); show('exc_afi'); setAfiExcView('early'); return; }
      if(afiKind==='pilih' && !plateVal()){ toast('Isi nomor yang diminta dulu.'); return; }
      saveAfi({afi:true});
      toast('AFI diajukan sebelum billing (exception).');
    });
  });
  document.querySelectorAll('[data-afi-bill]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt('nobill')!=='approved' && !afiData().afi){ toast('Billing tanpa AFI butuh Approval Engine.'); show('exc_afi'); setAfiExcView('nobill'); return; }
      saveAfi({bill:true});
      toast('Billing diajukan tanpa AFI (exception). AFI menyusul.');
    });
  });
  function setAfiExc(next, msg){
    var patch=afiExcKind==='nobill'?{excNobill:next}:{excEarly:next};
    saveAfi(patch);
    toast(msg);
  }
  document.querySelectorAll('[data-exc-afi-submit]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiExc('submitted','Pengajuan pecah urutan terkirim. Admin akan cek.'); });
  });
  document.querySelectorAll('[data-exc-afi-verify]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt(afiExcKind)==='draft'||afiExcSt(afiExcKind)==='returned'){ toast('Frontman belum mengajukan.'); return; }
      setAfiExc('verified','Alasan dicek. Siap diputuskan Kepala Administrasi.');
    });
  });
  document.querySelectorAll('[data-exc-afi-approve]').forEach(function(b){
    b.addEventListener('click',function(){
      var st=afiExcSt(afiExcKind);
      if(st==='draft'||st==='returned'){ toast('Belum ada pengajuan.'); return; }
      setAfiExc('approved', afiExcKind==='nobill'?'Disetujui: billing tanpa AFI. 30% tidak di-waive.':'Disetujui: AFI sebelum billing. 30% tidak di-waive.');
    });
  });
  document.querySelectorAll('[data-exc-afi-reject]').forEach(function(b){
    b.addEventListener('click',function(){ setAfiExc('returned','Dikembalikan. Pakai jalur berpasangan, atau ajukan ulang.'); });
  });
