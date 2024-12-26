"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

const publicPaths = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user && !publicPaths.includes(pathname)) {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // 如果是公开路径或者用户已登录，显示内容
  if (publicPaths.includes(pathname) || user) {
    return <>{children}</>
  }

  // 其他情况（比如未登录且不是公开路径）不显示任何内容
  return null
} 