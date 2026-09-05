/* Exception alamat, nama, e-PO */
  function excAlamatState(){
    var s=window.FAST && FAST.load ? FAST.load() : null;
    return (s && s.excAlamat) || 'draft';
  }
  function applyExcAlamat(){
    var st=excAlamatState();
    var notes={
      draft:'Belum diajukan. Frontman kirim alasan dan bukti pengganti. SLA 4 jam mulai saat pengajuan masuk.',
      submitted:'Submission received. Cilandak Administration reviews the proof, then forwards it to the Head of Administration.',
      verified:'Administration has reviewed it. The Head of Administration approves it with one condition: original address proof before DO.',
      approved:'Disetujui dengan syarat. Document gate lolos bersyarat. Pelunasan cash tetap wajib sebelum delivery.',
      returned:'Returned for revision. Complete it based on the Head of Administration comment, then resubmit.',
      rejected:'Ditolak. Ikuti kelengkapan dokumen standar. Bukan waiver pelunasan.'
    };
    var tags={draft:'Awaiting submission',submitted:'Awaiting Admin',verified:'Ready for decision',approved:'Disetujui bersyarat',returned:'Revisi',rejected:'Ditolak'};
    if(currentRole==='mgmt' && (st==='draft'||st==='submitted')) tags[st]='Ready for decision';
    var specs={
      draft:'Waivable · Frontman submits → Admin reviews → Head of Administration',
      submitted:'Waivable · Admin sedang cek bukti',
      verified:'Waivable · Head of Administration decides',
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
        if(btn) btn.textContent='View decision';
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
      submitted:'Name submission received. Cilandak Administration matches the STNK ID with the STNK name field.',
      verified:'Administration has reviewed it. The Head of Administration decides. Not a booking fee waiver.',
      approved:'Nama STNK Andi Pratama disetujui untuk AFI. Booking fee dan 30% tetap non-waivable.',
      returned:'Returned. Complete the declaration or provide the STNK-named ID.',
      rejected:'Ditolak. Samakan nama STNK dengan pemesan, atau unggah dokumen yang sah.'
    };
    var tags={draft:'Awaiting submission',submitted:'Admin cek',verified:'Ready for decision',approved:'Approved',returned:'Revisi',rejected:'Ditolak'};
    var specs={
      draft:'Waivable · pemesan ≠ STNK · unggah supporting document',
      submitted:'Admin Cilandak sedang mencocokkan dokumen',
      verified:'Ready for the Head of Administration decision',
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
      draft:'E-PO not yet received from leasing. After the Frontman package and full DP are complete, Administration can submit billing without an e-PO. Decision owner: Operation Manager. Settlement still requires the original e-PO.',
      submitted:'Submission received. Cilandak Administration reviews the Frontman package and full B2B DP.',
      verified:'Admin sudah cek. Operation Manager memutuskan paperless tanpa e-PO. Bukan waiver DP atau TTD.',
      approved:'Paperless is allowed. Leasing settlement still waits for the original e-PO (total DP, financed amount, tenor).',
      returned:'Returned. Complete the Frontman package / full DP, or pull the e-PO in the B2B flow.',
      rejected:'Ditolak. Tagih hanya setelah e-PO leasing terbit. DP dan TTD tetap non-waivable.'
    };
    var tags={draft:'Awaiting submission',submitted:'Admin cek',verified:'Siap OM',approved:'Paperless boleh',returned:'Revisi',rejected:'Ditolak'};
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
      if(kind==='nama') setExcNama('submitted','Name submission sent. Cilandak Administration will review the supporting document.');
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
        setExcEpo('submitted','Billing-without-e-PO submission sent. Administration reviews it, then the Operation Manager.');
      }
      else setExcAlamat('submitted','Submission sent. Cilandak Administration will review the proof.');
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
        setExcNama('verified','Name documents reviewed. Ready for the Head of Administration decision.');
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
      setExcAlamat('verified','Proof reviewed. Ready for the Head of Administration decision.');
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
      setExcAlamat('returned','Returned to Frontman. Complete the address proof.');
    });
  });

