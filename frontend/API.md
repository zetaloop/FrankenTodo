# FrankenTodo API 文档 (优化版)

## 基础信息
- 基础URL: `/api/v1`
- 所有响应都使用 JSON 格式
- 认证使用 Bearer Token (`Authorization: Bearer <token>`)

## 响应和错误格式

### 成功响应
所有成功响应均为 JSON 格式，具体字段根据接口要求而定。

### 错误响应格式
当请求出错时，服务端返回如下格式的 JSON：
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {
      "field": "具体字段名",
      "reason": "详细原因描述"
    }
  }
}
```

#### 常见错误码示例
- `INVALID_PARAMETER`：请求参数错误
- `RESOURCE_NOT_FOUND`：资源不存在
- `UNAUTHORIZED`：Token 无效或过期
- `FORBIDDEN`：权限不足
- `CONFLICT`：资源冲突（如重复创建）
- `INTERNAL_ERROR`：服务器内部错误

## 通用说明

- 时间戳字段 (`created_at`, `updated_at`) 建议统一使用 ISO 8601 格式： `YYYY-MM-DDTHH:mm:ssZ`
- 所有返回的数据中 ID 字段将使用字符串类型的 UUID。

## API 端点

### 认证相关 API

#### 用户注册
- **POST** `/auth/register`
- **描述**: 注册新用户
- **请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **响应示例** (201 Created):
```json
{
  "id": "user-123",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "created_at": "2024-12-19T09:00:00Z"
}
```

#### 用户登录
- **POST** `/auth/login`
- **描述**: 用户登录并获取访问令牌
- **请求体**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-123",
    "username": "johndoe",
    "email": "johndoe@example.com"
  }
}
```

#### 退出登录
- **POST** `/auth/logout`
- **描述**: 使当前token失效
- **响应**: 204 No Content

#### 刷新令牌
- **POST** `/auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 项目相关 API

#### 获取所有项目
- **GET** `/projects`
- **描述**: 获取用户有权访问的所有项目列表
- **响应示例**: 
```json
{
  "projects": [
    {
      "id": "fd9b02ca-5ac9-40c6-b756-ead6786675ae",
      "name": "FrankenTodo 任务管理系统",
      "description": "一个用于管理和跟踪任务的系统",
      "created_at": "2024-12-19T12:00:00Z",
      "updated_at": "2024-12-19T13:00:00Z"
    },
    {
      "id": "62da762d-715b-4c15-a8e7-4c53fd83bea3",
      "name": "天气控制器",
      "description": "一个用于控制和模拟天气的项目",
      "created_at": "2024-12-19T10:00:00Z",
      "updated_at": "2024-12-19T11:00:00Z"
    }
  ]
}
```

#### 创建项目
- **POST** `/projects`
- **描述**: 创建新项目
- **请求体**:
```json
{
  "name": "string",
  "description": "string"
}
```
- **响应示例** (201 Created):
```json
{
  "id": "abc123",
  "name": "新项目",
  "description": "项目描述",
  "created_at": "2024-12-19T14:00:00Z",
  "updated_at": "2024-12-19T14:00:00Z"
}
```

#### 获取项目详情
- **GET** `/projects/{projectId}`
- **描述**: 获取特定项目的详细信息
- **响应示例**:
```json
{
  "id": "fd9b02ca-5ac9-40c6-b756-ead6786675ae",
  "name": "FrankenTodo 任务管理系统",
  "description": "一个用于管理和跟踪任务的系统",
  "created_at": "2024-12-19T12:00:00Z",
  "updated_at": "2024-12-19T13:00:00Z"
}
```

#### 更新项目
- **PUT** `/projects/{projectId}`
- **描述**: 更新项目信息
- **请求体**:
```json
{
  "name": "string",
  "description": "string"
}
```
- **响应示例**:
```json
{
  "id": "project-123",
  "name": "更新后的项目名称",
  "description": "更新后的项目描述",
  "created_at": "2024-12-19T12:00:00Z",
  "updated_at": "2024-12-19T14:30:00Z"
}
```

#### 删除项目
- **DELETE** `/projects/{projectId}`
- **描述**: 删除特定项目
- **响应**: 204 No Content

#### 获取项目成员
- **GET** `/projects/{projectId}/members`
- **描述**: 获取项目成员列表
- **响应示例**:
```json
{
  "members": [
    {
      "id": "user-123",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "role": "owner"
    },
    {
      "id": "user-456",
      "username": "janedoe",
      "email": "janedoe@example.com",
      "role": "member"
    }
  ]
}
```

#### 添加项目成员
- **POST** `/projects/{projectId}/members`
- **描述**: 向项目添加新成员
- **请求体**:
```json
{
  "user_id": "string",
  "role": "string" // "owner" | "member"
}
```
- **响应示例** (201 Created):
```json
{
  "id": "user-789",
  "username": "newmember",
  "email": "newmember@example.com",
  "role": "member"
}
```

#### 移除项目成员
- **DELETE** `/projects/{projectId}/members/{userId}`
- **描述**: 从项目中移除成员
- **响应**: 204 No Content

### 任务相关 API

#### 获取项目任务列表
- **GET** `/projects/{projectId}/tasks`
- **描述**: 获取特定项目下的所有任务（一次性返回所有相关任务）
  
  > 目前暂不实现分页、排序、筛选。后端将会一次性返回所有符合筛选条件的任务，然后在前端进行筛选、排序、搜索等。
  
- **响应示例**:
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "实现用户登录",
      "description": "需要为前端提供登录接口",
      "status": "todo",
      "priority": "high",
      "labels": ["feature", "api"],
      "created_at": "2024-12-19T10:20:00Z",
      "updated_at": "2024-12-19T11:00:00Z"
    },
    {
      "id": "task-2",
      "title": "修复用户注册Bug",
      "description": "注册页面报错，需要修复",
      "status": "in progress",
      "priority": "medium",
      "labels": ["bug", "frontend"],
      "created_at": "2024-12-19T09:15:00Z",
      "updated_at": "2024-12-19T10:00:00Z"
    }
  ]
}
```

#### 创建任务
- **POST** `/projects/{projectId}/tasks`
- **描述**: 在指定项目下创建新任务
- **请求体**:
```json
{
  "title": "string",
  "description": "string",
  "status": "string",
  "priority": "string",
  "labels": ["string"]
}
```
- **响应示例** (201 Created):
```json
{
  "id": "new-task-id",
  "title": "新增任务",
  "description": "任务描述",
  "status": "todo",
  "priority": "low",
  "labels": ["bug", "frontend"],
  "created_at": "2024-12-19T14:10:00Z",
  "updated_at": "2024-12-19T14:10:00Z"
}
```

#### 批量创建任务
- **POST** `/projects/{projectId}/tasks/batch`
- **描述**: 批量创建任务
- **请求体**:
```json
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "status": "string",
      "priority": "string",
      "labels": ["string"]
    }
  ]
}
```
- **响应示例** (201 Created):
```json
{
  "tasks": [
    {
      "id": "task-1",
      "title": "新增任务1",
      "description": "描述1",
      "status": "todo",
      "priority": "low",
      "labels": ["feature"],
      "created_at": "2024-12-19T14:20:00Z",
      "updated_at": "2024-12-19T14:20:00Z"
    },
    {
      "id": "task-2",
      "title": "新增任务2",
      "description": "描述2",
      "status": "in progress",
      "priority": "medium",
      "labels": ["bug"],
      "created_at": "2024-12-19T14:21:00Z",
      "updated_at": "2024-12-19T14:21:00Z"
    }
  ]
}
```

#### 获取任务详情
- **GET** `/projects/{projectId}/tasks/{taskId}`
- **描述**: 获取特定任务的详细信息
- **响应示例**:
```json
{
  "id": "task-1",
  "title": "实现用户登录",
  "description": "需要为前端提供登录接口",
  "status": "todo",
  "priority": "high",
  "labels": ["feature"],
  "created_at": "2024-12-19T10:20:00Z",
  "updated_at": "2024-12-19T11:00:00Z"
}
```

#### 更新任务
- **PUT** `/projects/{projectId}/tasks/{taskId}`
- **描述**: 更新特定任务（完整更新）
- **请求体**: 同创建任务请求体
- **响应示例**:
```json
{
  "id": "task-1",
  "title": "实现用户登录（更新后）",
  "description": "更新了描述",
  "status": "in progress",
  "priority": "medium",
  "labels": ["feature", "api"],
  "created_at": "2024-12-19T10:20:00Z",
  "updated_at": "2024-12-19T15:00:00Z"
}
```

#### 删除任务
- **DELETE** `/projects/{projectId}/tasks/{taskId}`
- **描述**: 删除特定任务
- **响应示例** (204 No Content): 无内容

#### 批量删除任务
- **DELETE** `/projects/{projectId}/tasks`
- **描述**: 批量删除任务
- **请求体**:
```json
{
  "task_ids": ["task-1", "task-2"]
}
```
- **响应示例**:
```json
{
  "deleted_count": 2
}
```

### 标签相关 API

#### 获取项目标签列表
- **GET** `/projects/{projectId}/labels`
- **描述**: 获取项目的所有标签
- **响应示例**:
```json
{
  "labels": [
    "Bug",
    "Feature",
    "Documentation"
  ]
}
```

#### 添加项目标签
- **POST** `/projects/{projectId}/labels`
- **描述**: 添加新标签到项目
- **请求体**:
```json
{
  "label": "string"
}
```
- **响应示例** (201 Created):
```json
{
  "label": "新标签"
}
```

#### 删除项目标签
- **DELETE** `/projects/{projectId}/labels`
- **描述**: 从项目中删除一个或多个标签（同时会从所有任务中移除这些标签）
- **请求体**:
```json
{
  "labels": ["string"]
}
```
- **响应**: 204 No Content

### 用户相关 API

#### 获取当前用户信息
- **GET** `/user`
- **描述**: 获取当前登录用户信息
- **响应示例**:
```json
{
  "id": "user-123",
  "username": "johndoe",
  "email": "johndoe@example.com",
  "created_at": "2024-12-19T09:00:00Z",
  "updated_at": "2024-12-19T10:00:00Z"
}
```

#### 更新用户设置
- **PATCH** `/user/settings`
- **描述**: 更新用户个人设置
- **请求体示例**:
```json
{
  "theme": "dark",
  "notifications_enabled": true
}
```
- **响应示例**:
```json
{
  "theme": "dark",
  "notifications_enabled": true,
  "updated_at": "2024-12-19T10:30:00Z"
}
```

## 状态码说明

- 200: 成功
- 201: 创建成功
- 204: 删除/更新成功且无返回内容
- 400: 请求参数错误（Invalid Parameter）
- 401: 未授权（Token 无效或过期）
- 403: 权限不足
- 404: 资源不存在
- 409: 资源冲突
- 422: 请求实体处理错误
- 500: 服务器内部错误
