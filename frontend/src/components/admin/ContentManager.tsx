import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Eye, EyeOff, Upload, X, Image, Youtube, Edit } from 'lucide-react'
import type { Content } from '../../types'

export default function ContentManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [contentType, setContentType] = useState<'image' | 'youtube' | 'video'>('image')
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data: contents, isLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: adminService.getContents,
  })

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => adminService.uploadContent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Content> }) => 
      adminService.updateContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contents'] })
      closeModal()
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

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingContent(null)
    setUploadProgress(0)
    setContentType('image')
  }

  const handleEdit = (content: Content) => {
    setEditingContent(content)
    setContentType(content.type)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // For update, we handle fields manually to allow partial updates
    if (editingContent) {
      const updates: Partial<Content> = {
        title: formData.get('title') as string,
        duration: parseInt(formData.get('duration') as string),
        priority: parseInt(formData.get('priority') as string),
        type: contentType,
      }

      if (contentType === 'youtube') {
        updates.youtube_url = formData.get('youtube_url') as string
      }
      
      // Note: File update is not supported in simple edit mode yet 
      // (would need separate upload or multipart PUT)
      
      try {
        await updateMutation.mutateAsync({ id: editingContent.id, data: updates })
      } catch (error) {
        console.error('Update failed:', error)
      }
    } else {
      // Create mode
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
        <button onClick={() => { setEditingContent(null); setIsModalOpen(true); }} className="btn btn-primary">
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
          <button onClick={() => { setEditingContent(null); setIsModalOpen(true); }} className="btn btn-primary">
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
              onEdit={() => handleEdit(content)}
            />
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: '1rem'
        }}>
          <div className="admin-card" style={{ 
            width: '100%', 
            maxWidth: '500px',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editingContent ? 'Edit Konten' : 'Tambah Konten Baru'}
              </h2>
              <button onClick={closeModal} style={{ padding: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>
            </div>

            {/* Content Type Selector - Disabled in Edit Mode if existing type */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setContentType('image')}
                disabled={!!editingContent}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '12px', cursor: editingContent ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: contentType === 'image' ? 'var(--primary-100)' : 'var(--slate-50)',
                  border: `2px solid ${contentType === 'image' ? 'var(--primary-500)' : 'var(--slate-200)'}`,
                  color: contentType === 'image' ? 'var(--primary-700)' : 'var(--slate-600)',
                  opacity: editingContent && contentType !== 'image' ? 0.5 : 1
                }}
              >
                <Image size={28} />
                <span style={{ fontWeight: 600 }}>Gambar</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Upload dari komputer</span>
              </button>
              <button
                type="button"
                onClick={() => setContentType('youtube')}
                disabled={!!editingContent}
                style={{
                  flex: 1, padding: '1rem', borderRadius: '12px', cursor: editingContent ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: contentType === 'youtube' ? '#fee2e2' : 'var(--slate-50)',
                  border: `2px solid ${contentType === 'youtube' ? '#ef4444' : 'var(--slate-200)'}`,
                  color: contentType === 'youtube' ? '#b91c1c' : 'var(--slate-600)',
                  opacity: editingContent && contentType !== 'youtube' ? 0.5 : 1
                }}
              >
                <Youtube size={28} />
                <span style={{ fontWeight: 600 }}>YouTube</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Link dari YouTube</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Judul</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-input" 
                  placeholder="Nama konten" 
                  defaultValue={editingContent?.title}
                  required 
                />
              </div>

              {contentType === 'image' ? (
                <div className="form-group">
                  <label className="form-label">File Gambar {editingContent && '(Biarkan kosong jika tidak diubah)'}</label>
                  {!editingContent && (
                    <input
                      type="file"
                      name="file"
                      accept="image/*"
                      className="form-input"
                      required={!editingContent}
                    />
                  )}
                  {editingContent && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', fontStyle: 'italic' }}>
                      File saat ini: {editingContent.file_path}
                      <br/>
                      <span className="text-xs text-orange-500">*Edit file gambar belum didukung. Hapus dan buat baru jika ingin mengganti gambar.</span>
                    </div>
                  )}
                  {!editingContent && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                      Format: JPG, PNG, WebP, GIF (Maks 10MB)
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">URL YouTube</label>
                  <input
                    type="url"
                    name="youtube_url"
                    className="form-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    defaultValue={editingContent?.youtube_url || ''}
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
                  defaultValue={editingContent?.duration || (contentType === 'youtube' ? 60 : 10)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prioritas</label>
                <input 
                  type="number" 
                  name="priority" 
                  min="0" 
                  max="100" 
                  defaultValue={editingContent?.priority || 0} 
                  className="form-input" 
                />
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
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadMutation.isPending || updateMutation.isPending}>
                  {uploadMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
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
  onEdit: () => void
}

function ContentCard({ content, onToggle, onDelete, onEdit }: ContentCardProps) {
  const getThumbnail = () => {
    if (content.type === 'youtube' && content.youtube_thumbnail) {
      // Use hqdefault (480x360) instead of maxresdefault (which might 404)
      return content.youtube_thumbnail.replace('maxresdefault', 'hqdefault')
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
            const img = e.target as HTMLImageElement
            // Try HQ default if Max Res fails
            if (img.src.includes('maxresdefault')) {
              img.src = img.src.replace('maxresdefault.jpg', 'hqdefault.jpg')
            } else {
              // If even HQ fails, fallback to logo
              img.src = '/logo-alazhar.png'
            }
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
        <button onClick={onEdit} className="btn btn-secondary">
          <Edit size={18} />
        </button>
        <button onClick={onDelete} className="btn btn-danger">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
