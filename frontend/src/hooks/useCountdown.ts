import { useState, useEffect, useCallback, useRef } from 'react'

interface CountdownResult {
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isComplete: boolean
}

export function useCountdown(targetTime: string | null, onComplete?: () => void): CountdownResult {
  const [countdown, setCountdown] = useState<CountdownResult>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isComplete: false,
  })
  
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const calculateCountdown = useCallback(() => {
    if (!targetTime) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isComplete: true }
    }

    const now = new Date()
    const [hours, minutes] = targetTime.split(':').map(Number)
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)

    // If target is in the past, it's complete
    if (target <= now) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isComplete: true }
    }

    const diff = Math.floor((target.getTime() - now.getTime()) / 1000)
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    const s = diff % 60

    return {
      hours: h,
      minutes: m,
      seconds: s,
      totalSeconds: diff,
      isComplete: false,
    }
  }, [targetTime])

  useEffect(() => {
    const update = () => {
      const result = calculateCountdown()
      setCountdown(result)
      
      if (result.isComplete && onCompleteRef.current) {
        onCompleteRef.current()
      }
    }

    update()
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [calculateCountdown])

  return countdown
}

export function useCountdownMinutes(minutes: number, onComplete?: () => void): CountdownResult {
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState<CountdownResult>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isComplete: false,
  })

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const end = new Date()
    end.setMinutes(end.getMinutes() + minutes)
    setEndTime(end)
  }, [minutes])

  useEffect(() => {
    if (!endTime) return

    const update = () => {
      const now = new Date()
      const diff = Math.floor((endTime.getTime() - now.getTime()) / 1000)

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isComplete: true })
        if (onCompleteRef.current) {
          onCompleteRef.current()
        }
        return
      }

      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60

      setCountdown({
        hours: h,
        minutes: m,
        seconds: s,
        totalSeconds: diff,
        isComplete: false,
      })
    }

    update()
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  return countdown
}
