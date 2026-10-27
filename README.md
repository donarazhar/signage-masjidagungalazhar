# Digital Signage Masjid Agung Al Azhar

Aplikasi **Digital Signage & Manajemen Informasi Masjid** modern berbasis web yang dirancang khusus untuk menampilkan informasi jadwal shalat, agenda dakwah, sarana donasi/infaq, dan pengumuman secara real-time di layar TV/Monitor masjid.

Sistem ini dirancang dengan konsep **Multi-Tenant / Multi-Masjid**, memungkinkan satu instalasi sistem mengelola banyak masjid sekaligus dengan tampilan mandiri via *slug* (misal: `/:mosqueSlug`), panel administrasi terpusat, serta pembagian hak akses (*Role-Based Access Control*) yang aman.

---

## 🌟 Gambaran Umum Sistem

Aplikasi terbagi menjadi dua komponen utama:

1. **Display Mode (Tampilan Layar TV):** Antarmuka visual beresolusi tinggi, elegan, dan dinamis yang ditayangkan di monitor atau Smart TV masjid untuk jamaah. Dilengkapi transisi otomatis antara mode tayang normal, murottal otomatis, countdown adzan, tampilan adzan, hitung mundur iqamah, hingga layar hening saat shalat berlangsung.
2. **Admin Panel (Pusat Kendali Pengurus):** Antarmuka pengelolaan berbasis web responsif yang memudahkan pengurus/DKM masjid mengelola konten, jadwal shalat, pengumuman, agenda, hingga program donasi/infaq tanpa perlu keahlian teknis khusus.

---

## 🖥️ Fitur Display Mode (Layar TV Masjid)

Antarmuka display dirancang dengan visual yang menawan dan ramah untuk layar berukuran besar (Smart TV / Monitor LED):

### 1. Jadwal Shalat Otomatis & Presisi
- **Integrasi Data Resmi:** Terhubung dengan data jadwal shalat Kementerian Agama RI (Kemenag) berdasarkan pilihan kota/kabupaten.
- **Koreksi Waktu Manual:** Dukungan penyesuaian waktu (+ / - menit) untuk setiap waktu shalat (Subuh, Syuruq, Dzuhur, Ashar, Maghrib, Isya) untuk mengantisipasi perbedaan letak geografis masjid.
- **Perhitungan Imsak Otomatis:** Menghitung waktu Imsak secara otomatis (10 menit sebelum waktu Subuh).
- **Zona Waktu Adaptif:** Mendukung penyesuaian otomatis zona waktu (WIB, WITA, WIT).

### 2. Siklus Shalat Cerdas (Smart Prayer Lifecycle)
Display memiliki alur pergantian mode otomatis yang sangat adaptif terhadap fase ibadah:
- **Countdown Menuju Adzan:** Hitung mundur peringatan beberapa menit sebelum waktu shalat tiba (dapat dikonfigurasi 5–30 menit) agar jamaah dapat bersiap-siap berwudhu dan masuk ke masjid.
- **Mode Adzan (`AdhanMode`):** Saat waktu shalat tiba, display otomatis berganti ke tampilan visual adzan berkumandang selama 3 menit.
- **Mode Menunggu Iqamah (`IqamahMode`):** Hitung mundur besar menit & detik menuju waktu iqamah dengan durasi yang dapat diatur berbeda untuk masing-masing waktu shalat (termasuk durasi khusus shalat Jum'at), dilengkapi teks himbauan merapatkan shaf dan mematikan nada dering ponsel.
- **Mode Shalat Berlangsung (`PrayerInProgressMode`):** Layar otomatis meredup/gelap saat shalat berjamaah berlangsung (durasi shalat fardhu harian dan durasi khusus shalat Jum'at hingga 90 menit) guna menjaga kekhusyukan jamaah dan menghemat konsumsi daya layar.
- **Kembali Otomatis ke Mode Normal:** Display otomatis kembali menayangkan slideshow dan informasi setelah rangkaian shalat selesai.

### 3. Audio Murottal Al-Qur'an Otomatis
- **Pemutaran Mandiri:** Memutar lantunan ayat suci Al-Qur'an secara otomatis selama display berada dalam mode normal.
- **Smart Pause & Resume:** Audio murottal otomatis dijeda (*pause*) saat masuk waktu adzan atau shalat, dan dilanjutkan kembali ketika rangkaian shalat selesai.
- **Kustomisasi Qari & Surah:** Pengaturan pilihan server audio/qari serta penentuan urutan surah yang diputar.

### 4. Pilihan Layout Fleksibel
Tersedia berbagai pilihan arsitektur tata letak (*layout*) yang dapat dipilih langsung sesuai kebutuhan interior masjid:
- **Classic:** Tata letak seimbang dengan panel jam, countdown & donasi di sisi samping, jadwal shalat horizontal di bagian bawah, serta carousel konten di bagian tengah.
- **Cinematic:** Tampilan bergaya sinematik dengan visual lebar dan floating widget elegan.
- **Focus:** Menitikberatkan fokus utama pada media informasi dan jadwal shalat terstruktur.
- **Dashboard:** Tampilan modern bergaya command center dengan visual data yang informatif.
- **Fullscreen:** Mengutamakan konten visual/poster layar penuh dengan ringkasan status jadwal di bagian tepi.
- **TV:** Layout yang dioptimasi khusus untuk kenyamanan pandang rasio layar TV/monitor lebar.
- **QRIS Donasi:** Menghadirkan area samping khusus untuk menampilkan kode QRIS infaq berukuran besar yang mudah dipindai oleh jamaah dari kejauhan.

### 5. Tema Warna (Color Templates)
- Dilengkapi berbagai preset palet warna modern (Classic, Emerald Green, Midnight Blue, Royal Gold, dll.) yang dapat disesuaikan dengan tema interior atau warna khas masjid.

### 6. Media Informasi & Konten Dakwah
- **Carousel Slideshow:** Penayangan gambar, poster pengumuman, dan poster dakwah berganti secara otomatis dengan durasi tayang yang dapat disesuaikan.
- **Dukungan Video:** Mendukung pemutaran video pengumuman maupun sematan YouTube.
- **Running Text (Teks Berjalan):** Informasi teks berjalan di bagian bawah layar untuk pengumuman singkat, berita darurat (*urgent*), maupun kabar lelayu / berita duka.
- **Agenda Kegiatan Masjid:** Menampilkan jadwal kajian rutin, tabligh akbar, serta kegiatan sosial masjid mendatang.
- **Hadits & Mutiara Hikmah:** Menampilkan kutipan hadits shohih dan kata mutiara islami harian yang berganti secara berkala.
- **Informasi Donasi & QRIS:** Menampilkan informasi rekening donasi/infaq masjid (nama bank, nomor rekening, atas nama) serta barcode QRIS digital yang mudah dipindai jamaah.
- **Widget Waktu & Kalender:** Jam digital presisi detik, penanggalan Masehi, dan penanggalan Hijriah terintegrasi.
- **Mode Fullscreen & TV Splash Screen:** Fitur tombol layar penuh otomatis untuk pengoperasian mulus di browser Smart TV.

---

## ⚙️ Fitur Panel Admin (Pusat Kendali Pengurus)

Panel admin dapat diakses melalui peramban web pada komputer, tablet, maupun smartphone:

### 1. Dashboard Statistik & Live Preview
- Ringkasan cepat jumlah konten aktif, teks berjalan, agenda mendatang, dan program donasi.
- **Live Preview Display:** Admin dapat memantau tampilan display secara *real-time* sekaligus mencoba template tema dan layout langsung dari dashboard.

### 2. Pengaturan Lokasi & Waktu Shalat (`/admin/prayer-settings`)
- **Logo & Identitas:** Upload logo masjid, nama resmi masjid, kota, dan alamat visual.
- **Pencarian Kota Kemenag:** Pemilihan basis data jadwal kota/kabupaten se-Indonesia.
- **Koreksi Menit Shalat:** Penambahan/pengurangan menit pada jadwal shalat bila diperlukan sinkronisasi lokal.
- **Pengaturan Jeda Iqamah:** Menentukan waktu tunggu iqamah per waktu shalat (Subuh, Dzuhur, Jum'at, Ashar, Maghrib, Isya).
- **Pengaturan Durasi Shalat:** Menentukan durasi layar gelap untuk shalat harian dan shalat Jum'at (termasuk khutbah).
- **Countdown Sebelum Adzan:** Menentukan berapa menit sebelum adzan hitung mundur mulai diaktifkan.

### 3. Manajemen Murottal (`/admin/murottal`)
- Mengaktifkan atau menonaktifkan fitur audio murottal otomatis.
- Memilih server/qari Al-Qur'an dan memilih surah awal yang akan dilantunkan.

### 4. Manajemen Konten Slideshow (`/admin/contents`)
- Upload file poster/gambar dakwah (JPG, PNG, WebP).
- Pengaturan urutan tayang (*drag and drop* atau nomor urut).
- Pengaturan status aktif/non-aktif konten dan durasi transisi slide.

### 5. Manajemen Agenda Kegiatan (`/admin/events`)
- Tambah, edit, dan hapus jadwal kegiatan atau kajian masjid.
- Informasi tanggal, waktu pelaksanaan, narasumber/ustadz, dan lokasi kegiatan.
- Pengaturan visibilitas kegiatan pada display.

### 6. Manajemen Running Text (`/admin/running-texts`)
- Pembuatan pesan berjalan dengan kategori: *Normal*, *Penting/Urgent*, atau *Berita Duka*.
- Pengaturan urutan dan sakelar aktifasi pesan secara instan.
- Konfigurasi kecepatan gulir teks (*speed slider*).

### 7. Bank Hadits & Mutiara Hikmah (`/admin/hadiths`)
- Manajemen koleksi hadits, doa, dan kata-kata hikmah islami.
- Pengaturan kutipan mana saja yang aktif untuk ditampilkan di layar display.

### 8. Manajemen Program Donasi & QRIS (`/admin/donations`)
- Pengelolaan daftar rekening donasi/infaq masjid (nama bank, nomor rekening, dan atas nama penerima).
- Upload gambar barcode QRIS untuk memfasilitasi penerimaan sedekah dan infaq digital jamaah.
- Pengaturan status aktif/non-aktif serta urutan program donasi yang tampil di layar signage.

### 9. Buku Panduan Penggunaan Terintegrasi (`UserGuide`)
- Panduan teknis interaktif langkah-demi-langkah yang dapat dibuka langsung di dalam panel admin untuk memandu operator/DKM baru.

---

## 🛡️ Fitur Super Admin & Arsitektur Multi-Masjid

Bagi pengelola yayasan atau pengembang yang mengelola banyak cabang masjid:

- **Multi-Mosque Management (`/admin/mosques`):** Mendaftarkan banyak masjid baru, menentukan *slug* unik (misal: `/masjid-al-azhar`, `/masjid-kebon-jeruk`), logo, dan konfigurasi mandiri per masjid.
- **Role-Based Access Control (`/admin/users`):**
  - **Super Admin:** Mengakses seluruh masjid, mengelola pengguna, memantau log sistem, dan mengunduh backup.
  - **Admin Masjid:** Hak akses dibatasi hanya untuk mengelola konten dan jadwal pada masjid yang ditugaskan kepadanya.
- **Audit Trail & Activity Log (`/admin/activity-log`):** Memantau rekam jejak aktivitas admin (siapa yang login, menambah, memperbarui, atau menghapus data beserta waktu kejadian).
- **Database Backup (`/admin/backups`):** Pembuatan salinan cadangan (*backup*) basis data secara berkala dan fitur unduh file `.sql` langsung dari dasbor web.

---

## 🛠️ Teknologi yang Digunakan

Aplikasi dibangun menggunakan arsitektur modern berstandar industri:

### Backend (API Server)
- **Framework:** Laravel 11 (PHP 8.2+)
- **Database:** MySQL 8.0+ / MariaDB
- **Autentikasi:** Laravel Sanctum (Token-Based RESTful Authentication)
- **Komponen Inti:** RESTful API Controller, Eloquent ORM, Database Migration & Seeders.

### Frontend (Client Display & Admin Panel)
- **Framework:** React 18
- **Tooling:** Vite & TypeScript
- **Styling:** CSS3 Custom Properties & Tailwind CSS
- **Animasi & Interaksi:** Framer Motion
- **State & Caching Management:** TanStack React Query (React Query v5)
- **Routing:** React Router DOM (v6 SPA Routing)
- **Icon Set:** Lucide React
- **HTTP Client:** Axios Client terenkapsulasi

---

## 📁 Struktur Direktori Proyek

```
signage-display/
├── backend/                       # Laravel 11 REST API Server
│   ├── app/
│   │   ├── Http/Controllers/      # Handler endpoint API (Jadwal, Konten, Auth, dll.)
│   │   └── Models/                # Eloquent Data Models
│   ├── database/
│   │   ├── migrations/            # Skema tabel database
│   │   └── seeders/               # Data inisialisasi awal
│   └── routes/
│       └── api.php                # Definisi seluruh rute API
│
└── frontend/                      # React 18 TypeScript Client Application
    ├── public/                    # Aset statis & konfigurasi .htaccess untuk SPA
    ├── src/
    │   ├── components/
    │   │   ├── admin/             # Komponen Panel Admin & User Guide
    │   │   └── display/           # Komponen Signage Display (Layouts, AdhanMode, IqamahMode)
    │   ├── hooks/                 # Custom React Hooks (Countdown, Murottal, Fullscreen, dll.)
    │   ├── services/              # Modul integrasi API Axios
    │   └── types/                 # Definisi tipe TypeScript
    └── dist/                      # Direktori build siap rilis (Production Bundle)
```

---

## 👤 Pengembang & Hak Cipta

Dikembangkan untuk kebutuhan syiar, tata kelola informasi, dan digitalisasi masjid di lingkungan **Yayasan Pesantren Islam (YPI) Al Azhar** serta terbuka untuk adaptasi masjid-masjid lainnya.

---

## 📞 Informasi & Dukungan

Untuk pertanyaan seputar penggunaan sistem, silakan menghubungi:

| Saluran | Informasi Kontak |
| :--- | :--- |
| 📧 **Email** | [donarazhar@gmail.com](mailto:donarazhar@gmail.com) |
| 💬 **WhatsApp** | [+62 882-1474-0182](https://wa.me/6288214740182) |

---

**Lisensi**: [MIT License](LICENSE)

