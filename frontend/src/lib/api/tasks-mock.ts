import type { Task } from './types'
import mockTasks from '@/app/tasks/data/tasks.json'

// 为每个任务添加缺失的字段
const enrichedTasks = mockTasks.map(task => ({
  ...task,
  description: `这是任务 ${task.id} 的描述`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

interface CreateTaskData {
  title: string
  description: string
  status: string
  priority: string
  label: string
}

export const tasksApiMock = {
  async getAll(projectId: string): Promise<{ tasks: Task[] }> {
    return { tasks: enrichedTasks }
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
    const task = enrichedTasks.find(t => t.id === taskId)
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