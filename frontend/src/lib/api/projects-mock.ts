import type { Project, ProjectMember } from './types'

const mockProjects: Project[] = [
  {
    id: "fd9b02ca-5ac9-40c6-b756-ead6786675ae",
    name: "FrankenTodo 任务管理系统",
    description: "一个用于管理和跟踪任务的系统",
    created_at: "2024-12-19T12:00:00Z",
    updated_at: "2024-12-19T13:00:00Z"
  },
  {
    id: "62da762d-715b-4c15-a8e7-4c53fd83bea3", 
    name: "天气控制器",
    description: "一个用于控制和模拟天气的项目",
    created_at: "2024-12-19T10:00:00Z",
    updated_at: "2024-12-19T11:00:00Z"
  }
]

const mockMembers: ProjectMember[] = [
  {
    id: "user-123",
    username: "johndoe",
    email: "johndoe@example.com",
    role: "owner"
  },
  {
    id: "user-456",
    username: "janedoe", 
    email: "janedoe@example.com",
    role: "member"
  }
]

export const projectsApiMock = {
  async getAll(): Promise<{ projects: Project[] }> {
    return { projects: mockProjects }
  },

  async create(data: {
    name: string
    description: string
  }): Promise<Project> {
    const newProject: Project = {
      id: `proj-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return newProject
  },

  async getById(projectId: string): Promise<Project> {
    const project = mockProjects.find(p => p.id === projectId)
    if (!project) throw new Error('Project not found')
    return project
  },

  async update(
    projectId: string,
    data: {
      name: string
      description: string
    }
  ): Promise<Project> {
    const project = await this.getById(projectId)
    return {
      ...project,
      ...data,
      updated_at: new Date().toISOString()
    }
  },

  async delete(projectId: string): Promise<void> {
    // 模拟删除操作
    return Promise.resolve()
  },

  async batchDelete(projectIds: string[]): Promise<{ deleted_count: number }> {
    return { deleted_count: projectIds.length }
  },

  async getMembers(projectId: string): Promise<{ members: ProjectMember[] }> {
    return { members: mockMembers }
  },

  async addMember(
    projectId: string,
    data: {
      user_id: string
      role: 'owner' | 'member'
    }
  ): Promise<ProjectMember> {
    const newMember: ProjectMember = {
      id: data.user_id,
      username: "newmember",
      email: "newmember@example.com",
      role: data.role
    }
    return newMember
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    return Promise.resolve()
  }
} 