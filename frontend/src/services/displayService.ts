import api from './api'
import type { PrayerTimes, Settings, Event, Donation, Hadith } from '../types'

export const displayService = {
  // Get all settings (public)
  async getSettings(): Promise<Settings> {
    const response = await api.get<Settings>('/settings')
    return response.data
  },

  // Get today's prayer times (public)
  async getPrayerTimes(): Promise<PrayerTimes> {
    const response = await api.get<PrayerTimes>('/prayer-times')
    return response.data
  },

  // Get active contents (public)
  async getActiveContents() {
    const response = await api.get('/contents/active')
    return response.data
  },

  // Get active running texts (public)
  async getActiveRunningTexts() {
    const response = await api.get('/running-texts/active')
    return response.data
  },

  // Get financial summary (public)
  async getFinancialSummary() {
    const response = await api.get('/financials/summary')
    return response.data
  },

  // Get upcoming events (public)
  async getUpcomingEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events/upcoming')
    return response.data
  },

  // Get active donations (public)
  async getActiveDonations(): Promise<Donation[]> {
    const response = await api.get<Donation[]>('/donations/active')
    return response.data
  },

  // Get active hadiths (public) - returns array for rotation
  async getActiveHadiths(): Promise<Hadith[]> {
    const response = await api.get<Hadith[]>('/hadiths/active')
    return response.data
  },
}
