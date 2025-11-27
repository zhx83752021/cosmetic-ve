# Vercel 前后端分离部署指南

## 概述

本项目采用 **Monorepo + 前后端分离** 架构，需要在 Vercel 上创建 **两个独立的 Project**：

- **Project 1**: 前端应用（Vue 3 SPA）
- **Project 2**: 后端 API（Express + Prisma）

---

## 部署架构图

```
┌─────────────────────────────────────────────────┐
│  Vercel Project 1: Frontend (cosmetics-web)     │
│  - 静态托管 (CDN)                                │
│  - 构建产物: apps/web/dist                       │
│  - 域名: https://your-frontend.vercel.app       │
└─────────────────────────────────────────────────┘
                       ↓ API 请求
┌─────────────────────────────────────────────────┐
│  Vercel Project 2: Backend (cosmetics-api)      │
│  - Serverless Functions                         │
│  - 构建产物: apps/server/dist                    │
│  - 域名: https://your-backend.vercel.app        │
└─────────────────────────────────────────────────┘
                       ↓
            [Database + Redis]
```

---

## 🚀 部署步骤

### 第一步：部署前端应用

#### 1. 创建 Vercel 项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 导入你的 Git 仓库（GitHub/GitLab/Bitbucket）

#### 2. 配置构建设置

在项目配置页面设置：

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `cosmetics-web`（或自定义） |
| **Framework Preset** | `Other` |
| **Root Directory** | `./`（保持默认，使用根目录） |
| **Build Command** | `cd apps/web && pnpm run build` |
| **Output Directory** | `apps/web/dist` |
| **Install Command** | `pnpm install` |

> ⚠️ **重要**: 必须使用根目录，因为 pnpm workspace 需要访问整个 monorepo

#### 3. 配置环境变量

在 **Settings → Environment Variables** 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://your-backend.vercel.app/api` | 后端 API 地址（先占位，后面替换） |
| `VITE_BASE_URL` | `/` | 应用基础路径 |

#### 4. 部署

点击 **"Deploy"** 开始部署，等待构建完成。

部署成功后，记下前端域名：`https://your-frontend.vercel.app`

---

### 第二步：部署后端 API

#### 1. 创建第二个 Vercel 项目

1. 再次点击 **"Add New Project"**
2. 选择 **同一个 Git 仓库**（是的，同一个仓库）
3. 这次我们只部署 `apps/server` 子目录

#### 2. 配置构建设置

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `cosmetics-api`（或自定义） |
| **Framework Preset** | `Other` |
| **Root Directory** | `apps/server` ⚠️ **关键：选择子目录** |
| **Build Command** | `pnpm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate` |

> ⚠️ **关键点**：Root Directory 必须设置为 `apps/server`，这样 Vercel 会把这个子目录当作项目根目录

#### 3. 配置环境变量

在 **Settings → Environment Variables** 添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 运行环境 |
| `DATABASE_URL` | `postgresql://...` | 数据库连接字符串 |
| `JWT_SECRET` | `your-secure-random-string` | JWT 密钥（至少32位） |
| `REDIS_URL` | `redis://...` | Redis 连接字符串（可选） |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | 允许的前端域名 |
| `PORT` | `3001` | 端口（Vercel 会自动处理） |

#### 4. 部署

点击 **"Deploy"** 开始部署。

部署成功后，记下后端域名：`https://your-backend.vercel.app`

---

### 第三步：更新环境变量并重新部署

#### 1. 更新前端项目的 API 地址

1. 进入 **前端项目** → Settings → Environment Variables
2. 修改 `VITE_API_BASE_URL` 为实际的后端域名：
   ```
   https://your-backend.vercel.app/api
   ```
3. 点击 **Save**

#### 2. 更新后端项目的 CORS 配置

1. 进入 **后端项目** → Settings → Environment Variables
2. 确认 `CORS_ORIGIN` 为实际的前端域名：
   ```
   https://your-frontend.vercel.app
   ```
3. 如果有管理后台，添加多个域名（逗号分隔）：
   ```
   https://your-frontend.vercel.app,https://admin.yourdomain.com
   ```

#### 3. 重新部署两个项目

- 前端项目：Deployments → 最新部署 → 右上角菜单 → **Redeploy**
- 后端项目：同样操作

---

## 📋 验证部署

### 1. 测试后端 API

访问健康检查接口：
```bash
curl https://your-backend.vercel.app/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 测试前端应用

1. 访问前端域名：`https://your-frontend.vercel.app`
2. 打开浏览器开发者工具 → Network
3. 检查 API 请求是否正常
4. 确认没有 CORS 错误

---

## 🔧 常见问题与解决方案

### 1. 前端构建失败：找不到依赖

**原因**：没有从根目录安装依赖

**解决**：
- 确认 Root Directory 设置为 `./`（根目录）
- 确认 Install Command 为 `pnpm install`（不是 `cd apps/web && pnpm install`）

### 2. 后端构建失败：Prisma Client 未生成

**原因**：构建时没有执行 `prisma generate`

**解决**：
- 确认 Install Command 包含 prisma 生成步骤：
  ```bash
  cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate
  ```

### 3. API 请求 CORS 错误

**原因**：后端 CORS 配置不正确

**解决**：
1. 检查后端环境变量 `CORS_ORIGIN` 是否包含前端域名
2. 修改 `apps/server/src/index.ts` 的 CORS 配置：
   ```typescript
   app.use(
     cors({
       origin: process.env.CORS_ORIGIN?.split(',') || '*',
       credentials: true,
     })
   )
   ```

### 4. 数据库连接失败

**原因**：`DATABASE_URL` 配置错误或数据库不可访问

**解决**：
1. 使用 Vercel Postgres 或其他云数据库
2. 确保数据库允许来自 Vercel 的连接（IP 白名单）
3. 检查连接字符串格式是否正确

### 5. 环境变量不生效

**原因**：修改环境变量后没有重新部署

**解决**：
- 每次修改环境变量后，必须 **Redeploy** 项目

---

## 🎯 最佳实践

### 1. 使用自定义域名

#### 前端域名
```
www.yourdomain.com  → 前端应用
admin.yourdomain.com → 管理后台（如果有）
```

#### 后端域名
```
api.yourdomain.com  → 后端 API
```

#### 配置步骤
1. 进入项目 Settings → Domains
2. 添加自定义域名
3. 配置 DNS CNAME 记录指向 Vercel
4. 等待 SSL 证书自动签发

### 2. 启用自动部署

**推荐配置**：
- `main` 分支 → 自动部署到生产环境
- `develop` 分支 → 自动部署到预览环境
- Pull Request → 自动创建预览链接

### 3. 监控与日志

启用 Vercel Analytics 和 Logs：
1. Settings → Analytics → 启用 Web Analytics
2. Deployments → 点击具体部署 → 查看 Build Logs / Function Logs

### 4. 数据库迁移

**重要提示**：Vercel Serverless 环境不适合直接运行数据库迁移

**推荐方案**：
- 在本地或 CI/CD 环境执行 `prisma migrate deploy`
- 使用 Vercel CLI 连接生产环境执行迁移：
  ```bash
  vercel env pull .env.production
  pnpm prisma migrate deploy
  ```

---

## 📊 部署清单

部署前检查：

- [ ] 前端项目已创建，Root Directory 为 `./`
- [ ] 后端项目已创建，Root Directory 为 `apps/server`
- [ ] 前端环境变量 `VITE_API_BASE_URL` 已配置
- [ ] 后端环境变量（数据库、JWT、CORS）已配置
- [ ] 数据库已创建并可访问
- [ ] Prisma schema 与数据库同步
- [ ] 两个项目都部署成功
- [ ] API 健康检查通过
- [ ] 前端能正常调用后端 API
- [ ] CORS 配置正确，无跨域错误
- [ ] SSL 证书已自动签发

---

## 💡 进阶配置

### 使用 Vercel 环境

在同一个 Vercel 项目中管理多个环境：

| 环境 | Git 分支 | 用途 |
|------|---------|------|
| Production | `main` | 生产环境 |
| Preview | `develop` | 预发布环境 |
| Development | `feature/*` | 功能分支预览 |

### 共享环境变量

如果有多个前端应用（如用户端 + 管理端），可以在后端配置多个 CORS 源：

```env
CORS_ORIGIN=https://web.yourdomain.com,https://admin.yourdomain.com
```

---

## 📚 相关文档

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel Monorepo 支持](https://vercel.com/docs/monorepos)
- [Prisma + Vercel 指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

## 需要帮助？

如果遇到问题：

1. 检查 Vercel 部署日志（Deployments → Build Logs）
2. 查看 Function Logs（运行时错误）
3. 参考本文档的常见问题部分
4. 访问 [Vercel 社区](https://github.com/vercel/vercel/discussions)
