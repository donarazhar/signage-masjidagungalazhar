import { useState, useEffect } from 'react'
import { useCountdownMinutes } from '../../hooks/useCountdown'

interface PrayerInProgressModeProps {
  duration: number // minutes
  onComplete: () => void
}

export default function PrayerInProgressMode({ duration, onComplete }: PrayerInProgressModeProps) {
  const [time, setTime] = useState(new Date())
  const countdown = useCountdownMinutes(duration, onComplete)

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')

  return (
    <div className="prayer-mode">
      <div className="text-center">
        {/* Dim Clock */}
        <div className="font-clock text-6xl text-gray-700 mb-4">
          {hours}:{minutes}
        </div>
        
        {/* Status Text */}
        <div className="text-gray-600 text-xl">
          Shalat Sedang Berlangsung
        </div>

        {/* Remaining time (very dim) */}
        <div className="text-gray-800 text-sm mt-4">
          {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}
