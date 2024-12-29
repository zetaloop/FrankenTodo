"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

const publicPaths = ["/login", "/register"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const lastPathRef = useRef(pathname)
  const checkingRef = useRef(false)

  // 路由变化时重新检查认证状态
  useEffect(() => {
    if (isLoading || checkingRef.current) return
    
    // 只在路径真正变化时才检查
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname
      checkingRef.current = true
      checkAuth().catch(() => {
        toast({
          title: "登录已过期",
          description: "请重新登录",
          variant: "destructive"
        })
      }).finally(() => {
        checkingRef.current = false
      })
    }
  }, [pathname, checkAuth, isLoading])

  // 根据认证状态进行路由重定向
  useEffect(() => {
    if (isLoading || checkingRef.current) return

    const isPublicPath = publicPaths.includes(pathname)
    if (!user && !isPublicPath) {
      toast({
        title: "未登录",
        description: "请先登录",
        variant: "destructive"
      })
      lastPathRef.current = "/login"
      router.push("/login")
    } else if (user && isPublicPath) {
      lastPathRef.current = "/"
      router.push("/")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="hidden h-full flex-1 flex-col p-8 md:flex">
        {/* 顶部区域骨架 */}
        <div className="flex items-center justify-between space-y-2 mb-8">
          <div className="space-y-1">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        {/* 内容区域骨架 */}
        <div className="space-y-4 mt-[4px]">
          {/* 工具栏骨架 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          {/* 表格骨架 */}
          <div className="rounded-md border">
            <Skeleton className="h-[450px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 