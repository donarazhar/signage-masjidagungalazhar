import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { FileImage, Type, Calendar, CreditCard, MessageSquare } from 'lucide-react'

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

  const { data: events } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: displayService.getUpcomingEvents,
  })

  const { data: donations } = useQuery({
    queryKey: ['activeDonations'],
    queryFn: displayService.getActiveDonations,
  })

  const today = new Date()
  const greeting = today.getHours() < 12 ? 'Selamat Pagi' : today.getHours() < 15 ? 'Selamat Siang' : today.getHours() < 18 ? 'Selamat Sore' : 'Selamat Malam'

  const stats = [
    {
      icon: FileImage,
      iconClass: 'green',
      value: contents?.length || 0,
      label: 'Konten Aktif',
      description: 'Poster & Video tayang',
    },
    {
      icon: MessageSquare,
      iconClass: 'blue',
      value: runningTexts?.length || 0,
      label: 'Running Text',
      description: 'Pesan berjalan aktif',
    },
    {
      icon: Calendar,
      iconClass: 'purple',
      value: events?.length || 0,
      label: 'Agenda',
      description: 'Kegiatan mendatang',
    },
    {
      icon: CreditCard,
      iconClass: 'amber',
      value: donations?.length || 0,
      label: 'Rekening',
      description: 'Donasi aktif',
    },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="admin-header">
        <h1 className="text-[var(--primary-700)]">{greeting} 👋</h1>
        <p>Selamat datang di panel admin {settings?.mosque_name || 'Digital Signage'}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className={`icon ${stat.iconClass}`} style={{ 
               backgroundColor: idx === 0 ? 'var(--primary-100)' : 
                              idx === 1 ? 'var(--primary-50)' : 
                              idx === 2 ? '#f3e8ff' : '#fef3c7',
               color: idx === 0 ? 'var(--primary-600)' : 
                      idx === 1 ? 'var(--primary-500)' : 
                      idx === 2 ? '#9333ea' : '#d97706'
            }}>
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
            Upload Konten
          </a>
          <a href="/admin/events" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <Calendar size={20} />
            Tambah Agenda
          </a>
          <a href="/admin/running-texts" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <Type size={20} />
            Tulis Pengumuman
          </a>
          <a href="/admin/donations" className="btn btn-secondary" style={{ textDecoration: 'none', justifyContent: 'flex-start' }}>
            <CreditCard size={20} />
            Kelola Donasi
          </a>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Mosque Info */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">🕌 Detail Masjid</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Nama</span>
              <span className="font-semibold">{settings?.mosque_name || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Alamat</span>
              <span className="font-semibold text-right" style={{ maxWidth: '60%' }}>{settings?.mosque_address || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-slate-500">Jadwal Shalat</span>
               <a href="/admin/prayer-settings" className="text-[var(--primary-600)] text-sm font-semibold hover:underline">
                 Atur Jadwal &rarr;
               </a>
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
              <span className="text-slate-500">Display</span>
              <span className="badge badge-success">● Online</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span className="text-slate-500">Waktu Server</span>
              <span className="font-mono">{new Date().toLocaleTimeString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
               <span className="text-slate-500">Versi</span>
               <span className="text-xs text-slate-400">v1.2.0 (Al-Azhar Edition)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
