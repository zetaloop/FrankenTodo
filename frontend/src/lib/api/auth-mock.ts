import type { User, LoginResponse, TokenInfo } from './types'

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
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
      token_type: "Bearer",
      expires_in: 3600,
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
      access_token: "mock_refreshed_token",
      refresh_token: "mock_refreshed_refresh_token",
      token_type: "Bearer",
      expires_in: 3600,
      user: mockUser
    }
    
    // 保存新的 token 信息
    this.saveTokenInfo(response)
    
    return response
  },

  saveTokenInfo(tokenInfo: TokenInfo) {
    try {
      localStorage.setItem('access_token', tokenInfo.access_token)
      localStorage.setItem('refresh_token', tokenInfo.refresh_token)
      localStorage.setItem('token_type', tokenInfo.token_type)
      localStorage.setItem('token_expires_at', String(Date.now() + tokenInfo.expires_in * 1000))
    } catch (error) {
      console.error('Failed to save token info:', error)
    }
  },

  clearTokenInfo() {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('token_type')
      localStorage.removeItem('token_expires_at')
    } catch (error) {
      console.error('Failed to clear token info:', error)
    }
  },

  getAccessToken(): string | null {
    try {
      return localStorage.getItem('access_token')
    } catch (error) {
      console.error('Failed to get access token:', error)
      return null
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refresh_token')
    } catch (error) {
      console.error('Failed to get refresh token:', error)
      return null
    }
  },

  isTokenExpired(): boolean {
    try {
      const expiresAt = localStorage.getItem('token_expires_at')
      if (!expiresAt) return true
      return Date.now() > parseInt(expiresAt, 10)
    } catch (error) {
      console.error('Failed to check token expiration:', error)
      return true
    }
  }
} 