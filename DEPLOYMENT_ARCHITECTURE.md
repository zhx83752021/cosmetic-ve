# 部署架构说明

## 项目结构

本项目采用 **Monorepo** 架构：

```
cosmetic-ve/
├── apps/
│   ├── web/              # 前端应用 (Vue 3 + Vite)
│   │   ├── src/
│   │   ├── dist/         # 构建输出
│   │   └── package.json
│   └── server/           # 后端 API (Express + Prisma)
│       ├── src/
│       ├── dist/         # 构建输出
│       ├── prisma/
│       ├── vercel.json   # 后端部署配置
│       └── package.json
├── vercel.json           # 前端部署配置
├── pnpm-workspace.yaml   # Workspace 配置
└── package.json          # 根配置
```

## Vercel 部署架构

### 为什么需要两个 Project？

| 维度 | 前端 | 后端 |
|-----|------|------|
| **类型** | 静态 SPA | Node.js API |
| **托管方式** | CDN 分发 | Serverless Functions |
| **构建产物** | HTML/CSS/JS 静态文件 | Node.js 服务端代码 |
| **运行环境** | 浏览器 | Node.js Runtime |
| **配置文件** | `vercel.json` (根目录) | `apps/server/vercel.json` |
| **环境变量** | `VITE_*` (客户端) | `DATABASE_URL`, `JWT_SECRET` 等 |

### 部署拓扑

```
┌────────────────────────────────────────┐
│  Git 仓库 (github.com/user/cosmetic)    │
│  - main 分支（生产环境）                 │
│  - develop 分支（预览环境）              │
└────────────────────────────────────────┘
               │
               ├─────────────────────────────────────┐
               ↓                                     ↓
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  Vercel Project 1: Frontend  │    │  Vercel Project 2: Backend   │
│  ─────────────────────────   │    │  ─────────────────────────   │
│  Root: ./                    │    │  Root: apps/server           │
│  Build: cd apps/web &&       │    │  Build: pnpm run build       │
│         pnpm run build       │    │  Deploy: Serverless          │
│  Deploy: Static CDN          │    │                              │
└──────────────────────────────┘    └──────────────────────────────┘
               │                                     │
               │  VITE_API_BASE_URL                 │  DATABASE_URL
               ↓                                     ↓
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  https://web.yourdomain.com  │───→│  https://api.yourdomain.com  │
│  (用户访问)                   │    │  (API 请求)                   │
└──────────────────────────────┘    └──────────────────────────────┘
                                                    │
                                                    ↓
                                    ┌──────────────────────────────┐
                                    │  外部服务                     │
                                    │  - PostgreSQL (数据库)        │
                                    │  - Redis (缓存)              │
                                    │  - Vercel Blob (文件存储)     │
                                    └──────────────────────────────┘
```

## 关键配置差异

### 前端项目 (Root: `./`)

**vercel.json**:
```json
{
  "buildCommand": "cd apps/web && pnpm run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**环境变量**:
- `VITE_API_BASE_URL`: 指向后端 API 的域名
- `VITE_BASE_URL`: 应用基础路径

**部署流程**:
1. 安装所有依赖（从根目录）
2. 构建前端应用
3. 输出静态文件到 CDN

### 后端项目 (Root: `apps/server`)

**apps/server/vercel.json**:
```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "installCommand": "cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate",
  "builds": [
    { "src": "dist/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "dist/index.js" }
  ]
}
```

**环境变量**:
- `DATABASE_URL`: 数据库连接
- `JWT_SECRET`: JWT 密钥
- `CORS_ORIGIN`: 允许的前端域名
- `NODE_ENV`: production

**部署流程**:
1. 返回根目录安装依赖
2. 生成 Prisma Client
3. 构建 TypeScript 代码
4. 部署为 Serverless Function

## 数据流

### 1. 用户访问

```
用户浏览器
    ↓ 访问
前端应用 (CDN)
    ↓ 加载页面，发起 API 请求
后端 API (Serverless)
    ↓ 查询数据
数据库 / 缓存
```

### 2. 构建部署

```
Git Push
    ↓
Vercel Webhook 触发
    ├─→ 前端项目：构建静态文件 → CDN
    └─→ 后端项目：构建 Node.js 代码 → Serverless
```

## 环境隔离

| 环境 | Git 分支 | 前端域名 | 后端域名 | 数据库 |
|------|---------|---------|---------|--------|
| **生产环境** | `main` | `www.yourdomain.com` | `api.yourdomain.com` | 生产数据库 |
| **预览环境** | `develop` | `dev-xxx.vercel.app` | `dev-api-xxx.vercel.app` | 开发数据库 |
| **PR 预览** | `feature/*` | `preview-xxx.vercel.app` | `preview-api-xxx.vercel.app` | 测试数据库 |

## 成本估算

### Vercel 免费额度 (Hobby)

- 每个账号可创建无限个项目 ✅
- 每月 100GB 带宽
- 100GB-hours Serverless 执行时间
- 适合小型项目和演示

### 需要 Pro 的场景

- 商业项目
- 超过免费额度
- 需要团队协作
- 需要密码保护

## 最佳实践

1. **域名配置**
   - 前端：`www.yourdomain.com` 或 `app.yourdomain.com`
   - 后端：`api.yourdomain.com`
   - 管理后台：`admin.yourdomain.com`

2. **环境变量管理**
   - 生产环境和预览环境分别配置
   - 敏感信息只在 Vercel Dashboard 配置，不提交到代码

3. **数据库迁移**
   - 不在 Vercel 构建时执行迁移
   - 在本地或 CI 环境执行 `prisma migrate deploy`

4. **监控告警**
   - 启用 Vercel Analytics
   - 配置错误日志监控
   - 设置预算告警

## 常见问题

### Q1: 可以在一个 Project 中同时部署前后端吗？

**A**: 理论上可以，但**不推荐**。原因：
- 前端是静态托管，后端是 Serverless，部署方式不同
- 环境变量混淆（前端 `VITE_*` vs 后端敏感变量）
- 构建复杂度高，难以维护
- 无法分别配置域名和缓存策略

### Q2: 为什么后端要用 Serverless 而不是传统服务器？

**A**: Vercel 平台特性：
- ✅ 按需付费，成本低
- ✅ 自动扩展，无需管理服务器
- ✅ 全球 CDN，低延迟
- ❌ 不适合长连接（WebSocket）
- ❌ 不适合大文件处理

### Q3: Monorepo 部署会不会很复杂？

**A**: 不会，关键点：
- 前端项目 Root Directory 设为 `./`（根目录）
- 后端项目 Root Directory 设为 `apps/server`（子目录）
- Install Command 需要正确处理 workspace 依赖

### Q4: 如何处理数据库迁移？

**A**: 推荐流程：
```bash
# 1. 本地测试迁移
pnpm prisma migrate dev

# 2. 生产环境迁移（使用生产数据库连接）
vercel env pull .env.production
pnpm prisma migrate deploy
```

## 相关文档

- [完整部署指南](./VERCEL_DUAL_DEPLOYMENT.md)
- [快速开始](./QUICK_START_DEPLOYMENT.md)
- [配置检查脚本](./check-vercel-config.bat)

---

**总结**：本项目需要在 Vercel 创建两个 Project，分别部署前端和后端。这是最佳实践，能够充分利用 Vercel 的静态托管和 Serverless 能力。
