import { useEffect } from 'react'
import { useCountdownMinutes } from '../../hooks/useCountdown'
import { playAlarmSound } from '../../utils/audio'

interface AdhanModeProps {
  prayerName: string
  prayerTime: string
  onComplete: () => void
}

const ADHAN_DURATION_MINUTES = 3;

export default function AdhanMode({ prayerName, prayerTime, onComplete }: AdhanModeProps) {
  const countdown = useCountdownMinutes(ADHAN_DURATION_MINUTES, onComplete)

  useEffect(() => {
    // Bunyikan alarm saat waktu shalat tiba (adzan)
    playAlarmSound();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(160deg, #14532d 0%, #15803d 40%, #16a34a 100%)',
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
        background: 'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%', right: '-5%',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'rgba(251, 191, 36, 0.07)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '2rem' }}>

        {/* Logo */}
        <img
          src="/logo-alazhar.png"
          alt="Logo"
          style={{ height: '100px', marginBottom: '2rem', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}
        />

        {/* Allahu Akbar */}
        <div style={{
          fontSize: '2rem',
          color: '#fbbf24',
          fontWeight: 700,
          letterSpacing: '0.15em',
          marginBottom: '1.5rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}>
          اَللهُ أَكْبَرُ
        </div>

        {/* Prayer Name */}
        <h1 style={{
          fontSize: '5rem',
          fontWeight: 900,
          color: 'white',
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
          color: 'rgba(255,255,255,0.85)',
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
          color: '#fbbf24',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 0 60px rgba(251,191,36,0.5)',
          marginBottom: '2.5rem',
        }}>
          {prayerTime}
        </div>

        {/* Countdown label */}
        <div style={{
          display: 'inline-block',
          padding: '0.75rem 2.5rem',
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '100px',
          marginBottom: '1.5rem',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '1.1rem', letterSpacing: '0.1em' }}>
            🕌 SEDANG AZAN — Menunggu Iqamah dalam
          </span>
        </div>

        {/* Countdown timer */}
        <div style={{
          fontFamily: 'Outfit, monospace',
          fontSize: '8rem',
          fontWeight: 800,
          color: 'white',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 0 60px rgba(255,255,255,0.3)',
          marginBottom: '2rem',
        }}>
          {countdown.minutes.toString().padStart(2, '0')}
          <span style={{ color: '#fbbf24', animation: 'adhanPulse 1s ease-in-out infinite' }}>:</span>
          {countdown.seconds.toString().padStart(2, '0')}
        </div>

        {/* Instruction */}
        <div style={{
          fontSize: '1.25rem',
          color: 'rgba(255,255,255,0.7)',
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
