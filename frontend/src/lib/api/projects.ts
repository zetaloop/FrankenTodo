import { fetchApi } from './client'
import type { Project, ProjectMember } from './types'

export const projectsApi = {
  async getAll(): Promise<{ projects: Project[] }> {
    return fetchApi('/projects')
  },

  async create(data: {
    name: string
    description: string
  }): Promise<Project> {
    return fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async getById(projectId: string): Promise<Project> {
    return fetchApi(`/projects/${projectId}`)
  },

  async update(
    projectId: string,
    data: {
      name: string
      description: string
    }
  ): Promise<Project> {
    return fetchApi(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async delete(projectId: string): Promise<void> {
    return fetchApi(`/projects/${projectId}`, {
      method: 'DELETE',
    })
  },

  async batchDelete(projectIds: string[]): Promise<{ deleted_count: number }> {
    return fetchApi('/projects', {
      method: 'DELETE',
      body: JSON.stringify({ project_ids: projectIds }),
    })
  },

  async getMembers(projectId: string): Promise<{ members: ProjectMember[] }> {
    return fetchApi(`/projects/${projectId}/members`)
  },

  async addMember(
    projectId: string,
    data: {
      user_id: string
      role: 'owner' | 'member'
    }
  ): Promise<ProjectMember> {
    return fetchApi(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    return fetchApi(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    })
  },
} 