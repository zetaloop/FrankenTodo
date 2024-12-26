"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      // 验证 token 是否过期
      const response = await api.auth.refreshToken()
      localStorage.setItem("accessToken", response.accessToken)
      
      // 获取用户信息
      const user = await api.user.getCurrentUser()
      setState({ user, isLoading: false, error: null })
    } catch (error) {
      localStorage.removeItem("accessToken")
      setState({ user: null, isLoading: false, error: null })
      router.push("/login")
    }
  }

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await api.auth.login({ email, password })
      localStorage.setItem("accessToken", response.accessToken)
      
      setState({
        user: response.user,
        isLoading: false,
        error: null,
      })
      router.push("/tasks")
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "登录失败",
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
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "注册失败",
      }))
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await api.auth.logout()
    } finally {
      localStorage.removeItem("accessToken")
      setState({ user: null, isLoading: false, error: null })
      router.push("/login")
    }
  }

  // 组件加载时检查认证状态
  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
  }
} 