/* ===== Interactive Mockup JS ===== */

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

// --- Page content generators ---

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
      <div class="section-card form-section">
        <h3>Buat Jadwal Test Drive</h3>
        <div class="form-group"><label>Nama Kustomer</label><input type="text" placeholder="Masukkan nama"></div>
        <div class="form-group"><label>No. Telepon</label><input type="text" placeholder="08xx-xxxx-xxxx"></div>
        <div class="form-group"><label>Unit yang Diminati</label><select><option>Avanza G</option><option>Innova Reborn</option><option>Fortuner GR</option></select></div>
        <div class="form-group"><label>Tanggal & Waktu</label><input type="datetime-local"></div>
        <button class="btn btn--primary">Jadwalkan Test Drive</button>
      </div>`;

    default: return notifPanel();
  }
}

function adminContent(page) {
  switch (page) {
    case 'Dashboard': return `
      <div class="widget-grid">
        <div class="widget"><div class="widget__label">Dokumen Pending</div><div class="widget__value">15</div><div class="widget__sub down">↑ 3 masuk hari ini</div></div>
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
        <h3>Status STNK & BPKB</h3>
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
      <div class="section-card"><h3>Laporan tersedia untuk diunduh</h3><p style="color:var(--c-text-muted);margin-bottom:1rem">Pilih rentang tanggal dan format laporan</p><button class="btn btn--primary">Unduh Laporan</button></div>`;

    default: return `<div class="section-card"><h3>Pengaturan</h3><p>Konfigurasi sistem administrasi.</p></div>`;
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

    default: return `<div class="section-card"><h3>Analitik</h3><p>Laporan analitik mendalam akan ditampilkan di sini.</p></div>`;
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
      <div class="section-card form-section">
        <h3>Hubungi Kami</h3>
        <div class="form-group"><label>Subjek</label><input type="text" placeholder="Pertanyaan atau keluhan..."></div>
        <div class="form-group"><label>Pesan</label><textarea rows="4" placeholder="Tuliskan pesan Anda..."></textarea></div>
        <button class="btn btn--primary">Kirim Pesan</button>
      </div>`;
  }
}

function notifPanel() {
  return `
    <div class="section-card">
      <h3>Notifikasi</h3>
      <ul class="notif-list">
        <li class="notif-item"><span class="notif-dot notif-dot--green"></span><div><div class="notif-text">Tidak ada notifikasi baru</div></div></li>
      </ul>
    </div>`;
}

// --- Render engine ---
let currentRole = 'frontman';
let currentPage = 0;

function renderRoles() {
  const sidebar = document.getElementById('roleSidebar');
  sidebar.innerHTML = '<p class="role-sidebar__title">Pilih Peran</p>';
  Object.entries(ROLES).forEach(([key, role]) => {
    const btn = document.createElement('button');
    btn.className = 'role-btn' + (key === currentRole ? ' active' : '');
    btn.innerHTML = `<span class="role-icon">${role.icon}</span> ${role.label}`;
    btn.addEventListener('click', () => { currentRole = key; currentPage = 0; render(); });
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
    tab.className = 'page-tab' + (i === currentPage ? ' active' : '');
    tab.textContent = page;
    tab.addEventListener('click', () => { currentPage = i; render(); });
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
  // Close mobile sidebar on role change
  const sidebar = document.getElementById('roleSidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// Mobile sidebar toggle
const mobileToggle = document.getElementById('sidebarToggle');
const roleSidebar = document.getElementById('roleSidebar');
if (mobileToggle && roleSidebar) {
  mobileToggle.addEventListener('click', () => roleSidebar.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (roleSidebar.classList.contains('open') &&
        !roleSidebar.contains(e.target) &&
        e.target !== mobileToggle) {
      roleSidebar.classList.remove('open');
    }
  });
}

// Init
render();
