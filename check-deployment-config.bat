@echo off
chcp 65001 >nul
echo ======================================
echo   Vercel 部署配置检查
echo ======================================
echo.

:: 检查根目录 vercel.json
echo [1/6] 检查根目录 vercel.json...
if exist "vercel.json" (
    echo ✅ 根目录 vercel.json 存在（用于前端部署）
    findstr /C:"apps/web/dist" vercel.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 输出目录配置正确: apps/web/dist
    ) else (
        echo ❌ 输出目录配置可能有误
    )
) else (
    echo ❌ 根目录缺少 vercel.json
)
echo.

:: 检查后端 vercel.json
echo [2/6] 检查后端 vercel.json...
if exist "apps\server\vercel.json" (
    echo ✅ apps/server/vercel.json 存在（用于后端部署）
    findstr /C:"@vercel/node" apps\server\vercel.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 使用 @vercel/node builder
    ) else (
        echo ❌ builder 配置可能有误
    )
) else (
    echo ❌ apps/server 缺少 vercel.json
)
echo.

:: 检查后端 package.json
echo [3/6] 检查后端构建脚本...
if exist "apps\server\package.json" (
    findstr /C:"vercel-build" apps\server\package.json >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ vercel-build 脚本存在
        findstr /C:"prisma migrate deploy" apps\server\package.json >nul
        if %ERRORLEVEL% EQU 0 (
            echo ⚠️  警告: vercel-build 包含 prisma migrate deploy
            echo     建议移除此命令，在部署前手动执行迁移
        ) else (
            echo ✅ vercel-build 不包含数据库迁移（正确）
        )
    ) else (
        echo ❌ 缺少 vercel-build 脚本
    )
) else (
    echo ❌ apps/server/package.json 不存在
)
echo.

:: 检查环境变量示例文件
echo [4/6] 检查环境变量配置...
if exist "apps\web\.env.example" (
    echo ✅ 前端环境变量示例存在
    findstr /C:"VITE_API_BASE_URL" apps\web\.env.example >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ VITE_API_BASE_URL 已定义
    )
) else (
    echo ⚠️  apps/web/.env.example 不存在
)

if exist "apps\server\.env.example" (
    echo ✅ 后端环境变量示例存在
    findstr /C:"CORS_ORIGINS" apps\server\.env.example >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ CORS_ORIGINS 已定义（注意是复数）
    ) else (
        echo ❌ 缺少 CORS_ORIGINS 配置
    )
) else (
    echo ⚠️  apps/server/.env.example 不存在
)
echo.

:: 检查 CORS 配置
echo [5/6] 检查后端 CORS 代码配置...
if exist "apps\server\src\index.ts" (
    findstr /C:"CORS_ORIGINS" apps\server\src\index.ts >nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 代码中使用 CORS_ORIGINS 环境变量
    ) else (
        echo ❌ 代码中可能未正确使用 CORS_ORIGINS
    )
) else (
    echo ❌ apps/server/src/index.ts 不存在
)
echo.

:: 检查 pnpm workspace
echo [6/6] 检查 pnpm workspace 配置...
if exist "pnpm-workspace.yaml" (
    echo ✅ pnpm-workspace.yaml 存在
    echo ⚠️  提醒: 后端 Vercel 项目的 Install Command 必须设置为:
    echo     cd ../.. ^&^& pnpm install ^&^& cd apps/server ^&^& pnpm run prisma:generate
) else (
    echo ❌ pnpm-workspace.yaml 不存在
)
echo.

echo ======================================
echo   检查完成
echo ======================================
echo.
echo 📋 关键配置提醒：
echo.
echo 前端项目 (cosmetic-ve):
echo   - Root Directory: ./
echo   - Build Command: cd apps/web ^&^& pnpm run build
echo   - Output Directory: apps/web/dist
echo   - Install Command: pnpm install
echo.
echo 后端项目 (cosmetic-ve-server):
echo   - Root Directory: apps/server
echo   - Build Command: pnpm run vercel-build
echo   - Output Directory: dist
echo   - Install Command: cd ../.. ^&^& pnpm install ^&^& cd apps/server ^&^& pnpm run prisma:generate
echo.
echo 📚 详细文档请查看: VERCEL_DEPLOYMENT_CONFIG.md
echo.
pause
