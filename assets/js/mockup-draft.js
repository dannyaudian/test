/* Draft SPK Dewi + booking fee */
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
