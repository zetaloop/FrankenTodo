import type { User, UserSettings } from './types'

const mockUser: User = {
  id: "user-123",
  username: "johndoe",
  email: "johndoe@example.com",
  created_at: "2024-12-19T09:00:00Z",
  updated_at: "2024-12-19T09:00:00Z"
}

const mockSettings: UserSettings = {
  theme: "light",
  notifications_enabled: true,
  updated_at: "2024-12-19T09:00:00Z"
}

export const userApiMock = {
  async getCurrentUser(): Promise<User> {
    return mockUser
  },

  async updateProfile(data: {
    username?: string
    email?: string
  }): Promise<User> {
    return {
      ...mockUser,
      ...data,
      updated_at: new Date().toISOString()
    }
  },

  async getSettings(): Promise<UserSettings> {
    return mockSettings
  },

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return {
      ...mockSettings,
      ...data,
      updated_at: new Date().toISOString()
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async changePassword(data: {
    current_password: string
    new_password: string
  }): Promise<void> {
    return Promise.resolve()
  }
} 