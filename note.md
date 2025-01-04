# FrankenTodo 现代化任务管理系统实验报告

## 一、项目概述

### 1.1 项目背景和目标

在当今协同办公与远程合作日渐普及的背景下，人们对任务管理工具的需求越来越高。本实验的目标，便是基于 **FrankenTodo** 这一现代化任务管理系统原型，探索如何在前后端分离架构下，实现跨平台的一键启动与多用户协作管理功能。

该系统主要面向项目管理与多成员协作场景，力求在保证安全与性能的前提下，为用户带来更直观、便捷的任务管理体验。系统的核心功能如下：
1. **用户认证**：注册、登录、退出和权限管理
2. **项目管理**：增删改查、成员管理、标签管理
3. **任务管理**：增删改查、状态和优先级管理、标签管理
4. **跨平台桌面客户端**：基于 Tauri 作为封装启动器，一键式启动后端，并通过内置 WebView 访问前端界面

### 1.2 开发环境与技术栈

FrankenTodo 的开发环境与技术栈较为多样，前端与后端均选用了最新或较新的框架与语言版本：

- **前端**
  - 使用 Next.js（15.1.2）与 React（19.0.0）结合 TypeScript（5.x），能带来高效的开发体验及可维护性。
  - UI 部分基于 Tailwind CSS（3.4.17）和 Shadcn UI，搭配 Radix UI + Lucide React 的组件库，为用户提供现代化的交互和视觉体验。

- **后端**
  - Spring Boot（3.4.1）+ Java 23，符合当前主流开发趋势，并在大规模应用中具有广泛应用。
  - 安全方面使用 Spring Security 与 JJWT（0.12.6）来管理用户认证与授权。
  - 数据访问层基于 JPA/Hibernate，配合 Lombok（1.18.36）减少样板代码。

- **启动器（桌面端）**
  - Tauri（2.x）+ Rust（2021），既可在桌面环境下提供一键式的启动体验，也能减少应用的体积占用。
  - 依赖了 serde、reqwest、tauri-plugin-shell 等，为进程管理、日志监控、WebView 集成提供支持。

- **数据库**
  - 选用 OpenGauss（6.0+）作为数据库，可在 Docker 容器中部署，为后续的伸缩性和数据管理提供更多便利。

### 1.3 项目特点与创新点

1. **前后端分离**：Next.js + Spring Boot 的组合，使得前端与后端能够独立构建和部署，通过 RESTful API 进行交互，方便维护与扩展。
2. **一键式启动器整合**：Tauri 负责将后端进程与前端页面整合到一个可执行的桌面应用中，并提供日志监控功能，用户只需一键启动即可使用。
3. **现代化 UI/UX**：基于 Tailwind CSS + Shadcn UI 的设计，将响应式布局、主题切换、过渡动画等功能集成在一起，为用户提供了统一且美观的界面。
4. **便捷的开发与生产脚本**：项目提供多种构建与启动脚本，使得开发者能够快速完成调试与部署，极大提升了开发效率。

---

## 二、系统需求分析

### 2.1 功能需求

本系统围绕用户管理、项目管理、任务管理与标签管理四个核心方向展开：

1. **用户管理**
   - 用户注册、登录、登出
   - 个人信息与账户设置（主题切换、通知开关等）

2. **项目管理**
   - 新增、编辑、删除项目
   - 批量删除项目、项目成员管理（角色分配：OWNER / MEMBER）
   - 项目成员保护（禁止删除最后一个所有者）
   - 项目标签管理

3. **任务管理**
   - 创建、编辑、删除任务
   - 支持批量创建与删除
   - 任务状态管理（BACKLOG、TODO、IN_PROGRESS、DONE、CANCELED）
   - 任务优先级管理（LOW、MEDIUM、HIGH）
   - 任务标签管理
   - 新建任务时自动设置默认状态（TODO）和优先级（MEDIUM）

4. **标签管理**
   - 项目标签与任务标签
   - 支持在批量创建任务时自动管理标签

### 2.2 非功能需求

1. **性能需求**
   - 常见操作在 1~3 秒内完成响应
   - 支持一定规模的并发访问

2. **安全需求**
   - 基于 JWT 进行用户认证和权限控制
   - 密码等敏感信息加密存储（使用 BCrypt）

3. **可靠性需求**
   - 数据一致性：事务处理、外键约束
   - 级联删除：删除项目时自动清理关联任务、标签等
   - 完善的错误处理与异常捕获机制

---

## 三、系统总体设计

### 3.1 系统架构设计

FrankenTodo 采用前后端分离的分层架构：前端由 Next.js + React 实现，通过 RESTful API 与后端 Spring Boot 服务通信；Tauri 进一步封装后端启动流程与前端页面，形成可跨平台部署的桌面应用。

### 3.2 技术架构设计

1. **前端**：Next.js + React + TypeScript
2. **后端**：Spring Boot + Java
3. **启动器**：Tauri + Rust
4. **数据库**：OpenGauss（Docker 容器部署）

---

## 四、数据库设计

### 4.1 需求分析

针对用户、项目、任务与标签等信息，本系统需要在数据库中保留所有核心字段，并保证完整的业务关联。例如，用户与项目是多对多的关系（通过中间表 `project_members`），而项目与任务是 1 对多的关系，任务与标签则是多对多的拆分实现。

### 4.2 概念结构设计（E-R 图）

主要实体及关系：
1. **User**（用户）
2. **UserSettings**（用户设置，1:1 关系）
3. **Project**（项目）
4. **ProjectMember**（项目成员，User 与 Project 的 N:M 关系表）
5. **Task**（任务，Project 与 Task 为 1:N）
6. **Label**（标签，Project 与 Task 均可关联，分别以 `project_labels` 和 `task_labels` 表实现）

### 4.3 逻辑结构设计

#### 4.3.1 序列（Sequences）
在 `init-db.sql` 中，为了统一管理主键及其他需要自增的数值，定义了多组序列（如 `user_id_seq`, `project_id_seq` 等），后续可在插入记录时使用。

#### 4.3.2 `users` 表

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.3 `user_settings` 表

```sql
CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(50) NOT NULL DEFAULT 'light',
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.4 `projects` 表

```sql
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.5 `project_members` 表

```sql
CREATE TABLE project_members (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_id)
);
```
> **注意**：这里配置了 `ON DELETE CASCADE`，使得在删除项目或用户时能够自动清理关联的成员关系。

#### 4.3.6 `tasks` 表

```sql
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(500) DEFAULT '',
    status VARCHAR(50) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.7 `project_labels` 表

```sql
CREATE TABLE project_labels (
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, label)
);
```

#### 4.3.8 `task_labels` 表

```sql
CREATE TABLE task_labels (
    task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (task_id, label)
);
```

### 4.4 物理结构设计

#### 4.4.1 索引设计

- **主键索引**：使用 `VARCHAR(36)` 存储 UUID 作为主键。
- **外键索引**：对常用关联字段（如 `project_id`, `user_id`）创建索引，提高查询效率。
- **唯一索引**：如 `users` 表中的 `username`、`email` 以及 `project_members` 表中的 `(project_id, user_id)` 组合。

#### 4.4.2 存储设计

- 主键字段使用 UUID 格式，便于在分布式场景下避免冲突。
- `created_at` / `updated_at` 默认使用 `CURRENT_TIMESTAMP`。
- 其他字段根据业务需求制定合理的长度限制。

#### 4.4.3 安全设计

- 使用 **BCrypt** 对用户密码进行加密存储。
- 级联删除确保数据完整性，例如删除某个项目时，自动清理关联的任务、成员以及项目标签。
- 对 `updated_at` 等审计字段，可使用触发器或应用层逻辑自动维护。

#### 4.4.4 触发器设计

`init-db.sql` 中定义了统一的触发器函数 `update_updated_at_column()`，并在多个表上创建相应的 `BEFORE UPDATE` 触发器，使得 `updated_at` 在任何更新操作前自动更新为当前时间戳。

---

## 五、详细设计

### 5.1 模块详细设计

#### 5.1.1 用户认证模块

- **认证流程**
  - 注册（`POST /api/v1/auth/register`）
  - 登录（`POST /api/v1/auth/login`）获取 JWT
  - 刷新 Token（`POST /api/v1/auth/refresh`）
  - 登出（`POST /api/v1/auth/logout`）

- **用户设置（UserSettings）**
  - 与用户表一对一关联
  - 字段包括 `theme`、`notifications_enabled` 等
  - 更新接口：`PATCH /api/v1/user/settings`

- **核心组件**
  - `JwtAuthenticationFilter`、`JwtService`、`AuthService`
  - `SecurityConfig`：Spring Security 总体配置

- **安全机制**
  - BCrypt 对密码进行哈希加密
  - JWT 无状态认证
  - Refresh Token 机制确保长时间登录

#### 5.1.2 项目管理模块

- **核心功能**
  - 项目 CRUD
  - 成员管理（角色：OWNER、MEMBER）
  - 标签管理

- **数据约束**
  - 项目名称长度 3~50，描述可选
  - 同一用户在同一项目中只能拥有唯一角色条目（唯一索引）

- **权限控制**
  - 创建项目的用户默认为 OWNER
  - OWNER 可管理成员与任务权限；MEMBER 只可操作自身任务
  - 禁止删除项目的最后一个所有者

#### 5.1.3 任务管理模块

- **核心功能**
  - 任务 CRUD
  - 状态管理（BACKLOG、TODO、IN_PROGRESS、DONE、CANCELED）
  - 优先级管理（LOW、MEDIUM、HIGH）
  - 任务标签管理
  - 批量创建与删除

- **数据约束**
  - 标题必填，描述最大 500 字
  - 任务必须关联到某个项目
  - 状态与优先级具备对应的权重顺序

- **业务规则**
  - 新建任务时自动设置默认状态与优先级
  - 支持通过状态、标签等条件进行筛选
  - 接口示例：
    - 批量创建：`POST /api/v1/projects/{projectId}/tasks/batch`
    - 批量删除：`DELETE /api/v1/projects/{projectId}/tasks`（请求体携带 `task_ids` 列表）

### 5.2 接口设计

#### 5.2.1 API 接口（示例）

- **认证接口**：`/api/v1/auth/**`
  - `POST /register`：注册
  - `POST /login`：登录
  - `POST /refresh`：刷新令牌
  - `POST /logout`：退出登录

- **用户设置接口**：`/api/v1/user/settings`
  - `PATCH /`：更新用户主题、通知开关等

- **项目接口**：`/api/v1/projects/**`
  - `GET /`：获取所有项目
  - `POST /`：创建新项目
  - `GET /{projectId}`：获取项目详情
  - `PUT /{projectId}`：更新项目
  - `DELETE /{projectId}`：删除项目
  - `GET /{projectId}/members`：获取项目成员列表
  - `POST /{projectId}/members`：添加项目成员
  - `DELETE /{projectId}/members/{userId}`：移除项目成员

- **任务接口**：`/api/v1/projects/{projectId}/tasks/**`
  - `GET /`：获取项目下所有任务
  - `POST /`：创建任务
  - `POST /batch`：批量创建任务
  - `GET /{taskId}`：获取任务详情
  - `PUT /{taskId}`：更新任务（完整更新）
  - `PATCH /{taskId}/status`：仅更新任务状态
  - `PATCH /{taskId}/priority`：仅更新任务优先级
  - `DELETE /{taskId}`：删除任务
  - `DELETE /`：批量删除任务（请求体含 `task_ids`）

- **标签接口**：`/api/v1/projects/{projectId}/labels/**`
  - `GET /`：获取项目所有标签
  - `POST /`：添加新标签
  - `DELETE /`：删除标签

#### 5.2.2 数据访问接口

- `UserRepository` / `ProjectRepository` / `TaskRepository` 等均继承自 `JpaRepository`，提供基础 CRUD 与自定义查询。

### 5.3 数据库设计

- **ID 生成策略**：基于 UUID（`VARCHAR(36)`）。
- **审计字段**：所有实体可继承 `BaseEntity`，统一包含 `created_at` 与 `updated_at`。
- **自动维护**：借助 `AuditingEntityListener` 实现审计字段的自动更新。

### 5.4 前端与标签管理

- **标签管理**
  - 前端可预定义一些常用标签，并允许用户自定义
  - 同一个任务可添加多个标签
  - 删除标签时，会自动从关联任务中移除

- **状态与优先级的 UI 展示**
  - 不同状态对应不同图标（如 `HelpCircle` / `Circle` / `Timer` / `CheckCircle` / `CircleOff`）
  - 不同优先级对应不同箭头图标（如 `ArrowDown` / `ArrowRight` / `ArrowUp`）

### 5.5 部署配置

- **配置加载机制**：支持从当前目录或 `backend` 子目录加载 `config.conf`，主要包括数据库连接信息与 JPA 配置。
- **版本要求**：Spring Boot `3.4.1`、Java `23`、JWT `0.12.6`、Lombok `1.18.36`。

### 5.6 安全设计

- **JWT 认证**
  - `accessToken` 默认 1 小时有效，`refreshToken` 默认 24 小时有效
  - 支持 Token 过期后通过 `refreshToken` 刷新

- **权限控制**
  - 基于角色控制 + URL 级别安全配置
  - 在 `SecurityConfig` 中配置需要认证才可访问的路径

---

## 六、系统实现

### 6.1 数据库实现

- **表结构**：`users`, `user_settings`, `projects`, `project_members`, `tasks`, `project_labels`, `task_labels` 等。
- **索引**：主键索引（UUID）、唯一索引（如 `username`, `(project_id, user_id)`）等。
- **触发器**：自动更新 `updated_at`，也可采用应用层逻辑进行。

### 6.2 核心功能实现

- **用户认证**
  - Spring Security + JWT：实现注册、登录、Token 刷新与登出
  - 使用 BCrypt 保存密码，Token 基于 HMAC-SHA256
- **项目管理**
  - 增删改查及成员管理
  - 标签管理与角色分配
  - 防止删除项目的最后一个 OWNER
- **任务管理**
  - 增删改查、批量操作
  - 状态与优先级管理
  - 任务标签添加与移除
  - 默认值：新建任务默认状态为 TODO、优先级为 MEDIUM
- **异常处理**
  - 全局异常处理器 `GlobalExceptionHandler` 统一捕获认证异常、业务异常与数据库约束异常。

---

## 七、系统测试

### 7.1 测试基础设施

目前的测试基础环境包括：
1. **JUnit 5 + Spring Boot Test**：简化单元测试与集成测试的编写
2. **spring-security-test**：提供安全相关的测试工具，可模拟登录用户访问接口
3. **BackendApplicationTests**：基本的应用上下文加载测试，确保服务能够正常启动

### 7.2 测试发展规划

1. **单元测试扩展**：重点补充 `AuthService`、`TaskService` 等核心服务的单元测试用例
2. **接口测试覆盖**：逐步实现对所有 RESTful API 的测试，以验证认证流程与核心业务逻辑
3. **性能测试**：利用 JMeter 等工具对批量任务、并发操作等高负载场景进行测试
4. **测试环境优化**：在未来可能引入内存数据库进行更快速的测试执行与环境隔离

### 7.3 测试展望

随着测试体系的不断完善，系统的可靠性和稳定性也将持续提升。后续将更加关注核心业务功能的测试覆盖率与性能指标，为用户提供更顺畅、更安全的使用体验。

---

## 八、总结

在本实验项目中，我们成功结合 Rust、Java、Next.js 等多种技术栈，搭建起了一个跨平台、多用户协作的任务管理系统 **FrankenTodo**。通过前后端分离、Tauri 一键整合，以及 OpenGauss 数据库的选用，我们不仅实现了基础的项目管理与任务管理功能，也在安全设计与性能优化方面进行了深入实践。

项目带来的主要价值与意义包括：
1. **技术创新与多栈实践**：将 Rust、Java、Next.js 等不同技术生态整合到一个系统中，积累了宝贵的全栈开发经验。
2. **简化部署的一键启动**：利用 Tauri 提供的封装能力，让终端用户可以通过桌面客户端快速启动并使用后端服务。
3. **安全与可扩展性**：采用 Spring Security + JWT 的无状态认证模型，并使用 OpenGauss 提供数据管理与查询能力，为后续大规模部署打下坚实基础。
4. **可维护的架构设计**：前后端独立开发、统一的 RESTful API 设计，以及多层次的测试策略，都为系统的后续迭代提供了便利。

通过此次实验，我们对多层架构、现代前端框架，以及安全认证机制有了更深入的理解，也为在未来更大规模或更复杂的企业级项目中进行应用开发与优化积累了重要经验。整体而言，FrankenTodo 已经完成了核心功能与基础测试，后续在功能扩展与性能优化方面仍大有可为。相信在不断的迭代中，该系统能为用户带来更加优质的任务管理体验。
