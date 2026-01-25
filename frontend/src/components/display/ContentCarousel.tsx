import { useState, useEffect, useRef } from 'react'
import type { Content } from '../../types'

interface ContentCarouselProps {
  contents: Content[]
  duration: number
  mosqueName?: string
}

export default function ContentCarousel({ contents, duration, mosqueName }: ContentCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (contents.length === 0) return
    const currentContent = contents[currentIndex]
    const slideDuration = currentContent?.duration || duration
    const timer = setTimeout(() => setCurrentIndex((prev) => (prev + 1) % contents.length), slideDuration * 1000)
    return () => clearTimeout(timer)
  }, [currentIndex, contents, duration])

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

  const currentContent = contents[currentIndex]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
      {contents.map((content, index) => (
        <div
          key={content.id}
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'opacity 0.7s ease-in-out',
            opacity: index === currentIndex ? 1 : 0,
            pointerEvents: index === currentIndex ? 'auto' : 'none',
          }}
        >
          {content.type === 'youtube' ? (
            // YouTube Embed
            <iframe
              ref={index === currentIndex ? iframeRef : undefined}
              src={index === currentIndex && content.youtube_embed_url ? content.youtube_embed_url : undefined}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Image
            <img
              src={content.file_url || `/storage/${content.file_path}`}
              alt={content.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </div>
      ))}

      {/* Progress Dots */}
      {contents.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10,
        }}>
          {contents.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === currentIndex ? '2rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '100px',
                background: idx === currentIndex ? '#10b981' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      )}

      {/* Content Title Overlay */}
      {currentContent && (
        <div style={{
          position: 'absolute',
          bottom: '4rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '100px',
          fontSize: '0.875rem',
          fontWeight: 500,
          zIndex: 10,
        }}>
          {currentContent.title}
        </div>
      )}
    </div>
  )
}
