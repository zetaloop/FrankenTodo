"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Task } from "../data/schema"
import { priorities, statuses } from "../data/data"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task?.title || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(task?.description || "")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
    }
  }, [task])

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="w-full mr-8">
              {isEditingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-semibold"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                />
              ) : (
                <DialogTitle 
                  className="cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground px-2 py-1 -ml-2 transition-colors"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title}
                </DialogTitle>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label>说明</Label>
            {isEditingDescription ? (
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                autoFocus
                onBlur={() => setIsEditingDescription(false)}
              />
            ) : (
              <div
                className="cursor-pointer rounded-md bg-accent hover:text-accent-foreground px-3 py-2 min-h-[120px] transition-colors"
                onClick={() => setIsEditingDescription(true)}
              >
                {description ? (
                  description
                ) : (
                  <span className="text-muted-foreground">点击添加任务说明...</span>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>状态</Label>
            <Tabs defaultValue={task.status} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                {statuses.map((status) => (
                  <TabsTrigger key={status.value} value={status.value} className="flex items-center gap-2">
                    {status.icon && (
                      <status.icon className="h-4 w-4" />
                    )}
                    <span>{status.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-2">
            <Label>优先级</Label>
            <Tabs defaultValue={task.priority} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {priorities.map((priority) => (
                  <TabsTrigger key={priority.value} value={priority.value} className="flex items-center gap-2">
                    {priority.icon && (
                      <priority.icon className="h-4 w-4" />
                    )}
                    <span>{priority.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}