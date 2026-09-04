(function(){
  var FAST=window.FAST=window.FAST||{};
  var STAGES=[
    {id:'spk',label:'SPK'},
    {id:'quot',label:'QT'},
    {id:'so',label:'SO'},
    {id:'afi',label:'AFI'},
    {id:'do',label:'DO'},
    {id:'bill',label:'Billing'},
    {id:'del',label:'Kirim'},
    {id:'stnk',label:'STNK'}
  ];
  var SCREEN_TX={
    spk:'dewi',spk_baru:'dewi',quot:'dewi',booking:'dewi',so:'dewi',so2:'dewi',proses:'dewi',
    afi_d:'dewi',do:'dewi',bill_d:'dewi',kirim_d:'dewi',stnk_d:'dewi',
    transaksi:'budi',afi:'budi',dokumen:'budi',request:'budi',bayar:'budi',
    exc_alamat:'budi',exc_afi:'budi',customer_detail:'budi',tagihan_customer:'budi',
    tx_hiace:'hiace',
    tx_raize:'raize',
    tx_avanza:'agus',delivery:'agus',
    gi:'fajar',
    tx_fortuner:'maria',exc_stnk:'maria',
    order_calya:'calya'
  };
  var VIEW={
    spk:'spk',spk_baru:'spk',quot:'quot',booking:'quot',so:'so',so2:'so',proses:'spk',
    afi_d:'afi',do:'do',bill_d:'bill',kirim_d:'del',stnk_d:'stnk',
    transaksi:'so',afi:'afi',dokumen:'spk',request:'bill',bayar:'bill',
    cashless:'bill',exc_alamat:'afi',exc_afi:'afi',customer_detail:'bill',tagihan_customer:'bill',
    tx_hiace:'del',tx_raize:'spk',tx_avanza:'del',delivery:'del',gi:'del',
    tx_fortuner:'stnk',exc_stnk:'stnk',order_calya:'stnk'
  };
  function load(k){ return (FAST.load?FAST.load(k):null)||{}; }
  function idx(id){ return STAGES.findIndex(function(s){ return s.id===id; }); }
  function doneBefore(now){
    var n=idx(now);
    var set={};
    STAGES.forEach(function(s,i){ if(n>i) set[s.id]=true; });
    return set;
  }
  function dewiDraft(){ return load(FAST.DRAFT_KEY); }
  function dewiNow(){
    var paid=!!(load(FAST.BF_KEY).paid);
    var q=load(FAST.QT_KEY);
    if(q.dof) return 'bill';
    if(q.afi) return 'do';
    if(paid) return 'afi';
    if(!(dewiDraft().saved)) return 'spk';
    return 'quot';
  }
  function budiNow(){
    var a=load(FAST.AFI_KEY);
    var live=load(FAST.KEY);
    if(typeof live.ar==='number' && live.ar===0) return 'del';
    if(a.afi && a.bill) return 'del';
    if(a.afi || a.bill || a.pair) return 'bill';
    return 'afi';
  }
  function fajarNow(){
    var g=load(FAST.GI_KEY).gi||'draft';
    if(g==='approved') return 'stnk';
    return 'del';
  }
  function agusNow(){
    return load(FAST.DEL_KEY).requested ? 'stnk' : 'del';
  }
  var CASES={
    dewi:{
      go:function(){
        var saved=!!dewiDraft().saved;
        return {spk:saved?'spk':'spk_baru',quot:'quot',so:'so',afi:'afi_d',do:'do',bill:'bill_d',del:'kirim_d',stnk:'stnk_d'};
      },
      now:dewiNow,
      copy:function(now){
        if(now==='spk') return 'Isi & unggah dulu. Baru dapat nomor SPK. Booking fee menyusul.';
        if(now==='quot') return 'SPK tersimpan. Quotation & booking fee menyusul — fee non-waivable.';
        if(now==='afi') return 'SO terbuka. AFI memakai nama/alamat STNK dari SPK.';
        if(now==='do') return 'AFI terkirim. DO gudang menyusul.';
        if(now==='bill') return 'DO ada. Billing cash ≥30% non-waivable.';
        return 'Jejak Dewi · SPK/26/CLD/00426 sampai STNK/BPKB.';
      }
    },
    budi:{
      go:{spk:'transaksi',quot:'transaksi',so:'transaksi',afi:'afi',do:'afi',bill:'afi',del:'cashless',stnk:'transaksi'},
      now:budiNow,
      copy:function(now){
        if(now==='afi') return 'SO ada. Billing + AFI berpasangan. Pelunasan cash tetap non-waivable.';
        if(now==='bill') return 'Billing/AFI berjalan. Kirim tertahan sampai lunas.';
        if(now==='del') return 'Lunas atau AFI sudah. Delivery cash tetap tunggu AR Open Rp 0.';
        return 'Jejak Budi · SPK/26/CLD/00418 sampai STNK/BPKB.';
      }
    },
    hiace:{
      go:{spk:'tx_hiace',quot:'tx_hiace',so:'tx_hiace',afi:'tx_hiace',do:'tx_hiace',bill:'tx_hiace',del:'tx_hiace',stnk:'tx_hiace'},
      now:function(){ return 'del'; },
      copy:function(){ return 'SO leasing ada. Kirim tertahan kontrak TTD dari B2B — bukan waiver.'; }
    },
    raize:{
      go:{spk:'tx_raize',quot:'tx_raize',so:'tx_raize',afi:'tx_raize',do:'tx_raize',bill:'tx_raize',del:'tx_raize',stnk:'tx_raize'},
      now:function(){ return 'spk'; },
      copy:function(){ return 'SPK tertahan NPWP. Data gate, bukan Approval Engine. Booking fee belum.'; }
    },
    agus:{
      go:{spk:'tx_avanza',quot:'tx_avanza',so:'tx_avanza',afi:'tx_avanza',do:'delivery',bill:'tx_avanza',del:'delivery',stnk:'tx_avanza'},
      now:agusNow,
      copy:function(now){
        return now==='stnk'?'Pengiriman diajukan. STNK/BPKB menyusul data SPK yang sama.':'Lunas. Jejak di tahap kirim — ajukan delivery dari SPK.';
      }
    },
    fajar:{
      go:{spk:'gi',quot:'gi',so:'gi',afi:'gi',do:'gi',bill:'gi',del:'gi',stnk:'gi'},
      now:fajarNow,
      copy:function(now){
        return now==='stnk'?'Good Issue tercatat. STNK/BPKB memakai data SPK.':'Terkirim. Good Issue dulu, baru tracking STNK.';
      }
    },
    maria:{
      go:{spk:'tx_fortuner',quot:'tx_fortuner',so:'tx_fortuner',afi:'tx_fortuner',do:'tx_fortuner',bill:'tx_fortuner',del:'tx_fortuner',stnk:'exc_stnk'},
      now:function(){ return 'stnk'; },
      copy:function(){ return 'Delivered & lunas. STNK hari ke-19 — eskalasi, bukan waiver lunas.'; }
    },
    calya:{
      go:{spk:'order_calya',quot:'order_calya',so:'order_calya',afi:'order_calya',do:'order_calya',bill:'order_calya',del:'order_calya',stnk:'order_calya'},
      now:function(){ return 'done'; },
      copy:function(){ return 'Selesai. SPK → STNK/BPKB tuntas di akun yang sama.'; }
    }
  };
  function state(id){
    var c=CASES[id];
    if(!c) return null;
    var now=c.now();
    var allDone=now==='done';
    var done=allDone?{spk:1,quot:1,so:1,afi:1,do:1,bill:1,del:1,stnk:1}:doneBefore(now);
    if(id==='hiace'){ done={spk:1,quot:1,so:1,afi:1,do:1,bill:1}; }
    if(id==='raize'){ done={}; }
    if(id==='fajar' && now==='del'){ done={spk:1,quot:1,so:1,afi:1,do:1,bill:1}; }
    if(id==='agus' && now==='del'){ done={spk:1,quot:1,so:1,afi:1,do:1,bill:1}; }
    if(id==='maria'){ done={spk:1,quot:1,so:1,afi:1,do:1,bill:1,del:1}; }
    if(id==='budi' && now==='del'){ done={spk:1,quot:1,so:1,afi:1,do:1,bill:1}; }
    if(id==='budi' && now==='bill'){ done={spk:1,quot:1,so:1,afi:1,do:1}; }
    if(id==='budi' && now==='afi'){ done={spk:1,quot:1,so:1}; }
    if(id==='dewi' && now==='quot'){ done={spk:1}; }
    if(id==='dewi' && now==='spk'){ done={}; }
    var hold=(!allDone && (now==='del'||now==='spk'||now==='stnk'||now==='quot'))?now:null;
    if(id==='raize') hold='spk';
    if(id==='hiace') hold='del';
    if(id==='maria') hold='stnk';
    return {id:id, now:allDone?'stnk':now, done:done, hold:hold, allDone:allDone, go:typeof c.go==='function'?c.go():c.go, copy:c.copy(allDone?'stnk':now)};
  }
  function fillDots(el, st){
    if(!el||!st) return;
    el.classList.add('tx-dots');
    el.innerHTML='';
    STAGES.forEach(function(s){
      var i=document.createElement('i');
      i.title=s.label;
      if(st.allDone || st.done[s.id]) i.className='done';
      if(s.id===st.now && !st.allDone) i.className=st.hold===s.id?'hold':'now';
      el.appendChild(i);
    });
    var lab=document.createElement('span');
    lab.className='lab';
    var cur=STAGES.find(function(s){ return s.id===st.now; });
    lab.textContent=st.allDone?'STNK selesai':((cur?cur.label:'')+' · sekarang');
    el.appendChild(lab);
  }
  function fillNav(nav, st, view, showFn){
    if(!nav||!st) return;
    nav.innerHTML='';
    STAGES.forEach(function(s){
      var b=document.createElement('button');
      b.type='button';
      b.textContent=s.label;
      if(st.allDone || st.done[s.id]) b.className='done';
      if(s.id===st.now && !st.allDone) b.classList.add(st.hold===s.id?'hold':'now');
      if(s.id===view) b.classList.add('on');
      b.addEventListener('click',function(){
        var go=st.go[s.id];
        if(go && typeof showFn==='function') showFn(go);
      });
      nav.appendChild(b);
    });
  }
  var showFn=null;
  function screenTx(id, payJob){
    if(id==='cashless'||id==='digiroom'||id==='booking'){
      if(payJob==='booking'||payJob==='dewi') return 'dewi';
      return 'budi';
    }
    return SCREEN_TX[id]||null;
  }
  function ensureNav(screen, tx){
    var nav=screen.querySelector(':scope > .proc, :scope > .worktabs + .proc');
    if(!nav) nav=screen.querySelector('.proc');
    var hook=screen.id==='spk_baru'
      ? screen.querySelector('.screenhead')
      : (screen.querySelector('.worktabs')||screen.querySelector('.screenhead'));
    if(!nav && hook){
      nav=document.createElement('nav');
      nav.className='proc';
      nav.setAttribute('aria-label','Jejak SPK sampai STNK');
      hook.after(nav);
    }
    if(!nav) return null;
    nav.setAttribute('data-tx-track', tx);
    var note=screen.querySelector(':scope > .tx-now');
    if(!note){
      note=document.createElement('p');
      note.className='tx-now';
      nav.after(note);
    }
    note.setAttribute('data-tx-now', tx);
    var path=screen.querySelector('ol.path');
    if(path) path.hidden=true;
    return {nav:nav, note:note};
  }
  function render(opts){
    opts=opts||{};
    var payJob=opts.payJob;
    var current=opts.screen;
    document.querySelectorAll('[data-tx-dots]').forEach(function(host){
      var id=host.getAttribute('data-tx-dots');
      var st=state(id);
      var box=null;
      if(host.tagName==='TR'){
        var cell=host.querySelector('td.lineage')||null;
        if(cell){
          box=cell.querySelector('.tx-dots');
          if(!box){ box=document.createElement('div'); box.className='tx-dots'; }
          cell.textContent='';
          cell.appendChild(box);
        } else {
          var first=host.querySelector('td');
          if(first){
            box=first.querySelector('.tx-dots');
            if(!box){ box=document.createElement('p'); box.className='tx-dots'; first.appendChild(box); }
          }
        }
      } else if(host.matches('.tx-dots')){
        box=host;
      } else {
        box=host.querySelector('.tx-dots');
        if(!box){
          box=document.createElement('p');
          box.className='tx-dots';
          var meta=host.querySelector('.meta');
          (meta||host).appendChild(box);
        }
      }
      fillDots(box, st);
    });
    Object.keys(SCREEN_TX).forEach(function(sid){
      var screen=document.getElementById(sid);
      if(!screen) return;
      var tx=SCREEN_TX[sid];
      var pack=ensureNav(screen, tx);
      if(!pack) return;
      var st=state(tx);
      var view=VIEW[sid]||st.now;
      fillNav(pack.nav, st, view, showFn);
      if(pack.note) pack.note.textContent=st.copy;
    });
    ['cashless','digiroom'].forEach(function(sid){
      var screen=document.getElementById(sid);
      if(!screen) return;
      var tx=screenTx(sid, payJob);
      var pack=ensureNav(screen, tx);
      if(!pack) return;
      var st=state(tx);
      var view=sid==='booking'?'quot':(tx==='dewi'?'quot':'bill');
      fillNav(pack.nav, st, view, showFn);
      if(pack.note) pack.note.textContent=st.copy;
    });
    if(current){
      var on=document.getElementById(current);
      var tx=screenTx(current, payJob)||(on&&on.querySelector('[data-tx-track]')&&on.querySelector('[data-tx-track]').getAttribute('data-tx-track'));
      if(on && tx){
        var st=state(tx);
        var view=VIEW[current]||st.now;
        var nav=on.querySelector('.proc');
        if(nav) fillNav(nav, st, view, showFn);
      }
    }
  }
  FAST.TX_STAGES=STAGES;
  FAST.txState=state;
  FAST.lineageInit=function(fn){ showFn=fn; };
  FAST.renderLineage=render;
})();
