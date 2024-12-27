"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { User } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })

  // 检查认证状态
  const checkAuth = useCallback(async () => {
    try {
      const token = api.auth.getAccessToken()
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // 如果 token 过期,尝试刷新
      if (api.auth.isTokenExpired()) {
        try {
          await api.auth.refreshToken()
        } catch {
          // 刷新失败,清除 token 并返回
          api.auth.clearTokenInfo()
          setState({ user: null, isLoading: false, error: null })
          return
        }
      }
      
      // 获取用户信息
      const user = await api.user.getCurrentUser()
      setState({ user, isLoading: false, error: null })
    } catch (error) {
      // 只有在非 401/403 错误时才清除 token
      // 401/403 错误会在 fetchApi 中处理
      if (error instanceof Error && error.name === 'ApiError') {
        const apiError = error as ApiError
        if (apiError.code !== 'UNAUTHORIZED' && apiError.code !== 'FORBIDDEN') {
          api.auth.clearTokenInfo()
        }
      }
      setState({ user: null, isLoading: false, error: null })
    }
  }, [])

  // 同步检查认证状态（不发送请求）
  const checkAuthSync = useCallback(() => {
    const token = api.auth.getAccessToken()
    return token && !api.auth.isTokenExpired()
  }, [])

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      await api.auth.login({ email, password })
      
      // 确保 token 已写入
      if (!checkAuthSync()) {
        throw new Error("登录失败：无法获取认证信息")
      }
      
      // 获取用户信息
      await checkAuth()
      
      // 再次确认认证状态
      if (checkAuthSync()) {
        router.push("/")
      } else {
        throw new Error("登录失败：认证状态无效")
      }
    } catch (error: Error | unknown) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "登录失败",
      }))
      throw error
    }
  }

  // 注册
  const register = async (username: string, email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      await api.auth.register({ username, email, password })
      // 注册成功后自动登录
      await login(email, password)
    } catch (error: Error | unknown) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "注册失败",
      }))
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await api.auth.logout()
    } finally {
      setState({ user: null, isLoading: false, error: null })
      router.push("/login")
    }
  }

  // 组件加载时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    checkAuth,
  }
} 