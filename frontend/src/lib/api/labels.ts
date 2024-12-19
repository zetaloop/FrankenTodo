import { fetchApi } from './client'
import type { Label } from './types'

export const labelsApi = {
  async getAll(): Promise<{ labels: Label[] }> {
    return fetchApi('/labels')
  },

  async create(data: {
    name: string
    description: string
  }): Promise<Label> {
    return fetchApi('/labels', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
} 