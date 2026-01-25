import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { CreditCard } from 'lucide-react'

export default function DonationWidget() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const { data: donations } = useQuery({
    queryKey: ['activeDonations'],
    queryFn: displayService.getActiveDonations,
    refetchInterval: 1000 * 60 * 5, // 5 mins
  })

  useEffect(() => {
    if (!donations || donations.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % donations.length)
    }, 5000) // Change every 5 seconds
    return () => clearInterval(interval)
  }, [donations])

  if (!donations || donations.length === 0) return null

  const current = donations[currentIndex]

  return (
    <div className="donation-card animate-fade-in" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem',
      background: 'rgba(255,255,255,0.1)',
      padding: '0.5rem 1.5rem',
      borderRadius: '12px',
      color: 'white',
      height: '100%',
      marginRight: 'auto',
      marginLeft: '1.5rem'
    }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '0.5rem', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CreditCard size={24} color="#fbbf24" />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Salurkan Donasi
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fbbf24' }}>
            {current.bank_name}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1 }}>
            {current.account_number}
          </span>
          <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            a.n {current.account_name}
          </span>
        </div>
      </div>
    </div>
  )
}
