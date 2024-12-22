import type { Label } from './types'
import { labels as defaultLabels } from '@/app/tasks/data/data'

// 使用内存存储每个项目的标签列表
const projectLabels: Record<string, Label[]> = {
  'fd9b02ca-5ac9-40c6-b756-ead6786675ae': [...defaultLabels],
  '62da762d-715b-4c15-a8e7-4c53fd83bea3': [...defaultLabels]
}

export const labelsApiMock = {
  async getAll(projectId: string): Promise<{ labels: Label[] }> {
    // 如果项目不存在，初始化默认标签
    if (!projectLabels[projectId]) {
      projectLabels[projectId] = [...defaultLabels]
    }
    return { labels: projectLabels[projectId] }
  },

  async create(projectId: string, data: {
    value: string
    label: string
    description?: string
  }): Promise<Label> {
    // 如果项目不存在，初始化默认标签
    if (!projectLabels[projectId]) {
      projectLabels[projectId] = [...defaultLabels]
    }
    const newLabel = { ...data }
    projectLabels[projectId].push(newLabel)
    return newLabel
  },

  async update(
    projectId: string,
    value: string,
    data: {
      label: string
      description?: string
    }
  ): Promise<Label> {
    if (!projectLabels[projectId]) {
      throw new Error('Project not found')
    }
    const index = projectLabels[projectId].findIndex(l => l.value === value)
    if (index === -1) {
      throw new Error('Label not found')
    }
    const updatedLabel = {
      value,
      ...data
    }
    projectLabels[projectId][index] = updatedLabel
    return updatedLabel
  },

  async delete(projectId: string, value: string): Promise<void> {
    if (projectLabels[projectId]) {
      const index = projectLabels[projectId].findIndex(l => l.value === value)
      if (index !== -1) {
        projectLabels[projectId].splice(index, 1)
      }
    }
    return Promise.resolve()
  }
} 