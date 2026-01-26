import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { Landmark, QrCode } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
const ROTATION_INTERVAL = 15000 // 15 seconds

export default function DonationWidget() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const { data: donations } = useQuery({
    queryKey: ['activeDonations'],
    queryFn: displayService.getActiveDonations,
    refetchInterval: 1000 * 60 * 5, // 5 mins
  })

  // Separate rekening and QRIS, create pages
  const pages = useMemo(() => {
    if (!donations || donations.length === 0) return []

    const rekenings = donations.filter(d => d.type === 'rekening')
    const qrisList = donations.filter(d => d.type === 'qris' && d.qris_image)
    
    const result: { type: 'rekening' | 'qris'; items: typeof donations }[] = []

    // Add rekening pages (2 per page)
    for (let i = 0; i < rekenings.length; i += 2) {
      result.push({
        type: 'rekening',
        items: rekenings.slice(i, i + 2)
      })
    }

    // Add QRIS pages (1 per page)
    for (const qris of qrisList) {
      result.push({
        type: 'qris',
        items: [qris]
      })
    }

    return result
  }, [donations])

  const totalPages = pages.length

  // Rotation effect
  useEffect(() => {
    if (totalPages <= 1) return

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false)
      
      setTimeout(() => {
        // Change page
        setCurrentPage((prev) => (prev + 1) % totalPages)
        // Fade in
        setIsVisible(true)
      }, 500) // Wait for fade out animation
    }, ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [totalPages])

  if (!donations || donations.length === 0 || pages.length === 0) return null

  const currentPageData = pages[currentPage]

  return (
    <div className="info-card" style={{ 
      background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
      border: '1px solid var(--primary-100)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'opacity 0.5s ease-in-out',
      opacity: isVisible ? 1 : 0
    }}>
      {currentPageData.type === 'qris' ? (
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
              src={`${API_URL}/storage/${currentPageData.items[0].qris_image}`}
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
          {/* Rekening Display (1 or 2) */}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentPageData.items.map((donation) => (
                <div key={donation.id} style={{
                  background: 'var(--primary-50)',
                  borderRadius: '12px',
                  padding: '0.6rem 0.8rem',
                  border: '1px solid var(--primary-100)'
                }}>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--slate-500)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    marginBottom: '0.15rem'
                  }}>
                    {donation.bank_name}
                  </div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: 'var(--primary-700)',
                    marginBottom: '0.1rem'
                  }}>
                    {donation.account_number}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--slate-600)',
                    fontWeight: 500
                  }}>
                    a.n. {donation.account_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Indicator dots if multiple pages */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.35rem',
          marginTop: '0.75rem'
        }}>
          {pages.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: idx === currentPage ? 'var(--primary-500)' : 'var(--primary-200)',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
