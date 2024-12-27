"use client";

import { Table } from "@tanstack/react-table";
import { Trash2, X, Plus, Settings, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/app/tasks/components/data-table-view-options";

import { priorities, statuses } from "../data/data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableProjectFilter } from "./data-table-project-filter";
import { DataTableLabelFilter } from "./data-table-label-filter";
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
    error?: boolean;
    loading?: boolean;
    onProjectChange: (projectId: string) => void;
    onCreateProject?: () => void;
    onEditProject?: () => void;
    onDeleteProject?: () => void;
    onCreateTask?: () => void;
    onDeleteTasks: (tasks: TData[]) => Promise<void>;
    onRefreshData?: () => Promise<void>;
}

export function DataTableToolbar<TData>({
    table,
    projects,
    selectedProjectId,
    error,
    loading,
    onProjectChange,
    onCreateProject,
    onEditProject,
    onDeleteProject,
    onCreateTask,
    onDeleteTasks,
    onRefreshData,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
    const [showDeleteTasksAlert, setShowDeleteTasksAlert] = useState(false)
    const [labels, setLabels] = useState<string[]>([])

    useEffect(() => {
        if (selectedProjectId) {
            api.labels.getAll(selectedProjectId).then(response => {
                setLabels(response.labels)
            })
        } else {
            setLabels([])
        }
        // 重置所有筛选器
        table.resetColumnFilters()
    }, [selectedProjectId, table])

    const handleDeleteProject = () => {
        if (onDeleteProject) {
            onDeleteProject();
        }
        setShowDeleteAlert(false);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <DataTableProjectFilter
                    projects={projects}
                    value={selectedProjectId}
                    onChange={onProjectChange}
                    onCreateProject={onCreateProject}
                    disabled={error || loading}
                />
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            disabled={error || loading}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onSelect={onCreateProject} className="gap-2">
                            <Plus className="h-4 w-4" />
                            新建项目
                        </DropdownMenuItem>
                        {selectedProjectId && (
                            <>
                                <DropdownMenuItem onSelect={onEditProject} className="gap-2">
                                    <Pencil className="h-4 w-4" />
                                    编辑项目
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onSelect={() => setShowDeleteAlert(true)}
                                    className="text-destructive gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    删除项目
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                {selectedProjectId && (
                    <>
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
                        <DataTableLabelFilter
                            column={table.getAllColumns().find(col => col.id === "labels")}
                            title="标签"
                            labels={labels}
                            projectId={selectedProjectId}
                            onLabelsChange={() => {
                                if (selectedProjectId) {
                                    api.labels.getAll(selectedProjectId).then(response => {
                                        setLabels(response.labels)
                                    })
                                }
                            }}
                            onTasksChange={onRefreshData}
                        />
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
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8"
                            onClick={onCreateTask}
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
                    </>
                )}
            </div>
            {selectedProjectId && <DataTableViewOptions table={table} />}

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
                            onClick={handleDeleteProject}
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
                                const selectedTasks = selectedRows.map(row => row.original)
                                await onDeleteTasks(selectedTasks)
                                table.resetRowSelection()
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
