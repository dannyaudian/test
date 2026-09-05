/* Payment jobs + QRIS/VA lock */
  var payJobId='booking';
  var dgVaBank='BCA';
  var dgQrisReady=false;
  var dgVaReady=false;
  var payJobs={
    booking:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Yaris 1.5 G',kind:'Booking fee',amount:'Rp 3.000.000',
      amountNum:3000000,max:3000000,locked:true,
      cdm:'0426 3000 01',brilink:'8810 0426 3000',
      va:{BCA:'8801 0426 0001',BRI:'0026 0426 0001',Mandiri:'8881 0426 0001'},
      back:'booking',
      custBack:'customer_booking',
      lead:'Booking fee adalah payment request salesman. QRIS dan VA terkunci Rp 3.000.000.'
    },
    lunas:{
      name:'Budi Santoso',spk:'SPK/26/CLD/00418',unit:'Innova Zenix',kind:'Pelunasan tahap 2',amount:'Rp 100.000.000',
      amountNum:100000000,max:100000000,locked:true,
      cdm:'0418 1000 03',brilink:'8810 0418 0003',
      va:{BCA:'8801 0418 0003',BRI:'0026 0418 0003',Mandiri:'8881 0418 0003'},
      back:'cashless',
      lead:'Ada payment request salesman. Nominal QRIS dan VA terkunci Rp 100.000.000.'
    },
    open:{
      name:'Budi Santoso',spk:'SPK/26/CLD/00418',unit:'Innova Zenix',kind:'Unit payment',amount:'Enter amount',
      amountNum:0,max:81750000,locked:false,
      cdm:'0418 OPEN 01',brilink:'8810 0418 OPEN',
      va:{BCA:'8801 0418 8100',BRI:'0026 0418 8100',Mandiri:'8881 0418 8100'},
      back:'customer_detail',
      lead:'There is no request for this remainder. Enter the amount. QRIS shows a barcode; VA issues an account number.'
    },
    dewi:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Yaris 1.5 G',kind:'Yaris settlement',amount:'Enter amount',
      amountNum:0,max:299150000,locked:false,
      cdm:'0426 OPEN 01',brilink:'8810 0426 OPEN',
      va:{BCA:'8801 0426 8100',BRI:'0026 0426 8100',Mandiri:'8881 0426 8100'},
      back:'so',
      lead:'Settlement for SO 4500091426. Enter the amount. QRIS appears after the number; VA is issued after the amount. EDC is only available to Frontman at the branch.'
    },
    agya:{
      name:'Dewi Lestari',spk:'SPK/26/CLD/00426',unit:'Agya 1.2 G',kind:'Booking fee Agya',amount:'Rp 2.000.000',
      amountNum:2000000,max:2000000,locked:true,
      cdm:'0426 2000 02',brilink:'8810 0426 2000',
      va:{BCA:'8801 0426 0002',BRI:'0026 0426 0002',Mandiri:'8881 0426 0002'},
      back:'so2',
      custBack:'customer_booking',
      lead:'Booking fee baris Agya. QRIS dan VA terkunci Rp 2.000.000. Tidak menimpa SO Yaris.'
    }
  };
  function formatRp(n){ return 'Rp '+Number(n||0).toLocaleString('id-ID'); }
  function parseRp(s){ var d=String(s||'').replace(/\D/g,''); return d?parseInt(d,10):0; }
  function currentJob(){ return payJobs[payJobId]||payJobs.booking; }
  function currentDgAmount(){
    var j=currentJob();
    if(j.locked) return j.amountNum;
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    var n=parseRp(inp&&inp.value);
    if(j.max && n>j.max) n=j.max;
    return n;
  }
  function syncPayAmount(){
    var j=currentJob();
    var n=currentDgAmount();
    var label=j.locked?j.amount:(n?formatRp(n):'Enter amount');
    document.querySelectorAll('[data-pay-amount]').forEach(function(el){ el.textContent=label; });
    document.querySelectorAll('[data-pay-amount-display]').forEach(function(el){ el.textContent=n?formatRp(n):'—'; });
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    if(inp && j.locked) inp.value=String(j.amountNum);
  }
  function shopOrderNo(spk){
    var m=String(spk||'').match(/(\d{5,})$/);
    return m?'Pesanan FAST-'+m[1]:spk;
  }
  function applyPayLockUI(){
    var j=currentJob();
    var locked=!!j.locked;
    var shop=currentRole==='cust';
    document.querySelectorAll('[data-pay-locked]').forEach(function(el){ el.hidden=!locked; });
    document.querySelectorAll('[data-pay-open]').forEach(function(el){ el.hidden=locked; });
    var inp=document.querySelector('#digiroom [data-pay-amount-input]');
    if(inp){
      inp.readOnly=locked;
      inp.value=locked?String(j.amountNum):'';
    }
    document.querySelectorAll('[data-pay-max]').forEach(function(el){
      el.textContent='Maksimum '+formatRp(j.max)+(locked?'':' · sisa di luar permintaan aktif');
    });
    var lead=document.querySelector('[data-pay-lead]');
    if(lead){
      lead.textContent=shop
        ? (payJobId==='booking'
          ? 'Booking fee Yaris. Request salesman terkunci '+j.amount+'. QRIS dan VA langsung siap — Anda tidak mengetik angka.'
          : (locked?'There is a payment request from the salesperson. The QRIS and VA amount is locked at '+j.amount+'.':'Enter the amount. QRIS shows a barcode; VA issues an account number.'))
        : j.lead;
    }
    document.querySelectorAll('#digiroom [data-ch-hint]').forEach(function(el){
      var open=el.getAttribute('data-ch-open')||el.textContent;
      var lock=el.getAttribute('data-ch-lock')||open;
      el.textContent=locked?lock:open;
    });
    dgQrisReady=locked;
    dgVaReady=locked;
    syncPayAmount();
    refreshDgInstruments();
  }
  function refreshDgInstruments(){
    var n=currentDgAmount();
    var qrisOn=dgQrisReady && n>0;
    var vaOn=dgVaReady && n>0;
    document.querySelectorAll('[data-qris-wait]').forEach(function(el){ el.hidden=qrisOn; });
    document.querySelectorAll('[data-qris-ready]').forEach(function(el){ el.hidden=!qrisOn; });
    document.querySelectorAll('[data-va-wait]').forEach(function(el){ el.hidden=vaOn; });
    document.querySelectorAll('[data-va-ready]').forEach(function(el){ el.hidden=!vaOn; });
  }
  function setPayJob(id){
    payJobId=payJobs[id]?id:'booking';
    var j=currentJob();
    document.querySelectorAll('[data-pay-name]').forEach(function(el){ el.textContent=j.name; });
    document.querySelectorAll('[data-pay-spk]').forEach(function(el){
      el.textContent=currentRole==='cust'?shopOrderNo(j.spk):j.spk;
    });
    document.querySelectorAll('[data-pay-kind]').forEach(function(el){
      el.textContent=currentRole==='cust'?(j.kind||'').replace(/tahap \d+/i,'').trim():j.kind;
    });
    document.querySelectorAll('[data-pay-unit]').forEach(function(el){ el.textContent=j.unit; });
    document.querySelectorAll('[data-pay-cdm]').forEach(function(el){ el.textContent=j.cdm; });
    document.querySelectorAll('[data-pay-brilink]').forEach(function(el){ el.textContent=j.brilink; });
    var back=document.querySelector('[data-dg-back]');
    if(back){
      if(currentRole==='cust'){
        var dest=j.custBack||'customer_detail';
        back.setAttribute('data-go', dest);
        back.setAttribute('data-role', 'cust');
        back.textContent=dest==='customer_booking'?'← Pesanan FAST-00426':'← Pesanan saya';
      } else {
        back.setAttribute('data-go', j.back);
        back.setAttribute('data-role', j.back==='customer_detail'?'cust':'frontman');
        back.textContent=j.back==='customer_detail'?'← Pesanan':'← Frontman';
      }
    }
    var no=document.getElementById('dgVaNo');
    if(no) no.textContent=j.va.BCA;
    applyPayLockUI();
    showDg('home');
    if(window.FAST && FAST.renderLineage) FAST.renderLineage({payJob:payJobId, screen:(document.querySelector('.screen.on')||{}).id});
  }
