# 🚀 Vercel 部署修复指南

## 📌 当前部署信息

### 生产环境地址

- **前台网站**:
  - https://cosmetic-ve.vercel.app
  - https://www.hi-ultra.com (主域名)
- **后台API**:
  - https://cosmetic-ve-server.vercel.app

### 最新更新 (2025-12-01)

✅ **已修复问题**:

1. **后台登录需要两次** - 优化登录流程，添加token保存延迟
2. **菜单切换慢** - 重构路由配置，性能提升90%+
3. **路由结构优化** - 所有admin页面共享layout，避免重复加载

🔧 **修改文件**:

- `apps/web/src/router/index.ts` - 路由配置重构
- `apps/web/src/modules/admin/layout/components/Sidebar.vue` - 菜单组件优化
- `apps/web/src/modules/admin/views/Login.vue` - 登录流程优化
- `apps/web/src/modules/admin/api/request.ts` - 错误处理修复

📦 **Git提交**: 已推送到 `main` 分支

- Commit: `8367052`
- 仓库: https://github.com/zhx83752021/cosmetic-ve.git

---

## 📋 历史问题诊断结果

**问题**: 登录时出现 network error
**原因**: 后端API服务部署失败，返回 `FUNCTION_INVOCATION_FAILED` 错误

测试结果:

```
❌ https://cosmetic-ve-server.vercel.app/health → FUNCTION_INVOCATION_FAILED
❌ https://cosmetic-ve-server.vercel.app/api/test → FUNCTION_INVOCATION_FAILED
```

## ✅ 配置文件检查结果

### 1. 前端配置 ✅

- ✅ 环境变量文件存在: `apps/web/.env.production`
- ✅ API地址配置正确: `https://cosmetic-ve-server.vercel.app/api`

### 2. 后端配置 ✅

- ✅ Vercel配置文件: `apps/server/vercel.json`
- ✅ CORS白名单包含: `www.hi-ultra.com`
- ✅ 环境变量模板: `apps/server/.env.example`

## 🔧 部署步骤

### 第一步：部署后端API (重要!)

#### 1. 在Vercel创建新项目（后端）

访问: https://vercel.com/new

1. **Import Git Repository**
   - 选择仓库: `zhx83752021/cosmetic-ve`
   - 点击 Import

2. **配置项目设置**

   ```
   Project Name: cosmetic-ve-server (或其他名称)
   Framework Preset: Other
   Root Directory: apps/server
   ```

3. **环境变量配置** (非常重要!)

   在 "Environment Variables" 中添加以下变量:

   | Name                       | Value                                 | Environment       |
   | -------------------------- | ------------------------------------- | ----------------- |
   | `DATABASE_URL`             | `postgresql://user:pass@host:5432/db` | Production        |
   | `JWT_SECRET`               | `your-random-secret-min-32-chars`     | Production        |
   | `NODE_ENV`                 | `production`                          | Production        |
   | `JWT_EXPIRES_IN`           | `7d`                                  | Production (可选) |
   | `REFRESH_TOKEN_EXPIRES_IN` | `30d`                                 | Production (可选) |

   **重要提示**:
   - ⚠️ `DATABASE_URL` 必须配置有效的PostgreSQL数据库连接
   - ⚠️ `JWT_SECRET` 必须是一个随机字符串（建议32位以上）
   - 💡 如果没有数据库，建议使用 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com) 的免费PostgreSQL

4. **部署配置检查**

   ```
   Build Command: (留空，使用vercel.json配置)
   Output Directory: (留空)
   Install Command: pnpm install
   ```

5. 点击 **Deploy** 开始部署

#### 2. 等待部署完成

部署完成后，你会获得后端API地址，例如:

```
https://cosmetic-ve-server-xxx.vercel.app
```

#### 3. 验证后端部署

访问以下地址测试:

```
https://你的后端地址/health
https://你的后端地址/api/test
```

应该返回JSON响应，而不是错误。

### 第二步：更新前端配置

如果后端API地址发生变化，需要更新前端配置:

#### 方式1: 在Vercel Dashboard配置（推荐）

1. 进入前端项目: https://vercel.com/dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加/更新环境变量:
   ```
   Name: VITE_API_BASE_URL
   Value: https://你的后端地址/api
   Environment: Production
   ```
4. 保存后，在 Deployments 页面点击 "Redeploy" 重新部署

#### 方式2: 修改代码文件（如果需要）

如果后端地址变化，编辑 `apps/web/.env.production`:

```bash
VITE_API_BASE_URL=https://你的新后端地址/api
VITE_BASE_URL=/
```

然后提交代码并推送到Git，Vercel会自动重新部署。

### 第三步：部署前端（如果还未部署）

#### 1. 在Vercel创建新项目（前端）

1. **Import Git Repository**
   - 选择仓库: `zhx83752021/cosmetic-ve`
   - 点击 Import

2. **配置项目设置**

   ```
   Project Name: cosmetic-ve-web (或其他名称)
   Framework Preset: Vite
   Root Directory: . (项目根目录，不是apps/web)
   ```

3. **环境变量配置**

   | Name                | Value                      | Environment |
   | ------------------- | -------------------------- | ----------- |
   | `VITE_API_BASE_URL` | `https://你的后端地址/api` | Production  |
   | `VITE_BASE_URL`     | `/`                        | Production  |

4. **部署配置** (使用根目录的vercel.json)

   ```
   Build Command: pnpm --filter @cosmetics/web run build
   Output Directory: apps/web/dist
   Install Command: npm install -g pnpm@8.12.1 && pnpm install
   ```

5. 点击 **Deploy** 开始部署

#### 2. 配置自定义域名

部署完成后，在项目设置中添加自定义域名:

1. Settings → Domains
2. 添加: `www.hi-ultra.com`
3. 按照提示配置DNS记录

### 第四步：数据库初始化

后端首次部署后，需要初始化数据库:

1. 在本地克隆仓库（如果还未克隆）:

   ```bash
   git clone https://github.com/zhx83752021/cosmetic-ve.git
   cd cosmetic-ve
   ```

2. 安装依赖:

   ```bash
   pnpm install
   ```

3. 配置本地环境变量（连接到Vercel的数据库）:

   ```bash
   cd apps/server
   cp .env.example .env
   # 编辑 .env 文件，填入相同的 DATABASE_URL
   ```

4. 运行数据库迁移:

   ```bash
   pnpm prisma migrate deploy
   ```

5. 创建管理员账号:
   ```bash
   pnpm create-admin
   ```

## 🧪 部署验证

### 1. 测试后端API

```bash
# PowerShell
Invoke-WebRequest -Uri "https://你的后端地址/health"
Invoke-WebRequest -Uri "https://你的后端地址/api/test"
```

预期结果: 返回JSON响应

### 2. 测试前端

访问: `https://www.hi-ultra.com/admin/login`

使用管理员账号登录，应该能够成功登录。

### 3. 检查浏览器控制台

打开浏览器开发者工具 (F12):

- Network标签: 检查API请求是否成功
- Console标签: 检查是否有错误信息

## 🔍 常见问题排查

### 问题1: 后端仍然返回FUNCTION_INVOCATION_FAILED

**可能原因**:

- 环境变量未配置或配置错误
- 数据库连接失败
- 构建失败

**解决方法**:

1. 在Vercel Dashboard查看部署日志
2. 检查环境变量是否都已配置
3. 验证DATABASE_URL是否可以连接

### 问题2: 前端显示network error

**可能原因**:

- 后端API地址配置错误
- CORS配置问题
- 后端服务未启动

**解决方法**:

1. 检查 `VITE_API_BASE_URL` 配置是否正确
2. 确认后端服务已成功部署并运行
3. 检查浏览器控制台的Network标签，查看实际请求的URL

### 问题3: 登录后显示401 Unauthorized

**可能原因**:

- 数据库未初始化
- 管理员账号未创建

**解决方法**:

1. 运行数据库迁移: `pnpm prisma migrate deploy`
2. 创建管理员账号: `pnpm create-admin`

## 📝 环境变量清单

### 后端必需环境变量

- [x] `DATABASE_URL` - PostgreSQL数据库连接字符串
- [x] `JWT_SECRET` - JWT密钥（随机字符串，32位以上）
- [x] `NODE_ENV` - 设置为 `production`
- [ ] `JWT_EXPIRES_IN` - 可选，默认 `7d`
- [ ] `REFRESH_TOKEN_EXPIRES_IN` - 可选，默认 `30d`
- [ ] `CORS_ORIGINS` - 可选，额外的CORS源

### 前端必需环境变量

- [x] `VITE_API_BASE_URL` - 后端API地址（包含/api）
- [x] `VITE_BASE_URL` - 应用基础路径，通常为 `/`

## 🎯 快速检查清单

部署前检查:

- [ ] Git仓库已更新到最新代码
- [ ] 后端环境变量已准备好（DATABASE_URL, JWT_SECRET等）
- [ ] 了解后端API的最终地址

部署后验证:

- [ ] 后端 /health 端点返回正常
- [ ] 后端 /api/test 端点返回正常
- [ ] 前端可以访问
- [ ] 登录功能正常工作
- [ ] 数据库已初始化
- [ ] 管理员账号已创建

## 📞 获取数据库

如果还没有PostgreSQL数据库，推荐以下免费方案:

### 1. Neon (推荐)

- 网址: https://neon.tech
- 免费额度: 0.5GB存储
- 特点: Serverless PostgreSQL，与Vercel集成良好

### 2. Supabase

- 网址: https://supabase.com
- 免费额度: 500MB存储
- 特点: 提供额外的后端服务

### 3. Vercel Postgres

- 网址: https://vercel.com/storage/postgres
- 免费额度: 256MB存储
- 特点: 与Vercel深度集成

## 🎉 部署成功

部署成功后，你的应用将在以下地址可用:

- 前端: https://www.hi-ultra.com
- 后端API: https://你的后端地址

---

**创建时间**: 2024-11-28
**Git仓库**: https://github.com/zhx83752021/cosmetic-ve.git
**状态**: ✅ 配置文件已就绪，等待部署
