/* Interactive mockup: role switcher, page tabs, hash routing */

const ROLES = {
  frontman: {
    label: 'Frontman',
    icon: '🧑‍💼',
    pages: ['Dashboard', 'Unit Tersedia', 'Janji Temu', 'Test Drive', 'Notifikasi'],
  },
  admin: {
    label: 'Administrasi',
    icon: '🗂️',
    pages: ['Dashboard', 'Dokumen', 'STNK & BPKB', 'Laporan', 'Pengaturan'],
  },
  management: {
    label: 'Management',
    icon: '📊',
    pages: ['Executive Summary', 'KPI Monitor', 'Workforce', 'Target', 'Analitik'],
  },
  customer: {
    label: 'Customer',
    icon: '👤',
    pages: ['Beranda', 'Unit Saya', 'Status Pesanan', 'Cicilan', 'Dukungan'],
  },
};

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function frontmanContent(page) {
  switch (page) {
    case 'Dashboard': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Unit Tersedia</div><div class="widget__value">47</div><div class="widget__sub up">↑ 5 dari kemarin</div></div>
        <div class="widget"><div class="widget__label">Janji Temu Hari Ini</div><div class="widget__value">8</div><div class="widget__sub">3 pending konfirmasi</div></div>
        <div class="widget"><div class="widget__label">Test Drive Selesai</div><div class="widget__value">12</div><div class="widget__sub up">↑ 2 dari minggu lalu</div></div>
        <div class="widget"><div class="widget__label">SPK Bulan Ini</div><div class="widget__value">34</div><div class="widget__sub up">↑ 18%</div></div>
      </div>
      <div class="section-card">
        <h3>Aktivitas Terkini</h3>
        <ul class="notif-list">
          <li class="notif-item"><span class="notif-dot notif-dot--green"></span><div><div class="notif-text">Kustomer Budi Santoso konfirmasi test drive jam 14:00</div><div class="notif-time">5 menit lalu</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--amber"></span><div><div class="notif-text">Unit Avanza plat B-1234-XY perlu pengecekan sebelum DO</div><div class="notif-time">22 menit lalu</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--blue"></span><div><div class="notif-text">SPK #4521 diterima dari Administrasi</div><div class="notif-time">1 jam lalu</div></div></li>
        </ul>
      </div>`;

    case 'Unit Tersedia': return `
      <div class="section-card">
        <h3>Daftar Unit</h3>
        <table class="data-table">
          <thead><tr><th>Tipe</th><th>Warna</th><th>Stok</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Avanza G</td><td>Putih</td><td>8</td><td><span class="status status--green">Tersedia</span></td></tr>
            <tr><td>Innova Reborn</td><td>Hitam</td><td>3</td><td><span class="status status--green">Tersedia</span></td></tr>
            <tr><td>Fortuner GR</td><td>Silver</td><td>1</td><td><span class="status status--amber">Indent</span></td></tr>
            <tr><td>Yaris Cross</td><td>Merah</td><td>5</td><td><span class="status status--green">Tersedia</span></td></tr>
            <tr><td>Agya G</td><td>Biru</td><td>0</td><td><span class="status status--rose">Habis</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'Janji Temu': return `
      <div class="section-card">
        <h3>Jadwal Hari Ini</h3>
        <table class="data-table">
          <thead><tr><th>Jam</th><th>Kustomer</th><th>Keperluan</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>09:00</td><td>Andi Wijaya</td><td>Test Drive Innova</td><td><span class="status status--green">Selesai</span></td></tr>
            <tr><td>11:00</td><td>Siti Rahma</td><td>Konsultasi Kredit</td><td><span class="status status--blue">Berlangsung</span></td></tr>
            <tr><td>14:00</td><td>Budi Santoso</td><td>Test Drive Avanza</td><td><span class="status status--amber">Pending</span></td></tr>
            <tr><td>16:00</td><td>Dina Lestari</td><td>Negosiasi Harga</td><td><span class="status status--amber">Pending</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'Test Drive': return `
      <form class="section-card form-section" data-toast="Jadwal test drive tersimpan (mockup).">
        <h3>Buat Jadwal Test Drive</h3>
        <div class="form-group"><label for="td-name">Nama Kustomer</label><input id="td-name" name="nama" type="text" placeholder="Masukkan nama" required></div>
        <div class="form-group"><label for="td-phone">No. Telepon</label><input id="td-phone" name="telepon" type="tel" placeholder="08xx-xxxx-xxxx" required></div>
        <div class="form-group"><label for="td-unit">Unit yang Diminati</label><select id="td-unit" name="unit"><option>Avanza G</option><option>Innova Reborn</option><option>Fortuner GR</option></select></div>
        <div class="form-group"><label for="td-when">Tanggal &amp; Waktu</label><input id="td-when" name="waktu" type="datetime-local" required></div>
        <button class="btn btn--primary" type="submit">Jadwalkan Test Drive</button>
      </form>`;

    default: return `
      <div class="section-card">
        <h3>Notifikasi</h3>
        <ul class="notif-list">
          <li class="notif-item"><span class="notif-dot notif-dot--amber"></span><div><div class="notif-text">3 janji temu masih menunggu konfirmasi kustomer</div><div class="notif-time">Baru saja</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--green"></span><div><div class="notif-text">Stok Yaris Cross bertambah 2 unit dari gudang pusat</div><div class="notif-time">12 menit lalu</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--blue"></span><div><div class="notif-text">Reminder follow-up: Dina Lestari, negosiasi jam 16:00</div><div class="notif-time">1 jam lalu</div></div></li>
        </ul>
      </div>`;
  }
}

function adminContent(page) {
  switch (page) {
    case 'Dashboard': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Dokumen Pending</div><div class="widget__value">15</div><div class="widget__sub down">↓ 3 masuk hari ini</div></div>
        <div class="widget"><div class="widget__label">STNK Selesai</div><div class="widget__value">28</div><div class="widget__sub up">↑ 4 hari ini</div></div>
        <div class="widget"><div class="widget__label">BPKB Pending</div><div class="widget__value">7</div><div class="widget__sub">Target selesai hari ini</div></div>
        <div class="widget"><div class="widget__label">SPK Diproses</div><div class="widget__value">34</div><div class="widget__sub up">Sesuai target</div></div>
      </div>
      <div class="section-card">
        <h3>Tugas Prioritas</h3>
        <ul class="notif-list">
          <li class="notif-item"><span class="notif-dot notif-dot--amber"></span><div><div class="notif-text">BPKB atas nama Hendra Kusuma belum dikirim ke leasing</div><div class="notif-time">Jatuh tempo: Hari ini</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--blue"></span><div><div class="notif-text">SPK #4523 menunggu tanda tangan manajer</div><div class="notif-time">Diterima 2 jam lalu</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--green"></span><div><div class="notif-text">STNK batch #12 siap untuk diserahkan ke kustomer</div><div class="notif-time">Selesai 30 menit lalu</div></div></li>
        </ul>
      </div>`;

    case 'Dokumen': return `
      <div class="section-card">
        <h3>Manajemen Dokumen</h3>
        <table class="data-table">
          <thead><tr><th>No. SPK</th><th>Kustomer</th><th>Tipe</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>#4521</td><td>Andi Wijaya</td><td>Tunai</td><td><span class="status status--green">Lengkap</span></td></tr>
            <tr><td>#4522</td><td>Siti Rahma</td><td>Kredit</td><td><span class="status status--amber">Menunggu</span></td></tr>
            <tr><td>#4523</td><td>Budi Santoso</td><td>Kredit</td><td><span class="status status--blue">Proses</span></td></tr>
            <tr><td>#4524</td><td>Dina Lestari</td><td>Tunai</td><td><span class="status status--rose">Tidak Lengkap</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'STNK & BPKB': return `
      <div class="section-card">
        <h3>Status STNK &amp; BPKB</h3>
        <table class="data-table">
          <thead><tr><th>Kustomer</th><th>Unit</th><th>STNK</th><th>BPKB</th></tr></thead>
          <tbody>
            <tr><td>Andi Wijaya</td><td>Avanza G</td><td><span class="status status--green">Selesai</span></td><td><span class="status status--green">Selesai</span></td></tr>
            <tr><td>Hendra Kusuma</td><td>Innova</td><td><span class="status status--green">Selesai</span></td><td><span class="status status--amber">Pending</span></td></tr>
            <tr><td>Budi Santoso</td><td>Yaris Cross</td><td><span class="status status--blue">Proses</span></td><td><span class="status status--blue">Proses</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'Laporan': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Transaksi Bulan Ini</div><div class="widget__value">Rp 4,2M</div><div class="widget__sub up">↑ 12%</div></div>
        <div class="widget"><div class="widget__label">Unit Terjual</div><div class="widget__value">34</div><div class="widget__sub up">↑ 5</div></div>
      </div>
      <form class="section-card" data-toast="Laporan disiapkan untuk diunduh (mockup).">
        <h3>Unduh Laporan</h3>
        <p style="color:var(--c-text-muted);margin-bottom:1rem">Pilih rentang tanggal dan format. File tidak dikirim ke server.</p>
        <div class="form-group"><label for="lap-from">Dari</label><input id="lap-from" type="date" required></div>
        <div class="form-group"><label for="lap-to">Sampai</label><input id="lap-to" type="date" required></div>
        <div class="form-group"><label for="lap-fmt">Format</label><select id="lap-fmt"><option>PDF</option><option>XLSX</option></select></div>
        <button class="btn btn--primary" type="submit">Unduh Laporan</button>
      </form>`;

    default: return `
      <form class="section-card form-section" data-toast="Pengaturan administrasi disimpan (mockup).">
        <h3>Pengaturan Outlet</h3>
        <div class="form-group"><label for="set-outlet">Nama Outlet</label><input id="set-outlet" type="text" value="FAST Outlet Pusat" required></div>
        <div class="form-group"><label for="set-tz">Zona Waktu</label><select id="set-tz"><option>WIB (UTC+7)</option><option>WITA (UTC+8)</option><option>WIT (UTC+9)</option></select></div>
        <div class="form-group"><label for="set-sla">SLA Respons Administrasi</label><select id="set-sla"><option>&lt; 2 jam</option><option>&lt; 4 jam</option><option>Hari yang sama</option></select></div>
        <button class="btn btn--primary" type="submit">Simpan Pengaturan</button>
      </form>`;
  }
}

function managementContent(page) {
  switch (page) {
    case 'Executive Summary': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Revenue Bulan Ini</div><div class="widget__value">Rp 4,2M</div><div class="widget__sub up">↑ 12% vs bulan lalu</div></div>
        <div class="widget"><div class="widget__label">Unit Terjual</div><div class="widget__value">34</div><div class="widget__sub up">↑ 5 unit</div></div>
        <div class="widget"><div class="widget__label">Kepuasan Kustomer</div><div class="widget__value">4.7</div><div class="widget__sub">dari 5.0</div></div>
        <div class="widget"><div class="widget__label">Konversi Lead</div><div class="widget__value">38%</div><div class="widget__sub up">↑ 4%</div></div>
      </div>
      <div class="section-card">
        <h3>Highlight</h3>
        <ul class="notif-list">
          <li class="notif-item"><span class="notif-dot notif-dot--green"></span><div><div class="notif-text">Target SPK Q3 tercapai 94% — on track</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--amber"></span><div><div class="notif-text">Stok Fortuner GR kritis — perlu perhatian procurement</div></div></li>
          <li class="notif-item"><span class="notif-dot notif-dot--blue"></span><div><div class="notif-text">FAST modul dokumentasi digital telah go-live</div></div></li>
        </ul>
      </div>`;

    case 'KPI Monitor': return `
      <div class="section-card">
        <h3>KPI Utama</h3>
        <table class="data-table">
          <thead><tr><th>KPI</th><th>Target</th><th>Aktual</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Unit Terjual/Bulan</td><td>36</td><td>34</td><td><span class="status status--amber">94%</span></td></tr>
            <tr><td>Waktu Proses DO</td><td>&lt; 3 hari</td><td>2.4 hari</td><td><span class="status status--green">✓</span></td></tr>
            <tr><td>Kepuasan Kustomer</td><td>≥ 4.5</td><td>4.7</td><td><span class="status status--green">✓</span></td></tr>
            <tr><td>Konversi Test Drive</td><td>40%</td><td>38%</td><td><span class="status status--amber">95%</span></td></tr>
            <tr><td>Ketepatan STNK</td><td>100%</td><td>96%</td><td><span class="status status--amber">96%</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'Workforce': return `
      <div class="section-card">
        <h3>Ringkasan Tim</h3>
        <table class="data-table">
          <thead><tr><th>Peran</th><th>Jumlah</th><th>Aktif Hari Ini</th><th>Kinerja</th></tr></thead>
          <tbody>
            <tr><td>Frontman / Sales</td><td>12</td><td>10</td><td><span class="status status--green">Baik</span></td></tr>
            <tr><td>Administrasi</td><td>6</td><td>6</td><td><span class="status status--green">Baik</span></td></tr>
            <tr><td>Kasir</td><td>3</td><td>3</td><td><span class="status status--green">Baik</span></td></tr>
            <tr><td>Teknisi PDI</td><td>8</td><td>7</td><td><span class="status status--amber">Cukup</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'Target': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Target Tahunan</div><div class="widget__value">420 unit</div><div class="widget__sub">Pencapaian: 68%</div></div>
        <div class="widget"><div class="widget__label">Target Q3</div><div class="widget__value">108 unit</div><div class="widget__sub up">94% tercapai</div></div>
      </div>
      <div class="section-card"><h3>Target Breakdown per Segmen</h3>
        <table class="data-table">
          <thead><tr><th>Segmen</th><th>Target/Bln</th><th>Aktual</th></tr></thead>
          <tbody>
            <tr><td>MPV</td><td>15</td><td>14</td></tr>
            <tr><td>SUV</td><td>10</td><td>9</td></tr>
            <tr><td>Hatchback</td><td>8</td><td>8</td></tr>
            <tr><td>Sedan</td><td>3</td><td>3</td></tr>
          </tbody>
        </table>
      </div>`;

    default: return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Funnel Lead</div><div class="widget__value">210</div><div class="widget__sub">prospek bulan ini</div></div>
        <div class="widget"><div class="widget__label">Test Drive</div><div class="widget__value">84</div><div class="widget__sub">40% dari lead</div></div>
        <div class="widget"><div class="widget__label">SPK</div><div class="widget__value">34</div><div class="widget__sub">40% dari TD</div></div>
      </div>
      <div class="section-card">
        <h3>Bauran Segmen (aktual vs kapasitas)</h3>
        <div class="bar-list">
          <div class="bar-row"><span>MPV</span><div class="bar-track"><span class="bar-fill" style="width:93%"></span></div><span>93%</span></div>
          <div class="bar-row"><span>SUV</span><div class="bar-track"><span class="bar-fill" style="width:90%"></span></div><span>90%</span></div>
          <div class="bar-row"><span>Hatchback</span><div class="bar-track"><span class="bar-fill" style="width:100%"></span></div><span>100%</span></div>
          <div class="bar-row"><span>Sedan</span><div class="bar-track"><span class="bar-fill" style="width:100%"></span></div><span>100%</span></div>
        </div>
      </div>`;
  }
}

function customerContent(page) {
  switch (page) {
    case 'Beranda': return `
      <div class="section-card">
        <h3>Halo, Budi Santoso 👋</h3>
        <p style="margin-bottom:1rem">Selamat datang di portal layanan kendaraan Anda.</p>
        <div class="widget-grid">
          <div class="widget"><div class="widget__label">Pesanan Aktif</div><div class="widget__value">1</div></div>
          <div class="widget"><div class="widget__label">Cicilan Berjalan</div><div class="widget__value">36 bln</div></div>
          <div class="widget"><div class="widget__label">Poin Loyalitas</div><div class="widget__value">1.250</div></div>
        </div>
      </div>`;

    case 'Unit Saya': return `
      <div class="section-card">
        <h3>Kendaraan Anda</h3>
        <table class="data-table">
          <thead><tr><th>Unit</th><th>Plat</th><th>Tahun</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Yaris Cross</td><td>B-4321-ZX</td><td>2024</td><td><span class="status status--green">Aktif</span></td></tr>
          </tbody>
        </table>
      </div>`;

    case 'Status Pesanan': return `
      <div class="section-card">
        <h3>Pesanan Terkini</h3>
        <table class="data-table">
          <thead><tr><th>No. SPK</th><th>Unit</th><th>Tanggal</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>#4523</td><td>Yaris Cross Merah</td><td>28 Agu 2026</td><td><span class="status status--blue">Diproses</span></td></tr>
          </tbody>
        </table>
        <div class="timeline" style="margin-top:1.5rem">
          <div class="timeline-item"><h3>SPK Diterima</h3><p>28 Agu 2026 — 10:30</p></div>
          <div class="timeline-item"><h3>Dokumen Diverifikasi</h3><p>29 Agu 2026 — 14:00</p></div>
          <div class="timeline-item"><h3>PDI Selesai</h3><p>30 Agu 2026 — 09:00</p></div>
          <div class="timeline-item" style="opacity:0.4"><h3>Pengiriman Unit</h3><p>Dijadwalkan 3 Sep 2026</p></div>
        </div>
      </div>`;

    case 'Cicilan': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Cicilan Bulanan</div><div class="widget__value">Rp 3,8 jt</div></div>
        <div class="widget"><div class="widget__label">Sisa Tenor</div><div class="widget__value">34 bln</div></div>
        <div class="widget"><div class="widget__label">Jatuh Tempo</div><div class="widget__value">5 Sep</div></div>
      </div>
      <div class="section-card"><h3>Riwayat Pembayaran</h3>
        <table class="data-table">
          <thead><tr><th>Periode</th><th>Jumlah</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Agustus 2026</td><td>Rp 3.800.000</td><td><span class="status status--green">Lunas</span></td></tr>
            <tr><td>Juli 2026</td><td>Rp 3.800.000</td><td><span class="status status--green">Lunas</span></td></tr>
            <tr><td>Juni 2026</td><td>Rp 3.800.000</td><td><span class="status status--green">Lunas</span></td></tr>
          </tbody>
        </table>
      </div>`;

    default: return `
      <form class="section-card form-section" data-toast="Pesan terkirim ke tim dukungan (mockup).">
        <h3>Hubungi Kami</h3>
        <div class="form-group"><label for="cs-subject">Subjek</label><input id="cs-subject" type="text" placeholder="Pertanyaan atau keluhan..." required></div>
        <div class="form-group"><label for="cs-msg">Pesan</label><textarea id="cs-msg" rows="4" placeholder="Tuliskan pesan Anda..." required></textarea></div>
        <button class="btn btn--primary" type="submit">Kirim Pesan</button>
      </form>`;
  }
}

let currentRole = 'frontman';
let currentPage = 0;

function parseHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return;
  const [role, pageSlug] = raw.split('/');
  if (!ROLES[role]) return;
  currentRole = role;
  if (pageSlug) {
    const idx = ROLES[role].pages.findIndex((p) => slugify(p) === pageSlug);
    if (idx >= 0) currentPage = idx;
  } else {
    currentPage = 0;
  }
}

function writeHash() {
  const page = ROLES[currentRole].pages[currentPage];
  const next = `#${currentRole}/${slugify(page)}`;
  if (location.hash !== next) history.replaceState(null, '', next);
}

function closeRoleSidebar() {
  const sidebar = document.getElementById('roleSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('is-visible');
  overlay?.setAttribute('hidden', '');
  toggle?.setAttribute('aria-expanded', 'false');
}

function renderRoles() {
  const sidebar = document.getElementById('roleSidebar');
  sidebar.innerHTML = '<p class="role-sidebar__title">Pilih Peran</p>';
  Object.entries(ROLES).forEach(([key, role]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'role-btn' + (key === currentRole ? ' active' : '');
    btn.innerHTML = `<span class="role-icon">${role.icon}</span> ${role.label}`;
    btn.setAttribute('aria-pressed', String(key === currentRole));
    btn.addEventListener('click', () => {
      currentRole = key;
      currentPage = 0;
      render();
    });
    sidebar.appendChild(btn);
  });
}

function renderTabs() {
  const role = ROLES[currentRole];
  const tabBar = document.getElementById('pageTabs');
  const roleLabel = document.getElementById('roleLabel');
  roleLabel.innerHTML = `<span class="role-pill">${role.icon} ${role.label}</span>`;
  tabBar.innerHTML = '';
  role.pages.forEach((page, i) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'page-tab' + (i === currentPage ? ' active' : '');
    tab.textContent = page;
    tab.setAttribute('aria-selected', String(i === currentPage));
    tab.addEventListener('click', () => {
      currentPage = i;
      render();
    });
    tabBar.appendChild(tab);
  });
}

function renderContent() {
  const role = ROLES[currentRole];
  const page = role.pages[currentPage];
  const screen = document.getElementById('mockupScreen');
  let html = '';
  if (currentRole === 'frontman') html = frontmanContent(page);
  else if (currentRole === 'admin') html = adminContent(page);
  else if (currentRole === 'management') html = managementContent(page);
  else html = customerContent(page);
  screen.innerHTML = `<div class="page-panel active">${html}</div>`;
}

function render() {
  renderRoles();
  renderTabs();
  renderContent();
  writeHash();
  closeRoleSidebar();
}

const mobileToggle = document.getElementById('sidebarToggle');
const roleSidebar = document.getElementById('roleSidebar');
const overlay = document.getElementById('sidebarOverlay');
if (mobileToggle && roleSidebar) {
  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !roleSidebar.classList.contains('open');
    roleSidebar.classList.toggle('open', open);
    overlay?.classList.toggle('is-visible', open);
    overlay?.toggleAttribute('hidden', !open);
    mobileToggle.setAttribute('aria-expanded', String(open));
  });
  overlay?.addEventListener('click', closeRoleSidebar);
}

const mockupScreen = document.getElementById('mockupScreen');
mockupScreen?.addEventListener('submit', (e) => {
  const form = e.target.closest('form');
  if (!form) return;
  e.preventDefault();
  if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;
  const message = form.dataset.toast || 'Tersimpan (mockup).';
  if (typeof window.showToast === 'function') window.showToast(message);
});

window.addEventListener('hashchange', () => {
  parseHash();
  renderRoles();
  renderTabs();
  renderContent();
});

parseHash();
render();
