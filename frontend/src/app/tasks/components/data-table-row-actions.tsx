"use client";

import { Row } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { priorities, statuses } from "../data/data";
import { taskSchema } from "../data/schema";
import { toast } from "@/hooks/use-toast";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
    onEdit?: (task: TData) => void;
    onDelete?: (task: TData) => Promise<void>;
    onStatusChange?: (task: TData, newStatus: string) => Promise<void>;
}

export function DataTableRowActions<TData>({
    row,
    onEdit,
    onDelete,
    onStatusChange,
}: DataTableRowActionsProps<TData>) {
    const task = taskSchema.parse(row.original);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            if (onDelete) {
                await onDelete(row.original);
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteAlert(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            setIsUpdating(true);
            if (onStatusChange) {
                await onStatusChange(row.original, newStatus);
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCopyText = () => {
        const formatDate = (dateStr?: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        // 获取状态和优先级的中文名称
        const status = statuses.find(s => s.value === task.status)?.label || task.status;
        const priority = priorities.find(p => p.value === task.priority)?.label || task.priority;
        
        // 格式化标签
        const labelText = task.labels.length > 0 
            ? task.labels.map(label => `[${label}]`).join(' ') + ' '
            : '';

        // 格式化ID（使用与columns.tsx中相同的方法）
        const shortId = task.id.slice(-8).toUpperCase();
        
        const text = `#${shortId} ${labelText}${task.title} ${status} 优先级${priority} 创建于${formatDate(task.created_at)} 更新于${formatDate(task.updated_at)}`;
        const description = task.description?.trim() ? `\n说明：${task.description}` : '';
        
        navigator.clipboard.writeText(text + description).then(() => {
            toast({
                title: "复制成功",
                description: "任务信息已复制到剪贴板"
            });
        }).catch(() => {
            toast({
                title: "复制失败",
                description: "无法访问剪贴板",
                variant: "destructive"
            });
        });
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation()
                        if (onEdit) {
                            onEdit(row.original)
                        }
                    }}
                >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">编辑</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteAlert(true)
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">删除</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            onClick={(e) => e.stopPropagation()}
                            disabled={isUpdating}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">更多操作</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        align="end" 
                        className="w-[160px]"
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                    >
                        <DropdownMenuItem onSelect={handleCopyText}>
                            <Copy className="mr-2 h-4 w-4" />
                            复制文本
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {statuses.map((status) => {
                            const Icon = status.icon;
                            return (
                                <DropdownMenuItem
                                    key={status.value}
                                    disabled={task.status === status.value || isUpdating}
                                    onSelect={() => handleStatusChange(status.value)}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {status.label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除任务？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作不可撤销。将会删除任务 &quot;{task.title}&quot;。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? "删除中..." : "删除"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
