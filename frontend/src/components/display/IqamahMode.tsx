import { useCountdownMinutes } from '../../hooks/useCountdown'

interface IqamahModeProps {
  prayerName: string
  duration: number
  onComplete: () => void
}

export default function IqamahMode({ prayerName, duration, onComplete }: IqamahModeProps) {
  const countdown = useCountdownMinutes(duration, onComplete)

  return (
    <div className="iqamah-overlay">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-[var(--accent-azure)] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-[var(--accent-gold)] opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <img 
          src="/logo-alazhar.png" 
          alt="Logo" 
          className="h-28 w-auto mx-auto mb-8 drop-shadow-2xl"
        />

        {/* Prayer Name */}
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
          Waktu Shalat {prayerName}
        </h1>

        {/* Subtitle */}
        <div className="text-2xl text-[var(--accent-azure)] mb-10 font-medium">
          Masjid Agung Al Azhar
        </div>

        {/* Iqamah Label */}
        <div className="inline-block px-8 py-3 rounded-full bg-[var(--accent-gold)]/20 border border-[var(--accent-gold)]/30 mb-8">
          <span className="text-xl text-[var(--accent-gold)] font-semibold tracking-wider uppercase">
            ⏳ Menunggu Iqamah
          </span>
        </div>

        {/* Countdown */}
        <div className="font-clock text-[12rem] font-bold text-white leading-none tracking-wider drop-shadow-2xl">
          {countdown.minutes.toString().padStart(2, '0')}
          <span className="text-[var(--accent-azure)] animate-pulse">:</span>
          {countdown.seconds.toString().padStart(2, '0')}
        </div>

        {/* Messages */}
        <div className="mt-14 space-y-4">
          <div className="text-2xl text-white/90 font-medium flex items-center justify-center gap-3">
            <span className="text-3xl">📵</span>
            Harap Non-aktifkan Handphone Anda
          </div>
          <div className="text-xl text-white/60">
            Persiapkan diri untuk shalat berjamaah
          </div>
        </div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent-azure)] to-transparent" />
    </div>
  )
}
