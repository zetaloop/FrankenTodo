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

/**
 * 尝试请求接口，如果401/403（token过期），可以选择刷新并重试
 *
 * @param endpoint - API地址(不含baseUrl)
 * @param options - fetch的请求配置
 * @param retryAttempt - 是否已经重试过一次
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  retryAttempt = false
): Promise<T> {
  // 1. 构造 headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // 如果是刷新 token 的请求,使用 refreshToken
  const isRefreshRequest = endpoint === '/auth/refresh'
  const token = isRefreshRequest ? authApi.getRefreshToken() : authApi.getAccessToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // 2. 执行请求
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // 3. 如果成功且非204，直接返回JSON
  if (response.ok) {
    // 204 No Content
    if (response.status === 204) {
      return null as T
    }
    return response.json()
  }

  // 4. 如果不成功，拿到错误信息
  let error: ApiError
  try {
    const errorData = await response.json()
    error = new ApiError(
      errorData.error?.code || 'UNKNOWN_ERROR',
      errorData.error?.message || 'An error occurred',
      errorData.error?.details
    )
  } catch {
    error = new ApiError(
      'UNKNOWN_ERROR',
      response.statusText || 'An error occurred',
      { status: response.status }
    )
  }

  // 5. 如果是401或403（Unauthorized/Forbidden）并且还没有重试过
  if ((response.status === 401 || response.status === 403) && !retryAttempt) {
    try {
      // 5.1 刷新 Token
      await authApi.refreshToken() 
      // 5.2 刷新成功后，带着新的token再试一次
      return fetchApi<T>(endpoint, options, true)
    } catch {
      // 如果刷新失败，则继续向下抛出，前端可以清空 Token，跳转登录等
      authApi.clearTokenInfo()
      throw error
    }
  }

  // 6. 其他情况直接抛出
  throw error
} 