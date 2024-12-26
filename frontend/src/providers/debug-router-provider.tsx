"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

// 路由调试器
// 请在 src/app/layout.tsx 中启用 DebugRouterProvider
// 请在 next.config.ts 中启用源码映射

function getCallerInfo() {
  const error = new Error()
  const stack = error.stack?.split('\n')
  
  // 跳过前两行（Error 和 getCallerInfo 自身）
  const relevantStack = stack?.slice(2)
    .map(line => {
      // 匹配更宽松的堆栈信息格式
      const match = line.match(/at\s+([^(]+)?\s*\(?(.*?):(\d+):(\d+)\)?/)
      if (match) {
        const [, rawCaller, file, line, col] = match
        const caller = rawCaller?.trim() || '(anonymous)'
        // 获取更多文件路径信息
        const fileSegments = file.split('/')
        const shortFile = fileSegments.slice(-3).join('/')
        return `${caller} (${shortFile}:${line}:${col})`
      }
      return null
    })
    .filter(Boolean)
    .slice(0, 3)  // 只显示前3个调用者
  
  if (!relevantStack?.length) {
    return '未知位置'
  }

  return relevantStack.join('\n    ↑ ')
}

function RouteLogger() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 路由变化时的回调
    console.log(
      `%c[路由调试]%c 路由变化: ${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}\n调用栈:\n    ${getCallerInfo()}`,
      'color: #4CAF50; font-weight: bold',
      'color: inherit'
    )
  }, [pathname, searchParams])

  return null
}

export function DebugRouterProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <RouteLogger />
      </Suspense>
      {children}
    </>
  )
} 