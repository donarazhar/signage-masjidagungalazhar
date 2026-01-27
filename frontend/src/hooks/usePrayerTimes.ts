import { useQuery } from '@tanstack/react-query'
import { displayService } from '../services/displayService'

export function usePrayerTimes() {
  return useQuery({
    queryKey: ['prayerTimes'],
    queryFn: () => displayService.getPrayerTimes(),
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
    staleTime: 1000 * 60 * 30, // Consider stale after 30 minutes
  })
}
