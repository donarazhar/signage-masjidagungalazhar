import { useState, useEffect, useRef } from 'react'
import type { Content } from '../../types'

interface ContentCarouselProps {
  contents: Content[]
  duration: number
  mosqueName?: string
}

export default function ContentCarousel({ contents, duration, mosqueName }: ContentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (contents.length === 0) return
    const currentContent = contents[currentIndex]
    const isVideo = currentContent?.type === 'video'
    const slideDuration = isVideo ? (currentContent.duration || duration) : duration
    const timer = setTimeout(() => setCurrentIndex((prev) => (prev + 1) % contents.length), slideDuration * 1000)
    return () => clearTimeout(timer)
  }, [currentIndex, contents, duration])

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }, [currentIndex])

  if (contents.length === 0) {
    return (
      <div className="carousel-placeholder">
        <img src="/logo-alazhar.png" alt="Logo" />
        <h2>{mosqueName || 'Masjid Agung Al Azhar'}</h2>
        <p>Yayasan Pesantren Islam Al Azhar</p>
        <div className="welcome">✨ Selamat Datang di Rumah Allah ✨</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
      {contents.map((content, index) => (
        <div
          key={content.id}
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'opacity 0.7s ease-in-out, transform 0.7s ease-in-out',
            opacity: index === currentIndex ? 1 : 0,
            transform: index === currentIndex ? 'scale(1)' : 'scale(1.02)',
          }}
        >
          {content.type === 'image' ? (
            <img
              src={content.file_url || `/storage/${content.file_path}`}
              alt={content.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <video
              ref={index === currentIndex ? videoRef : undefined}
              src={content.file_url || `/storage/${content.file_path}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              muted
              playsInline
            />
          )}
        </div>
      ))}

      {/* Dots */}
      {contents.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
        }}>
          {contents.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentIndex ? '2rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '100px',
                background: idx === currentIndex ? '#10b981' : '#cbd5e1',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
