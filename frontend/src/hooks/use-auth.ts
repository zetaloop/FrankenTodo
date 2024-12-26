"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { User } from "@/lib/api/types"

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
    const token = api.auth.getAccessToken()
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      // 如果 token 快过期，先刷新
      if (api.auth.isTokenExpired()) {
        await api.auth.refreshToken()
      }
      
      // 获取用户信息
      const user = await api.user.getCurrentUser()
      setState({ user, isLoading: false, error: null })
    } catch {
      api.auth.clearTokenInfo()
      setState({ user: null, isLoading: false, error: null })
      router.push("/login")
    }
  }, [router])

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await api.auth.login({ email, password })
      setState({
        user: response.user,
        isLoading: false,
        error: null,
      })
      router.push("/tasks")
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
  }
} 