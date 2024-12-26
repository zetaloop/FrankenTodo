import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectErrorStateProps {
  onRetry: () => void
}

export function ProjectErrorState({ onRetry }: ProjectErrorStateProps) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="mt-4 text-lg font-semibold">项目加载失败</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          获取项目列表时发生错误，请检查网络连接后重试。
        </p>
        <Button onClick={onRetry}>
          重新加载
        </Button>
      </div>
    </div>
  )
} 