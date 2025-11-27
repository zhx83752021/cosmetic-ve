# 登录 500 错误排查指南 🔍

## 问题描述

前后端已成功部署到 Vercel，数据库也已创建，但登录时返回 500 错误。

---

## 🎯 快速诊断

### 第一步：运行诊断接口

访问后端诊断接口，获取详细的系统状态：

```
https://your-backend.vercel.app/api/diagnostic
```

将 `your-backend.vercel.app` 替换为您的实际后端域名。

**诊断接口会检查**：
- ✅ 环境变量配置
- ✅ JWT 配置
- ✅ Prisma Client 状态
- ✅ 数据库连接
- ✅ 数据库表
- ✅ 管理员账号

---

## 🔴 常见原因及解决方案

### 1. 数据库连接失败 ⚠️ **最常见**

#### 症状
- 诊断接口显示：`❌ 数据库连接失败`
- Function Logs 显示类似错误：
  ```
  PrismaClientInitializationError: Can't reach database server
  ```

#### 原因
- `DATABASE_URL` 环境变量未配置
- `DATABASE_URL` 格式错误
- 数据库未正确创建

#### 解决方案

**步骤 1：检查环境变量**

1. 登录 Vercel Dashboard
2. 进入后端项目（cosmetic-ve-server）
3. Settings → Environment Variables
4. 确认 `DATABASE_URL` 存在

**步骤 2：验证数据库连接字符串**

Vercel Postgres 的连接字符串格式：
```
postgres://user:password@host/database?sslmode=require
```

完整示例：
```
postgres://default:AbC123xYz@ep-cool-mouse-12345.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require
```

**步骤 3：重新部署**

修改环境变量后，必须重新部署：
1. Deployments → 选择最新部署
2. 点击右上角 ⋯ → Redeploy

---

### 2. 数据库表未创建 ⚠️ **非常常见**

#### 症状
- 诊断接口显示：`❌ 表不存在` 或 `表数量: 0`
- Function Logs 显示：
  ```
  PrismaClientKnownRequestError: Table 'User' does not exist
  ```

#### 原因
数据库已连接，但没有执行 Prisma 迁移创建表结构。

#### 解决方案

**在本地连接生产数据库执行迁移**：

```bash
# 1. 进入后端目录
cd apps/server

# 2. 设置生产数据库 URL（替换为您的实际连接字符串）
$env:DATABASE_URL="postgres://user:password@host/database?sslmode=require"

# 3. 执行迁移
pnpm prisma migrate deploy

# 4. 验证表已创建
pnpm prisma studio
```

**预期输出**：
```
✓ Prisma Migrate applied 3 migrations:
  └─ 20240101000000_init
  └─ 20240101000001_add_admin
  └─ 20240101000002_add_products
```

---

### 3. JWT_SECRET 未配置 ⚠️ **安全问题**

#### 症状
- 诊断接口显示：`⚠️  JWT_SECRET 未配置`
- 登录可能成功，但 token 不安全

#### 原因
JWT_SECRET 环境变量未设置，使用默认值。

#### 解决方案

**生成安全的 JWT_SECRET**：

```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

输出示例：
```
QkZ3NzU4OGY3ZWI4MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWI=
```

**配置到 Vercel**：

1. Vercel Dashboard → 后端项目 → Settings → Environment Variables
2. 添加或更新：
   ```
   JWT_SECRET=QkZ3NzU4OGY3ZWI4MTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWI=
   ```
3. 点击 Save
4. Redeploy 项目

---

### 4. CORS 配置错误 ⚠️ **可能导致登录失败**

#### 症状
- 浏览器控制台显示 CORS 错误
- 请求在预检（OPTIONS）阶段失败
- Function Logs 显示：`❌ CORS blocked`

#### 原因
后端 `CORS_ORIGINS` 未包含前端域名。

#### 解决方案

**步骤 1：获取前端域名**

假设您的前端域名为：`https://cosmetic-ve.vercel.app`

**步骤 2：配置 CORS_ORIGINS**

1. Vercel Dashboard → 后端项目 → Settings → Environment Variables
2. 添加或更新（注意是复数 **ORIGINS**）：
   ```
   CORS_ORIGINS=https://cosmetic-ve.vercel.app,https://www.cosmetic-ve.vercel.app
   ```

   ⚠️ **注意**：
   - 多个域名用英文逗号分隔，无空格
   - 包含所有可能的域名（带 www 和不带 www）
   - 不要在末尾加斜杠 `/`

3. Save 并 Redeploy

---

### 5. Prisma Client 未生成 ⚠️ **构建问题**

#### 症状
- 部署成功，但运行时报错
- Function Logs 显示：
  ```
  Error: @prisma/client did not initialize yet
  ```

#### 原因
构建时没有执行 `prisma generate`。

#### 解决方案

**检查 Install Command**：

1. Vercel Dashboard → 后端项目 → Settings → General
2. 确认 Install Command 为：
   ```bash
   cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate
   ```

3. 如果不正确，修改后重新部署

**检查 Build Command**：

确认 `apps/server/package.json` 的 `vercel-build` 脚本：
```json
"vercel-build": "prisma generate && tsc"
```

---

### 6. 用户账号不存在 ⚠️ **首次登录**

#### 症状
- 数据库连接正常
- 登录返回 401：`账号或密码错误`

#### 原因
数据库是空的，没有用户账号。

#### 解决方案

**方法 1：使用注册接口**

```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456",
    "nickname": "测试用户"
  }'
```

**方法 2：创建管理员账号**

```bash
# 本地连接生产数据库
cd apps/server
$env:DATABASE_URL="your-production-database-url"

# 运行创建管理员脚本
node scripts/create-admin.js
```

---

## 📋 完整排查流程

### 步骤 1：查看 Vercel Function Logs

1. 登录 Vercel Dashboard
2. 进入后端项目
3. 点击 **Deployments**
4. 选择最新的部署
5. 点击 **Function Logs**
6. 尝试登录，观察实时日志

**常见错误信息**：

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Can't reach database server` | 数据库连接失败 | 检查 DATABASE_URL |
| `Table 'User' does not exist` | 数据库表未创建 | 执行 prisma migrate deploy |
| `@prisma/client did not initialize` | Prisma Client 未生成 | 检查构建配置 |
| `Not allowed by CORS` | CORS 配置错误 | 检查 CORS_ORIGINS |

### 步骤 2：运行诊断接口

```bash
# 访问诊断接口
curl https://your-backend.vercel.app/api/diagnostic
```

**分析诊断结果**：

```json
{
  "success": false,
  "data": {
    "overall": "❌ 系统异常",
    "errors": [
      "DATABASE_URL 未配置 - 数据库连接将失败"
    ],
    "warnings": [
      "JWT_SECRET 未配置 - 使用默认值（不安全）"
    ],
    "checks": {
      "database": {
        "status": "❌ 连接失败",
        "error": "Can't reach database server"
      }
    }
  }
}
```

根据 `errors` 和 `warnings` 字段逐一修复。

### 步骤 3：测试健康检查

```bash
# 测试后端是否运行
curl https://your-backend.vercel.app/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-11-27T02:43:00.000Z"
}
```

### 步骤 4：测试数据库连接

如果健康检查通过，但登录失败，问题可能在数据库。

```bash
# 本地连接生产数据库测试
cd apps/server
$env:DATABASE_URL="your-production-database-url"
pnpm prisma db pull
```

如果失败，说明数据库连接有问题。

### 步骤 5：测试登录接口

使用 curl 直接测试（跳过前端）：

```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138000",
    "password": "123456"
  }' \
  -v
```

观察响应状态码和错误信息。

---

## 🛠️ 查看详细日志的方法

### 方法 1：Vercel Dashboard（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择后端项目（cosmetic-ve-server）
3. 点击 **Deployments**
4. 选择最新部署
5. 点击 **Function Logs**
6. 在前端尝试登录，实时查看日志

**日志示例**：
```
2024-11-27 10:43:01  START RequestId: abc123...
2024-11-27 10:43:01  🔍 CORS Debug - Request origin: https://cosmetic-ve.vercel.app
2024-11-27 10:43:01  ✅ CORS allowed: https://cosmetic-ve.vercel.app
2024-11-27 10:43:01  POST /api/auth/login
2024-11-27 10:43:02  ❌ 错误: PrismaClientKnownRequestError: Table 'User' does not exist
2024-11-27 10:43:02  END RequestId: abc123...
```

### 方法 2：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 实时查看日志
vercel logs https://your-backend.vercel.app --follow
```

### 方法 3：浏览器开发者工具

1. 打开前端网站
2. 按 F12 打开开发者工具
3. 切换到 **Network** 面板
4. 尝试登录
5. 查看登录请求的 **Response** 标签

---

## 🎯 最可能的原因（根据经验）

根据 "数据库在 Vercel 已创建，但登录报 500" 的描述，最可能的原因是：

### ⭐ **99% 可能：数据库表未创建**

即使数据库已创建，但如果没有执行 Prisma 迁移，表结构不存在，登录时查询 User 表会失败。

**快速验证**：

```bash
# 访问诊断接口
https://your-backend.vercel.app/api/diagnostic
```

如果看到 `"tables": { "count": 0 }`，就是这个问题。

**快速修复**：

```bash
cd apps/server
$env:DATABASE_URL="your-vercel-postgres-url"
pnpm prisma migrate deploy
```

---

## ✅ 修复后验证

### 1. 重新访问诊断接口

```bash
curl https://your-backend.vercel.app/api/diagnostic
```

确认 `overall` 为 `✅ 系统正常`。

### 2. 测试注册

```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456"
  }'
```

预期响应：
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 3. 测试登录

```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "13800138000",
    "password": "123456"
  }'
```

预期响应：
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 4. 前端测试

1. 访问前端网站
2. 尝试注册新账号
3. 使用注册的账号登录
4. 确认无 CORS 错误，登录成功

---

## 📚 相关文档

- [Vercel 部署配置](./VERCEL_DEPLOYMENT_CONFIG.md)
- [快速配置参考](./VERCEL_QUICK_CONFIG.md)
- [部署问题汇总](./DEPLOYMENT_ISSUES_AND_FIXES.md)

---

## 🆘 仍然无法解决？

如果按照本指南操作仍然报错，请提供以下信息：

1. **诊断接口返回结果**（完整 JSON）
2. **Vercel Function Logs**（错误部分）
3. **浏览器控制台错误信息**（Network 面板）
4. **已执行的修复步骤**

这些信息可以帮助进一步诊断问题。

---

## 💡 预防措施

为避免类似问题，建议：

1. **部署前本地测试**
   ```bash
   cd apps/server
   pnpm dev
   ```

2. **使用 CI/CD 自动化迁移**
   - 在 GitHub Actions 中自动执行 `prisma migrate deploy`

3. **监控和告警**
   - 启用 Vercel Analytics
   - 配置错误告警通知

4. **定期检查诊断接口**
   - 部署后立即访问 `/api/diagnostic` 确认状态

5. **环境变量备份**
   - 使用 `vercel env pull` 定期备份环境变量
