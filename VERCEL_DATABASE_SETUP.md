# Vercel 数据库配置指南

## 问题描述

访问 https://cosmetic-ve.vercel.app/admin/login 时出现：

- ❌ 数据库操作失败
- ❌ Request failed with status code 400

## 根本原因

Vercel 后端项目（cosmetic-ve-server）缺少数据库配置，导致无法连接数据库。

---

## 解决步骤

### 方案一：使用 Vercel Postgres（推荐）

#### 1. 创建 Vercel Postgres 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击顶部导航 **Storage** 标签
3. 点击 **Create Database**
4. 选择 **Postgres**
5. 填写配置：
   - Database Name: `cosmetics-db`（或自定义名称）
   - Region: 选择离用户最近的区域（建议：Hong Kong）
   - Plan: 选择 Free 或 Pro
6. 点击 **Create**

#### 2. 连接数据库到项目

1. 在数据库创建页面，点击 **Connect Project**
2. 选择你的后端项目：`cosmetic-ve-server`
3. 选择环境：**Production**, **Preview**, **Development**（全选）
4. 点击 **Connect**

> ✅ Vercel 会自动添加以下环境变量到你的项目：
>
> - `POSTGRES_URL`
> - `POSTGRES_PRISMA_URL`
> - `POSTGRES_URL_NON_POOLING`
>
> 我们需要使用 `POSTGRES_PRISMA_URL`

#### 3. 配置环境变量

1. 进入后端项目：`cosmetic-ve-server`
2. Settings → Environment Variables
3. 添加/修改以下变量：

| 变量名           | 值                                       | 说明                 |
| ---------------- | ---------------------------------------- | -------------------- |
| `DATABASE_URL`   | 复制 `POSTGRES_PRISMA_URL` 的值          | Prisma 数据库连接    |
| `JWT_SECRET`     | `your-super-secret-jwt-key-min-32-chars` | JWT 密钥（至少32位） |
| `JWT_EXPIRES_IN` | `7d`                                     | Token 过期时间       |
| `NODE_ENV`       | `production`                             | 环境标识             |
| `CORS_ORIGINS`   | `https://cosmetic-ve.vercel.app`         | 前端域名             |

> ⚠️ **重要**：确保 `DATABASE_URL` 使用 `POSTGRES_PRISMA_URL` 的值，而不是 `POSTGRES_URL`

#### 4. 初始化数据库表结构

由于 Vercel Serverless 环境不适合直接运行迁移，我们需要在本地执行：

**方式1：使用本地终端**

```powershell
# 1. 拉取生产环境变量
cd e:\site2\apps\server
vercel env pull .env.production

# 2. 执行数据库迁移
pnpm prisma migrate deploy

# 3. 生成初始数据（可选）
pnpm run seed
```

**方式2：使用 Vercel Postgres Web Console**

1. 进入 Vercel Dashboard → Storage → 你的数据库
2. 点击 **Query** 标签
3. 复制并执行 `apps/server/prisma/migrations/20251121080256_init/migration.sql` 的内容

#### 5. 创建管理员账号

在数据库 Query 页面执行以下 SQL（需要先完成表结构初始化）：

```sql
-- 创建管理员账号（密码：123456）
-- 注意：密码已使用 bcrypt 加密
INSERT INTO users (username, email, phone, password, nickname, role, status, "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@cosmetic.com',
  '13800138000',
  '$2b$10$YourBcryptHashedPasswordHere',
  '系统管理员',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

> ⚠️ **注意**：上面的密码 hash 是示例，实际需要先在本地生成正确的 bcrypt hash

**生成密码 hash（在本地执行）**：

```powershell
# 进入 server 目录
cd e:\site2\apps\server

# 使用 Node.js 生成密码 hash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('123456', 10));"
```

将输出的 hash 值替换上面 SQL 中的 `$2b$10$YourBcryptHashedPasswordHere`

#### 6. 重新部署后端项目

1. 进入 Vercel Dashboard → cosmetic-ve-server 项目
2. 点击 **Deployments** 标签
3. 找到最新的部署，点击右侧的 **···** 菜单
4. 选择 **Redeploy**
5. 勾选 **Use existing Build Cache**
6. 点击 **Redeploy**

#### 7. 验证修复

访问后端健康检查接口：

```bash
curl https://cosmetic-ve-server.vercel.app/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2024-11-27T01:09:00.000Z"
}
```

然后访问前端登录页面：
https://cosmetic-ve.vercel.app/admin/login

使用以下账号登录：

- 账号：`admin`
- 密码：`123456`

---

### 方案二：使用其他云数据库

如果不想使用 Vercel Postgres，可以选择以下云数据库服务：

#### 推荐数据库服务

1. **Neon** (推荐)
   - 免费额度：500MB
   - 网站：https://neon.tech
   - 特点：Serverless Postgres，启动快

2. **Supabase**
   - 免费额度：500MB
   - 网站：https://supabase.com
   - 特点：提供 Auth、Storage 等额外功能

3. **Railway**
   - 免费额度：512MB
   - 网站：https://railway.app
   - 特点：易于使用，支持多种数据库

#### 配置步骤（以 Neon 为例）

1. 注册并创建数据库
2. 获取连接字符串（Pooled connection）
3. 在 Vercel 后端项目配置 `DATABASE_URL` 环境变量
4. 执行数据库迁移（参考方案一的第4步）
5. 创建管理员账号（参考方案一的第5步）
6. 重新部署

---

## 常见问题

### Q1: 执行迁移时报错 "Connection timeout"

**原因**：数据库不允许来自你的 IP 访问

**解决**：

1. 进入数据库控制台
2. 设置防火墙规则，允许所有 IP（`0.0.0.0/0`）
3. 或添加你当前的 IP 地址

### Q2: 登录时显示 "账号或密码错误"

**原因**：管理员账号未创建或密码 hash 不正确

**解决**：

1. 检查数据库中是否有 admin 用户
2. 确认密码 hash 是使用 bcrypt 生成的
3. 重新执行创建管理员账号的 SQL

### Q3: 修改环境变量后仍然报错

**原因**：环境变量修改后需要重新部署

**解决**：

1. 每次修改环境变量后必须 **Redeploy** 项目
2. 等待部署完成后再测试

### Q4: 数据库迁移失败

**原因**：本地 .env.production 文件没有正确的 DATABASE_URL

**解决**：

```powershell
# 重新拉取环境变量
cd e:\site2\apps\server
vercel env pull .env.production --force

# 检查 .env.production 文件内容
cat .env.production

# 重新执行迁移
pnpm prisma migrate deploy
```

---

## 验证清单

完成以下步骤后，问题应该解决：

- [ ] Vercel Postgres 数据库已创建
- [ ] 数据库已连接到后端项目
- [ ] `DATABASE_URL` 环境变量已配置
- [ ] `JWT_SECRET` 环境变量已配置
- [ ] 数据库表结构已初始化
- [ ] 管理员账号已创建
- [ ] 后端项目已重新部署
- [ ] 健康检查接口返回正常
- [ ] 登录页面不再报错
- [ ] 可以使用 admin 账号登录

---

## 下一步建议

### 1. 安全加固

- 修改默认管理员密码
- 使用强密码策略
- 定期更换 JWT_SECRET

### 2. 数据备份

配置 Vercel Postgres 自动备份：

1. 进入数据库设置
2. 启用 Point-in-time Recovery
3. 设置备份保留时间

### 3. 监控告警

启用 Vercel 监控：

1. Settings → Integrations
2. 添加 Sentry 或 Datadog
3. 配置错误告警通知

---

## 需要帮助？

如果问题仍未解决：

1. 查看 Vercel Function Logs：
   - Deployments → 点击具体部署 → Runtime Logs

2. 检查数据库连接：
   - 在 Vercel 后端项目中添加调试日志

3. 联系技术支持：
   - Vercel: https://vercel.com/support
   - 项目 GitHub Issues

---

最后更新：2024-11-27
