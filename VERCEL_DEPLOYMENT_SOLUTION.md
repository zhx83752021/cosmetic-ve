# Vercel 部署问题解决方案

## 问题描述

部署到 Vercel 后出现运行时错误：

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/apps/server/dist/index.js'
imported from /var/task/apps/server/dist/index.js
```

所有 API 请求都失败，提示找不到模块。

## 根本原因

1. **配置冲突**：根目录和 `apps/server/` 下同时存在 `vercel.json`，导致配置冲突
2. **构建不完整**：Vercel 只构建了前端，没有编译 TypeScript server 代码
3. **模块路径问题**：Serverless 函数无法找到编译后的 `dist/` 目录和 `node_modules`
4. **Node 版本限制**：package.json 限制 Node < 21.0.0，但 Vercel 使用 v24.x

## 解决方案

### 1. 删除冲突配置文件

**删除** `apps/server/vercel.json`，使用根目录的统一配置。

### 2. 更新根目录 vercel.json

```json
{
  "version": 2,
  "installCommand": "npm install -g pnpm@8.12.1 && pnpm install",
  "builds": [
    {
      "src": "apps/server/api/index.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["apps/server/dist/**", "apps/server/node_modules/**"]
      }
    },
    {
      "src": "apps/web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/apps/server/api/index.js"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/apps/web/dist/index.html"
    }
  ]
}
```

**关键配置说明**：

- `builds`: 定义两个构建任务（后端 API + 前端静态站点）
- `includeFiles`: 包含编译后的代码和所有依赖
- `routes`: API 请求路由到 serverless 函数，其他路由到前端

### 3. 配置 API 构建脚本

更新 `apps/server/api/package.json`：

```json
{
  "type": "module",
  "scripts": {
    "vercel-build": "cd .. && pnpm run build"
  }
}
```

这确保在部署 API 时自动编译 TypeScript 代码。

### 4. 移除 Node 版本上限

更新根目录 `package.json`：

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

移除了 `<21.0.0` 上限，兼容 Vercel 的 Node v24.x。

## 部署步骤

### 1. 提交更改

```bash
git add .
git commit -m "fix: 修复 Vercel 部署配置，解决模块找不到问题"
git push
```

### 2. 触发 Vercel 重新部署

Vercel 会自动检测到代码更改并触发新的部署。

### 3. 验证部署

部署完成后，检查：

1. **构建日志**：确认两个构建都成功
   - Server API 构建（TypeScript 编译 + Serverless 打包）
   - Web 前端构建（Vite build）

2. **健康检查**：

   ```bash
   curl https://your-domain.vercel.app/health
   ```

   应该返回：

   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "version": "1.0.1",
     "cors": {...}
   }
   ```

3. **API 测试**：
   ```bash
   curl https://your-domain.vercel.app/api/products
   ```

## 预期的构建过程

使用新配置后，Vercel 构建流程：

```
1. Install Dependencies
   └─ npm install -g pnpm@8.12.1 && pnpm install

2. Build Server API
   ├─ Execute: cd apps/server && pnpm run build
   ├─ Run: prisma generate
   ├─ Run: tsc (compile TypeScript)
   └─ Package: dist/** + node_modules/** → serverless function

3. Build Web Frontend
   ├─ Execute: pnpm run build (in apps/web)
   ├─ Run: vite build
   └─ Output: apps/web/dist/** → static files

4. Deploy
   ├─ /api/* → serverless function (apps/server/api/index.js)
   └─ /* → static files (apps/web/dist/)
```

## 故障排查

如果部署后仍有问题：

### 检查构建日志

在 Vercel 控制台查看：

- TypeScript 编译是否成功？
- 是否有错误或警告？
- dist/ 目录是否包含所有文件？

### 检查运行时日志

查看 Function Logs：

- 是否有模块找不到错误？
- 环境变量是否正确设置？
- 数据库连接是否正常？

### 常见问题

1. **Prisma Client 错误**
   - 确保 `@prisma/client` 在 `dependencies`（不是 devDependencies）
   - 确保 `prisma generate` 在构建时执行

2. **环境变量未设置**
   - 在 Vercel 项目设置中配置环境变量
   - 参考 `apps/server/ENV_VARIABLES_VERCEL.md`

3. **CORS 错误**
   - 检查 `CORS_ORIGINS` 环境变量
   - 确保前端域名在白名单中

## 更改摘要

| 文件                           | 更改               | 原因                       |
| ------------------------------ | ------------------ | -------------------------- |
| `vercel.json`                  | 使用 builds 配置   | 正确处理 monorepo 全栈部署 |
| `apps/server/vercel.json`      | 删除               | 避免配置冲突               |
| `apps/server/api/package.json` | 添加 vercel-build  | 自动编译 TypeScript        |
| `package.json`                 | 移除 Node 版本上限 | 兼容 Vercel Node v24.x     |

## 参考资料

- [Vercel Monorepo 部署](https://vercel.com/docs/concepts/monorepos)
- [Vercel Node.js 运行时](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Vercel 配置文件](https://vercel.com/docs/project-configuration)
