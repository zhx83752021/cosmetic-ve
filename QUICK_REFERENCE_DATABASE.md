# 🔍 数据库问题快速参考

## 一分钟诊断

### 在线诊断（推荐）

```
https://cosmetic-ve-server.vercel.app/api/diagnostic
```

### 本地诊断

```powershell
cd e:\site2\apps\server
pnpm run check-db
```

---

## 常用命令

| 命令                              | 用途               | 时间 |
| --------------------------------- | ------------------ | ---- |
| `pnpm run check-db`               | 检查数据库状态     | 10秒 |
| `pnpm run create-admin`           | 生成管理员 SQL     | 5秒  |
| `pnpm prisma migrate deploy`      | 执行数据库迁移     | 30秒 |
| `pnpm run prisma:studio`          | 打开数据库管理界面 | 10秒 |
| `vercel env pull .env.production` | 拉取生产环境变量   | 5秒  |

---

## 问题速查表

| 错误现象              | 可能原因              | 快速解决                                                  |
| --------------------- | --------------------- | --------------------------------------------------------- |
| 🔴 数据库操作失败     | `DATABASE_URL` 未配置 | [配置指南](./VERCEL_DATABASE_SETUP.md#步骤3-配置环境变量) |
| 🔴 Request 400        | 数据库表不存在        | `pnpm prisma migrate deploy`                              |
| 🔴 账号或密码错误     | 没有管理员账号        | `pnpm run create-admin`                                   |
| 🟡 Connection timeout | 数据库不可访问        | 检查 Vercel Postgres 状态                                 |
| 🟡 环境变量不生效     | 未重新部署            | Vercel → Redeploy                                         |

---

## 紧急修复 3 步骤

### 1️⃣ 配置数据库（5分钟）

```
Vercel Dashboard
→ Storage
→ Create Database (Postgres)
→ Connect to cosmetic-ve-server
```

### 2️⃣ 初始化（5分钟）

```powershell
cd e:\site2\apps\server
vercel env pull .env.production
pnpm prisma migrate deploy
pnpm run create-admin
```

### 3️⃣ 部署（2分钟）

```
Vercel Dashboard
→ cosmetic-ve-server
→ Deployments
→ Redeploy
```

---

## 默认管理员账号

```
用户名: admin
密码: 123456
手机: 13800138000
邮箱: admin@cosmetic.com
```

⚠️ **首次登录后请立即修改密码！**

---

## 环境变量速查

### 必需变量

| 变量名           | 示例值                           | 获取方式                   |
| ---------------- | -------------------------------- | -------------------------- |
| `DATABASE_URL`   | `postgresql://...`               | 复制 `POSTGRES_PRISMA_URL` |
| `JWT_SECRET`     | `your-secret-32-chars-min`       | 自定义（至少32位）         |
| `JWT_EXPIRES_IN` | `7d`                             | 自定义                     |
| `CORS_ORIGINS`   | `https://cosmetic-ve.vercel.app` | 前端域名                   |
| `NODE_ENV`       | `production`                     | 固定值                     |

### 配置位置

```
Vercel Dashboard
→ cosmetic-ve-server 项目
→ Settings
→ Environment Variables
```

---

## 健康检查

### 后端 API

```bash
curl https://cosmetic-ve-server.vercel.app/health
```

✅ 正常响应：

```json
{
  "status": "ok",
  "timestamp": "2024-11-27T..."
}
```

### 前端登录

```
https://cosmetic-ve.vercel.app/admin/login
```

✅ 正常：显示登录表单，无错误提示

---

## 数据库 SQL 常用查询

### 检查表

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### 检查管理员

```sql
SELECT id, username, email, role, status
FROM users
WHERE role = 'admin';
```

### 创建管理员（紧急）

```sql
INSERT INTO users (username, email, phone, password, nickname, role, status, "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@cosmetic.com',
  '13800138000',
  '$2a$10$YourHashedPasswordHere',
  '系统管理员',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

> ⚠️ 密码 hash 需要使用 `pnpm run create-admin` 生成

---

## 完整文档

| 文档                                                       | 用途              |
| ---------------------------------------------------------- | ----------------- |
| [QUICK_FIX_DATABASE_400.md](./QUICK_FIX_DATABASE_400.md)   | ⚡ 15分钟快速修复 |
| [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md)     | 📖 详细配置指南   |
| [TROUBLESHOOTING_SUMMARY.md](./TROUBLESHOOTING_SUMMARY.md) | 📋 完整故障排查   |
| [VERCEL_DUAL_DEPLOYMENT.md](./VERCEL_DUAL_DEPLOYMENT.md)   | 🚀 部署架构指南   |

---

**保持此文档可见**
建议打印或保存到常用位置
