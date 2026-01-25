import { Calendar, Clock, MapPin } from 'lucide-react'
import type { Event } from '../../types'

interface EventsPanelProps {
  events: Event[]
}

export default function EventsPanel({ events }: EventsPanelProps) {
  if (events.length === 0) {
    return (
      <div className="events-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--slate-500)' }}>
        <Calendar size={48} opacity={0.5} />
        <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>Belum ada agenda kegiatan mendatang</p>
      </div>
    )
  }

  return (
    <div className="events-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ padding: '0.5rem', background: 'var(--primary-100)', borderRadius: '8px', color: 'var(--primary-600)' }}>
          <Calendar size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-800)', lineHeight: 1.2 }}>Agenda Kegiatan</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Masjid Agung Al Azhar</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'hidden' }}>
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-date-badge">
              <span className="day">{new Date(event.event_date).getDate()}</span>
              <span className="month">{new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}</span>
            </div>
            
            <div className="event-details">
              <h4 className="event-title">{event.title}</h4>
              
              <div className="event-meta">
                {event.event_time && (
                  <div className="meta-item">
                    <Clock size={12} />
                    <span>{event.event_time.substring(0, 5)} WIB</span>
                  </div>
                )}
                {event.location && (
                  <div className="meta-item">
                    <MapPin size={12} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              
              {event.description && (
                <p className="event-desc">{event.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
