import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Clock,
  Image,
  Calendar,
  Type,
  Quote,
  CreditCard,
  Monitor,
  Palette,
  Upload,
  Settings,
  Lightbulb,
  CheckCircle2,
  Info,
} from "lucide-react";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  content: React.ReactNode;
}

export default function UserGuide({ isOpen, onClose }: UserGuideProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "dashboard",
  );

  if (!isOpen) return null;

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const sections: GuideSection[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      color: "#10b981",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Dashboard adalah halaman utama untuk melihat preview dan mengatur
            tampilan display masjid Anda.
          </p>

          <div className="guide-subsection">
            <h4>
              <Monitor size={16} /> Preview Display
            </h4>
            <ul>
              <li>Lihat preview tampilan display secara real-time</li>
              <li>
                Klik tombol <strong>"Buka Display"</strong> untuk melihat
                tampilan fullscreen di tab baru
              </li>
              <li>
                Gunakan link ini untuk ditampilkan di TV atau monitor masjid
              </li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>
              <Palette size={16} /> Template Tampilan
            </h4>
            <ul>
              <li>
                <strong>Classic</strong> - Tema gelap elegan dengan aksen emas
              </li>
              <li>
                <strong>Modern</strong> - Tema minimalis dengan warna biru
              </li>
              <li>
                <strong>Royal</strong> - Tema mewah dengan warna ungu
              </li>
              <li>
                <strong>Nature</strong> - Tema segar dengan warna hijau
              </li>
            </ul>
            <div className="guide-tip">
              <Lightbulb size={14} />
              <span>
                Klik pada template untuk langsung mengubah tampilan display
              </span>
            </div>
          </div>

          <div className="guide-subsection">
            <h4>
              <Monitor size={16} /> Layout Tampilan
            </h4>
            <ul>
              <li>
                <strong>Classic</strong> - Layout standar dengan sidebar kiri
                dan kanan
              </li>
              <li>
                <strong>Cinematic</strong> - Konten fullscreen dengan overlay
              </li>
              <li>
                <strong>Focus</strong> - Konten utama lebih besar (70/30)
              </li>
              <li>
                <strong>Dashboard</strong> - Layout grid untuk informasi lengkap
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "prayer",
      title: "Jadwal Shalat",
      icon: Clock,
      color: "#3b82f6",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Atur jadwal shalat, logo, dan informasi masjid Anda.
          </p>

          <div className="guide-subsection">
            <h4>
              <Settings size={16} /> Pengaturan Dasar
            </h4>
            <ul>
              <li>
                <strong>Nama Masjid</strong> - Nama yang tampil di header
                display
              </li>
              <li>
                <strong>Kota</strong> - Pilih kota untuk jadwal shalat otomatis
                dari Kemenag
              </li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>
              <Upload size={16} /> Logo Masjid
            </h4>
            <ul>
              <li>Klik area upload atau drag & drop file gambar</li>
              <li>Format yang didukung: JPG, PNG, WebP</li>
              <li>Ukuran ideal: 200x200 pixel (rasio 1:1)</li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>
              <Clock size={16} /> Koreksi Waktu Shalat
            </h4>
            <ul>
              <li>Sesuaikan waktu shalat jika perlu penyesuaian</li>
              <li>Gunakan nilai positif (+) untuk memundurkan waktu</li>
              <li>Gunakan nilai negatif (-) untuk memajukan waktu</li>
            </ul>
            <div className="guide-tip">
              <Lightbulb size={14} />
              <span>
                Koreksi biasanya diperlukan jika lokasi masjid berbeda dari
                pusat kota
              </span>
            </div>
          </div>

          <div className="guide-subsection">
            <h4>
              <Clock size={16} /> Durasi Iqamah
            </h4>
            <ul>
              <li>Atur durasi countdown iqamah untuk setiap waktu shalat</li>
              <li>Durasi dalam satuan menit</li>
              <li>
                Display akan otomatis menampilkan countdown saat masuk waktu
                shalat
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "content",
      title: "Kelola Konten",
      icon: Image,
      color: "#8b5cf6",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Upload dan kelola konten slideshow yang tampil di display masjid.
          </p>

          <div className="guide-subsection">
            <h4>
              <Upload size={16} /> Menambah Konten Baru
            </h4>
            <ol>
              <li>
                Klik tombol <strong>"Tambah Konten"</strong>
              </li>
              <li>
                Pilih tipe konten:
                <ul>
                  <li>
                    <strong>Gambar</strong> - JPG, PNG, WebP (max 10MB)
                  </li>
                  <li>
                    <strong>Video</strong> - MP4 (max 50MB)
                  </li>
                  <li>
                    <strong>YouTube</strong> - Paste URL video YouTube
                  </li>
                </ul>
              </li>
              <li>Isi judul (opsional)</li>
              <li>Atur durasi tampil dalam detik</li>
              <li>
                Klik <strong>"Simpan"</strong>
              </li>
            </ol>
          </div>

          <div className="guide-subsection">
            <h4>
              <CheckCircle2 size={16} /> Mengaktifkan/Menonaktifkan
            </h4>
            <ul>
              <li>
                Klik ikon <strong>mata</strong> untuk toggle aktif/nonaktif
              </li>
              <li>Konten nonaktif tidak akan tampil di display</li>
              <li>
                Gunakan fitur ini untuk menyiapkan konten tanpa langsung tampil
              </li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>
              <Info size={16} /> Tips Konten
            </h4>
            <div className="guide-tip">
              <Lightbulb size={14} />
              <span>
                Gunakan gambar dengan resolusi 1920x1080 (16:9) untuk hasil
                terbaik
              </span>
            </div>
            <div className="guide-tip">
              <Lightbulb size={14} />
              <span>Video YouTube akan otomatis mute saat ditampilkan</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "events",
      title: "Agenda Kegiatan",
      icon: Calendar,
      color: "#f59e0b",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Kelola jadwal kegiatan dan acara masjid yang akan ditampilkan di
            display.
          </p>

          <div className="guide-subsection">
            <h4>
              <Calendar size={16} /> Menambah Agenda
            </h4>
            <ol>
              <li>
                Klik tombol <strong>"Tambah Agenda"</strong>
              </li>
              <li>
                Isi informasi agenda:
                <ul>
                  <li>
                    <strong>Judul</strong> - Nama kegiatan (wajib)
                  </li>
                  <li>
                    <strong>Tanggal</strong> - Tanggal pelaksanaan
                  </li>
                  <li>
                    <strong>Waktu</strong> - Jam mulai kegiatan
                  </li>
                  <li>
                    <strong>Lokasi</strong> - Tempat kegiatan (opsional)
                  </li>
                  <li>
                    <strong>Deskripsi</strong> - Keterangan tambahan (opsional)
                  </li>
                </ul>
              </li>
              <li>
                Klik <strong>"Simpan"</strong>
              </li>
            </ol>
          </div>

          <div className="guide-subsection">
            <h4>
              <Info size={16} /> Catatan
            </h4>
            <ul>
              <li>Agenda akan otomatis tampil di panel samping display</li>
              <li>Agenda yang sudah lewat tidak akan tampil</li>
              <li>
                Hapus agenda lama secara berkala untuk menjaga tampilan tetap
                rapi
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "runningtext",
      title: "Running Text",
      icon: Type,
      color: "#ec4899",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Kelola teks berjalan yang tampil di bagian bawah display.
          </p>

          <div className="guide-subsection">
            <h4>
              <Type size={16} /> Menambah Running Text
            </h4>
            <ol>
              <li>
                Klik tombol <strong>"Tambah Teks"</strong>
              </li>
              <li>Ketik isi teks yang ingin ditampilkan</li>
              <li>
                Klik <strong>"Simpan"</strong>
              </li>
            </ol>
          </div>

          <div className="guide-subsection">
            <h4>
              <Settings size={16} /> Pengaturan
            </h4>
            <ul>
              <li>Aktifkan/nonaktifkan teks dengan ikon mata</li>
              <li>Beberapa teks aktif akan tampil bergantian</li>
              <li>Teks akan berjalan dari kanan ke kiri</li>
            </ul>
          </div>

          <div className="guide-subsection">
            <h4>
              <Lightbulb size={16} /> Ide Konten
            </h4>
            <ul>
              <li>Pengumuman penting masjid</li>
              <li>Jadwal kajian rutin</li>
              <li>Himbauan untuk jamaah</li>
              <li>Ucapan selamat hari besar Islam</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "hadith",
      title: "Hadits / Mutiara",
      icon: Quote,
      color: "#06b6d4",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Kelola kutipan hadits atau kata mutiara Islam yang tampil di
            display.
          </p>

          <div className="guide-subsection">
            <h4>
              <Quote size={16} /> Menambah Hadits
            </h4>
            <ol>
              <li>
                Klik tombol <strong>"Tambah Hadits"</strong>
              </li>
              <li>
                Isi form:
                <ul>
                  <li>
                    <strong>Isi Hadits/Mutiara</strong> - Teks lengkap kutipan
                  </li>
                  <li>
                    <strong>Sumber/Perawi</strong> - Misal: HR. Bukhari, HR.
                    Muslim
                  </li>
                </ul>
              </li>
              <li>
                Klik <strong>"Simpan"</strong>
              </li>
            </ol>
          </div>

          <div className="guide-subsection">
            <h4>
              <Info size={16} /> Tampilan
            </h4>
            <ul>
              <li>Hadits tampil di area khusus pada display</li>
              <li>Beberapa hadits aktif akan tampil bergantian</li>
              <li>Sumber/perawi ditampilkan di bawah kutipan</li>
            </ul>
          </div>

          <div className="guide-tip">
            <Lightbulb size={14} />
            <span>
              Pastikan hadits yang diinput sudah diverifikasi keshahihannya
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "donation",
      title: "Donasi",
      icon: CreditCard,
      color: "#ef4444",
      content: (
        <div className="guide-content">
          <p className="guide-intro">
            Kelola informasi rekening donasi yang tampil di display masjid.
          </p>

          <div className="guide-subsection">
            <h4>
              <CreditCard size={16} /> Menambah Rekening Donasi
            </h4>
            <ol>
              <li>
                Klik tombol <strong>"Tambah Rekening"</strong>
              </li>
              <li>
                Isi informasi rekening:
                <ul>
                  <li>
                    <strong>Nama Program</strong> - Misal: Infaq Masjid,
                    Pembangunan
                  </li>
                  <li>
                    <strong>Nama Bank</strong> - Misal: BSI, BRI, Mandiri
                  </li>
                  <li>
                    <strong>Nomor Rekening</strong> - Nomor rekening lengkap
                  </li>
                  <li>
                    <strong>Atas Nama</strong> - Nama pemilik rekening
                  </li>
                  <li>
                    <strong>QR Code</strong> - Upload gambar QR code (opsional)
                  </li>
                </ul>
              </li>
              <li>
                Klik <strong>"Simpan"</strong>
              </li>
            </ol>
          </div>

          <div className="guide-subsection">
            <h4>
              <Info size={16} /> Tips
            </h4>
            <div className="guide-tip">
              <Lightbulb size={14} />
              <span>
                Tambahkan QR code QRIS untuk memudahkan donatur scan langsung
                dari display
              </span>
            </div>
            <div className="guide-tip">
              <Lightbulb size={14} />
              <span>
                Pisahkan rekening berdasarkan program untuk transparansi donasi
              </span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="guide-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="guide-modal">
        {/* Header */}
        <div className="guide-header">
          <div className="guide-header-content">
            <div className="guide-icon-wrapper">
              <Info size={24} />
            </div>
            <div>
              <h2>Panduan Penggunaan</h2>
              <p>Pelajari cara menggunakan semua fitur admin panel</p>
            </div>
          </div>
          <button className="guide-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="guide-body">
          <div className="guide-sections">
            {sections.map((section) => (
              <div key={section.id} className="guide-section">
                <button
                  className={`guide-section-header ${expandedSection === section.id ? "active" : ""}`}
                  onClick={() => toggleSection(section.id)}
                  style={
                    { "--section-color": section.color } as React.CSSProperties
                  }
                >
                  <div className="guide-section-title">
                    <div
                      className="guide-section-icon"
                      style={{
                        background: `${section.color}15`,
                        color: section.color,
                      }}
                    >
                      <section.icon size={18} />
                    </div>
                    <span>{section.title}</span>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown size={18} className="guide-chevron" />
                  ) : (
                    <ChevronRight size={18} className="guide-chevron" />
                  )}
                </button>
                {expandedSection === section.id && (
                  <div className="guide-section-content">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="guide-footer">
          <p>💡 Klik pada bagian mana saja untuk melihat panduan detail</p>
        </div>
      </div>

      <style>{`
        .guide-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .guide-modal {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 680px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .guide-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 20px 20px 0 0;
        }

        .guide-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .guide-icon-wrapper {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .guide-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .guide-header p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .guide-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s;
        }

        .guide-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .guide-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .guide-sections {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .guide-section {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .guide-section:has(.guide-section-header.active) {
          border-color: var(--section-color, #667eea);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .guide-section-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: #fafbfc;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .guide-section-header:hover {
          background: #f1f5f9;
        }

        .guide-section-header.active {
          background: white;
        }

        .guide-section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
        }

        .guide-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .guide-chevron {
          color: #94a3b8;
          transition: transform 0.2s;
        }

        .guide-section-content {
          padding: 1rem 1.25rem 1.25rem;
          background: white;
          border-top: 1px solid #f1f5f9;
          animation: expandIn 0.2s ease;
        }

        @keyframes expandIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .guide-content {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
        }

        .guide-intro {
          margin: 0 0 1rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 3px solid #10b981;
        }

        .guide-subsection {
          margin-bottom: 1rem;
        }

        .guide-subsection h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
        }

        .guide-subsection ul,
        .guide-subsection ol {
          margin: 0;
          padding-left: 1.25rem;
        }

        .guide-subsection li {
          margin-bottom: 0.35rem;
        }

        .guide-subsection ul ul {
          margin-top: 0.35rem;
        }

        .guide-tip {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.6rem 0.8rem;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #92400e;
          margin-top: 0.5rem;
        }

        .guide-tip svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .guide-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f1f5f9;
          text-align: center;
          font-size: 0.85rem;
          color: #64748b;
          background: #fafbfc;
          border-radius: 0 0 20px 20px;
        }

        .guide-footer p {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
