import { useState, useEffect } from 'react'

interface ClockWidgetProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function ClockWidget({ size = 'medium', className = '' }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  const sizeClasses = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-7xl',
  }

  return (
    <div className={`clock-display ${sizeClasses[size]} text-white ${className}`}>
      <span className="text-white">{hours}</span>
      <span className="text-[var(--accent-azure)] animate-pulse mx-1">:</span>
      <span className="text-white">{minutes}</span>
      <span className="text-[var(--text-muted)] text-[0.5em] ml-2">{seconds}</span>
    </div>
  )
}
