import { useEffect } from 'react'
import { useCountdownMinutes } from '../../hooks/useCountdown'
import { playAlarmSound } from '../../utils/audio'
import type { DisplayTemplate } from '../../styles/displayTemplates'

interface AdhanModeProps {
  prayerName: string
  prayerTime: string
  mosqueName: string
  template: DisplayTemplate
  onComplete: () => void
}

const ADHAN_DURATION_MINUTES = 3;

export default function AdhanMode({ prayerName, prayerTime, mosqueName, template, onComplete }: AdhanModeProps) {
  const countdown = useCountdownMinutes(ADHAN_DURATION_MINUTES, onComplete)

  useEffect(() => {
    playAlarmSound();
  }, []);

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
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%', right: '-5%',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: `rgba(255,255,255,0.04)`,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '2rem' }}>

        {/* Arabic calligraphy */}
        <div style={{
          fontSize: '2.5rem',
          color: accent,
          fontWeight: 700,
          letterSpacing: '0.15em',
          marginBottom: '1.5rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
          اَللهُ أَكْبَرُ
        </div>

        {/* Mosque Name */}
        <div style={{
          fontSize: '1.5rem',
          color: headerText,
          opacity: 0.85,
          fontWeight: 600,
          marginBottom: '1rem',
          letterSpacing: '0.05em',
        }}>
          {mosqueName}
        </div>

        {/* Prayer Name */}
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 900,
          color: headerText,
          lineHeight: 1,
          marginBottom: '0.5rem',
          textShadow: '0 4px 30px rgba(0,0,0,0.3)',
          letterSpacing: '-0.02em',
        }}>
          {prayerName.toUpperCase()}
        </h1>

        {/* Label */}
        <div style={{
          fontSize: '1.75rem',
          color: headerText,
          opacity: 0.85,
          fontWeight: 500,
          marginBottom: '1rem',
        }}>
          Telah Masuk Waktu Shalat
        </div>

        {/* Prayer Time */}
        <div style={{
          fontFamily: 'Outfit, monospace',
          fontSize: '6rem',
          fontWeight: 800,
          color: accent,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: `0 0 60px ${accent}80`,
          marginBottom: '2.5rem',
        }}>
          {prayerTime}
        </div>

        {/* Label countdown */}
        <div style={{
          display: 'inline-block',
          padding: '0.75rem 2.5rem',
          background: 'rgba(0,0,0,0.25)',
          border: `1px solid ${headerText}30`,
          borderRadius: '100px',
          marginBottom: '1.5rem',
        }}>
          <span style={{ color: headerText, opacity: 0.85, fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.08em' }}>
            🕌 SEDANG AZAN — Menunggu Iqamah dalam
          </span>
        </div>

        {/* Countdown timer */}
        <div style={{
          fontFamily: 'Outfit, monospace',
          fontSize: '8rem',
          fontWeight: 800,
          color: headerText,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 0 60px rgba(255,255,255,0.2)',
          marginBottom: '2rem',
        }}>
          {countdown.minutes.toString().padStart(2, '0')}
          <span style={{ color: accent, animation: 'adhanPulse 1s ease-in-out infinite' }}>:</span>
          {countdown.seconds.toString().padStart(2, '0')}
        </div>

        {/* Instruction */}
        <div style={{
          fontSize: '1.25rem',
          color: headerText,
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>📵</span>
          Harap Non-aktifkan Handphone Anda
        </div>
      </div>

      <style>{`
        @keyframes adhanPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
