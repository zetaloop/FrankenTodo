import { fetchApi } from './client'
import type { User, UserSettings } from './types'

export const userApi = {
  async getCurrentUser(): Promise<User> {
    return fetchApi('/user')
  },

  async updateSettings(data: {
    theme?: string
    notifications_enabled?: boolean
  }): Promise<UserSettings> {
    return fetchApi('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
} 