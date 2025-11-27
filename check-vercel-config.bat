@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 Vercel 部署配置检查
echo ========================================
echo.

echo [1/5] 检查项目结构...
if exist "apps\web\package.json" (
    echo ✅ 前端应用目录存在
) else (
    echo ❌ 未找到前端应用目录
    goto :error
)

if exist "apps\server\package.json" (
    echo ✅ 后端应用目录存在
) else (
    echo ❌ 未找到后端应用目录
    goto :error
)

echo.
echo [2/5] 检查配置文件...
if exist "vercel.json" (
    echo ✅ 前端 vercel.json 存在
    type vercel.json | findstr /C:"apps/web" >nul
    if errorlevel 1 (
        echo ⚠️  前端配置可能不正确
    )
) else (
    echo ❌ 未找到前端 vercel.json
    goto :error
)

if exist "apps\server\vercel.json" (
    echo ✅ 后端 vercel.json 存在
) else (
    echo ❌ 未找到后端 vercel.json
    goto :error
)

echo.
echo [3/5] 检查前端配置...
if exist "apps\web\vite.config.ts" (
    echo ✅ Vite 配置文件存在
) else (
    echo ⚠️  未找到 Vite 配置文件
)

echo.
echo [4/5] 检查后端配置...
if exist "apps\server\prisma\schema.prisma" (
    echo ✅ Prisma Schema 存在
) else (
    echo ⚠️  未找到 Prisma Schema
)

if exist "apps\server\.env.example" (
    echo ✅ 环境变量示例文件存在
) else (
    echo ⚠️  未找到环境变量示例文件
)

echo.
echo [5/5] 检查依赖配置...
if exist "pnpm-workspace.yaml" (
    echo ✅ pnpm workspace 配置存在
) else (
    echo ⚠️  未找到 pnpm workspace 配置
)

if exist "turbo.json" (
    echo ✅ Turbo 配置存在
) else (
    echo ⚠️  未找到 Turbo 配置
)

echo.
echo ========================================
echo ✅ 配置检查完成！
echo ========================================
echo.
echo 📝 下一步操作：
echo.
echo 1. 阅读部署指南：VERCEL_DUAL_DEPLOYMENT.md
echo 2. 准备数据库连接字符串
echo 3. 在 Vercel 创建两个项目：
echo    - 项目 1: 前端（Root: ./）
echo    - 项目 2: 后端（Root: apps/server）
echo 4. 配置环境变量
echo 5. 部署并测试
echo.
echo 按任意键退出...
pause >nul
exit /b 0

:error
echo.
echo ========================================
echo ❌ 配置检查失败
echo ========================================
echo.
echo 请检查项目结构是否完整，或参考文档：
echo VERCEL_DUAL_DEPLOYMENT.md
echo.
echo 按任意键退出...
pause >nul
exit /b 1
