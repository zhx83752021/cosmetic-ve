# 🔍 500 错误诊断指南

## 问题现象

访问 https://cosmetic-ve.vercel.app/admin/login 显示：

- 🔴 服务器错误
- 🔴 Request failed with status code 500

---

## 立即诊断（1分钟）

我已经为你创建了一个诊断接口，可以快速定位问题：

### 访问诊断接口

```
https://cosmetic-ve-server.vercel.app/api/diagnostic
```

或者使用 curl：

```bash
curl https://cosmetic-ve-server.vercel.app/api/diagnostic
```

### 诊断结果解读

#### ✅ 正常响应示例

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-11-27T01:30:00.000Z",
    "environment": "production",
    "checks": {
      "env": {
        "DATABASE_URL": "✅ 已配置",
        "JWT_SECRET": "✅ 已配置",
        "CORS_ORIGINS": "https://cosmetic-ve.vercel.app",
        "NODE_ENV": "production"
      },
      "database": {
        "status": "✅ 连接成功",
        "connected": true
      },
      "tables": {
        "status": "✅ 表已创建",
        "count": 11,
        "tables": ["users", "products", "orders", ...]
      },
      "admin": {
        "status": "✅ 管理员已存在",
        "count": 1
      }
    },
    "overall": "✅ 系统正常"
  }
}
```

#### ❌ 异常响应示例

```json
{
  "success": false,
  "data": {
    "timestamp": "2024-11-27T01:30:00.000Z",
    "environment": "production",
    "checks": {
      "env": {
        "DATABASE_URL": "❌ 未配置",  ← 问题在这里
        "JWT_SECRET": "✅ 已配置",
        "CORS_ORIGINS": "❌ 未配置",
        "NODE_ENV": "production"
      },
      "database": {
        "status": "❌ 连接失败",
        "connected": false,
        "error": "Can't reach database server"  ← 具体错误
      },
      "tables": {
        "status": "❌ 无法查询表",
        "count": 0,
        "error": "..."
      },
      "admin": {
        "status": "❌ 无法查询管理员",
        "count": 0,
        "error": "..."
      }
    },
    "overall": "❌ 系统异常"
  }
}
```

---

## 根据诊断结果修复

### 场景 1: DATABASE_URL 未配置

**诊断结果**：

```json
{
  "env": {
    "DATABASE_URL": "❌ 未配置"
  },
  "database": {
    "status": "❌ 连接失败"
  }
}
```

**修复方法**：

1. **创建 Vercel Postgres 数据库**

   ```
   Vercel Dashboard → Storage → Create Database → Postgres
   ```

2. **连接数据库到项目**

   ```
   Connect Project → 选择 cosmetic-ve-server
   ```

3. **配置环境变量**

   ```
   Settings → Environment Variables
   DATABASE_URL = <复制 POSTGRES_PRISMA_URL 的值>
   ```

4. **重新部署**
   ```
   Deployments → Redeploy
   ```

**详细步骤**：查看 [QUICK_FIX_DATABASE_400.md](./QUICK_FIX_DATABASE_400.md)

---

### 场景 2: 数据库连接成功但表不存在

**诊断结果**：

```json
{
  "database": {
    "status": "✅ 连接成功",
    "connected": true
  },
  "tables": {
    "status": "❌ 表不存在",
    "count": 0
  }
}
```

**修复方法**：

```powershell
# 在本地执行数据库迁移
cd e:\site2\apps\server
vercel env pull .env.production
pnpm prisma migrate deploy
```

**或者在 Vercel Postgres Web Console 执行**：

1. Vercel Dashboard → Storage → 你的数据库 → Query
2. 复制 `apps/server/prisma/migrations/20251121080256_init/migration.sql` 内容
3. 粘贴并执行

---

### 场景 3: 表存在但没有管理员账号

**诊断结果**：

```json
{
  "tables": {
    "status": "✅ 表已创建",
    "count": 11
  },
  "admin": {
    "status": "❌ 无管理员账号",
    "count": 0
  }
}
```

**修复方法**：

```powershell
cd e:\site2\apps\server
pnpm run create-admin
```

然后将生成的 SQL 在 Vercel Postgres Query 中执行。

---

### 场景 4: JWT_SECRET 未配置

**诊断结果**：

```json
{
  "env": {
    "JWT_SECRET": "❌ 未配置"
  }
}
```

**修复方法**：

```
Vercel Dashboard → cosmetic-ve-server
→ Settings → Environment Variables
→ 添加：
   JWT_SECRET = your-super-secret-jwt-key-at-least-32-characters-long
   JWT_EXPIRES_IN = 7d
```

然后重新部署。

---

### 场景 5: CORS_ORIGINS 未配置

**诊断结果**：

```json
{
  "env": {
    "CORS_ORIGINS": "❌ 未配置"
  }
}
```

**修复方法**：

```
Vercel Dashboard → cosmetic-ve-server
→ Settings → Environment Variables
→ 添加：
   CORS_ORIGINS = https://cosmetic-ve.vercel.app
```

如果有多个前端域名，用逗号分隔：

```
CORS_ORIGINS = https://cosmetic-ve.vercel.app,https://admin.example.com
```

---

## 完整修复流程

如果诊断接口显示多个问题，按以下顺序修复：

### 第 1 步：配置所有必需的环境变量

进入 Vercel Dashboard → cosmetic-ve-server → Settings → Environment Variables

添加以下变量（如果缺失）：

```env
DATABASE_URL=<POSTGRES_PRISMA_URL的值>
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGINS=https://cosmetic-ve.vercel.app
```

### 第 2 步：初始化数据库

```powershell
cd e:\site2\apps\server
vercel env pull .env.production
pnpm prisma migrate deploy
```

### 第 3 步：创建管理员账号

```powershell
pnpm run create-admin
# 复制生成的 SQL
# 在 Vercel Postgres Query 中执行
```

### 第 4 步：重新部署

```
Vercel Dashboard → cosmetic-ve-server → Deployments → Redeploy
```

### 第 5 步：验证修复

**再次访问诊断接口**：

```
https://cosmetic-ve-server.vercel.app/api/diagnostic
```

**预期结果**：

```json
{
  "success": true,
  "data": {
    "overall": "✅ 系统正常"
  }
}
```

**测试登录**：

```
https://cosmetic-ve.vercel.app/admin/login
```

---

## 诊断接口返回错误

如果诊断接口本身也返回 500 错误，说明问题很严重，通常是：

### 1. Prisma Client 未生成

**解决**：检查 Vercel 构建日志

```
Deployments → 最新部署 → Build Logs
```

查找是否有 `prisma generate` 执行成功。

如果没有，修改 `vercel.json`：

```json
{
  "installCommand": "cd ../.. && pnpm install && cd apps/server && pnpm run prisma:generate"
}
```

### 2. 数据库完全无法连接

**解决**：

1. 检查 `DATABASE_URL` 格式是否正确
2. 检查数据库是否在运行
3. 检查防火墙规则

**测试连接**（在本地）：

```powershell
cd e:\site2\apps\server
vercel env pull .env.production

# 使用 check-db 脚本
pnpm run check-db
```

---

## 快速参考

| 问题                   | 快速修复                     | 文档                                                         |
| ---------------------- | ---------------------------- | ------------------------------------------------------------ |
| 🔴 DATABASE_URL 未配置 | 创建 Vercel Postgres         | [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md)       |
| 🔴 表不存在            | `pnpm prisma migrate deploy` | [QUICK_FIX_DATABASE_400.md](./QUICK_FIX_DATABASE_400.md)     |
| 🔴 无管理员账号        | `pnpm run create-admin`      | [QUICK_REFERENCE_DATABASE.md](./QUICK_REFERENCE_DATABASE.md) |
| 🔴 环境变量未配置      | Vercel → Settings → Env Vars | [VERCEL_DUAL_DEPLOYMENT.md](./VERCEL_DUAL_DEPLOYMENT.md)     |

---

## 本地调试

如果需要在本地调试后端：

```powershell
cd e:\site2\apps\server

# 拉取生产环境变量
vercel env pull .env.production

# 启动本地开发服务器
pnpm run dev

# 访问
http://localhost:3001/api/diagnostic
http://localhost:3001/health
```

---

## 需要帮助？

1. **立即诊断**：https://cosmetic-ve-server.vercel.app/api/diagnostic
2. **查看日志**：Vercel Dashboard → Deployments → Function Logs
3. **快速修复**：[QUICK_FIX_DATABASE_400.md](./QUICK_FIX_DATABASE_400.md)
4. **完整指南**：[VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md)

---

**最后更新**：2024-11-27
**预计诊断时间**：1分钟
**预计修复时间**：15分钟
