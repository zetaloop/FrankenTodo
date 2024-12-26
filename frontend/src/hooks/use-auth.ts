"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  username: string
  email: string
}

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
    const token = localStorage.getItem("access_token")
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      // 验证 token 是否过期
      const response = await api.auth.refreshToken()
      localStorage.setItem("access_token", response.access_token)
      
      // 获取用户信息
      const user = await api.user.getCurrentUser()
      setState({ user, isLoading: false, error: null })
    } catch (error) {
      localStorage.removeItem("access_token")
      setState({ user: null, isLoading: false, error: null })
      router.push("/login")
    }
  }

  // 登录
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      const response = await api.auth.login({ email, password })
      localStorage.setItem("access_token", response.access_token)
      
      // 获取用户信息
      const user = await api.user.getCurrentUser()
      setState({
        user,
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
      localStorage.removeItem("access_token")
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