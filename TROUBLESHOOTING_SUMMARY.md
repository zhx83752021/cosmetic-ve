# 🔧 故障排查总结

## 问题报告

**时间**：2024-11-27
**问题**：https://cosmetic-ve.vercel.app/admin/login 报 400 错误
**错误信息**：

- 数据库操作失败
- Request failed with status code 400

---

## 根本原因

Vercel 后端项目（cosmetic-ve-server）缺少数据库配置，导致：

1. `DATABASE_URL` 环境变量未设置
2. 数据库表结构未初始化
3. 没有管理员账号

---

## 解决方案资源

### 📖 文档资源

| 文档                                                     | 用途            | 预计时间 | 优先级  |
| -------------------------------------------------------- | --------------- | -------- | ------- |
| [QUICK_FIX_DATABASE_400.md](./QUICK_FIX_DATABASE_400.md) | ⚡ 快速修复指南 | 15分钟   | 🔥 高   |
| [VERCEL_DATABASE_SETUP.md](./VERCEL_DATABASE_SETUP.md)   | 📖 详细配置说明 | 30分钟   | ⭐ 推荐 |
| [VERCEL_DUAL_DEPLOYMENT.md](./VERCEL_DUAL_DEPLOYMENT.md) | 🚀 部署架构指南 | -        | 📚 参考 |

### 🛠️ 工具脚本

项目新增了三个便捷工具：

#### 1. 数据库状态检查工具

**位置**：`apps/server/scripts/check-database.js`

**功能**：

- ✅ 检查 `DATABASE_URL` 环境变量
- ✅ 测试数据库连接
- ✅ 验证表结构完整性
- ✅ 检查管理员账号
- ✅ 生成诊断报告

**使用方法**：

```powershell
cd apps/server
pnpm run check-db
```

**输出示例**：

```
================================================================================
数据库状态检查工具
================================================================================

ℹ️  [1/5] 检查环境变量...
✅ DATABASE_URL 已设置: postgresql://****@xxx

ℹ️  [2/5] 测试数据库连接...
✅ 数据库连接成功

ℹ️  [3/5] 检查数据库表...
✅ 找到 11 个表
   - users
   - products
   - categories
   ...

ℹ️  [4/5] 检查必需的表...
✅ 表 "users" 存在
✅ 表 "products" 存在
...

ℹ️  [5/5] 检查管理员账号...
✅ 找到 1 个管理员账号

管理员列表：
   - ID: 1
     用户名: admin
     邮箱: admin@cosmetic.com
     手机: 13800138000
     状态: active
     创建时间: 2024-11-27T01:00:00.000Z

================================================================================
检查完成
================================================================================

✅ ✨ 数据库状态正常！
```

#### 2. 管理员账号生成工具

**位置**：`apps/server/scripts/create-admin.js`

**功能**：

- 🔐 生成 bcrypt 加密密码
- 📄 生成可执行的 SQL 语句
- 💡 提供使用说明

**使用方法**：

```powershell
cd apps/server

# 使用默认值（admin/123456）
pnpm run create-admin

# 自定义账号信息
node scripts/create-admin.js myAdmin myPassword 13900139000 admin@example.com
```

**输出示例**：

```
🔐 正在生成管理员账号...

✅ SQL 语句生成成功！

================================================================================
-- 创建管理员账号
-- 账号信息：
--   用户名: admin
--   密码: 123456
--   手机号: 13800138000
--   邮箱: admin@cosmetic.com

INSERT INTO users (username, email, phone, password, nickname, role, status, "createdAt", "updatedAt")
VALUES (
  'admin',
  'admin@cosmetic.com',
  '13800138000',
  '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  '系统管理员',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  "updatedAt" = NOW();

-- 验证账号是否创建成功
SELECT id, username, email, phone, nickname, role, status, "createdAt"
FROM users
WHERE username = 'admin';
================================================================================

📋 使用说明：
1. 复制上面的 SQL 语句
2. 进入 Vercel Postgres 控制台 → Query 标签
3. 粘贴并执行 SQL
4. 使用以下账号登录：
   - 用户名: admin
   - 密码: 123456
   - 手机号: 13800138000
   - 邮箱: admin@cosmetic.com

💡 如果需要手动修改，密码的 bcrypt hash 为：
$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 3. 新增 npm 脚本

已在 `apps/server/package.json` 中添加：

```json
{
  "scripts": {
    "check-db": "node scripts/check-database.js",
    "create-admin": "node scripts/create-admin.js"
  }
}
```

---

## 完整修复流程

### 前提条件

- 已有 Vercel 账号
- 已部署前后端项目到 Vercel
- 本地已安装 Node.js、pnpm 和 Vercel CLI

### 修复步骤（15-20分钟）

#### 步骤 1: 创建 Vercel Postgres 数据库（3分钟）

1. 访问 https://vercel.com/dashboard
2. Storage → Create Database → Postgres
3. 配置：
   - Name: `cosmetics-db`
   - Region: `Hong Kong (hkg1)`
4. 点击 Create

#### 步骤 2: 连接数据库到项目（1分钟）

1. 数据库页面 → Connect Project
2. 选择 `cosmetic-ve-server` 项目
3. 环境选择：Production
4. 点击 Connect

#### 步骤 3: 配置环境变量（2分钟）

进入 `cosmetic-ve-server` → Settings → Environment Variables

添加/更新：

```env
DATABASE_URL=<POSTGRES_PRISMA_URL的值>
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGINS=https://cosmetic-ve.vercel.app
```

#### 步骤 4: 本地拉取环境变量（1分钟）

```powershell
cd e:\site2\apps\server
vercel env pull .env.production
```

#### 步骤 5: 检查数据库连接（1分钟）

```powershell
pnpm run check-db
```

如果显示"数据库连接成功"但"没有任何表"，继续下一步。

#### 步骤 6: 执行数据库迁移（2分钟）

```powershell
pnpm prisma migrate deploy
```

#### 步骤 7: 再次检查数据库（1分钟）

```powershell
pnpm run check-db
```

应该显示所有表都已创建。

#### 步骤 8: 创建管理员账号（3分钟）

```powershell
# 生成 SQL
pnpm run create-admin

# 复制输出的 SQL 语句

# 进入 Vercel Postgres Query 控制台
# 粘贴并执行 SQL
```

#### 步骤 9: 验证管理员账号（1分钟）

在 Vercel Postgres Query 中执行：

```sql
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

应该看到刚创建的管理员账号。

#### 步骤 10: 重新部署后端（2分钟）

1. Vercel Dashboard → cosmetic-ve-server
2. Deployments → 最新部署 → ··· → Redeploy
3. 等待部署完成

#### 步骤 11: 验证修复（2分钟）

**测试后端 API**：

```powershell
curl https://cosmetic-ve-server.vercel.app/health
```

**测试登录**：

1. 访问 https://cosmetic-ve.vercel.app/admin/login
2. 输入：
   - 用户名：`admin`
   - 密码：`123456`
3. 点击登录

如果成功登录，问题解决！✅

---

## 常见问题答疑

### Q1: 为什么要用 `POSTGRES_PRISMA_URL` 而不是 `POSTGRES_URL`？

**A**: Prisma 需要使用连接池（pooling）版本的 URL，而 `POSTGRES_URL` 是直连 URL。使用错误的 URL 会导致连接超时。

### Q2: 数据库迁移失败怎么办？

**A**: 可能原因：

1. `DATABASE_URL` 配置错误 → 检查环境变量
2. 数据库不可访问 → 检查防火墙规则
3. 权限不足 → 检查数据库用户权限

**解决**：

```powershell
# 重新拉取环境变量
vercel env pull .env.production --force

# 检查 .env.production 文件
cat .env.production

# 重试迁移
pnpm prisma migrate deploy
```

### Q3: 创建管理员账号后登录还是失败？

**A**: 可能原因：

1. 密码 hash 不正确 → 重新生成并执行 SQL
2. 账号状态不是 `active` → 检查数据库
3. 后端未重新部署 → 重新部署后端

**检查**：

```sql
-- 在 Vercel Postgres Query 中执行
SELECT username, role, status, LENGTH(password) as pwd_len
FROM users
WHERE username = 'admin';

-- 确认：
-- role = 'admin'
-- status = 'active'
-- pwd_len > 50 (bcrypt hash 长度)
```

### Q4: 环境变量修改后不生效？

**A**: 环境变量修改后**必须重新部署**项目才会生效。

步骤：

1. 修改环境变量
2. 点击 Save
3. Deployments → Redeploy
4. 等待部署完成
5. 测试

### Q5: 本地没有安装 Vercel CLI 怎么办？

**A**: 可以完全在 Vercel Web 控制台完成：

1. 数据库迁移：
   - 在 Postgres Query 中手动执行 `migration.sql` 文件内容

2. 创建管理员：
   - 在线工具生成 bcrypt hash：https://bcrypt-generator.com
   - 使用生成的 hash 手动构建 SQL 并执行

---

## 预防措施

为避免类似问题再次发生：

### 1. 部署检查清单

部署新环境时，务必检查：

- [ ] 数据库已创建并连接到项目
- [ ] 所有必需的环境变量已配置
- [ ] 数据库表结构已初始化
- [ ] 至少有一个管理员账号
- [ ] 后端健康检查接口正常
- [ ] CORS 配置正确
- [ ] 前端可以正常调用后端 API

### 2. 环境变量模板

在项目中维护 `.env.example` 文件，列出所有必需的环境变量。

**前端** (`apps/web/.env.example`)：

```env
VITE_API_BASE_URL=https://your-api.vercel.app/api
VITE_BASE_URL=/
```

**后端** (`apps/server/.env.example`)：

```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/cosmetics_db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 3. 自动化部署脚本

创建部署前检查脚本，确保环境配置完整。

### 4. 监控告警

启用 Vercel Integrations：

- Sentry（错误监控）
- Datadog（性能监控）
- 配置告警通知

### 5. 文档维护

保持部署文档更新，记录：

- 环境变量清单
- 数据库配置步骤
- 常见问题解决方案
- 紧急联系方式

---

## 项目改进

本次问题处理后，项目做了以下改进：

### 新增工具

1. ✅ `check-database.js` - 数据库状态检查工具
2. ✅ `create-admin.js` - 管理员账号生成工具

### 新增文档

1. ✅ `QUICK_FIX_DATABASE_400.md` - 快速修复指南
2. ✅ `VERCEL_DATABASE_SETUP.md` - 数据库配置详细指南
3. ✅ `TROUBLESHOOTING_SUMMARY.md` - 故障排查总结（本文档）

### 更新文档

1. ✅ `README.md` - 添加故障排查部分
2. ✅ `package.json` - 添加便捷脚本

### npm 脚本

```json
{
  "scripts": {
    "check-db": "node scripts/check-database.js",
    "create-admin": "node scripts/create-admin.js"
  }
}
```

---

## 相关资源

### 官方文档

- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel 环境变量](https://vercel.com/docs/concepts/projects/environment-variables)

### 项目文档

- [前后端分离部署指南](./VERCEL_DUAL_DEPLOYMENT.md)
- [快速开始指南](./QUICK_START.md)
- [部署清单](./DEPLOYMENT_CHECKLIST.md)

---

## 总结

### 问题级别

- **严重程度**：🔴 高（阻塞生产环境使用）
- **影响范围**：管理后台无法登录
- **修复难度**：⭐⭐☆☆☆（简单，配置问题）

### 修复效果

- ✅ 问题完全解决
- ✅ 添加诊断工具
- ✅ 完善文档体系
- ✅ 提升运维能力

### 经验教训

1. 部署前必须完成数据库初始化
2. 环境变量配置需要检查清单
3. 需要完善的诊断工具
4. 文档要及时更新维护

---

**文档版本**：v1.0
**创建时间**：2024-11-27
**维护人员**：开发团队
**状态**：✅ 已解决
