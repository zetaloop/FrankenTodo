import { FolderOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProjectEmptyStateProps {
  onCreateProject: () => void
  onOpenProjectSelect: () => void
}

export function ProjectEmptyState({ 
  onCreateProject, 
  onOpenProjectSelect 
}: ProjectEmptyStateProps) {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">没有选择项目</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          请选择一个项目，或者创建一个新项目来开始管理任务。
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onOpenProjectSelect}>
            选择项目
          </Button>
          <Button onClick={onCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </div>
      </div>
    </div>
  )
} 