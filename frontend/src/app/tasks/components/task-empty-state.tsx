import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskEmptyStateProps {
  isFiltered: boolean
  onCreateTask: () => void
}

export function TaskEmptyState({ isFiltered, onCreateTask }: TaskEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">没有找到任务</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            尝试调整搜索或筛选条件来查看更多任务。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">还没有任何任务</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          创建第一个任务来开始项目进程。
        </p>
        <Button onClick={onCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          创建新任务
        </Button>
      </div>
    </div>
  )
} 