import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Edit, X, Save, CreditCard } from 'lucide-react'
import type { Donation } from '../../types'

export default function DonationManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Donation | null>(null)

  const { data: donations, isLoading } = useQuery({
    queryKey: ['donations'],
    queryFn: adminService.getDonations,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Donation>) => adminService.createDonation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Donation> }) =>
      adminService.updateDonation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] })
      setEditingItem(null)
      setIsModalOpen(false)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleDonation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donations'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteDonation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['donations'] }),
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      bank_name: formData.get('bank_name') as string,
      account_number: formData.get('account_number') as string,
      account_name: formData.get('account_name') as string,
      priority: parseInt(formData.get('priority') as string) || 0,
    }
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const openModal = (item?: Donation) => {
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Rekening Donasi</h1>
          <p className="text-[var(--text-secondary)]">Kelola daftar rekening bank untuk donasi</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Tambah Rekening
        </button>
      </div>

      <div className="admin-card">
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
              {donations?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {item.bank_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{item.bank_name}</div>
                        {item.priority > 0 && (
                          <span className="text-xs text-[var(--text-secondary)]">Prioritas: {item.priority}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-lg">{item.account_number}</td>
                  <td>{item.account_name}</td>
                  <td>
                    <button 
                      onClick={() => toggleMutation.mutate(item.id)} 
                      className={`btn-sm ${item.is_active ? 'btn-success' : 'btn-secondary'}`}
                      style={{ 
                        width: 'auto', 
                        padding: '0.25rem 0.75rem', 
                        display: 'inline-flex', 
                        gap: '0.25rem',
                        fontSize: '0.875rem' 
                      }}
                      title={item.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(item)} 
                        className="btn-icon btn-secondary"
                        title="Edit"
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(item.id)} 
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
              {donations?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">
                    Belum ada rekening donasi. Klik "Tambah Rekening" untuk membuat baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card w-full max-w-lg mx-4" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit' : 'Tambah'} Rekening</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Nama Bank</label>
                  <input 
                    type="text" 
                    name="bank_name" 
                    className="form-input" 
                    placeholder="Contoh: Bank BSI"
                    defaultValue={editingItem?.bank_name} 
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">Prioritas</label>
                  <input 
                    type="number" 
                    name="priority" 
                    className="form-input" 
                    defaultValue={editingItem?.priority || 0} 
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Nomor Rekening</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    name="account_number" 
                    className="form-input pl-10 font-mono" 
                    placeholder="1234xxxxxx"
                    defaultValue={editingItem?.account_number} 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Atas Nama</label>
                <input 
                  type="text" 
                  name="account_name" 
                  className="form-input" 
                  placeholder="Contoh: DKM Masjid Al Azhar"
                  defaultValue={editingItem?.account_name} 
                  required 
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
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
