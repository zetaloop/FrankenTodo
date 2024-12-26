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
    let error: ApiError
    try {
      const errorData = await response.json()
      error = new ApiError(
        errorData.error.code,
        errorData.error.message,
        errorData.error.details
      )
    } catch {
      error = new ApiError(
        'UNKNOWN_ERROR',
        response.statusText || 'An error occurred',
        { status: response.status }
      )
    }
    throw error
  }

  // 204 No Content
  if (response.status === 204) {
    return null as T
  }

  return response.json()
} 