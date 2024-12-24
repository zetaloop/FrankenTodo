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

  async create(projectId: string, label: string): Promise<Label> {
    // 如果项目不存在，初始化默认标签
    if (!projectLabels[projectId]) {
      projectLabels[projectId] = [...defaultLabels]
    }
    projectLabels[projectId].push(label)
    return label
  },

  async delete(projectId: string, label: string): Promise<void> {
    if (projectLabels[projectId]) {
      const index = projectLabels[projectId].findIndex(l => l === label)
      if (index !== -1) {
        projectLabels[projectId].splice(index, 1)
      }
    }
    return Promise.resolve()
  }
} 