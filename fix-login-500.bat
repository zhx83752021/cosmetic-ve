@echo off
chcp 65001 >nul
echo ======================================
echo   登录 500 错误快速修复工具
echo ======================================
echo.

:: 检查是否在正确的目录
if not exist "apps\server" (
    echo ❌ 错误: 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 请选择操作：
echo.
echo [1] 运行完整诊断
echo [2] 执行数据库迁移（修复"表不存在"）
echo [3] 创建管理员账号
echo [4] 生成 JWT_SECRET
echo [5] 测试数据库连接
echo [6] 查看 Vercel 部署日志提示
echo [0] 退出
echo.

set /p choice="请输入选项 (0-6): "

if "%choice%"=="1" goto diagnose
if "%choice%"=="2" goto migrate
if "%choice%"=="3" goto create_admin
if "%choice%"=="4" goto generate_jwt
if "%choice%"=="5" goto test_db
if "%choice%"=="6" goto logs_help
if "%choice%"=="0" exit /b 0

echo 无效选项
pause
exit /b 1

:diagnose
echo.
echo ======================================
echo   运行完整诊断
echo ======================================
echo.
echo 请输入您的后端域名（不含 https:// 和路径）
echo 例如: cosmetic-ve-server.vercel.app
set /p backend_domain="后端域名: "

echo.
echo 正在访问诊断接口...
echo URL: https://%backend_domain%/api/diagnostic
echo.

curl -s https://%backend_domain%/api/diagnostic

echo.
echo.
echo ======================================
echo   诊断完成
echo ======================================
echo.
echo 根据诊断结果：
echo - 如果显示 "数据库连接失败" → 选择选项 [2] 执行迁移
echo - 如果显示 "表不存在" → 选择选项 [2] 执行迁移
echo - 如果显示 "无管理员账号" → 选择选项 [3] 创建管理员
echo - 如果显示 "JWT_SECRET 未配置" → 选择选项 [4] 生成密钥
echo.
pause
goto :eof

:migrate
echo.
echo ======================================
echo   执行数据库迁移
echo ======================================
echo.
echo ⚠️  请确保已设置 DATABASE_URL 环境变量
echo.
echo 从 Vercel Dashboard 获取数据库连接字符串：
echo 1. 登录 Vercel Dashboard
echo 2. Storage → 选择数据库 → .env.local
echo 3. 复制 POSTGRES_URL 的值
echo.
echo 示例格式:
echo postgres://user:password@host/database?sslmode=require
echo.

set /p db_url="请粘贴 DATABASE_URL: "

if "%db_url%"=="" (
    echo ❌ DATABASE_URL 不能为空
    pause
    goto :eof
)

echo.
echo 设置环境变量...
set DATABASE_URL=%db_url%

echo.
echo 切换到后端目录...
cd apps\server

echo.
echo 执行 Prisma 迁移...
echo.
call pnpm prisma migrate deploy

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 数据库迁移成功！
    echo.
    echo 表已创建，现在可以尝试登录了。
) else (
    echo.
    echo ❌ 迁移失败，请检查：
    echo 1. DATABASE_URL 是否正确
    echo 2. 数据库是否可访问
    echo 3. 网络连接是否正常
)

cd ..\..
echo.
pause
goto :eof

:create_admin
echo.
echo ======================================
echo   创建管理员账号
echo ======================================
echo.

set /p db_url="请输入 DATABASE_URL: "

if "%db_url%"=="" (
    echo ❌ DATABASE_URL 不能为空
    pause
    goto :eof
)

echo.
echo 设置环境变量...
set DATABASE_URL=%db_url%

echo.
echo 切换到后端目录...
cd apps\server

echo.
echo 运行创建管理员脚本...
echo.
call node scripts/create-admin.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 管理员账号创建成功！
) else (
    echo.
    echo ❌ 创建失败，请检查数据库连接
)

cd ..\..
echo.
pause
goto :eof

:generate_jwt
echo.
echo ======================================
echo   生成 JWT_SECRET
echo ======================================
echo.
echo 正在生成安全的 32 位密钥...
echo.

powershell -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))" > temp_jwt.txt
set /p jwt_secret=<temp_jwt.txt
del temp_jwt.txt

echo ✅ JWT_SECRET 已生成：
echo.
echo %jwt_secret%
echo.
echo 复制上面的密钥，然后：
echo 1. 登录 Vercel Dashboard
echo 2. 进入后端项目 → Settings → Environment Variables
echo 3. 添加: JWT_SECRET=%jwt_secret%
echo 4. Save → Deployments → Redeploy
echo.
pause
goto :eof

:test_db
echo.
echo ======================================
echo   测试数据库连接
echo ======================================
echo.

set /p db_url="请输入 DATABASE_URL: "

if "%db_url%"=="" (
    echo ❌ DATABASE_URL 不能为空
    pause
    goto :eof
)

echo.
echo 设置环境变量...
set DATABASE_URL=%db_url%

echo.
echo 切换到后端目录...
cd apps\server

echo.
echo 测试数据库连接...
echo.
call pnpm prisma db pull

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 数据库连接成功！
) else (
    echo.
    echo ❌ 数据库连接失败，请检查：
    echo 1. DATABASE_URL 格式是否正确
    echo 2. 数据库服务是否运行
    echo 3. 网络连接是否正常
    echo 4. 数据库防火墙配置
)

cd ..\..
echo.
pause
goto :eof

:logs_help
echo.
echo ======================================
echo   查看 Vercel 日志
echo ======================================
echo.
echo 📋 查看后端运行日志的方法：
echo.
echo 方法 1: Vercel Dashboard（推荐）
echo ─────────────────────────────────
echo 1. 访问 https://vercel.com/dashboard
echo 2. 选择后端项目（cosmetic-ve-server）
echo 3. 点击 Deployments
echo 4. 选择最新的部署
echo 5. 点击 Function Logs
echo 6. 在前端尝试登录，观察实时日志
echo.
echo 方法 2: Vercel CLI
echo ─────────────────────────────────
echo 1. 安装: npm i -g vercel
echo 2. 登录: vercel login
echo 3. 查看日志: vercel logs https://your-backend.vercel.app --follow
echo.
echo 方法 3: 浏览器开发者工具
echo ─────────────────────────────────
echo 1. 打开前端网站
echo 2. 按 F12 打开开发者工具
echo 3. 切换到 Network 面板
echo 4. 尝试登录
echo 5. 查看登录请求的 Response
echo.
echo 常见错误信息对照：
echo ─────────────────────────────────
echo - "Can't reach database server" → DATABASE_URL 未配置或错误
echo - "Table 'User' does not exist" → 需要执行数据库迁移
echo - "Prisma Client not initialized" → 构建配置有误
echo - "Not allowed by CORS" → CORS_ORIGINS 未配置前端域名
echo.
pause
goto :eof
