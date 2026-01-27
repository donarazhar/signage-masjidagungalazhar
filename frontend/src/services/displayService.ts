import api from './api'
import type { PrayerTimes, Settings, Event, Donation, Hadith } from '../types'

/**
 * Get mosque parameter for API requests
 * Priority: explicit slug > URL query params
 */
const getMosqueParam = (slug?: string) => {
  // If slug is explicitly provided (from URL path), use it
  if (slug) {
    return { m: slug }
  }
  
  // Fallback to query parameters
  const params = new URLSearchParams(window.location.search)
  
  const mosqueId = params.get('mosque_id')
  if (mosqueId) return { mosque_id: mosqueId }
  
  const m = params.get('m')
  if (m) return { m }
  
  return {}
}

export const displayService = {
  // Get all settings (public)
  async getSettings(slug?: string): Promise<Settings> {
    const response = await api.get<Settings>('/settings', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get today's prayer times (public)
  async getPrayerTimes(slug?: string): Promise<PrayerTimes> {
    const response = await api.get<PrayerTimes>('/prayer-times', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get active contents (public)
  async getActiveContents(slug?: string) {
    const response = await api.get('/contents/active', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get active running texts (public)
  async getActiveRunningTexts(slug?: string) {
    const response = await api.get('/running-texts/active', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get financial summary (public)
  async getFinancialSummary(slug?: string) {
    const response = await api.get('/financials/summary', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get upcoming events (public)
  async getUpcomingEvents(slug?: string): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/upcoming', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get active donations (public)
  async getActiveDonations(slug?: string): Promise<Donation[]> {
    const response = await api.get<Donation[]>('/donations/active', { params: getMosqueParam(slug) })
    return response.data
  },

  // Get active hadiths (public) - returns array for rotation
  async getActiveHadiths(slug?: string): Promise<Hadith[]> {
    const response = await api.get<Hadith[]>('/hadiths/active', { params: getMosqueParam(slug) })
    return response.data
  },
}
