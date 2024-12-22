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
import { labels } from "../data/data"
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

interface TaskLabelSelectProps {
  value: string
  onChange: (value: string) => void
}

export function TaskLabelSelect({
  value,
  onChange,
}: TaskLabelSelectProps) {
  const [selectedLabels, setSelectedLabels] = React.useState<Set<string>>(
    new Set(value ? [value] : [])
  )
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [newLabelName, setNewLabelName] = React.useState("")

  const handleSelect = (labelValue: string) => {
    const newSelectedLabels = new Set(selectedLabels)
    if (newSelectedLabels.has(labelValue)) {
      newSelectedLabels.delete(labelValue)
    } else {
      newSelectedLabels.add(labelValue)
    }
    setSelectedLabels(newSelectedLabels)
    onChange(Array.from(newSelectedLabels)[0] || "")
  }

  const handleCreateLabel = () => {
    // TODO: 实现创建标签的逻辑
    console.log("创建新标签:", newLabelName)
    setNewLabelName("")
    setIsCreateDialogOpen(false)
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
              disabled={!newLabelName.trim()}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}