import { fetchApi } from './client'
import type { Task } from './types'

interface CreateTaskData {
  title: string
  description: string
  status: string
  priority: string
  label: string
}

export const tasksApi = {
  async getAll(projectId: string): Promise<{ tasks: Task[] }> {
    return fetchApi(`/projects/${projectId}/tasks`)
  },

  async create(projectId: string, data: CreateTaskData): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async batchCreate(
    projectId: string,
    data: { tasks: CreateTaskData[] }
  ): Promise<{ tasks: Task[] }> {
    return fetchApi(`/projects/${projectId}/tasks/batch`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getById(projectId: string, taskId: string): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`)
  },

  async update(
    projectId: string,
    taskId: string,
    data: CreateTaskData
  ): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(projectId: string, taskId: string): Promise<void> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },

  async batchDelete(
    projectId: string,
    taskIds: string[]
  ): Promise<{ deleted_count: number }> {
    return fetchApi(`/projects/${projectId}/tasks`, {
      method: 'DELETE',
      body: JSON.stringify({ task_ids: taskIds }),
    })
  },
} 