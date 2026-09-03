(function(){

  var receipts={
    'KWT/26/CLD/009115':{no:'KWT/26/CLD/009115',status:'Aktif',type:'Pelunasan tahap 1',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'1 Sep 2026, 14:08 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0002',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 300.000.000',verify:'VFY-CLD-009115-A7K2'},
    'KWT/26/CLD/009220':{no:'KWT/26/CLD/009220',status:'Aktif',type:'Pelunasan tahap 2',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'3 Sep 2026, 09:41 WIB',method:'Cashless',ref:'PAY-CLD-00418-3',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 100.000.000',verify:'VFY-CLD-009220-R8P1'},
    'KWT/26/CLD/009301':{no:'KWT/26/CLD/009301',status:'Aktif',type:'Booking fee',customer:'Dewi Lestari',unit:'Yaris 1.5 G',date:'3 Sep 2026, 10:12 WIB',method:'Cashless',ref:'PAY-CLD-00426-1',spk:'SPK/26/CLD/00426',so:'Belum terbit',billing:'Belum terbit',amount:'Rp 3.000.000',verify:'VFY-CLD-009301-Y4R1'}
  };
  function pdfEscape(s){ return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'); }
  function receiptPdf(r){
    var lines=['FAST — E-KUITANSI PEMBAYARAN',r.no,'Status: '+r.status+' · '+r.type,'Customer: '+r.customer,'Unit: '+r.unit,'Tanggal: '+r.date,'Metode: '+r.method,'Payment reference: '+r.ref,'Nomor SPK: '+r.spk,'Nomor SO: '+r.so,'Nomor billing: '+r.billing,'Nominal diterima: '+r.amount,'Kode verifikasi: '+r.verify,'Dokumen ini adalah e-kuitansi hasil pembayaran terverifikasi.'];
    var stream='BT\n/F1 12 Tf\n';
    lines.forEach(function(line,i){ stream += '1 0 0 1 50 '+(780-i*22)+' Tm ('+pdfEscape(line)+') Tj\n'; });
    stream += 'ET';
    var objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
    var pdf='%PDF-1.4\n', offsets=[0];
    objects.forEach(function(body,i){ offsets.push(pdf.length); pdf += (i+1)+' 0 obj\n'+body+'\nendobj\n'; });
    var xref=pdf.length;
    pdf += 'xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
    for(var i=1;i<offsets.length;i++) pdf += String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf += 'trailer << /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
    return pdf;
  }
  function downloadReceipt(no){
    var r=receipts[no]||receipts['KWT/26/CLD/009115'];
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([receiptPdf(r)],{type:'application/pdf'}));
    a.download=r.no.replace(/\//g,'-')+'.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },0);
  }
  function isDownloadAction(el){ return /^Download/i.test((el.textContent||'').replace(/\s+/g,' ').trim()); }
  function receiptNoFrom(el){
    var box=el.closest('tr, .doc, .pad, .wa, .box')||el.parentElement;
    var m=(box?box.textContent:'').match(/KWT\/26\/CLD\/\d+/);
    return m?m[0]:'KWT/26/CLD/009115';
  }
  var screens=document.querySelectorAll('.screen');
  var navBtns=document.querySelectorAll('.rail button[data-go]');
  var goBtns=document.querySelectorAll('[data-go]');
  var toastEl=document.getElementById('toast');
  var toastTimer=null;
  function toast(msg){
    if(!toastEl) return;
    toastEl.textContent=msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ toastEl.classList.remove('show'); }, 2800);
  }
  function show(id){
    screens.forEach(function(s){ s.classList.toggle('on', s.id===id); });
    var railId=({
      customer_detail:'customer',order_aksesoris:'customer',order_calya:'customer',
      tagihan_customer:'customer',e_kuitansi:'customer',
      transaksi:'beranda',bayar:'cashless',request:'beranda',dokumen:'beranda',cashless:'beranda',
      tx_hiace:'beranda',tx_raize:'beranda',tx_avanza:'beranda',tx_fortuner:'beranda',
      booking:'beranda',digiroom:'customer',
      exc_alamat:'eskalasi',exc_stnk:'eskalasi'
    })[id]||id;
    if((id==='cashless'||id==='bayar') && currentRole==='cust') railId='customer';
    navBtns.forEach(function(b){
      var rail=b.closest('[data-rail]');
      if(b.dataset.go===railId && rail && rail.hidden!==true) b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.worktabs [data-go]').forEach(function(b){
      var tabOn=(id==='cashless'&&b.dataset.go==='cashless')||b.dataset.go===id;
      b.setAttribute('aria-current', tabOn ? 'true' : 'false');
    });
    document.querySelectorAll('.journey a').forEach(function(a){
      var href=(a.getAttribute('href')||'');
      var hid=href.split('#')[1]||'';
      var on=(hid==='beranda'&&(id==='beranda'||id==='transaksi'||id.indexOf('tx_')===0||id==='dokumen'||id==='request'||id==='eskalasi'||id==='booking'||id.indexOf('exc_')===0))
        ||(hid==='cashless'&&(id==='cashless'||id==='bayar'||id==='digiroom'))
        ||(hid==='customer'&&(id==='customer'||id==='customer_detail'||id==='tagihan_customer'||id==='e_kuitansi'||id==='digiroom'||id.indexOf('order_')===0));
      a.classList.toggle('on', on);
      a.classList.toggle('pay', hid==='cashless');
    });
    var bar=document.querySelector('.urlbar');
    if(bar) bar.textContent=(id==='digiroom'?'digiroom.fast.id/beranda':'sam.fast.id/fast/'+id);
    if(history.replaceState) try { history.replaceState(null,'','#'+id); } catch(err) {}
    var cashBack=document.querySelector('#cashless [data-back]');
    if(cashBack){
      cashBack.setAttribute('data-go', currentRole==='cust'?'customer_detail':'beranda');
      cashBack.textContent=currentRole==='cust'?'← Pesanan':'← Daftar';
    }
    document.querySelectorAll('#cashless .worktabs, #cashless [data-go="transaksi"]').forEach(function(el){
      el.hidden=currentRole==='cust';
    });
    if(id==='booking') setPayJob('booking');
    if(id==='cashless') setPayJob('lunas');
    syncRoleChrome();
    applyExcAlamat();
    applyBooking();
  }
  goBtns.forEach(function(b){ b.addEventListener('click',function(e){
    if(isDownloadAction(b)){ e.preventDefault(); downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); return; }
    if(b.dataset.role) applyRole(b.dataset.role);
    if(b.dataset.payJob) setPayJob(b.dataset.payJob);
    show(b.dataset.go); window.scrollTo({top:document.querySelector('.app').offsetTop-20,behavior:'smooth'});
  }); });
  document.querySelectorAll('#mockup button').forEach(function(b){
    if(isDownloadAction(b) && !b.hasAttribute('data-go')){
      b.addEventListener('click',function(){ downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); });
      return;
    }
    if(b.hasAttribute('data-go') || b.classList.contains('roletab') || (b.closest('.seg') && b.closest('#jenisSeg'))) return;
    if(b.hasAttribute('data-bf') || b.hasAttribute('data-bf-pay') || b.hasAttribute('data-pay-link') || b.hasAttribute('data-dg') || b.hasAttribute('data-dg-pay') || b.hasAttribute('data-edc-device') || b.hasAttribute('data-cash')) return;
    var label=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(/^Bayar Rp/.test(label)){
      b.addEventListener('click',function(){ toast('Pembayaran terverifikasi. E-kuitansi baru siap diunduh.'); });
    } else if(/Kirim instruksi pembayaran|Kirim tagihan|Kirim pengingat/.test(label)){
      b.addEventListener('click',function(){ toast('Instruksi terkirim ke customer.'); });
    } else if(/Ajukan billing/.test(label)){
      b.addEventListener('click',function(){ toast('Billing gate cash lolos (≥30%). Permintaan billing dikirim.'); });
    } else if(/Buat SPK baru/.test(label)){
      b.addEventListener('click',function(){ toast('Draft SPK dibuat. Lengkapi data customer sekali di sumber.'); });
    } else if(/Cari transaksi/.test(label)){
      b.addEventListener('click',function(){
        var q=document.getElementById('txSearch');
        if(q){ q.focus(); show('beranda'); }
      });
    }
  });
  var seg=document.getElementById('jenisSeg');
  if(seg){ seg.querySelectorAll('button').forEach(function(b){ b.addEventListener('click',function(){
    seg.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed', x===b?'true':'false');});
  }); }); }

  var currentRole='frontman';
  var first={frontman:'beranda',admin:'verifikasi',mgmt:'dashboard',cust:'customer'};
  var screenRole={beranda:'frontman',transaksi:'frontman',bayar:'frontman',request:'frontman',dokumen:'frontman',cashless:'frontman',tx_hiace:'frontman',tx_raize:'frontman',tx_avanza:'frontman',tx_fortuner:'frontman',booking:'frontman',digiroom:'cust',verifikasi:'admin',dashboard:'mgmt',customer:'cust',customer_detail:'cust',order_aksesoris:'cust',order_calya:'cust',tagihan_customer:'cust',e_kuitansi:'cust'};
  function syncRoleChrome(){
    document.querySelectorAll('[data-for]').forEach(function(el){
      el.hidden = el.getAttribute('data-for') !== currentRole;
    });
  }
  function applyRole(role){
    currentRole=role;
    document.querySelectorAll('.roletab').forEach(function(x){x.setAttribute('aria-pressed', x.dataset.role===role?'true':'false');});
    document.querySelectorAll('[data-rail]').forEach(function(r){ r.hidden = r.dataset.rail!==role; });
    syncRoleChrome();
  }
  document.querySelectorAll('.roletab').forEach(function(t){
    t.addEventListener('click',function(){
      applyRole(t.dataset.role);
      show(first[t.dataset.role]);
      toast('Peran: '+t.textContent.trim());
    });
  });
  var hash=(location.hash||'').replace('#','');
  if(hash && document.getElementById(hash)){
    if(screenRole[hash]) applyRole(screenRole[hash]);
    show(hash);
  }

  var orderFilter='all';
  function filterOrders(){
    var q=((document.getElementById('orderSearch')||{}).value||'').toLowerCase();
    document.querySelectorAll('#orderList .order-card').forEach(function(card){
      var st=card.getAttribute('data-order-status');
      var matchFilter=orderFilter==='all'||st===orderFilter;
      var matchQ=!q||card.textContent.toLowerCase().indexOf(q)>-1;
      card.classList.toggle('is-hidden', !(matchFilter&&matchQ));
    });
  }
  document.querySelectorAll('[data-order-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      orderFilter=b.getAttribute('data-order-filter');
      document.querySelectorAll('[data-order-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===b?'true':'false');
      });
      filterOrders();
    });
  });
  var orderSearch=document.getElementById('orderSearch');
  if(orderSearch) orderSearch.addEventListener('input', filterOrders);

  var txFilter='all';
  function filterTx(){
    var q=((document.getElementById('txSearch')||{}).value||'').toLowerCase();
    document.querySelectorAll('#txList .order-card').forEach(function(card){
      var st=card.getAttribute('data-tx-status');
      var act=card.getAttribute('data-tx-action')==='1';
      var match=txFilter==='all'||(txFilter==='action'&&act)||st===txFilter;
      var matchQ=!q||card.textContent.toLowerCase().indexOf(q)>-1;
      card.classList.toggle('is-hidden', !(match&&matchQ));
    });
  }
  document.querySelectorAll('[data-tx-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      txFilter=b.getAttribute('data-tx-filter');
      document.querySelectorAll('.order-filters [data-tx-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x.getAttribute('data-tx-filter')===txFilter?'true':'false');
      });
      show('beranda');
      filterTx();
    });
  });
  var search=document.getElementById('txSearch');
  if(search) search.addEventListener('input', filterTx);

  var excFilter='all';
  function filterExc(){
    document.querySelectorAll('#excList .order-card').forEach(function(card){
      var kind=card.getAttribute('data-exc-kind');
      var match=excFilter==='all'||kind===excFilter;
      card.classList.toggle('is-hidden', !match);
    });
  }
  document.querySelectorAll('[data-exc-filter]').forEach(function(b){
    b.addEventListener('click',function(){
      excFilter=b.getAttribute('data-exc-filter');
      document.querySelectorAll('[data-exc-filter]').forEach(function(x){
        x.setAttribute('aria-pressed', x===b?'true':'false');
      });
      show('eskalasi');
      filterExc();
    });
  });

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
      returned:'Dikembalikan ke Frontman. Lengkapi bukti, lalu kirim ulang.'
    };
    var tags={draft:'Menunggu pengajuan',submitted:'Menunggu Admin',verified:'Siap diputuskan',approved:'Disetujui bersyarat',returned:'Dikembalikan'};
    var specs={
      draft:'Waivable · Frontman ajukan → Admin cek → Kepala Administrasi',
      submitted:'Waivable · Admin sedang cek bukti',
      verified:'Waivable · Kepala Administrasi memutuskan',
      approved:'Syarat: alamat asli sebelum DO · pelunasan tetap wajib',
      returned:'Lengkapi bukti, kirim ulang'
    };
    var note=document.querySelector('[data-exc-note]');
    if(note){
      note.textContent=notes[st]||notes.draft;
      note.classList.toggle('warn', st!=='approved');
      note.classList.toggle('ok', st==='approved');
    }
    var order=['draft','submitted','verified','approved'];
    var idx=order.indexOf(st==='returned'?'draft':st);
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
      el.className='tag '+(st==='approved'?'ok':st==='returned'?'stop':'hold');
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
    document.querySelectorAll('[data-exc-pill]').forEach(function(el){ el.textContent=st==='approved'?'0':'1'; });
  }
  function setExcAlamat(next, msg){
    if(window.FAST && FAST.save) FAST.save({excAlamat:next});
    applyExcAlamat();
    toast(msg);
  }
  document.querySelectorAll('[data-exc-submit]').forEach(function(b){
    b.addEventListener('click',function(){
      setExcAlamat('submitted','Pengajuan terkirim. Admin Cilandak akan cek bukti.');
    });
  });
  document.querySelectorAll('[data-exc-verify]').forEach(function(b){
    b.addEventListener('click',function(){
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

  var edcDevice='EDC-01';
  var payJobId='booking';
  var payJobs={
    booking:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Yaris 1.5 G',kind:'Booking fee',amount:'Rp 3.000.000',
      cdm:'0426 3000 01',brilink:'8810 0426 3000',
      va:{BCA:'8801 0426 0001',BRI:'0026 0426 0001',Mandiri:'8881 0426 0001'},
      back:'booking'
    },
    lunas:{
      name:'Budi Santoso',spk:'SPK/26/CLD/00418',unit:'Innova Zenix',kind:'Pelunasan tahap 2',amount:'Rp 100.000.000',
      cdm:'0418 1000 03',brilink:'8810 0418 0003',
      va:{BCA:'8801 0418 0003',BRI:'0026 0418 0003',Mandiri:'8881 0418 0003'},
      back:'cashless'
    }
  };
  function setPayJob(id){
    payJobId=payJobs[id]?id:'booking';
    var j=payJobs[payJobId];
    document.querySelectorAll('[data-pay-name]').forEach(function(el){ el.textContent=j.name; });
    document.querySelectorAll('[data-pay-spk]').forEach(function(el){ el.textContent=j.spk; });
    document.querySelectorAll('[data-pay-unit]').forEach(function(el){ el.textContent=j.unit; });
    document.querySelectorAll('[data-pay-kind]').forEach(function(el){ el.textContent=j.kind; });
    document.querySelectorAll('[data-pay-amount]').forEach(function(el){ el.textContent=j.amount; });
    document.querySelectorAll('[data-pay-cdm]').forEach(function(el){ el.textContent=j.cdm; });
    document.querySelectorAll('[data-pay-brilink]').forEach(function(el){ el.textContent=j.brilink; });
    var back=document.querySelector('[data-dg-back]');
    if(back) back.setAttribute('data-go', j.back);
    var no=document.getElementById('dgVaNo');
    if(no) no.textContent=j.va.BCA;
    showDg('home');
  }
  function showBfPanel(mode){
    document.querySelectorAll('#bfSeg [data-bf]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-bf')===mode?'true':'false');
    });
    document.querySelectorAll('[data-bf-panel]').forEach(function(p){
      p.classList.toggle('on', p.getAttribute('data-bf-panel')===mode);
    });
  }
  function showCashPanel(mode){
    document.querySelectorAll('#cashSeg [data-cash]').forEach(function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-cash')===mode?'true':'false');
    });
    document.querySelectorAll('[data-cash-panel]').forEach(function(p){
      var on=p.getAttribute('data-cash-panel')===mode;
      p.classList.toggle('on', on);
      p.hidden=!on;
    });
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
  function applyBooking(){
    var s=window.FAST && FAST.load ? FAST.load(FAST.BF_KEY) : null;
    var paid=!!(s && s.paid);
    document.querySelectorAll('[data-bf-hide-paid]').forEach(function(el){ el.hidden=paid; });
    document.querySelectorAll('[data-bf-show-paid]').forEach(function(el){ el.hidden=!paid; });
  }
  function settleBooking(channel){
    if(window.FAST && FAST.save) FAST.save({paid:true,spk:'SPK/26/CLD/00426',channel:channel,receipt:'KWT/26/CLD/009301'}, FAST.BF_KEY);
    applyRole('frontman');
    applyBooking();
    toast('Booking fee masuk. E-kuitansi KWT/26/CLD/009301. Sales Order dapat dibuka.');
    show('booking');
  }
  document.querySelectorAll('[data-bf-pay]').forEach(function(b){
    b.addEventListener('click',function(){ settleBooking(b.getAttribute('data-bf-pay')); });
  });
  document.querySelectorAll('[data-pay-link]').forEach(function(b){
    b.addEventListener('click',function(){
      setPayJob(b.getAttribute('data-pay-link'));
      toast('Tautan terkirim. Customer masuk ke beranda Digiroom.');
      applyRole('cust');
      show('digiroom');
    });
  });
  function showDg(panel, meta){
    var home=document.querySelector('[data-dg-home]');
    if(home) home.hidden = panel!=='home';
    document.querySelectorAll('[data-dg-panel]').forEach(function(p){
      p.hidden = p.getAttribute('data-dg-panel')!==panel;
    });
    var j=payJobs[payJobId]||payJobs.booking;
    if(panel==='va'){
      var bank=meta||'BCA';
      var hint=document.getElementById('dgVaHint');
      var no=document.getElementById('dgVaNo');
      if(hint) hint.textContent='Transfer ke VA '+bank+'. Jumlah sudah terikat SPK.';
      if(no) no.textContent=(j.va&&j.va[bank])||j.va.BCA;
    }
    if(panel==='app'){
      var hint=document.getElementById('dgAppHint');
      if(hint) hint.textContent='Membuka '+(meta||'myBCA')+' · '+j.kind+' '+j.amount+' sudah terisi.';
    }
  }
  document.querySelectorAll('[data-dg]').forEach(function(b){
    b.addEventListener('click',function(){
      showDg(b.getAttribute('data-dg'), b.getAttribute('data-bank')||b.getAttribute('data-app'));
    });
  });
  document.querySelectorAll('[data-dg-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      var ch=b.getAttribute('data-dg-pay');
      if(payJobId==='lunas') runPayflow(ch, 100000000);
      else settleBooking(ch);
    });
  });

  function applyLive(){
    if(!window.FAST || !FAST.load) return;
    var s=FAST.load();
    if(!s || !s.paid) return;
    var bar=document.getElementById('liveSync');
    var msg=document.getElementById('syncMsg');
    if(bar) bar.hidden=false;
    if(msg) msg.textContent=(s.channel||'Cashless')+' · '+(s.receipt||'KWT/26/CLD/009220')+' · AR Open '+(s.arLabel||'Rp 81.750.000')+'. Delivery '+(s.ar===0?'terbuka':'masih menunggu lunas')+'.';
    document.querySelectorAll('[data-live="ar"]').forEach(function(el){ el.textContent=s.arLabel||'Rp 81.750.000'; });
    document.querySelectorAll('[data-live="ar-short"]').forEach(function(el){
      el.innerHTML=(s.ar===0?'0':'81,75')+'<span style="font-size:14px;font-weight:500"> Jt</span>';
    });
    document.querySelectorAll('[data-live="avail"]').forEach(function(el){ el.textContent=s.ar===0?'Rp 0':'Rp 81.750.000'; });
    document.querySelectorAll('[data-live="payhint"]').forEach(function(el){
      el.textContent=s.ar===0?'100% terbayar · delivery cash terbuka':'83,2% terbayar · cashless di transaksi ini';
    });
    var barFill=document.querySelector('#transaksi .bar i');
    if(barFill) barFill.style.width=s.ar===0?'100%':'83.2%';
  }
  applyLive();
  applyExcAlamat();
  applyBooking();
  syncRoleChrome();
  window.addEventListener('fast-session', function(){ applyLive(); applyExcAlamat(); applyBooking(); });

  var channelMeta={
    qris:{title:'QRIS'},
    cdm:{title:'CDM cabang'},
    edc:{title:'Debit EDC'},
    brilink:{title:'BRILink'},
    va:{title:'Virtual Account'},
    app:{title:'Aplikasi bank'},
    link:{title:'Digiroom'}
  };
  document.addEventListener('keydown',function(e){
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var n=parseInt(e.key,10);
    if(!n) return;
    var cash=document.getElementById('cashless');
    var book=document.getElementById('booking');
    var order=['qris','cdm','link','edc'];
    if(cash && cash.classList.contains('on') && n>=1 && n<=4) showCashPanel(order[n-1]);
    if(book && book.classList.contains('on') && n>=1 && n<=4) showBfPanel(order[n-1]);
  });
  function settle(channel, amount){
    var ar=amount>=181750000?0:81750000;
    var label=ar===0?'Rp 0':'Rp 81.750.000';
    var slot=document.getElementById('newReceiptSlot');
    if(slot){
      slot.className='doc';
      slot.innerHTML='<b>KWT/26/CLD/009220</b><p class="meta">Pelunasan 2 · '+(channelMeta[channel]?channelMeta[channel].title:'Cashless')+'</p><span class="tag ok">Aktif</span><button class="btn ghost" style="width:100%;margin-top:10px">Download PDF</button>';
      var db=slot.querySelector('button');
      if(db) db.addEventListener('click',function(){ downloadReceipt('KWT/26/CLD/009220'); toast('E-kuitansi PDF diunduh.'); });
    }
    if(window.FAST && FAST.save){
      FAST.save({paid:true,ar:ar,arLabel:label,receipt:'KWT/26/CLD/009220',channel:(channelMeta[channel]||{}).title||channel});
    }
    toast(ar===0?'Lunas. E-kuitansi terbit. Delivery cash terbuka.':'Pembayaran masuk. Tagihan di beranda ikut berkurang.');
    show(currentRole==='cust'?'customer_detail':'cashless');
  }
  function runPayflow(channel, amount){
    var overlay=document.getElementById('payflow');
    var status=document.getElementById('pfStatus');
    var steps=overlay?overlay.querySelectorAll('[data-step]'):[];
    if(!overlay){ settle(channel, amount); return; }
    overlay.hidden=false;
    steps.forEach(function(li){ li.className=''; });
    var labels=['Membaca SPK & AR Open…','Verifikasi Banking API…','Menerbitkan e-kuitansi…','Memperbarui beranda…'];
    var i=0;
    function tick(){
      if(i>0) steps[i-1].className='done';
      if(i<steps.length){
        steps[i].className='on';
        if(status) status.textContent=labels[i];
        i++;
        setTimeout(tick, 400);
      } else {
        overlay.hidden=true;
        settle(channel, amount);
      }
    }
    tick();
  }
  document.querySelectorAll('[data-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      runPayflow(b.getAttribute('data-pay'), Number(b.getAttribute('data-amount')||100000000));
    });
  });
  document.querySelectorAll('.journey a').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=(a.getAttribute('href')||'').split('#')[1];
      if(!id || !document.getElementById(id)) return;
      e.preventDefault();
      if(id==='customer'||id==='customer_detail'||id==='digiroom') applyRole('cust');
      else if(id==='beranda'||id==='transaksi'||id==='booking') applyRole('frontman');
      show(id);
    });
  });
})();
