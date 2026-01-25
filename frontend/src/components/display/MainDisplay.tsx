import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import ContentCarousel from './ContentCarousel'
import RunningText from './RunningText'
import IqamahMode from './IqamahMode'
import PrayerInProgressMode from './PrayerInProgressMode'
import type { DisplayMode, PrayerName, PrayerTimes } from '../../types'

const PRAYER_NAMES: Record<string, string> = {
  imsak: 'IMSAK',
  fajr: 'SHUBUH',
  sunrise: 'SYURUQ',
  dhuhr: 'DZUHUR',
  asr: 'ASHAR',
  maghrib: 'MAGHRIB',
  isha: 'ISYA',
}

function formatTime(timeStr: string): string {
  return timeStr.replace(/\s*\(.*\)/, '')
}

function getNextPrayer(prayerTimes: PrayerTimes): { name: string; time: string; minutesLeft: number } | null {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  const prayers: Array<{ key: PrayerName; name: string }> = [
    { key: 'fajr', name: 'Shubuh' },
    { key: 'dhuhr', name: 'Dzuhur' },
    { key: 'asr', name: 'Ashar' },
    { key: 'maghrib', name: 'Maghrib' },
    { key: 'isha', name: 'Isya' },
  ]
  
  for (const prayer of prayers) {
    const [hour, minute] = prayerTimes.timings[prayer.key].split(':').map(Number)
    const prayerMinutes = hour * 60 + minute
    
    if (prayerMinutes > currentMinutes) {
      return {
        name: prayer.name,
        time: formatTime(prayerTimes.timings[prayer.key]),
        minutesLeft: prayerMinutes - currentMinutes,
      }
    }
  }
  
  // Next day's Fajr
  const [hour, minute] = prayerTimes.timings.fajr.split(':').map(Number)
  const fajrMinutes = hour * 60 + minute
  return {
    name: 'Shubuh',
    time: formatTime(prayerTimes.timings.fajr),
    minutesLeft: (24 * 60 - currentMinutes) + fajrMinutes,
  }
}

export default function MainDisplay() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal')
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: displayService.getSettings,
  })

  const { data: prayerTimes } = useQuery({
    queryKey: ['prayerTimes'],
    queryFn: displayService.getPrayerTimes,
    refetchInterval: 1000 * 60 * 30,
  })

  const { data: contents } = useQuery({
    queryKey: ['activeContents'],
    queryFn: displayService.getActiveContents,
    refetchInterval: 1000 * 60 * 5,
  })

  const { data: runningTexts } = useQuery({
    queryKey: ['activeRunningTexts'],
    queryFn: displayService.getActiveRunningTexts,
    refetchInterval: 1000 * 60 * 5,
  })

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Check prayer times
  useEffect(() => {
    if (!prayerTimes) return

    const checkPrayerTime = () => {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
      
      for (const prayer of prayers) {
        const [hour, minute] = prayerTimes.timings[prayer].split(':').map(Number)
        const prayerMinutes = hour * 60 + minute
        const iqamahDuration = prayerTimes.iqamah_duration[prayer as keyof typeof prayerTimes.iqamah_duration] || 10
        const prayerDuration = prayerTimes.prayer_duration || 15

        if (currentMinutes >= prayerMinutes && currentMinutes < prayerMinutes + iqamahDuration) {
          setDisplayMode('iqamah')
          setCurrentPrayer(prayer)
          return
        }

        if (currentMinutes >= prayerMinutes + iqamahDuration && currentMinutes < prayerMinutes + iqamahDuration + prayerDuration) {
          setDisplayMode('prayer')
          setCurrentPrayer(prayer)
          return
        }
      }

      setDisplayMode('normal')
      setCurrentPrayer(null)
    }

    checkPrayerTime()
    const interval = setInterval(checkPrayerTime, 10000)
    return () => clearInterval(interval)
  }, [prayerTimes])

  // Iqamah mode
  if (displayMode === 'iqamah' && currentPrayer && prayerTimes) {
    const iqamahDuration = prayerTimes.iqamah_duration[currentPrayer as keyof typeof prayerTimes.iqamah_duration] || 10
    return (
      <IqamahMode
        prayerName={PRAYER_NAMES[currentPrayer]}
        duration={iqamahDuration}
        onComplete={() => setDisplayMode('prayer')}
      />
    )
  }

  if (displayMode === 'prayer' && prayerTimes) {
    return (
      <PrayerInProgressMode
        duration={prayerTimes.prayer_duration || 15}
        onComplete={() => setDisplayMode('normal')}
      />
    )
  }

  const mosqueName = settings?.mosque_name || 'Masjid Agung Al Azhar'
  const mosqueAddress = settings?.mosque_address || 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan'
  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : null
  
  // Format dates
  const gregorianDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  
  const hijriDate = prayerTimes?.date?.hijri
    ? `${prayerTimes.date.hijri.day} ${prayerTimes.date.hijri.month.ar} ${prayerTimes.date.hijri.year}`
    : ''

  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')

  // Format countdown
  const formatCountdown = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    const secs = 60 - currentTime.getSeconds()
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="display-container">
      {/* Header Bar */}
      <header className="header-bar">
        <img src="/logo-alazhar.png" alt="Logo" className="h-12 w-auto" />
        <div className="text-center">
          <h1 className="text-xl font-bold text-white tracking-wide">{mosqueName}</h1>
          <p className="text-xs text-white/80">{mosqueAddress}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          {/* Date Card */}
          <div className="date-card">
            <div className="text-sm font-semibold text-[var(--primary-green)]">{gregorianDate}</div>
            <div className="text-sm text-[var(--text-muted)] mt-1">{hijriDate}</div>
          </div>

          {/* Clock Card */}
          <div className="clock-card">
            <div className="font-clock text-7xl text-[var(--primary-green)]">
              {hours}:{minutes}
            </div>
            <div className="text-2xl text-[var(--text-muted)] font-medium mt-1">:{seconds}</div>
          </div>

          {/* Countdown Card */}
          {nextPrayer && (
            <div className="countdown-card">
              <div className="text-sm font-semibold opacity-90 mb-1">
                {nextPrayer.name} - {formatCountdown(nextPrayer.minutesLeft)}
              </div>
              <div className="text-xs opacity-75">
                Menuju waktu shalat berikutnya
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="info-card flex-1">
            <div className="text-xs font-semibold text-[var(--primary-green)] uppercase tracking-wider mb-2">
              Informasi
            </div>
            <p className="text-sm leading-relaxed">
              Amal terbaik adalah yang diberikan di bulan Ramadhan.
            </p>
            <p className="text-xs mt-3 text-[var(--text-muted)]">- Tirmidzi</p>
          </div>
        </aside>

        {/* Carousel Area */}
        <div className="carousel-area">
          <ContentCarousel 
            contents={contents || []} 
            duration={settings?.carousel_duration || 10}
            mosqueName={mosqueName}
          />
        </div>
      </main>

      {/* Prayer Times Bar */}
      <div className="prayer-bar">
        {prayerTimes && (
          <>
            <PrayerItem name="IMSAK" time={formatTime(prayerTimes.timings.fajr)} isActive={false} />
            <PrayerItem name="SHUBUH" time={formatTime(prayerTimes.timings.fajr)} isActive={currentPrayer === 'fajr'} />
            <PrayerItem name="SYURUQ" time={formatTime(prayerTimes.timings.sunrise)} isActive={false} />
            <PrayerItem name="DHUHA" time="06:30" isActive={false} />
            <PrayerItem name="DZUHUR" time={formatTime(prayerTimes.timings.dhuhr)} isActive={currentPrayer === 'dhuhr'} />
            <PrayerItem name="ASHAR" time={formatTime(prayerTimes.timings.asr)} isActive={currentPrayer === 'asr'} />
            <PrayerItem name="MAGHRIB" time={formatTime(prayerTimes.timings.maghrib)} isActive={currentPrayer === 'maghrib'} />
            <PrayerItem name="ISYA" time={formatTime(prayerTimes.timings.isha)} isActive={currentPrayer === 'isha'} />
          </>
        )}
      </div>

      {/* Running Text Ticker */}
      <footer className="ticker-bar">
        <RunningText 
          texts={runningTexts || []} 
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
        />
      </footer>
    </div>
  )
}

function PrayerItem({ name, time, isActive }: { name: string; time: string; isActive: boolean }) {
  return (
    <div className={`prayer-item ${isActive ? 'active' : ''}`}>
      <span className="prayer-name">{name}</span>
      <span className="prayer-time">{time}</span>
    </div>
  )
}
