import { fetchApi } from './client'
import type { User, LoginResponse } from './types'

export interface TokenInfo {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

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
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      tokenType: response.tokenType,
      expiresIn: response.expiresIn,
    })
    
    return response
  },

  async logout(): Promise<void> {
    await fetchApi('/auth/logout', {
      method: 'POST',
    })
    this.clearTokenInfo()
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