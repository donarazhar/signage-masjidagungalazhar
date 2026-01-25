import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import PrayerSchedule from './PrayerSchedule'
import ContentCarousel from './ContentCarousel'
import RunningText from './RunningText'
import ClockWidget from './ClockWidget'
import DateWidget from './DateWidget'
import IqamahMode from './IqamahMode'
import PrayerInProgressMode from './PrayerInProgressMode'
import type { DisplayMode, PrayerName } from '../../types'

const PRAYER_NAMES: Record<string, string> = {
  fajr: 'Subuh',
  sunrise: 'Syuruq',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya',
}

export default function MainDisplay() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal')
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null)
  
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

  const { data: financialSummary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: displayService.getFinancialSummary,
    refetchInterval: 1000 * 60 * 15,
  })

  // Check prayer times and update display mode
  useEffect(() => {
    if (!prayerTimes) return

    const checkPrayerTime = () => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute

      const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
      
      for (const prayer of prayers) {
        const [hour, minute] = prayerTimes.timings[prayer].split(':').map(Number)
        const prayerTimeMinutes = hour * 60 + minute
        const iqamahDuration = prayerTimes.iqamah_duration[prayer as keyof typeof prayerTimes.iqamah_duration] || 10
        const prayerDuration = prayerTimes.prayer_duration || 15
        const countdownBefore = prayerTimes.countdown_before || 15

        if (currentTimeMinutes >= prayerTimeMinutes - countdownBefore && currentTimeMinutes < prayerTimeMinutes) {
          setDisplayMode('countdown')
          setCurrentPrayer(prayer)
          return
        }

        if (currentTimeMinutes >= prayerTimeMinutes && currentTimeMinutes < prayerTimeMinutes + iqamahDuration) {
          setDisplayMode('iqamah')
          setCurrentPrayer(prayer)
          return
        }

        if (currentTimeMinutes >= prayerTimeMinutes + iqamahDuration && currentTimeMinutes < prayerTimeMinutes + iqamahDuration + prayerDuration) {
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

  // Prayer in progress mode
  if (displayMode === 'prayer' && prayerTimes) {
    return (
      <PrayerInProgressMode
        duration={prayerTimes.prayer_duration || 15}
        onComplete={() => setDisplayMode('normal')}
      />
    )
  }

  const mosqueName = settings?.mosque_name || 'Masjid Agung Al Azhar'

  return (
    <div className="fullscreen-container flex flex-col relative">
      {/* Header */}
      <header className="relative z-10 flex justify-between items-start p-8">
        {/* Logo and Mosque Name */}
        <div className="logo-container">
          <img 
            src="/logo-alazhar.png" 
            alt="Logo YPI Al Azhar" 
            className="h-20 w-auto"
          />
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              {mosqueName}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Yayasan Pesantren Islam Al Azhar
            </p>
            <DateWidget showHijri={settings?.show_hijri_date} prayerTimes={prayerTimes} />
          </div>
        </div>

        {/* Clock */}
        <div className="text-right">
          <ClockWidget size="large" />
          <div className="text-sm text-[var(--text-muted)] mt-2 uppercase tracking-widest">
            Western Indonesia Time
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-8 px-8 pb-6 overflow-hidden relative z-10">
        {/* Left: Prayer Schedule */}
        <aside className="w-[340px] flex-shrink-0 flex flex-col gap-4">
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold text-[var(--accent-azure)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-[var(--accent-azure)] rounded-full animate-pulse"></span>
              Jadwal Shalat
            </h2>
            <PrayerSchedule
              prayerTimes={prayerTimes}
              displayMode={displayMode}
              currentPrayer={currentPrayer}
            />
          </div>
          
          {/* Financial Summary */}
          {financialSummary && (
            <div className="financial-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[var(--accent-gold)] uppercase tracking-wider">
                    Infaq Minggu Ini
                  </h3>
                  <div className="text-2xl font-bold text-white font-clock">
                    Rp {financialSummary.saldo_kas?.toLocaleString('id-ID') || '0'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Center: Carousel */}
        <div className="flex-1 carousel-container">
          <ContentCarousel 
            contents={contents || []} 
            duration={settings?.carousel_duration || 10}
            mosqueName={mosqueName}
          />
        </div>
      </main>

      {/* Footer: Running Text */}
      <footer className="ticker-container relative z-10">
        <RunningText 
          texts={runningTexts || []} 
          speed={settings?.running_text_speed || 80}
          mosqueName={mosqueName}
        />
      </footer>
    </div>
  )
}
