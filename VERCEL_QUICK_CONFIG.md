# Vercel 配置快速参考卡 🚀

> 在配置 Vercel 项目时打开此文档，直接复制粘贴配置

---

## 🎨 前端项目：cosmetic-ve

### Build & Development Settings

```
Framework Preset: Vite (或 Other)
Root Directory: ./
```

### Build Command
```bash
cd apps/web && pnpm run build
```

### Output Directory
```
apps/web/dist
```

### Install Command
```bash
pnpm install
```

### Environment Variables

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_BASE_URL=/
```

⚠️ **部署后更新**：将 `your-backend.vercel.app` 替换为实际的后端域名

---

## ⚙️ 后端项目：cosmetic-ve-server

### Build & Development Settings

```
Framework Preset: Other
Root Directory: apps/server
```

### Build Command
```bash
pnpm run vercel-build
```

### Output Directory
```
dist
```

### Install Command ⚠️ **关键**
```bash
cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate
```

### Environment Variables

```env
# 基础配置
NODE_ENV=production
PORT=3001

# 数据库连接（必需）
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# JWT 配置（必需）
JWT_SECRET=your-secure-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d

# CORS 白名单（必需）
CORS_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app

# Redis（可选）
REDIS_URL=redis://user:password@host:6379

# Vercel Blob（可选）
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

⚠️ **部署前准备**：
1. 创建数据库并获取连接字符串
2. 生成安全的 JWT_SECRET：`openssl rand -base64 32`
3. 部署后将 `your-frontend.vercel.app` 替换为实际的前端域名

---

## 📋 部署前检查清单

### 数据库准备
- [ ] 数据库已创建（Vercel Postgres / Supabase / PlanetScale）
- [ ] 获取 DATABASE_URL
- [ ] 数据库允许来自 Vercel 的连接

### 执行数据库迁移
```bash
cd apps/server
DATABASE_URL="your-production-url" pnpm prisma migrate deploy
```

### 生成 JWT 密钥
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 🔄 部署顺序

1. **部署后端** → 记录域名（例如：`https://cosmetic-ve-server.vercel.app`）
2. **测试后端** → `curl https://your-backend.vercel.app/health`
3. **部署前端** → 使用后端域名配置 `VITE_API_BASE_URL`
4. **更新 CORS** → 在后端环境变量中添加前端域名
5. **重新部署后端** → 使 CORS 配置生效
6. **验证功能** → 测试前后端通信

---

## ⚡ 快速命令

### 本地测试
```bash
# 启动后端
cd apps/server
pnpm dev

# 启动前端（新终端）
cd apps/web
pnpm dev
```

### 验证部署
```bash
# 测试后端健康检查
curl https://your-backend.vercel.app/health

# 测试 CORS
curl -H "Origin: https://your-frontend.vercel.app" \
     -X OPTIONS \
     https://your-backend.vercel.app/api/auth/login \
     -v
```

### 检查配置
```bash
# Windows
.\check-deployment-config.bat
```

---

## 🚨 常见错误快速修复

### Error: "Cannot find module 'pnpm-workspace.yaml'"
✅ **修复**：确认后端 Install Command 包含 `cd ../..`

### Error: "Prisma Client not generated"
✅ **修复**：确认 Install Command 最后包含 `pnpm run prisma:generate`

### Error: "CORS blocked"
✅ **修复**：
1. 检查后端 `CORS_ORIGINS` 环境变量
2. 确认包含前端域名
3. 重新部署后端

### Error: "Database connection failed"
✅ **修复**：
1. 检查 DATABASE_URL 格式
2. 确认数据库防火墙配置
3. 添加 `?sslmode=require` 参数（PostgreSQL）

### Error: "环境变量不生效"
✅ **修复**：修改环境变量后必须 Redeploy

---

## 📞 快速链接

- [详细配置指南](./VERCEL_DEPLOYMENT_CONFIG.md)
- [问题排查文档](./DEPLOYMENT_ISSUES_AND_FIXES.md)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel 文档](https://vercel.com/docs)

---

## 💾 保存此页面

建议将此文档加入浏览器书签，配置 Vercel 时随时参考！
