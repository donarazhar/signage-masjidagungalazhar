# Digital Signage Masjid Agung Al Azhar

Aplikasi **Digital Signage & Manajemen Informasi Masjid** modern berbasis web yang dirancang untuk menampilkan informasi jadwal shalat, agenda kegiatan, laporan keuangan, dan konten dakwah secara real-time di layar TV/Monitor masjid.

Sistem ini mendukung **Multi-Masjid** (satu sistem untuk banyak masjid) dengan panel admin yang terpusat dan role management yang aman.

---

## ✨ Fitur Utama

### 🖥️ Display Mode (Tampilan TV)

Interface visual yang menawan untuk jamaah:

- **Jadwal Shalat Otomatis**: Terintegrasi dengan API Aladhan, akurat sesuai lokasi koordinat masjid.
- **Smart Countdown**: Hitung mundur menuju waktu Adzan dan Iqamah.
- **Mode Shalat**: Layar otomatis gelap/hening saat waktu shalat tiba agar tidak mengganggu kekhusyukan.
- **Konten Visual Menarik**: Carousel gambar dan video (YouTube/Upload) untuk pengumuman atau poster dakwah.
- **Running Text**: Informasi berjalan untuk berita singkat (Normal/Urgent/Berita Duka).
- **Agenda Kegiatan**: Menampilkan jadwal kajian atau acara mendatang (limit deskripsi otomatis agar rapi).
- **Informasi Keuangan**: Menampilkan saldo kas, QRIS, dan Nomor Rekening Donasi.
- **Hadits Harian**: Penampilan kutipan hadits atau kata mutiara secara bergantian.
- **Layout Adaptif**: Mendukung berbagai ukuran layar.

### ⚙️ Admin Panel (Dashboard)

Pusat kontrol berbasis web untuk pengurus masjid:

- **Dashboard Statistik**: Ringkasan konten, petugas, dan status perangkat.
- **Manajemen Konten**: Upload poster, video, dan atur durasi tayang slide.
- **Pengaturan Shalat**: Koreksi waktu shalat per-menit dan durasi jeda Iqamah.
- **Agenda & Running Text**: Input data kegiatan dan teks berjalan dengan mudah.
- **Laporan Keuangan**: Update laporan pemasukan/pengeluaran mingguan/bulanan.
- **Personalisasi**: Ganti logo masjid, nama, dan alamat visual.
- **Security**: Login aman dengan enkripsi password.

### 🛡️ Fitur Super Admin & Keamanan

- **Multi-Masjid Management**: Kelola banyak masjid dalam satu instalasi.
- **Activity Log**: Rekam jejak aktivitas admin (Siapa melakukan apa dan kapan).
- **Database Backup**: Fitur backup database manual & download file SQL langsung dari dashboard.
- **User Management**: Tambah/Hapus/Edit akun admin masjid.

---

## 🛠️ Teknologi

Aplikasi ini dibangun menggunakan teknologi modern untuk performa tinggi dan kemudahan pengembangan:

**Backend (API Server)**

- **Framework**: Laravel 11
- **Language**: PHP 8.2+
- **Database**: MySQL 8.0+
- **Auth**: Laravel Sanctum (Token based authentication)
- **Features**: RESTful API, Eloquent ORM, Migration, Seeder

**Frontend (Client)**

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion (Animasi)
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 🚀 Panduan Instalasi & Deployment

### Persyaratan Minimum

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### 1. Instalasi Backend (Server)

```bash
# Clone repository
git clone https://github.com/donarazhar/signage-masjidagungalazhar.git
cd signage-masjidagungalazhar/backend

# Install dependencies
composer install

# Setup Environment
cp .env.example .env
# Edit .env sesuaikan database (DB_DATABASE, DB_USERNAME, DB_PASSWORD)

# Generate Key & Migrate
php artisan key:generate
php artisan migrate --seed
php artisan storage:link

# Jalankan Server (Development)
php artisan serve
```

### 2. Instalasi Frontend (Client)

```bash
cd ../frontend

# Install dependencies
npm install

# Setup Environment
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api (atau URL domain anda)

# Jalankan (Development)
npm run dev
```

### 3. Deployment ke Production (Cpanel/VPS)

**Backend:**

1. Upload isi folder `backend` ke server.
2. Arahkan domain/subdomain ke folder `backend/public`.
3. Pastikan folder `storage` dan `bootstrap/cache` memiliki permission write (775).
4. Import database atau jalankan migration di server.

**Frontend:**

1. Pastikan `VITE_API_URL` di `.env` frontend sudah mengarah ke domain backend production.
2. Build frontend:
   ```bash
   npm run build
   ```
3. Upload isi folder `frontend/dist` ke hosting (root public_html atau subfolder).
4. **PENTING**: File `.htaccess` di dalam folder public sudah menyertakan konfigurasi untuk SPA Routing (React Router). Pastikan file ini ikut terupload.

---

## 📁 Struktur Project

```
signage-masjidagungalazhar/
├── backend/                  # Laravel API Source Code
│   ├── app/Http/Controllers  # Logic Handler (API)
│   ├── database/migrations   # Skema Database
│   └── routes/api.php        # Definisi Route API
│
└── frontend/                 # React UI Source Code
    ├── public/               # Static assets & .htaccess
    ├── src/
    │   ├── components/
    │   │   ├── admin/        # Komponen Dashboard Admin
    │   │   └── display/      # Komponen Tampilan TV
    │   ├── services/         # Konfigurasi API (Axios)
    │   └── types/            # Definisi TypeScript
    └── dist/                 # Hasil build production
```

## 🔐 Akun Default

- **Email**: `admin@masjid.local`
- **Password**: `password`

---

## 👤 Author

**YPI Al Azhar** - Dikembangkan untuk kebutuhan syiar dan informasi Masjid Agung Al Azhar dan cabangnya.

---

## 📞 Kontak

Untuk penggunaan aplikasi bisa menghubungi:

| Channel | Detail |
|---------|--------|
| 📧 **Email** | [donarazhar@gmail.com](mailto:donarazhar@gmail.com) |
| 💬 **WhatsApp** | [088214740182](https://wa.me/6288214740182) |

---

**License**: MIT
