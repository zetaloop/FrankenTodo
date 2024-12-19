// API 客户端基础配置

const API_BASE_URL = '/api/v1'

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = localStorage.getItem('access_token')
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
    return null
  }

  return response.json()
} 