import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Save, X } from 'lucide-react'
import type { Financial } from '../../types'

export default function FinancialManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: financials, isLoading } = useQuery({
    queryKey: ['financials'],
    queryFn: () => adminService.getFinancials(),
  })

  const { data: summary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: adminService.getFinancialSummary,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Financial>) => adminService.createFinancial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
      setIsModalOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteFinancial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financials'] })
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    createMutation.mutate({
      record_date: formData.get('record_date') as string,
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as 'infaq' | 'zakat' | 'sedekah' | 'lainnya',
      description: formData.get('description') as string,
    })
  }

  if (isLoading) return <div className="text-center py-12">Memuat...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Keuangan</h1>
          <p className="text-[var(--text-secondary)]">Kelola data infaq dan keuangan</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" /> Tambah
        </button>
      </div>

      {/* Summary Card */}
      <div className="admin-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Ringkasan</h2>
        <div className="text-3xl font-bold text-[var(--accent-gold)]">
          Rp {(summary?.saldo_kas || 0).toLocaleString('id-ID')}
        </div>
        <p className="text-sm text-[var(--text-muted)]">Total Saldo Kas</p>
      </div>

      {/* Records Table */}
      <div className="admin-card">
        <table className="table">
          <thead>
            <tr><th>Tanggal</th><th>Tipe</th><th>Jumlah</th><th>Keterangan</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {financials?.map((f) => (
              <tr key={f.id}>
                <td>{new Date(f.record_date).toLocaleDateString('id-ID')}</td>
                <td><span className="badge badge-success">{f.type}</span></td>
                <td className="font-semibold">Rp {f.amount.toLocaleString('id-ID')}</td>
                <td>{f.description || '-'}</td>
                <td>
                  <button onClick={() => deleteMutation.mutate(f.id)} className="p-2 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card w-full max-w-md mx-4">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Tambah Data Keuangan</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Tanggal</label>
                <input type="date" name="record_date" className="form-input" required 
                  defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="form-label">Tipe</label>
                <select name="type" className="form-input">
                  <option value="infaq">Infaq</option>
                  <option value="zakat">Zakat</option>
                  <option value="sedekah">Sedekah</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="form-label">Jumlah (Rp)</label>
                <input type="number" name="amount" className="form-input" required min="0" />
              </div>
              <div>
                <label className="form-label">Keterangan (opsional)</label>
                <input type="text" name="description" className="form-input" />
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
