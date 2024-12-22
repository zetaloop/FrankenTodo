import { fetchApi } from './client'
import type { Label } from './types'

export const labelsApi = {
  async getAll(projectId: string): Promise<{ labels: Label[] }> {
    return fetchApi(`/projects/${projectId}/labels`)
  },

  async create(projectId: string, data: {
    value: string
    label: string
    description?: string
  }): Promise<Label> {
    return fetchApi(`/projects/${projectId}/labels`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update(
    projectId: string,
    value: string,
    data: {
      label: string
      description?: string
    }
  ): Promise<Label> {
    return fetchApi(`/projects/${projectId}/labels/${value}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(projectId: string, value: string): Promise<void> {
    return fetchApi(`/projects/${projectId}/labels/${value}`, {
      method: 'DELETE',
    })
  }
} 