import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Edit, X, Save } from 'lucide-react'
import type { RunningText } from '../../types'

export default function RunningTextManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RunningText | null>(null)

  const { data: texts, isLoading } = useQuery({
    queryKey: ['runningTexts'],
    queryFn: adminService.getRunningTexts,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<RunningText>) => adminService.createRunningText(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTexts'] })
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RunningText> }) =>
      adminService.updateRunningText(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runningTexts'] })
      setEditingItem(null)
      setIsModalOpen(false)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleRunningText(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['runningTexts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteRunningText(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['runningTexts'] }),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      content: formData.get('content') as string,
      type: formData.get('type') as 'normal' | 'urgent' | 'berita_duka',
      priority: parseInt(formData.get('priority') as string) || 0,
    }
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const openModal = (item?: RunningText) => {
    setEditingItem(item || null)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-12">Memuat...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Running Text</h1>
          <p className="text-[var(--text-secondary)]">Kelola teks berjalan</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Tambah
        </button>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Konten</th>
                <th style={{ width: '15%' }}>Tipe</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '20%' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {texts?.map((text) => (
                <tr key={text.id}>
                  <td className="max-w-md">
                    <div style={{ fontWeight: 500, fontSize: '1rem', lineHeight: '1.5' }}>
                      {text.content}
                    </div>
                    {text.priority > 0 && (
                      <span className="text-xs text-[var(--text-secondary)]">Prioritas: {text.priority}</span>
                    )}
                  </td>
                  <td>
                    <span 
                      className={`badge ${
                        text.type === 'normal' ? 'bg-blue-100 text-blue-800' :
                        text.type === 'urgent' ? 'bg-red-100 text-red-800' :
                        'bg-gray-800 text-white'
                      }`}
                      style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}
                    >
                      {text.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleMutation.mutate(text.id)} 
                      className={`btn-sm ${text.is_enabled ? 'btn-success' : 'btn-secondary'}`}
                      style={{ 
                        width: 'auto', 
                        padding: '0.25rem 0.75rem', 
                        display: 'inline-flex', 
                        gap: '0.25rem',
                        fontSize: '0.875rem' 
                      }}
                      title={text.is_enabled ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                    >
                      {text.is_enabled ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(text)} 
                        className="btn-icon btn-secondary"
                        title="Edit"
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(text.id)} 
                        className="btn-icon btn-danger"
                        title="Hapus"
                        style={{ padding: '0.5rem' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {texts?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[var(--text-muted)]">
                    Belum ada running text. Klik "Tambah" untuk membuat baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card w-full max-w-lg mx-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit' : 'Tambah'} Running Text</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Isi Teks</label>
                <textarea name="content" className="form-input" defaultValue={editingItem?.content} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tipe</label>
                  <select name="type" className="form-input" defaultValue={editingItem?.type || 'normal'}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="berita_duka">Berita Duka</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Prioritas</label>
                  <input type="number" name="priority" className="form-input" defaultValue={editingItem?.priority || 0} />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" className="btn btn-primary"><Save className="w-4 h-4" /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
