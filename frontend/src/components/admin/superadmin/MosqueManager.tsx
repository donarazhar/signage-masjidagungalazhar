import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, X, MapPin, Building2, Search, ChevronRight, Users, Calendar, Upload, Image, ExternalLink } from 'lucide-react'
import { api } from '../../../services/api'
import { toast } from 'react-hot-toast'

interface Mosque {
  id: number
  name: string
  slug: string | null
  address: string | null
  city: string | null
  logo: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export default function MosqueManager() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [filteredMosques, setFilteredMosques] = useState<Mosque[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    city: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMosques()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMosques(mosques)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredMosques(
        mosques.filter(
          (mosque) =>
            mosque.name.toLowerCase().includes(query) ||
            (mosque.city && mosque.city.toLowerCase().includes(query)) ||
            (mosque.address && mosque.address.toLowerCase().includes(query))
        )
      )
    }
  }, [searchQuery, mosques])

  const fetchMosques = async () => {
    try {
      const response = await api.get('/mosques')
      setMosques(response.data)
      setFilteredMosques(response.data)
    } catch (error) {
      console.error('Error fetching mosques:', error)
      toast.error('Gagal memuat data masjid')
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setFormData({ name: '', slug: '', address: '', city: '' })
    setSelectedMosque(null)
    setIsModalOpen(false)
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleEdit = (mosque: Mosque) => {
    setSelectedMosque(mosque)
    setFormData({
      name: mosque.name,
      slug: mosque.slug || '',
      address: mosque.address || '',
      city: mosque.city || ''
    })
    setLogoPreview(mosque.logo_url)
    setLogoFile(null)
    setIsModalOpen(true)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimum 2MB')
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('slug', formData.slug)
      data.append('address', formData.address)
      data.append('city', formData.city)
      if (logoFile) {
        data.append('logo', logoFile)
      }

      if (selectedMosque) {
        // For update, we need to use POST with _method
        data.append('_method', 'PUT')
        await api.post(`/mosques/${selectedMosque.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Data masjid berhasil diperbarui')
      } else {
        await api.post('/mosques', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success('Masjid baru berhasil ditambahkan')
      }
      
      fetchMosques()
      closeModal()
    } catch (error) {
      console.error('Error saving mosque:', error)
      toast.error('Gagal menyimpan data masjid')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus masjid ini? Semua data terkait akan ikut terhapus!')) return

    try {
      await api.delete(`/mosques/${id}`)
      toast.success('Masjid berhasil dihapus')
      fetchMosques()
    } catch (error) {
      console.error('Error deleting mosque:', error)
      toast.error('Gagal menghapus masjid')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Data Masjid</h1>
          <p>Kelola daftar masjid yang terdaftar dalam sistem</p>
        </div>
        <button 
          onClick={() => { setSelectedMosque(null); setFormData({ name: '', slug: '', address: '', city: '' }); setLogoPreview(null); setLogoFile(null); setIsModalOpen(true); }} 
          className="btn btn-primary"
        >
          <Plus size={20} />
          Tambah Masjid
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="icon green">
            <Building2 size={24} />
          </div>
          <div className="info">
            <div className="value">{mosques.length}</div>
            <div className="label">Total Masjid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon blue">
            <MapPin size={24} />
          </div>
          <div className="info">
            <div className="value">
              {new Set(mosques.map(m => m.city).filter(Boolean)).size}
            </div>
            <div className="label">Kota Terjangkau</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon purple">
            <Users size={24} />
          </div>
          <div className="info">
            <div className="value">-</div>
            <div className="label">Total Admin</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Cari nama masjid, kota, atau alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '42px', margin: 0 }}
            />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
            Menampilkan <strong style={{ color: 'var(--slate-700)' }}>{filteredMosques.length}</strong> dari <strong style={{ color: 'var(--slate-700)' }}>{mosques.length}</strong> masjid
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th style={{ width: '80px' }}>Logo</th>
                <th>Nama Masjid</th>
                <th>Kota</th>
                <th>Alamat</th>
                <th>Ditambahkan</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '3px solid var(--primary-100)', 
                        borderTopColor: 'var(--primary-500)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span style={{ color: 'var(--slate-500)' }}>Memuat data masjid...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMosques.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        background: 'var(--slate-100)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Building2 size={28} style={{ color: 'var(--slate-400)' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                          {searchQuery ? 'Tidak ditemukan' : 'Belum ada data masjid'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                          {searchQuery 
                            ? `Tidak ada masjid yang cocok dengan "${searchQuery}"`
                            : 'Klik tombol "Tambah Masjid" untuk menambahkan data'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMosques.map((mosque, index) => (
                  <tr key={mosque.id}>
                    <td style={{ fontWeight: 500, color: 'var(--slate-400)' }}>{index + 1}</td>
                    <td>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: 'var(--slate-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--slate-200)'
                      }}>
                        {mosque.logo_url ? (
                          <img 
                            src={mosque.logo_url} 
                            alt={mosque.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = 'none'
                              img.parentElement!.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>'
                            }}
                          />
                        ) : (
                          <Image size={20} style={{ color: 'var(--slate-400)' }} />
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{mosque.name}</span>
                    </td>
                    <td>
                      {mosque.city ? (
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          background: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          borderRadius: '100px',
                          fontSize: '0.8125rem',
                          fontWeight: 500
                        }}>
                          <MapPin size={14} />
                          {mosque.city}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.875rem' }}>-</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '250px' }}>
                      {mosque.address ? (
                        <span style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem',
                          color: 'var(--slate-600)',
                          lineHeight: 1.5
                        }}>
                          {mosque.address}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.875rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--slate-500)', fontSize: '0.8125rem' }}>
                        <Calendar size={14} />
                        {formatDate(mosque.created_at)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => window.open(mosque.slug ? `/${mosque.slug}` : `/?mosque_id=${mosque.id}`, '_blank')}
                          style={{
                            padding: '0.5rem',
                            background: 'var(--slate-100)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--slate-600)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dbeafe'
                            e.currentTarget.style.color = '#2563eb'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--slate-100)'
                            e.currentTarget.style.color = 'var(--slate-600)'
                          }}
                          title="Buka Display"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(mosque)}
                          style={{
                            padding: '0.5rem',
                            background: 'var(--slate-100)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--slate-600)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dbeafe'
                            e.currentTarget.style.color = '#2563eb'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--slate-100)'
                            e.currentTarget.style.color = 'var(--slate-600)'
                          }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(mosque.id)}
                          style={{
                            padding: '0.5rem',
                            background: 'var(--slate-100)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--slate-600)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fee2e2'
                            e.currentTarget.style.color = '#dc2626'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--slate-100)'
                            e.currentTarget.style.color = 'var(--slate-600)'
                          }}
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}>
          <div 
            className="admin-card" 
            style={{ 
              width: '100%', 
              maxWidth: '560px',
              maxHeight: 'calc(100vh - 2rem)',
              overflowY: 'auto',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--slate-100)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary-100)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={24} style={{ color: 'var(--primary-600)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    {selectedMosque ? 'Edit Data Masjid' : 'Tambah Masjid Baru'}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                    {selectedMosque ? 'Perbarui informasi masjid' : 'Lengkapi data masjid di bawah ini'}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                style={{ 
                  padding: '0.5rem', 
                  cursor: 'pointer', 
                  background: 'var(--slate-100)', 
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--slate-500)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--slate-200)'
                  e.currentTarget.style.color = 'var(--slate-700)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--slate-100)'
                  e.currentTarget.style.color = 'var(--slate-500)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Logo Upload */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Image size={14} style={{ color: 'var(--slate-400)' }} />
                  Logo Masjid
                </label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Logo Preview */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '12px',
                      border: '2px dashed var(--slate-200)',
                      background: 'var(--slate-50)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary-400)'
                      e.currentTarget.style.background = 'var(--primary-50)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--slate-200)'
                      e.currentTarget.style.background = 'var(--slate-50)'
                    }}
                  >
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <Upload size={24} style={{ color: 'var(--slate-400)', marginBottom: '4px' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Upload</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
                      Klik kotak untuk upload logo masjid
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      Format: JPG, PNG, WebP, GIF<br />
                      Ukuran maksimum: 2MB<br />
                      Rekomendasi: 200x200 px (persegi)
                    </p>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.75rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nama Masjid */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Building2 size={14} style={{ color: 'var(--slate-400)' }} />
                  Nama Masjid
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: Masjid Agung Al-Azhar"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Kota */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} style={{ color: 'var(--slate-400)' }} />
                  Kota / Kabupaten
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Contoh: Jakarta Selatan"
                  style={{ margin: 0 }}
                />
              </div>

              {/* Slug / Display URL */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ChevronRight size={14} style={{ color: 'var(--slate-400)' }} />
                  Slug Display URL
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                  placeholder="Contoh: masjid-agung-alazhar"
                  style={{ margin: 0 }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.375rem' }}>
                  URL Display: /{formData.slug || 'masjid-slug'}
                </p>
              </div>

              {/* Alamat */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ChevronRight size={14} style={{ color: 'var(--slate-400)' }} />
                  Alamat Lengkap
                </label>
                <textarea
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Contoh: Jl. Sisingamangaraja No. 1, Kebayoran Baru"
                  rows={3}
                  style={{ margin: 0, resize: 'none' }}
                />
              </div>

              {/* Form Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid var(--slate-100)',
                marginTop: '0.5rem'
              }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary" disabled={isSubmitting}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid rgba(255,255,255,0.3)', 
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {selectedMosque ? 'Simpan Perubahan' : 'Tambah Masjid'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyframes for animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
