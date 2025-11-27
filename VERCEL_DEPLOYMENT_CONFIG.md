# Vercel 双项目部署配置指南

## 项目概述

- **前端项目**: cosmetic-ve（根目录部署）
- **后端项目**: cosmetic-ve-server（apps/server 目录部署）

---

## 🎯 部署配置详细说明

### 前端项目配置

#### 1. Vercel 项目设置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Project Name** | `cosmetic-ve` | 前端项目名称 |
| **Framework Preset** | `Vite` 或 `Other` | 框架选择 |
| **Root Directory** | `./` | **必须使用根目录** |
| **Build Command** | `cd apps/web && pnpm run build` | 构建命令 |
| **Output Directory** | `apps/web/dist` | 输出目录 |
| **Install Command** | `pnpm install` | 安装依赖（在根目录执行） |

#### 2. 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 添加：

```env
# 后端 API 地址（部署后端后更新为实际地址）
VITE_API_BASE_URL=https://cosmetic-ve-server.vercel.app/api

# 应用基础路径
VITE_BASE_URL=/
```

⚠️ **重要提示**：首次部署时可以先用占位符，等后端部署完成后再更新为实际地址。

---

### 后端项目配置

#### 1. Vercel 项目设置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Project Name** | `cosmetic-ve-server` | 后端项目名称 |
| **Framework Preset** | `Other` | 不使用框架预设 |
| **Root Directory** | `apps/server` | **设置为后端子目录** |
| **Build Command** | `pnpm run vercel-build` | 使用 package.json 中的构建脚本 |
| **Output Directory** | `dist` | 输出目录（相对于 Root Directory） |
| **Install Command** | `cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate` | **关键：必须从根目录安装** |

⚠️ **关键说明**：
- Install Command 必须先切换到根目录（`cd ../..`）安装依赖
- 因为这是 pnpm workspace 项目，必须在根目录安装才能正确处理依赖关系
- 安装完成后再执行 `prisma generate`

#### 2. 环境变量配置

在 Vercel Dashboard → Settings → Environment Variables 添加：

```env
# 运行环境
NODE_ENV=production

# 数据库连接（使用 Vercel Postgres 或其他云数据库）
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public

# JWT 配置
JWT_SECRET=your-super-secure-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d

# Redis 连接（可选）
REDIS_URL=redis://username:password@host:6379

# Vercel Blob 存储（如果使用）
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# CORS 白名单（前端域名，部署后更新）
CORS_ORIGINS=https://cosmetic-ve.vercel.app,https://www.cosmetic-ve.vercel.app
```

⚠️ **安全提示**：
- JWT_SECRET 必须使用强随机字符串，至少 32 位
- 生产环境绝不使用默认值或简单密码

---

## 📋 部署步骤检查清单

### 部署前准备

- [ ] 确认 `apps/server/package.json` 的 `vercel-build` 脚本已更新（不包含 `prisma migrate deploy`）
- [ ] 准备好数据库连接字符串（Vercel Postgres 或其他云数据库）
- [ ] 生成安全的 JWT_SECRET（可使用 `openssl rand -base64 32`）

### 第一步：部署后端项目

1. [ ] 在 Vercel 创建新项目，导入 Git 仓库
2. [ ] 按照上述"后端项目配置"设置参数
3. [ ] 添加所有必需的环境变量
4. [ ] **部署前手动执行数据库迁移**：
   ```bash
   # 在本地连接生产数据库执行迁移
   DATABASE_URL="your-production-database-url" pnpm --filter @cosmetics/server prisma migrate deploy
   ```
5. [ ] 点击 Deploy，等待部署完成
6. [ ] 测试后端 API：`curl https://cosmetic-ve-server.vercel.app/health`
7. [ ] 记录后端域名（用于前端配置）

### 第二步：部署前端项目

1. [ ] 在 Vercel 创建第二个项目，选择同一个 Git 仓库
2. [ ] 按照上述"前端项目配置"设置参数
3. [ ] 添加环境变量（`VITE_API_BASE_URL` 使用刚才记录的后端域名）
4. [ ] 点击 Deploy，等待部署完成
5. [ ] 记录前端域名

### 第三步：更新 CORS 配置

1. [ ] 回到后端项目 → Settings → Environment Variables
2. [ ] 更新 `CORS_ORIGINS` 为实际的前端域名
3. [ ] 保存后重新部署后端项目（Deployments → Redeploy）

### 第四步：验证部署

1. [ ] 访问前端网站，打开浏览器开发者工具
2. [ ] 测试登录、注册等功能
3. [ ] 确认 Network 面板中 API 请求成功，无 CORS 错误
4. [ ] 检查 Vercel Function Logs，确认无错误

---

## ⚠️ 常见问题排查

### 问题 1：后端部署失败 - 找不到 pnpm-workspace.yaml

**原因**：Install Command 没有从根目录执行

**解决**：确认 Install Command 为：
```bash
cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate
```

### 问题 2：Prisma Client 生成失败

**原因**：
- DATABASE_URL 环境变量未配置
- Prisma schema 文件有语法错误

**解决**：
1. 确认环境变量已正确配置
2. 在本地运行 `pnpm prisma validate` 检查 schema
3. 查看 Vercel 部署日志获取详细错误信息

### 问题 3：API 请求 CORS 错误

**原因**：
- 后端 `CORS_ORIGINS` 未包含前端域名
- 环境变量修改后未重新部署

**解决**：
1. 检查后端环境变量 `CORS_ORIGINS`（注意是复数 ORIGINS）
2. 确认包含了所有前端域名（包括 www 子域名）
3. 修改后必须重新部署后端项目

### 问题 4：数据库连接失败

**原因**：
- DATABASE_URL 格式错误
- 数据库防火墙阻止 Vercel IP
- SSL 配置问题

**解决**：
1. 确认 DATABASE_URL 格式：`postgresql://user:password@host:5432/db?schema=public`
2. 使用 Vercel Postgres 或配置数据库允许所有 IP（0.0.0.0/0）
3. PostgreSQL 需要添加 `?sslmode=require` 参数（Vercel Postgres 已自动包含）

### 问题 5：环境变量不生效

**原因**：修改环境变量后没有重新部署

**解决**：
- 每次修改环境变量后，必须在 Deployments 页面点击 Redeploy
- 或推送新的代码触发自动部署

---

## 🎯 数据库迁移最佳实践

### ⛔ 错误做法

❌ 在 `vercel-build` 脚本中执行 `prisma migrate deploy`
- 多个 Serverless 函数实例会并发执行迁移
- 可能导致数据库锁、冲突、数据丢失

### ✅ 正确做法

#### 方法 1：本地执行迁移（推荐）

```bash
# 连接到生产数据库执行迁移
DATABASE_URL="your-production-database-url" pnpm --filter @cosmetics/server prisma migrate deploy
```

#### 方法 2：使用 GitHub Actions

在 `.github/workflows/deploy.yml` 中添加：

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install dependencies
        run: pnpm install
      - name: Run database migrations
        run: pnpm --filter @cosmetics/server prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy:
    needs: migrate
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📊 部署后监控

### 1. 查看部署日志

- Vercel Dashboard → Deployments → 选择部署 → Build Logs
- 查看构建过程中的错误和警告

### 2. 查看运行时日志

- Vercel Dashboard → Deployments → 选择部署 → Functions Logs
- 实时查看 API 请求和错误

### 3. 性能监控

- Settings → Analytics → 启用 Web Analytics
- 监控页面加载时间、API 响应时间

---

## 🔗 自定义域名配置（可选）

### 前端域名

```
www.yourdomain.com  → 前端应用
yourdomain.com      → 重定向到 www
```

### 后端域名

```
api.yourdomain.com  → 后端 API
```

### 配置步骤

1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加自定义域名
3. 根据提示在 DNS 提供商处添加 CNAME 记录：
   ```
   CNAME  www   cname.vercel-dns.com
   CNAME  api   cname.vercel-dns.com
   ```
4. 等待 SSL 证书自动签发（通常 1-5 分钟）
5. 更新环境变量：
   - 前端 `VITE_API_BASE_URL` → `https://api.yourdomain.com/api`
   - 后端 `CORS_ORIGINS` → `https://www.yourdomain.com,https://yourdomain.com`
6. 重新部署两个项目

---

## 📚 相关文档

- [Vercel Monorepo 文档](https://vercel.com/docs/monorepos)
- [Prisma + Vercel 指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 需要帮助？

如果遇到问题：

1. 检查 Vercel 部署日志（Build Logs + Function Logs）
2. 确认所有环境变量已正确配置
3. 参考本文档的"常见问题排查"部分
4. 检查浏览器控制台的网络请求和错误信息
