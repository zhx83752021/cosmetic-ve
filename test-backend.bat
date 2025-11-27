@echo off
chcp 65001 >nul
echo ======================================
echo   测试后端接口
echo ======================================
echo.

set /p backend="请输入后端域名（不含 https://）: "

if "%backend%"=="" (
    echo ❌ 域名不能为空
    pause
    exit /b 1
)

echo.
echo [1/4] 测试健康检查接口...
curl -s https://%backend%/health
echo.
echo.

echo [2/4] 测试 API 测试接口...
curl -s https://%backend%/api/test
echo.
echo.

echo [3/4] 测试诊断接口...
curl -s https://%backend%/api/diagnostic
echo.
echo.

echo [4/4] 测试登录接口...
curl -s -X POST https://%backend%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"test\",\"password\":\"test\"}"
echo.
echo.

echo ======================================
echo   测试完成
echo ======================================
echo.
pause
