import { useEffect, useRef, useState } from 'react'
import type { RunningText as RunningTextType } from '../../types'

interface RunningTextProps {
  texts: RunningTextType[]
  speed: number
  mosqueName?: string
}

export default function RunningText({ texts, speed, mosqueName }: RunningTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [animationDuration, setAnimationDuration] = useState(30)

  useEffect(() => {
    if (contentRef.current && containerRef.current) {
      const contentWidth = contentRef.current.scrollWidth
      const containerWidth = containerRef.current.offsetWidth
      const totalDistance = contentWidth + containerWidth
      const duration = totalDistance / speed
      setAnimationDuration(Math.max(duration, 20))
    }
  }, [texts, speed])

  const defaultMessages = [
    `🕌 Selamat datang di ${mosqueName || 'Masjid Agung Al Azhar'}`,
    '📵 Harap non-aktifkan ponsel selama shalat',
    '🚗 Parkir kendaraan dengan tertib',
    '🤲 Semoga ibadah kita diterima Allah SWT',
  ]

  const displayTexts = texts.length > 0 
    ? texts 
    : defaultMessages.map((content, id) => ({ 
        id, 
        content, 
        type: 'normal' as const,
        priority: 0,
        is_enabled: true,
        start_date: null,
        end_date: null,
        show_on_days: null,
        created_by: 0,
        created_at: '',
        updated_at: '',
      }))

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'text-red-400 font-semibold'
      case 'berita_duka':
        return 'bg-gray-900/80 text-white px-4 py-1 rounded-lg border border-gray-700'
      default:
        return 'text-[var(--text-secondary)]'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '⚠️'
      case 'berita_duka': return '🖤'
      default: return '✦'
    }
  }

  return (
    <div ref={containerRef} className="overflow-hidden px-4">
      <div
        ref={contentRef}
        className="ticker-content running-text"
        style={{ animationDuration: `${animationDuration}s` }}
      >
        {displayTexts.map((text, idx) => (
          <span key={`${text.id}-${idx}`} className={`ticker-item ${getTypeStyle(text.type)}`}>
            <span className="text-[var(--accent-azure)]">{getTypeIcon(text.type)}</span>
            {text.content}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {displayTexts.map((text, idx) => (
          <span key={`dup-${text.id}-${idx}`} className={`ticker-item ${getTypeStyle(text.type)}`}>
            <span className="text-[var(--accent-azure)]">{getTypeIcon(text.type)}</span>
            {text.content}
          </span>
        ))}
      </div>
    </div>
  )
}
