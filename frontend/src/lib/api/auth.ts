import { fetchApi } from './client'
import type { User, LoginResponse } from './types'

export interface TokenInfo {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

let refreshPromise: Promise<TokenInfo> | null = null

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

  async refreshToken(): Promise<TokenInfo> {
    // 如果已经有刷新请求在进行中，直接返回该 Promise
    if (refreshPromise) {
      return refreshPromise
    }

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token')
    }

    // 创建新的刷新请求
    refreshPromise = fetchApi<LoginResponse>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }).then(response => {
      const tokenInfo = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenType: response.tokenType,
        expiresIn: response.expiresIn,
      }
      this.saveTokenInfo(tokenInfo)
      return tokenInfo
    }).finally(() => {
      refreshPromise = null
    })

    return refreshPromise
  },

  saveTokenInfo(tokenInfo: TokenInfo) {
    localStorage.setItem('accessToken', tokenInfo.accessToken)
    localStorage.setItem('refreshToken', tokenInfo.refreshToken)
    localStorage.setItem('tokenType', tokenInfo.tokenType)
    localStorage.setItem('tokenExpiresAt', String(Date.now() + tokenInfo.expiresIn * 1000))
  },

  clearTokenInfo() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenType')
    localStorage.removeItem('tokenExpiresAt')
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  },

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('tokenExpiresAt')
    if (!expiresAt) return true
    
    // 如果 token 将在 5 分钟内过期，也视为过期
    const expirationTime = parseInt(expiresAt, 10)
    return Date.now() + 5 * 60 * 1000 > expirationTime
  }
} 