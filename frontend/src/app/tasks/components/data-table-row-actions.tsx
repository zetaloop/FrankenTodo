"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { labels } from "../data/data";
import { taskSchema } from "../data/schema";

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
    onEdit?: (task: TData) => void;
    onDelete?: (task: TData) => Promise<void>;
}

export function DataTableRowActions<TData>({
    row,
    onEdit,
    onDelete,
}: DataTableRowActionsProps<TData>) {
    const task = taskSchema.parse(row.original);

    return (
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
                onClick={async (e) => {
                    e.stopPropagation()
                    if (onDelete) {
                        await onDelete(row.original)
                    }
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
                    <DropdownMenuItem onSelect={() => {
                        console.log("复制", task)
                    }}>
                        复制
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>标签</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={task.labels[0] || ""}>
                                {labels.map((label) => (
                                    <DropdownMenuRadioItem
                                        key={label}
                                        value={label}
                                    >
                                        {label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
