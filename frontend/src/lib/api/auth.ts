import { fetchApi } from './client'
import type { User, LoginResponse } from './types'

export const authApi = {
  async register(data: {
    username: string
    email: string
    password: string
  }): Promise<User> {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async login(data: {
    email: string
    password: string
  }): Promise<LoginResponse> {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async logout(): Promise<void> {
    return fetchApi('/auth/logout', {
      method: 'POST',
    })
  },

  async refreshToken(): Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }> {
    return fetchApi('/auth/refresh', {
      method: 'POST',
    })
  }
} 