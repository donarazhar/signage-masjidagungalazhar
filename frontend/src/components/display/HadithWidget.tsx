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
    <div className="info-card animate-fade-in" style={{ 
      background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
      border: '1px solid var(--primary-100)',
      position: 'relative',
      overflow: 'hidden' 
    }}>
      <div style={{
        position: 'absolute',
        top: -10,
        right: -10,
        opacity: 0.1,
        color: 'var(--primary-600)'
      }}>
        <Quote size={64} />
      </div>
      
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <p className="quote" style={{ 
          fontSize: '1rem', 
          fontStyle: 'italic',
          color: 'var(--slate-700)',
          textAlign: 'center',
          lineHeight: '1.6',
          marginBottom: '1rem',
          fontWeight: 500
        }}>
          "{content}"
        </p>
        <p className="source" style={{ 
          textAlign: 'center',
          color: 'var(--primary-600)',
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          — {source}
        </p>
      </div>
    </div>
  )
}
