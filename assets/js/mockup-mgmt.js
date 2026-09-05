/* Inbox management + kanal EDC */
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"]/g,function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]); });
  }
  function fmtWhen(ts){
    try { return new Date(ts).toLocaleString('id-ID',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); }
    catch(e){ return ''; }
  }
  function mgmtLogs(caseId){
    if(caseId==='alamat') return ((FAST.load()||{}).excLog)||[];
    if(caseId==='nama') return ((FAST.load(FAST.NAMA_KEY)||{}).namaLog)||[];
    if(caseId==='epo') return (epoUnitOf('1288').epoLog)||[];
    if(caseId==='stnk') return ((FAST.load(FAST.STNK_KEY)||{}).stnkLog)||[];
    var s=afiData();
    if(caseId==='early'||(caseId==='afi'&&afiExcKind!=='nobill')) return s.logEarly||[];
    return s.logNobill||[];
  }
  function renderMgmtLog(caseId){
    var key=caseId==='afi'?(afiExcKind==='nobill'?'nobill':'early'):caseId;
    var ul=document.querySelector('[data-mgmt-log="'+(caseId==='early'||caseId==='nobill'?'afi':caseId)+'"]');
    if(caseId==='afi') ul=document.querySelector('[data-mgmt-log="afi"]');
    if(!ul) return;
    ul.innerHTML='';
    mgmtLogs(key).slice().reverse().forEach(function(it){
      var li=document.createElement('li');
      li.innerHTML='<i class="own p">K</i><div><b>'+escapeHtml(it.label)+'</b>'+(it.comment?': '+escapeHtml(it.comment):'')+'<time>'+fmtWhen(it.ts)+' · '+(it.by||'Kepala Cabang')+'</time></div>';
      ul.appendChild(li);
    });
  }
  function stnkState(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.STNK_KEY) : null;
    return (s && s.stnk) || 'open';
  }
  function applyStnk(){
    var st=stnkState();
    var tags={open:'Menunggu Kepala Cabang',returned:'Revisi',approved:'Tindak lanjut dicatat',rejected:'Waiver ditolak'};
    var note=document.querySelector('#exc_stnk .exc-note');
    var notes={
      open:'Aging ≥15 hari naik sendiri. Setujui tindak lanjut biro jasa. Bukan tombol melewati pelunasan — unit ini sudah lunas.',
      returned:'Revisi: lengkapi update biro jasa sesuai komentar, lalu ajukan putusan lagi.',
      approved:'Tindak lanjut biro jasa dicatat. STNK tetap dipantau. Bukan waiver.',
      rejected:'Waiver ditolak. Tidak ada pengecualian pelunasan (sudah lunas). Pantau terbit STNK secara operasional.'
    };
    if(note){
      note.textContent=notes[st]||notes.open;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    document.querySelectorAll('[data-stnk-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.open;
      el.className='tag '+(st==='approved'?'ok':(st==='returned'||st==='rejected')?'stop':'hold');
    });
    renderMgmtLog('stnk');
  }
  function mgmtCaseState(caseId){
    if(caseId==='alamat') return excAlamatState();
    if(caseId==='nama') return excNamaState();
    if(caseId==='epo') return excEpoState('1288');
    if(caseId==='early') return afiExcSt('early');
    if(caseId==='nobill') return afiExcSt('nobill');
    if(caseId==='stnk'){
      var st=stnkState();
      return st==='open'?'verified':st;
    }
    return 'open';
  }
  function mgmtBucket(st){
    if(st==='returned') return 'revise';
    if(st==='approved'||st==='rejected') return 'done';
    return 'open';
  }
  function applyMgmtInbox(){
    var nOpen=0,nRev=0,nDone=0;
    document.querySelectorAll('#mgmtList .order-card').forEach(function(card){
      var id=card.getAttribute('data-mgmt-case');
      var st=mgmtCaseState(id);
      var bucket=mgmtBucket(st);
      card.setAttribute('data-mgmt-bucket', bucket);
      var owner=card.getAttribute('data-mgmt-owner')||'ka';
      if(mgmtSeat!=='abh' && owner!==mgmtSeat) return;
      if(bucket==='open') nOpen++;
      if(bucket==='revise') nRev++;
      if(bucket==='done') nDone++;
    });
    var line=document.querySelector('[data-mgmt-count]');
    if(line) line.innerHTML='<b>'+nOpen+' menunggu</b> · '+nRev+' revisi · '+nDone+' selesai';
    document.querySelectorAll('[data-mgmt-pill]').forEach(function(el){ el.textContent=String(nOpen+nRev); });
    filterMgmtInbox();
    renderMgmtLog('alamat');
    renderMgmtLog('nama');
    renderMgmtLog('epo');
    renderMgmtLog('afi');
    renderMgmtLog('stnk');
  }
  var mgmtFilter='all';
  function filterMgmtInbox(){
    document.querySelectorAll('#mgmtList .order-card').forEach(function(card){
      var b=card.getAttribute('data-mgmt-bucket')||'open';
      var owner=card.getAttribute('data-mgmt-owner')||'ka';
      var seatOk=mgmtSeat==='abh'||owner===mgmtSeat;
      var match=(mgmtFilter==='all'||b===mgmtFilter)&&seatOk;
      card.classList.toggle('is-hidden', !match);
    });
  }
  document.addEventListener('click',function(e){
    var payF=e.target.closest('[data-admin-pay-filter]');
    if(payF){
      adminPayFilter=payF.getAttribute('data-admin-pay-filter');
      document.querySelectorAll('[data-admin-pay-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===payF?'true':'false');
      });
      if(currentBookKey!=='pay') activateAdminBook('pay');
      else filterAdminBook();
      return;
    }
    var f=e.target.closest('[data-mgmt-filter]');
    var seatBtn=e.target.closest('[data-mgmt-seat]');
    if(seatBtn){
      mgmtSeat=seatBtn.getAttribute('data-mgmt-seat')||'ka';
      applyRole('mgmt');
      syncMgmtSeat();
      show((MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).home);
      applyMgmtInbox();
      toast('Kursi: '+(MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).label);
      return;
    }
    if(f){
      mgmtFilter=f.getAttribute('data-mgmt-filter');
      document.querySelectorAll('[data-mgmt-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===f?'true':'false');
      });
      show('mgmt_inbox');
      filterMgmtInbox();
      return;
    }
    var b=e.target.closest('[data-mgmt-act]');
    if(!b) return;
    decideMgmt(b.getAttribute('data-mgmt-case'), b.getAttribute('data-mgmt-act'));
  });
  function decideMgmt(caseId, act){
    var boxId=caseId==='afi'||caseId==='early'||caseId==='nobill'?'afi':caseId;
    var el=document.getElementById('mgmtComment-'+boxId);
    var comment=((el&&el.value)||'').trim();
    if((act==='revise'||act==='reject') && !comment){
      toast('Isi komentar untuk '+(act==='revise'?'revisi':'penolakan')+'.');
      if(el) el.focus();
      return;
    }
    var need=caseId==='epo'?'om':(caseId==='stnk'?'kc':(String(caseId).indexOf('ops-')===0?'om':'ka'));
    if(mgmtSeat!==need){
      toast('Putusan ini untuk '+(MGMT_SEATS[need]||{}).label+'. Ganti kursi Management.');
      return;
    }
    var labels={approve:'Setujui',revise:'Revisi',reject:'Tolak'};
    var next=act==='approve'?'approved':act==='revise'?'returned':'rejected';
    var entry={act:act,label:labels[act]||act,comment:comment,by:(MGMT_SEATS[mgmtSeat]||MGMT_SEATS.ka).label,ts:Date.now()};
    if(caseId==='alamat'){
      var log=((FAST.load()||{}).excLog)||[];
      log.push(entry);
      FAST.save({excAlamat:next,excLog:log});
      applyExcAlamat();
      toast(act==='approve'?'Disetujui dengan syarat. Pelunasan tetap wajib.':act==='revise'?'Diminta revisi. Frontman lengkapi sesuai komentar.':'Ditolak. Ikuti dokumen standar.');
    } else if(caseId==='nama'){
      var nlog=((FAST.load(FAST.NAMA_KEY)||{}).namaLog)||[];
      nlog.push(entry);
      FAST.save({excNama:next,namaLog:nlog}, FAST.NAMA_KEY);
      applyExcNama();
      toast(act==='approve'?'Nama STNK disetujui untuk AFI. Booking fee tetap wajib.':act==='revise'?'Revisi nama: lengkapi supporting document.':'Ditolak. Samakan nama atau unggah dokumen sah.');
    } else if(caseId==='epo'){
      patchB2b(function(st){
        var u=st.units[st.selected]||st.units['1288'];
        if(!u) return;
        u.excEpo=next;
        u.epoLog=(u.epoLog||[]).concat([entry]);
      });
      applyExcEpo();
      applyB2b();
      toast(act==='approve'?'Disetujui: paperless tanpa e-PO. Pelunasan tetap butuh e-PO asli.':act==='revise'?'Revisi: lengkapi paket/DP atau tarik e-PO.':'Ditolak. Tagih setelah e-PO leasing terbit.');
    } else if(caseId==='stnk'){
      var slog=((FAST.load(FAST.STNK_KEY)||{}).stnkLog)||[];
      slog.push(entry);
      FAST.save({stnk:next==='approved'?'approved':next,stnkLog:slog}, FAST.STNK_KEY);
      applyStnk();
      toast(act==='approve'?'Tindak lanjut biro jasa dicatat. Bukan waiver.':act==='revise'?'Revisi: minta update Admin/biro jasa.':'Waiver ditolak. STNK tetap dipantau operasional.');
    } else {
      var kind=caseId==='nobill'||(caseId==='afi'&&afiExcKind==='nobill')?'nobill':'early';
      setAfiExcView(kind);
      var patch=kind==='nobill'?{excNobill:next,logNobill:(afiData().logNobill||[]).concat([entry])}:{excEarly:next,logEarly:(afiData().logEarly||[]).concat([entry])};
      saveAfi(patch);
      applyAfiExcPath();
      toast(act==='approve'?(kind==='nobill'?'Disetujui: billing tanpa AFI. 30% tidak di-waive.':'Disetujui: AFI sebelum billing. 30% tidak di-waive.'):act==='revise'?'Revisi pecah urutan. Lengkapi alasan.':'Ditolak. Pakai jalur billing + AFI bersama.');
    }
    if(el) el.value='';
    applyMgmtInbox();
  }

  var edcDevice='EDC-01';
  function showBfPanel(mode){
    document.querySelectorAll('#bfSeg [data-bf]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-bf')===mode?'true':'false');
    });
    document.querySelectorAll('[data-bf-panel]').forEach(function(p){
      p.classList.toggle('on', p.getAttribute('data-bf-panel')===mode);
    });
  }
  function showCashPanel(mode){
    if(currentRole==='cust' && mode==='edc') mode='qris';
    document.querySelectorAll('#cashSeg [data-cash]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-cash')===mode?'true':'false');
    });
    document.querySelectorAll('[data-cash-panel]').forEach(function(p){
      p.classList.toggle('on', p.getAttribute('data-cash-panel')===mode);
    });
  }
  function applyCashlessEdc(){
    var cust=currentRole==='cust';
    document.querySelectorAll('#cashless [data-cash="edc"], #cashless [data-cash-panel="edc"]').forEach(function(el){
      el.hidden=cust;
    });
    var note=document.querySelector('[data-cash-cust-note]');
    if(note) note.hidden=!cust;
    var title=document.querySelector('[data-cash-title]');
    if(title) title.textContent=cust
      ? 'Bayar di cabang: QRIS atau CDM'
      : (currentRole==='admin' ? 'Lihat pembayaran transaksi yang sama' : 'Terima di cabang atau kirim tautan');
    if(cust){
      var edcOn=document.querySelector('#cashSeg [data-cash="edc"][aria-pressed="true"]');
      if(edcOn) showCashPanel('qris');
    }
  }
  document.querySelectorAll('#bfSeg [data-bf]').forEach(function(b){
    b.addEventListener('click',function(){ showBfPanel(b.getAttribute('data-bf')); });
  });
  document.querySelectorAll('#cashSeg [data-cash]').forEach(function(b){
    b.addEventListener('click',function(){ showCashPanel(b.getAttribute('data-cash')); });
  });
  document.querySelectorAll('[data-edc-device]').forEach(function(b){
    b.addEventListener('click',function(){
      edcDevice=b.getAttribute('data-edc-device');
      var list=b.parentElement;
      list.querySelectorAll('[data-edc-device]').forEach(function(x){
        x.setAttribute('aria-pressed', x===b?'true':'false');
      });
      var panel=b.closest('[data-bf-panel], [data-cash-panel]');
      var hint=panel?panel.querySelector('.edc-hint'):null;
      var name=b.querySelector('b');
      if(hint) hint.textContent='Siap dorong ke '+(name?name.textContent:edcDevice);
    });
  });
