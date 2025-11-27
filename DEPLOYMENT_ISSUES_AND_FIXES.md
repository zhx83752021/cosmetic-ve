# Vercel 双项目部署 - 问题总结与修复

## 📊 您当前的部署配置

根据截图分析：

- **前端项目**: cosmetic-ve（从根目录部署）
- **后端项目**: cosmetic-ve-server（从 apps/server 子目录部署）

---

## 🔴 发现的问题及严重程度

### 问题 1：Monorepo 依赖安装配置 ⚠️ **严重**

**问题描述**：
- 项目使用 pnpm workspace monorepo 结构
- 后端项目的 Root Directory 设置为 `apps/server`
- 如果 Install Command 配置不当，将无法访问根目录的 `pnpm-workspace.yaml`
- 导致依赖安装失败或 Prisma Client 生成失败

**影响**：
- ❌ 后端部署失败
- ❌ 无法生成 Prisma Client
- ❌ 构建过程中断

**解决方案**：

后端 Vercel 项目必须使用以下 Install Command：

```bash
cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate
```

**配置位置**：Vercel Dashboard → 后端项目 → Settings → General → Install Command

**验证方法**：
```bash
# 查看 Vercel 部署日志 Build Logs
# 应该看到：
# Installing dependencies...
# ✓ Dependencies installed successfully
# ✓ Running prisma generate
# ✓ Generated Prisma Client
```

---

### 问题 2：数据库迁移在构建时执行 ⚠️ **高风险** ✅ **已修复**

**问题描述**：
- 原 `vercel-build` 脚本包含 `prisma migrate deploy`
- Vercel Serverless 环境会启动多个函数实例
- 多个实例同时执行数据库迁移会导致冲突

**影响**：
- ❌ 数据库锁竞争
- ❌ 迁移冲突导致部署失败
- ❌ 可能造成数据损坏

**已修复**：

已将 `apps/server/package.json` 的 `vercel-build` 修改为：

```json
"vercel-build": "prisma generate && tsc"
```

**正确的数据库迁移流程**：

#### 方法 1：本地执行（推荐）

```bash
# 在部署到 Vercel 之前，先在本地连接生产数据库执行迁移
cd apps/server
DATABASE_URL="your-production-database-url" pnpm prisma migrate deploy
```

#### 方法 2：使用 Vercel CLI

```bash
# 1. 拉取生产环境变量
vercel env pull .env.production --environment=production

# 2. 执行迁移
cd apps/server
pnpm prisma migrate deploy

# 3. 部署代码
vercel deploy --prod
```

---

### 问题 3：环境变量配置可能不完整 ⚠️ **中等**

**问题描述**：
- 前后端需要正确配置环境变量才能通信
- CORS 配置必须包含正确的前端域名
- 前端需要正确的后端 API 地址

**必需的环境变量**：

#### 前端项目 (cosmetic-ve)

```env
# Vercel Dashboard → 前端项目 → Settings → Environment Variables

VITE_API_BASE_URL=https://cosmetic-ve-server.vercel.app/api
VITE_BASE_URL=/
```

⚠️ **注意**：`VITE_API_BASE_URL` 必须使用后端的实际域名，部署后端后需要更新此值。

#### 后端项目 (cosmetic-ve-server)

```env
# Vercel Dashboard → 后端项目 → Settings → Environment Variables

# 基础配置
NODE_ENV=production
PORT=3001

# 数据库（必需）
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# JWT 配置（必需）
JWT_SECRET=your-super-secure-random-string-at-least-32-characters
JWT_EXPIRES_IN=7d

# CORS 白名单（必需）- 注意是复数 ORIGINS
CORS_ORIGINS=https://cosmetic-ve.vercel.app,https://www.cosmetic-ve.vercel.app

# Redis（可选）
REDIS_URL=redis://username:password@host:6379

# Vercel Blob 存储（可选）
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

**验证 CORS 配置**：
```bash
# 使用 curl 测试 CORS
curl -H "Origin: https://cosmetic-ve.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://cosmetic-ve-server.vercel.app/api/auth/login \
     -v

# 应该返回：
# Access-Control-Allow-Origin: https://cosmetic-ve.vercel.app
# Access-Control-Allow-Credentials: true
```

---

### 问题 4：CORS 环境变量命名 ✅ **已确认正确**

**检查结果**：
- ✅ 代码中使用 `process.env.CORS_ORIGINS`（复数）
- ✅ `.env.example` 中也使用 `CORS_ORIGINS`
- ✅ 命名一致，无问题

**相关代码**：
```typescript
// apps/server/src/index.ts
const corsOrigins = process.env.CORS_ORIGINS
const allowedOrigins = corsOrigins
  ? corsOrigins.split(',').map((o) => o.trim())
  : ['https://cosmetic-ve.vercel.app', 'https://www.cosmetic-ve.vercel.app']
```

---

## ✅ 正确的 Vercel 配置总览

### 前端项目 (cosmetic-ve)

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `cosmetic-ve` |
| **Framework** | `Vite` 或 `Other` |
| **Root Directory** | `./` |
| **Build Command** | `cd apps/web && pnpm run build` |
| **Output Directory** | `apps/web/dist` |
| **Install Command** | `pnpm install` |

### 后端项目 (cosmetic-ve-server)

| 配置项 | 值 |
|--------|-----|
| **Project Name** | `cosmetic-ve-server` |
| **Framework** | `Other` |
| **Root Directory** | `apps/server` ⚠️ |
| **Build Command** | `pnpm run vercel-build` |
| **Output Directory** | `dist` |
| **Install Command** | `cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate` ⚠️ |

---

## 📋 部署步骤（推荐顺序）

### 第一步：准备数据库

```bash
# 1. 在 Vercel 创建 Postgres 数据库
# 或使用其他云数据库服务（如 Supabase, PlanetScale, Railway）

# 2. 获取数据库连接字符串
# 格式: postgresql://user:password@host:5432/database?schema=public
```

### 第二步：执行数据库迁移

```bash
# 本地连接生产数据库执行迁移
cd apps/server
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

### 第三步：部署后端

1. 在 Vercel 创建新项目，导入 Git 仓库
2. 配置项目设置（参考上表）
3. 添加所有必需的环境变量
4. 部署并记录后端域名（例如：`https://cosmetic-ve-server.vercel.app`）
5. 测试健康检查：
   ```bash
   curl https://cosmetic-ve-server.vercel.app/health
   # 应返回: {"status":"ok","timestamp":"..."}
   ```

### 第四步：部署前端

1. 在 Vercel 创建第二个项目，选择同一个仓库
2. 配置项目设置（参考上表）
3. 添加环境变量，使用刚才的后端域名：
   ```env
   VITE_API_BASE_URL=https://cosmetic-ve-server.vercel.app/api
   ```
4. 部署并记录前端域名（例如：`https://cosmetic-ve.vercel.app`）

### 第五步：更新 CORS 配置

1. 回到后端项目 → Settings → Environment Variables
2. 更新 `CORS_ORIGINS`：
   ```env
   CORS_ORIGINS=https://cosmetic-ve.vercel.app,https://www.cosmetic-ve.vercel.app
   ```
3. 在 Deployments 页面点击 **Redeploy**

### 第六步：验证部署

1. 访问前端网站
2. 打开浏览器开发者工具（F12）
3. 尝试登录或注册
4. 检查 Network 面板：
   - ✅ API 请求状态码 200
   - ✅ 无 CORS 错误
   - ✅ 响应数据正常

---

## 🔧 故障排查清单

### 后端部署失败

- [ ] 检查 Build Logs 中的错误信息
- [ ] 确认 Install Command 包含 `cd ../..`
- [ ] 确认所有必需的环境变量已配置
- [ ] 确认 DATABASE_URL 格式正确
- [ ] 确认数据库允许 Vercel IP 访问

### API 请求 CORS 错误

- [ ] 检查后端 `CORS_ORIGINS` 环境变量
- [ ] 确认包含前端的所有可能域名（包括 www）
- [ ] 修改环境变量后是否重新部署了后端
- [ ] 检查 Function Logs 查看 CORS 日志输出

### 数据库连接失败

- [ ] 检查 DATABASE_URL 格式
- [ ] 确认数据库防火墙配置
- [ ] 对于 PostgreSQL，确保 URL 包含 `?sslmode=require`（Vercel Postgres 自动包含）
- [ ] 尝试在本地使用相同的连接字符串测试

### 前端无法访问后端

- [ ] 检查 `VITE_API_BASE_URL` 环境变量
- [ ] 确认后端健康检查接口可访问
- [ ] 检查浏览器控制台的网络请求
- [ ] 确认后端域名拼写正确（包括 /api 路径）

---

## 📚 相关文档

- [VERCEL_DEPLOYMENT_CONFIG.md](./VERCEL_DEPLOYMENT_CONFIG.md) - 详细部署配置指南
- [VERCEL_DUAL_DEPLOYMENT.md](./VERCEL_DUAL_DEPLOYMENT.md) - 双项目部署架构说明
- [check-deployment-config.bat](./check-deployment-config.bat) - 配置检查脚本

---

## 🎯 快速检查命令

运行配置检查脚本：

```bash
# Windows
.\check-deployment-config.bat

# PowerShell
powershell -ExecutionPolicy Bypass -File .\check-deployment-config.bat
```

---

## 💡 最佳实践建议

### 1. 使用自定义域名

```
前端: www.yourdomain.com
后端: api.yourdomain.com
```

配置自定义域名后，相应更新环境变量。

### 2. 启用自动部署

- `main` 分支 → 自动部署到生产环境
- `develop` 分支 → 自动部署到预览环境
- Pull Request → 自动创建预览链接

### 3. 分离数据库迁移

- ✅ 迁移与部署分离
- ✅ 使用 CI/CD 自动化迁移
- ✅ 保留迁移日志

### 4. 监控和告警

- 启用 Vercel Analytics
- 监控 Function Logs
- 设置错误告警

### 5. 环境管理

- 使用 Vercel 的 Production/Preview/Development 环境
- 每个环境使用独立的数据库
- 不要在 Production 环境测试

---

## ✅ 修复总结

### 已完成的修复

1. ✅ 修改 `apps/server/package.json` 的 `vercel-build` 脚本，移除数据库迁移
2. ✅ 创建详细的部署配置文档
3. ✅ 创建配置检查脚本
4. ✅ 验证 CORS 环境变量命名正确

### 需要您操作的配置

1. ⚠️ 确认后端 Vercel 项目的 **Install Command** 设置正确
2. ⚠️ 配置所有必需的环境变量
3. ⚠️ 在部署前手动执行数据库迁移
4. ⚠️ 部署完成后更新前后端的 CORS 和 API 地址配置

---

## 🆘 需要帮助？

如果按照文档操作仍遇到问题：

1. 检查 Vercel 部署日志（Build Logs + Function Logs）
2. 运行配置检查脚本验证配置
3. 查看浏览器控制台的详细错误信息
4. 参考相关文档进行故障排查
