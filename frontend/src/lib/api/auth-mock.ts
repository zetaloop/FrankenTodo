import type { User, LoginResponse } from './types'

export interface TokenInfo {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

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
  }): Promise<LoginResponse> {
    const response = {
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: mockUser
    }
    
    // 保存 token 信息
    this.saveTokenInfo(response)
    
    return response
  },

  async logout(): Promise<void> {
    this.clearTokenInfo()
    return Promise.resolve()
  },

  async refreshToken(): Promise<LoginResponse> {
    const response = {
      accessToken: "mock_refreshed_token",
      refreshToken: "mock_refreshed_refresh_token",
      tokenType: "Bearer",
      expiresIn: 3600,
      user: mockUser
    }
    
    // 保存新的 token 信息
    this.saveTokenInfo(response)
    
    return response
  },

  saveTokenInfo(tokenInfo: TokenInfo) {
    try {
      localStorage.setItem('accessToken', tokenInfo.accessToken)
      localStorage.setItem('refreshToken', tokenInfo.refreshToken)
      localStorage.setItem('tokenType', tokenInfo.tokenType)
      localStorage.setItem('tokenExpiresAt', String(Date.now() + tokenInfo.expiresIn * 1000))
    } catch (error) {
      console.error('Failed to save token info:', error)
    }
  },

  clearTokenInfo() {
    try {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenType')
      localStorage.removeItem('tokenExpiresAt')
    } catch (error) {
      console.error('Failed to clear token info:', error)
    }
  },

  getAccessToken(): string | null {
    try {
      return localStorage.getItem('accessToken')
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken')
    } catch (error) {
      console.error('Failed to get refresh token:', error)
      return null
    }
  },

  isTokenExpired(): boolean {
    try {
      const expiresAt = localStorage.getItem('tokenExpiresAt')
      if (!expiresAt) return true
      return Date.now() > parseInt(expiresAt, 10)
    } catch (error) {
      console.error('Failed to check token expiration:', error)
      return true
    }
  }
} 