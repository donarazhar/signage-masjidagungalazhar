import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { adminService } from '../../services/adminService'
import { Save, MapPin, Upload, Image, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import type { Settings } from '../../types'

export default function PrayerSettings() {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => displayService.getSettings(),
  })

  const [formData, setFormData] = useState<Partial<Settings>>({})

  // Initialize logo preview when settings load
  useEffect(() => {
    if (settings?.mosque_logo) {
      setLogoPreview(settings.mosque_logo)
    }
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: (settings: Array<{ key: string; value: unknown; type: string }>) =>
      adminService.bulkUpdateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setSuccessMessage('Pengaturan berhasil disimpan!')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const updates = [
      { key: 'mosque_name', value: formData.mosque_name ?? settings?.mosque_name ?? '', type: 'string' },
      { key: 'mosque_address', value: formData.mosque_address ?? settings?.mosque_address ?? '', type: 'string' },
      { key: 'latitude', value: formData.latitude ?? settings?.latitude ?? 0, type: 'number' },
      { key: 'longitude', value: formData.longitude ?? settings?.longitude ?? 0, type: 'number' },
      { key: 'city', value: formData.city ?? settings?.city ?? '', type: 'string' },
      { key: 'calculation_method', value: formData.calculation_method ?? settings?.calculation_method ?? 20, type: 'number' },
      { key: 'prayer_duration', value: formData.prayer_duration ?? settings?.prayer_duration ?? 15, type: 'number' },
      { key: 'countdown_before', value: formData.countdown_before ?? settings?.countdown_before ?? 10, type: 'number' },
      { key: 'iqamah_duration', value: formData.iqamah_duration ?? settings?.iqamah_duration ?? { fajr: 10, dhuhr: 10, asr: 10, maghrib: 5, isha: 10 }, type: 'json' },
      { key: 'carousel_duration', value: formData.carousel_duration ?? settings?.carousel_duration ?? 10, type: 'number' },
      { key: 'running_text_speed', value: formData.running_text_speed ?? settings?.running_text_speed ?? 80, type: 'number' },
    ]

    try {
      await updateMutation.mutateAsync(updates)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (key: keyof Settings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleIqamahChange = (prayer: string, value: number) => {
    const currentIqamah = formData.iqamah_duration || settings?.iqamah_duration || {
      fajr: 10, dhuhr: 10, asr: 10, maghrib: 5, isha: 10
    }
    setFormData((prev) => ({
      ...prev,
      iqamah_duration: {
        ...currentIqamah,
        [prayer]: value,
      },
    }))
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimum 2MB')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      
      const response = await api.post('/settings/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Logo berhasil diupload')
      setLogoPreview(response.data.logo_url)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Gagal mengupload logo')
      // Revert preview
      setLogoPreview(settings?.mosque_logo || null)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus logo?')) return

    setIsUploadingLogo(true)
    try {
      await api.delete('/settings/logo')
      toast.success('Logo berhasil dihapus')
      setLogoPreview(null)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    } catch (error) {
      console.error('Error deleting logo:', error)
      toast.error('Gagal menghapus logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-secondary)]">Memuat pengaturan...</div>
      </div>
    )
  }

  const iqamahDuration = formData.iqamah_duration || settings?.iqamah_duration || {
    fajr: 10, dhuhr: 10, asr: 10, maghrib: 5, isha: 10
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Lokasi & Jadwal Shalat</h1>
        <p className="text-[var(--text-secondary)]">
          Atur koordinat lokasi masjid dan pengaturan jadwal shalat
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Section */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Logo Masjid
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            {/* Logo Preview */}
            <div 
              onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '16px',
                border: '2px dashed var(--slate-300)',
                background: 'var(--slate-50)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isUploadingLogo ? 'wait' : 'pointer',
                overflow: 'hidden',
                transition: 'all 0.2s',
                flexShrink: 0,
                position: 'relative'
              }}
            >
              {isUploadingLogo && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10
                }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    border: '3px solid var(--primary-100)', 
                    borderTopColor: 'var(--primary-500)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              )}
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo Masjid" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <>
                  <Upload size={28} style={{ color: 'var(--slate-400)', marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textAlign: 'center' }}>
                    Klik untuk upload
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
              disabled={isUploadingLogo}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
                Upload logo masjid Anda
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Logo akan ditampilkan pada layar display.<br />
                Format yang didukung: JPG, PNG, WebP, GIF<br />
                Ukuran maksimum: 2MB<br />
                Rekomendasi: 200x200 px (persegi)
              </p>
              {logoPreview && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  disabled={isUploadingLogo}
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8125rem',
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    opacity: isUploadingLogo ? 0.5 : 1
                  }}
                >
                  <Trash2 size={14} />
                  Hapus Logo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mosque Info */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Informasi Masjid
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nama Masjid</label>
              <input
                type="text"
                className="form-input"
                value={formData.mosque_name ?? settings?.mosque_name ?? ''}
                onChange={(e) => handleChange('mosque_name', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Kota</label>
              <input
                type="text"
                className="form-input"
                value={formData.city ?? settings?.city ?? ''}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Alamat</label>
              <input
                type="text"
                className="form-input"
                value={formData.mosque_address ?? settings?.mosque_address ?? ''}
                onChange={(e) => handleChange('mosque_address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Koordinat Lokasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.latitude ?? settings?.latitude ?? ''}
                onChange={(e) => handleChange('latitude', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="any"
                className="form-input"
                value={formData.longitude ?? settings?.longitude ?? ''}
                onChange={(e) => handleChange('longitude', parseFloat(e.target.value))}
              />
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Untuk mendapatkan koordinat, buka Google Maps, klik kanan pada lokasi masjid, dan salin koordinatnya.
          </p>
        </div>

        {/* Calculation Method */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Metode Perhitungan
          </h2>
          <div>
            <label className="form-label">Metode Hitung Jadwal Shalat</label>
            <select
              className="form-input"
              value={formData.calculation_method ?? settings?.calculation_method ?? 20}
              onChange={(e) => handleChange('calculation_method', parseInt(e.target.value))}
            >
              <option value={20}>Kementerian Agama Indonesia</option>
              <option value={3}>Muslim World League</option>
              <option value={4}>Umm Al-Qura University, Makkah</option>
              <option value={5}>Egyptian General Authority of Survey</option>
              <option value={2}>Islamic Society of North America (ISNA)</option>
            </select>
          </div>
        </div>

        {/* Iqamah Duration */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Durasi Iqamah (menit)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { key: 'fajr', label: 'Subuh' },
              { key: 'dhuhr', label: 'Dzuhur' },
              { key: 'asr', label: 'Ashar' },
              { key: 'maghrib', label: 'Maghrib' },
              { key: 'isha', label: 'Isya' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-input"
                  value={iqamahDuration[key as keyof typeof iqamahDuration] || 10}
                  onChange={(e) => handleIqamahChange(key, parseInt(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Other Settings */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Pengaturan Lainnya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Durasi Shalat (menit)</label>
              <input
                type="number"
                min="5"
                max="30"
                className="form-input"
                value={formData.prayer_duration ?? settings?.prayer_duration ?? 15}
                onChange={(e) => handleChange('prayer_duration', parseInt(e.target.value))}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Durasi layar gelap saat shalat berlangsung
              </p>
            </div>
            <div>
              <label className="form-label">Countdown Sebelum Adzan (menit)</label>
              <input
                type="number"
                min="5"
                max="30"
                className="form-input"
                value={formData.countdown_before ?? settings?.countdown_before ?? 15}
                onChange={(e) => handleChange('countdown_before', parseInt(e.target.value))}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Tampilkan countdown beberapa menit sebelum waktu shalat
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
