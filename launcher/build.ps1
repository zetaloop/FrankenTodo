# 设置错误时停止执行
$ErrorActionPreference = "Stop"

# 检查命令行参数
$skipBuild = $args -contains "skip"

# 定义路径
$rootDir = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $rootDir "frontend"
$backendDir = Join-Path $rootDir "backend"
$launcherDir = Join-Path $rootDir "launcher"
$outputDir = Join-Path $rootDir "dist"

Write-Host "开始打包流程..."

# 创建输出目录
if (Test-Path $outputDir) {
    Remove-Item -Recurse -Force $outputDir
}
New-Item -ItemType Directory -Path $outputDir | Out-Null

if (-not $skipBuild) {
    Write-Host "执行完整构建..."
    # 构建前端
    Write-Host "构建前端..."
    Push-Location $frontendDir
    npm install
    npm run build
    Pop-Location

    # 构建后端
    Write-Host "构建后端..."
    Push-Location $backendDir
    ./mvnw clean package -DskipTests
    Pop-Location
} else {
    Write-Host "跳过前端和后端构建..."
}

# 构建launcher
Write-Host "构建launcher..."
Push-Location $launcherDir
cargo tauri build
Pop-Location

# 创建发布包
Write-Host "创建发布包..."
$releaseDir = Join-Path $outputDir "FrankenTodo"
New-Item -ItemType Directory -Path $releaseDir | Out-Null

# 复制文件
Copy-Item (Join-Path $launcherDir "src-tauri/target/release/launcher.exe") (Join-Path $releaseDir "FrankenTodo.exe")
New-Item -ItemType Directory -Path (Join-Path $releaseDir "backend") | Out-Null
Copy-Item (Join-Path $backendDir "target/todo-0.0.1-SNAPSHOT.jar") (Join-Path $releaseDir "backend")

# 复制配置文件
Write-Host "复制配置文件..."
Copy-Item (Join-Path $backendDir "config.conf") (Join-Path $releaseDir "backend")

Write-Host "打包完成！发布包位于: $releaseDir" 