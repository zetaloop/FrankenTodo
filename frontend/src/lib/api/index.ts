export * from './types'
export * from './client'
export * from './auth'
export * from './projects'
export * from './tasks'
export * from './labels'
export * from './user'

// 导出统一的 API 对象
import { authApi } from './auth'
import { projectsApi } from './projects'
import { tasksApi } from './tasks'
import { labelsApi } from './labels'
import { userApi } from './user'

export { authApi, projectsApi, tasksApi, labelsApi, userApi }

export const api = {
  auth: authApi,
  projects: projectsApi,
  tasks: tasksApi,
  labels: labelsApi,
  user: userApi,
} 