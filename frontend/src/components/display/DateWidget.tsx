import type { PrayerTimes } from '../../types'

interface DateWidgetProps {
  showHijri?: boolean
  prayerTimes?: PrayerTimes | null
}

export default function DateWidget({ showHijri = true, prayerTimes }: DateWidgetProps) {
  const today = new Date()
  
  const gregorianDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const hijriDate = prayerTimes?.date?.hijri
    ? `${prayerTimes.date.hijri.day} ${prayerTimes.date.hijri.month.ar} ${prayerTimes.date.hijri.year} H`
    : null

  return (
    <div className="flex flex-col gap-0.5 mt-2">
      <div className="text-base text-[var(--text-secondary)] font-medium">{gregorianDate}</div>
      {showHijri && hijriDate && (
        <div className="text-sm gradient-gold font-semibold">{hijriDate}</div>
      )}
    </div>
  )
}
