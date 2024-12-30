# FrankenTodo 项目架构说明书

## 1. 项目概述

**FrankenTodo** 是一个全栈应用，涵盖了：
- **前端（frontend）**：使用 Next.js (React + TypeScript) 实现任务管理、团队协作等功能的 Web 界面  
- **后端（backend）**：基于 Spring Boot (Java) 实现核心业务逻辑、数据持久化和安全认证  
- **桌面启动器（launcher）**：使用 Tauri (Rust) 打包成跨平台的桌面应用，可一键启动后端、监控日志，并在内置的 WebView 中访问前端页面

项目采用 **JWT** 进行用户认证，使用 **OpenGauss** 数据库（可通过 Docker 快速部署）。在**生产环境**下，前端会被打包成静态文件并整合进后端 Jar；桌面启动器只需执行后端 Jar 并通过 8080 端口进行访问，兼具跨平台、轻量化与易维护的特点。

---

## 2. 整体目录结构

下面给出项目的顶层目录结构示例，每个主要模块（`backend`、`frontend`、`launcher`）相互独立又可整合部署。

```bash
FrankenTodo/
├── backend/                   # 后端（Spring Boot）
│   ├── src/
│   │   └── main/
│   │       ├── java/build/loop/todo/
│   │       │   ├── config/           # 配置类 (SecurityConfig, JwtConfig 等)
│   │       │   ├── controller/       # 表现层 (AuthController, TaskController 等)
│   │       │   ├── model/
│   │       │   │   ├── dto/          # DTO 请求与响应模型
│   │       │   │   └── entity/       # 实体类 (User, Task, Project 等)
│   │       │   ├── repository/       # 数据访问层 (JPA Repository)
│   │       │   ├── service/          # 业务逻辑层
│   │       │   ├── security/         # 安全相关 (JWT 过滤器、UserDetails 等)
│   │       │   ├── exception/        # 全局异常处理
│   │       │   ├── util/             # 工具类
│   │       │   └── BackendApplication.java
│   │       └── resources/            # 应用配置 (application.yml 等)
│   ├── pom.xml
│   └── init-db.sql                   # 初始化数据库脚本 (可选)
│
├── frontend/                         # 前端 (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/               # 认证相关页面 & 布局
│   │   │   │   ├── login/            # 登录页面
│   │   │   │   └── register/         # 注册页面
│   │   │   └── tasks/                # 任务管理页面
│   │   │       └── components/       # 任务管理组件
│   │   ├── lib/
│   │   │   └── api/                  # API 请求封装 (auth.ts, tasks.ts 等)
│   │   ├── hooks/                    # 自定义Hooks (useAuth, useTasks 等)
│   │   ├── components/               # shadcn UI 组件库
│   │   └── providers/                # 调试状态管理
│   ├── public/                       # 静态资源 (图标、图片等)
│   └── package.json
│
├── launcher/                         # 桌面启动器 (Tauri + Rust)
│   ├── src/                          # 启动器界面组件
│   ├── src-tauri/
│   │   ├── src/                      # Rust核心逻辑 (main.rs, lib.rs等)
│   │   ├── capabilities/
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json           # Tauri 应用配置
│   └── build.ps1                     # 一键构建打包脚本
│
└── README.md                         # 项目说明文档
```

> **说明**：  
> 1. 前端的所有静态资源、组件与业务页面均位于 `src/app` 及 `src/components` 等文件夹中。  
> 2. 后端通过 `src/main/java/build/loop/todo/...` 进行多层次组织，涵盖 `controller`、`service`、`repository` 和 `model` 等目录。  
> 3. 启动器使用 Tauri 2.0，核心逻辑在 `src-tauri/src` 中实现。
> 4. 构建输出统一到 `dist` 目录，便于发布和部署。

---

## 3. 技术栈与版本

### 3.1 前端

- **Next.js**: 13+（文档更新中也出现了 Next.js 15.1.2，说明项目保持最新版本）  
- **React**: 19.0.0（需 Node.js 18+）  
- **TypeScript**: 5.x  
- **Tailwind CSS / Shadcn UI**: 3.4.17+  
- **React Hook Form + Zod**：实现表单验证和类型安全  
- **Radix UI / Lucide React**：通用 UI 库及图标组件  
- **ESLint**: 9.x

### 3.2 后端

- **Spring Boot**: 3.4.1  
- **Java**: 23  
- **JJWT**: 0.12.6 （JWT 鉴权）  
- **Lombok**: 1.18.36  
- **OpenGauss JDBC**: 6.0.0-og  
- **Maven**: 3.9+  
- **JPA/Hibernate**: 随 Spring Boot 3.x 默认

### 3.3 桌面启动器

- **Tauri**: 2.x  
- **Rust**: 1.75+ (Rust Edition 2021)  
- **Serde / Serde JSON**: 1.x  
- **Reqwest**: 0.11.x  
- **Tauri Plugin Shell**: 2.x

### 3.4 数据库

- **OpenGauss**: 6.0+  
- 建议使用 Docker 的方式部署 OpenGauss，后端通过 JDBC 与其连接。

### 3.5 实际开发环境

- Node.js 23
- Java 23
- Maven 3.9.9
- Rust 1.83

---

## 4. 核心功能模块

### 4.1 前端（Next.js）

1. **认证模块**  
   该模块包含登录、注册与注销功能，核心是对 JWT Token 的获取与刷新。通过编写如 `useAuth` 等自定义 Hook，将 Token 的请求、存储及自动刷新流程统一管理。为了保证输入的合法性和用户体验，常会利用 `Zod` 或其他校验库进行表单验证，并在界面上辅以弹窗或 Toast 提示。当 Token 过期时，前端会自动向后端请求新的 Token，从而避免频繁的手动登录操作。此外，本地开发时支持 Mock API，在无后端环境的情况下也能模拟完整的登录流程。

2. **任务管理**  
   前端提供了任务的创建、编辑、删除及标记完成等功能，并支持为任务设置优先级和多种状态（待办、进行中、已完成、已取消等）。用户可快速浏览任务列表，执行批量操作，或利用标签与筛选实现高效的分类管理。界面上通过骨架屏（Skeleton）在加载阶段做过渡处理，减少等待时间的感知，并且在任务的增删改后会自动刷新列表或触发 Toast 提示，确保操作结果直观可见。

3. **项目管理**  
   与任务相似，项目管理包含了项目的创建、编辑和删除，且可与用户、任务进行多对多或一对多关联。通过切换项目，即可查看对应的成员及任务列表。当用户尚未拥有任何项目时，前端会以空状态视图指引其进行创建；出现加载错误时，则使用 Toast 或对话框告知并引导重试。项目标签和进度管理也被整合在对应的页面与组件中，以便用户对项目进行全局控制与跟踪。

4. **UI 组件 & 全局状态**  
   依托 Tailwind CSS、shadcn/ui 和 Radix UI，前端统一了 Button、Dialog、DropdownMenu 等基础组件的视觉风格，并提供了诸如 Avatar、Toast、Skeleton 等辅助组件。全局状态管理主要借助 React Hooks 或 Context，在登录态、当前项目、任务缓存等方面实现了数据的集中存储与监听。一些常用的结构或类型（例如 `User`, `Project`, `Task`）也都通过 TypeScript 进行定义，从而确保不同模块间的数据交互顺畅且安全。

5. **API 请求封装**  
   所有接口请求通过统一的客户端进行封装，自动附带 Token 及必要的请求头；若 Token 过期，该客户端会先尝试刷新 Token 并重试原请求，再根据返回结果决定是否跳转登录页。请求异常时，前端会利用 Toast 或其他组件进行统一提示，方便用户与开发者及时定位错误。若需要在开发环境下测试，也可以启用 Mock API 实现「本地自给自足」的模拟数据，这样就算后端暂时无法启动或某些接口未完成，也依然能进行页面的交互和调试。

### 4.2 后端（Spring Boot）

1. **Controller 层**  
   该层基于 Restful API 风格进行设计，通常在 `AuthController`、`ProjectController`、`TaskController` 等类中通过 `@RestController`、`@RequestMapping` 等注解暴露接口。为了便于统一管理版本和路由，可在类或方法上设置诸如 `@RequestMapping("/api/v1/tasks")` 等前缀。  
   - **请求处理**：使用 `@Valid` 注解对请求参数进行验证，并捕捉可能出现的异常（如 `MethodArgumentNotValidException`）交由全局异常处理器统一转换为规范的错误响应格式。  
   - **依赖注入**：通过构造器或 `@RequiredArgsConstructor` 将对应的 Service 注入 Controller；这样在请求到达后，可将业务逻辑的处理委托给 Service 层。  
   - **响应处理**：常使用 `ResponseEntity` 来返回结果，确保携带合适的 HTTP 状态码及可读的消息体。若有批量操作或复杂查询，可在响应中添加额外的统计或元信息（meta）。

2. **Service 层**  
   该层负责核心业务逻辑的封装，例如 `AuthService`、`ProjectService`、`TaskService` 等。它包含权限校验、事务管理以及业务规则验证等。  
   - **业务规则**：如创建项目前需要检查当前用户是否有权限、或者删除任务时是否存在未完成的子任务等，都集中在此执行，从而保持 Controller 层的简洁。  
   - **事务管理**：使用 `@Transactional` 注解覆盖需要保证原子性的业务方法；对于只读操作可使用 `readOnly = true` 优化数据库操作。  
   - **错误处理**：若在业务流程中遇到例如资源不存在或权限不足等情况，可抛出自定义异常（如 `ResourceNotFoundException`）或 Spring 自带异常，并让全局异常处理器转化为统一的 API 错误响应。  
   - **密码及安全**：在用户相关服务中（`AuthService` 等），通常通过 `BCryptPasswordEncoder` 等进行密码加密校验；Token 刷新逻辑会调用 `JwtService` 生成新令牌。

3. **Repository 层**  
   该层通过 JPA/Hibernate 与 OpenGauss 数据库交互，提供数据的增删改查方法。一些常用接口如 `UserRepository`、`ProjectRepository`、`TaskRepository` 等直接继承 `JpaRepository` 或 `CrudRepository`，可获得基础的 CRUD 功能。  
   - **查询方法**：在一些复杂查询中可使用方法名命名规则（如 `findByEmail`）或自定义 JPQL/SQL（如 `@Query` 注解）实现更灵活的筛选与分页。  
   - **实体关系**：项目通常会涉及到 `@OneToMany`、`@ManyToMany` 等映射关系，需要在对应实体类上合理设置级联属性和懒加载策略，避免出现 N+1 查询或数据同步困难。  
   - **数据一致性**：配合 Service 层的事务管理，以保证在执行批量操作或多表关联操作时，数据能保持一致。

4. **Model 层（Entity / DTO）**  
   该层主要分为两部分：  
   - **实体（Entity）**：如 `User`, `Project`, `Task` 等，使用 `@Entity` 注解与数据库表对应，一般继承自公共基类（如 `BaseEntity`）以实现主键生成、审计字段（`createdAt`, `updatedAt`）等。  
   - **DTO（Data Transfer Object）**：如 `UserDto`, `TaskDto` 等，用于请求或响应中的数据结构转换。例如，登录接口的 `LoginRequest`、`LoginResponse`，或者批量操作的 `BatchDeleteResponse`。通过 `@JsonProperty` 自定义序列化字段名，配合 `@Valid` 注解完成数据校验。  
   这层的设计可以将持久化的细节与外部数据交互隔离开来，提高可维护性和数据安全性。

5. **Security & JWT**
   项目采用 Spring Security + JWT 进行安全管控。在 `config` 或 `security` 目录下配置相应的类，如 `SecurityConfig`、`JwtAuthenticationFilter` 等：
   - **过滤器链**：`JwtAuthenticationFilter` 会在请求到达 Controller 前解析 Header 中的 Token 并验证其有效性，若验证通过则构建 `Authentication` 放入 Security Context。
   - **Token 刷新**：`JwtService` 会提供生成、解析 Token 的方法，并可通过专门的刷新端点配合双 Token 模式来延长会话。
   - **角色权限**：在 User 实体或 `UserDetails` 中维护角色信息（如 `ROLE_ADMIN`, `ROLE_USER`），借助 Spring Security 的 `@PreAuthorize` 或全局配置来限制某些接口的访问权限。

6. **OpenGauss / 数据库**
   通过 OpenGauss JDBC (6.0.0-og) 与数据库交互。具体配置可在 `config.conf` 中声明，例如：
   ```hocon
   database {
       driver = "org.opengauss.Driver"
       url = "jdbc:opengauss://localhost:5432/todo"
       username = "todo"
       password = "todo@123"
   }

   jpa {
       database-platform = "org.hibernate.dialect.PostgreSQLDialect"
       ddl-auto = "update"
       show-sql = true
       format-sql = true
   }
   ```
   - **初始化**：可通过 `init-db.sql` 或 Spring Boot 启动时自动建表完成初始数据库环境的搭建，包括用户、项目、任务等表结构，以及相关索引与触发器。
   - **数据库特性**：OpenGauss 在语法上与 PostgreSQL 类似，可使用序列、触发器、以及 JSONB 字段等功能；若有特殊语法差异或 SQL 方言需求，需要在 JPA 或配置层进行适配。
   - **性能与维护**：在生产环境中，可结合 OpenGauss 自带的监控与优化工具（如 GUC 参数设置，Explain 分析等）提高查询性能；日常运维需注意定期备份与表 Vacuum，避免膨胀导致性能退化。

---

## 5. 桌面启动器（Tauri + Rust）

**5.1 进程管理**  
在桌面启动器中，核心功能是通过 Rust 代码调用 `java -jar` 命令来运行后端的 Spring Boot Jar，并实时监控进程状态与日志输出。为保证较好的用户体验，需要在启动与关闭流程上进行更多细节处理：  
- **启动流程**：在执行 `java -jar frankentodo.jar` 前，会先检查 JAR 包是否存在；若缺失，启动器可给出友好的提示或引导用户下载。随后通过 Tauri 插件（如 `tauri-plugin-shell`）启动进程，并在后台收集标准输出（stdout）与错误输出（stderr）。  
- **实时监控**：启动器将不断监听后端日志、判断进程是否正常运行，并在界面上以 LogViewer 或其他方式呈现。如果进程意外终止，启动器会及时显示错误信息，或允许用户再次尝试启动。  
- **优雅关闭**：关闭时，为了避免强制终止带来的数据损坏或资源占用，可先向后端发出停止指令（通过 HTTP 触发 `/shutdown`），在一定超时后才进行强制终结。进程状态也会同步更新到前端界面，避免用户误以为后端仍在运行。

**5.2 日志与监控**  
在启动器界面中，我们会通过 Rust 侧监听到的标准输出/错误输出来获取后端日志，并将其流式地传递给前端 WebView：  
- **界面显示**：一方面方便开发者调试后端运行情况，另一方面也利于用户了解任务执行、数据库连接等状态。出现错误堆栈时，启动器能提示用户先停止进程并查看详情。  
- **过滤与搜索**：若日志量较大，启动器可提供简单的过滤功能（如按关键字或日志级别筛选）和搜索功能。  
- **监控机制**：当监听到特定错误信息（如数据库连接失败）时，可自动显示相应提示或弹窗，引导用户检查配置或重试。

**5.3 Tauri 配置文件**  
- **`tauri.conf.json`**：  
  - **应用信息**：应用名称、窗口默认大小、标题等。  
  - **打包配置**：图标路径、多平台构建目标、自动更新设置。  
  - **安全策略**：CSP、白名单链接等。  
- **`Cargo.toml`**：  
  - **依赖管理**：`serde` (序列化/反序列化)、`reqwest` (HTTP 请求)、`tauri-plugin-shell` (调用外部进程) 等。  
  - **编译选项**：Rust 版次、特性开关、构建脚本。

**5.4 访问前端页面**  
启动器在后端进程就绪且监听端口（默认为 8080）后，利用内置的 WebView 加载 `http://127.0.0.1:8080`，从而在单一窗口内实现与 Web 端相同的界面和业务逻辑：  
- **加载策略**：若端口尚未就绪，启动器可显示加载动画或提示信息；检测到后端启动成功后，自动切换到应用主页面。

---

## 6. 部署与运行

### 6.1 环境要求

1. **Node.js**  
   - 版本：18+（推荐 Node.js 18 或更高）  
   - 用于构建前端（Next.js）与调用 Tauri 构建脚本  

2. **JDK/Java**  
   - 版本：23（或兼容版本）  
   - 用于运行与打包后端（Spring Boot）  

3. **Maven**  
   - 版本：3.9+  
   - 负责后端项目的依赖管理与构建  

4. **Rust 工具链**  
   - 版本：1.75+ (Rust Edition 2021)  
   - 用于构建 Tauri 启动器（跨平台桌面应用）  

5. **PowerShell（可选）**  
   - 版本：5.0+ (Windows 内置) 或 7+ (跨平台)  
   - 若使用 `build.ps1` 脚本一键构建，需要在命令行支持 PowerShell  

6. **OpenGauss 数据库**  
   - 版本：6.0+  
   - 可使用 Docker 容器进行部署，或在宿主机直接安装

> **说明**：在开发模式下，前端与后端可分端口进行调试；而在生产模式中，前端会被打包进后端 Jar 通过 Tauri 的内置 WebView 访问。

---

### 6.2 数据库部署

1. **使用 Docker 部署 OpenGauss**  
   - 拉取镜像  
     ```bash
     docker pull enmotech/opengauss:latest
     ```
   - 启动容器（示例）  
     ```bash
     docker run -d \
       --name frankentodo-db \
       -p 5432:5432 \
       -e GS_PASSWORD=123456 \
       enmotech/opengauss:latest
     ```
   - 验证容器是否正常运行  
     ```bash
     docker ps
     docker logs frankentodo-db
     ```
   - 在容器或对应 SQL 客户端中执行初始化脚本
     ```sql
     \i init-db.sql
     ```

2. **数据库配置**  
   - 在 `config.conf` 中设置数据库连接信息：
     ```hocon
     database {
         driver = "org.opengauss.Driver"
         url = "jdbc:opengauss://localhost:5432/todo"
         username = "todo"
         password = "todo@123"
     }
     ```
   - 后端通过 `DatabaseConfig` 类加载此配置文件，会自动在当前目录或 backend 子目录中查找 `config.conf`。

---

### 6.3 构建流程

为了简化多模块（前端、后端、桌面启动器）的打包过程，项目提供了一个一键构建脚本 `build.ps1`（基于 PowerShell），便于在 Windows 或其他支持 PowerShell 的环境中使用。也可手动逐步构建，每个模块都可以独立执行相应的命令。以下是两种常见方式：  

#### 6.3.1 使用 PowerShell 脚本 (`build.ps1`)

位于 `launcher/` 目录下的 `build.ps1` 文件示例：  
```powershell
# Windows:
.\build.ps1

# 如果只想构建启动器，跳过前端和后端:
.\build.ps1 skip
```

该脚本执行的主要操作包括：

1. **清理输出目录**：删除原有的 `dist` 文件夹，准备新的构建产物。  
2. **前端构建**  
   - 进入 `frontend/` 目录  
   - `npm install` 安装依赖  
   - `npm run build` 生成静态产物  
3. **后端构建**  
   - 进入 `backend/` 目录  
   - `mvn clean package -DskipTests` 打包生成可执行的 Jar  
4. **启动器构建**  
   - 进入 `launcher/` 目录  
   - `cargo tauri build` 编译 Rust 并打包成 `.exe`（或对应平台可执行文件）  
5. **发布包整合**  
   - 在 `dist/FrankenTodo` 下统一保存前后端与启动器产物  
   - 将后端 Jar、配置文件、启动器可执行文件等复制到同一路径  

完成后，会在 `dist/FrankenTodo` 目录下生成一个包含可执行文件 `FrankenTodo.exe`（Windows 平台示例）的最终发布包，运行后即可启动后端并加载前端页面。

#### 6.3.2 手动构建

若不使用脚本，可在各子项目分别执行构建命令：  

1. **前端**  
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   - 产物位于 `.next` 或根据 Next.js 配置位于 `out/` 目录并自动复制到后端目录。  
   - 生产模式下可将静态文件打包到后端 Spring Boot 资源中。

2. **后端**  
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
   - 生成的可执行 Jar 存放于 `target/` 目录。  
   - 若需整合前端静态文件，需要将前端产物复制到对应目录再行打包。

3. **桌面启动器**  
   ```bash
   cd launcher
   cargo tauri build
   ```
   - 产物根据操作系统和 Tauri 配置，通常在 `src-tauri/target/release/` 下生成 `.exe` (Windows)、`.app` (macOS) 或可执行文件 (Linux)。  
   - 也可以用 `cargo tauri dev` 进行本地调试，命令行中出现 Tauri 的窗口界面。

---

### 6.4 运行与发布

#### 6.4.1 开发模式

1. **数据库**：通过 Docker 或本地安装的方式启动 OpenGauss；确保配置文件指向正确的数据库连接。  
2. **后端**：  
   ```bash
   cd backend
   mvn spring-boot:run
   # 默认端口 8080
   ```
3. **前端**：  
   ```bash
   cd frontend
   npm run dev
   # 默认端口 3000
   ```
   此时可在浏览器分别访问 `http://localhost:8080`（后端 API）与 `http://localhost:3000`（前端界面）。  
4. **桌面启动器**：  
   ```bash
   cd launcher
   cargo tauri dev
   ```
   将在一个内置的 WebView 中访问 `http://localhost:8080` 或开发环境下的 URL。

#### 6.4.2 生产模式

1. **后端 Jar**  
   - 只需在目标服务器上执行  
     ```bash
     java -jar frankentodo.jar
     ```  
     如果之前已将前端静态文件打包进 Jar，则访问 `http://<server-ip>:8080` 即可使用整个系统（后端 API + 前端界面）。  
   - 若数据库为容器，则保证容器在后台运行并做好网络/防火墙配置。

2. **桌面启动器发布包**  
   - 在使用 `build.ps1` 或手动方式得到 `FrankenTodo.exe`（Windows）或相应平台可执行文件后，可将其和后端 Jar 放在同一个目录下（脚本已自动完成）。  
   - 启动时，Tauri 会自动调用 `java -jar frankentodo.jar` 并在 8080 端口启动后端，然后在一个 WebView 窗口中打开该端口地址。  
   - 如果需要分发给终端用户，只需将该目录整体打包并分发；用户双击 `FrankenTodo.exe` 即可完成“安装即用”。

---

## 7. 主要功能与 API

1. **用户认证**  
   - `/auth/login`、`/auth/register`、`/auth/refresh`、`/auth/logout`  
   - 统一使用 `Authorization: Bearer <token>` 进行访问  
   - Token 过期自动刷新

2. **项目管理**  
   - `/projects` (GET/POST)  
   - `/projects/{id}` (GET/PUT/DELETE)  
   - 项目标签、成员管理等

3. **任务管理**  
   - `/tasks` (GET/POST)  
   - `/tasks/{id}` (GET/PUT/DELETE)  
   - 批量操作或单独操作

4. **用户设置（实现中）**  
   - `/users/me` (GET) 获取个人信息  
   - `/users/me/settings` (PUT) 修改通知、主题等偏好

> 更详尽的参数、响应字段、错误码说明可见 `API.md` 文档（示例：统一错误返回格式、状态码定义等）。

---

## 8. 总结

**FrankenTodo** 采用了典型的**前后端分离**和**桌面启动器**三合一方式，让用户能够在多平台环境中顺畅地使用任务管理和团队协作功能。前端（Next.js + React + TypeScript）专注于界面交互与用户体验，通过表单验证、Skeleton 过渡、Toast 提示等机制提供了直观又高效的操作界面；后端（Spring Boot + Java）承担核心业务逻辑、数据持久化与安全认证，利用 JWT 和 Spring Security 进行权限控制，并通过 OpenGauss 数据库实现可扩展且可靠的数据存储；桌面启动器（Tauri + Rust）则整合了后端进程管理与 WebView 界面，打造出既跨平台又易于安装使用的“一站式”桌面应用。

在开发与维护层面，项目结构基于多层架构实现清晰的职责分离，方便团队协作和功能扩展；使用脚本（`build.ps1`）或独立命令均可轻松进行多模块打包与部署；在生产环境中，通过将前端静态文件整合进后端 Jar 并利用 Tauri 打包成可执行文件，可实现**一键式**安装与启动，减少运维复杂度。此外，使用 Docker 部署 OpenGauss 进一步降低了数据库环境的配置难度，并为大规模数据处理和备份恢复提供了可靠的基础。

在未来迭代中，FrankenTodo 仍可继续扩充更多特性——例如团队即时通讯、复杂的标签管理、智能提醒以及数据统计分析等。基于目前的技术栈与分层设计，任何新功能的加入都能在前后端或启动器层面得到较好衔接。希望本说明书能帮助开发者和用户更好地理解并使用 FrankenTodo 项目，为各类团队协作需求提供一个灵活且专业的解决方案。
