'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Project, Task } from "@/lib/api/types"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"
import { ProjectDialog } from "./components/project-dialog"

export default function TaskPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectDialogMode, setProjectDialogMode] = useState<"create" | "edit">("create")
  const [selectedProject, setSelectedProject] = useState<Project | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
    </>
  )
}
