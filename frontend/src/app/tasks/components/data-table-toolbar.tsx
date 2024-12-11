"use client";

import { Table } from "@tanstack/react-table";
import { Trash2, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/app/tasks/components/data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableProjectFilter } from "./data-table-project-filter";
import { useState } from "react";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
}

export function DataTableToolbar<TData>({
    table,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const [selectedProject, setSelectedProject] = useState("all");
    const selectedRows = table.getFilteredSelectedRowModel().rows;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <DataTableProjectFilter
                    value={selectedProject}
                    onChange={setSelectedProject}
                />
                <Input
                    placeholder="搜索任务..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("status") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("status")}
                        title="状态"
                        options={statuses}
                    />
                )}
                {table.getColumn("priority") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("priority")}
                        title="优先级"
                        options={priorities}
                    />
                )}
                <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                        // 这里添加创建任务的逻辑
                        console.log("创建新任务");
                    }}
                >
                    <Plus className="h-4 w-4" />
                    创建任务
                </Button>
                {selectedRows.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                            // 这里添加删除选中任务的逻辑
                            console.log("删除选中的任务", selectedRows);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        删除所选 ({selectedRows.length})
                    </Button>
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        清除筛选
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
