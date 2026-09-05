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
    spk:'dewi',spk_baru:'dewi',quot:'dewi',booking:'dewi',so:'dewi',proses:'dewi',
    afi_d:'dewi',do:'dewi',bill_d:'dewi',kirim_d:'dewi',stnk_d:'dewi',
    so2:'agya',
    transaksi:'budi',afi:'budi',dokumen:'budi',request:'budi',bayar:'budi',
    exc_alamat:'budi',exc_afi:'budi',customer_detail:'budi',tagihan_customer:'budi',
    tx_hiace:'hiace',
    tx_raize:'raize',
    tx_avanza:'agus',delivery:'agus',
    gi:'fajar',
    tx_fortuner:'maria',exc_stnk:'maria',
    order_calya:'calya',bukti_serah:'calya'
  };
  var VIEW={
    spk:'spk',spk_baru:'spk',quot:'quot',booking:'quot',so:'so',so2:'so',proses:'spk',
    afi_d:'afi',do:'do',bill_d:'bill',kirim_d:'del',stnk_d:'stnk',
    transaksi:'so',afi:'afi',dokumen:'spk',request:'bill',bayar:'bill',
    cashless:'bill',exc_alamat:'afi',exc_afi:'afi',customer_detail:'bill',tagihan_customer:'bill',
    tx_hiace:'bill',
    tx_raize:'spk',tx_avanza:'del',delivery:'del',gi:'del',
    tx_fortuner:'stnk',exc_stnk:'stnk',order_calya:'stnk',bukti_serah:'stnk'
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
  function dewiGo(){
    var saved=!!dewiDraft().saved;
    return {spk:saved?'spk':'spk_baru',quot:'quot',so:'so',afi:'afi_d',do:'do',bill:'bill_d',del:'kirim_d',stnk:'stnk_d'};
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
  function hiaceNow(){
    var x=FAST.b2bSummary?FAST.b2bSummary():{ttd:0,dp:0,lunas:0};
    if(x.lunas===3) return 'stnk';
    if(x.dp===3) return 'del';
    return 'bill';
  }
  var CASES={
    dewi:{
      go:dewiGo,
      now:dewiNow,
      copy:function(now){
        if(now==='spk') return 'Isi & unggah dulu. Baru dapat nomor SPK. Booking fee menyusul.';
        if(now==='quot') return 'SPK tersimpan. Booking cashless baris Yaris — fee non-waivable.';
        if(now==='afi') return 'SO Yaris terbuka. AFI memakai nama/alamat STNK dari SPK. Cashless pelunasan menempel.';
        if(now==='do') return 'AFI terkirim. DO gudang menyusul. Kanal bayar tetap sama.';
        if(now==='bill') return 'DO ada. Billing cash ≥30% non-waivable. Bayar di Digiroom atau cabang.';
        if(now==='del') return 'Billing jalan. Kirim cash tunggu lunas — cashless di tahap ini.';
        return 'Jejak Dewi · SO Yaris 4500091426 sampai STNK/BPKB.';
      }
    },
    agya:{
      go:function(){
        var g=dewiGo();
        g.so='so2';
        return g;
      },
      now:function(){ return 'quot'; },
      copy:function(){ return 'SO 4500091428 tertahan booking fee baris Agya. Tetap SPK Dewi — bukan transaksi lain.'; }
    },
    budi:{
      go:{spk:'transaksi',quot:'transaksi',so:'transaksi',afi:'transaksi',do:'transaksi',bill:'transaksi',del:'transaksi',stnk:'transaksi'},
      now:budiNow,
      copy:function(now){
        if(now==='afi') return 'SO 4500091238 ada. Billing + AFI berpasangan. Cashless pelunasan di tahap ini.';
        if(now==='bill') return 'Billing/AFI berjalan. Bayar sisa di cashless — kirim tertahan sampai lunas.';
        if(now==='del') return 'Lunas atau AFI sudah. Delivery cash tetap tunggu AR Open Rp 0.';
        return 'Jejak Budi · satu SO 4500091238 sampai STNK/BPKB.';
      }
    },
    hiace:{
      go:{spk:'tx_hiace',quot:'tx_hiace',so:'tx_hiace',afi:'tx_hiace',do:'tx_hiace',bill:'tx_hiace',del:'tx_hiace',stnk:'tx_hiace'},
      now:hiaceNow,
      copy:function(now){
        var x=FAST.b2bSummary?FAST.b2bSummary():{ttd:0,dp:0,back:0,lunas:0};
        if(x.lunas===3) return 'Tiga SO. Pelunasan leasing tercatat. STNK/BPKB memakai data SPK yang sama.';
        if(x.back) return 'Backflow B2B: ada dokumen kurang. Frontman lengkapi, kirim ulang — bukan waiver TTD/DP.';
        if(now==='bill') return 'Tiga SO. Billing tertahan sampai DP wajib dari B2B diterima. Frontman lengkapi data; Admin menagih.';
        if(now==='del') return 'DP B2B '+x.dp+'/3. Kirim tertahan TTD '+x.ttd+'/3. Kuitansi ke leasing dari Administrasi.';
        return 'Tiga SO. DP wajib dari B2B. Frontman lengkapi data; Administrasi paperless + kuitansi.';
      }
    },
    raize:{
      go:{spk:'tx_raize',quot:'tx_raize',so:'tx_raize',afi:'tx_raize',do:'tx_raize',bill:'tx_raize',del:'tx_raize',stnk:'tx_raize'},
      now:function(){ return 'spk'; },
      copy:function(){ return 'SPK tertahan NPWP. Booking cashless belum ditagih. Data gate, bukan Approval Engine.'; }
    },
    agus:{
      go:{spk:'tx_avanza',quot:'tx_avanza',so:'tx_avanza',afi:'tx_avanza',do:'tx_avanza',bill:'tx_avanza',del:'tx_avanza',stnk:'tx_avanza'},
      now:agusNow,
      copy:function(now){
        return now==='stnk'?'Pengiriman diajukan. STNK/BPKB menyusul data SPK yang sama.':'Lunas. Satu SO · ajukan delivery. Cashless sudah selesai.';
      }
    },
    fajar:{
      go:{spk:'gi',quot:'gi',so:'gi',afi:'gi',do:'gi',bill:'gi',del:'gi',stnk:'gi'},
      now:fajarNow,
      copy:function(now){
        return now==='stnk'?'Good Issue tercatat. Paket bukti sama di akun pelanggan.':'Terkirim. Unggah bukti otentik dulu — bukan CCTV dealer.';
      }
    },
    maria:{
      go:{spk:'tx_fortuner',quot:'tx_fortuner',so:'tx_fortuner',afi:'tx_fortuner',do:'tx_fortuner',bill:'tx_fortuner',del:'tx_fortuner',stnk:'tx_fortuner'},
      now:function(){ return 'stnk'; },
      copy:function(){ return 'Delivered & lunas. STNK hari ke-19 — eskalasi Kepala Cabang, bukan waiver lunas.'; }
    },
    calya:{
      go:{spk:'order_calya',quot:'order_calya',so:'order_calya',afi:'order_calya',do:'order_calya',bill:'order_calya',del:'order_calya',stnk:'order_calya'},
      now:function(){ return 'done'; },
      copy:function(){ return 'Selesai. Paket bukti serah terima bisa diunduh — bukan rekaman CCTV.'; }
    }
  };
  function state(id){
    var c=CASES[id];
    if(!c) return null;
    var now=c.now();
    var allDone=now==='done';
    var done=allDone?{spk:1,quot:1,so:1,afi:1,do:1,bill:1,del:1,stnk:1}:doneBefore(now);
    if(id==='hiace'){
      if(now==='bill') done={spk:1,quot:1,so:1,afi:1,do:1};
      else if(now==='stnk') done={spk:1,quot:1,so:1,afi:1,do:1,bill:1,del:1};
      else done={spk:1,quot:1,so:1,afi:1,do:1,bill:1};
    }
    if(id==='raize'){ done={}; }
    if(id==='agya'){ done={spk:1}; }
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
    if(id==='hiace') hold=(now==='stnk')?null:now;
    if(id==='agya') hold='quot';
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
  function showStagePanel(screen, stage){
    if(!screen||!stage) return;
    var panels=screen.querySelectorAll('[data-stage-panel]');
    if(panels.length){
      panels.forEach(function(p){
        p.hidden = p.getAttribute('data-stage-panel')!==stage;
      });
    }
    screen.querySelectorAll('[data-stage-kpis]').forEach(function(el){
      var allow=(el.getAttribute('data-stage-kpis')||'').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
      el.hidden = allow.length ? allow.indexOf(stage)<0 : false;
    });
    screen.setAttribute('data-stage-view', stage);
  }
  function parseStageMap(screen){
    var raw=screen && screen.getAttribute('data-stage-map');
    if(!raw) return null;
    var map={};
    raw.split(',').forEach(function(part){
      var kv=part.split(':');
      if(kv.length===2) map[kv[0].trim()]=kv[1].trim();
    });
    return map;
  }
  function fillNav(nav, st, view, showFn){
    if(!nav||!st) return;
    nav.innerHTML='';
    var screen=nav.closest('.screen');
    STAGES.forEach(function(s){
      var b=document.createElement('button');
      b.type='button';
      b.textContent=s.label;
      if(st.allDone || st.done[s.id]) b.className='done';
      if(s.id===st.now && !st.allDone) b.classList.add(st.hold===s.id?'hold':'now');
      if(s.id===view) b.classList.add('on');
      b.addEventListener('click',function(){
        var map=parseStageMap(screen);
        if(map && map[s.id]){
          screen.dispatchEvent(new CustomEvent('fast-stage-map',{bubbles:true,detail:{tab:map[s.id],stage:s.id}}));
          showStagePanel(screen, s.id);
          fillNav(nav, st, s.id, showFn);
          return;
        }
        var panel=screen && screen.querySelector('[data-stage-panel="'+s.id+'"]');
        if(panel){
          showStagePanel(screen, s.id);
          fillNav(nav, st, s.id, showFn);
          return;
        }
        var go=st.go[s.id];
        if(go && typeof showFn==='function') showFn(go);
      });
      nav.appendChild(b);
    });
  }
  var showFn=null;
  function screenTx(id, payJob){
    if(id==='cashless'||id==='digiroom'||id==='booking'){
      if(payJob==='agya') return 'agya';
      if(payJob==='booking'||payJob==='dewi') return 'dewi';
      return 'budi';
    }
    return SCREEN_TX[id]||null;
  }
  function payView(sid, payJob, tx){
    if(sid==='booking'||payJob==='booking'||payJob==='agya') return 'quot';
    if(payJob==='dewi'||tx==='dewi') return 'bill';
    return 'bill';
  }
  function ensureNav(screen, tx){
    var head=screen.querySelector(':scope > .screenhead');
    var nav=screen.querySelector(':scope > .proc');
    if(!nav && head){
      nav=document.createElement('nav');
      nav.className='proc';
      nav.setAttribute('aria-label','Jejak SPK sampai STNK');
    }
    if(!nav) nav=screen.querySelector('.proc');
    if(!nav) return null;
    nav.setAttribute('data-tx-track', tx);
    var note=screen.querySelector(':scope > .tx-now');
    if(!note){
      note=document.createElement('p');
      note.className='tx-now';
    }
    note.setAttribute('data-tx-now', tx);
    var tabs=screen.querySelector(':scope > .worktabs');
    if(head){
      if(nav.previousElementSibling!==head) head.after(nav);
      if(note.previousElementSibling!==nav) nav.after(note);
      if(tabs && note.nextElementSibling!==tabs) note.after(tabs);
    }
    var path=screen.querySelector('ol.path');
    if(path) path.hidden=true;
    var view=screen.getAttribute('data-stage-view')||VIEW[screen.id];
    if(view) showStagePanel(screen, view);
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
      var view=screen.getAttribute('data-stage-view')||VIEW[sid]||st.now;
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
      var view=payView(sid, payJob, tx);
      fillNav(pack.nav, st, view, showFn);
      if(pack.note) pack.note.textContent=st.copy;
    });
    if(current){
      var on=document.getElementById(current);
      var tx=screenTx(current, payJob)||(on&&on.querySelector('[data-tx-track]')&&on.querySelector('[data-tx-track]').getAttribute('data-tx-track'));
      if(on && tx){
        var st=state(tx);
        var view=VIEW[current]||payView(current, payJob, tx)||st.now;
        var nav=on.querySelector('.proc');
        if(nav) fillNav(nav, st, view, showFn);
      }
    }
  }
  FAST.TX_STAGES=STAGES;
  FAST.txState=state;
  FAST.screenTx=screenTx;
  FAST.txFamily=function(tx){ return tx==='agya'?'dewi':tx; };
  FAST.txHub=function(tx){
    tx=FAST.txFamily(tx);
    return ({
      dewi:'spk', budi:'transaksi', hiace:'tx_hiace', raize:'tx_raize',
      agus:'tx_avanza', fajar:'gi', maria:'tx_fortuner', calya:'order_calya'
    })[tx]||null;
  };
  FAST.showStagePanel=showStagePanel;
  FAST.lineageInit=function(fn){ showFn=fn; };
  FAST.renderLineage=render;
})();
