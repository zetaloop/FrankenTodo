import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectEmptyStateProps {
  onCreateProject: () => void
}

export function ProjectEmptyState({ onCreateProject }: ProjectEmptyStateProps) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">没有选择项目</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          请从上方选择一个项目，或者创建新项目来开始管理任务。
        </p>
        <Button onClick={onCreateProject}>
          创建新项目
        </Button>
      </div>
    </div>
  )
} 