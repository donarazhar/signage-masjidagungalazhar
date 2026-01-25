import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { displayService } from '../../services/displayService'
import ContentCarousel from './ContentCarousel'
import RunningText from './RunningText'
import IqamahMode from './IqamahMode'
import PrayerInProgressMode from './PrayerInProgressMode'
import EventsPanel from './EventsPanel'
import type { DisplayMode, PrayerName, PrayerTimes } from '../../types'

const PRAYER_DISPLAY: Array<{ key: string; name: string; showIqamah?: boolean }> = [
  { key: 'imsak', name: 'IMSAK' },
  { key: 'fajr', name: 'SHUBUH', showIqamah: true },
  { key: 'sunrise', name: 'SYURUQ' },
  { key: 'dhuha', name: 'DHUHA' },
  { key: 'dhuhr', name: 'DZUHUR', showIqamah: true },
  { key: 'asr', name: 'ASHAR', showIqamah: true },
  { key: 'maghrib', name: 'MAGHRIB', showIqamah: true },
  { key: 'isha', name: 'ISYA', showIqamah: true },
]

const PRAYER_NAMES_ID: Record<string, string> = {
  fajr: 'Shubuh', dhuhr: 'Dzuhur', asr: 'Ashar', maghrib: 'Maghrib', isha: 'Isya',
}

const ISLAMIC_DAYS: Record<string, string> = {
  'Minggu': 'Ahad', 'Senin': 'Senin', 'Selasa': 'Selasa',
  'Rabu': 'Rabu', 'Kamis': 'Kamis', 'Jumat': "Jum'at", 'Sabtu': 'Sabtu',
}

function formatTime(timeStr: string): string {
  return timeStr?.replace(/\s*\(.*\)/, '') || '--:--'
}

function getNextPrayer(prayerTimes: PrayerTimes): { key: string; name: string; time: string; minutesLeft: number } | null {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const prayers: Array<{ key: PrayerName; name: string }> = [
    { key: 'fajr', name: 'Shubuh' }, { key: 'dhuhr', name: 'Dzuhur' },
    { key: 'asr', name: 'Ashar' }, { key: 'maghrib', name: 'Maghrib' },
    { key: 'isha', name: 'Isya' },
  ]
  for (const prayer of prayers) {
    const [h, m] = prayerTimes.timings[prayer.key].split(':').map(Number)
    const mins = h * 60 + m
    if (mins > currentMinutes) {
      return { key: prayer.key, name: prayer.name, time: formatTime(prayerTimes.timings[prayer.key]), minutesLeft: mins - currentMinutes }
    }
  }
  const [h, m] = prayerTimes.timings.fajr.split(':').map(Number)
  return { key: 'fajr', name: 'Shubuh', time: formatTime(prayerTimes.timings.fajr), minutesLeft: (24 * 60 - currentMinutes) + (h * 60 + m) }
}

export default function MainDisplay() {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('normal')
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: displayService.getSettings })
  const { data: prayerTimes } = useQuery({ queryKey: ['prayerTimes'], queryFn: displayService.getPrayerTimes, refetchInterval: 1000 * 60 * 30 })
  const { data: contents } = useQuery({ queryKey: ['activeContents'], queryFn: displayService.getActiveContents, refetchInterval: 1000 * 60 * 5 })
  const { data: runningTexts } = useQuery({ queryKey: ['activeRunningTexts'], queryFn: displayService.getActiveRunningTexts, refetchInterval: 1000 * 60 * 5 })
  const { data: events } = useQuery({ queryKey: ['upcomingEvents'], queryFn: displayService.getUpcomingEvents, refetchInterval: 1000 * 60 * 15 })

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!prayerTimes) return
    const check = () => {
      const now = new Date()
      const curr = now.getHours() * 60 + now.getMinutes()
      const prayers: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
      for (const p of prayers) {
        const [h, m] = prayerTimes.timings[p].split(':').map(Number)
        const pm = h * 60 + m
        const iq = prayerTimes.iqamah_duration[p as keyof typeof prayerTimes.iqamah_duration] || 10
        const pd = prayerTimes.prayer_duration || 15
        if (curr >= pm && curr < pm + iq) { setDisplayMode('iqamah'); setCurrentPrayer(p); return }
        if (curr >= pm + iq && curr < pm + iq + pd) { setDisplayMode('prayer'); setCurrentPrayer(p); return }
      }
      setDisplayMode('normal'); setCurrentPrayer(null)
    }
    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [prayerTimes])

  if (displayMode === 'iqamah' && currentPrayer && prayerTimes) {
    const dur = prayerTimes.iqamah_duration[currentPrayer as keyof typeof prayerTimes.iqamah_duration] || 10
    return <IqamahMode prayerName={PRAYER_NAMES_ID[currentPrayer]} duration={dur} onComplete={() => setDisplayMode('prayer')} />
  }
  if (displayMode === 'prayer' && prayerTimes) {
    return <PrayerInProgressMode duration={prayerTimes.prayer_duration || 15} onComplete={() => setDisplayMode('normal')} />
  }

  const mosqueName = settings?.mosque_name || 'Masjid Agung Al Azhar'
  const mosqueAddress = settings?.mosque_address || 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan'
  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : null

  const rawDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const gregorianDate = Object.entries(ISLAMIC_DAYS).reduce((d, [o, i]) => d.replace(o, i), rawDate)
  const hijriDate = prayerTimes?.date?.hijri ? `${prayerTimes.date.hijri.day} ${prayerTimes.date.hijri.month.ar} ${prayerTimes.date.hijri.year} H` : ''

  const hours = currentTime.getHours().toString().padStart(2, '0')
  const minutes = currentTime.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.getSeconds().toString().padStart(2, '0')

  const formatCountdown = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    const s = 60 - currentTime.getSeconds()
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  }

  const getPrayerTime = (key: string) => {
    if (key === 'imsak' && prayerTimes) {
      const [h, m] = prayerTimes.timings.fajr.split(':').map(Number)
      const im = (h * 60 + m - 10 + 1440) % 1440
      return `${Math.floor(im / 60).toString().padStart(2, '0')}:${(im % 60).toString().padStart(2, '0')}`
    }
    if (key === 'dhuha') return '06:30'
    return prayerTimes ? formatTime(prayerTimes.timings[key as keyof typeof prayerTimes.timings]) : '--:--'
  }

  return (
    <div className="display-container">
      {/* Header */}
      <header className="header-bar">
        <div className="logo-section">
          <img src="/logo-alazhar.png" alt="Logo YPI Al Azhar" />
          <div className="mosque-info">
            <h1>{mosqueName}</h1>
            <p>{mosqueAddress}</p>
          </div>
        </div>
        <div className="date-card" style={{ background: 'rgba(255,255,255,0.15)', borderLeft: 'none', color: 'white' }}>
          <div style={{ color: 'white', fontWeight: 600 }}>{gregorianDate}</div>
          <div style={{ color: 'rgba(251,191,36,1)', fontWeight: 600, marginTop: 4 }}>{hijriDate}</div>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <aside className="left-sidebar">
          {/* Clock */}
          <div className="clock-card">
            <div className="clock-time">
              {hours}<span style={{ color: '#10b981' }}>:</span>{minutes}
              <span className="clock-seconds">:{seconds}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>
              Waktu Indonesia Barat
            </div>
          </div>

          {/* Countdown */}
          {nextPrayer && (
            <div className="countdown-card">
              <div className="label">Menuju Waktu Shalat</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="prayer-name">{nextPrayer.name}</span>
                <span className="time">{formatCountdown(nextPrayer.minutesLeft)}</span>
              </div>
            </div>
          )}

          {/* Quote */}
          <div className="info-card">
            <p className="quote">
              "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya."
            </p>
            <p className="source">— HR. Ahmad, Thabrani, Daruqutni</p>
          </div>
        </aside>

        {/* Carousel */}
        <div className="carousel-area">
          <ContentCarousel contents={contents || []} duration={settings?.carousel_duration || 10} mosqueName={mosqueName} />
        </div>

        {/* Events Sidebar */}
        <aside className="right-sidebar">
          <EventsPanel events={events || []} />
        </aside>
      </main>

      {/* Prayer Bar */}
      <div className="prayer-bar">
        {PRAYER_DISPLAY.map((p) => (
          <div
            key={p.key}
            className={`prayer-item ${currentPrayer === p.key ? 'active' : ''} ${nextPrayer?.key === p.key ? 'next' : ''}`}
          >
            <span className="prayer-name">{p.name}</span>
            <span className="prayer-time">{getPrayerTime(p.key)}</span>
          </div>
        ))}
      </div>

      {/* Ticker */}
      <footer className="ticker-bar">
        <RunningText texts={runningTexts || []} speed={settings?.running_text_speed || 80} mosqueName={mosqueName} />
      </footer>
    </div>
  )
}
