// API 客户端基础配置
import { authApi } from './auth'

const API_BASE_URL = '/api/v1'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 如果是刷新 token 的请求，直接发送
  if (endpoint === '/auth/refresh') {
    return sendRequest<T>(endpoint, options)
  }

  // 检查 token 是否需要刷新
  if (authApi.isTokenExpired()) {
    try {
      await authApi.refreshToken()
    } catch (error) {
      // 如果刷新失败，清除 token 信息
      authApi.clearTokenInfo()
      throw error
    }
  }

  return sendRequest<T>(endpoint, options)
}

async function sendRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const token = authApi.getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new ApiError(
      error.error.code,
      error.error.message,
      error.error.details
    )
  }

  // 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
} 