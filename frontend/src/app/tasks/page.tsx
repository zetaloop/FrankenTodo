'use client'

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { Project, Task, Label } from "@/lib/api/types"
import { createColumns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"
import { ProjectDialog } from "./components/project-dialog"
import { TaskDialog } from "./components/task-dialog"
import { toast } from "@/hooks/use-toast"
import { z } from "zod"

// 定义导入数据的格式
const importTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.string(),
  priority: z.string(),
  labels: z.array(z.string())
})

export default function TaskPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectDialogMode, setProjectDialogMode] = useState<"create" | "edit">("create")
  const [selectedProject, setSelectedProject] = useState<Project | undefined>()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "view" | "edit">("create")
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError(false)
      try {
        const { projects } = await api.projects.getAll()
        setProjects(projects)
        // 如果有项目,默认选择第一个
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].id)
        }
      } catch (error) {
        console.error("获取项目列表失败:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // 当选择的项目改变时,获取该项目的任务和标签
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProjectId) {
        return
      }
      setLoading(true)
      try {
        const [tasksResponse, labelsResponse] = await Promise.all([
          api.tasks.getAll(selectedProjectId),
          api.labels.getAll(selectedProjectId)
        ])
        setTasks(tasksResponse.tasks)
        setLabels(labelsResponse.labels)
      } catch (error) {
        console.error("获取数据失败:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedProjectId])

  const handleRefreshData = useCallback(async () => {
    if (!selectedProjectId) return
    setLoading(true)
    try {
      const [tasksResponse, labelsResponse] = await Promise.all([
        api.tasks.getAll(selectedProjectId),
        api.labels.getAll(selectedProjectId)
      ])
      setTasks(tasksResponse.tasks)
      setLabels(labelsResponse.labels)
    } catch (error) {
      console.error("刷新数据失败:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedProjectId])

  const handleCreateProject = () => {
    setProjectDialogMode("create")
    setSelectedProject(undefined)
    setProjectDialogOpen(true)
  }

  const handleEditProject = () => {
    if (!selectedProjectId) return
    const project = projects.find(p => p.id === selectedProjectId)
    setSelectedProject(project)
    setProjectDialogMode("edit")
    setProjectDialogOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return
    try {
      await api.projects.delete(selectedProjectId)
      setProjects(prev => prev.filter(p => p.id !== selectedProjectId))
      setSelectedProjectId("")
      toast({
        title: "删除成功",
        description: "项目已删除"
      })
    } catch (error) {
      console.error("删除项目失败:", error)
      toast({
        title: "删除失败",
        description: "删除项目时出现错误",
        variant: "destructive"
      })
    }
  }

  const handleProjectSubmit = async (data: { name: string; description: string }) => {
    try {
      if (projectDialogMode === "create") {
        const newProject = await api.projects.create(data)
        setProjects(prev => [...prev, newProject])
        setSelectedProjectId(newProject.id)
        toast({
          title: "创建成功",
          description: `项目"${data.name}"已创建`
        })
      } else {
        const updatedProject = await api.projects.update(selectedProjectId, data)
        setProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        )
        toast({
          title: "更新成功",
          description: `项目"${data.name}"已更新`
        })
      }
    } catch (error) {
      console.error("操作项目失败:", error)
      toast({
        title: projectDialogMode === "create" ? "创建失败" : "更新失败",
        description: "操作项目时出现错误",
        variant: "destructive"
      })
    }
  }

  const handleCreateTask = () => {
    setTaskDialogMode("create")
    setSelectedTask(undefined)
    setTaskDialogOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setTaskDialogMode("edit")
    setTaskDialogOpen(true)
  }

  const handleDeleteTask = async (task: Task) => {
    try {
      await api.tasks.delete(selectedProjectId, task.id)
      setTasks(prev => prev.filter(t => t.id !== task.id))
      toast({
        title: "删除成功",
        description: `任务"${task.title}"已删除`
      })
    } catch (error) {
      console.error("删除任务失败:", error)
      toast({
        title: "删除失败",
        description: "删除任务时出现错误",
        variant: "destructive"
      })
    }
  }

  const handleCreateTaskSubmit = async (data: {
    title: string
    description: string
    status: string
    priority: string
    labels: string[]
  }) => {
    try {
      const newTask = await api.tasks.create(selectedProjectId, data)
      setTasks(prev => [...prev, newTask])
      toast({
        title: "创建成功",
        description: `任务"${data.title}"已创建`
      })
    } catch (error) {
      console.error("创建任务失败:", error)
      toast({
        title: "创建失败",
        description: "创建任务时出现错误",
        variant: "destructive"
      })
    }
  }

  const handleUpdateTaskSubmit = async (task: Task, data: {
    title: string
    description: string
    status: string
    priority: string
    labels: string[]
  }) => {
    try {
      const updatedTask = await api.tasks.update(selectedProjectId, task.id, data)
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
      toast({
        title: "更新成功",
        description: `任务"${data.title}"已更新`
      })
    } catch (error) {
      console.error("更新任务失败:", error)
      toast({
        title: "更新失败",
        description: "更新任务时出现错误",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTasks = async (tasks: Task[]) => {
    try {
      await api.tasks.batchDelete(selectedProjectId, tasks.map(t => t.id))
      setTasks(prev => prev.filter(t => !tasks.find(dt => dt.id === t.id)))
      toast({
        title: "删除成功",
        description: `已删除 ${tasks.length} 个任务`
      })
    } catch (error) {
      console.error("删除任务失败:", error)
      toast({
        title: "删除失败",
        description: "批量删除任务时出现错误",
        variant: "destructive"
      })
    }
  }

  const handleRetry = () => {
    const fetchProjects = async () => {
      setLoading(true)
      setError(false)
      try {
        const { projects } = await api.projects.getAll()
        setProjects(projects)
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].id)
        }
      } catch (error) {
        console.error("获取项目列表失败:", error)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }

  // 添加快捷键处理函数
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // 检查是否按下 Ctrl+Shift+V
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        try {
          // 如果没有选择项目，不处理
          if (!selectedProjectId) {
            toast({
              title: "导入失败",
              description: "请先选择一个项目",
              variant: "destructive"
            })
            return
          }

          // 从剪贴板读取数据
          const text = await navigator.clipboard.readText()
          const data = JSON.parse(text)
          
          // 验证数据格式
          const taskData = importTaskSchema.parse(data)

          // 创建任务
          await api.tasks.create(selectedProjectId, taskData)
          
          // 刷新数据
          handleRefreshData()

          toast({
            title: "导入成功",
            description: "任务已成功导入"
          })
        } catch (error) {
          console.error('导入失败:', error)
          toast({
            title: "导入失败",
            description: error instanceof Error ? error.message : "数据格式不正确",
            variant: "destructive"
          })
        }
      }
    }

    // 添加事件监听
    window.addEventListener('keydown', handleKeyDown)

    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedProjectId, handleRefreshData])

  return (
    <>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">欢迎回来！</h2>
            <p className="text-muted-foreground">
              以下是您当前项目的任务清单
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
        <DataTable
          data={tasks}
          columns={createColumns({ projectId: selectedProjectId, labels })}
          projects={projects}
          selectedProjectId={selectedProjectId}
          error={error}
          loading={loading}
          onRetry={handleRetry}
          onProjectChange={setSelectedProjectId}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onCreateTask={handleCreateTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onDeleteTasks={handleDeleteTasks}
          onUpdateTask={handleUpdateTaskSubmit}
          onRefreshData={handleRefreshData}
        />
      </div>
      <ProjectDialog
        project={selectedProject}
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        onSubmit={handleProjectSubmit}
        mode={projectDialogMode}
      />
      <TaskDialog
        task={selectedTask}
        open={taskDialogOpen}
        projectId={selectedProjectId}
        onOpenChange={setTaskDialogOpen}
        onSubmit={taskDialogMode === "create" ? handleCreateTaskSubmit : (data) => handleUpdateTaskSubmit(selectedTask!, data)}
        mode={taskDialogMode}
        onDelete={selectedTask ? () => handleDeleteTask(selectedTask) : undefined}
        onEdit={selectedTask ? () => setTaskDialogMode("edit") : undefined}
      />
    </>
  )
}
