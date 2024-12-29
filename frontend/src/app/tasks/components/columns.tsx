"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type { Label } from "@/lib/api/types";
import { MessageSquareMore } from "lucide-react";

interface ColumnsProps {
  projectId: string;
  labels: Label[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createColumns({ projectId, labels }: ColumnsProps): ColumnDef<Task>[] {
  return [
    {
        id: "select",
        header: ({ table }) => (
            <div 
                className="cursor-pointer" 
                onClick={() => table.toggleAllRowsSelected()}
            >
                <Checkbox
                    checked={
                        table.getIsAllRowsSelected() ||
                        (table.getIsSomeRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllRowsSelected(!!value)
                    }
                    aria-label="全选"
                    className="translate-y-[2px]"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="选择一项"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column, table }) => (
            <div 
                className="cursor-pointer whitespace-nowrap" 
                onClick={() => table.toggleAllRowsSelected()}
            >
                <DataTableColumnHeader column={column} title="编号" />
            </div>
        ),
        cell: ({ row }) => {
            const id = row.getValue("id") as string;
            const shortId = id.slice(-8).toUpperCase();
            return (
                <div 
                    className="w-[80px]" 
                    title={id}
                >
                    #{shortId}
                </div>
            );
        },
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="标题" />
        ),
        cell: ({ row }) => {
            const taskLabels = row.original.labels;
            const hasDescription = row.original.description?.trim().length > 0;

            return (
                <div className="flex items-center max-w-[40vw] min-w-0">
                    {taskLabels.length > 0 && (
                        <div className="flex gap-1 overflow-hidden whitespace-nowrap">
                            {taskLabels.map(label => (
                                <Badge 
                                    key={label} 
                                    variant="outline" 
                                    className="truncate max-w-[150px] whitespace-nowrap"
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    )}
                    <span className={`truncate font-medium flex-1 ${taskLabels.length > 0 ? "ml-2" : ""}`}>
                        {row.getValue("title")}
                        {hasDescription && (
                            <MessageSquareMore className="inline-block ml-1 h-4 w-4 text-muted-foreground" />
                        )}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="状态" />
        ),
        cell: ({ row }) => {
            const status = statuses.find((s) => s.value === row.getValue("status"))
            if (!status) return null
            return (
                <div className="flex w-[100px] items-center whitespace-nowrap">
                    {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{status.label}</span>
                </div>
            )
        },
        sortingFn: (rowA, rowB) => {
            const statusA = statuses.find(s => s.value === rowA.getValue("status"))
            const statusB = statuses.find(s => s.value === rowB.getValue("status"))
            return (statusA?.weight ?? 0) - (statusB?.weight ?? 0)
        },
        filterFn: (row, id, value: string[]) => {
            const status = row.getValue<string>(id)
            return value.includes(status)
        }
    },
    {
        accessorKey: "priority",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="优先级" />
        ),
        cell: ({ row }) => {
            const priority = priorities.find((p) => p.value === row.getValue("priority"))
            if (!priority) return null
            return (
                <div className="flex items-center whitespace-nowrap">
                    {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            )
        },
        sortingFn: (rowA, rowB) => {
            const priorityA = priorities.find(p => p.value === rowA.getValue("priority"))
            const priorityB = priorities.find(p => p.value === rowB.getValue("priority"))
            return (priorityA?.weight ?? 0) - (priorityB?.weight ?? 0)
        },
        filterFn: (row, id, value: string[]) => {
            const priority = row.getValue<string>(id)
            return value.includes(priority)
        }
    },
    {
        id: "labels",
        accessorKey: "labels",
        enableHiding: false,
        filterFn: (row, id, value: string[]) => {
            const rowLabels = row.getValue<string[]>(id)
            return value.some(val => rowLabels.includes(val))
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="创建时间" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return (
                <div className="w-[100px] text-muted-foreground whitespace-nowrap" title={date.toLocaleString()}>
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            );
        },
        sortingFn: "datetime",
        sortDescFirst: false,
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="更新时间" />
        ),
        cell: ({ row }) => {
            const date = new Date(row.getValue("updated_at"));
            return (
                <div className="w-[100px] text-muted-foreground whitespace-nowrap" title={date.toLocaleString()}>
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            );
        },
        sortingFn: "datetime",
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const props = (table.options.meta as any) || {}
            return (
                <DataTableRowActions 
                    row={row} 
                    onEdit={() => {
                        if (props.onEditTask) {
                            props.onEditTask(row.original)
                        }
                    }}
                    onDelete={async () => {
                        if (props.onDeleteTask) {
                            await props.onDeleteTask(row.original)
                        }
                    }}
                    onStatusChange={async (task, newStatus) => {
                        if (props.onUpdateTask) {
                            await props.onUpdateTask(task, {
                                ...task,
                                status: newStatus
                            })
                        }
                    }}
                />
            )
        },
    },
  ];
}
