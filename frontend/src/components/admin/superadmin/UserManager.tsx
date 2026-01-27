import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, Users, Shield, Building2, Search, Mail, User, Lock } from 'lucide-react'
import { api } from '../../../services/api'
import { toast } from 'react-hot-toast'
import type { User as UserType } from '../../../types'

interface Mosque {
  id: number
  name: string
}

export default function UserManager() {
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin_masjid',
    mosque_id: ''
  })

  useEffect(() => {
    fetchUsers()
    fetchMosques()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.mosque?.name && user.mosque.name.toLowerCase().includes(query))
        )
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
      setFilteredUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat data pengguna')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMosques = async () => {
    try {
      const response = await api.get('/mosques')
      setMosques(response.data)
    } catch (error) {
      console.error('Error fetching mosques for select:', error)
    }
  }

  const closeModal = () => {
    setFormData({ name: '', email: '', password: '', role: 'admin_masjid', mosque_id: '' })
    setSelectedUser(null)
    setIsModalOpen(false)
    setShowPassword(false)
  }

  const handleEdit = (user: UserType) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      mosque_id: user.mosque_id?.toString() || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      mosque_id: formData.role === 'admin_masjid' ? parseInt(formData.mosque_id) : null
    }

    if (formData.password) {
      payload.password = formData.password
    }

    try {
      if (selectedUser) {
        await api.put(`/users/${selectedUser.id}`, payload)
        toast.success('Data pengguna berhasil diperbarui')
      } else {
        if (!formData.password) {
          toast.error('Password wajib diisi untuk pengguna baru')
          return
        }
        await api.post('/users', payload)
        toast.success('Pengguna baru berhasil ditambahkan')
      }
      
      fetchUsers()
      closeModal()
    } catch (error: any) {
      console.error('Error saving user:', error)
      const msg = error.response?.data?.message || 'Gagal menyimpan data pengguna'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah anda yakin ingin menghapus pengguna ini?')) return

    try {
      await api.delete(`/users/${id}`)
      toast.success('Pengguna berhasil dihapus')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Gagal menghapus pengguna')
    }
  }

  // Count stats
  const superadminCount = users.filter(u => u.role === 'superadmin').length
  const adminMasjidCount = users.filter(u => u.role === 'admin_masjid').length

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Manajemen Pengguna</h1>
          <p>Kelola akun dan hak akses pengguna sistem</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setFormData({ name: '', email: '', password: '', role: 'admin_masjid', mosque_id: '' }); setIsModalOpen(true); }} 
          className="btn btn-primary"
        >
          <Plus size={20} />
          Tambah Pengguna
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="icon green">
            <Users size={24} />
          </div>
          <div className="info">
            <div className="value">{users.length}</div>
            <div className="label">Total Pengguna</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon purple">
            <Shield size={24} />
          </div>
          <div className="info">
            <div className="value">{superadminCount}</div>
            <div className="label">Super Admin</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon blue">
            <Building2 size={24} />
          </div>
          <div className="info">
            <div className="value">{adminMasjidCount}</div>
            <div className="label">Admin Masjid</div>
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
              placeholder="Cari nama, email, atau masjid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '42px', margin: 0 }}
            />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--slate-500)' }}>
            Menampilkan <strong style={{ color: 'var(--slate-700)' }}>{filteredUsers.length}</strong> dari <strong style={{ color: 'var(--slate-700)' }}>{users.length}</strong> pengguna
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
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th>Role</th>
                <th>Masjid</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '3px solid var(--primary-100)', 
                        borderTopColor: 'var(--primary-500)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span style={{ color: 'var(--slate-500)' }}>Memuat data pengguna...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
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
                        <Users size={28} style={{ color: 'var(--slate-400)' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.25rem' }}>
                          {searchQuery ? 'Tidak ditemukan' : 'Belum ada data pengguna'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                          {searchQuery 
                            ? `Tidak ada pengguna yang cocok dengan "${searchQuery}"`
                            : 'Klik tombol "Tambah Pengguna" untuk menambahkan data'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500, color: 'var(--slate-400)' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: user.role === 'superadmin' ? '#ede9fe' : 'var(--primary-100)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {user.role === 'superadmin' 
                            ? <Shield size={18} style={{ color: '#7c3aed' }} />
                            : <User size={18} style={{ color: 'var(--primary-600)' }} />
                          }
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--slate-600)', fontSize: '0.875rem' }}>
                        <Mail size={14} style={{ color: 'var(--slate-400)' }} />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.375rem',
                        padding: '0.375rem 0.75rem',
                        background: user.role === 'superadmin' ? '#ede9fe' : '#dbeafe',
                        color: user.role === 'superadmin' ? '#7c3aed' : '#2563eb',
                        borderRadius: '100px',
                        fontSize: '0.8125rem',
                        fontWeight: 600
                      }}>
                        {user.role === 'superadmin' ? <Shield size={14} /> : <User size={14} />}
                        {user.role === 'superadmin' ? 'Super Admin' : 'Admin Masjid'}
                      </span>
                    </td>
                    <td>
                      {user.role === 'superadmin' ? (
                        <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.875rem' }}>-</span>
                      ) : user.mosque?.name ? (
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
                          <Building2 size={14} />
                          {user.mosque.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-400)', fontStyle: 'italic', fontSize: '0.875rem' }}>Belum dipilih</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(user)}
                          disabled={user.email === 'superadmin@example.com'}
                          style={{
                            padding: '0.5rem',
                            background: 'var(--slate-100)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--slate-600)',
                            cursor: user.email === 'superadmin@example.com' ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: user.email === 'superadmin@example.com' ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (user.email !== 'superadmin@example.com') {
                              e.currentTarget.style.background = '#dbeafe'
                              e.currentTarget.style.color = '#2563eb'
                            }
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
                          onClick={() => handleDelete(user.id)}
                          disabled={user.email === 'superadmin@example.com'}
                          style={{
                            padding: '0.5rem',
                            background: 'var(--slate-100)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'var(--slate-600)',
                            cursor: user.email === 'superadmin@example.com' ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: user.email === 'superadmin@example.com' ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (user.email !== 'superadmin@example.com') {
                              e.currentTarget.style.background = '#fee2e2'
                              e.currentTarget.style.color = '#dc2626'
                            }
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
                  <Users size={24} style={{ color: 'var(--primary-600)' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                    {selectedUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                    {selectedUser ? 'Perbarui informasi pengguna' : 'Lengkapi data pengguna di bawah ini'}
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
              {/* Row 1: Name & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <User size={14} style={{ color: 'var(--slate-400)' }} />
                    Nama Lengkap
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                    style={{ margin: 0 }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Mail size={14} style={{ color: 'var(--slate-400)' }} />
                    Email
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com"
                    style={{ margin: 0 }}
                  />
                </div>
              </div>

              {/* Row 2: Password & Role */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Lock size={14} style={{ color: 'var(--slate-400)' }} />
                    Password
                    {!selectedUser && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder={selectedUser ? "Kosongkan jika tidak diubah" : "Masukkan password"}
                      style={{ margin: 0, paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--slate-400)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Shield size={14} style={{ color: 'var(--slate-400)' }} />
                    Peran (Role)
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    style={{ margin: 0 }}
                  >
                    <option value="admin_masjid">Admin Masjid</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Masjid Selection (Conditional) */}
              {formData.role === 'admin_masjid' && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Building2 size={14} style={{ color: 'var(--slate-400)' }} />
                    Masjid
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    required={formData.role === 'admin_masjid'}
                    className="form-input"
                    value={formData.mosque_id}
                    onChange={(e) => setFormData({...formData, mosque_id: e.target.value})}
                    style={{ margin: 0 }}
                  >
                    <option value="">Pilih Masjid...</option>
                    {mosques.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {mosques.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem' }}>
                      ⚠️ Belum ada masjid terdaftar. Silakan tambahkan masjid terlebih dahulu.
                    </p>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid var(--slate-100)',
                marginTop: '0.5rem'
              }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} />
                  {selectedUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
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
