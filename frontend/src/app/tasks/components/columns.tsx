"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { labels, priorities, statuses } from "../data/data";
import { Task } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

export const columns: ColumnDef<Task>[] = [
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
            ).filter((l): l is typeof labels[0] => Boolean(l));

            return (
                <div className="flex space-x-2 max-w-[40vw]">
                    <div className="flex gap-1">
                        {taskLabels.map(label => (
                            <Badge key={label.value} variant="outline">
                                {label.label}
                            </Badge>
                        ))}
                    </div>
                    <span className="truncate font-medium">
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
            const status = statuses.find(
                (status) => status.value === row.getValue("status")
            );

            if (!status) {
                return null;
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{status.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="优先级" />
        ),
        cell: ({ row }) => {
            const priority = priorities.find(
                (priority) => priority.value === row.getValue("priority")
            );

            if (!priority) {
                return null;
            }

            return (
                <div className="flex items-center">
                    {priority.icon && (
                        <priority.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{priority.label}</span>
                </div>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
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
