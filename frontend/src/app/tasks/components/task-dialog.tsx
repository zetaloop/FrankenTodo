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
import { Task } from "@/lib/api/types"
import { useState, useEffect } from "react"
import { TaskLabelSelect } from "./task-label-select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { priorities, statuses } from "../data/data"
import { Pencil, Tag } from "lucide-react"

interface TaskDialogProps {
  task?: Task
  open: boolean
  projectId: string
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    title: string
    description: string
    status: string
    priority: string
    labels: string[]
  }) => Promise<void>
  mode: "create" | "view" | "edit"
  onDelete?: () => Promise<void>
  onEdit?: () => void
}

export function TaskDialog({
  task,
  open,
  projectId,
  onOpenChange,
  onSubmit,
  mode,
  onDelete,
  onEdit,
}: TaskDialogProps) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [status, setStatus] = useState(task?.status || "todo")
  const [priority, setPriority] = useState(task?.priority || "medium")
  const [labels, setLabels] = useState<string[]>(task?.labels || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title)
        setDescription(task.description || "")
        setStatus(task.status)
        setPriority(task.priority)
        setLabels(task.labels || [])
      } else {
        setTitle("")
        setDescription("")
        setStatus("todo")
        setPriority("medium")
        setLabels([])
      }
      setIsEditingTitle(false)
      setIsEditingDescription(false)
    }
  }, [task, open])

  const handleClose = () => {
    setTitle("")
    setDescription("")
    setStatus("todo")
    setPriority("medium")
    setLabels([])
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      await onSubmit({
        title,
        description,
        status,
        priority,
        labels
      })
      handleClose()
    } catch (error) {
      console.error("提交任务失败:", error)
      setIsSubmitting(false)
    }
  }

  const renderContent = () => {
    if (mode === "view") {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <div className="rounded-md bg-accent px-3 py-2 min-h-[120px]">
                {description ? (
                  description
                ) : (
                  <span className="text-muted-foreground">暂无说明</span>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-1 flex gap-8 whitespace-nowrap items-start">
                <div className="grid gap-2">
                  <Label>状态</Label>
                  <div className="flex items-start gap-2">
                    {(() => {
                      const status_item = statuses.find(s => s.value === status);
                      if (status_item?.icon) {
                        const Icon = status_item.icon;
                        return <Icon className="h-4 w-4 mt-1" />;
                      }
                    })()}
                    <span>{statuses.find(s => s.value === status)?.label}</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>优先级</Label>
                  <div className="flex items-start gap-2">
                    {(() => {
                      const priority_item = priorities.find(p => p.value === priority);
                      if (priority_item?.icon) {
                        const Icon = priority_item.icon;
                        return <Icon className="h-4 w-4 mt-1" />;
                      }
                    })()}
                    <span>{priorities.find(p => p.value === priority)?.label}</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>标签</Label>
                  {labels.length > 0 ? (
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 shrink-0 mt-1" />
                      <span className="whitespace-normal max-w-[250px] break-all">
                        {labels.join(", ")}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">暂无标签</span>
                  )}
                </div>
              </div>

              {onEdit && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onEdit}
                  className="h-10 w-10 ml-4"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </>
      )
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "创建新任务" : "编辑任务"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "创建一个新的任务来跟踪工作进度" 
              : "修改任务的详细信息"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">任务标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">任务描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入任务描述..."
            />
          </div>
          <div className="grid gap-2">
            <Label>状态</Label>
            <Tabs value={status} onValueChange={setStatus} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {statuses.map((s) => (
                  <TabsTrigger key={s.value} value={s.value} className="flex items-center gap-2">
                    {s.icon && <s.icon className="h-4 w-4" />}
                    <span>{s.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>标签</Label>
              <TaskLabelSelect 
                value={labels}
                onChange={setLabels}
                projectId={projectId}
              />
            </div>
            <div className="grid gap-2">
              <Label>优先级</Label>
              <Tabs value={priority} onValueChange={setPriority} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {priorities.map((p) => (
                    <TabsTrigger 
                      key={p.value} 
                      value={p.value} 
                      className="flex items-center gap-2"
                    >
                      {p.icon && <p.icon className="h-4 w-4" />}
                      <span>{p.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex-1 text-left">
            {mode === "edit" && onDelete && (
              <Button 
                variant="link" 
                className="text-destructive"
                onClick={onDelete}
              >
                删除任务
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? "提交中..." : "确定"}
            </Button>
          </div>
        </DialogFooter>
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
} 