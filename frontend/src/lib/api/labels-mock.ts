import type { Label } from './types'
import { labels } from '@/app/tasks/data/data'

export const labelsApiMock = {
  async getAll(): Promise<{ labels: Label[] }> {
    return { labels }
  },

  async create(data: {
    value: string
    label: string
    description?: string
  }): Promise<Label> {
    return data
  },

  async update(
    value: string,
    data: {
      label: string
      description?: string
    }
  ): Promise<Label> {
    return {
      value,
      ...data
    }
  },

  async delete(value: string): Promise<void> {
    return Promise.resolve()
  }
} 