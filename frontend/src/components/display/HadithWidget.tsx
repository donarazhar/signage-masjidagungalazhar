import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import { Quote } from 'lucide-react'

export default function HadithWidget() {
  const { data: hadith } = useQuery({
    queryKey: ['activeHadith'],
    queryFn: displayService.getActiveHadith,
    refetchInterval: 1000 * 60 * 60, // 1 hour
  })

  // Default Quote if none active
  const content = hadith?.content || "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya."
  const source = hadith?.source || "HR. Ahmad, Thabrani, Daruqutni"

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '600px',
      border: '1px solid rgba(255,255,255,0.15)'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Quote size={24} style={{ color: '#fbbf24' }} />
      </div>
      
      <div style={{ flex: 1 }}>
        <p style={{ 
          fontSize: '0.95rem', 
          fontStyle: 'italic',
          color: 'white',
          lineHeight: '1.5',
          marginBottom: '0.25rem',
          fontWeight: 500
        }}>
          "{content}"
        </p>
        <p style={{ 
          color: '#fbbf24',
          fontWeight: 700,
          fontSize: '0.8rem'
        }}>
          — {source}
        </p>
      </div>
    </div>
  )
}

