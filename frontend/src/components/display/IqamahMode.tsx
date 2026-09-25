import { useRef } from 'react'
import { useCountdownMinutes } from '../../hooks/useCountdown'
import { playAlarmSound } from '../../utils/audio'

interface IqamahModeProps {
  prayerName: string
  duration: number
  mosqueName?: string
  onComplete: () => void
}

export default function IqamahMode({ prayerName, duration, mosqueName = 'Masjid Agung Al Azhar', onComplete }: IqamahModeProps) {
  const alarmFiredRef = useRef(false)

  // Wrap onComplete to fire alarm BEFORE transitioning
  const handleComplete = () => {
    if (!alarmFiredRef.current) {
      alarmFiredRef.current = true
      playAlarmSound()
    }
    // Delay transition slightly so alarm starts playing first
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  const countdown = useCountdownMinutes(duration, handleComplete)

  return (
    <div className="iqamah-overlay">
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <img
          src="/logo-alazhar.png"
          alt="Logo"
          style={{ height: '100px', marginBottom: '2rem', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.2))' }}
        />

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          color: 'white',
          marginBottom: '0.5rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          Waktu Shalat {prayerName}
        </h1>

        <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', marginBottom: '2rem' }}>
          {mosqueName}
        </div>

        <div style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          background: 'rgba(251, 191, 36, 0.2)',
          border: '2px solid rgba(251, 191, 36, 0.5)',
          borderRadius: '100px',
          marginBottom: '2rem'
        }}>
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.1em' }}>
            ⏳ MENUNGGU IQAMAH
          </span>
        </div>

        <div style={{
          fontFamily: 'Outfit, monospace',
          fontSize: '12rem',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 0 60px rgba(255,255,255,0.3)'
        }}>
          {countdown.minutes.toString().padStart(2, '0')}
          <span style={{ color: '#fbbf24', animation: 'pulse 1s ease-in-out infinite' }}>:</span>
          {countdown.seconds.toString().padStart(2, '0')}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <div style={{
            fontSize: '1.5rem',
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '2rem' }}>📵</span>
            Harap Non-aktifkan Handphone Anda
          </div>
          <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
            Persiapkan diri untuk shalat berjamaah
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
