/* B2B Hiace + Good Issue */
  function patchB2b(mut){
    if(!window.FAST || !FAST.b2bLoad) return;
    var s=FAST.b2bLoad();
    mut(s);
    FAST.save({units:s.units, selected:s.selected, tab:s.tab}, FAST.B2B_KEY);
  }
  function b2bSoMeta(id){
    var row=(FAST.B2B_SO||[]).filter(function(x){ return x.id===id; })[0];
    return row||{id:id, so:'450009'+id, unit:'Hiace Premio', amt:''};
  }
  function b2bFlowCopy(flow, u){
    if(u && u.backflow) return u.backflowReason||'Leasing mengembalikan. Lengkapi dokumen, kirim ulang.';
    var map={
      submitted:'Pengajuan sudah masuk ke leasing. Menunggu permintaan dokumen.',
      docs_requested:'Leasing meminta paket dokumen. Unggah di tab Dokumen, lalu kirim.',
      docs_sent:'Dokumen terkirim. Administrasi dapat menerbitkan kontrak dari leasing.',
      contract_ready:'Kontrak dari leasing siap. Sales mengunduh, customer TTD, sales unggah kembali.',
      ttd_uploaded:'Kontrak TTD tercatat. Delivery gate membaca status ini. DP wajib customer dari B2B membuka billing gate.',
      dp_received:'DP wajib dari B2B sudah diterima. Billing gate menunggu e-PO leasing (total DP, nilai dibiayai, tenor) atau putusan Operation Manager.',
      epo_received:'E-PO leasing tercatat, atau Operation Manager menyetujui paperless tanpa e-PO. Frontman lengkapi paket; Administrasi menagih.',
      billing_ready:'Data penagihan lengkap. Administrasi kirim paperless dan terbitkan kuitansi ke leasing.',
      paperless_sent:'Penagihan paperless terkirim. Administrasi menerbitkan kuitansi ke leasing.',
      lunas:'Pelunasan leasing tercatat. Jejak SPK–SO–billing tetap sama.'
    };
    return map[flow]||map.submitted;
  }
  function b2bTagFor(flow, back){
    if(back) return {cls:'tag stop', text:'Dikembalikan'};
    var map={
      submitted:{cls:'tag mute', text:'Submit'},
      docs_requested:{cls:'tag wait', text:'Dokumen diminta'},
      docs_sent:{cls:'tag wait', text:'Dokumen terkirim'},
      contract_ready:{cls:'tag wait', text:'Kontrak siap'},
      ttd_uploaded:{cls:'tag ok', text:'TTD tercatat'},
      dp_received:{cls:'tag ok', text:'DP B2B diterima'},
      epo_received:{cls:'tag wait', text:'E-PO / gate OM'},
      billing_ready:{cls:'tag wait', text:'Siap ditagih Admin'},
      paperless_sent:{cls:'tag ok', text:'Paperless'},
      lunas:{cls:'tag ok', text:'Lunas leasing'}
    };
    return map[flow]||{cls:'tag wait', text:'B2B'};
  }
  function applyB2b(){
    if(!window.FAST || !FAST.b2bLoad) return;
    var s=FAST.b2bLoad();
    var sum=FAST.b2bSummary();
    var selected=s.selected||'1288';
    var u=s.units[selected]||{};
    var flow=FAST.b2bDerive(u);
    var meta=b2bSoMeta(selected);
    var dpEl=document.querySelector('[data-b2b-dp-label]');
    var ttdEl=document.querySelector('[data-b2b-ttd-label]');
    var paperEl=document.querySelector('[data-b2b-paper-label]');
    if(dpEl) dpEl.textContent='DP diterima '+sum.dp+'/3';
    if(ttdEl) ttdEl.textContent='TTD '+sum.ttd+'/3';
    if(paperEl) paperEl.textContent='Kuitansi '+sum.kwt+'/3';
    document.querySelectorAll('[data-b2b-epo-label]').forEach(function(el){ el.textContent='E-PO '+sum.epo+'/3'; });
    document.querySelectorAll('[data-b2b-dp-wajib]').forEach(function(el){ el.textContent=meta.dpLabel||'—'; });
    var dpStatus=document.querySelector('[data-b2b-dp-status]');
    if(dpStatus) dpStatus.textContent=u.dpReceived?('Diterima '+ (meta.dpLabel||'') +' · billing gate terbuka'):('Wajib '+ (meta.dpLabel||'') +' · belum diterima');
    var dpIn=document.querySelector('[data-b2b-dp-in]');
    if(dpIn) dpIn.textContent=u.dpReceived?(meta.dpLabel||'Rp 0'):'Rp 0';
    var otr=document.querySelector('[data-b2b-otr]');
    if(otr) otr.textContent=meta.amt||'—';
    document.querySelectorAll('[data-b2b-otr]').forEach(function(el){ el.textContent=meta.amt||'—'; });
    document.querySelectorAll('[data-b2b-finance]').forEach(function(el){ el.textContent=meta.financeLabel||'—'; });
    document.querySelectorAll('[data-b2b-tenor]').forEach(function(el){ el.textContent=meta.tenor||'—'; });
    document.querySelectorAll('[data-b2b-epo-no]').forEach(function(el){
      el.textContent=u.epoReceived?(meta.epoNo||'Terbit'):(u.excEpo==='approved'?'Pengecualian OM':'Belum terbit');
    });
    document.querySelectorAll('[data-b2b-so-no]').forEach(function(el){ el.textContent=meta.so||'—'; });
    document.querySelectorAll('[data-b2b-so-unit]').forEach(function(el){ el.textContent=meta.unit||'Hiace Premio'; });
    var homeSpk=document.querySelector('[data-b2b-home-spk]');
    if(homeSpk){
      var ht=homeSpk.querySelector('[data-b2b-home-tag]');
      var hs=homeSpk.querySelector('[data-b2b-home-spec]');
      if(sum.back){
        if(ht){ ht.className='tag stop'; ht.textContent='Ada backflow'; }
        if(hs) hs.textContent='Lengkapi dokumen di SPK ini. DP wajib tetap di struktur harga tiap SO.';
      } else {
        if(ht){ ht.className='tag wait'; ht.textContent='B2B leasing'; }
        if(hs) hs.textContent='Tiga SO. DP wajib di struktur harga. Kerja Frontman dan penagihan Admin tetap di SPK ini.';
      }
    }
    var strip=document.querySelector('[data-b2b-dp-strip]');
    if(strip) strip.textContent='SO '+meta.so+' · DP wajib '+ (meta.dpLabel||'—') +'. QRIS/CDM/EDC cabang tidak mengganti angka B2B.';
    var kwtNo=document.querySelector('[data-b2b-kwt-no]');
    if(kwtNo) kwtNo.textContent=u.kwtIssued?('Kuitansi: '+(meta.kwt||'terbit')):'Kuitansi: belum terbit';
    var checks={
      dl:!!u.contractDownloaded,
      signed:!!u.signedContract,
      fotoTtd:!!(u.billing&&u.billing.fotoTtd),
      fotoSerah:!!(u.billing&&u.billing.fotoSerah),
      bstkb:!!(u.billing&&u.billing.bstkb),
      dp:!!u.dpReceived,
      epo:!!(u.epoReceived || u.excEpo==='approved')
    };
    var miss=[];
    var missMap={dl:'unduh kontrak',signed:'unggah kontrak TTD',fotoTtd:'foto TTD kontrak',fotoSerah:'foto serah terima',bstkb:'BSTKB',dp:'full DP dari B2B',epo:'e-PO leasing'};
    var missNo={dl:1,signed:2,fotoTtd:3,fotoSerah:4,bstkb:5,dp:6,epo:7};
    Object.keys(checks).forEach(function(k){
      var li=document.querySelector('[data-b2b-check="'+k+'"]');
      if(!li) return;
      var on=checks[k];
      var mark=li.querySelector('.mark');
      var tag=li.querySelector('.tag');
      if(mark){ mark.className='mark '+(on?'ok':'no'); mark.textContent=on?'✓':String(missNo[k]||'–'); }
      if(tag){
        tag.className='tag '+(on?'ok':'wait');
        tag.textContent=on?(k==='epo'&&!u.epoReceived&&u.excEpo==='approved'?'Pengecualian OM':'Ada'):'Belum';
      }
      if(!on) miss.push(missMap[k]);
    });
    var canBill=typeof FAST.b2bAdminCanBill==='function'?FAST.b2bAdminCanBill(u):false;
    var packDp=!!(u.dpReceived && FAST.b2bBillingComplete(u));
    var onlyEpo=packDp && !FAST.b2bEpoOk(u) && !u.paperlessSent;
    var block=document.querySelector('[data-b2b-admin-block]');
    if(block){
      block.hidden=canBill||!!u.paperlessSent||onlyEpo;
      block.textContent=miss.length?('Belum bisa ditagih. Kurang: '+miss.join(', ')+'.'):'';
    }
    var paperBtn=document.querySelector('[data-b2b-paperless]');
    if(paperBtn) paperBtn.disabled=(!canBill && !onlyEpo) || !!u.paperlessSent;
    var kwtOnly=document.querySelector('[data-b2b-kwt]');
    if(kwtOnly) kwtOnly.disabled=!u.paperlessSent || !!u.kwtIssued;
    document.querySelectorAll('[data-b2b-tab-role]').forEach(function(b){
      var need=b.getAttribute('data-b2b-tab-role');
      b.hidden = !(currentRole===need || currentRole==='mgmt');
    });
    var tab=s.tab||'ringkas';
    if(currentRole==='frontman' && tab==='tagih') tab='dokumen';
    if(currentRole==='admin' && tab==='dokumen') tab='tagih';
    document.querySelectorAll('[data-b2b-chrome]').forEach(function(el){ el.hidden = tab!=='ringkas'; });
    var hiace=document.getElementById('tx_hiace');
    if(hiace){
      var viewTab={ringkas:'spk',so:'so',alur:'del',dokumen:'afi',tagih:'bill'};
      var chosen=hiace.getAttribute('data-stage-view');
      if(!chosen && viewTab[tab]){
        hiace.setAttribute('data-stage-view', viewTab[tab]);
        chosen=viewTab[tab];
      }
      if(chosen && window.FAST && FAST.showStagePanel) FAST.showStagePanel(hiace, chosen);
    }
    var billCard=document.querySelector('[data-b2b-card="bill"]');
    var delCard=document.querySelector('[data-b2b-card="del"]');
    var paperCard=document.querySelector('[data-b2b-card="paper"]');
    var epoCard=document.querySelector('[data-b2b-card="epo"]');
    if(billCard) billCard.classList.toggle('alert', sum.dp<3);
    if(delCard) delCard.classList.toggle('alert', sum.ttd<3);
    if(paperCard) paperCard.classList.toggle('alert', sum.kwt<3);
    if(epoCard) epoCard.classList.toggle('alert', sum.epo<3);
    var epoHint=document.querySelector('[data-b2b-epo-exc-hint]');
    if(epoHint) epoHint.hidden = !packDp || !!u.epoReceived || u.excEpo==='approved';
    document.querySelectorAll('[data-b2b-epo-exc]').forEach(function(b){
      b.hidden = !packDp || !!u.epoReceived;
    });
    var gateNote=document.querySelector('[data-b2b-gate-note]');
    if(gateNote){
      gateNote.textContent=sum.back
        ? 'Ada backflow. Frontman lengkapi data — bukan waiver TTD/DP. Approval Engine tidak dibuka untuk TTD/DP.'
        : 'Klik SPK, SO, atau Billing di jejak atas — tahap yang sudah jadi tetap terbuka. Administrasi menagih jika paket lengkap, full DP B2B, dan e-PO leasing — atau putusan Operation Manager.';
    }
    document.querySelectorAll('[data-b2b-tab]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-b2b-tab')===tab?'true':'false');
    });
    document.querySelectorAll('[data-b2b-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-b2b-panel')!==tab;
    });
    document.querySelectorAll('[data-b2b-so]').forEach(function(b){
      var id=b.getAttribute('data-b2b-so');
      var uu=s.units[id]||{};
      var ff=FAST.b2bDerive(uu);
      b.setAttribute('aria-current', id===selected?'true':'false');
      var tag=b.querySelector('[data-b2b-so-tag]');
      var m=b.querySelector('[data-b2b-so-meta]');
      var t=b2bTagFor(ff, uu.backflow);
      if(tag){ tag.className=t.cls; tag.textContent=t.text; }
      if(m) m.textContent=uu.backflow?(uu.backflowReason||'Backflow'):b2bFlowCopy(ff, uu);
    });
    document.querySelectorAll('[data-b2b-home]').forEach(function(card){
      var id=card.getAttribute('data-b2b-home');
      var uu=s.units[id]||{};
      var ff=FAST.b2bDerive(uu);
      var t=b2bTagFor(ff, uu.backflow);
      var tag=card.querySelector('[data-b2b-home-tag]');
      var spec=card.querySelector('[data-b2b-home-spec]');
      if(tag){ tag.className=t.cls; tag.textContent=t.text; }
      if(spec) spec.textContent=uu.backflow?'Backflow · lengkapi dokumen · kirim ulang':b2bFlowCopy(ff, uu);
    });
    document.querySelectorAll('[data-b2b-so-title]').forEach(function(el){ el.textContent='SO '+meta.so; });
    var now=document.querySelector('[data-b2b-now-copy]');
    if(now) now.textContent=b2bFlowCopy(flow, u);
    var banner=document.querySelector('[data-b2b-backflow]');
    if(banner){
      banner.hidden=!u.backflow;
      banner.textContent=u.backflow?(u.backflowReason||'Dikembalikan leasing.'):'';
      banner.classList.toggle('warn', !!u.backflow);
    }
    var path=document.querySelector('[data-b2b-path]');
    if(path){
      path.innerHTML='';
      var rank=FAST.B2B_FLOW.indexOf(flow==='backflow'?'docs_requested':flow);
      FAST.B2B_FLOW.forEach(function(step,i){
        if(i){
          var arr=document.createElement('span');
          arr.textContent='→';
          path.appendChild(arr);
        }
        var b=document.createElement('b');
        b.textContent=FAST.B2B_FLOW_LABEL[step];
        if(u.backflow && step==='docs_requested') b.className='back';
        else if(i<rank) b.className='done';
        else if(i===rank) b.className='on';
        path.appendChild(b);
      });
    }
    var docCopy={
      ktp:{off:'Ketuk untuk pasang KTP/identitas pengurus', on:'Terpasang · vault B2B'},
      npwp:{off:'Ketuk untuk pasang NPWP badan', on:'Terpasang · vault B2B'},
      siup:{off:'Ketuk untuk pasang NIB/SIUP', on:'Terpasang · vault B2B'},
      spk:{off:'Ketuk untuk pasang SPK/quotation', on:'Terpasang · SPK/26/CLD/00421'}
    };
    Object.keys(docCopy).forEach(function(k){
      var b=document.querySelector('[data-b2b-doc="'+k+'"]');
      if(!b) return;
      var on=!!(u.docs&&u.docs[k]);
      b.classList.toggle('on', on);
      var span=b.querySelector('span');
      if(span) span.textContent=on?docCopy[k].on:docCopy[k].off;
    });
    var signed=document.querySelector('[data-b2b-drop="signed"]');
    if(signed){
      signed.classList.toggle('on', !!u.signedContract);
      var sp=signed.querySelector('span');
      if(sp) sp.textContent=u.signedContract?'Terpasang · kontrak TTD customer · delivery gate membaca status ini':'Ketuk untuk pasang scan yang sudah ditandatangani';
    }
    var billCopy={
      bstkb:{off:'Ketuk untuk pasang scan BSTKB', on:'Terpasang · scan BSTKB'},
      fotoSerah:{off:'Ketuk untuk pasang foto serah terima', on:'Terpasang · geotag perangkat'},
      fotoTtd:{off:'Ketuk untuk pasang foto tanda tangan kontrak', on:'Terpasang · foto TTD kontrak'}
    };
    Object.keys(billCopy).forEach(function(k){
      var b=document.querySelector('[data-b2b-bill="'+k+'"]');
      if(!b) return;
      var on=!!(u.billing&&u.billing[k]);
      b.classList.toggle('on', on);
      var span=b.querySelector('span');
      if(span) span.textContent=on?billCopy[k].on:billCopy[k].off;
    });
    var dl=document.querySelector('[data-b2b-dl-contract]');
    if(dl){
      dl.disabled=!u.contractFromLeasing;
      dl.textContent=u.contractFromLeasing?'Unduh kontrak leasing':'Kontrak belum dari leasing';
    }
    ['1288','1289','1290'].forEach(function(id){
      var uu=s.units[id]||{};
      var ff=FAST.b2bDerive(uu);
      var t=b2bTagFor(ff, uu.backflow);
      var st=document.querySelector('[data-b2b-book-status="'+id+'"]');
      var tg=document.querySelector('[data-b2b-book-tag="'+id+'"]');
      if(st) st.textContent=uu.backflow?'Backflow': (FAST.B2B_FLOW_LABEL[ff]||ff);
      if(tg){ tg.className=t.cls; tg.textContent=t.text; }
      var dpCell=document.querySelector('[data-b2b-book-dp="'+id+'"]');
      var rowMeta=b2bSoMeta(id);
      if(dpCell) dpCell.textContent=rowMeta.dpLabel||'—';
      var epoCell=document.querySelector('[data-b2b-book-epo="'+id+'"]');
      if(epoCell) epoCell.textContent=uu.epoReceived?(rowMeta.epoNo||'Ada'):(uu.excEpo==='approved'?'Pengecualian OM':'Belum');
      document.querySelectorAll('[data-b2b-kwt-row="'+id+'"]').forEach(function(row){ row.hidden=!uu.kwtIssued; });
    });
    if(window.FAST && FAST.renderLineage) FAST.renderLineage();
    if(window.FAST && FAST.renderMaster) FAST.renderMaster();
  }
  function applyGi(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.GI_KEY) : null;
    s=s||{};
    var st=s.gi||'draft';
    var notes={
      draft:'Unggah foto serah terima, foto VIN, dan scan BSTKB. Geotag dan waktu tercatat di perangkat. Administrasi memeriksa, lalu menyetujui. Paket yang sama nanti di akun pelanggan — bukan CCTV dealer.',
      submitted:'Bukti masuk antrean Administrasi. Salesman tidak mencatat GI sendiri. Customer belum melihat paket sampai disetujui.',
      approved:'Good Issue disetujui. Unit tertutup di gudang. Paket bukti yang sama tersedia untuk pelanggan. STNK/BPKB memakai data yang sama.',
      returned:'Dikembalikan. Lengkapi foto, VIN, atau scan BSTKB, lalu kirim ulang.'
    };
    var tags={draft:'Good Issue',submitted:'Menunggu Admin',approved:'GI disetujui',returned:'Dikembalikan'};
    var specs={
      draft:'Tindakan: unggah foto, VIN, BSTKB + geotag',
      submitted:'Tindakan: pantau persetujuan Administrasi',
      approved:'GI tercatat · paket bukti di akun pelanggan',
      returned:'Lengkapi bukti, kirim ulang ke Administrasi'
    };
    var dropCopy={
      foto:{off:'Ketuk untuk pasang contoh · geotag 2 Sep 14:22',on:'Terpasang · 2 Sep 2026 14:22 WIB · −6.2731, 106.8072'},
      vin:{off:'Ketuk untuk pasang · cocokkan dengan SO',on:'Terpasang · VIN ••20424 cocok SO'},
      bstkb:{off:'Ketuk untuk pasang scan · nomor mengikuti VIN',on:'Terpasang · scan BSTKB'}
    };
    Object.keys(dropCopy).forEach(function(kind){
      var b=document.querySelector('#gi [data-drop="'+kind+'"]');
      if(!b) return;
      var on=!!s[kind];
      b.classList.toggle('on', on);
      var span=b.querySelector('span');
      if(span) span.textContent=on?dropCopy[kind].on:dropCopy[kind].off;
    });
    var vault=document.querySelector('[data-gi-vault]');
    if(vault) vault.hidden=st!=='approved';
    var note=document.querySelector('[data-gi-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    document.querySelectorAll('[data-gi-tag]').forEach(function(el){
      el.textContent=tags[st]||tags.draft;
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'wait');
    });
    document.querySelectorAll('[data-gi-spec]').forEach(function(el){ el.textContent=specs[st]||specs.draft; });
    document.querySelectorAll('[data-gi-status]').forEach(function(el){
      el.textContent=st==='approved'?'Tercatat':st==='submitted'?'Cek Admin':st==='returned'?'Dikembalikan':'Menunggu bukti';
    });
  }
