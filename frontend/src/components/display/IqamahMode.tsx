import { useRef } from 'react'
import { useCountdownMinutes } from '../../hooks/useCountdown'
import { playAlarmSound } from '../../utils/audio'
import type { DisplayTemplate } from '../../styles/displayTemplates'

interface IqamahModeProps {
  prayerName: string
  duration: number
  mosqueName?: string
  template: DisplayTemplate
  onComplete: () => void
}

export default function IqamahMode({ prayerName, duration, mosqueName = 'Masjid', template, onComplete }: IqamahModeProps) {
  const alarmFiredRef = useRef(false)

  // Wrap onComplete to fire alarm BEFORE transitioning (pertanda iqamah dimulai)
  const handleComplete = () => {
    if (!alarmFiredRef.current) {
      alarmFiredRef.current = true
      playAlarmSound()
    }
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  const countdown = useCountdownMinutes(duration, handleComplete)
  const { headerBg, headerText, accent } = template.colors;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: headerBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Background decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-10%', left: '-5%',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%', right: '-5%',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>

        {/* Mosque Name */}
        <div style={{
          fontSize: '1.5rem',
          color: headerText,
          opacity: 0.85,
          fontWeight: 600,
          marginBottom: '0.5rem',
          letterSpacing: '0.05em',
        }}>
          {mosqueName}
        </div>

        {/* Prayer Name */}
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          color: headerText,
          marginBottom: '2rem',
          textShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          Waktu Shalat {prayerName}
        </h1>

        {/* Badge menunggu iqamah */}
        <div style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          background: 'rgba(0,0,0,0.2)',
          border: `2px solid ${accent}80`,
          borderRadius: '100px',
          marginBottom: '2rem'
        }}>
          <span style={{ color: accent, fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.1em' }}>
            ⏳ MENUNGGU IQAMAH
          </span>
        </div>

        {/* Big countdown */}
        <div style={{
          fontFamily: 'Outfit, monospace',
          fontSize: '12rem',
          fontWeight: 800,
          color: headerText,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 0 60px rgba(255,255,255,0.3)'
        }}>
          {countdown.minutes.toString().padStart(2, '0')}
          <span style={{ color: accent, animation: 'iqamahPulse 1s ease-in-out infinite' }}>:</span>
          {countdown.seconds.toString().padStart(2, '0')}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <div style={{
            fontSize: '1.5rem',
            color: headerText,
            opacity: 0.9,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '2rem' }}>📵</span>
            Harap Non-aktifkan Handphone Anda
          </div>
          <div style={{ fontSize: '1.1rem', color: headerText, opacity: 0.65, marginTop: '0.5rem' }}>
            Persiapkan diri untuk shalat berjamaah
          </div>
        </div>
      </div>

      <style>{`
        @keyframes iqamahPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
