# 《实验13 数据库应用程序开发》实验报告大纲

## 一、项目概述
- 项目背景和目标
  - 开发一个现代化的任务管理系统
  - 支持多用户协作和项目管理
  - 提供跨平台的桌面客户端
- 开发环境与技术栈
  - 前端：Next.js + React + TypeScript
  - 后端：Spring Boot + Java
  - 启动器：Tauri + Rust
  - 数据库：OpenGauss 6.0+
- 项目特点与创新点
  - 前后端分离架构
  - 桌面启动器整合
  - 现代化UI/UX设计

## 二、系统需求分析
- 功能需求
  - 用户管理
    - 用户注册与登录
    - 个人信息管理
    - 用户设置管理
  - 项目管理
    - 项目的创建、编辑、删除
    - 项目成员管理
    - 项目标签管理
  - 任务管理
    - 任务的创建、编辑、删除
    - 任务状态和优先级管理
    - 任务标签管理
  - 标签管理
    - 项目标签
    - 任务标签
- 非功能需求
  - 性能需求
    - 响应时间
    - 并发处理
  - 安全需求
    - 用户认证
    - 数据加密
  - 可靠性需求
    - 数据一致性
    - 错误处理

## 三、系统总体设计
- 系统架构设计
  - 前后端分离架构
  - 桌面启动器架构
- 技术架构设计
  - 前端：Next.js + React + TypeScript
  - 后端：Spring Boot + Java
  - 启动器：Tauri + Rust
  - 数据库：OpenGauss

## 四、数据库设计

### 4.1 需求分析
根据系统需求，数据库需要存储以下主要信息：
1. 用户信息：包括基本信息、认证信息和个人设置
2. 项目信息：包括项目基本信息、成员关系和项目标签
3. 任务信息：包括任务详情、状态、优先级和标签

### 4.2 概念结构设计（E-R图）
主要实体：
1. 用户（User）
2. 用户设置（UserSettings）
3. 项目（Project）
4. 项目成员（ProjectMember）
5. 任务（Task）
6. 标签（Label）

实体间关系：
- 用户 1:1 用户设置
- 用户 N:M 项目（通过项目成员关系）
- 项目 1:N 任务
- 项目 1:N 项目标签
- 任务 1:N 任务标签

### 4.3 逻辑结构设计

#### 4.3.1 用户表（users）
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

#### 4.3.2 用户设置表（user_settings）
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

#### 4.3.3 项目表（projects）
```sql
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.4 项目成员表（project_members）
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

#### 4.3.5 任务表（tasks）
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

#### 4.3.6 标签表设计
项目标签表（project_labels）：
```sql
CREATE TABLE project_labels (
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (project_id, label)
);
```

任务标签表（task_labels）：
```sql
CREATE TABLE task_labels (
    task_id VARCHAR(36) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    PRIMARY KEY (task_id, label)
);
```

### 4.4 物理结构设计

#### 4.4.1 索引设计
1. 主键索引
   - 所有表都使用UUID作为主键，长度为36的VARCHAR类型
   - 使用自定义ID生成器（CustomIdGenerator）生成时间戳前缀的ID

2. 外键索引
   - project_members表：project_id, user_id
   - tasks表：project_id
   - user_settings表：user_id

3. 唯一索引
   - users表：username, email
   - project_members表：(project_id, user_id)组合唯一索引

#### 4.4.2 存储设计
1. 字段类型选择
   - 使用VARCHAR(36)存储ID
   - 使用VARCHAR(50)存储用户名
   - 使用VARCHAR(255)存储邮箱
   - 使用VARCHAR(500)存储描述文本
   - 使用TIMESTAMP存储时间戳

2. 默认值设计
   - created_at和updated_at默认为CURRENT_TIMESTAMP
   - task.status默认为'TODO'
   - task.priority默认为'MEDIUM'
   - user_settings.theme默认为'light'
   - user_settings.notifications_enabled默认为true

#### 4.4.3 安全设计
1. 密码安全
   - 使用BCrypt加密存储密码
   - 密码字段使用VARCHAR(255)确保足够长度

2. 级联删除
   - 用户删除时级联删除用户设置
   - 项目删除时级联删除项目成员、任务和标签
   - 任务删除时级联删除任务标签

3. 触发器
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
```

## 五、详细设计
- 模块详细设计
  - 用户认证模块
  - 项目管理模块
  - 任务管理模块
  - 标签管理模块
- 接口设计
  - API接口设计
  - 数据访问接口设计
- 安全设计
  - JWT认证设计
  - 权限控制设计

## 六、系统实现
- 数据库实现
  - 表结构实现
  - 索引实现
  - 触发器实现
- 核心功能实现
  - 用户认证实现
  - 项目管理实现
  - 任务管理实现
- 关键代码展示与说明

## 七、系统测试
- 测试环境
- 功能测试
- 性能测试
- 安全测试

## 需要获取的信息：

1. 数据库设计相关：
- [x] 已获取数据库初始化脚本（init-db.sql）
- [x] 已获取实体类定义
- [x] 已获取数据库配置

2. 系统实现相关：
- [x] 已获取认证相关实现
- [x] 已获取服务层实现
- [x] 已获取数据访问层实现

3. 接口设计相关：
- [x] 已获取控制器实现
- [x] 已获取DTO定义

4. 测试相关：
- 需要查看测试用例（backend/src/test/）
- 需要查看测试配置

后续步骤：
1. [x] 已完成数据库设计部分
2. 需要继续分析系统实现代码，完成详细设计和实现部分
3. 需要查看测试相关代码，完成测试部分 