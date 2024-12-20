'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Project, Task } from "@/lib/api/types"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"
import { ProjectDialog } from "./components/project-dialog"
import { TaskDialog } from "./components/task-dialog"

export default function TaskPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectDialogMode, setProjectDialogMode] = useState<"create" | "edit">("create")
  const [selectedProject, setSelectedProject] = useState<Project | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskDialogMode, setTaskDialogMode] = useState<"create" | "view" | "edit">("create")
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { projects } = await api.projects.getAll()
        setProjects(projects)
        // 如果有项目,默认选择第一个
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].id)
        }
      } catch (error) {
        console.error("获取项目列表失败:", error)
      }
    }
    fetchProjects()
  }, [])

  // 当选择的项目改变时,获取该项目的任务
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      try {
        const { tasks } = await api.tasks.getAll(selectedProjectId || '')
        setTasks(tasks)
      } catch (error) {
        console.error("获取任务列表失败:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
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
    } catch (error) {
      console.error("删除项目失败:", error)
    }
  }

  const handleProjectSubmit = async (data: { name: string; description: string }) => {
    try {
      if (projectDialogMode === "create") {
        const newProject = await api.projects.create(data)
        setProjects(prev => [...prev, newProject])
        setSelectedProjectId(newProject.id)
      } else {
        const updatedProject = await api.projects.update(selectedProjectId, data)
        setProjects(prev => 
          prev.map(p => p.id === updatedProject.id ? updatedProject : p)
        )
      }
    } catch (error) {
      console.error("操作项目失败:", error)
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
    } catch (error) {
      console.error("删除任务失败:", error)
    }
  }

  const handleTaskSubmit = async (data: {
    title: string
    description: string
    status: string
    priority: string
    label: string
  }) => {
    try {
      if (taskDialogMode === "create") {
        const newTask = await api.tasks.create(selectedProjectId, data)
        setTasks(prev => [...prev, newTask])
      } else {
        // 编辑模式
        const updatedTask = await api.tasks.update(selectedProjectId, selectedTask!.id, data)
        setTasks(prev => 
          prev.map(t => t.id === updatedTask.id ? updatedTask : t)
        )
      }
    } catch (error) {
      console.error("操作任务失败:", error)
    }
  }

  const handleDeleteTasks = async (tasks: Task[]) => {
    try {
      await api.tasks.batchDelete(selectedProjectId, tasks.map(t => t.id))
      setTasks(prev => prev.filter(t => !tasks.find(dt => dt.id === t.id)))
    } catch (error) {
      console.error("删除任务失败:", error)
    }
  }

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
        {loading ? (
          <div>加载中...</div>
        ) : (
          <DataTable 
            data={tasks} 
            columns={columns} 
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={setSelectedProjectId}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onCreateTask={handleCreateTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDeleteTasks={handleDeleteTasks}
            onUpdateTask={async (task, data) => {
              const updatedTask = await api.tasks.update(selectedProjectId, task.id, data)
              setTasks(prev => 
                prev.map(t => t.id === updatedTask.id ? updatedTask : t)
              )
            }}
          />
        )}
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
        onSubmit={handleTaskSubmit}
        mode={taskDialogMode}
        onDelete={selectedTask ? () => handleDeleteTask(selectedTask) : undefined}
        onEdit={selectedTask ? () => setTaskDialogMode("edit") : undefined}
      />
    </>
  )
}
