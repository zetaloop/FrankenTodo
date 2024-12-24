"use client"

import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Check, Filter, Plus, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { Label } from "@/lib/api/types"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label as UILabel } from "@/components/ui/label"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface DataTableLabelFilterProps<TData, TValue> {
    column?: Column<TData, TValue>
    title?: string
    labels: Label[]
    projectId: string
    onLabelsChange: () => void
    onTasksChange?: () => void
}

export function DataTableLabelFilter<TData, TValue>({
    column,
    title,
    labels,
    projectId,
    onLabelsChange,
    onTasksChange,
}: DataTableLabelFilterProps<TData, TValue>) {
    const facets = column?.getFacetedUniqueValues()
    const selectedValues = new Set(column?.getFilterValue() as string[])
    const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
    const [newLabelName, setNewLabelName] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const getLabelCount = (label: string) => {
        if (!column) return 0
        if (column.id === 'labels') {
            let count = 0
            column.getFacetedRowModel().rows.forEach(row => {
                const labels = row.getValue<string[]>('labels')
                if (labels?.includes(label)) {
                    count++
                }
            })
            return count
        }
        return facets?.get(label)
    }

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) return
        try {
            setIsSubmitting(true)
            await api.labels.create(projectId, newLabelName)
            toast({
                title: "创建成功",
                description: `标签 "${newLabelName}" 已创建`
            })
            setCreateDialogOpen(false)
            setNewLabelName("")
            onLabelsChange()
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

    const handleDeleteSelectedLabels = async () => {
        if (!column) return
        try {
            await Promise.all(
                Array.from(selectedValues).map(label =>
                    api.labels.delete(projectId, label)
                )
            )
            column.setFilterValue(undefined)
            onLabelsChange()
            if (onTasksChange) {
                onTasksChange()
            }
            toast({
                title: "删除成功",
                description: `已删除 ${selectedValues.size} 个标签`
            })
        } catch (error) {
            console.error("删除标签失败:", error)
            toast({
                title: "删除失败",
                description: "删除标签时出现错误，请重试",
                variant: "destructive"
            })
        }
    }

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-dashed"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {title}
                        {selectedValues?.size > 0 && (
                            <>
                                <Separator
                                    orientation="vertical"
                                    className="mx-2 h-4"
                                />
                                <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal lg:hidden"
                                >
                                    {selectedValues.size}
                                </Badge>
                                <div className="hidden space-x-1 lg:flex">
                                    {selectedValues.size > 2 ? (
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            已选 {selectedValues.size} 项
                                        </Badge>
                                    ) : (
                                        labels
                                            .filter((label) =>
                                                selectedValues.has(label)
                                            )
                                            .map((label) => (
                                                <Badge
                                                    variant="secondary"
                                                    key={label}
                                                    className="rounded-sm px-1 font-normal"
                                                >
                                                    {label}
                                                </Badge>
                                            ))
                                    )}
                                </div>
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={title} />
                        <CommandList>
                            <CommandEmpty>没有结果</CommandEmpty>
                            <CommandGroup>
                                {labels.map((label) => {
                                    const isSelected = selectedValues.has(label)
                                    const count = getLabelCount(label)
                                    return (
                                        <CommandItem
                                            key={label}
                                            onSelect={() => {
                                                if (!column) return
                                                if (isSelected) {
                                                    selectedValues.delete(label)
                                                } else {
                                                    selectedValues.add(label)
                                                }
                                                const filterValues =
                                                    Array.from(selectedValues)
                                                column.setFilterValue(
                                                    filterValues.length
                                                        ? filterValues
                                                        : undefined
                                                )
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <Check className="h-4 w-4" />
                                            </div>
                                            <span>{label}</span>
                                            {typeof count !== 'undefined' && (
                                                <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                                    {count}
                                                </span>
                                            )}
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => setCreateDialogOpen(true)}
                                    className="justify-center text-center"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    添加标签
                                </CommandItem>
                                {selectedValues.size > 0 && (
                                    <CommandItem
                                        onSelect={handleDeleteSelectedLabels}
                                        className="justify-center text-center text-red-600 dark:text-red-400"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        删除标签
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>创建新标签</DialogTitle>
                        <DialogDescription>
                            添加一个新的标签来分类你的任务
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <UILabel htmlFor="name">标签名称</UILabel>
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
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
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