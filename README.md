# Digital Signage Masjid Agung Al Azhar

Aplikasi Digital Signage untuk Masjid Agung Al Azhar berbasis web dengan fitur:

## ✨ Fitur Utama

### Display Mode (untuk TV/Signage)

- 🕌 Jadwal shalat 5 waktu + Syuruq (API Aladhan)
- ⏱️ Countdown sebelum waktu shalat
- 🔔 Mode Iqamah dengan countdown
- 🙏 Mode "Shalat Berlangsung" (layar gelap)
- 🖼️ Carousel poster/video dengan auto-play
- 📢 Running text ticker
- 🕐 Jam digital real-time
- 📅 Tanggal Masehi + Hijriyah

### Admin Panel

- 🔐 Login dengan Laravel Sanctum
- 📊 Dashboard statistik
- ⚙️ Pengaturan lokasi & jadwal shalat
- 🖼️ Manajemen konten (upload poster/video)
- 📝 Manajemen running text
- 💰 Manajemen keuangan/infaq

## 🛠️ Tech Stack

- **Backend**: Laravel 11 + MySQL + Sanctum
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **API**: Aladhan.com (Prayer Times)

## 🚀 Quick Start

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+

### 1. Clone Repository

```bash
git clone https://github.com/donarazhar/signage-masjidagungalazhar.git
cd signage-masjidagungalazhar
```

### 2. Setup Database

```sql
CREATE DATABASE signage_masjid;
```

### 3. Setup Backend

```bash
cd backend
composer install
cp .env.example .env
# Edit .env with your database credentials
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 4. Setup Frontend

```bash
cd frontend
npm install
```

**Konfigurasi API Endpoint:**

Buat file `.env` di folder `frontend/` dengan isi:

```env
# Untuk development lokal
VITE_API_URL=http://localhost:8000/api

# Untuk production (sesuaikan dengan domain server)
# VITE_API_URL=https://your-domain.com/api
```

> ⚠️ **Penting:** Jika API URL tidak dikonfigurasi, frontend akan menggunakan `http://localhost:8000/api` sebagai default.

Jalankan development server:

```bash
npm run dev
```

**Build untuk Production:**

```bash
npm run build
# Hasil build ada di folder dist/
# Upload isi folder dist/ ke server hosting
```

### 5. Open in Browser

- Display Mode: http://localhost:5173/
- Admin Panel: http://localhost:5173/admin

### Default Admin Login

- Email: `admin@masjid.local`
- Password: `password`

## 📁 Project Structure

```
signage-masjidagungalazhar/
├── backend/              # Laravel 11 Backend
│   ├── app/
│   ├── database/
│   └── routes/
└── frontend/             # React Frontend
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    └── public/
```

## 📄 License

MIT License

## 👤 Author

YPI Al Azhar
