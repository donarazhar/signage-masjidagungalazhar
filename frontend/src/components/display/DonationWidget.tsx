import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { CreditCard } from 'lucide-react'

export default function DonationWidget() {
  const { data: donations } = useQuery({
    queryKey: ['activeDonations'],
    queryFn: displayService.getActiveDonations,
    refetchInterval: 1000 * 60 * 5, // 5 mins
  })

  if (!donations || donations.length === 0) return null

  // Take up to 3 active donations
  const displayDonations = donations.slice(0, 3)

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem',
      height: '100%',
      marginRight: 'auto',
      marginLeft: '1.5rem',
      alignItems: 'center'
    }}>
      {displayDonations.map((donation) => (
        <div key={donation.id} className="donation-card animate-fade-in" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          background: 'rgba(255,255,255,0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          color: 'white',
          height: 'auto',
          minWidth: '240px'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '0.5rem', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={20} color="var(--gold-500)" />
          </div>
          <div>
            <div style={{ 
              fontSize: '0.65rem', 
              color: 'rgba(255,255,255,0.7)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}>
              {donation.bank_name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '1rem', 
                fontWeight: 600, 
                lineHeight: 1.2,
                color: 'var(--gold-500)' 
              }}>
                {donation.account_number}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {donation.account_name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
