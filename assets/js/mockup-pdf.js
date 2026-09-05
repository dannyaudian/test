/* E-kuitansi / PDF mock */


  var receipts={
    'KWT/26/CLD/008731':{no:'KWT/26/CLD/008731',status:'Aktif',type:'Booking fee',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'28 Agu 2026, 16:30 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0001',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 5.000.000',verify:'VFY-CLD-008731-B3M4'},
    'KWT/26/CLD/009115':{no:'KWT/26/CLD/009115',status:'Aktif',type:'Pelunasan tahap 1',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'1 Sep 2026, 14:08 WIB',method:'BCA Virtual Account',ref:'VA 8801 0418 0002',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 300.000.000',verify:'VFY-CLD-009115-A7K2'},
    'KWT/26/CLD/009280':{no:'KWT/26/CLD/009280',status:'Aktif',type:'Pelunasan',customer:'Agus Hermawan',unit:'Avanza',date:'2 Sep 2026, 16:40 WIB',method:'BCA Virtual Account',ref:'VA 8801 0425 0002',spk:'SPK/26/CLD/00425',so:'4500091301',billing:'Terbit',amount:'Rp 225.400.000',verify:'VFY-CLD-009280-G4N8'},
    'KWT/26/CLD/009220':{no:'KWT/26/CLD/009220',status:'Aktif',type:'Pelunasan tahap 2',customer:'Budi Santoso',unit:'Innova Zenix · VIN ••41827',date:'3 Sep 2026, 09:41 WIB',method:'Cashless',ref:'PAY-CLD-00418-3',spk:'SPK/26/CLD/00418',so:'4500091238',billing:'Belum terbit',amount:'Rp 100.000.000',verify:'VFY-CLD-009220-R8P1'},
    'KWT/26/CLD/009301':{no:'KWT/26/CLD/009301',status:'Aktif',type:'Booking fee',customer:'Dewi Lestari',unit:'Yaris 1.5 G',date:'3 Sep 2026, 10:12 WIB',method:'Cashless',ref:'PAY-CLD-00426-1',spk:'SPK/26/CLD/00426',so:'Belum terbit',billing:'Belum terbit',amount:'Rp 3.000.000',verify:'VFY-CLD-009301-Y4R1'},
    'KWT/26/CLD/009410':{no:'KWT/26/CLD/009410',status:'Aktif',type:'Penagihan leasing',customer:'PT Danapura Multifinance',unit:'Hiace Premio · SO 4500091288',date:'4 Sep 2026, 11:20 WIB',method:'Paperless B2B',ref:'B2B-DP-1288',spk:'SPK/26/CLD/00421',so:'4500091288',billing:'Paperless',amount:'Rp 69.680.000',verify:'VFY-CLD-009410-L1H8'},
    'KWT/26/CLD/009411':{no:'KWT/26/CLD/009411',status:'Aktif',type:'Penagihan leasing',customer:'PT Danapura Multifinance',unit:'Hiace Premio · SO 4500091289',date:'4 Sep 2026, 11:21 WIB',method:'Paperless B2B',ref:'B2B-DP-1289',spk:'SPK/26/CLD/00421',so:'4500091289',billing:'Paperless',amount:'Rp 69.660.000',verify:'VFY-CLD-009411-L2H9'},
    'KWT/26/CLD/009412':{no:'KWT/26/CLD/009412',status:'Aktif',type:'Penagihan leasing',customer:'PT Danapura Multifinance',unit:'Hiace Premio · SO 4500091290',date:'4 Sep 2026, 11:22 WIB',method:'Paperless B2B',ref:'B2B-DP-1290',spk:'SPK/26/CLD/00421',so:'4500091290',billing:'Paperless',amount:'Rp 69.660.000',verify:'VFY-CLD-009412-L3H0'}
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
  function buktiPdf(){
    var lines=['FAST — PAKET BUKTI SERAH TERIMA','SPK/24/CLD/01990','SO 4500081990','Penerima: Budi Santoso','Unit: Calya G AT · VIN ••01990','Waktu: 2 Des 2024, 14:18 WIB','Geotag: -6.2731, 106.8072 · FAST Outlet Cilandak','Foto serah terima: ada','Foto VIN: cocok SO','Scan BSTKB: ada','Disetujui Administrasi. Vault FAST — bukan rekaman CCTV dealer.','Klaim serah terima tanpa paket ini tidak cukup.'];
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
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));
    a.download='FAST-bukti-serah-Calya-01990.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },0);
  }
  function leasingContractPdf(so){
    var lines=['FAST — KONTRAK LEASING (salinan B2B)','Mitra: PT Danapura Multifinance','Debitur: PT Danapura Utama','SPK/26/CLD/00421','Sales Order '+so,'Unit: Hiace Premio','Status: disubmit leasing — unduhan Frontman','Bukan waiver delivery. TTD customer diunggah kembali di FAST.','Dokumen ini contoh PDF workspace, bukan merek lessor pihak ketiga.'];
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
    var a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));
    a.download='FAST-kontrak-leasing-'+so+'.pdf';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },0);
  }
  function isDownloadAction(el){ return /^(Download|PDF)\b/i.test((el.textContent||'').replace(/\s+/g,' ').trim()); }
  function receiptNoFrom(el){
    var box=el.closest('tr, .doc, .pad, .wa, .box, .shop-receipt')||el.parentElement;
    var m=(box?box.textContent:'').match(/KWT\/26\/CLD\/\d+/);
    return m?m[0]:'KWT/26/CLD/009115';
  }
