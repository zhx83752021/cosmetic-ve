# 🚨 快速修复：登录页面 400 错误

## 问题

访问 https://cosmetic-ve.vercel.app/admin/login 报错：

- ❌ 数据库操作失败
- ❌ Request failed with status code 400

## 根本原因

**Vercel 后端项目缺少数据库配置**

---

## ⚡ 快速修复步骤（15分钟）

### 步骤1: 创建 Vercel Postgres 数据库（3分钟）

1. 访问 https://vercel.com/dashboard
2. 点击顶部 **Storage** → **Create Database**
3. 选择 **Postgres**
4. 配置：
   - Name: `cosmetics-db`
   - Region: `Hong Kong (hkg1)` 或最近的区域
5. 点击 **Create**

### 步骤2: 连接数据库到项目（1分钟）

1. 在数据库页面点击 **Connect Project**
2. 选择项目：`cosmetic-ve-server`
3. 环境选择：**Production** (必选)
4. 点击 **Connect**

### 步骤3: 配置环境变量（2分钟）

1. 进入 `cosmetic-ve-server` 项目
2. Settings → Environment Variables
3. 添加以下变量（如果不存在）：

```env
DATABASE_URL=<复制 POSTGRES_PRISMA_URL 的值>
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGINS=https://cosmetic-ve.vercel.app
```

> ⚠️ **重要**：`DATABASE_URL` 的值必须使用 `POSTGRES_PRISMA_URL`，不是 `POSTGRES_URL`

### 步骤4: 初始化数据库（5分钟）

**选项A：在本地执行（推荐）**

```powershell
# 进入 server 目录
cd e:\site2\apps\server

# 拉取生产环境变量
vercel env pull .env.production

# 执行数据库迁移
pnpm prisma migrate deploy
```

**选项B：在 Vercel 控制台执行**

1. 进入 Vercel Dashboard → Storage → 你的数据库
2. 点击 **Data** → **Query**
3. 打开本地文件：`e:\site2\apps\server\prisma\migrations\20251121080256_init\migration.sql`
4. 复制全部内容到 Query 框
5. 点击 **Run Query**

### 步骤5: 创建管理员账号（3分钟）

**在本地生成 SQL**

```powershell
cd e:\site2\apps\server
pnpm run create-admin
```

这会生成类似以下的 SQL：

```sql
INSERT INTO users (username, email, phone, password, nickname, role, status, "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@cosmetic.com',
  '13800138000',
  '$2a$10$xxx...xxx',  -- 已加密的密码
  '系统管理员',
  'admin',
  'active',
  NOW(),
  NOW()
);
```

**执行 SQL**

1. 复制上面生成的 SQL
2. 进入 Vercel Postgres → Query 标签
3. 粘贴并执行

### 步骤6: 重新部署后端（1分钟）

1. 进入 Vercel Dashboard → `cosmetic-ve-server`
2. Deployments → 最新部署 → **···** → **Redeploy**
3. 等待部署完成（约30秒）

---

## ✅ 验证修复

### 1. 测试后端 API

```bash
curl https://cosmetic-ve-server.vercel.app/health
```

应该返回：

```json
{
  "status": "ok",
  "timestamp": "2024-11-27T..."
}
```

### 2. 测试登录

访问：https://cosmetic-ve.vercel.app/admin/login

使用账号：

- **用户名**：`admin`
- **密码**：`123456`

如果能成功登录，问题解决！✅

---

## 🔧 如果还是不行

### 检查1: 确认环境变量

```powershell
cd e:\site2\apps\server
vercel env ls --environment production
```

确保包含：

- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGINS`

### 检查2: 查看 Function Logs

1. Vercel Dashboard → `cosmetic-ve-server`
2. Deployments → 最新部署
3. 点击 **View Function Logs**
4. 查看是否有数据库连接错误

### 检查3: 测试数据库连接

在 Vercel Postgres Query 中执行：

```sql
-- 检查是否有表
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 检查是否有管理员用户
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

### 常见错误及解决

| 错误信息               | 原因         | 解决方法                       |
| ---------------------- | ------------ | ------------------------------ |
| Connection timeout     | 数据库未启动 | 检查 Vercel Postgres 状态      |
| Invalid `DATABASE_URL` | 环境变量错误 | 重新复制 `POSTGRES_PRISMA_URL` |
| Table does not exist   | 未执行迁移   | 重新执行步骤4                  |
| 账号或密码错误         | 管理员未创建 | 重新执行步骤5                  |
| 环境变量不生效         | 未重新部署   | 重新执行步骤6                  |

---

## 📞 需要详细指导？

查看完整文档：

- **数据库配置详细指南**：`VERCEL_DATABASE_SETUP.md`
- **Vercel 双项目部署指南**：`VERCEL_DUAL_DEPLOYMENT.md`

---

**最后更新**：2024-11-27
**预计修复时间**：15分钟
**难度**：⭐⭐☆☆☆ (简单)
