"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import type { Label } from "@/lib/api/types";

interface ColumnsProps {
  projectId: string;
  labels: Label[];
}

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
                className="cursor-pointer" 
                onClick={() => table.toggleAllPageRowsSelected()}
            >
                <DataTableColumnHeader column={column} title="编号" />
            </div>
        ),
        cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="标题" />
        ),
        cell: ({ row }) => {
            const taskLabels = row.original.labels.map(labelValue => 
                labels.find(l => l.value === labelValue)
            ).filter((l): l is Label => Boolean(l));

            return (
                <div className="flex items-center max-w-[40vw] min-w-0">
                    <div className="flex gap-1 overflow-hidden whitespace-nowrap">
                        {taskLabels.map(label => (
                            <Badge 
                                key={label.value} 
                                variant="outline" 
                                className="truncate max-w-[150px] whitespace-nowrap"
                            >
                                {label.label}
                            </Badge>
                        ))}
                    </div>
                    <span className="truncate font-medium ml-2 flex-1">
                        {row.getValue("title")}
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
                <div className="flex w-[100px] items-center">
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
                <div className="flex items-center">
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
        id: "actions",
        cell: ({ row, table }) => {
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
                />
            )
        },
    },
  ];
}
