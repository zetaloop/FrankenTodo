// API 响应和请求的类型定义

export interface User {
  id: string
  username: string
  email: string
  created_at: string
  updated_at?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, string>
  }
}

export type Project = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  title: string
  description: string
  status: string
  priority: string
  labels: string[]
} & BaseModel

export type Label = string

export type UserSettings = {
  theme: string
  notifications_enabled: boolean
  updated_at: string
}

export type ProjectMember = {
  id: string
  username: string
  email: string
  role: 'owner' | 'member'
}

export type BaseModel = {
  created_at: string
  updated_at?: string
}

export interface TokenInfo {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
} 