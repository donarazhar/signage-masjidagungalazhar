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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-up">
            <h2 className="text-xl font-bold mb-4">
              {editingHadith ? 'Edit Hadits' : 'Tambah Hadits Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Isi Kutipan / Hadits</label>
                <textarea
                  name="content"
                  defaultValue={editingHadith?.content}
                  className="form-input min-h-[100px]"
                  placeholder="Contoh: Sebaik-baik manusia adalah..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sumber / Periwayat</label>
                <input
                  type="text"
                  name="source"
                  defaultValue={editingHadith?.source}
                  className="form-input"
                  placeholder="Contoh: HR. Bukhari"
                  required
                />
              </div>

              <div className="form-group flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked={editingHadith?.is_active ?? true}
                  className="w-5 h-5 accent-[var(--primary-600)]"
                />
                <label htmlFor="is_active" className="text-slate-700 font-medium cursor-pointer">
                  Tampilkan di Layar
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn btn-primary flex-1"
                >
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
