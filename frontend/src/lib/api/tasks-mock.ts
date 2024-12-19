import type { Task } from './types'
import mockTasks from '@/app/tasks/data/tasks.json'

// 为不同项目创建不同的任务列表
const projectTasks: Record<string, Task[]> = {
  'fd9b02ca-5ac9-40c6-b756-ead6786675ae': mockTasks.slice(0, 50).map(task => ({
    ...task,
    description: `这是 FrankenTodo 项目中的任务 ${task.id}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })),
  '62da762d-715b-4c15-a8e7-4c53fd83bea3': mockTasks.slice(50, 100).map(task => ({
    ...task,
    description: `这是天气控制器项目中的任务 ${task.id}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
}

interface CreateTaskData {
  title: string
  description: string
  status: string
  priority: string
  label: string
}

export const tasksApiMock = {
  async getAll(projectId: string): Promise<{ tasks: Task[] }> {
    // 如果没有选择项目,返回空数组
    if (!projectId) {
      return { tasks: [] }
    }
    // 根据项目 ID 返回对应的任务列表
    const tasks = projectTasks[projectId] || []
    return { tasks }
  },

  async create(projectId: string, data: CreateTaskData): Promise<Task> {
    const newTask: Task = {
      id: `TASK-${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return newTask
  },

  async batchCreate(
    projectId: string,
    data: { tasks: CreateTaskData[] }
  ): Promise<{ tasks: Task[] }> {
    const newTasks = data.tasks.map(task => ({
      id: `TASK-${Math.random().toString(36).substr(2, 4)}`,
      ...task,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    return { tasks: newTasks }
  },

  async getById(projectId: string, taskId: string): Promise<Task> {
    const task = projectTasks[projectId]?.find(t => t.id === taskId)
    if (!task) throw new Error('Task not found')
    return task
  },

  async update(
    projectId: string,
    taskId: string,
    data: CreateTaskData
  ): Promise<Task> {
    const task = await this.getById(projectId, taskId)
    return {
      ...task,
      ...data,
      updated_at: new Date().toISOString()
    }
  },

  async partialUpdate(
    projectId: string,
    taskId: string,
    data: Partial<CreateTaskData>
  ): Promise<Task> {
    const task = await this.getById(projectId, taskId)
    return {
      ...task,
      ...data,
      updated_at: new Date().toISOString()
    }
  },

  async delete(projectId: string, taskId: string): Promise<void> {
    return Promise.resolve()
  },

  async batchDelete(
    projectId: string,
    taskIds: string[]
  ): Promise<{ deleted_count: number }> {
    return { deleted_count: taskIds.length }
  }
} 