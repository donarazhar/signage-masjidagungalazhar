import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import type { Content } from '../../types'

export default function ContentManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: contents, isLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: adminService.getContents,
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => adminService.uploadContent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      setIsModalOpen(false)
      setUploadProgress(0)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleContent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contents'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteContent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contents'] }),
  })

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    setUploadProgress(10)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    try {
      await uploadMutation.mutateAsync(formData)
      setUploadProgress(100)
    } finally {
      clearInterval(progressInterval)
    }
  }

  const handleDelete = (content: Content) => {
    if (confirm(`Hapus "${content.title}"?`)) {
      deleteMutation.mutate(content.id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Kelola Konten</h1>
          <p className="text-[var(--text-secondary)]">
            Upload dan kelola poster, gambar, dan video untuk ditampilkan
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus className="w-5 h-5" />
          Tambah Konten
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--text-secondary)]">Memuat konten...</div>
        </div>
      ) : contents?.length === 0 ? (
        <div className="admin-card text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Belum Ada Konten
          </h3>
          <p className="text-[var(--text-secondary)] mb-4">
            Upload poster atau video untuk ditampilkan di layar signage
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Upload className="w-5 h-5" />
            Upload Konten Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents?.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onToggle={() => toggleMutation.mutate(content.id)}
              onDelete={() => handleDelete(content)}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="admin-card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Upload Konten Baru
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="form-label">Judul</label>
                <input type="text" name="title" className="form-input" required />
              </div>

              <div>
                <label className="form-label">File (Gambar/Video)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  name="file"
                  accept="image/*,video/*"
                  className="form-input"
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Format: JPG, PNG, WebP, MP4, WebM (Maks 50MB)
                </p>
              </div>

              <div>
                <label className="form-label">Durasi Tampil (detik)</label>
                <input
                  type="number"
                  name="duration"
                  min="5"
                  max="300"
                  defaultValue="10"
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Prioritas</label>
                <input
                  type="number"
                  name="priority"
                  min="0"
                  max="100"
                  defaultValue="0"
                  className="form-input"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Semakin tinggi prioritas, semakin awal ditampilkan
                </p>
              </div>

              {uploadProgress > 0 && (
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-2">
                  <div
                    className="bg-[var(--accent-blue)] h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Mengupload...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

interface ContentCardProps {
  content: Content
  onToggle: () => void
  onDelete: () => void
}

function ContentCard({ content, onToggle, onDelete }: ContentCardProps) {
  return (
    <div className="admin-card">
      <div className="aspect-video rounded-lg overflow-hidden bg-[var(--bg-primary)] mb-4">
        {content.type === 'image' ? (
          <img
            src={content.file_url || `/storage/${content.file_path}`}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={content.file_url || `/storage/${content.file_path}`}
            className="w-full h-full object-cover"
            muted
          />
        )}
      </div>

      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{content.title}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-3">
        {content.type} • {content.duration}s • Prioritas: {content.priority}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`btn flex-1 ${content.is_enabled ? 'btn-success' : 'btn-secondary'}`}
        >
          {content.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {content.is_enabled ? 'Aktif' : 'Nonaktif'}
        </button>
        <button onClick={onDelete} className="btn btn-danger">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
