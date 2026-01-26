import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { Landmark, QrCode } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
const ROTATION_INTERVAL = 15000 // 15 seconds

export default function DonationWidget() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const { data: donations } = useQuery({
    queryKey: ['activeDonations'],
    queryFn: displayService.getActiveDonations,
    refetchInterval: 1000 * 60 * 5, // 5 mins
  })

  // Rotation effect
  useEffect(() => {
    if (!donations || donations.length <= 1) return

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false)
      
      setTimeout(() => {
        // Change index
        setCurrentIndex((prev) => (prev + 1) % donations.length)
        // Fade in
        setIsVisible(true)
      }, 500) // Wait for fade out animation
    }, ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [donations])

  if (!donations || donations.length === 0) return null

  const currentDonation = donations[currentIndex]
  const isQris = currentDonation.type === 'qris' && currentDonation.qris_image

  return (
    <div className="info-card" style={{ 
      background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
      border: '1px solid var(--primary-100)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'opacity 0.5s ease-in-out',
      opacity: isVisible ? 1 : 0
    }}>
      {isQris ? (
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
              src={`${API_URL}/storage/${currentDonation.qris_image}`}
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
      ) : (
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
                {currentDonation.bank_name}
              </div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '1.1rem', 
                fontWeight: 700, 
                color: 'var(--primary-700)',
                marginBottom: '0.25rem'
              }}>
                {currentDonation.account_number}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'var(--slate-600)',
                fontWeight: 500
              }}>
                a.n. {currentDonation.account_name}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Indicator dots if multiple */}
      {donations.length > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.35rem',
          marginTop: '0.75rem'
        }}>
          {donations.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: idx === currentIndex ? 'var(--primary-500)' : 'var(--primary-200)',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
