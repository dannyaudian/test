(function(){

  var receipts={
    'KWT/26/CLD/009115':{no:'KWT/26/CLD/009115',status:'Aktif',type:'Pelunasan tahap 1',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'1 Sep 2026, 14:08 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0002',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 300.000.000',verify:'VFY-CLD-009115-A7K2'},
    'KWT/26/CLD/009220':{no:'KWT/26/CLD/009220',status:'Aktif',type:'Pelunasan tahap 2',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'3 Sep 2026, 09:41 WIB',method:'Cashless',ref:'PAY-CLD-00418-3',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 100.000.000',verify:'VFY-CLD-009220-R8P1'}
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
      tx_hiace:'beranda',tx_raize:'beranda',tx_avanza:'beranda',tx_fortuner:'beranda'
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
      var on=(hid==='beranda'&&(id==='beranda'||id==='transaksi'||id.indexOf('tx_')===0||id==='dokumen'||id==='request'||id==='eskalasi'))
        ||(hid==='cashless'&&(id==='cashless'||id==='bayar'))
        ||(hid==='customer'&&(id==='customer'||id==='customer_detail'||id==='tagihan_customer'||id==='e_kuitansi'||id.indexOf('order_')===0));
      a.classList.toggle('on', on);
      a.classList.toggle('pay', hid==='cashless');
    });
    var bar=document.querySelector('.urlbar');
    if(bar) bar.textContent='sam.fast.id/fast/'+id;
    if(history.replaceState) try { history.replaceState(null,'','#'+id); } catch(err) {}
    var cashBack=document.querySelector('#cashless [data-back]');
    if(cashBack){
      cashBack.setAttribute('data-go', currentRole==='cust'?'customer_detail':'beranda');
      cashBack.textContent=currentRole==='cust'?'← Pesanan':'← Daftar';
    }
    document.querySelectorAll('#cashless .worktabs, #cashless [data-go="transaksi"]').forEach(function(el){
      el.hidden=currentRole==='cust';
    });
  }
  goBtns.forEach(function(b){ b.addEventListener('click',function(e){
    if(isDownloadAction(b)){ e.preventDefault(); downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); return; }
    if(b.dataset.role) applyRole(b.dataset.role);
    show(b.dataset.go); window.scrollTo({top:document.querySelector('.app').offsetTop-20,behavior:'smooth'});
  }); });
  document.querySelectorAll('#mockup button').forEach(function(b){
    if(isDownloadAction(b) && !b.hasAttribute('data-go')){
      b.addEventListener('click',function(){ downloadReceipt(receiptNoFrom(b)); toast('E-kuitansi PDF diunduh.'); });
      return;
    }
    if(b.hasAttribute('data-go') || b.classList.contains('roletab') || (b.closest('.seg') && b.closest('#jenisSeg'))) return;
    var label=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(/^Bayar Rp/.test(label)){
      b.addEventListener('click',function(){ toast('Pembayaran terverifikasi. E-kuitansi baru siap diunduh.'); });
    } else if(/Kirim instruksi pembayaran|Kirim tagihan|Kirim pengingat/.test(label)){
      b.addEventListener('click',function(){ toast('Instruksi terkirim ke customer.'); });
    } else if(/Ajukan billing/.test(label)){
      b.addEventListener('click',function(){ toast('Billing gate cash lolos (≥30%). Permintaan billing dikirim.'); });
    } else if(/Setujui/.test(label)){
      b.addEventListener('click',function(){ toast('Keputusan exception tercatat. Gate dievaluasi ulang.'); });
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
  var screenRole={beranda:'frontman',transaksi:'frontman',bayar:'frontman',request:'frontman',dokumen:'frontman',eskalasi:'frontman',cashless:'frontman',tx_hiace:'frontman',tx_raize:'frontman',tx_avanza:'frontman',tx_fortuner:'frontman',verifikasi:'admin',dashboard:'mgmt',customer:'cust',customer_detail:'cust',order_aksesoris:'cust',order_calya:'cust',tagihan_customer:'cust',e_kuitansi:'cust'};
  function applyRole(role){
    currentRole=role;
    document.querySelectorAll('.roletab').forEach(function(x){x.setAttribute('aria-pressed', x.dataset.role===role?'true':'false');});
    document.querySelectorAll('[data-rail]').forEach(function(r){ r.hidden = r.dataset.rail!==role; });
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
    applyRole(screenRole[hash]||'frontman');
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
  window.addEventListener('fast-session', applyLive);

  var channelMeta={
    qris:{title:'QRIS dinamis',hint:'Customer scan. Jumlah sudah terisi dari SPK.'},
    cdm:{title:'CDM cabang',hint:'Setor tunai. Kode bayar dari SPK, bukan ketik nominal.'},
    edc:{title:'EDC host-to-host',hint:'Kartu di mesin. Nominal didorong sistem.'},
    bank:{title:'Aplikasi bank',hint:'Biller resmi FAST. VA sudah terisi.'},
    brilink:{title:'Agen BRILink',hint:'Menu resmi di EDC agen.'},
    wa:{title:'WhatsApp checkout',hint:'Kirim satu link. Customer pilih metode.'},
    portal:{title:'Portal SPK',hint:'URL yang sama dari booking sampai lunas.'}
  };
  var channelOrder=['qris','cdm','edc','bank','brilink','wa','portal'];
  function selectChannel(ch){
    document.querySelectorAll('.channel').forEach(function(c){
      c.setAttribute('aria-pressed', c.getAttribute('data-channel')===ch?'true':'false');
    });
    var meta=channelMeta[ch]||channelMeta.qris;
    var title=document.getElementById('cashPrevTitle');
    var hint=document.getElementById('cashPrevHint');
    var qr=document.getElementById('cashQr');
    var btn=document.getElementById('cashPayBtn');
    if(title) title.textContent=meta.title;
    if(hint) hint.textContent=meta.hint;
    if(qr) qr.style.display=ch==='qris'?'':'none';
    if(btn){ btn.setAttribute('data-pay', ch); }
  }
  document.querySelectorAll('.channel[data-channel]').forEach(function(b){
    b.addEventListener('click',function(){ selectChannel(b.getAttribute('data-channel')); });
  });
  document.addEventListener('keydown',function(e){
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var cash=document.getElementById('cashless');
    if(!cash || !cash.classList.contains('on')) return;
    var n=parseInt(e.key,10);
    if(n>=1 && n<=7) selectChannel(channelOrder[n-1]);
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
      if(id==='customer'||id==='customer_detail') applyRole('cust');
      else if(id==='beranda'||id==='transaksi') applyRole('frontman');
      show(id);
    });
  });
})();
