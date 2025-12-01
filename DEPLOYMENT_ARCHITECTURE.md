# 部署架构说明 - 解决 CORS 问题

## 当前问题

前端（`https://hi-ultra.com`）请求后端 API（`https://cosmetic-ve-server.vercel.app`）时出现 CORS 错误：

```
Access to XMLHttpRequest has been blocked by CORS policy:
Response to preflight request doesn't pass access control check
```

## 根本原因

**存在两个独立的 Vercel 项目**，导致跨域请求：

1. 前端项目：部署在 `hi-ultra.com`
2. 后端项目：部署在 `cosmetic-ve-server.vercel.app`

跨域请求触发 CORS 预检（OPTIONS 请求），但 Serverless 函数没有正确处理。

## 解决方案

### 推荐：统一部署架构

**将前后端部署在同一个 Vercel 项目中**，通过路径区分：

- 前端：`https://hi-ultra.com/*`
- API：`https://hi-ultra.com/api/*`

这样避免跨域问题，无需 CORS 配置。

### 已完成的修改

#### 1. 前端配置（已修改）

```bash
# apps/web/.env.production
VITE_API_BASE_URL=/api  # 使用相对路径，不再跨域
```

#### 2. 后端 CORS 增强（已修改）

```typescript
// apps/server/src/index.ts
- 添加显式 OPTIONS 预检处理
- 增强类型安全
- 白名单包含 hi-ultra.com
```

#### 3. Vercel 配置（已完成）

```json
// vercel.json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/apps/server/api/index.js" },
    { "src": "/(.*)", "dest": "/apps/web/dist/index.html" }
  ]
}
```

## 部署步骤

### 方案 A：单项目部署（推荐）

**删除独立的后端项目，使用统一部署**：

1. **提交代码**：

```bash
git add .
git commit -m "fix: 修复 CORS，统一前后端部署架构"
git push
```

2. **删除旧的后端项目**：
   - 登录 Vercel Dashboard
   - 找到 `cosmetic-ve-server` 项目
   - 删除该项目

3. **配置主项目**：
   - 确保只有一个 Vercel 项目（连接到 GitHub 仓库）
   - 在项目设置中绑定自定义域名 `hi-ultra.com`
   - 设置环境变量（参考 `apps/server/ENV_VARIABLES_VERCEL.md`）

4. **触发部署**：

```bash
# 推送代码会自动触发 Vercel 部署
git push

# 或手动在 Vercel Dashboard 触发 Redeploy
```

5. **验证部署**：

```bash
# 健康检查
curl https://hi-ultra.com/health

# API 测试
curl https://hi-ultra.com/api/products

# 前端访问
open https://hi-ultra.com
```

### 方案 B：保持独立项目（需要完整 CORS 配置）

如果必须保持前后端独立部署：

1. **确保后端正确部署最新代码**：

```bash
cd apps/server
git push  # 推送到后端仓库
```

2. **验证 CORS 配置生效**：
   - 检查 Vercel 后端项目的环境变量
   - 确认 `CORS_ORIGINS` 包含 `https://hi-ultra.com`

3. **前端保持原配置**：

```bash
# apps/web/.env.production
VITE_API_BASE_URL=https://cosmetic-ve-server.vercel.app/api
```

4. **监控 Function Logs**：
   - 在 Vercel Dashboard 查看后端日志
   - 确认 CORS 检查日志输出

## 验证清单

部署完成后，检查以下项：

### ✅ 架构验证

- [ ] 只有一个 Vercel 项目
- [ ] 自定义域名 `hi-ultra.com` 正确绑定
- [ ] 前端和 API 都在同一域名下

### ✅ 功能验证

```bash
# 1. 健康检查
curl https://hi-ultra.com/health
# 预期：{"status":"ok","version":"1.0.1",...}

# 2. API 访问（无跨域）
curl https://hi-ultra.com/api/products
# 预期：返回产品列表（或 401 需要登录）

# 3. 前端访问
# 浏览器打开 https://hi-ultra.com/admin/login
# 尝试登录，应该不再出现 CORS 错误
```

### ✅ 日志验证

在 Vercel Dashboard 查看 Function Logs：

- [ ] 看到 "🔍 CORS检查" 日志
- [ ] 看到 "✅ 白名单匹配成功" 或 "✅ 生产环境 - 允许Vercel域名"
- [ ] 没有 "❌ CORS blocked origin" 错误

## 故障排查

### 问题 1：前端仍然请求旧的 API 地址

**原因**：前端缓存或环境变量未生效

**解决**：

```bash
# 清除构建缓存
cd apps/web
rm -rf dist node_modules/.vite
pnpm install
pnpm build

# 或在 Vercel 触发清除缓存重新部署
```

### 问题 2：OPTIONS 预检请求失败

**检查**：

```bash
# 测试 OPTIONS 请求
curl -X OPTIONS https://hi-ultra.com/api/auth/login \
  -H "Origin: https://hi-ultra.com" \
  -H "Access-Control-Request-Method: POST" \
  -i
```

**预期响应头**：

```
Access-Control-Allow-Origin: https://hi-ultra.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Credentials: true
```

### 问题 3：Vercel 路由配置不生效

**原因**：可能存在多个 vercel.json

**检查**：

```bash
# 确保只有根目录有 vercel.json
find . -name "vercel.json" -type f
# 应该只输出：./vercel.json
```

## 环境变量配置

确保在 Vercel 项目中设置以下环境变量：

```bash
# 数据库
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS（可选，代码中已有默认白名单）
CORS_ORIGINS=https://hi-ultra.com,https://www.hi-ultra.com

# Node 环境
NODE_ENV=production
```

详细环境变量说明参考：`apps/server/ENV_VARIABLES_VERCEL.md`

## 架构图

### 推荐架构（单项目）

```
GitHub Repo (cosmetic-ve)
    ↓
Vercel Project
    ├── builds[0]: Server API → Serverless Function
    │   └── /api/* → apps/server/api/index.js
    │
    ├── builds[1]: Web Frontend → Static Files
    │   └── /* → apps/web/dist/
    │
    └── Domain: hi-ultra.com
        ├── https://hi-ultra.com/* → 前端
        └── https://hi-ultra.com/api/* → 后端 API
```

### 当前架构（存在问题）

```
GitHub Repo 1 (cosmetic-ve-web)
    ↓
Vercel Project 1
    └── Domain: hi-ultra.com → 前端

GitHub Repo 2 (cosmetic-ve-server)
    ↓
Vercel Project 2
    └── Domain: cosmetic-ve-server.vercel.app → 后端

❌ 跨域请求：hi-ultra.com → cosmetic-ve-server.vercel.app
```

## 总结

1. **立即操作**：提交修改并推送到 GitHub
2. **Vercel 配置**：确保只有一个项目，绑定自定义域名
3. **验证**：访问 `https://hi-ultra.com/admin/login` 测试登录
4. **监控**：查看 Vercel Function Logs 确认无错误

完成后，登录功能应该正常工作，不再出现 CORS 错误。
