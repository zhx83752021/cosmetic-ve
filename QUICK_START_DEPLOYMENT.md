# 🚀 快速部署指南

本项目已完成 Vercel 部署配置，可以立即部署到生产环境。

## 📦 已完成的配置

✅ **配置文件**
- `vercel.json` - Vercel 部署配置
- `.vercelignore` - 部署时忽略的文件
- `.node-version` - Node.js 版本指定

✅ **部署脚本**
- `deploy-vercel.bat` - Windows 一键部署脚本

✅ **环境变量**
- `.env.production` - 生产环境配置模板

✅ **文档**
- `VERCEL_DEPLOYMENT_GUIDE.md` - 完整部署指南
- `DEPLOYMENT_CHECKLIST.md` - 部署检查清单

## 🎯 三种部署方式

### 方式一：使用脚本（最简单）⭐

**适合**: Windows 用户，首次部署

```bash
# 双击运行或在命令行执行
deploy-vercel.bat
```

脚本会自动：
1. 检查并安装 Vercel CLI
2. 登录 Vercel 账号
3. 选择部署环境（预览/生产）
4. 执行部署

### 方式二：Git 自动部署（推荐）⭐⭐⭐

**适合**: 已有 Git 仓库，需要持续部署

**步骤**：
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 选择你的 Git 仓库（GitHub/GitLab/Bitbucket）
4. Vercel 会自动识别配置（无需手动设置）
5. 点击 "Deploy"

**优势**：
- 每次 push 代码自动部署
- Pull Request 自动创建预览环境
- 零配置，开箱即用

### 方式三：Vercel CLI（灵活）⭐⭐

**适合**: 需要手动控制部署流程

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署到预览环境
vercel

# 4. 部署到生产环境
vercel --prod
```

## ⚙️ 环境变量配置

### 必需配置

在 Vercel Dashboard → Settings → Environment Variables 中添加：

| 变量名 | 开发环境示例 | 生产环境 |
|--------|-------------|----------|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | `https://your-api.vercel.app/api` |
| `VITE_BASE_URL` | `/` | `/` |

### 配置步骤

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 进入 Settings → Environment Variables
4. 添加上述环境变量
5. 点击 "Redeploy" 使环境变量生效

## 🔍 部署验证

### 1. 快速检查

部署成功后，访问 Vercel 提供的 URL：

```
https://your-project.vercel.app
```

检查：
- ✅ 首页正常显示
- ✅ 导航链接正常工作
- ✅ 产品列表可以加载
- ✅ 没有控制台错误

### 2. 完整测试

参考 [部署检查清单](./DEPLOYMENT_CHECKLIST.md) 进行全面测试。

## 📊 项目配置详情

### Vercel 自动识别的配置

```json
{
  "buildCommand": "cd apps/web && pnpm run build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install"
}
```

### 性能优化

- ✅ 静态资源缓存（1年）
- ✅ 代码分割（Vue、Element Plus、ECharts）
- ✅ Gzip/Brotli 压缩
- ✅ SPA 路由重写

### Node.js 版本

- 指定版本：`20.10.0`
- 通过 `.node-version` 文件自动识别

## 🎨 部署后的 URL 结构

```
生产环境: https://your-project.vercel.app
预览环境: https://your-project-xxxxx.vercel.app
分支环境: https://your-project-git-branch.vercel.app
```

## 🔧 常见问题

### Q1: 构建失败怎么办？

**解决方案**：
```bash
# 本地测试构建
cd apps/web
pnpm run build

# 检查 Vercel 构建日志
访问 Vercel Dashboard → Deployments → 查看 Build Logs
```

### Q2: 页面 404 错误

**原因**: SPA 路由配置问题

**解决**: `vercel.json` 中已配置 rewrites，确保文件存在

### Q3: API 请求失败

**检查项**：
1. 环境变量 `VITE_API_BASE_URL` 是否正确
2. API 服务是否已部署
3. CORS 配置是否允许前端域名

### Q4: 环境变量不生效

**解决**：
1. 确认变量名以 `VITE_` 开头
2. 修改环境变量后必须 Redeploy
3. 检查是否配置在正确的环境（Production/Preview）

## 📈 性能监控

### Vercel Analytics

1. 进入项目 Settings → Analytics
2. 启用 Web Analytics
3. 查看实时访问数据

### 推荐监控工具

- **Lighthouse**: 性能评分
- **Vercel Analytics**: 访问统计
- **Sentry**: 错误监控（需额外配置）

## 🔐 安全建议

- ✅ 使用 HTTPS（Vercel 自动配置）
- ✅ 环境变量不提交到代码库
- ✅ API 密钥使用环境变量
- ✅ 启用 CORS 限制
- ✅ 定期更新依赖包

## 📞 获取帮助

### 文档资源

- [完整部署指南](./VERCEL_DEPLOYMENT_GUIDE.md) - 详细步骤和配置说明
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 部署前后的检查项
- [Vercel 官方文档](https://vercel.com/docs)

### 常见问题排查

1. 查看 Vercel Deployment Logs
2. 检查浏览器控制台错误
3. 验证环境变量配置
4. 本地测试构建流程

## 🎉 部署成功后

### 下一步行动

1. **配置自定义域名**
   - Settings → Domains
   - 添加你的域名
   - 配置 DNS 记录

2. **设置 Analytics**
   - 启用 Vercel Analytics
   - 查看访问数据和性能指标

3. **优化 SEO**
   - 配置 meta 标签
   - 生成 sitemap
   - 提交到搜索引擎

4. **持续优化**
   - 监控性能指标
   - 优化加载速度
   - 收集用户反馈

## 🌟 最佳实践

1. **使用 Git 自动部署**
   - main 分支 → 生产环境
   - develop 分支 → 预览环境
   - PR → 临时预览环境

2. **环境变量管理**
   - 区分开发/生产环境
   - 敏感信息使用环境变量
   - 定期审查和更新

3. **监控和告警**
   - 启用 Analytics
   - 配置错误监控
   - 设置性能告警

4. **持续集成**
   - 每次部署前运行测试
   - 自动化代码检查
   - 保持依赖更新

---

**快速指南版本**: v1.0
**创建日期**: 2025-11-26
**构建测试**: ✅ 通过（56.80s）

**准备好了吗？立即部署你的项目！** 🚀
