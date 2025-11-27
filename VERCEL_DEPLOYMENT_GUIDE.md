# Vercel 部署指南

## 部署步骤

### 1. 安装 Vercel CLI（可选）

```bash
npm i -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

### 3. 部署项目

#### 方式一：使用 Vercel CLI

在项目根目录执行：

```bash
# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 方式二：通过 Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 Git 仓库（推荐）或上传项目文件
4. 配置项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: `./`（保持默认）
   - **Build Command**: `cd apps/web && pnpm run build`
   - **Output Directory**: `apps/web/dist`
   - **Install Command**: `pnpm install`

### 4. 配置环境变量

在 Vercel Dashboard 的项目设置中，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `https://your-api-domain.vercel.app/api` | API 服务地址 |
| `VITE_BASE_URL` | `/` | 应用基础路径 |

**注意**：
- 如果后端 API 也部署在 Vercel，请替换为实际的 API 域名
- 如果使用其他服务器，填写对应的 API 地址

### 5. 触发重新部署

环境变量配置完成后，点击 "Redeploy" 重新部署项目。

## 项目配置说明

### vercel.json 配置

```json
{
  "buildCommand": "cd apps/web && pnpm run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**配置说明**：
- **buildCommand**: 构建命令，进入 web 应用目录执行构建
- **outputDirectory**: 构建输出目录
- **installCommand**: 依赖安装命令
- **rewrites**: SPA 路由重写配置，所有路由指向 index.html
- **headers**: 静态资源缓存优化

## 常见问题

### 1. 构建失败

**问题**：构建时报错 "Command failed"

**解决**：
- 检查 Node.js 版本是否符合要求（>=20.0.0 <21.0.0）
- 在 Vercel 项目设置中指定 Node.js 版本：Settings → General → Node.js Version → 20.x

### 2. 路由 404 错误

**问题**：刷新页面时出现 404

**解决**：
- 确认 `vercel.json` 中的 rewrites 配置正确
- SPA 应用需要将所有路由重写到 index.html

### 3. API 请求失败

**问题**：前端无法访问 API

**解决**：
- 检查环境变量 `VITE_API_BASE_URL` 是否配置正确
- 确认 API 服务已部署且可访问
- 检查 CORS 配置是否允许前端域名访问

### 4. 环境变量不生效

**问题**：修改环境变量后不生效

**解决**：
- 环境变量修改后需要重新部署
- Vite 的环境变量必须以 `VITE_` 开头才能在客户端访问

## 自动部署（推荐）

### 连接 Git 仓库

1. 在 Vercel Dashboard 中选择 "Import Git Repository"
2. 授权访问 GitHub/GitLab/Bitbucket
3. 选择项目仓库
4. 配置构建设置（同上）
5. 点击 "Deploy"

**优势**：
- 每次 push 到主分支自动部署
- Pull Request 自动创建预览环境
- 支持分支环境管理

### Git 分支策略

- **main/master**: 生产环境（自动部署）
- **develop**: 开发环境（可配置自动部署）
- **feature/***: 功能分支（PR 预览）

## 性能优化建议

### 1. 启用缓存

当前配置已为静态资源启用长期缓存（1年）：
- `/assets/*` 下的文件自动添加缓存头

### 2. 代码分割

Vite 配置中已启用代码分割：
- Vue 核心库单独打包
- Element Plus 单独打包
- ECharts 单独打包

### 3. 压缩优化

Vercel 自动启用：
- Gzip/Brotli 压缩
- 图片优化
- 代码压缩

## 监控与分析

### Vercel Analytics

在项目设置中启用 Analytics：
1. 进入项目 Settings → Analytics
2. 启用 Web Analytics
3. 查看访问统计、性能指标

### 日志查看

1. 进入项目 Deployments
2. 选择具体部署
3. 查看 Build Logs 和 Function Logs

## 域名配置

### 添加自定义域名

1. 进入项目 Settings → Domains
2. 添加自定义域名
3. 配置 DNS 记录：
   - **A 记录**: 指向 Vercel IP
   - **CNAME 记录**: 指向 `cname.vercel-dns.com`
4. 等待 DNS 生效（通常几分钟到几小时）

### SSL 证书

Vercel 自动提供免费 SSL 证书（Let's Encrypt）：
- 域名验证后自动签发
- 自动续期
- 支持通配符域名

## 后续维护

### 更新部署

- **自动部署**：push 代码到连接的 Git 仓库
- **手动部署**：在 Vercel Dashboard 点击 "Redeploy"
- **CLI 部署**：运行 `vercel --prod`

### 回滚版本

1. 进入项目 Deployments
2. 找到之前的稳定版本
3. 点击 "Promote to Production"

## 费用说明

### Hobby 计划（免费）
- 100GB 带宽/月
- 无限部署
- 自动 SSL
- 适合个人项目和演示

### Pro 计划（$20/月）
- 1TB 带宽/月
- 优先构建
- 团队协作
- 密码保护
- 适合商业项目

## 联系支持

- [Vercel 文档](https://vercel.com/docs)
- [Vercel 社区](https://github.com/vercel/vercel/discussions)
- [支持工单](https://vercel.com/support)
