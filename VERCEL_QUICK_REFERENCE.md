# Vercel 部署速查卡

## 🎯 核心要点

> ⚠️ **本项目需要创建 2 个独立的 Vercel Project**

| Project | Root Directory | 用途 |
|---------|---------------|------|
| **前端** | `./` | Vue 3 静态应用 |
| **后端** | `apps/server` | Express API |

---

## 📋 部署清单

### Step 1: 前端项目

- [ ] 在 Vercel 创建新项目，导入 Git 仓库
- [ ] Root Directory: `./`
- [ ] Build Command: `cd apps/web && pnpm run build`
- [ ] Output Directory: `apps/web/dist`
- [ ] Install Command: `pnpm install`
- [ ] 环境变量: `VITE_API_BASE_URL` = `https://your-backend.vercel.app/api`
- [ ] 点击 Deploy

### Step 2: 后端项目

- [ ] 再次创建新项目，导入**同一个仓库**
- [ ] Root Directory: `apps/server` ⚠️ **重要**
- [ ] Build Command: `pnpm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate`
- [ ] 环境变量（见下表）
- [ ] 点击 Deploy

### Step 3: 更新环境变量

- [ ] 复制后端域名，更新前端的 `VITE_API_BASE_URL`
- [ ] 复制前端域名，更新后端的 `CORS_ORIGIN`
- [ ] Redeploy 两个项目

---

## 🔐 环境变量速查

### 前端环境变量

```env
VITE_API_BASE_URL=https://your-backend.vercel.app/api
VITE_BASE_URL=/
```

### 后端环境变量

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secure-random-32-char-string
CORS_ORIGIN=https://your-frontend.vercel.app
REDIS_URL=redis://your-redis-host:6379
```

---

## 🧪 验证测试

### 测试后端 API

```bash
# 健康检查
curl https://your-backend.vercel.app/health

# 预期响应
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 测试前端

1. 访问前端域名
2. 打开开发者工具 → Network
3. 检查 API 请求状态
4. 确认无 CORS 错误

---

## 🐛 常见错误速查

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| **构建失败：找不到 apps/web** | Root Directory 错误 | 前端项目确认 Root 为 `./` |
| **Prisma Client 未生成** | Install Command 缺少 prisma generate | 添加 `&& cd apps/server && pnpm run prisma:generate` |
| **CORS 错误** | 后端未配置前端域名 | 设置 `CORS_ORIGIN` 环境变量 |
| **404 刷新页面** | 缺少 rewrite 配置 | 前端 `vercel.json` 需要 rewrites |
| **环境变量不生效** | 未重新部署 | 修改环境变量后必须 Redeploy |
| **数据库连接失败** | DATABASE_URL 错误 | 检查连接字符串格式和网络访问 |

---

## ⚡ 快速命令

### 检查配置

```bash
check-vercel-config.bat
```

### 本地测试

```bash
# 前端
cd apps/web
pnpm run dev

# 后端
cd apps/server
pnpm run dev
```

### Vercel CLI 部署

```bash
# 安装 CLI
npm i -g vercel

# 部署前端（在根目录）
vercel --prod

# 部署后端（在 apps/server）
cd apps/server
vercel --prod
```

---

## 📞 获取帮助

| 资源 | 链接 |
|------|------|
| **完整部署指南** | [VERCEL_DUAL_DEPLOYMENT.md](./VERCEL_DUAL_DEPLOYMENT.md) |
| **架构说明** | [DEPLOYMENT_ARCHITECTURE.md](./DEPLOYMENT_ARCHITECTURE.md) |
| **Vercel 文档** | https://vercel.com/docs |
| **问题排查** | 查看 Vercel Dashboard → Deployments → Logs |

---

## 💡 Pro Tips

1. **使用 Git 自动部署**（推荐）
   - `main` 分支自动部署到生产环境
   - `develop` 分支自动部署到预览环境

2. **配置自定义域名**
   - 前端: `www.yourdomain.com`
   - 后端: `api.yourdomain.com`

3. **启用 Analytics**
   - Settings → Analytics → 启用

4. **设置预算告警**
   - Settings → Usage → Configure alerts

---

**快速入口**: 打开 [Vercel Dashboard](https://vercel.com/dashboard) 开始部署 🚀
