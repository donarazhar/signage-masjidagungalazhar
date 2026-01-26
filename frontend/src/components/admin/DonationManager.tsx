import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Edit, X, Save, CreditCard, QrCode, Upload } from 'lucide-react'
import type { Donation } from '../../types'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

export default function DonationManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Donation | null>(null)
  const [activeTab, setActiveTab] = useState<'rekening' | 'qris'>('rekening')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: donations, isLoading } = useQuery({
    queryKey: ['donations'],
    queryFn: adminService.getDonations,
  })

  const createMutation = useMutation({
    mutationFn: (data: FormData) => adminService.createDonation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      toast.success('Donasi berhasil ditambahkan')
      closeModal()
    },
    onError: () => toast.error('Gagal menambahkan donasi'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) =>
      adminService.updateDonation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      toast.success('Donasi berhasil diperbarui')
      closeModal()
    },
    onError: () => toast.error('Gagal memperbarui donasi'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleDonation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      toast.success('Status berhasil diubah')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteDonation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      toast.success('Donasi berhasil dihapus')
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setPreviewImage(null)
    setActiveTab('rekening')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    formData.set('type', activeTab)
    
    if (activeTab === 'rekening') {
      formData.delete('qris_image')
    }

    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data: formData })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviewImage(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const openModal = (item?: Donation) => {
    setEditingItem(item || null)
    if (item) {
      setActiveTab(item.type)
      if (item.qris_image) {
        setPreviewImage(`${API_URL}/storage/${item.qris_image}`)
      }
    } else {
      setActiveTab('rekening')
      setPreviewImage(null)
    }
    setIsModalOpen(true)
  }

  // Separate donations by type
  const rekeningDonations = donations?.filter(d => d.type === 'rekening') || []
  const qrisDonations = donations?.filter(d => d.type === 'qris') || []

  if (isLoading) {
    return <div className="text-center py-12">Memuat...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kelola Donasi</h1>
          <p className="text-[var(--text-secondary)]">Rekening Bank & QRIS untuk donasi masjid</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Tambah Donasi
        </button>
      </div>

      {/* Rekening Section */}
      <div className="admin-card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={20} className="text-[var(--primary-600)]" />
          <h2 className="text-lg font-semibold">Rekening Bank</h2>
          <span className="text-sm text-slate-500">({rekeningDonations.length})</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Bank</th>
                <th>Nomor Rekening</th>
                <th>Atas Nama</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rekeningDonations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {item.bank_name?.substring(0, 2).toUpperCase() || 'BK'}
                      </div>
                      <div className="font-semibold">{item.bank_name}</div>
                    </div>
                  </td>
                  <td className="font-mono text-lg">{item.account_number}</td>
                  <td>{item.account_name}</td>
                  <td>
                    <button 
                      onClick={() => toggleMutation.mutate(item.id)} 
                      className={`btn-sm ${item.is_active ? 'btn-success' : 'btn-secondary'}`}
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(item)} className="btn-icon btn-secondary" title="Edit" style={{ padding: '0.5rem' }}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(item.id)} className="btn-icon btn-danger" title="Hapus" style={{ padding: '0.5rem' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rekeningDonations.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">
                    Belum ada rekening bank
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QRIS Section */}
      <div className="admin-card">
        <div className="flex items-center gap-2 mb-4">
          <QrCode size={20} className="text-[var(--primary-600)]" />
          <h2 className="text-lg font-semibold">QRIS</h2>
          <span className="text-sm text-slate-500">({qrisDonations.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrisDonations.map((item) => (
            <div key={item.id} className="border rounded-xl p-4 relative group" style={{ background: '#f8fafc' }}>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {item.is_active ? 'Aktif' : 'Nonaktif'}
              </div>
              {item.qris_image && (
                <img 
                  src={`${API_URL}/storage/${item.qris_image}`} 
                  alt="QRIS" 
                  className="w-full rounded-lg mb-3"
                  style={{ maxHeight: '200px', objectFit: 'contain', background: 'white' }}
                />
              )}
              <div className="flex gap-2 justify-center mt-3">
                <button onClick={() => toggleMutation.mutate(item.id)} className="btn btn-sm btn-secondary">
                  {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => openModal(item)} className="btn btn-sm btn-secondary">
                  <Edit size={16} />
                </button>
                <button onClick={() => deleteMutation.mutate(item.id)} className="btn btn-sm btn-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {qrisDonations.length === 0 && (
            <div className="col-span-full text-center py-8 text-[var(--text-muted)]">
              <QrCode size={48} className="mx-auto mb-2 opacity-20" />
              <p>Belum ada QRIS yang ditambahkan</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem 1.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {editingItem ? 'Edit Donasi' : 'Tambah Donasi Baru'}
                </h2>
                <button onClick={closeModal} style={{ padding: '0.5rem', borderRadius: '8px', background: '#f1f5f9' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('rekening')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: activeTab === 'rekening' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#f1f5f9',
                    color: activeTab === 'rekening' ? 'white' : '#64748b'
                  }}
                >
                  <CreditCard size={18} /> Rekening
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qris')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: activeTab === 'qris' ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#f1f5f9',
                    color: activeTab === 'qris' ? 'white' : '#64748b'
                  }}
                >
                  <QrCode size={18} /> QRIS
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem' }}>
              {activeTab === 'rekening' ? (
                <>
                  {/* Rekening Form */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      Nama Bank
                    </label>
                    <input 
                      type="text" 
                      name="bank_name" 
                      placeholder="Contoh: Bank BSI"
                      defaultValue={editingItem?.bank_name || ''} 
                      required={activeTab === 'rekening'}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      Nomor Rekening
                    </label>
                    <input 
                      type="text" 
                      name="account_number" 
                      placeholder="1234567890"
                      defaultValue={editingItem?.account_number || ''} 
                      required={activeTab === 'rekening'}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontFamily: 'monospace',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      Atas Nama
                    </label>
                    <input 
                      type="text" 
                      name="account_name" 
                      placeholder="Contoh: DKM Masjid Al Azhar"
                      defaultValue={editingItem?.account_name || ''} 
                      required={activeTab === 'rekening'}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* QRIS Form */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                      Upload Gambar QRIS
                    </label>
                    <input 
                      type="file"
                      name="qris_image"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#f8fafc',
                        transition: 'all 0.2s'
                      }}
                    >
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '8px' }}
                        />
                      ) : (
                        <>
                          <Upload size={40} style={{ color: '#94a3b8', margin: '0 auto 0.5rem' }} />
                          <p style={{ color: '#64748b', fontWeight: 500 }}>Klik untuk upload gambar QRIS</p>
                          <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>PNG, JPG, WEBP (Max 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Priority */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Prioritas (opsional)
                </label>
                <input 
                  type="number" 
                  name="priority" 
                  defaultValue={editingItem?.priority || 0}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Nilai lebih tinggi = ditampilkan lebih dulu
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Save size={18} />
                  {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
