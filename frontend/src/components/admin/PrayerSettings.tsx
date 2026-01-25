import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { adminService } from '../../services/adminService'
import { Save, MapPin } from 'lucide-react'
import type { Settings } from '../../types'

export default function PrayerSettings() {
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: displayService.getSettings,
  })

  const [formData, setFormData] = useState<Partial<Settings>>({})

  // Initialize form data when settings load
  // Form data holds only user edits. Initial data comes from settings query.

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

    // DEBUG: Check what we are sending
    // alert(JSON.stringify(updates, null, 2))
    console.log('Sending updates:', updates)

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
    </div>
  )
}
