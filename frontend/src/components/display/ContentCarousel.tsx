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
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8">
        <div className="text-center max-w-lg">
          <img 
            src="/logo-alazhar.png" 
            alt="Logo" 
            className="h-24 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-[var(--primary-green)] mb-3">
            {mosqueName || 'Masjid Agung Al Azhar'}
          </h2>
          <p className="text-lg text-[var(--text-muted)] mb-6">
            Yayasan Pesantren Islam Al Azhar
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <p className="text-[var(--text-muted)] text-center">
              ✨ Selamat datang di rumah Allah SWT ✨
            </p>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-100">
      {contents.map((content, index) => (
        <div
          key={content.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
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

      {/* Progress Indicators */}
      {contents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {contents.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[var(--primary-green)] w-8'
                  : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
