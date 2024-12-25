import type { User } from './types'

const mockUser: User = {
  id: "user-123",
  username: "johndoe",
  email: "johndoe@example.com",
  created_at: "2024-12-19T09:00:00Z",
  updated_at: "2024-12-19T09:00:00Z"
}

export const authApiMock = {
  async register(data: {
    username: string
    email: string
    password: string
  }): Promise<User> {
    return {
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      username: data.username,
      email: data.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(data: {
    email: string
    password: string
  }): Promise<{
    access_token: string
    token_type: string
    expires_in: number
    user: User
  }> {
    return {
      access_token: "mock_access_token",
      token_type: "Bearer",
      expires_in: 3600,
      user: mockUser
    }
  },

  async logout(): Promise<void> {
    return Promise.resolve()
  },

  async refreshToken(): Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }> {
    return {
      access_token: "mock_refreshed_token",
      token_type: "Bearer",
      expires_in: 3600
    }
  }
} 