import { fetchApi } from './client'
import type { User, LoginResponse, TokenInfo } from './types'

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
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // 保存 token 信息
    this.saveTokenInfo({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      token_type: response.token_type,
      expires_in: response.expires_in,
    })
    
    return response
  },

  async logout(): Promise<void> {
    await fetchApi('/auth/logout', {
      method: 'POST',
    })
    this.clearTokenInfo()
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetchApi<LoginResponse>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    })

    // 保存新的 token 信息
    this.saveTokenInfo({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      token_type: response.token_type,
      expires_in: response.expires_in,
    })

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