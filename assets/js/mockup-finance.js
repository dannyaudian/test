/* Finance HO · buku B2B leasing */
  var HO_NOW=new Date('2026-09-07T12:00:00+07:00').getTime();
  var DAY=86400000;
  function hoIdr(n){
    n=Math.round(n||0);
    if(n>=1e9) return 'Rp '+(n/1e9).toFixed(1).replace('.',',')+' M';
    if(n>=1e6) return 'Rp '+Math.round(n/1e6).toLocaleString('id-ID')+' jt';
    return 'Rp '+n.toLocaleString('id-ID');
  }
  function hoDays(from, to){
    if(!from) return null;
    return Math.max(0, Math.round(((to||HO_NOW)-from)/DAY));
  }
  function hoBand(d){
    if(d==null) return -1;
    if(d<=7) return 0;
    if(d<=14) return 1;
    if(d<=30) return 2;
    return 3;
  }
  function hoMedian(arr){
    if(!arr.length) return null;
    var a=arr.slice().sort(function(x,y){ return x-y; });
    var m=Math.floor(a.length/2);
    return a.length%2?a[m]:Math.round((a[m-1]+a[m])/2);
  }
  var HO_BOOK=[
    { id:'2101', live:false, cabang:'Kelapa Gading', unit:'Innova Zenix', debitur:'PT Danapura Logistik', so:'4500092101', spk:'SPK/26/KLD/00210', finance:329600000, dpLabel:'Rp 82.400.000', kwt:'KWT/26/KLD/008201', bucket:'billed', paperlessAt:HO_NOW-18*DAY, kwtAt:HO_NOW-17*DAY, note:'Paperless 21 Agu · kuitansi aktif · mitra belum settle' },
    { id:'1888', live:false, cabang:'BSD', unit:'Fortuner 2.8', debitur:'PT Danapura Armada', so:'4500091888', spk:'SPK/26/BSD/00188', finance:412500000, dpLabel:'Rp 103.125.000', kwt:'KWT/26/BSD/007188', bucket:'billed', paperlessAt:HO_NOW-41*DAY, kwtAt:HO_NOW-40*DAY, note:'Aging 41 hari · di atas SLA 14 hari' },
    { id:'2033', live:false, cabang:'Serpong', unit:'Alphard', debitur:'PT Danapura Utama', so:'4500092033', spk:'SPK/26/SRP/00203', finance:891000000, dpLabel:'Rp 222.750.000', kwt:'KWT/26/SRP/008033', bucket:'billed', paperlessAt:HO_NOW-6*DAY, kwtAt:HO_NOW-6*DAY, note:'Baru ditagih · masih dalam SLA' },
    { id:'1750', live:false, cabang:'Pondok Indah', unit:'Rush GR Sport', debitur:'CV Danapura Niaga', so:'4500091750', spk:'SPK/26/PDI/00175', finance:221400000, dpLabel:'Rp 55.350.000', kwt:'KWT/26/PDI/006750', bucket:'lunas', paperlessAt:HO_NOW-31*DAY, kwtAt:HO_NOW-30*DAY, lunasAt:HO_NOW-19*DAY, note:'Lunas 19 hari setelah paperless' },
    { id:'1620', live:false, cabang:'Bekasi', unit:'Avanza 1.5', debitur:'PT Danapura Retail', so:'4500091620', spk:'SPK/26/BKS/00162', finance:168800000, dpLabel:'Rp 42.200.000', kwt:'KWT/26/BKS/006162', bucket:'lunas', paperlessAt:HO_NOW-52*DAY, kwtAt:HO_NOW-51*DAY, lunasAt:HO_NOW-25*DAY, note:'Lunas 27 hari · di luar SLA' },
    { id:'1944', live:false, cabang:'Cilandak', unit:'Camry HV', debitur:'PT Danapura Utama', so:'4500091944', spk:'SPK/26/CLD/00194', finance:445000000, dpLabel:'Rp 111.250.000', kwt:'', bucket:'unbilled', ready:true, note:'Paket + DP + e-PO lengkap · Admin belum kirim paperless' },
    { id:'1812', live:false, cabang:'Depok', unit:'Raize 1.0', debitur:'PT Danapura Armada', so:'4500091812', spk:'SPK/26/DPK/00181', finance:198700000, dpLabel:'Rp 49.675.000', kwt:'', bucket:'unbilled', ready:false, hold:'E-PO leasing belum terbit', note:'Full DP ada · paperless tertahan e-PO (bukan waiver DP)' }
  ];
  function hoParseAmt(label){
    var row=(FAST.B2B_SO||[]).filter(function(x){ return x.id===label || x.so===label; })[0];
    if(!row) return 0;
    var n=String(row.financeLabel||'').replace(/[^\d]/g,'');
    return Number(n)||0;
  }
  function hoLiveRows(){
    if(!window.FAST || !FAST.b2bLoad) return [];
    var s=FAST.b2bLoad();
    return (FAST.B2B_SO||[]).map(function(meta){
      var u=s.units[meta.id]||{};
      var flow=FAST.b2bDerive(u);
      var billed=!!u.paperlessSent && !u.lunas;
      var lunas=!!u.lunas;
      var ready=typeof FAST.b2bAdminCanBill==='function' && FAST.b2bAdminCanBill(u) && !u.paperlessSent;
      var finance=hoParseAmt(meta.id);
      var paper=u.paperlessAt||null;
      var kwt=u.kwtAt||null;
      var lun=u.lunasAt||null;
      var bucket=lunas?'lunas':(billed?'billed':'unbilled');
      var hold='';
      if(bucket==='unbilled' && !ready){
        if(u.backflow) hold='Backflow dokumen';
        else if(!u.signedContract) hold='Kontrak belum TTD';
        else if(!u.dpReceived) hold='Full DP belum masuk';
        else if(!FAST.b2bEpoOk(u)) hold='E-PO / putusan OM';
        else hold='Paket penagihan Frontman';
      }
      var note=lunas?'Pelunasan tercatat di SO ini':(billed?(u.kwtIssued?('Kuitansi '+meta.kwt+' · menunggu settle mitra'):'Paperless terkirim · kuitansi belum terbit'):(ready?'Siap ditagih Administrasi':hold));
      return {
        id:meta.id, live:true, cabang:'Cilandak', unit:meta.unit, debitur:'PT Danapura Utama',
        so:meta.so, spk:'SPK/26/CLD/00421', finance:finance, dpLabel:meta.dpLabel, kwt:meta.kwt,
        bucket:bucket, ready:ready, hold:hold, note:note, flow:flow,
        paperlessAt:paper, kwtAt:kwt, lunasAt:lun, go:'tx_hiace', pick:meta.id
      };
    });
  }
  function hoPortfolio(){
    return hoLiveRows().concat(HO_BOOK);
  }
  function hoAgingDays(row){
    if(row.bucket==='lunas') return hoDays(row.paperlessAt, row.lunasAt);
    if(row.bucket==='billed') return hoDays(row.paperlessAt, HO_NOW);
    return null;
  }
  var hoView='all';
  var hoPick=null;
  function hoCardHtml(row){
    var age=hoAgingDays(row);
    var tag=row.bucket==='lunas'?'ok':(row.bucket==='billed'?(age>14?'stop':'wait'):(row.ready?'wait':'hold'));
    var tagText=row.bucket==='lunas'?('Lunas · '+(age!=null?age+' hari':'')):row.bucket==='billed'?('Tagih · aging '+(age!=null?age+'h':'—')):(row.ready?'Siap ditagih':'Belum tagih');
    var thumb=row.live?'live':(row.bucket==='lunas'?'ok':(age>14?'age':'ho'));
    var short=String(row.unit||'').split('·')[0].trim().slice(0,8).toUpperCase();
    return '<button type="button" class="order-card" data-ho-row="'+row.id+'">'+
      '<div class="thumb ho '+thumb+'">'+short+'</div>'+
      '<div class="meta">'+
        '<p class="oid">'+row.so+' · '+row.cabang+' · '+row.spk+'</p>'+
        '<strong class="oname">'+row.debitur+' · '+row.unit+'</strong>'+
        '<p class="spec">'+row.note+'</p>'+
        '<div class="row2"><span class="tag '+tag+'">'+tagText+'</span><span class="amt">'+hoIdr(row.finance)+'</span></div>'+
        '<p class="cta">'+(row.live?'Buka SPK Cilandak →':'Detail di buku HO')+'</p>'+
      '</div></button>';
  }
  function applyFinanceHo(){
    var host=document.getElementById('finance_ho');
    if(!host) return;
    var all=hoPortfolio();
    var unbilled=all.filter(function(r){ return r.bucket==='unbilled'; });
    var billed=all.filter(function(r){ return r.bucket==='billed'; });
    var lunas=all.filter(function(r){ return r.bucket==='lunas'; });
    var ready=unbilled.filter(function(r){ return r.ready; });
    var hold=unbilled.filter(function(r){ return !r.ready; });
    var aging=billed.filter(function(r){ return (hoAgingDays(r)||0)>14; });
    var leadVals=lunas.map(function(r){ return hoAgingDays(r); }).filter(function(d){ return d!=null; });
    var sumU=unbilled.reduce(function(a,r){ return a+r.finance; },0);
    var sumB=billed.reduce(function(a,r){ return a+r.finance; },0);
    var sumA=aging.reduce(function(a,r){ return a+r.finance; },0);
    var med=hoMedian(leadVals);
    var avg=leadVals.length?Math.round(leadVals.reduce(function(a,b){ return a+b; },0)/leadVals.length):null;
    function setText(sel, val){
      document.querySelectorAll(sel).forEach(function(el){ el.textContent=val; });
    }
    setText('[data-ho-kpi="unbilled-n"]', String(unbilled.length));
    setText('[data-ho-kpi="unbilled-rp"]', hoIdr(sumU)+' dibiayai · belum paperless');
    setText('[data-ho-kpi="billed-n"]', String(billed.length));
    setText('[data-ho-kpi="billed-rp"]', hoIdr(sumB)+' menunggu pelunasan mitra');
    setText('[data-ho-kpi="lead-days"]', med==null?'—':String(med));
    setText('[data-ho-kpi="lead-days-2"]', med==null?'—':med+' hari');
    setText('[data-ho-kpi="lead-avg"]', avg==null?'—':avg+' hari');
    setText('[data-ho-kpi="aging-n"]', String(aging.length));
    setText('[data-ho-kpi="aging-n-2"]', aging.length+' SO · '+hoIdr(sumA));
    setText('[data-ho-kpi="aging-rp"]', hoIdr(sumA)+' di atas 14 hari');
    setText('[data-ho-n="unbilled"]', String(unbilled.length));
    setText('[data-ho-n="billed"]', String(billed.length));
    setText('[data-ho-ready-n"]', String(ready.length));
    setText('[data-ho-hold-n"]', String(hold.length));
    setText('[data-ho-open-n"]', String(billed.length));
    var bands=[0,0,0,0];
    billed.concat(lunas).forEach(function(r){
      var b=hoBand(hoAgingDays(r));
      if(b>=0) bands[b]++;
    });
    var max=Math.max.apply(null, bands.concat([1]));
    bands.forEach(function(n,i){
      document.querySelectorAll('[data-ho-bar="'+i+'"]').forEach(function(el){ el.style.width=Math.round(n/max*100)+'%'; });
      setText('[data-ho-bar-n="'+i+'"]', String(n));
    });
    var listFilter=hoView==='unbilled'?unbilled:hoView==='billed'?billed:hoView==='lead'?billed.concat(lunas):all;
    if(hoView==='lead'){
      listFilter=listFilter.slice().sort(function(a,b){ return (hoAgingDays(b)||0)-(hoAgingDays(a)||0); });
    }
    var labels={all:'Semua SO leasing',unbilled:'Belum tagih ke leasing',billed:'Sudah tagih, belum bayar',lead:'Leadtime & aging'};
    var lab=document.querySelector('[data-ho-filter-label]');
    if(lab) lab.textContent=labels[hoView]||labels.all;
    document.querySelectorAll('[data-rail="finance"] button[data-go="finance_ho"]').forEach(function(b){
      var j=b.getAttribute('data-ho-jump')||'all';
      b.setAttribute('aria-current', j===hoView?'true':'false');
    });
    document.querySelectorAll('[data-ho-tabs] [data-ho-view]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-view')===hoView?'true':'false');
    });
    document.querySelectorAll('.ho-kpis [data-ho-view]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-view')===hoView?'true':'false');
    });
    document.querySelectorAll('[data-ho-panel="board"]').forEach(function(el){ el.hidden=hoView==='lead'; });
    document.querySelectorAll('[data-ho-panel="lead"]').forEach(function(el){ el.hidden=hoView!=='lead'; });
    var list=document.querySelector('[data-ho-list]');
    if(list) list.innerHTML=listFilter.map(hoCardHtml).join('')||'<p class="hint">Tidak ada SO di filter ini.</p>';
    var ageList=document.querySelector('[data-ho-aging-list]');
    if(ageList){
      var open=billed.slice().sort(function(a,b){ return (hoAgingDays(b)||0)-(hoAgingDays(a)||0); });
      ageList.innerHTML=open.map(hoCardHtml).join('')||'<p class="hint">Tidak ada tagihan terbuka.</p>';
    }
    document.querySelectorAll('[data-ho-row]').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-ho-row')===hoPick?'true':'false');
    });
    var row=all.filter(function(r){ return r.id===hoPick; })[0];
    var copy=document.querySelector('[data-ho-detail-copy]');
    var acts=document.querySelector('[data-ho-detail-actions]');
    var openBtn=document.querySelector('[data-ho-open-tx]');
    if(copy){
      if(!row) copy.textContent='Pilih baris di buku untuk melihat lineage, blocker, dan tautan cabang.';
      else copy.innerHTML='<b>'+row.so+'</b> · '+row.unit+' · '+row.cabang+'<br>'+row.debitur+' · dibiayai '+hoIdr(row.finance)+'<br>'+row.note+(row.dpLabel?' · DP wajib '+row.dpLabel:'')+(row.kwt?' · '+row.kwt:'');
    }
    if(acts) acts.hidden=!row;
    if(openBtn && row){
      if(row.live){
        openBtn.setAttribute('data-go','tx_hiace');
        openBtn.setAttribute('data-tx-dots','hiace');
        openBtn.setAttribute('data-b2b-pick', row.pick||row.id);
        openBtn.textContent='Buka workspace Hiace';
      } else {
        openBtn.removeAttribute('data-go');
        openBtn.removeAttribute('data-b2b-pick');
        openBtn.textContent='Pantau di buku HO';
      }
    }
  }
  function bindFinanceHo(){
    document.querySelectorAll('[data-ho-view]').forEach(function(b){
      b.addEventListener('click',function(){
        hoView=b.getAttribute('data-ho-view')||'all';
        applyFinanceHo();
      });
    });
    var host=document.getElementById('finance_ho');
    if(host) host.addEventListener('click',function(e){
      var rowEl=e.target.closest('[data-ho-row]');
      if(!rowEl) return;
      hoPick=rowEl.getAttribute('data-ho-row');
      applyFinanceHo();
      var row=(hoPortfolio().filter(function(r){ return r.id===hoPick; })[0]);
      if(row && row.live && typeof show==='function'){
        if(window.FAST && FAST.b2bLoad){
          var st=FAST.b2bLoad();
          st.selected=row.pick||row.id;
          st.tab='tagih';
          FAST.save({units:st.units, selected:st.selected, tab:st.tab}, FAST.B2B_KEY);
        }
        if(typeof persistTx==='function') persistTx('hiace');
        show('tx_hiace');
      }
    });
    var openBtn=document.querySelector('[data-ho-open-tx]');
    if(openBtn) openBtn.addEventListener('click',function(){
      var row=(hoPortfolio().filter(function(r){ return r.id===hoPick; })[0]);
      if(row && row.live && typeof show==='function'){
        if(typeof persistTx==='function') persistTx('hiace');
        show('tx_hiace');
      } else {
        toast('SO cabang ini dipantau di buku HO. Penagihan tetap di Administrasi cabang.');
      }
    });
    window.addEventListener('fast-session', function(){ applyFinanceHo(); });
  }
  bindFinanceHo();
  applyFinanceHo();
  FAST.hoSetView=function(v){ hoView=v||'all'; applyFinanceHo(); };
  Object.defineProperty(FAST,'hoView',{ get:function(){ return hoView; } });
