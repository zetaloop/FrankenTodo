import { fetchApi } from './client'
import type { Label } from './types'

export const labelsApi = {
  async getAll(projectId: string): Promise<{ labels: Label[] }> {
    return fetchApi(`/projects/${projectId}/labels`)
  },

  async create(projectId: string, label: string): Promise<Label> {
    const response = await fetchApi<{ label: string }>(`/projects/${projectId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ label }),
    })
    return response.label
  },

  async delete(projectId: string, labels: string | string[]): Promise<void> {
    return fetchApi(`/projects/${projectId}/labels`, {
      method: 'DELETE',
      body: JSON.stringify({ 
        labels: Array.isArray(labels) ? labels : [labels] 
      }),
    })
  }
} 