import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Project } from "@/lib/api/types"
import { useState, useEffect } from "react"

interface ProjectDialogProps {
  project?: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; description: string }) => Promise<void>
  mode: "create" | "edit"
}

export function ProjectDialog({
  project,
  open,
  onOpenChange,
  onSubmit,
  mode
}: ProjectDialogProps) {
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      if (project) {
        setName(project.name)
        setDescription(project.description)
      } else {
        setName("")
        setDescription("")
      }
    }
  }, [project, open])

  const handleClose = () => {
    setName("")
    setDescription("")
    setIsSubmitting(false)
    setTimeout(() => {
      onOpenChange(false)
    }, 0)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmit({ name, description })
      handleClose()
    } catch (error) {
      console.error("提交项目失败:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "新建项目" : "编辑项目"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "创建一个新的项目来组织你的任务" 
              : "修改项目的基本信息"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">项目名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">项目描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入项目描述..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? "提交中..." : "确定"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 