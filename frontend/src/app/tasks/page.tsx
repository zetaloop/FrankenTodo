'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Project, Task } from "@/lib/api/types"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"

export default function TaskPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

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
          />
        )}
      </div>
    </>
  )
}
