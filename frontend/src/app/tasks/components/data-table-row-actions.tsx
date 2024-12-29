"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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

import { statuses } from "../data/data";
import { taskSchema } from "../data/schema";

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
