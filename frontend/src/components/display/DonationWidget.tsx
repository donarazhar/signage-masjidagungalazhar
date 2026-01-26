import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { Landmark, QrCode } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

export default function DonationWidget() {
  const { data: donations } = useQuery({
    queryKey: ['activeDonations'],
    queryFn: displayService.getActiveDonations,
    refetchInterval: 1000 * 60 * 5, // 5 mins
  })

  if (!donations || donations.length === 0) return null

  // Get first rekening and first QRIS
  const rekening = donations.find(d => d.type === 'rekening')
  const qris = donations.find(d => d.type === 'qris')

  // If we have QRIS, show it, otherwise show rekening
  const showQris = qris && qris.qris_image

  return (
    <div className="info-card animate-fade-in" style={{ 
      background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
      border: '1px solid var(--primary-100)',
      position: 'relative',
      overflow: 'hidden' 
    }}>
      {showQris ? (
        <>
          {/* QRIS Display */}
          <div style={{
            position: 'absolute',
            top: -10,
            right: -10,
            opacity: 0.1,
            color: 'var(--primary-600)'
          }}>
            <QrCode size={64} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: 'var(--primary-600)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <QrCode size={18} />
              Scan QRIS
            </div>
            <img 
              src={`${API_URL}/storage/${qris.qris_image}`}
              alt="QRIS"
              style={{
                width: '100%',
                maxHeight: '150px',
                objectFit: 'contain',
                borderRadius: '8px',
                background: 'white'
              }}
            />
          </div>
        </>
      ) : rekening ? (
        <>
          {/* Rekening Display */}
          <div style={{
            position: 'absolute',
            top: -10,
            right: -10,
            opacity: 0.1,
            color: 'var(--primary-600)'
          }}>
            <Landmark size={64} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '0.75rem',
              color: 'var(--primary-600)',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}>
              <Landmark size={18} />
              Rekening Donasi
            </div>

            <div style={{
              background: 'var(--primary-50)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              border: '1px solid var(--primary-100)'
            }}>
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--slate-500)', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                marginBottom: '0.25rem'
              }}>
                {rekening.bank_name}
              </div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                color: 'var(--primary-700)',
                marginBottom: '0.25rem'
              }}>
                {rekening.account_number}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'var(--slate-600)',
                fontWeight: 500
              }}>
                a.n. {rekening.account_name}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}


