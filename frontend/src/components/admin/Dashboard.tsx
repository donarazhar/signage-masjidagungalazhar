import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { adminService } from '../../services/adminService'
import { Image, Type, DollarSign, Clock } from 'lucide-react'

export default function Dashboard() {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: displayService.getSettings,
  })

  const { data: contents } = useQuery({
    queryKey: ['contents'],
    queryFn: adminService.getContents,
  })

  const { data: runningTexts } = useQuery({
    queryKey: ['runningTexts'],
    queryFn: adminService.getRunningTexts,
  })

  const { data: financialSummary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: adminService.getFinancialSummary,
  })

  const activeContents = contents?.filter(c => c.is_enabled) || []
  const activeTexts = runningTexts?.filter(t => t.is_enabled) || []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Selamat datang di panel admin {settings?.mosque_name || 'Digital Signage Masjid'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Image}
          label="Poster/Video Aktif"
          value={activeContents.length}
          total={contents?.length || 0}
          color="blue"
        />
        <StatCard
          icon={Type}
          label="Running Text Aktif"
          value={activeTexts.length}
          total={runningTexts?.length || 0}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Saldo Kas"
          value={`Rp ${(financialSummary?.saldo_kas || 0).toLocaleString('id-ID')}`}
          color="gold"
        />
        <StatCard
          icon={Clock}
          label="Lokasi"
          value={settings?.city || 'Jakarta'}
          color="purple"
        />
      </div>

      {/* Quick Preview */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Preview Tampilan
          </h2>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary text-sm"
          >
            Buka Fullscreen
          </a>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <iframe
            src="/"
            title="Display Preview"
            className="w-full h-full"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>

      {/* Recent Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Poster/Video Terbaru
          </h2>
          {contents?.slice(0, 5).map((content) => (
            <div
              key={content.id}
              className="flex items-center gap-3 py-2 border-b border-[var(--border-color)] last:border-0"
            >
              <div className="w-12 h-12 rounded bg-[var(--bg-tertiary)] flex items-center justify-center">
                {content.type === 'image' ? '🖼️' : '🎬'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {content.title}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {content.type} • {content.duration}s
                </p>
              </div>
              <span className={`badge ${content.is_enabled ? 'badge-success' : 'badge-danger'}`}>
                {content.is_enabled ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          ))}
          {(!contents || contents.length === 0) && (
            <p className="text-[var(--text-muted)] text-sm py-4 text-center">
              Belum ada konten
            </p>
          )}
        </div>

        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Running Text Aktif
          </h2>
          {runningTexts?.slice(0, 5).map((text) => (
            <div
              key={text.id}
              className="py-2 border-b border-[var(--border-color)] last:border-0"
            >
              <div className="flex items-start gap-2">
                <span className={`badge ${
                  text.type === 'urgent' ? 'badge-danger' : 
                  text.type === 'berita_duka' ? 'badge-warning' : 'badge-success'
                }`}>
                  {text.type}
                </span>
                <p className="text-sm text-[var(--text-primary)] flex-1">
                  {text.content}
                </p>
              </div>
            </div>
          ))}
          {(!runningTexts || runningTexts.length === 0) && (
            <p className="text-[var(--text-muted)] text-sm py-4 text-center">
              Belum ada running text
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  total?: number
  color: 'blue' | 'green' | 'gold' | 'purple'
}

function StatCard({ icon: Icon, label, value, total, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    gold: 'bg-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="admin-card">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {value}
            {total !== undefined && (
              <span className="text-sm font-normal text-[var(--text-muted)]">
                /{total}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
