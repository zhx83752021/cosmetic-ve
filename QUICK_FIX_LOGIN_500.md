# 登录 500 错误快速修复 ⚡

> 3 分钟快速解决登录 500 错误

---

## 🎯 步骤 1：运行诊断（30秒）

在浏览器访问：

```
https://your-backend.vercel.app/api/diagnostic
```

**将 `your-backend.vercel.app` 替换为您的实际后端域名**

---

## 🔍 步骤 2：根据诊断结果修复

### 场景 A：数据库连接失败

**诊断显示**：`❌ 数据库连接失败`

**原因**：`DATABASE_URL` 未配置或错误

**修复**（2 分钟）：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入后端项目 → Settings → Environment Variables
3. 添加/检查 `DATABASE_URL`：
   ```
   postgres://user:password@host/database?sslmode=require
   ```
4. 获取 Vercel Postgres URL：
   - Storage → 你的数据库 → .env.local → 复制 `POSTGRES_URL`
5. Save → Deployments → Redeploy

---

### 场景 B：数据库表不存在 ⭐ **最常见**

**诊断显示**：`❌ 表不存在` 或 `表数量: 0`

**原因**：数据库创建了，但没有执行迁移

**修复**（1 分钟）：

```bash
# 1. 打开终端，进入后端目录
cd e:\site2\apps\server

# 2. 设置数据库连接（从 Vercel 复制）
$env:DATABASE_URL="postgres://user:password@host/database?sslmode=require"

# 3. 执行迁移
pnpm prisma migrate deploy
```

**预期输出**：
```
✓ Prisma Migrate applied 3 migrations
```

**完成！** 现在可以登录了。

---

### 场景 C：JWT_SECRET 未配置

**诊断显示**：`⚠️  JWT_SECRET 未配置`

**修复**（1 分钟）：

```powershell
# 1. 生成安全密钥
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

复制输出（例如：`QkZ3NzU4OGY3ZWI4MTIzNDU2...`）

```bash
# 2. 配置到 Vercel
Vercel Dashboard → 后端项目 → Settings → Environment Variables
添加: JWT_SECRET=<刚才复制的密钥>
Save → Redeploy
```

---

### 场景 D：CORS 错误

**诊断显示**：浏览器控制台有 CORS 错误

**修复**（1 分钟）：

```bash
# 1. 获取前端域名（例如：https://cosmetic-ve.vercel.app）

# 2. 配置 CORS
Vercel Dashboard → 后端项目 → Settings → Environment Variables
添加/更新: CORS_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
Save → Redeploy
```

⚠️ 注意：多个域名用逗号分隔，**无空格**

---

## ✅ 步骤 3：验证修复（30秒）

### 方法 1：重新访问诊断接口

```
https://your-backend.vercel.app/api/diagnostic
```

确认显示：`✅ 系统正常`

### 方法 2：测试登录

```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
```

成功响应：
```json
{
  "success": true,
  "message": "注册成功"
}
```

### 方法 3：前端测试

1. 访问前端网站
2. 注册/登录
3. 确认成功

---

## 🎯 快速命令汇总

### 查看 Vercel Logs
```bash
# Vercel Dashboard → 后端项目 → Deployments → Function Logs
# 或访问: https://vercel.com/your-team/your-backend/logs
```

### 执行数据库迁移
```powershell
cd e:\site2\apps\server
$env:DATABASE_URL="your-vercel-postgres-url"
pnpm prisma migrate deploy
```

### 生成 JWT 密钥
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 创建管理员账号
```powershell
cd e:\site2\apps\server
$env:DATABASE_URL="your-vercel-postgres-url"
node scripts/create-admin.js
```

---

## 🆘 仍然报错？

### 查看详细日志

1. **Vercel Function Logs**
   - Vercel Dashboard → Deployments → 最新部署 → Function Logs
   - 尝试登录，观察实时错误

2. **浏览器控制台**
   - F12 → Network → 尝试登录
   - 查看请求的 Response 标签

3. **诊断接口**
   ```
   https://your-backend.vercel.app/api/diagnostic
   ```
   - 查看 `errors` 和 `warnings` 数组

### 常见错误对照表

| 症状 | 原因 | 快速修复 |
|------|------|---------|
| `Can't reach database server` | DATABASE_URL 错误 | 检查环境变量 |
| `Table 'User' does not exist` | 未执行迁移 | `prisma migrate deploy` |
| `Prisma Client not initialized` | 构建配置错误 | 检查 Install Command |
| `Not allowed by CORS` | CORS 配置错误 | 检查 CORS_ORIGINS |
| `账号或密码错误` | 用户不存在 | 先注册账号 |

---

## 📚 详细文档

需要更详细的说明？查看：

- [详细排查指南](./LOGIN_500_ERROR_GUIDE.md)
- [Vercel 部署配置](./VERCEL_DEPLOYMENT_CONFIG.md)
- [快速配置参考](./VERCEL_QUICK_CONFIG.md)

---

## 💡 一句话总结

**99% 的情况是：数据库表未创建，执行 `prisma migrate deploy` 即可解决！**
