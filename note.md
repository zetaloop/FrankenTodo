## 一、项目概述

### 1.1 项目背景和目标
本实验旨在开发一个名为 **FrankenTodo** 的现代化任务管理系统。系统主要面向多用户协作和项目管理场景，提供如下功能：
1. **用户认证**：注册、登录、退出和权限管理
2. **项目管理**：项目的增删改查、成员管理、标签管理
3. **任务管理**：任务的增删改查、状态和优先级管理、标签管理
4. **跨平台桌面客户端**：使用 Tauri 作为启动器，一键式启动和管理后端服务，提供内置的 WebView 访问前端界面

### 1.2 开发环境与技术栈
- **前端**：Next.js 15.1.2 + React 19.0.0 + TypeScript 5.x  
  - UI 框架：Tailwind CSS 3.4.17 + Shadcn UI  
  - 表单处理：React Hook Form + Zod  
  - 组件库：Radix UI + Lucide React  

- **后端**：Spring Boot 3.4.1 + Java 23  
  - 安全：Spring Security + JJWT 0.12.6  
  - ORM：JPA/Hibernate  
  - 工具：Lombok 1.18.36  

- **启动器**：Tauri 2.x + Rust 2021  
  - 依赖：serde、reqwest、tauri-plugin-shell  
  - 功能：进程管理、日志监控、WebView 集成  

- **数据库**：OpenGauss 6.0+（支持 Docker 部署）  

### 1.3 项目特点与创新点
1. **前后端分离**：前端和后端可独立构建和部署，通过 RESTful API 进行交互。  
2. **一键式启动器整合**：Tauri 桌面应用启动后端进程并内置日志监控，同时内置 WebView 展示前端。  
3. **现代化 UI/UX**：基于 Tailwind CSS + Shadcn UI 提供响应式布局、主题切换和过渡动画等。  
4. **针对开发与生产的便捷脚本**：提供多种构建脚本，方便快速启动、调试和部署。

---

## 二、系统需求分析

### 2.1 功能需求
1. **用户管理**  
   - 用户注册与登录  
   - 个人信息管理  
   - 用户设置管理（如主题、通知开关）

2. **项目管理**  
   - 项目的创建、编辑、删除  
+  - 支持批量删除项目
   - 项目成员管理（角色分配：OWNER、MEMBER）  
+  - 项目成员保护（禁止删除最后一个所有者）
   - 项目标签管理  

3. **任务管理**  
   - 任务的创建、编辑、删除  
+  - 支持批量创建和删除任务
   - 任务状态管理（如 BACKLOG、TODO、IN_PROGRESS、DONE、CANCELED）  
   - 任务优先级管理（如 LOW、MEDIUM、HIGH）  
   - 任务标签管理  
+  - 新建任务时自动设置默认状态和优先级

4. **标签管理**  
   - 项目标签  
   - 任务标签  
+  - 批量创建任务时自动管理标签

### 2.2 非功能需求
1. **性能需求**  
   - 主要操作在 1~3 秒内完成响应  
   - 支持一定数量的并发访问

2. **安全需求**  
   - 采用 JWT 进行用户认证和权限控制  
   - 敏感数据加密存储（密码使用 BCrypt 等）

3. **可靠性需求**  
   - 数据一致性：事务处理、外键约束  
+  - 级联删除：删除项目时自动清理关联数据
   - 错误处理：提供统一的异常处理机制  

---

## 三、系统总体设计

### 3.1 系统架构设计
- **前后端分离架构**：前端使用 Next.js & React，后端使用 Spring Boot 提供 RESTful API  
- **桌面启动器架构**：使用 Tauri (Rust) 作为封装壳，一键启动后端进程并内置浏览器视图  

### 3.2 技术架构设计
1. **前端**：Next.js + React + TypeScript  
2. **后端**：Spring Boot + Java  
3. **启动器**：Tauri + Rust  
4. **数据库**：OpenGauss  

---

## 四、数据库设计

### 4.1 需求分析
数据库需要存储如下核心信息：  
1. **用户信息**（基本信息、认证信息、个性化设置）  
2. **项目信息**（项目描述、成员关系、标签）  
3. **任务信息**（任务详情、状态、优先级、任务标签）  

### 4.2 概念结构设计（E-R 图）
主要实体及关系：  
1. **User**（用户）  
2. **UserSettings**（用户设置，1:1 关系）  
3. **Project**（项目）  
4. **ProjectMember**（项目成员，User 与 Project 的 N:M 关系表）  
5. **Task**（任务，Project 与 Task 为 1:N）  
6. **Label**（标签，Project 与 Label 1:N，Task 与 Label 1:N，实际建表时拆分为 `project_labels` 与 `task_labels`）

### 4.3 逻辑结构设计

#### 4.3.1 序列（Sequences）
在 `init-db.sql` 中，为了方便生成主键或做其他用途，我们额外创建了一组序列：
```sql
CREATE SEQUENCE user_id_seq;
CREATE SEQUENCE user_settings_id_seq;
CREATE SEQUENCE project_id_seq;
CREATE SEQUENCE project_member_id_seq;
CREATE SEQUENCE task_id_seq;
```

#### 4.3.2 users 表
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

#### 4.3.3 user_settings 表
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

#### 4.3.4 projects 表
```sql
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.5 project_members 表
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
> **注意**: 这里对 `project_id` 和 `user_id` 均设置了 `ON DELETE CASCADE`，以便删除项目时同时清理项目成员关系；删除用户时也可自动清理对应关系。

#### 4.3.6 tasks 表
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

#### 4.3.7 project_labels 表
```sql
CREATE TABLE project_labels (
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, label)
);
```

#### 4.3.8 task_labels 表
```sql
CREATE TABLE task_labels (
    task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (task_id, label)
);
```

### 4.4 物理结构设计

#### 4.4.1 索引设计
1. **主键索引**  
   - 所有表使用 `VARCHAR(36)` 作为主键，用于存放 UUID。  
2. **外键索引**  
   - **project_members**：`(project_id, user_id)`  
   - **tasks**：`project_id`  
   - **user_settings**：`user_id`  
3. **唯一索引**  
   - `users` 表：`username, email`  
   - `project_members` 表：`(project_id, user_id)` 组合唯一  

#### 4.4.2 存储设计
- 使用 `VARCHAR(36)` 存储主键 ID，建议使用 UUID。  
- `created_at` / `updated_at` 默认为 `CURRENT_TIMESTAMP`。  
- 其他字段根据业务需求使用合适长度（如 `VARCHAR(255)` 存储密码或描述等）。

#### 4.4.3 安全设计
- 使用 **BCrypt** 加密存储密码。  
- 级联删除：删除用户时级联删除其设置，删除项目时级联删除关联的任务、成员和标签等。  
- 审计字段自动更新：可通过触发器或应用层逻辑维护 `updated_at`。  

#### 4.4.4 触发器设计
在 `init-db.sql` 中，为了在更新记录时自动刷新 `updated_at` 字段，定义并使用了统一的触发器函数：
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
随后，为每个需要维护更新时间的表（如 `users`, `user_settings`, `projects`, `project_members`, `tasks` 等）分别创建了 `BEFORE UPDATE` 触发器：
```sql
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at
    BEFORE UPDATE ON project_members
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
```
这样，在任何更新操作执行前，都能自动将 `updated_at` 更新为当前时间戳，不需要在应用层手动维护。

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
  - 与用户（User）表一对一关系  
  - 包含字段：
    - `theme`：主题，默认为 `light`  
    - `notifications_enabled`：通知开关，默认为 `true`  
  - 提供更新接口：`PATCH /api/v1/user/settings`

- **核心组件**  
  - `JwtAuthenticationFilter`：JWT 认证过滤器  
  - `JwtService`：Token 的生成和验证  
  - `AuthService`：业务逻辑实现（登录、刷新等）  
  - `SecurityConfig`：Spring Security 配置  

- **安全机制**  
  - 使用 BCrypt 对密码进行哈希加密  
  - 基于 JWT 的无状态认证  
  - 支持 Token 刷新  

#### 5.1.2 项目管理模块

- **核心功能**  
  - 项目 CRUD  
  - 项目成员管理  
  - 项目标签管理  

- **数据约束**  
  - 项目名称：长度 `3~50` 字符，不能为空  
  - 项目描述：最大 `500` 字符，可选  
  - 项目成员的唯一性：同一用户在同一项目中只能有一个角色  

- **权限控制**  
  - 创建者默认角色 `OWNER`  
  - 其他成员可分配角色 `OWNER` 或 `MEMBER`  
  - 不同角色对项目和任务的操作权限有所不同  

#### 5.1.3 任务管理模块

- **核心功能**  
  - 任务 CRUD  
  - 任务状态管理（`BACKLOG`/`TODO`/`IN_PROGRESS`/`DONE`/`CANCELED`）  
  - 任务优先级管理（`LOW`/`MEDIUM`/`HIGH`）  
  - 任务标签管理  
  - 支持批量创建、批量删除等操作  

- **数据约束**  
  - 任务标题：不能为空  
  - 任务描述：最大 `500` 字符，默认空字符串  
  - 任务必须关联到一个项目  
  - 状态权重（从低到高）：`BACKLOG(0) < TODO(1) < IN_PROGRESS(2) < DONE(3) < CANCELED(4)`  
  - 优先级权重（从低到高）：`LOW(0) < MEDIUM(1) < HIGH(2)`

- **业务规则**  
  - 支持根据状态或标签进行筛选  
  - 可通过接口实现批量操作  
    - 批量创建：`POST /api/v1/projects/{projectId}/tasks/batch`  
    - 批量删除：`DELETE /api/v1/projects/{projectId}/tasks` （请求体携带 `task_ids` 列表）  

### 5.2 接口设计

#### 5.2.1 API 接口（示例）

- **认证接口**：`/api/v1/auth/**`  
  - `POST /register`：注册  
  - `POST /login`：登录  
  - `POST /refresh`：刷新令牌  
  - `POST /logout`：退出登录  

- **用户设置接口**：`/api/v1/user/settings`  
  - `PATCH /`：更新用户主题、通知开关等设置  

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
  - `DELETE /`：批量删除任务（请求体中包含 `task_ids`）  

- **标签接口**：`/api/v1/projects/{projectId}/labels/**`  
  - `GET /`：获取项目的所有标签  
  - `POST /`：添加新标签  
  - `DELETE /`：删除标签  

#### 5.2.2 数据访问接口

- `UserRepository` / `ProjectRepository` / `TaskRepository` 等，均继承自 JPA 的 `JpaRepository`，实现基础 CRUD 和自定义查询。

### 5.3 数据库设计

- **ID 生成策略**  
  - 使用 UUID 作为主键，存储为 `VARCHAR(36)`  
  - 通过 `IdGeneratorListener` 在实体保存时自动生成 ID  

- **审计字段**  
  - 所有实体继承自 `BaseEntity`  
  - 包含 `created_at` 和 `updated_at` 字段  
  - 通过 `AuditingEntityListener` 自动维护审计信息  

### 5.4 前端与标签管理

- **标签管理**  
  - 在前端可预定义常用标签（如：`Bug`、`Feature`、`Documentation`）  
  - 允许在任务中添加多个标签  
  - 删除标签时，会自动从关联任务中移除该标签  

- **状态与优先级的 UI 展示**  
  - 不同状态对应不同图标（`HelpCircle`/`Circle`/`Timer`/`CheckCircle`/`CircleOff`）  
  - 不同优先级对应不同图标（`ArrowDown`/`ArrowRight`/`ArrowUp`）  

### 5.5 部署配置

- **配置加载机制**  
  - 支持从当前目录或 `backend` 子目录加载 `config.conf`  
  - 主要包含数据库连接信息和 JPA 相关配置  

- **版本要求**  
  - Spring Boot: `3.4.1`  
  - Java: `23`  
  - JWT: `0.12.6`  
  - Lombok: `1.18.36`  

### 5.6 安全设计

- **JWT 认证**  
  - `accessToken` 一般 1 小时有效  
  - `refreshToken` 一般 24 小时有效  
  - 过期后需刷新或重新登录  

- **权限控制**  
  - 采用角色控制 + URL 级别安全配置  
  - 在 `SecurityConfig` 中配置需要认证访问的路径  

---

## 六、系统实现

### 6.1 数据库实现
- **表结构**：已在数据库设计章节给出，包含 `users`, `user_settings`, `projects`, `project_members`, `tasks`, `project_labels`, `task_labels` 等。  
- **索引**：主键索引（UUID），外键索引，唯一索引等均在建表语句中体现。  
- **触发器**：实现自动更新 `updated_at`，或由应用层逻辑控制。

### 6.2 核心功能实现
- **用户认证**：
 - 基于 Spring Security + JWT 实现，支持：
   - 注册：邮箱+用户名+密码，自动校验唯一性
   - 登录：邮箱+密码认证，返回 access_token 和 refresh_token
   - Token 刷新：使用 refresh_token 获取新的 access_token
   - 登出：清除安全上下文
 - 安全特性：
   - 密码使用 BCrypt 加密存储
   - JWT Token 基于 HMAC-SHA256 签名
   - access_token 1小时过期，refresh_token 24小时过期
- **项目管理**：
 - 基本操作：
   - 项目的创建、编辑、删除和查询
   - 支持项目描述和标签管理
 - 成员管理：
   - 角色分级：OWNER、MEMBER
   - 权限控制：所有者可管理成员，成员仅可查看和操作任务
   - 保护机制：禁止删除项目的最后一个所有者
- **任务管理**：
 - 基本操作：
   - 任务的创建、编辑、删除和查询
   - 支持批量创建和批量删除
 - 状态管理：
   - 五种状态：BACKLOG(0) < TODO(1) < IN_PROGRESS(2) < DONE(3) < CANCELED(4)
   - 三级优先级：LOW(0) < MEDIUM(1) < HIGH(2)
 - 标签系统：
   - 支持任务标签的添加和移除
   - 批量操作时自动处理标签
 - 默认值处理：
   - 新建任务默认状态为 TODO
   - 新建任务默认优先级为 MEDIUM
   - 描述字段默认为空字符串
- **异常处理**：
 - 统一异常处理（GlobalExceptionHandler）：
   - 认证异常：无效凭证、Token过期等
   - 业务异常：用户已存在、项目不存在等
   - 验证异常：参数校验失败
   - 约束异常：数据库约束违反

---

## 七、系统测试

### 7.1 测试现状
当前测试覆盖面较低，主要存在以下情况：
1. **测试工具和配置**：目前仅引入了基础的 JUnit 5 和 Spring Boot Test 依赖，但尚未设置单独的测试环境配置文件，也未使用内存数据库（如 H2）进行数据测试。
2. **单元测试**：未编写针对服务层和数据访问层的单元测试（如 `AuthServiceTest`、`TaskRepositoryTest` 等）。
3. **集成测试**：未见对控制器接口的集成测试实现（如 `AuthControllerTest`）。
4. **性能与安全测试**：暂未进行性能测试和安全测试（如批量操作性能、权限控制验证等）。

### 7.2 后续计划
为补足测试缺失，后续工作将重点围绕以下方向：
1. **单元测试**：逐步补充服务层和数据访问层的核心功能测试，确保关键业务逻辑的准确性。
2. **集成测试**：针对接口设计的 RESTful API，编写集成测试验证数据流和权限控制的正确性。
3. **性能与安全测试**：使用工具（如 JMeter）对批量任务操作、Token 认证和权限控制进行验证，确保系统稳定性与安全性。
4. **测试环境配置**：完善内存数据库和测试专用配置文件，减少对生产环境的依赖。

### 7.3 测试总结
由于项目进度限制，当前测试内容不够完善，后续工作将优先补充核心功能测试和接口测试。通过逐步完善测试用例与环境配置，可提高系统的健壮性和稳定性，进一步验证其在多场景下的适用性。

## 八、结论与改进建议

1. **数据库设计**：已相对完善，涵盖了常见需求和约束（主键、外键、唯一索引、触发器等）。  
2. **详细设计与实现**：功能模块（用户、项目、任务）设计合理，采用前后端分离和一键启动器的创新形式，代码结构清晰。  
3. **测试不足**：目前测试覆盖率较低，性能测试和安全测试也缺失；与报告目标尚有一定差距。  
4. **改进方向**：  
   - **补齐测试用例**：单元测试、集成测试、性能测试、安全测试等；  
   - **完善文档**：将已实现的接口、数据结构与实际测试结果对照，以保障文档与项目进度一致；  
   - **持续集成**：引入 CI/CD 流程，自动执行测试并生成报告；  
   - **可用性优化**：前端界面细节、桌面启动器功能和日志监控可继续增强。

通过后续的改进和迭代，FrankenTodo 系统将逐步完善在真实生产环境下的可靠性与可维护性，满足更多用户的任务管理需求。
