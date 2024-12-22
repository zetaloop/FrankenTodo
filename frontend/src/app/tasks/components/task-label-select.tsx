"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { labels as defaultLabels } from "../data/data"
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
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import type { Label as LabelType } from "@/lib/api/types"

interface TaskLabelSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  projectId: string
}

export function TaskLabelSelect({
  value,
  onChange,
  projectId,
}: TaskLabelSelectProps) {
  const [selectedLabels, setSelectedLabels] = React.useState<Set<string>>(
    new Set(value)
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newLabelName, setNewLabelName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [labels, setLabels] = React.useState<LabelType[]>(defaultLabels)

  const fetchLabels = React.useCallback(async () => {
    try {
      const response = await api.labels.getAll(projectId)
      setLabels(response.labels)
    } catch (error) {
      console.error("获取标签列表失败:", error)
    }
  }, [projectId])

  React.useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

  const handleSelect = (labelValue: string) => {
    const newSelectedLabels = new Set(selectedLabels)
    if (newSelectedLabels.has(labelValue)) {
      newSelectedLabels.delete(labelValue)
    } else {
      newSelectedLabels.add(labelValue)
    }
    setSelectedLabels(newSelectedLabels)
    onChange(Array.from(newSelectedLabels))
  }

  const handleCreateLabel = async () => {
    try {
      setIsSubmitting(true)
      const newLabel = await api.labels.create(projectId, {
        value: newLabelName.toLowerCase().replace(/\s+/g, '-'),
        label: newLabelName,
        description: ""
      })
      toast({
        title: "创建成功",
        description: `标签 "${newLabelName}" 已创建`
      })
      // 刷新标签列表
      await fetchLabels()
      // 选中新创建的标签
      handleSelect(newLabel.value)
      setNewLabelName("")
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("创建标签失败:", error)
      toast({
        title: "创建失败",
        description: "创建标签时出现错误，请重试",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="relative w-full">
        <div className="flex items-center gap-2 w-full min-h-10 rounded-md border border-input bg-background px-3 py-2">
          <div className="flex-1 flex flex-wrap gap-1">
            {Array.from(selectedLabels).map(labelValue => {
              const label = labels.find(l => l.value === labelValue)
              if (!label) return null
              return (
                <Badge 
                  key={label.value} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {label.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(label.value)
                    }}
                  />
                </Badge>
              )
            })}
            {selectedLabels.size === 0 && (
              <span className="text-muted-foreground">选择标签...</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[200px]">
                <DropdownMenuGroup>
                  {labels.map((label) => (
                    <DropdownMenuItem
                      key={label.value}
                      onSelect={(e) => {
                        e.preventDefault()
                        handleSelect(label.value)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4">
                          {selectedLabels.has(label.value) && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                        {label.label}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>创建新标签</DialogTitle>
            <DialogDescription>
              添加一个新的标签来分类你的任务
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">标签名称</Label>
              <Input
                id="name"
                autoComplete="disable"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="输入标签名称..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim() || isSubmitting}
            >
              {isSubmitting ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}