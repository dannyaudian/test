/* Exception, STNK, inbox management */
  function excAlamatState(){
    var s=window.FAST && FAST.load ? FAST.load() : null;
    return (s && s.excAlamat) || 'draft';
  }
  function applyExcAlamat(){
    var st=excAlamatState();
    var notes={
      draft:'Belum diajukan. Frontman kirim alasan dan bukti pengganti. SLA 4 jam mulai saat pengajuan masuk.',
      submitted:'Pengajuan masuk. Admin Cilandak cek bukti, lalu teruskan ke Kepala Administrasi.',
      verified:'Admin sudah cek. Kepala Administrasi memutuskan dengan syarat: alamat asli sebelum DO.',
      approved:'Disetujui dengan syarat. Document gate lolos bersyarat. Pelunasan cash tetap wajib sebelum delivery.',
      returned:'Dikembalikan untuk revisi. Lengkapi sesuai komentar Kepala Administrasi, lalu kirim ulang.',
      rejected:'Ditolak. Ikuti kelengkapan dokumen standar. Bukan waiver pelunasan.'
    };
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui bersyarat',returned:'Revisi',rejected:'Ditolak'};
    if(currentRole==='mgmt' && (st==='draft'||st==='submitted')) tags[st]='Siap diputuskan';
    var specs={
      draft:'Waivable · Frontman ajukan → Admin cek → Kepala Administrasi',
      submitted:'Waivable · Admin sedang cek bukti',
      verified:'Waivable · Kepala Administrasi memutuskan',
      approved:'Syarat: alamat asli sebelum DO · pelunasan tetap wajib',
      returned:'Revisi: lengkapi bukti, kirim ulang',
      rejected:'Ditolak · lengkapi dokumen standar'
    };
    var note=document.querySelector('[data-exc-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf((st==='returned'||st==='rejected')?'draft':st);
    document.querySelectorAll('[data-exc-path] [data-step]').forEach(function(el){
      var step=el.getAttribute('data-step');
      var si=order.indexOf(step);
      el.classList.remove('on','ok');
      if(st==='approved' && si<=3) el.classList.add('ok');
      else if(si<idx) el.classList.add('ok');
      else if(si===idx) el.classList.add('on');
    });
    document.querySelectorAll('[data-exc-alamat-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':(st==='returned'||st==='rejected')?'stop':'hold');
    });
    document.querySelectorAll('[data-exc-alamat-spec]').forEach(function(el){ el.textContent=specs[st]||specs.draft; });
    var vault=document.getElementById('docAlamat');
    if(vault){
      var tag=vault.querySelector('.tag');
      var reuse=vault.querySelector('.reuse');
      var btn=vault.querySelector('[data-go="exc_alamat"]');
      if(st==='approved'){
        vault.classList.remove('miss');
        if(tag){ tag.className='tag ok'; tag.textContent='Lolos bersyarat'; }
        if(reuse) reuse.textContent='Syarat: alamat asli sebelum DO';
        if(btn) btn.textContent='Lihat keputusan';
      } else {
        vault.classList.add('miss');
        if(tag){ tag.className='tag hold'; tag.textContent='Perlu pembaruan'; }
        if(reuse) reuse.textContent='Waivable · Frontman';
        if(btn) btn.textContent='Ajukan exception';
      }
    }
    document.querySelectorAll('[data-exc-doc-gate]').forEach(function(li){
      var mark=li.querySelector('.mark');
      var why=li.querySelector('.why');
      var tag=li.querySelector('.tag');
      if(st==='approved'){
        if(mark){ mark.className='mark ok'; mark.textContent='✓'; }
        if(why) why.textContent='Exception disetujui · alamat asli sebelum DO';
        if(tag){ tag.className='tag ok'; tag.textContent='Bersyarat'; }
      } else {
        if(mark){ mark.className='mark no'; mark.textContent='!'; }
        if(why) why.textContent='5 dari 6 valid · bukti alamat kedaluwarsa · waivable';
        if(tag){ tag.className='tag hold'; tag.textContent='Exception'; }
      }
    });
    document.querySelectorAll('[data-exc-pill]').forEach(function(el){ el.textContent=(st==='approved'||st==='rejected')?'0':'1'; });
    renderMgmtLog('alamat');
  }
  function excNamaState(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.NAMA_KEY) : null;
    return (s && s.excNama) || 'draft';
  }
  function applyExcNama(){
    var st=excNamaState();
    var notes={
      draft:'Nama berbeda. Unggah supporting document di SPK, lalu ajukan. SLA 4 jam mulai saat pengajuan masuk.',
      submitted:'Pengajuan nama masuk. Admin Cilandak mencocokkan KTP STNK dengan field nama STNK.',
      verified:'Admin sudah cek. Kepala Administrasi memutuskan. Bukan waiver booking fee.',
      approved:'Nama STNK Andi Pratama disetujui untuk AFI. Booking fee dan 30% tetap non-waivable.',
      returned:'Dikembalikan. Lengkapi pernyataan atau KTP atas nama STNK.',
      rejected:'Ditolak. Samakan nama STNK dengan pemesan, atau unggah dokumen yang sah.'
    };
    var tags={draft:'Menunggu pengajuan',submitted:'Admin cek',verified:'Siap diputuskan',approved:'Disetujui',returned:'Revisi',rejected:'Ditolak'};
    var specs={
      draft:'Waivable · pemesan ≠ STNK · unggah supporting document',
      submitted:'Admin Cilandak sedang mencocokkan dokumen',
      verified:'Siap diputuskan Kepala Administrasi',
      approved:'Nama STNK dipakai AFI · syarat dokumen',
      returned:'Lengkapi supporting document',
      rejected:'Ditolak · perbaiki data SPK'
    };
    var note=document.querySelector('[data-exc-nama-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    document.querySelectorAll('[data-exc-nama-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':(st==='rejected'||st==='returned')?'stop':'hold');
    });
    document.querySelectorAll('[data-exc-nama-spec]').forEach(function(el){ el.textContent=specs[st]||specs.draft; });
    var path=document.querySelector('[data-exc-nama-path]');
    if(path){
      var order=['draft','submitted','verified','approved'];
      var idx=order.indexOf(st==='returned'||st==='rejected'?'draft':st);
      path.querySelectorAll('b[data-step]').forEach(function(b){
        var i=order.indexOf(b.getAttribute('data-step'));
        b.classList.toggle('on', i===idx);
        b.classList.toggle('ok', i<idx);
      });
    }
    renderMgmtLog('nama');
    if(window.FAST && FAST.renderMaster) FAST.renderMaster();
  }
  function setExcNama(next, msg){
    if(window.FAST && FAST.save) FAST.save({excNama:next}, FAST.NAMA_KEY);
    applyExcNama();
    toast(msg);
  }
  function epoUnitOf(id){
    if(!window.FAST || !FAST.b2bLoad) return {};
    var s=FAST.b2bLoad();
    return s.units[id||s.selected||'1288']||{};
  }
  function excEpoState(id){
    return epoUnitOf(id==null?'1288':id).excEpo||'draft';
  }
  function applyExcEpo(){
    if(!window.FAST || !FAST.b2bLoad) return;
    var s=FAST.b2bLoad();
    var work=s.units[s.selected]||s.units['1288']||{};
    var demo=s.units['1288']||{};
    var st=work.excEpo||'draft';
    var inbox=demo.excEpo||'draft';
    var notes={
      draft:'E-PO belum dari leasing. Setelah paket Frontman dan full DP, Administrasi mengajukan billing tanpa e-PO. Putusan: Operation Manager. Pelunasan tetap butuh e-PO asli.',
      submitted:'Pengajuan masuk. Admin Cilandak mencocokkan paket Frontman dan full DP B2B.',
      verified:'Admin sudah cek. Operation Manager memutuskan paperless tanpa e-PO. Bukan waiver DP atau TTD.',
      approved:'Paperless boleh. Pelunasan leasing tetap menunggu e-PO asli (total DP, nilai dibiayai, tenor).',
      returned:'Dikembalikan. Lengkapi paket Frontman / full DP, atau tarik e-PO di Alur B2B.',
      rejected:'Ditolak. Tagih hanya setelah e-PO leasing terbit. DP dan TTD tetap non-waivable.'
    };
    var tags={draft:'Menunggu pengajuan',submitted:'Admin cek',verified:'Siap OM',approved:'Paperless boleh',returned:'Revisi',rejected:'Ditolak'};
    var specs={
      draft:'Waivable · e-PO = total DP, nilai dibiayai, tenor · Operation Manager',
      submitted:'Admin Cilandak sedang mencocokkan paket + DP',
      verified:'Siap diputuskan Operation Manager',
      approved:'Paperless tanpa e-PO · pelunasan tetap e-PO asli',
      returned:'Lengkapi syarat, ajukan ulang',
      rejected:'Ditolak · tunggu e-PO leasing'
    };
    var note=document.querySelector('[data-exc-epo-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    document.querySelectorAll('[data-exc-epo-tag]').forEach(function(el){
      var use=el.closest('#mgmtList, #excList, #verifikasi')?inbox:st;
      el.textContent=tags[use]||tags.draft;
      el.className='tag '+(use==='approved'?'ok':(use==='rejected'||use==='returned')?'stop':'hold');
    });
    document.querySelectorAll('[data-exc-epo-spec]').forEach(function(el){ el.textContent=specs[inbox]||specs.draft; });
    var path=document.querySelector('[data-exc-epo-path]');
    if(path){
      var order=['draft','submitted','verified','approved'];
      var idx=order.indexOf(st==='returned'||st==='rejected'?'draft':st);
      path.querySelectorAll('b[data-step]').forEach(function(b){
        var i=order.indexOf(b.getAttribute('data-step'));
        b.classList.toggle('on', i===idx);
        b.classList.toggle('ok', i<idx);
      });
    }
    renderMgmtLog('epo');
  }
  function setExcEpo(next, msg){
    patchB2b(function(st){
      var u=st.units[st.selected]||st.units['1288'];
      if(u) u.excEpo=next;
    });
    applyExcEpo();
    applyB2b();
    applyMgmtInbox();
    toast(msg);
  }
  function setExcAlamat(next, msg){
    if(window.FAST && FAST.save) FAST.save({excAlamat:next});
    applyExcAlamat();
    toast(msg);
  }
  document.querySelectorAll('[data-exc-submit]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-exc-submit');
      if(kind==='nama') setExcNama('submitted','Pengajuan nama terkirim. Admin Cilandak akan cek supporting document.');
      else if(kind==='epo'){
        var u=epoUnitOf();
        if(!u.dpReceived || !FAST.b2bBillingComplete(u)){
          toast('Paket Frontman dan full DP B2B dulu. Gate e-PO hanya untuk billing tanpa e-PO.');
          return;
        }
        if(u.epoReceived){
          toast('E-PO leasing sudah ada. Tidak perlu pengecualian.');
          return;
        }
        setExcEpo('submitted','Pengajuan billing tanpa e-PO terkirim. Admin cek, lalu Operation Manager.');
      }
      else setExcAlamat('submitted','Pengajuan terkirim. Admin Cilandak akan cek bukti.');
    });
  });
  document.querySelectorAll('[data-exc-verify]').forEach(function(b){
    b.addEventListener('click',function(){
      var kind=b.getAttribute('data-exc-verify');
      if(kind==='nama'){
        if(excNamaState()==='draft' || excNamaState()==='returned'){
          toast('Frontman belum mengajukan nama. Minta pengajuan dulu.');
          return;
        }
        setExcNama('verified','Dokumen nama dicek. Siap diputuskan Kepala Administrasi.');
        return;
      }
      if(kind==='epo'){
        var st=epoUnitOf().excEpo||'draft';
        if(st==='draft'||st==='returned'){
          toast('Belum ada pengajuan billing tanpa e-PO.');
          return;
        }
        setExcEpo('verified','Paket dicek. Siap diputuskan Operation Manager.');
        return;
      }
      if(excAlamatState()==='draft' || excAlamatState()==='returned'){
        toast('Frontman belum mengajukan. Minta pengajuan dulu.');
        return;
      }
      setExcAlamat('verified','Bukti dicek. Siap diputuskan Kepala Administrasi.');
    });
  });
  document.querySelectorAll('[data-exc-approve]').forEach(function(b){
    b.addEventListener('click',function(){
      var st=excAlamatState();
      if(st==='draft'||st==='returned'){
        toast('Belum ada pengajuan. Approval Engine tidak melewati pelunasan.');
        return;
      }
      setExcAlamat('approved','Disetujui dengan syarat. Document gate lolos. Delivery cash tetap menunggu lunas.');
    });
  });
  document.querySelectorAll('[data-exc-reject]').forEach(function(b){
    b.addEventListener('click',function(){
      setExcAlamat('returned','Dikembalikan ke Frontman. Lengkapi bukti alamat.');
    });
  });

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
