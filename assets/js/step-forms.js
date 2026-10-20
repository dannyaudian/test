(function(){
  var FAST=window.FAST=window.FAST||{};
  var STAGES=['spk','quot','so','afi','do','bill','del','stnk'];
  var VENDOR='PT Nusantara Ekspedisi Mandiri';
  var PUMP='SPBU Mitra FAST Cilandak';

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
  function frow(own,lab,val,src){
    var mark=own==='s'?'S':own==='a'?'A':'F';
    return '<div class="frow locked"><i class="own '+own+'">'+mark+'</i><span class="lab">'+esc(lab)+'</span><span class="val">'+esc(val)+'</span><span class="src">'+esc(src)+'</span></div>';
  }
  function money(rows){
    return '<div class="money">'+rows.map(function(r){
      return '<div class="row'+(r.total?' total':'')+'"><span>'+esc(r.k)+'</span><span>'+esc(r.v)+'</span></div>';
    }).join('')+'</div>';
  }
  function gates(items){
    return '<ul class="gates">'+items.map(function(g){
      var st=g.st||'idle';
      var mark=st==='ok'?'ok':(st==='hold'?'no':'idle');
      var icon=st==='ok'?'✓':(st==='hold'?'!':'•');
      var tag=st==='ok'?'ok':(st==='hold'?'stop':'mute');
      return '<li><span class="mark '+mark+'">'+icon+'</span><div>'+esc(g.t)+'<span class="why">'+esc(g.w)+'</span></div><span class="tag '+tag+'">'+esc(g.tag)+'</span></li>';
    }).join('')+'</ul>';
  }
  function d3(o){
    var st=o.d3||'held';
    function cls(step){
      if(st==='delivered'||st==='issued') return 'done';
      if(st==='obb' && step==='okk') return 'done';
      if(st==='obb' && step==='obb') return 'now';
      if(st==='okk' && step==='okk') return 'now';
      return '';
    }
    return '<ol class="d3path" aria-label="This order logistics">'+
      '<li class="'+cls('okk')+'">1 · OKK</li>'+
      '<li class="'+cls('obb')+'">2 · OBB</li>'+
      '<li class="'+(st==='delivered'?'done':'')+'">3 · Delivery</li>'+
      '</ol>';
  }
  function field(lab,val){
    return '<div class="field"><label>'+esc(lab)+'</label><input value="'+esc(val)+'" readonly></div>';
  }

  function orders(){
    var hiSel=(FAST.b2bLoad&&FAST.b2bLoad().selected)||'1288';
    var hiUnit={ '1288':{so:'4500091288',okk:'OKK/26/CLD/00421-1',obb:'OBB/26/CLD/00421-1',vin:'MHF****1288',nopol:'B 1288 UA',unit:'Hiace Premio · unit 1',dp:'Rp 69.680.000'}
      ,'1289':{so:'4500091289',okk:'OKK/26/CLD/00421-2',obb:'OBB/26/CLD/00421-2',vin:'MHF****1289',nopol:'B 1289 UA',unit:'Hiace Premio · unit 2',dp:'Rp 69.680.000'}
      ,'1290':{so:'4500091290',okk:'OKK/26/CLD/00421-3',obb:'OBB/26/CLD/00421-3',vin:'MHF****1290',nopol:'B 1290 UA',unit:'Hiace Premio · unit 3',dp:'Rp 69.680.000'}
    }[hiSel]||{};
    var ho={
      andi:{spk:'SPK/26/BSD/00188',so:'4500091888',buyer:'Andi Wijaya',unit:'Fortuner 2.8',method:'Leasing → cash filing',nik:'3174••••••••0188',hp:'0812••••0188',stnk:'Andi Wijaya',vin:'MHF****0188',addr:'andi',otr:'Rp 515.625.000',fee:'DP Rp 103.125.000',ar:'Filing in progress',qt:'QT/26/BSD/00188',do:'DO/26/BSD/01188',bill:'Held on method change',plate:'B 1888 F',city:'Tangerang Selatan',d3:'held',okk:'OKK/26/BSD/00188',obb:'OBB/26/BSD/00188',fuel:'10 L Pertamax',gate:'Paid in full after HO posts cash · not waived',nopol:'andi',rel:''},
      sinta:{spk:'SPK/26/BKS/00162',so:'4500091620',buyer:'Sinta Lestari',unit:'Avanza 1.5',method:'Cash → leasing filing',nik:'3275••••••••0162',hp:'0813••••0162',stnk:'Sinta Lestari',vin:'MHK****0162',addr:'sinta',otr:'Rp 211.000.000',fee:'Booking Rp 2.000.000',ar:'Filing in progress',qt:'QT/26/BKS/00162',do:'DO/26/BKS/01162',bill:'Held on method change',plate:'B 1620 T',city:'Bekasi',d3:'held',okk:'OKK/26/BKS/00162',obb:'OBB/26/BKS/00162',fuel:'10 L Pertamax',gate:'Full DP + signed contract after HO posts leasing · not waived',nopol:'sinta',rel:''},
      yoga:{spk:'SPK/26/TNG/00216',so:'4500092166',buyer:'Yoga Mahendra',unit:'Innova Zenix',method:'Leasing · partner change',nik:'3671••••••••0216',hp:'0812••••0216',stnk:'Yoga Mahendra',vin:'MHK****0216',addr:'yoga',otr:'Rp 412.000.000',fee:'DP Rp 82.400.000',ar:'Filing in progress',qt:'QT/26/TNG/00216',do:'DO/26/TNG/01216',bill:'New e-PO still required',plate:'B 2166 U',city:'Tangerang',d3:'held',okk:'OKK/26/TNG/00216',obb:'OBB/26/TNG/00216',fuel:'10 L Pertamax',gate:'Incoming lessor e-PO + DP/TTD not waived',nopol:'yoga',rel:''}
    };

    return {
      dewi:{spk:'SPK/26/CLD/00426',so:'4500091426',buyer:'Dewi Lestari',nik:'3276••••••••0012',hp:'0812••••8831',stnk:'Andi Pratama',method:'Cash',unit:'Yaris 1.5 G CVT · Metallic White',vin:'MHK****1426',addr:'dewi_pemesan',addrStnk:'dewi_stnk',otr:'Rp 302.150.000',fee:'Rp 3.000.000',ar:'Rp 299.150.000',qt:'QT/26/CLD/00426',do:'DO/26/CLD/01426',bill:'Not yet issued',plate:'B 1426 DPK',city:'Depok City',d3:'held',okk:'OKK/26/CLD/00426-1',obb:'OBB/26/CLD/00426-1',fuel:'10 L Pertamax',gate:'Cash paid in full · this Yaris SO · non-waivable',nopol:'dewi.yaris',rel:'dewi'},
      agya:{spk:'SPK/26/CLD/00426',so:'4500091428',buyer:'Dewi Lestari',nik:'3276••••••••0012',hp:'0812••••8831',stnk:'Andi Pratama',method:'Cash',unit:'Agya 1.2 G CVT · Black',vin:'Pending SO',addr:'dewi_pemesan',addrStnk:'dewi_stnk',otr:'Rp 175.900.000',fee:'Rp 2.000.000',ar:'Held until booking fee',qt:'QT/26/CLD/00426',do:'After this line\'s AFI',bill:'After this line\'s DO',plate:'—',city:'Depok City',d3:'held',okk:'OKK/26/CLD/00426-2',obb:'OBB/26/CLD/00426-2',fuel:'10 L Pertamax',gate:'This Agya booking fee then paid in full · not the Yaris line',nopol:'dewi.agya',rel:'dewi'},
      budi:{spk:'SPK/26/CLD/00418',so:'4500091238',buyer:'Budi Santoso',nik:'3174••••••••0007',hp:'0812••••0418',stnk:'Budi Santoso',method:'Cash',unit:'Innova Zenix 2.0 G HV · Pearl White',vin:'MHKA6GJ••••41827',addr:'budi',otr:'Rp 486.750.000',fee:'Rp 5.000.000',ar:'Rp 181.750.000',qt:'QT/26/CLD/00418',do:'After AFI on this SO',bill:'Paired with AFI',plate:'B 1418 KL',city:'South Jakarta',d3:'held',okk:'OKK/26/CLD/00418',obb:'OBB/26/CLD/00418',fuel:'10 L Pertamax',gate:'Cash paid in full · AR Open on this SO · non-waivable',nopol:'budi',rel:'budi'},
      raize:{spk:'SPK/26/CLD/00423',so:'Held · NPWP',buyer:'Sarah Wijaya',nik:'3174••••••••0423',hp:'0812••••0423',stnk:'Sarah Wijaya',method:'Cash',unit:'Raize 1.0 T GR Sport',vin:'After allocation',addr:'sarah',otr:'After NPWP · area PO',fee:'From Raize master',ar:'SO not yet',qt:'Held at data gate',do:'After AFI',bill:'After SO · cash ≥30%',plate:'—',city:'South Jakarta',d3:'held',okk:'OKK/26/CLD/00423',obb:'OBB/26/CLD/00423',fuel:'10 L Pertamax',gate:'NPWP then booking fee then paid in full · this Raize',nopol:'raize',rel:'raize'},
      hiace:{spk:'SPK/26/CLD/00421',so:hiUnit.so,buyer:'PT Danapura Utama',nik:'NPWP badan',hp:'021••••0421',stnk:'PT Danapura Utama',method:'Leasing / B2B',unit:hiUnit.unit,vin:hiUnit.vin,addr:'hiace',otr:'Rp 348.400.000',fee:hiUnit.dp+' required DP',ar:'Full DP + e-PO',qt:'QT/26/CLD/00421',do:'After this unit\'s TTD',bill:'After DP + e-PO',plate:hiUnit.nopol,city:'South Jakarta',d3:'held',okk:hiUnit.okk,obb:hiUnit.obb,fuel:'15 L Solar',gate:'Signed contract on this SO · DP/e-PO not waived',nopol:'hiace.active',rel:'hiace'},
      agus:{spk:'SPK/26/CLD/00425',so:'4500091301',buyer:'Agus Hermawan',nik:'3174••••••••0425',hp:'0812••••0425',stnk:'Agus Hermawan',method:'Cash',unit:'Avanza 1.5 G CVT',vin:'MHKA4FA••••20425',addr:'agus',otr:'Rp 245.400.000',fee:'Rp 2.000.000',ar:'Rp 0',qt:'QT/26/CLD/00425',do:'DO/26/CLD/01425',bill:'Paid in full',plate:'B 1301 F',city:'South Jakarta',d3:'okk',okk:'OKK/26/CLD/00425',obb:'OBB/26/CLD/00425',fuel:'10 L Pertamax',gate:'Paid in full · pass · OKK/OBB operational',nopol:'agus',rel:'agus'},
      fajar:{spk:'SPK/26/CLD/00424',so:'4500091424',buyer:'Fajar Nugroho',nik:'3174••••••••0424',hp:'0812••••0424',stnk:'Fajar Nugroho',method:'Cash',unit:'Rush S GR Sport',vin:'••20424',addr:'fajar',otr:'This SPK quotation',fee:'Paid',ar:'Rp 0',qt:'QT/26/CLD/00424',do:'Issued 2 Sep',bill:'Paid in full',plate:'B 1424 F',city:'South Jakarta',d3:'delivered',okk:'OKK/26/CLD/00424',obb:'OBB/26/CLD/00424',fuel:'10 L Pertamax',gate:'Delivered · GI proof on this SPK',nopol:'fajar',rel:'fajar'},
      maria:{spk:'SPK/26/CLD/00409',so:'4500091409',buyer:'Maria Sitompul',nik:'3174••••••••0409',hp:'0812••••0409',stnk:'Maria Sitompul',method:'Cash',unit:'Fortuner 2.8 VRZ',vin:'MHF****1409',addr:'maria',otr:'This SPK quotation',fee:'Paid',ar:'Rp 0',qt:'QT/26/CLD/00409',do:'Delivered',bill:'Paid in full',plate:'B 1409 B',city:'South Jakarta',d3:'delivered',okk:'OKK/26/CLD/00409',obb:'OBB/26/CLD/00409',fuel:'10 L Pertamax',gate:'Delivered · STNK day 19 on this SPK',nopol:'maria',rel:'maria'},
      calya:{spk:'SPK/24/CLD/01990',so:'4500081990',buyer:'Budi Santoso',nik:'3174••••••••0007',hp:'0812••••0418',stnk:'Budi Santoso',method:'Cash',unit:'Calya G AT · white',vin:'••01990',addr:'calya',otr:'Paid 2024',fee:'Paid',ar:'Rp 0',qt:'QT/24/CLD/01990',do:'Delivered 2024',bill:'Paid in full',plate:'B 1990 T',city:'South Jakarta',d3:'delivered',okk:'OKK for FAST-01990',obb:'OBB for this Calya VIN',fuel:'10 L Pertamax',gate:'Received 2 Dec 2024 · this Calya',nopol:'calya',rel:'calya'},
      andi:ho.andi, sinta:ho.sinta, yoga:ho.yoga
    };
  }

  function htmlSpk(o){
    return '<div class="box"><h3>SPK · '+esc(o.spk)+'</h3><div class="fields">'+
      frow('s','SPK Number',o.spk,'Source documents')+
      frow('f','Buyer',o.buyer,'SPK')+
      frow('f','NIK',o.nik,'KTP buyer')+
      frow('f','HP / WhatsApp',o.hp,'SPK')+
      frow('f','STNK Name',o.stnk,'Entered in the SPK')+
      frow('f','Method',o.method,'SPK')+
      frow('s','Unit',o.unit,'SPK')+
      frow('s','VIN',o.vin,'Allocation')+
      '</div>'+(o.addr?'<div class="fields addr-fields" data-addr="'+o.addr+'"></div>':'')+
      (o.rel?'<div class="box" data-name-rel="'+o.rel+'"></div>':'')+
      '<p class="hint" style="padding:0 16px 14px">Same SPK form on every order. Source data is not re-typed in SO, AFI, OKK, or OBB.</p></div>';
  }
  function htmlQuot(o){
    return '<div class="box"><h3>Quotation · '+esc(o.qt)+'</h3>'+
      money([
        {k:'OTR area PO',v:o.otr},
        {k:'Program / discount',v:'Rp 0'},
        {k:'Final value',v:o.otr},
        {k:'Method',v:o.method+' · '+o.fee},
        {k:'Follows SO',v:o.so,total:true}
      ])+
      '<p class="hint" style="padding:0 16px 14px">Same quotation form. This price is carried to this SO — not typed in billing.</p></div>';
  }
  function htmlSo(o){
    return '<div class="box"><h3>Sales Order · '+esc(o.so)+'</h3><div class="fields">'+
      frow('s','SPK Number',o.spk,'Source documents')+
      frow('s','Quotation',o.qt,'1 SPK = 1 QT')+
      frow('s','Sales Order Number',o.so,'This unit')+
      frow('s','Billing Number',o.bill,'After DO')+
      frow('s','VIN',o.vin,'Allocation')+
      frow('s','License plate',o.plate,'Reserved at AFI')+
      '</div>'+(o.nopol?'<div class="fields" data-nopol="'+o.nopol+'"></div>':'')+
      '<h3>SO price structure</h3>'+
      money([
        {k:'Transaction value',v:o.otr},
        {k:'Method',v:o.method},
        {k:'Booking fee / required DP',v:o.fee},
        {k:'AR Open / hold',v:o.ar,total:true},
        {k:'Delivery requirement',v:o.gate}
      ])+
      gates([
        {st:'ok',t:'SPK data complete',w:'Buyer, STNK, unit, documents on this SPK',tag:'This SPK'},
        {st:o.so.indexOf('Held')>=0?'hold':'ok',t:'Sales Order',w:o.so,tag:o.so.indexOf('Held')>=0?'Held':'This SO'},
        {st:'idle',t:'OKK then OBB',w:o.okk+' · '+o.obb+' after this unit\'s delivery gate',tag:'This SO'}
      ])+
      '<p class="hint" style="padding:0 16px 14px">Same SO form on every order. Another unit is a different SO.</p></div>';
  }
  function htmlAfi(o){
    return '<div class="box"><h3>AFI · data from the SPK</h3><div class="fields">'+
      frow('f','STNK Name',o.stnk,'= SPK · not typed here')+
      frow('s','STNK city',o.city,'SPK address')+
      frow('s','VIN',o.vin,'Allocation')+
      frow('s','Billing',o.bill,'Submitted together with AFI')+
      frow('s','License plate',o.plate,'Reserved here')+
      '</div>'+(o.addrStnk?'<div class="fields addr-fields" data-addr="'+o.addrStnk+'" data-addr-src="STNK SPK"></div>':(o.addr?'<div class="fields addr-fields" data-addr="'+o.addr+'"></div>':''))+
      '<p class="hint" style="padding:0 16px 14px">Same AFI form. Name and address come from this SPK.</p></div>';
  }
  function htmlDo(o){
    return '<div class="box"><h3>Delivery Order</h3><div class="fields">'+
      frow('s','DO Number',o.do,'Generated when issued')+
      frow('s','Unit',o.unit,'SO / quotation')+
      frow('f','Recipient',o.buyer,'SPK')+
      frow('s','VIN',o.vin,'Matches SO')+
      frow('s','Pickup', 'FAST Outlet warehouse','OKK reference')+
      '</div><p class="hint" style="padding:0 16px 14px">Same DO form. Warehouse order from this SO, not another unit.</p></div>';
  }
  function htmlBill(o){
    var cash=/cash/i.test(o.method);
    return '<div class="box"><h3>Billing · '+esc(o.so)+'</h3>'+
      money([
        {k:'Funds / AR',v:o.ar},
        {k:'Billing requirement',v:cash?'Cash ≥30% · non-waivable':'Full DP + e-PO · non-waivable'},
        {k:'Delivery requirement',v:o.gate,total:true}
      ])+
      gates([
        {st:o.do.indexOf('After')>=0||o.do.indexOf('Held')>=0?'hold':'ok',t:'Delivery Order',w:o.do,tag:'This SO'},
        {st:o.ar==='Rp 0'?'ok':'hold',t:cash?'Cash paid in full':'Leasing settlement',w:o.gate,tag:o.ar==='Rp 0'?'Pass':'Held'}
      ])+
      '<p class="hint" style="padding:0 16px 14px">Same billing form. Commercial gates are not waived by OKK/OBB or exceptions.</p></div>';
  }
  function htmlDel(o){
    return '<div class="box"><h3>Delivery · '+esc(o.spk)+'</h3>'+d3(o)+
      '<h3>From this SPK — not re-typed</h3><div class="fields">'+
      frow('f','Recipient',o.buyer,'SPK')+
      frow('s','VIN',o.vin,'This SO')+
      frow('s','SO',o.so,'This unit')+
      frow('s','DO',o.do,'Pickup reference')+
      '</div></div>'+
      '<div class="box"><h3>OKK · Order Kirim Kendaraan</h3><div class="form"><div class="fgrid">'+
      field('OKK number',o.okk)+
      field('Vendor',VENDOR)+
      field('Service','Home delivery · this destination')+
      field('Recipient',o.buyer)+
      field('VIN',o.vin)+
      field('Pickup slot','After this unit\'s delivery gate')+
      '</div></div><p class="hint" style="padding:0 16px 14px">Same OKK form as every order. Number belongs to this SO.</p></div>'+
      '<div class="box"><h3>OBB · Order Bahan Bakar</h3><div class="form"><div class="fgrid">'+
      field('OBB number',o.obb)+
      field('Fuel partner',PUMP)+
      field('Product / volume',o.fuel)+
      field('VIN',o.vin)+
      field('When','Same morning as OKK pickup')+
      '</div></div><p class="hint" style="padding:0 16px 14px">Same OBB form. Fuel fill is for this VIN, not another unit.</p></div>'+
      '<div class="box"><h3>Delivery gate</h3>'+
      gates([
        {st:o.d3==='delivered'||o.d3==='issued'||o.ar==='Rp 0'?'ok':'hold',t:o.gate,w:'Commercial gate on this SO — not a waiver',tag:o.ar==='Rp 0'?'Pass':'Held'},
        {st:o.d3==='delivered'||o.d3==='issued'?'ok':'idle',t:o.okk,w:'Expedition vendor · this SO',tag:'This SPK'},
        {st:o.d3==='delivered'||o.d3==='issued'?'ok':'idle',t:o.obb,w:o.fuel+' · '+PUMP,tag:'This VIN'}
      ])+'</div>';
  }
  function htmlStnk(o){
    var done=o.d3==='delivered';
    function mil(n,title,t,on){
      return '<li class="'+(on?'done':'')+'"><span class="m">'+(on?'✓':n)+'</span><div>'+esc(title)+'<div class="t">'+esc(t)+'</div></div></li>';
    }
    return '<div class="box"><h3>STNK / BPKB · '+esc(o.stnk)+'</h3><ul class="milestones">'+
      mil(1,'STNK data in the SPK',o.stnk+' · '+o.city,true)+
      mil(2,'AFI',o.bill, o.d3==='delivered'||o.d3==='issued'||o.ar==='Rp 0')+
      mil(3,'Samsat process','After AFI received', done)+
      mil(4,'STNK issued',o.plate, done&&o.id!=='maria')+
      mil(5,'BPKB','Document handover on this SPK', done&&o.id!=='maria')+
      '</ul><p class="hint" style="padding:12px 16px 14px">Same tracking form. Aging is not a paid-in-full waiver.</p></div>';
  }

  var BUILD={spk:htmlSpk,quot:htmlQuot,so:htmlSo,afi:htmlAfi,do:htmlDo,bill:htmlBill,del:htmlDel,stnk:htmlStnk};

  function shouldFill(el){
    if(!el) return false;
    if(el.hasAttribute('data-step-keep')) return false;
    if(el.hasAttribute('data-step-form')) return true;
    if(el.querySelector('[data-step-work], .split, .drop, [data-okk-submit], [data-obb-submit], [data-del-submit], [data-gi-submit], [data-b2b-path], [data-dewi-afi], [data-dewi-do], [data-spk-save], [data-qt-revise]')) return false;
    if(el.querySelector('.fields, .form, .money, .vault-grid, .fgrid, .milestones, .soline')) return false;
    return true;
  }

  function fillEl(el, stage, o){
    var extras=[];
    el.querySelectorAll('[data-step-work]').forEach(function(n){ extras.push(n.outerHTML); });
    var html=(BUILD[stage]||function(){return '';})(o);
    el.innerHTML=html+extras.join('');
    el.setAttribute('data-step-form', stage);
    el.classList.add('step-form');
  }

  function txOfScreen(screen){
    var forced=screen.getAttribute('data-form-tx');
    if(forced) return forced;
    if(screen.id==='ho_file'){
      var p=FAST.hoFilePick||'st-bsd';
      return p==='st-bks'?'sinta':(p==='lp-tng'?'yoga':'andi');
    }
    return (FAST.screenTx&&FAST.screenTx(screen.id))||null;
  }

  function render(){
    var map=orders();
    document.querySelectorAll('.screen[data-form-tx], .screen[data-form-fill], #ho_file').forEach(function(screen){
      if(screen.id==='spk_baru') return;
      if(screen.closest('.cust-shop')||screen.id==='customer'||screen.id==='customer_detail'||screen.id==='order_calya'||screen.id==='order_aksesoris') return;
      var tx=txOfScreen(screen);
      var o=map[tx];
      if(!o) return;
      o.id=tx;
      var fillMissing=screen.hasAttribute('data-form-fill') || screen.id==='ho_file';
      if(fillMissing){
        var anchor=screen.querySelector(':scope > .tx-now')||screen.querySelector(':scope > .proc')||screen.querySelector(':scope > .screenhead');
        STAGES.forEach(function(st){
          if(screen.querySelector('[data-stage-panel="'+st+'"]')) return;
          var wrap=document.createElement('div');
          wrap.setAttribute('data-stage-panel', st);
          wrap.setAttribute('data-step-form', st);
          wrap.hidden=true;
          if(anchor&&anchor.parentNode===screen) anchor.after(wrap);
          else screen.appendChild(wrap);
        });
      }
      screen.querySelectorAll('[data-stage-panel]').forEach(function(el){
        var st=el.getAttribute('data-stage-panel');
        if(STAGES.indexOf(st)<0) return;
        if(!shouldFill(el)) return;
        fillEl(el, st, o);
      });
      screen.querySelectorAll('[data-step-form]').forEach(function(el){
        if(el.hasAttribute('data-stage-panel')) return;
        var st=el.getAttribute('data-step-form');
        if(BUILD[st]) fillEl(el, st, o);
      });
    });
    if(FAST.renderMaster) FAST.renderMaster();
  }

  FAST.renderStepForms=render;
})();
