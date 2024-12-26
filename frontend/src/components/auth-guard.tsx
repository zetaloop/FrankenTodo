"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

const publicPaths = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // 路由变化时重新检查认证状态
  useEffect(() => {
    if (!isLoading) {
      checkAuth()
    }
  }, [pathname, checkAuth, isLoading])

  useEffect(() => {
    if (isLoading) return

    if (!user && !publicPaths.includes(pathname)) {
      router.push("/login")
    } else if (user && publicPaths.includes(pathname)) {
      router.push("/")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        {/* 顶部区域骨架 */}
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-1">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        {/* 内容区域骨架 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="rounded-md border">
            <Skeleton className="h-[450px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 