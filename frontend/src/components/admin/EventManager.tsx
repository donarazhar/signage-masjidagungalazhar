import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/adminService'
import { Plus, Trash2, Eye, EyeOff, X, Calendar, MapPin, Clock } from 'lucide-react'
import type { Event } from '../../types'

export default function EventManager() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: adminService.getEvents,
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Event>) => adminService.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setIsModalOpen(false)
      setEditingEvent(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Event> }) => adminService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setIsModalOpen(false)
      setEditingEvent(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => adminService.toggleEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Parse time to HH:MM format if needed
    let time = formData.get('event_time') as string
    if (time && time.length > 5) {
      time = time.substring(0, 5)
    }

    const data: Partial<Event> = {
      title: formData.get('title') as string,
      event_date: formData.get('event_date') as string,
      event_time: time || null,
      description: (formData.get('description') as string) || null,
      location: (formData.get('location') as string) || null,
    }

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = (event: Event) => {
    if (confirm(`Hapus kegiatan "${event.title}"?`)) {
      deleteMutation.mutate(event.id)
    }
  }

  const openModal = (event?: Event) => {
    setEditingEvent(event || null)
    setIsModalOpen(true)
  }

  return (
    <div className="animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Jadwal Kegiatan</h1>
          <p>Kelola agenda kegiatan masjid yang akan ditampilkan</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={20} />
          Tambah Kegiatan
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem', color: 'var(--slate-500)' }}>
          Memuat data...
        </div>
      ) : events?.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--slate-300)', display: 'flex', justifyContent: 'center' }}>
            <Calendar size={64} strokeWidth={1} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Belum Ada Kegiatan</h3>
          <p style={{ color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
            Tambahkan jadwal kegiatan masjid untuk ditampilkan di layar
          </p>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={20} />
            Tambah Kegiatan Pertama
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events?.map((event) => (
            <div key={event.id} className="admin-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                background: 'var(--primary-50)', 
                borderRadius: '12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--primary-100)',
                flexShrink: 0
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600)', lineHeight: 1 }}>
                  {new Date(event.event_date).getDate()}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                  {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short' })}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>{event.title}</h3>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--slate-500)', flexWrap: 'wrap' }}>
                  {event.event_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      {event.event_time.substring(0, 5)} WIB
                    </div>
                  )}
                  {event.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                </div>
                {event.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => toggleMutation.mutate(event.id)}
                  className={`btn ${event.is_enabled ? 'btn-success' : 'btn-secondary'}`}
                  title={event.is_enabled ? 'Nonaktifkan' : 'Aktifkan'}
                  style={{ padding: '0.5rem' }}
                >
                  {event.is_enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button 
                  onClick={() => openModal(event)} 
                  className="btn btn-secondary"
                  title="Edit"
                  style={{ padding: '0.5rem' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(event)} 
                  className="btn btn-danger"
                  title="Hapus"
                  style={{ padding: '0.5rem' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: '1rem'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editingEvent ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Kegiatan</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingEvent?.title}
                  className="form-input" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Tanggal</label>
                  <input 
                    type="date" 
                    name="event_date" 
                    defaultValue={editingEvent?.event_date}
                    className="form-input" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Waktu</label>
                  <input 
                    type="time" 
                    name="event_time" 
                    defaultValue={editingEvent?.event_time?.substring(0, 5)}
                    className="form-input" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lokasi (Opsional)</label>
                <input 
                  type="text" 
                  name="location" 
                  defaultValue={editingEvent?.location || ''}
                  className="form-input" 
                  placeholder="Contoh: Aula Masjid"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi (Opsional)</label>
                <textarea 
                  name="description" 
                  defaultValue={editingEvent?.description || ''}
                  className="form-input" 
                  rows={3}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={createMutation.isPending || updateMutation.isPending}
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
