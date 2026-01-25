import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { Clock, FileImage, Type, TrendingUp, Calendar, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: displayService.getSettings,
  })

  const { data: contents } = useQuery({
    queryKey: ['activeContents'],
    queryFn: displayService.getActiveContents,
  })

  const { data: runningTexts } = useQuery({
    queryKey: ['activeRunningTexts'],
    queryFn: displayService.getActiveRunningTexts,
  })

  const { data: financialSummary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: displayService.getFinancialSummary,
  })

  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Selamat Pagi' : today.getHours() < 15 ? 'Selamat Siang' : today.getHours() < 18 ? 'Selamat Sore' : 'Selamat Malam'

  const stats = [
    {
      icon: FileImage,
      iconClass: 'green',
      value: contents?.length || 0,
      label: 'Konten Aktif',
      description: 'Poster & Video',
    },
    {
      icon: Type,
      iconClass: 'blue',
      value: runningTexts?.length || 0,
      label: 'Running Text',
      description: 'Pengumuman berjalan',
    },
    {
      icon: DollarSign,
      iconClass: 'amber',
      value: `Rp ${(financialSummary?.saldo_kas || 0).toLocaleString('id-ID')}`,
      label: 'Saldo Kas',
      description: 'Total infaq tersedia',
    },
    {
      icon: Calendar,
      iconClass: 'purple',
      value: today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      label: 'Hari Ini',
      description: today.toLocaleDateString('id-ID', { weekday: 'long' }),
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="admin-header">
        <h1>{greeting} 👋</h1>
        <p>Selamat datang di panel admin {settings?.mosque_name || 'Digital Signage'}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className={`icon ${stat.iconClass}`}>
              <stat.icon size={24} />
            </div>
            <div className="info">
              <div className="value">{stat.value}</div>
              <div className="label">{stat.label}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{stat.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">🚀 Aksi Cepat</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <a href="/admin/contents" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <FileImage size={20} />
            Upload Konten Baru
          </a>
          <a href="/admin/running-texts" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <Type size={20} />
            Tambah Running Text
          </a>
          <a href="/admin/prayer-settings" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <Clock size={20} />
            Atur Jadwal Shalat
          </a>
          <a href="/admin/financials" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <TrendingUp size={20} />
            Input Keuangan
          </a>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Mosque Info */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">🕌 Informasi Masjid</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Nama Masjid</span>
              <span style={{ fontWeight: 600 }}>{settings?.mosque_name || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Kota</span>
              <span style={{ fontWeight: 600 }}>{settings?.city || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Koordinat</span>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {settings?.latitude?.toFixed(4)}, {settings?.longitude?.toFixed(4)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#64748b' }}>Metode Hitung</span>
              <span className="badge badge-success">Kemenag RI</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">⚡ Status Sistem</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Display Mode</span>
              <span className="badge badge-success">● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>API Status</span>
              <span className="badge badge-success">● Connected</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Prayer Times</span>
              <span className="badge badge-success">● Synced</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
              <span style={{ color: '#64748b' }}>Last Update</span>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{new Date().toLocaleTimeString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
