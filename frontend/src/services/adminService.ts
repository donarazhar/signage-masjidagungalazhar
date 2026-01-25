import api from './api'
import type { Content, RunningText, Financial, FinancialSummary, Event, Donation, Hadith } from '../types'

export const adminService = {
  // Settings
  async updateSetting(key: string, value: unknown, type: string = 'string') {
    const response = await api.put(`/settings/${key}`, { value, type })
    return response.data
  },

  async bulkUpdateSettings(settings: Array<{ key: string; value: unknown; type?: string }>) {
    const response = await api.put('/settings/bulk', { settings })
    return response.data
  },

  // Contents
  async getContents(): Promise<Content[]> {
    const response = await api.get<Content[]>('/contents')
    return response.data
  },

  async uploadContent(formData: FormData) {
    const response = await api.post('/contents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async updateContent(id: number, data: Partial<Content>) {
    const response = await api.put(`/contents/${id}`, data)
    return response.data
  },

  async deleteContent(id: number) {
    const response = await api.delete(`/contents/${id}`)
    return response.data
  },

  async toggleContent(id: number) {
    const response = await api.put(`/contents/${id}/toggle`)
    return response.data
  },

  async reorderContents(orders: Array<{ id: number; priority: number }>) {
    const response = await api.put('/contents/reorder', { orders })
    return response.data
  },

  // Running Texts
  async getRunningTexts(): Promise<RunningText[]> {
    const response = await api.get<RunningText[]>('/running-texts')
    return response.data
  },

  async createRunningText(data: Partial<RunningText>) {
    const response = await api.post('/running-texts', data)
    return response.data
  },

  async updateRunningText(id: number, data: Partial<RunningText>) {
    const response = await api.put(`/running-texts/${id}`, data)
    return response.data
  },

  async deleteRunningText(id: number) {
    const response = await api.delete(`/running-texts/${id}`)
    return response.data
  },

  async toggleRunningText(id: number) {
    const response = await api.put(`/running-texts/${id}/toggle`)
    return response.data
  },

  // Financials
  async getFinancials(from?: string, to?: string): Promise<Financial[]> {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    const response = await api.get<Financial[]>(`/financials?${params}`)
    return response.data
  },

  async getFinancialSummary(): Promise<FinancialSummary> {
    const response = await api.get<FinancialSummary>('/financials/summary')
    return response.data
  },

  async createFinancial(data: Partial<Financial>) {
    const response = await api.post('/financials', data)
    return response.data
  },

  async updateFinancial(id: number, data: Partial<Financial>) {
    const response = await api.put(`/financials/${id}`, data)
    return response.data
  },

  async deleteFinancial(id: number) {
    const response = await api.delete(`/financials/${id}`)
    return response.data
  },

  // Events
  async getEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events')
    return response.data
  },

  async createEvent(data: Partial<Event>) {
    const response = await api.post('/events', data)
    return response.data
  },

  async updateEvent(id: number, data: Partial<Event>) {
    const response = await api.put(`/events/${id}`, data)
    return response.data
  },

  async deleteEvent(id: number) {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },

  async toggleEvent(id: number) {
    const response = await api.put(`/events/${id}/toggle`)
    return response.data
  },

  // Donations
  async getDonations(): Promise<Donation[]> {
    const response = await api.get<Donation[]>('/donations')
    return response.data
  },

  async createDonation(data: Partial<Donation>) {
    const response = await api.post('/donations', data)
    return response.data
  },

  async updateDonation(id: number, data: Partial<Donation>) {
    const response = await api.put(`/donations/${id}`, data)
    return response.data
  },

  async deleteDonation(id: number) {
    const response = await api.delete(`/donations/${id}`)
    return response.data
  },

  async toggleDonation(id: number) {
    const response = await api.put(`/donations/${id}/toggle`)
    return response.data
  },

  // Hadiths
  async getHadiths(): Promise<Hadith[]> {
    const response = await api.get<Hadith[]>('/hadiths')
    return response.data
  },

  async createHadith(data: Partial<Hadith>) {
    const response = await api.post('/hadiths', data)
    return response.data
  },

  async updateHadith(id: number, data: Partial<Hadith>) {
    const response = await api.put(`/hadiths/${id}`, data)
    return response.data
  },

  async deleteHadith(id: number) {
    const response = await api.delete(`/hadiths/${id}`)
    return response.data
  },

  async toggleHadith(id: number) {
    const response = await api.put(`/hadiths/${id}/toggle`)
    return response.data
  },
}
