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
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/5 rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full"></div>

      <div className="relative z-10 text-center">
        {/* Logo */}
        <img 
          src="/logo-alazhar.png" 
          alt="Logo" 
          className="h-24 w-auto mx-auto mb-6"
        />

        {/* Prayer Name */}
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wide">
          Waktu Shalat {prayerName}
        </h1>

        <div className="text-xl text-white/80 mb-8">
          Masjid Agung Al Azhar
        </div>

        {/* Iqamah Label */}
        <div className="inline-block px-8 py-3 rounded-full bg-yellow-400/20 border-2 border-yellow-400/50 mb-8">
          <span className="text-xl text-yellow-300 font-bold tracking-wider uppercase">
            ⏳ Menunggu Iqamah
          </span>
        </div>

        {/* Countdown */}
        <div className="font-clock text-[10rem] font-black text-white leading-none drop-shadow-2xl">
          {countdown.minutes.toString().padStart(2, '0')}
          <span className="text-yellow-300 animate-pulse">:</span>
          {countdown.seconds.toString().padStart(2, '0')}
        </div>

        {/* Messages */}
        <div className="mt-12 space-y-3">
          <div className="text-2xl text-white font-semibold flex items-center justify-center gap-3">
            <span className="text-3xl">📵</span>
            Harap Non-aktifkan Handphone Anda
          </div>
          <div className="text-lg text-white/70">
            Persiapkan diri untuk shalat berjamaah
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
    </div>
  )
}
