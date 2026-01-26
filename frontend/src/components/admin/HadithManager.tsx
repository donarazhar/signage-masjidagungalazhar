import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Quote } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Hadith } from '../../types'

export default function HadithManager() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHadith, setEditingHadith] = useState<Hadith | null>(null)
  
  const queryClient = useQueryClient()

  // Queries
  const { data: hadiths } = useQuery({
    queryKey: ['hadiths'],
    queryFn: adminService.getHadiths,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createHadith,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hadiths'] })
      queryClient.invalidateQueries({ queryKey: ['activeHadith'] })
      toast.success('Hadits berhasil ditambahkan')
      setIsModalOpen(false)
    },
    onError: () => toast.error('Gagal menambah hadits'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Hadith> }) =>
      adminService.updateHadith(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hadiths'] })
      queryClient.invalidateQueries({ queryKey: ['activeHadith'] })
      toast.success('Hadits berhasil diperbarui')
      setIsModalOpen(false)
      setEditingHadith(null)
    },
    onError: () => toast.error('Gagal memperbarui hadits'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteHadith,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hadiths'] })
      queryClient.invalidateQueries({ queryKey: ['activeHadith'] })
      toast.success('Hadits berhasil dihapus')
    },
    onError: () => toast.error('Gagal menghapus hadits'),
  })

  const toggleMutation = useMutation({
    mutationFn: adminService.toggleHadith,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hadiths'] })
      queryClient.invalidateQueries({ queryKey: ['activeHadith'] })
      toast.success('Status hadits diperbarui')
    },
    onError: () => toast.error('Gagal memperbarui status'),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      content: formData.get('content') as string,
      source: formData.get('source') as string,
      is_active: formData.get('is_active') === 'on',
    }

    if (editingHadith) {
      updateMutation.mutate({ id: editingHadith.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus hadits ini?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="admin-header flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Hadits</h1>
          <p className="text-slate-500 mt-1">Kelola kutipan hadits/mutiara kata yang tampil di layar</p>
        </div>
        <button
          onClick={() => {
            setEditingHadith(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Tambah Hadits
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hadiths?.map((hadith) => (
          <div key={hadith.id} className="admin-card relative group">
            <div className={`absolute top-0 right-0 p-2 rounded-bl-xl ${hadith.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {hadith.is_active ? 'Aktif' : 'Nonaktif'}
            </div>
            
            <div className="mb-4">
              <Quote size={32} className="text-[var(--primary-200)] mb-3" />
              <p className="text-slate-700 italic font-medium mb-3 line-clamp-4">"{hadith.content}"</p>
              <p className="text-[var(--primary-600)] text-sm font-bold">— {hadith.source}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-auto flex justify-end gap-2">
               <button
                onClick={() => toggleMutation.mutate(hadith.id)}
                className={`p-2 rounded-lg transition-colors ${
                  hadith.is_active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'
                }`}
                title={hadith.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              >
                {hadith.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              </button>
              <button
                onClick={() => {
                  setEditingHadith(hadith)
                  setIsModalOpen(true)
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(hadith.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        
        {hadiths?.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Quote size={48} className="mx-auto mb-4 opacity-20" />
            <p>Belum ada hadits yang ditambahkan</p>
          </div>
        )}
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
            <div style={{
              padding: '1.5rem 1.5rem 0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Quote size={28} style={{ color: '#16a34a' }} />
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '0.5rem'
              }}>
                {editingHadith ? 'Edit Hadits' : 'Tambah Hadits Baru'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {editingHadith ? 'Perbarui isi kutipan hadits' : 'Masukkan kutipan hadits atau mutiara kata islami'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {/* Content Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.5rem'
                }}>
                  📜 Isi Kutipan / Hadits
                </label>
                <textarea
                  name="content"
                  defaultValue={editingHadith?.content}
                  placeholder="Contoh: Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya."
                  required
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.875rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    transition: 'all 0.2s',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Tulis kutipan hadits tanpa tanda kutip, akan ditambahkan otomatis
                </p>
              </div>

              {/* Source Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.5rem'
                }}>
                  📖 Sumber / Periwayat
                </label>
                <input
                  type="text"
                  name="source"
                  defaultValue={editingHadith?.source}
                  placeholder="Contoh: HR. Bukhari, HR. Muslim, dsb."
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Active Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={editingHadith?.is_active ?? true}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: '#16a34a',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="is_active" style={{
                  color: '#334155',
                  fontWeight: 500,
                  cursor: 'pointer',
                  flex: 1
                }}>
                  Tampilkan di Layar Display
                </label>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: '#dcfce7',
                  color: '#16a34a',
                  borderRadius: '6px',
                  fontWeight: 600
                }}>
                  Direkomendasikan
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.875rem 1rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '0.875rem 1rem',
                    background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: createMutation.isPending || updateMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: createMutation.isPending || updateMutation.isPending ? 0.7 : 1,
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !createMutation.isPending && !updateMutation.isPending && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {createMutation.isPending || updateMutation.isPending ? '⏳ Menyimpan...' : '✅ Simpan Hadits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
