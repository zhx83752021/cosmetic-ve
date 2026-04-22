# 将迁移与种子数据应用到「当前 DATABASE_URL 所指向的数据库」。
# 用于：Vercel Production 的 Postgres（从 Dashboard 复制 POSTGRES_URL / DATABASE_URL）。
#
# 用法（PowerShell，勿把连接串提交到 Git）：
#   cd apps\server
#   $env:DATABASE_URL = "postgres://...."
#   .\scripts\sync-remote-database.ps1
#
# 或先 vercel link 后：vercel env pull .env.production ，再：
#   Get-Content .env.production | ForEach-Object { if ($_ -match '^DATABASE_URL=(.+)') { $env:DATABASE_URL = $matches[1].Trim('"') } }
#   .\scripts\sync-remote-database.ps1

$ErrorActionPreference = "Stop"

if (-not $env:DATABASE_URL) {
    Write-Host "请先设置环境变量 DATABASE_URL（使用 Vercel Production 的直连 postgres:// 连接串）。" -ForegroundColor Yellow
    exit 1
}

if ($env:DATABASE_URL -match "prisma\+postgres://") {
    Write-Host "migrate/seed 请使用直连的 postgres:// 连接串，不要用 prisma+postgres Accelerate URL。" -ForegroundColor Yellow
    exit 1
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerRoot = Split-Path -Parent $ScriptDir
Set-Location $ServerRoot

Write-Host "Working directory: $ServerRoot"
Write-Host "Running: prisma migrate deploy && prisma db seed ..."

pnpm exec prisma migrate deploy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

pnpm exec prisma db seed
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "完成。请刷新 https://cosmetics.supperai.top/ 验证分类与商品接口。" -ForegroundColor Green
