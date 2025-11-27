@echo off
chcp 65001 >nul
echo ================================
echo    Vercel 部署脚本
echo ================================
echo.

echo [1/3] 检查 Vercel CLI...
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Vercel CLI 未安装，正在安装...
    call npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Vercel CLI 安装失败
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI 安装成功
) else (
    echo ✅ Vercel CLI 已安装
)
echo.

echo [2/3] 登录 Vercel...
call vercel whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 需要登录 Vercel 账号
    call vercel login
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 登录失败
        pause
        exit /b 1
    )
)
echo ✅ 已登录 Vercel
echo.

echo [3/3] 开始部署...
echo 请选择部署环境：
echo 1. 预览环境 (Preview)
echo 2. 生产环境 (Production)
echo.
set /p choice="请输入选择 (1 或 2): "

if "%choice%"=="2" (
    echo 正在部署到生产环境...
    call vercel --prod
) else (
    echo 正在部署到预览环境...
    call vercel
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================
    echo ✅ 部署成功！
    echo ================================
) else (
    echo.
    echo ================================
    echo ❌ 部署失败
    echo ================================
)

echo.
pause
