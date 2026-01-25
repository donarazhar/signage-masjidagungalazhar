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

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % contents.length)
    }, slideDuration * 1000)

    return () => clearTimeout(timer)
  }, [currentIndex, contents, duration])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [currentIndex])

  if (contents.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-primary)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-azure)] opacity-5 rounded-full blur-3xl"></div>
        
        <div className="text-center relative z-10 p-8">
          <img 
            src="/logo-alazhar.png" 
            alt="Logo" 
            className="h-32 w-auto mx-auto mb-6 opacity-80"
          />
          <h2 className="text-3xl font-bold gradient-text mb-3">
            {mosqueName || 'Masjid Agung Al Azhar'}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Yayasan Pesantren Islam Al Azhar
          </p>
          <div className="mt-8 text-sm text-[var(--text-muted)]">
            ✨ Selamat datang di rumah Allah ✨
          </div>
        </div>
      </div>
    )
  }

  const currentContent = contents[currentIndex]

  return (
    <div className="w-full h-full relative overflow-hidden">
      {contents.map((content, index) => (
        <div
          key={content.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
        >
          {content.type === 'image' ? (
            <img
              src={content.file_url || `/storage/${content.file_path}`}
              alt={content.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              ref={index === currentIndex ? videoRef : undefined}
              src={content.file_url || `/storage/${content.file_path}`}
              className="w-full h-full object-contain"
              muted
              loop={false}
              playsInline
            />
          )}
        </div>
      ))}

      {/* Title Overlay */}
      {currentContent?.title && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg">{currentContent.title}</h2>
        </div>
      )}

      {/* Progress Indicators */}
      {contents.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          {contents.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/30 w-3 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
