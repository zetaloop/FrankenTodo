"use client";

import { Table } from "@tanstack/react-table";
import { Trash2, X, Plus, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/app/tasks/components/data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableProjectFilter } from "./data-table-project-filter";
import { useState, useEffect } from "react";
import { Project } from "@/lib/api/types";
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
import { api } from "@/lib/api";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    projects: Project[];
    selectedProjectId: string;
    onProjectChange: (projectId: string) => void;
    onCreateProject?: () => void;
    onEditProject?: () => void;
    onDeleteProject?: () => void;
    onCreateTask?: () => void;
    onDeleteTasks: (tasks: TData[]) => Promise<void>;
}

export function DataTableToolbar<TData>({
    table,
    projects,
    selectedProjectId,
    onProjectChange,
    onCreateProject,
    onEditProject,
    onDeleteProject,
    onCreateTask,
    onDeleteTasks,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const totalFilteredRows = table.getFilteredRowModel().rows;
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const [showDeleteTasksAlert, setShowDeleteTasksAlert] = useState(false)
    const [labels, setLabels] = useState<{ value: string; label: string }[]>([])

    useEffect(() => {
        if (selectedProjectId) {
            api.labels.getAll(selectedProjectId).then(response => {
                setLabels(response.labels)
            })
        }
    }, [selectedProjectId])

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <DataTableProjectFilter
                    projects={projects}
                    value={selectedProjectId}
                    onChange={onProjectChange}
                    onCreateProject={onCreateProject}
                />
                {selectedProjectId && (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={onEditProject}>
                                编辑项目
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onSelect={() => setShowDeleteAlert(true)}
                                className="text-destructive"
                            >
                                删除项目
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
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
                {selectedProjectId && labels.length > 0 && (
                    <DataTableFacetedFilter
                        column={table.getAllColumns().find(col => col.id === "labels")!}
                        title="标签"
                        options={labels}
                    />
                )}
                <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    onClick={onCreateTask}
                    disabled={!selectedProjectId}
                >
                    <Plus className="h-4 w-4" />
                    创建任务
                </Button>
                {selectedRows.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={() => setShowDeleteTasksAlert(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                        删除任务 ({selectedRows.length})
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

            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除项目？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作不可撤销。删除项目将会同时删除项目下的所有任务。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                onDeleteProject()
                                setShowDeleteAlert(false)
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDeleteTasksAlert} onOpenChange={setShowDeleteTasksAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除选中的任务？</AlertDialogTitle>
                        <AlertDialogDescription>
                            此操作不可撤销。将会删除 {selectedRows.length} 个任务。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await onDeleteTasks(selectedRows.map(row => row.original))
                                setShowDeleteTasksAlert(false)
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
