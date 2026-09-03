(function(){
  var receipts={
    'KWT/26/CLD/009115':{no:'KWT/26/CLD/009115',status:'Aktif',type:'Pelunasan tahap 1',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'1 Sep 2026, 14:08 WIB',method:'Bank app',ref:'VA 8801 0418 0002',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 300.000.000',verify:'VFY-CLD-009115-A7K2'},
    'KWT/26/CLD/008731':{no:'KWT/26/CLD/008731',status:'Aktif',type:'Booking fee',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'28 Agu 2026, 16:30 WIB',method:'Portal SPK / VA',ref:'VA 8801 0418 0001',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 5.000.000',verify:'VFY-CLD-008731-Q3M9'},
    'KWT/26/CLD/009220':{no:'KWT/26/CLD/009220',status:'Aktif',type:'Pelunasan tahap 2',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'3 Sep 2026, 09:41 WIB',method:'Cashless live',ref:'PAY-CLD-00418-3',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 100.000.000',verify:'VFY-CLD-009220-R8P1'}
  };
  function pdfEscape(s){ return String(s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)'); }
  function receiptPdf(r){
    var lines=['FAST — E-KUITANSI PEMBAYARAN',r.no,'Status: '+r.status+' · '+r.type,'Customer: '+r.customer,'Unit: '+r.unit,'Tanggal: '+r.date,'Metode: '+r.method,'Payment reference: '+r.ref,'Nomor SPK: '+r.spk,'Nomor SO: '+r.so,'Nomor billing: '+r.billing,'Nominal diterima: '+r.amount,'Kode verifikasi: '+r.verify,'Diterbitkan Deliverable 2 dan tercatat pada lineage Deliverable 1.'];
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

  var screens=document.querySelectorAll('.layout .screen');
  var navBtns=document.querySelectorAll('.rail button[data-go]');
  var toastEl=document.getElementById('toast');
  var toastTimer=null;
  function toast(msg){
    if(!toastEl) return;
    toastEl.textContent=msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(function(){ toastEl.classList.remove('show'); }, 3200);
  }
  function show(id){
    screens.forEach(function(s){ s.classList.toggle('on', s.id===id); });
    navBtns.forEach(function(b){
      var rail=b.closest('[data-rail]');
      if(b.dataset.go===id && rail && rail.hidden!==true) b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
    document.querySelectorAll('.channel').forEach(function(c){
      c.setAttribute('aria-pressed', c.dataset.go===id?'true':'false');
    });
    var bar=document.querySelector('.urlbar');
    if(bar) bar.textContent='pay.fast.id/cashless/'+id;
  }

  document.querySelectorAll('[data-go]').forEach(function(b){
    b.addEventListener('click',function(e){
      if(b.tagName==='A') return;
      e.preventDefault();
      show(b.dataset.go);
      var app=document.querySelector('.app');
      if(app) window.scrollTo({top:app.offsetTop-20,behavior:'smooth'});
    });
  });

  document.querySelectorAll('#mockup button').forEach(function(b){
    if(!/^Download/i.test((b.textContent||'').trim())) return;
    b.addEventListener('click',function(){
      var box=b.closest('.doc, tr, .box')||b.parentElement;
      var m=(box?box.textContent:'').match(/KWT\/26\/CLD\/\d+/);
      downloadReceipt(m?m[0]:'KWT/26/CLD/009115');
      toast('E-kuitansi PDF diunduh. Lineage sama dengan Deliverable 1.');
    });
  });

  var first={frontman:'overview',cust:'portal',finance:'overview'};
  document.querySelectorAll('.roletab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.roletab').forEach(function(x){x.setAttribute('aria-pressed', x===t?'true':'false');});
      document.querySelectorAll('[data-rail]').forEach(function(r){ r.hidden = r.dataset.rail!==t.dataset.role; });
      show(first[t.dataset.role]);
    });
  });

  var paid=false;
  var channelLabel={qris:'QRIS dinamis',cdm:'CDM cabang',edc:'EDC H2H',bank:'Aplikasi bank',brilink:'Agen BRILink',wa:'WhatsApp checkout',portal:'Portal SPK'};
  document.querySelectorAll('[data-pay]').forEach(function(b){
    b.addEventListener('click',function(){
      var channel=b.getAttribute('data-pay');
      var amount=Number(b.getAttribute('data-amount')||100000000);
      var ar=amount>=181750000?0:81750000;
      document.querySelectorAll('.ar-open').forEach(function(el){
        el.innerHTML=ar===0?'0<span style="font-size:14px;font-weight:500"> Jt</span>':'81,75<span style="font-size:14px;font-weight:500"> Jt</span>';
      });
      document.querySelectorAll('.ar-open-text').forEach(function(el){
        el.textContent=ar===0?'Rp 0':'Rp 81.750.000';
      });
      document.querySelectorAll('.pct-in').forEach(function(el){
        el.textContent=ar===0?'100%':'83,2%';
      });
      var body=document.getElementById('ledgerBody');
      if(body && !paid){
        var tr=document.createElement('tr');
        tr.className='paid-flash';
        tr.innerHTML='<td>3 Sep 09:41</td><td>'+(channelLabel[channel]||channel)+'</td><td>PAY-CLD-00418-3</td><td>KWT/26/CLD/009220</td><td class="num">Rp '+(amount>=181750000?'181.750.000':'100.000.000')+'</td><td>'+(ar===0?'Delivery cash terbuka':'AR berkurang · D1 tersinkron')+'</td>';
        if(body.querySelector('tr:last-child')) body.querySelector('tr:last-child').remove();
        body.appendChild(tr);
      }
      var slot=document.getElementById('newReceiptSlot');
      if(slot){
        slot.className='doc';
        slot.innerHTML='<b>KWT/26/CLD/009220</b><p class="meta">Pelunasan 2 · '+(channelLabel[channel]||'Cashless')+' · real-time</p><span class="tag ok">Aktif</span><button class="btn ghost" style="width:100%;margin-top:10px">Download PDF</button>';
        slot.querySelector('button').addEventListener('click',function(){
          downloadReceipt('KWT/26/CLD/009220');
          toast('E-kuitansi PDF diunduh. Lineage sama dengan Deliverable 1.');
        });
      }
      paid=true;
      toast(ar===0
        ? 'PAID penuh. E-kuitansi terbit. Delivery gate cash di D1 terbuka.'
        : 'PAID via '+(channelLabel[channel]||'kanal')+'. KWT/26/CLD/009220 terbit. AR Open di D1 dihitung ulang.');
      show('receipt');
    });
  });
})();
