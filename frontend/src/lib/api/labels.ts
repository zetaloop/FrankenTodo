import { fetchApi } from './client'
import type { Label } from './types'

export const labelsApi = {
  async getAll(projectId: string): Promise<{ labels: Label[] }> {
    return fetchApi(`/projects/${projectId}/labels`)
  },

  async create(projectId: string, label: string): Promise<Label> {
    return fetchApi(`/projects/${projectId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    })
  },

  async delete(projectId: string, label: string): Promise<void> {
    return fetchApi(`/projects/${projectId}/labels/${encodeURIComponent(label)}`, {
      method: 'DELETE',
    })
  }
} 