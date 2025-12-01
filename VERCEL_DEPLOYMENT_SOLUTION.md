# Vercel 部署完整方案

## 📋 目录

- [部署架构](#部署架构)
- [部署前准备](#部署前准备)
- [关键配置文件](#关键配置文件)
- [部署流程](#部署流程)
- [常见问题解决](#常见问题解决)
- [环境变量配置](#环境变量配置)
- [监控和维护](#监控和维护)

## 🏗️ 部署架构

### 项目结构

```
cosmetic-ve/
├── apps/
│   ├── web/              # Vue3 前端应用
│   │   ├── dist/         # 构建产物 → public/
│   │   └── package.json
│   └── server/           # Express 后端应用
│       ├── dist/         # TypeScript 编译产物 → api/dist/
│       ├── src/
│       └── package.json
├── api/                  # Vercel Serverless Function
│   ├── dist/            # 后端编译产物（构建时生成）
│   ├── index.js         # Serverless 入口点
│   └── package.json     # 运行时依赖
├── public/              # 前端静态文件（构建时生成）
├── scripts/
│   └── prepare-deploy.js # 部署准备脚本
├── vercel.json          # Vercel 配置
└── pnpm-workspace.yaml  # Monorepo 配置
```

### 部署后的文件映射

| 源文件               | 部署位置            | 用途            |
| -------------------- | ------------------- | --------------- |
| `apps/web/dist/*`    | `/public/*`         | 前端静态资源    |
| `apps/server/dist/*` | `/api/dist/*`       | 后端编译代码    |
| `api/index.js`       | `/api/index.js`     | Serverless 入口 |
| `api/package.json`   | `/api/package.json` | 依赖声明        |

## 🔧 部署前准备

### 1. 数据库准备

#### 选项 A: Vercel Postgres（推荐）

```bash
# 在 Vercel Dashboard
1. 进入项目 → Storage 标签
2. Create Database → Postgres
3. 自动配置环境变量 DATABASE_URL
```

#### 选项 B: 外部数据库（Neon/Supabase）

```bash
# Neon 示例
1. 访问 https://neon.tech
2. 创建项目
3. 复制 Connection String
4. 格式: postgresql://user:pass@host.neon.tech:5432/db?sslmode=require
```

### 2. 环境变量准备

**必需变量**:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key-at-least-32-characters
NODE_ENV=production
```

**可选变量**:

```env
CORS_ORIGINS=https://your-custom-domain.com
REDIS_URL=redis://...  # 如果使用 Redis
```

### 3. 本地测试

```bash
# 1. 安装依赖
pnpm install

# 2. 构建测试
cd apps/server && pnpm run build
cd ../web && pnpm run build
cd ../..
node scripts/prepare-deploy.js

# 3. 检查构建产物
ls -la public/     # 应包含前端文件
ls -la api/dist/   # 应包含后端编译文件
```

## 📝 关键配置文件

### 1. vercel.json

```json
{
  "installCommand": "npm install -g pnpm@8.12.1 && NODE_ENV=development pnpm install --no-frozen-lockfile",
  "buildCommand": "cd apps/server && pnpm run build && cd ../web && pnpm run build && cd ../.. && node scripts/prepare-deploy.js",
  "outputDirectory": "public",
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

**关键说明**:

- `rewrites` 第一条：所有 `/api/*` 请求路由到 Serverless Function
- `rewrites` 第二条：使用负向前瞻正则，非 API 请求路由到前端 SPA
- **不要使用 `routes`**，会覆盖 `rewrites`

### 2. api/package.json

```json
{
  "type": "module",
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "joi": "^17.11.0",
    "jsonwebtoken": "^9.0.2",
    "redis": "^4.6.11"
  }
}
```

**关键说明**:

- 必须声明所有运行时依赖
- `type: "module"` 启用 ES 模块
- Vercel 会为此目录单独安装依赖

### 3. api/index.js

```javascript
// Vercel Serverless Function entry point
let app

try {
  // Import the compiled Express app
  const module = await import('./dist/index.js')
  app = module.default
  console.log('✅ Express app loaded successfully')
} catch (error) {
  console.error('❌ Failed to load Express app:', error)

  // Create a fallback error handler
  app = (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    })
  }
}

export default app
```

**关键说明**:

- 使用 `await import()` 动态加载 Express app
- 错误处理：构建失败时返回友好错误信息
- 必须 `export default` 导出 Express 实例

### 4. pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'api' # ⚠️ 必须包含，否则不会安装 api 依赖
```

### 5. apps/server/package.json

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && tsc",
    "postbuild": "node scripts/ensure-admin.js"
  }
}
```

**关键说明**:

- `prisma generate`: 生成 Prisma Client
- `prisma migrate deploy`: 执行数据库迁移
- `tsc`: 编译 TypeScript
- `postbuild`: 自动创建管理员账户

### 6. .vercelignore

```
# 依赖
node_modules

# 构建产物（本地）
apps/*/dist
public
# ⚠️ 不排除 api/dist，它在构建时生成

# 日志
*.log

# 文档
docs
*.md
!README.md

# ⚠️ 不要排除 api/ 目录本身
```

### 7. .gitignore

```
# 构建产物
/api/dist     # 只排除 api/dist，不排除 api/index.js
/public

# 其他...
```

## 🚀 部署流程

### 方式 1: 自动部署（推荐）

```bash
# 1. 提交代码
git add .
git commit -m "部署到 Vercel"
git push origin main

# 2. Vercel 自动触发部署
# 访问 Vercel Dashboard 查看部署状态
```

### 方式 2: Vercel CLI 部署

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

### 部署日志关键节点

```
✅ Installing dependencies for all 4 workspace projects
✅ Running build command
   - Prisma generate
   - Prisma migrate deploy
   - TypeScript compilation
   - Frontend build
   - prepare-deploy.js
✅ Installing dependencies for api/
✅ Deploying outputs
✅ Deployment completed
```

## ❗ 常见问题解决

### 问题 1: 405 Method Not Allowed

**症状**: API 请求返回 405 错误

**原因**: `routes` 配置覆盖了 `rewrites`

**解决方案**:

```json
// ❌ 错误配置
{
  "rewrites": [...],
  "routes": [...]  // 会覆盖 rewrites
}

// ✅ 正确配置
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api" },
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ]
}
```

### 问题 2: Cannot find module 'express'

**症状**: Serverless function 报错找不到模块

**原因**: `api/package.json` 未声明依赖，或未包含在 workspace

**解决方案**:

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'api' # ⚠️ 必须添加
```

```json
// api/package.json
{
  "dependencies": {
    "express": "^4.18.2"
    // 其他所有运行时依赖...
  }
}
```

### 问题 3: 数据库表不存在

**症状**: API 报错 `Table 'users' doesn't exist`

**原因**: 未执行 Prisma 迁移

**解决方案**:

```json
// apps/server/package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && tsc"
  }
}
```

### 问题 4: 管理员账户不存在

**症状**: 登录失败，无管理员

**解决方案**:

```json
// apps/server/package.json
{
  "scripts": {
    "postbuild": "node scripts/ensure-admin.js"
  }
}
```

### 问题 5: TypeScript 编译错误

**症状**: 构建失败，类型错误

**解决方案**:

```typescript
// 添加类型注解
const handler = (req: express.Request, res: express.Response) => {
  // ...
}
```

### 问题 6: Serverless Function 超时

**症状**: API 请求超时

**解决方案**:

```json
// vercel.json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 10 // 增加超时时间（秒）
    }
  }
}
```

## 🔐 环境变量配置

### Vercel Dashboard 配置步骤

```
1. 访问 https://vercel.com/dashboard
2. 选择项目
3. Settings → Environment Variables
4. Add Variable
```

### 必需变量

| 变量名         | 示例值                                | 环境       | 说明       |
| -------------- | ------------------------------------- | ---------- | ---------- |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Production | 数据库连接 |
| `JWT_SECRET`   | `your-super-secret-key-32-chars`      | Production | JWT 密钥   |
| `NODE_ENV`     | `production`                          | Production | 运行环境   |

### 生成 JWT_SECRET

```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})
```

或访问: https://randomkeygen.com/

### 验证环境变量

访问: `https://your-domain.com/api/health`

```json
{
  "environment": {
    "hasDatabase": true, // ✅ 应该是 true
    "hasJwtSecret": true // ✅ 应该是 true
  }
}
```

## 📊 监控和维护

### 1. 查看部署日志

```
Vercel Dashboard → Deployments → 选择部署 → View Function Logs
```

### 2. 实时日志监控

```
Vercel Dashboard → 项目 → Logs → Realtime
```

### 3. 性能监控

```
Vercel Dashboard → 项目 → Analytics
- 启用 Analytics
- 启用 Speed Insights
```

### 4. 错误追踪

```javascript
// apps/server/src/middleware/errorHandler.ts
export const errorHandler = (err, req, res, next) => {
  console.error('❌ 错误:', err)
  console.error('错误堆栈:', err.stack)
  // Vercel 会自动收集这些日志
}
```

### 5. 健康检查

定期访问: `https://your-domain.com/api/health`

**正常响应**:

```json
{
  "status": "ok",
  "environment": {
    "nodeEnv": "production",
    "isVercel": true,
    "hasDatabase": true,
    "hasJwtSecret": true
  }
}
```

## 🔄 重新部署

### 触发重新部署

1. **Git Push**（推荐）

   ```bash
   git commit --allow-empty -m "redeploy"
   git push origin main
   ```

2. **Vercel Dashboard**

   ```
   Deployments → ⋯ → Redeploy
   勾选: Use existing Build Cache
   ```

3. **Vercel CLI**
   ```bash
   vercel --prod --force
   ```

## 📚 相关文档

- [API_DEPLOYMENT_SOLUTION.md](./API_DEPLOYMENT_SOLUTION.md) - API 部署详细方案
- [apps/server/ENV_VARIABLES_VERCEL.md](./apps/server/ENV_VARIABLES_VERCEL.md) - 环境变量配置指南
- [需求文档-07-部署运维方案.md](./需求文档-07-部署运维方案.md) - 部署运维方案

## ✅ 部署检查清单

部署前检查:

- [ ] 数据库已创建
- [ ] 环境变量已配置
- [ ] `vercel.json` 配置正确
- [ ] `api/package.json` 包含所有依赖
- [ ] `pnpm-workspace.yaml` 包含 `api`
- [ ] `.vercelignore` 不排除 `api/`
- [ ] Prisma 迁移文件存在

部署后验证:

- [ ] `/api/health` 返回正常
- [ ] 前台首页可访问
- [ ] 管理后台登录成功（admin/admin123）
- [ ] API 请求正常工作
- [ ] 查看部署日志无错误

## 🎯 部署成功标志

当你看到以下响应时，说明部署完全成功：

```json
// GET https://your-domain.com/api/health
{
  "status": "ok",
  "timestamp": "2025-12-01T08:27:22.989Z",
  "version": "1.0.1",
  "environment": {
    "nodeEnv": "production",
    "isVercel": true,
    "hasDatabase": true,
    "hasJwtSecret": true
  },
  "cors": {
    "allowedOrigins": [
      "https://hi-ultra.com",
      "https://www.hi-ultra.com",
      "https://cosmetic-ve.vercel.app"
    ]
  }
}
```

**🎉 恭喜！你的全栈应用已成功部署到 Vercel！**
