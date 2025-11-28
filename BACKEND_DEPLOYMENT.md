# 后端 API 部署指南

## 📋 准备工作

### 1. 数据库准备

后端需要 PostgreSQL 数据库。推荐使用：

- **Vercel Postgres**（推荐，与 Vercel 集成最好）
- **Supabase**（免费额度大）
- **Railway**
- **Neon**

### 2. 环境变量配置

部署前需要准备以下环境变量：

```env
# 数据库连接（PostgreSQL）
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT密钥（生成随机字符串）
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Node环境
NODE_ENV="production"

# Redis（可选，用于缓存）
REDIS_URL="redis://..."
```

---

## 🚀 方式一：Vercel 部署（推荐）

### 步骤 1：登录 Vercel

访问：https://vercel.com/login

### 步骤 2：导入后端项目

1. 点击 **Add New...** → **Project**
2. 选择 GitHub 仓库 `cosmetic-ve`
3. **Root Directory** 设置为：`apps/server`
4. **Framework Preset** 选择：`Other`

### 步骤 3：配置构建设置

- **Build Command**: `pnpm run vercel-build`
- **Output Directory**: （留空）
- **Install Command**: `npm install -g pnpm@8.12.1 && pnpm install`

### 步骤 4：配置环境变量

在 **Environment Variables** 中添加：

| 变量名               | 值                    |
| -------------------- | --------------------- |
| `DATABASE_URL`       | PostgreSQL 连接字符串 |
| `JWT_SECRET`         | 随机生成的密钥        |
| `JWT_REFRESH_SECRET` | 随机生成的密钥        |
| `NODE_ENV`           | `production`          |

### 步骤 5：部署

点击 **Deploy** 开始部署

### 步骤 6：获取 API 地址

部署成功后，你会得到一个 Vercel 域名，例如：

```
https://cosmetic-ve-api.vercel.app
```

### 步骤 7：配置自定义域名（可选）

1. 在 Vercel 项目设置中点击 **Domains**
2. 添加自定义域名：`api.hi-ultra.com`
3. 按照提示添加 DNS 记录（CNAME）

---

## 🔧 配置前端 API 地址

部署后端成功后，更新前端配置：

### 1. 修改环境变量

编辑 `apps/web/.env.production`：

```env
VITE_API_BASE_URL=https://your-backend-domain.vercel.app/api
```

将 `your-backend-domain` 替换为实际的后端域名。

### 2. 重新部署前端

```bash
git add apps/web/.env.production
git commit -m "fix: 更新生产环境 API 地址"
git push origin main
```

---

## 🗄️ 数据库初始化

### 使用 Vercel Postgres

1. 在 Vercel 项目中，进入 **Storage** 标签
2. 点击 **Create Database** → 选择 **Postgres**
3. 创建后，自动添加 `DATABASE_URL` 环境变量
4. 在本地运行迁移（需要临时设置环境变量）：

```bash
cd apps/server
DATABASE_URL="你的数据库URL" pnpm prisma migrate deploy
```

5. 创建初始管理员账号：

```bash
DATABASE_URL="你的数据库URL" pnpm run create-admin
```

---

## ✅ 验证部署

部署成功后，访问以下地址测试：

### 1. 健康检查

```
GET https://your-backend-domain.vercel.app/health
```

应返回：

```json
{
  "status": "ok",
  "timestamp": "2024-xx-xx..."
}
```

### 2. API 端点

```
GET https://your-backend-domain.vercel.app/api
```

---

## 🔍 常见问题

### Q1: 数据库连接失败

**解决**：检查 `DATABASE_URL` 环境变量是否正确配置

### Q2: CORS 错误

**解决**：检查 `apps/server/src/index.ts` 中的 CORS 配置是否包含你的前端域名

### Q3: 部署超时

**解决**：Vercel Free Plan 有构建时间限制，考虑优化依赖或升级计划

---

## 📝 重要提示

1. **数据库 URL**：必须是 PostgreSQL，且必须包含 `?schema=public` 参数
2. **JWT 密钥**：生产环境必须使用强随机密钥，不要使用默认值
3. **CORS 配置**：确保前端域名在白名单中
4. **环境隔离**：生产环境变量不要提交到 Git

---

## 🆘 获取帮助

如果遇到问题，可以：

1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 查看后端代码中的 CORS 和路由配置
