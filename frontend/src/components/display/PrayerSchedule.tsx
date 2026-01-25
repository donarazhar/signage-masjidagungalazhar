import type { PrayerTimes, PrayerName, DisplayMode } from '../../types'
import { useCountdown } from '../../hooks/useCountdown'

interface PrayerScheduleProps {
  prayerTimes?: PrayerTimes | null
  displayMode: DisplayMode
  currentPrayer: PrayerName | null
}

const PRAYER_INFO: Array<{ key: PrayerName; name: string; icon: string }> = [
  { key: 'fajr', name: 'Subuh', icon: '🌙' },
  { key: 'sunrise', name: 'Syuruq', icon: '🌅' },
  { key: 'dhuhr', name: 'Dzuhur', icon: '☀️' },
  { key: 'asr', name: 'Ashar', icon: '🌤️' },
  { key: 'maghrib', name: 'Maghrib', icon: '🌇' },
  { key: 'isha', name: 'Isya', icon: '🌃' },
]

export default function PrayerSchedule({ prayerTimes, displayMode, currentPrayer }: PrayerScheduleProps) {
  if (!prayerTimes) {
    return (
      <div className="flex flex-col gap-2">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="prayer-card animate-pulse">
            <div className="h-12 bg-[var(--bg-tertiary)] rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {PRAYER_INFO.map(({ key, name, icon }) => (
        <PrayerCard
          key={key}
          prayerKey={key}
          name={name}
          icon={icon}
          time={prayerTimes.timings[key]}
          isActive={displayMode === 'countdown' && currentPrayer === key}
          isCurrent={currentPrayer === key && (displayMode === 'iqamah' || displayMode === 'prayer')}
        />
      ))}
    </div>
  )
}

interface PrayerCardProps {
  prayerKey: PrayerName
  name: string
  icon: string
  time: string
  isActive: boolean
  isCurrent: boolean
}

function PrayerCard({ name, icon, time, isActive, isCurrent }: PrayerCardProps) {
  const countdown = useCountdown(isActive ? time : null)

  const cardClass = isCurrent
    ? 'prayer-card active pulse-active'
    : isActive
    ? 'prayer-card upcoming'
    : 'prayer-card'

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <span className="font-semibold text-base text-white">{name}</span>
            {isActive && !countdown.isComplete && (
              <div className="text-xs text-amber-400 font-medium mt-0.5">
                Dalam {countdown.minutes}:{countdown.seconds.toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
        <div className="font-clock text-xl font-bold text-white">
          {time.replace(/\s*\(.*\)/, '')}
        </div>
      </div>
    </div>
  )
}
