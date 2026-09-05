/* AFI Budi */
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
      submitted:'Submission received. Cilandak Administration reviews the reason, then forwards it to the Head of Administration.',
      verified:'Administration has reviewed it. The Head of Administration decides on the split sequence.',
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
    var tags={draft:'Awaiting submission',submitted:'Awaiting Admin',verified:'Ready for decision',approved:'Approved',returned:'Revisi',rejected:'Ditolak'};
    if(currentRole==='mgmt' && (st==='draft'||st==='submitted')) tags[st]='Ready for decision';
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
      el.textContent=st==='approved'?'Approved':st==='returned'?'Returned':st==='draft'?'Awaiting submission':'In progress';
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
    });
    document.querySelectorAll('[data-afi-nobill-tag]').forEach(function(el){
      var st=nobill;
      el.textContent=st==='approved'?'Approved':st==='returned'?'Returned':st==='draft'?'Awaiting submission':'In progress';
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
      toast('AFI submitted before billing (exception).');
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
    b.addEventListener('click',function(){ setAfiExc('submitted','Split-sequence submission sent. Administration will review it.'); });
  });
  document.querySelectorAll('[data-exc-afi-verify]').forEach(function(b){
    b.addEventListener('click',function(){
      if(afiExcSt(afiExcKind)==='draft'||afiExcSt(afiExcKind)==='returned'){ toast('Frontman belum mengajukan.'); return; }
      setAfiExc('verified','Reason reviewed. Ready for the Head of Administration decision.');
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
    b.addEventListener('click',function(){ setAfiExc('returned','Returned. Use the paired route or resubmit.'); });
  });
