"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { TaskDialog } from "./task-dialog"
import { Task } from "../data/schema"
import { Project } from "@/lib/api/types"
import { ProjectEmptyState } from "./project-empty-state"
import { TaskEmptyState } from "./task-empty-state"

interface DataTableProps {
  columns: ColumnDef<Task>[]
  data: Task[]
  projects: Project[]
  selectedProjectId: string
  onProjectChange: (projectId: string) => void
  onCreateProject: () => void
  onEditProject: () => void
  onDeleteProject: () => void
  onCreateTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => Promise<void>
  onDeleteTasks: (tasks: Task[]) => Promise<void>
  onUpdateTask: (task: Task, data: {
    title: string
    description: string
    status: string
    priority: string
    labels: string[]
  }) => Promise<void>
}

export function DataTable({
  columns,
  data,
  projects,
  selectedProjectId,
  onProjectChange,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onDeleteTasks,
  onUpdateTask,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      labels: false
    })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"create" | "view" | "edit">("view")

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableMultiRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      onEditTask: (task: Task) => {
        setSelectedTask(task)
        setDialogMode("edit")
        setDialogOpen(true)
      },
      onDeleteTask,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleRowClick = (e: React.MouseEvent, row: Row<Task>) => {
    const target = e.target as HTMLElement
    const cell = target.closest('td')
    
    // 如果点击了多选框本身,不做任何处理
    if (target.closest('input[type="checkbox"]')) {
      return
    }

    // 检查是否点击了第一列或第二列(多选框列和编号列)的单元格区域
    const isFirstOrSecondCell = cell && (
      cell === cell.parentElement?.firstElementChild || 
      cell === cell.parentElement?.children[1]
    )
    if (isFirstOrSecondCell) {
      // 触发多选框的点击
      row.toggleSelected(!row.getIsSelected())
      return
    }

    // 检查是否点击了最后一列(操作列)
    const isLastCell = cell && cell === cell.parentElement?.lastElementChild
    if (isLastCell) {
      return
    }
    
    // 只有点击中间的内容列时才触发查看
    setSelectedTask(row.original)
    setDialogMode("view")
    setDialogOpen(true)
  }

  const handleTaskSubmit = async (data: {
    title: string
    description: string
    status: string
    priority: string
    labels: string[]
  }) => {
    if (selectedTask) {
      await onUpdateTask(selectedTask, data)
      setRowSelection({})
    }
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={onProjectChange}
        onCreateProject={onCreateProject}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
        onCreateTask={onCreateTask}
        onDeleteTasks={onDeleteTasks}
      />
      {!selectedProjectId ? (
        <ProjectEmptyState 
          onCreateProject={onCreateProject}
          onOpenProjectSelect={() => {
            const projectSelectTrigger = document.querySelector(
              '[aria-label="选择项目"]'
            ) as HTMLButtonElement
            
            if (projectSelectTrigger) {
              projectSelectTrigger.click()
            }
          }}
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer"
                      onClick={(e) => handleRowClick(e, row)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-0 border-0">
                      <TaskEmptyState 
                        isFiltered={table.getState().columnFilters.length > 0} 
                        onCreateTask={onCreateTask}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination table={table} />
        </>
      )}
      <TaskDialog
        task={selectedTask || undefined}
        open={dialogOpen}
        projectId={selectedProjectId}
        onOpenChange={setDialogOpen}
        onSubmit={handleTaskSubmit}
        mode={dialogMode}
        onDelete={selectedTask ? () => onDeleteTask(selectedTask) : undefined}
        onEdit={selectedTask ? () => {
          setDialogMode("edit")
        } : undefined}
      />
    </div>
  )
}
