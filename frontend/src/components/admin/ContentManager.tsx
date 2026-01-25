import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Eye, EyeOff, Upload, X, Image, Youtube } from 'lucide-react'
import type { Content } from '../../types'

export default function ContentManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [contentType, setContentType] = useState<'image' | 'youtube'>('image')
  const [uploadProgress, setUploadProgress] = useState(0)

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
      setContentType('image')
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
    formData.append('content_type', contentType)
    
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
    <div className="animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Kelola Konten</h1>
          <p>Upload gambar atau tambahkan video YouTube untuk ditampilkan</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={20} />
          Tambah Konten
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}>
          <div style={{ color: 'var(--slate-500)' }}>Memuat konten...</div>
        </div>
      ) : contents?.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🖼️</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Belum Ada Konten</h3>
          <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
            Upload gambar atau tambahkan video YouTube
          </p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <Upload size={20} />
            Upload Konten Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: '1rem'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tambah Konten Baru</h2>
              <button onClick={() => { setIsModalOpen(false); setContentType('image') }} style={{ padding: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>
            </div>

            {/* Content Type Selector */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setContentType('image')}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: contentType === 'image' ? 'var(--primary-100)' : 'var(--slate-50)',
                  border: `2px solid ${contentType === 'image' ? 'var(--primary-500)' : 'var(--slate-200)'}`,
                  color: contentType === 'image' ? 'var(--primary-700)' : 'var(--slate-600)',
                }}
              >
                <Image size={28} />
                <span style={{ fontWeight: 600 }}>Gambar</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Upload dari komputer</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('youtube')}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: contentType === 'youtube' ? '#fee2e2' : 'var(--slate-50)',
                  border: `2px solid ${contentType === 'youtube' ? '#ef4444' : 'var(--slate-200)'}`,
                  color: contentType === 'youtube' ? '#b91c1c' : 'var(--slate-600)',
                }}
              >
                <Youtube size={28} />
                <span style={{ fontWeight: 600 }}>YouTube</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Link dari YouTube</span>
              </button>
            </div>

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Judul</label>
                <input type="text" name="title" className="form-input" placeholder="Nama konten" required />
              </div>

              {contentType === 'image' ? (
                <div className="form-group">
                  <label className="form-label">File Gambar</label>
                  <input
                    type="file"
                    name="file"
                    accept="image/*"
                    className="form-input"
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    Format: JPG, PNG, WebP, GIF (Maks 10MB)
                  </p>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">URL YouTube</label>
                  <input
                    type="url"
                    name="youtube_url"
                    className="form-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    Contoh: https://www.youtube.com/watch?v=ABC123 atau https://youtu.be/ABC123
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Durasi Tampil (detik)</label>
                <input
                  type="number"
                  name="duration"
                  min="5"
                  max="300"
                  defaultValue={contentType === 'youtube' ? 60 : 10}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <input type="number" name="priority" min="0" max="100" defaultValue="0" className="form-input" />
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Semakin tinggi, semakin awal ditampilkan
                </p>
              </div>

              {uploadProgress > 0 && (
                <div style={{ width: '100%', background: 'var(--slate-100)', borderRadius: '100px', height: '8px' }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      background: 'var(--primary-500)',
                      height: '100%',
                      borderRadius: '100px',
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setIsModalOpen(false); setContentType('image') }} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Menyimpan...' : 'Simpan'}
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
  const getThumbnail = () => {
    if (content.type === 'youtube' && content.youtube_thumbnail) {
      return content.youtube_thumbnail
    }
    return content.file_url || `/storage/${content.file_path}`
  }

  const getTypeLabel = () => {
    switch (content.type) {
      case 'youtube': return '🎬 YouTube'
      case 'image': return '🖼️ Gambar'
      default: return content.type
    }
  }

  return (
    <div className="admin-card">
      <div style={{
        aspectRatio: '16/9',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--slate-100)',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <img
          src={getThumbnail()}
          alt={content.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo-alazhar.png'
          }}
        />
        {content.type === 'youtube' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '60px', height: '60px',
              background: 'rgba(255,0,0,0.9)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Youtube size={32} color="white" />
            </div>
          </div>
        )}
      </div>

      <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{content.title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1rem' }}>
        {getTypeLabel()} • {content.duration}s • Prioritas: {content.priority}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={onToggle}
          className={`btn ${content.is_enabled ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          {content.is_enabled ? <Eye size={18} /> : <EyeOff size={18} />}
          {content.is_enabled ? 'Aktif' : 'Nonaktif'}
        </button>
        <button onClick={onDelete} className="btn btn-danger">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
