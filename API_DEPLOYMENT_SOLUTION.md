# API 405 错误修复方案

## 问题描述

部署到 Vercel 后，后台管理系统登录页面出现 **"Request failed with status code 405"** 错误。

### 根本原因

`vercel.json` 配置将所有请求（包括 `/api/*` 请求）都重定向到了 `index.html`，导致后端 API 无法正常工作。

## 解决方案

### 已完成的修复

1. **修改部署脚本** (`scripts/prepare-deploy.js`)
   - 新增：将后端 API 文件复制到项目根目录 `/api`
   - 新增：将编译后的代码复制到 `/api/dist`

2. **更新 Vercel 配置** (`vercel.json`)
   - 新增 `functions` 配置：定义 serverless function
   - 新增 `rewrites` 配置：将 `/api` 请求路由到后端
   - 保留 `routes` 配置：前端 SPA 路由继续工作

3. **创建根目录 API 文件**
   - `/api/index.js`：Serverless function 入口点
   - `/api/package.json`：标记为 ES 模块

4. **更新忽略文件配置**
   - `.gitignore`：排除动态生成的 `/api` 和 `/public`
   - `.vercelignore`：允许源代码上传，排除本地构建产物

### 配置详情

#### vercel.json

```json
{
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    }
  ]
}
```

#### 目录结构

```
项目根目录/
├── api/                    # Vercel Serverless Functions（构建时生成）
│   ├── index.js           # Function 入口点
│   ├── package.json       # ES 模块配置
│   └── dist/              # 编译后的后端代码
├── public/                # 前端静态文件（构建时生成）
│   ├── index.html
│   └── assets/
├── apps/
│   ├── server/            # 后端源代码
│   └── web/               # 前端源代码
└── vercel.json
```

## 部署步骤

### 1. 提交更改

```bash
git add .
git commit -m "fix: 修复 API 405 错误 - 配置 Vercel serverless functions"
git push
```

### 2. 重新部署

Vercel 会自动检测到 git push 并触发新的部署，或者：

**方式A：在 Vercel Dashboard**

1. 进入项目
2. 点击 **Deployments** 标签
3. 等待自动部署完成

**方式B：使用 Vercel CLI**

```bash
vercel --prod
```

### 3. 验证修复

部署完成后，访问以下 URL 测试：

```
# 测试前端
https://你的域名.vercel.app

# 测试 API（健康检查）
https://你的域名.vercel.app/api/health

# 测试管理后台登录
https://你的域名.vercel.app/admin/login
```

预期结果：

- ✅ 前端页面正常显示
- ✅ API 返回 JSON 响应（不再是 405 错误）
- ✅ 管理后台可以正常登录

## 技术说明

### 工作原理

1. **构建阶段**（在 Vercel 服务器上）:

   ```bash
   # buildCommand 执行：
   cd apps/server && pnpm run build    # 编译后端 TypeScript
   cd apps/web && pnpm run build       # 构建前端 Vue 应用
   node scripts/prepare-deploy.js      # 准备部署文件
   ```

2. **文件准备**:
   - 前端：`apps/web/dist/` → `public/`
   - 后端：`apps/server/dist/` → `api/dist/`
   - API 入口：`apps/server/api/` → `api/`

3. **请求路由**:

   ```
   /api/* → Vercel Serverless Function (/api/index.js)
             ↓
          Express App (/api/dist/index.js)
             ↓
          具体的 API 路由处理

   其他请求 → 静态文件系统 (public/)
             ↓
          如果找不到 → /index.html (SPA 路由)
   ```

### 环境变量配置

别忘了在 Vercel Dashboard 配置必需的环境变量：

**Project → Settings → Environment Variables**

必需配置：

- `DATABASE_URL`：PostgreSQL 连接字符串
- `JWT_SECRET`：JWT 加密密钥（至少32位）
- `NODE_ENV`：`production`

详见：`apps/server/ENV_VARIABLES_VERCEL.md`

## 故障排查

### 问题：仍然返回 405 错误

**检查项**：

1. 确认 git 已推送所有更改
2. 确认 Vercel 重新部署成功
3. 查看 Vercel 部署日志，确认以下输出：
   ```
   ✅ 复制前端构建产物到 public/ ...
   ✅ 复制后端 API 到根目录 api/ ...
   ✅ 后端 API 文件准备完成！
   ```

### 问题：API 返回 500 错误

**原因**：可能是环境变量未配置

**解决**：

1. 在 Vercel Dashboard 配置环境变量
2. 点击 **Redeploy** 使环境变量生效

### 问题：找不到模块错误

**检查**：

- `api/index.js` 中的导入路径是否正确：`import app from './dist/index.js'`
- `api/package.json` 是否包含 `"type": "module"`

## 相关文件

- `vercel.json`：Vercel 部署配置
- `scripts/prepare-deploy.js`：部署准备脚本
- `.vercelignore`：Vercel 忽略文件配置
- `apps/server/ENV_VARIABLES_VERCEL.md`：环境变量配置指南

## 技术栈

- **前端**：Vue 3 + Vite → 静态站点（Vercel Static Hosting）
- **后端**：Express + TypeScript → Serverless Functions（Vercel Functions）
- **数据库**：PostgreSQL（需单独托管，如 Neon、Supabase）

---

**修复版本**: v1.0
**修复日期**: 2024-12-01
**修复状态**: ✅ 已完成
