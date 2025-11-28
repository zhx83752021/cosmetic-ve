# 化妆品官网与后台管理系统

一个现代化、高端的化妆品品牌官网与配套后台管理系统，提供完整的电商解决方案。

## 📚 项目文档

### 需求文档（已完成）

本项目提供了完整详细的需求文档，共8个部分：

1. **[项目概述与竞品分析](./需求文档-01-项目概述与竞品分析.md)**
   - 项目目标和定位
   - 竞品分析（雅诗兰黛、兰蔻、MAC等）
   - 数据对比分析
   - 内容框架设计
   - 设计风格定位
2. **[前台功能详细设计](./需求文档-02-前台功能详细设计.md)**
   - 产品中心功能
   - 购物车与结算
   - 用户中心
   - 美妆学院
   - 搜索功能
   - 客户服务
3. **[后台管理系统](./需求文档-03-后台管理系统.md)**
   - 仪表盘（数据可视化）
   - 商品管理
   - 订单管理
   - 用户管理
   - 营销管理
   - 内容管理
   - 数据统计
   - 系统设置
   - 权限管理
4. **[技术架构设计](./需求文档-04-技术架构设计.md)**
   - 技术栈选型
   - 项目结构设计
   - 系统架构设计
   - 数据流设计
   - 性能优化方案
5. **[数据库设计](./需求文档-05-数据库设计.md)**
   - 数据表设计（用户、商品、订单、营销、内容、系统）
   - 索引设计
   - 数据关系图
6. **[API接口文档](./需求文档-06-API接口文档.md)**
   - 接口规范
   - 用户相关接口
   - 商品相关接口
   - 订单相关接口
   - 营销相关接口
   - 后台管理接口
7. **[部署运维方案](./需求文档-07-部署运维方案.md)**
   - 部署架构
   - GitHub配置
   - Vercel部署
   - CI/CD流程
   - 监控告警
   - 安全措施
8. **[项目排期与里程碑](./需求文档-08-项目排期与里程碑.md)**
   - 详细排期（8-10周）
   - 人员分工
   - 风险管理
   - 质量保证
   - 成功指标

## 🛠️ 技术栈

### 前端

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI组件库**: Element Plus（后台）/ TailwindCSS（前台）
- **路由**: Vue Router
- **HTTP客户端**: Axios
- **数据可视化**: ECharts

### 后端

- **运行环境**: Node.js 20+
- **框架**: Express + TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **认证**: JWT
- **文件存储**: Vercel Blob

### 开发工具

- ESLint - 代码检查
- Prettier - 代码格式化
- Husky - Git钩子
- Commitlint - 提交规范
- Jest - 单元测试
- Playwright - E2E测试

## 📁 项目结构

```
cosmetics-platform/
├── apps/
│   ├── frontend/              # 前台官网
│   ├── admin/                 # 后台管理
│   └── server/                # 后端服务
├── packages/
│   ├── shared/                # 共享代码
│   └── ui/                    # UI组件库
├── docs/                      # 项目文档
├── .github/workflows/         # CI/CD配置
└── README.md
```

## 🚀 核心功能

### 前台官网

- ✅ 首页（Banner轮播、产品展示、品牌故事）
- ✅ 产品中心（分类导航、筛选排序、产品详情）
- ✅ 购物车与结算
- ✅ 订单管理
- ✅ 用户中心（个人信息、收货地址、优惠券、积分）
- ✅ 美妆学院（护肤指南、彩妆教程）
- ✅ 品牌故事
- ✅ 客户服务

### 后台管理

- ✅ 数据仪表盘（ECharts可视化）
- ✅ 商品管理（CRUD、SKU管理、库存管理）
- ✅ 订单管理（订单列表、发货、售后）
- ✅ 用户管理（用户列表、会员等级）
- ✅ 营销管理（优惠券、活动、积分）
- ✅ 内容管理（文章、视频、评论）
- ✅ 数据统计（销售、用户、商品、流量）
- ✅ 系统设置
- ✅ 权限管理

## 🎯 特色亮点

1. **现代化技术栈**: Vue3 + TypeScript + Vite，开发体验极佳
2. **响应式设计**: 完美适配电脑、平板、手机
3. **数据可视化**: ECharts图表，数据一目了然
4. **完善的权限系统**: 基于角色的权限控制
5. **高性能**: 代码分割、懒加载、CDN加速
6. **SEO友好**: SSR/SSG支持，搜索引擎优化
7. **CI/CD**: GitHub Actions自动化部署
8. **Serverless**: Vercel Serverless Functions，按需付费

## 📊 项目进度

- [x] 需求文档编写（已完成）
- [x] 项目初始化（已完成）✅
  - [x] Monorepo结构搭建
  - [x] 前台Vue3项目配置
  - [x] 后台Element Plus项目配置
  - [x] 后端Express+Prisma项目配置
  - [x] 代码规范配置（ESLint、Prettier、Husky）
  - [x] 数据库模型设计
- [ ] 前台官网开发（进行中）🚧
  - [x] 项目结构搭建
  - [x] 路由配置
  - [x] 状态管理配置
  - [x] 布局组件（Header、Footer）
  - [x] 首页组件开发
    - [x] HeroBanner轮播组件
    - [x] ProductCategories分类展示
    - [x] FeaturedProducts精选产品
    - [x] BrandStory品牌故事
  - [x] 产品页面开发
    - [x] Products产品列表页（已修复图片显示）✅
    - [x] ProductDetail产品详情页
    - [x] ProductCard产品卡片组件
  - [x] 购物车功能
    - [x] Cart购物车页面
    - [x] Checkout结算页面
  - [x] 认证页面✅
    - [x] Login登录页面
    - [x] Register注册页面
    - [x] Header登录/注册入口
    - [x] 用户下拉菜单
    - [x] 退出登录功能
  - [x] 用户中心✅
    - [x] User用户中心主页
    - [x] Profile个人信息
    - [x] Orders订单列表
    - [x] Addresses收货地址
    - [x] Coupons优惠券
    - [x] Points积分
  - [x] 其他页面✅
    - [x] Academy美妆学院
    - [x] AcademyArticle文章详情
    - [x] About品牌故事
    - [x] Service客户服务
    - [x] Search搜索页面
    - [x] NotFound 404页面
- [x] 后台管理开发（已完成）✅
  - [x] 项目结构搭建
  - [x] 路由配置
  - [x] API服务封装（请求拦截、响应处理、所有API模块）
  - [x] 登录页面（已集成真实API）
  - [x] 数据仪表盘（已集成真实API和ECharts可视化）
  - [x] 商品管理（列表、搜索、筛选、删除）
  - [x] 商品分类管理（完整CRUD、树形结构）
  - [x] 订单管理（列表、搜索、详情、发货、完成）
  - [x] 用户管理（列表、搜索、状态管理）
  - [x] 优惠券管理（完整CRUD功能）
  - [x] 文章管理（完整CRUD、标签管理）
  - [x] 系统设置（基本信息、联系方式、SEO配置）
- [x] 后端API开发（已完成）✅
  - [x] 项目结构搭建
  - [x] 中间件配置
  - [x] 数据库模型
  - [x] 工具类（Prisma、响应、验证、JWT、密码）
  - [x] 认证接口（注册、登录、刷新令牌、用户信息）
  - [x] 商品接口（列表、详情、分类、热门、新品）
  - [x] 订单接口（创建、列表、详情、取消、确认、退款）
  - [x] 用户接口（地址、优惠券、收藏、积分）
  - [x] 后台管理接口（仪表盘、用户管理、评论管理、数据统计）
- [ ] 响应式适配（待进行）
- [ ] 测试与优化（待进行）
- [x] 部署配置（已完成）✅
  - [x] Vercel 配置文件
  - [x] 部署脚本
  - [x] 环境变量配置
  - [x] 部署文档

## 🎨 设计规范

### 色彩方案

- 主色调：优雅玫瑰金 (#E6C9B8) + 高贵深紫 (#4A2B4A)
- 辅助色：纯净白 (#FFFFFF) + 柔和灰 (#F5F5F5)
- 强调色：活力粉 (#FF6B9D) + 奢华金 (#D4AF37)

### 字体系统

- 中文：思源黑体 / 苹方 / PingFang SC
- 英文：Montserrat / Playfair Display

### 组件规范

- 按钮：大48px / 中40px / 小32px，圆角8px
- 输入框：高度40px，圆角8px
- 卡片：圆角12px，阴影0 2px 8px
- 间距：4px的倍数（4/8/12/16/24/32）

## 📈 性能指标

| 指标         | 目标   |
| ------------ | ------ |
| 首页加载时间 | <1.5秒 |
| API响应时间  | <200ms |
| 转化率       | >4%    |
| 系统可用性   | >99.9% |

## 🔒 安全措施

- HTTPS全站加密
- 密码加密存储（Bcrypt）
- JWT身份认证
- SQL注入防护
- XSS攻击防护
- CSRF防护
- 请求频率限制

## 🚀 快速部署

### ⚠️ 重要提示：前后端分离部署

本项目采用 **Monorepo 架构**，包含前端（`apps/web`）和后端（`apps/server`）两个应用。

**部署到 Vercel 时需要创建两个独立的 Project**：

- **Project 1**: 前端应用（Root Directory: `./`）
- **Project 2**: 后端 API（Root Directory: `apps/server`）

> 📖 **详细步骤**: 请查看 [**VERCEL_DUAL_DEPLOYMENT.md**](./VERCEL_DUAL_DEPLOYMENT.md) 获取完整的分离部署指南

### 快速检查配置

运行以下脚本检查项目配置是否正确：

```bash
# Windows
check-vercel-config.bat
```

### 部署到 Vercel

#### 方式一：通过 Vercel Dashboard（推荐）

**前端项目**：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 导入 Git 仓库，Root Directory 选择 `./`
3. 配置环境变量 `VITE_API_BASE_URL`

**后端项目**：

1. 再次导入**同一个仓库**
2. Root Directory 选择 `apps/server`
3. 配置数据库、JWT 等环境变量

#### 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 在项目根目录部署前端
vercel

# 在 apps/server 目录部署后端
cd apps/server
vercel
```

### 环境变量配置

**前端环境变量**：

| 变量名              | 值                                | 说明          |
| ------------------- | --------------------------------- | ------------- |
| `VITE_API_BASE_URL` | `https://your-api.vercel.app/api` | 后端 API 地址 |
| `VITE_BASE_URL`     | `/`                               | 应用基础路径  |

**后端环境变量**：

| 变量名         | 值                                 | 说明             |
| -------------- | ---------------------------------- | ---------------- |
| `DATABASE_URL` | `postgresql://...`                 | 数据库连接字符串 |
| `JWT_SECRET`   | `your-secret-key`                  | JWT 密钥         |
| `CORS_ORIGIN`  | `https://your-frontend.vercel.app` | 允许的前端域名   |
| `NODE_ENV`     | `production`                       | 运行环境         |

**📚 部署文档**:

- [前后端分离部署指南](./VERCEL_DUAL_DEPLOYMENT.md) ⭐ 推荐
- [单项目部署指南](./VERCEL_DEPLOYMENT_GUIDE.md)

## 🔧 故障排查

### 常见问题

#### 登录页面报 400 错误（数据库操作失败）

**问题描述**：访问管理后台登录页面时显示"数据库操作失败"和"Request failed with status code 400"

**原因**：Vercel 后端项目未配置数据库或数据库未初始化

**快速修复**：

1. 创建 Vercel Postgres 数据库
2. 配置 `DATABASE_URL` 环境变量
3. 执行数据库迁移
4. 创建管理员账号
5. 重新部署后端项目

**详细文档**：

- [⚡ 快速修复指南](./QUICK_FIX_DATABASE_400.md) - 15分钟快速解决
- [📖 数据库配置详细指南](./VERCEL_DATABASE_SETUP.md) - 完整配置说明

### 数据库管理工具

项目提供了便捷的数据库管理工具：

**在线诊断接口**（推荐）：

```
https://cosmetic-ve-server.vercel.app/api/diagnostic
```

**本地管理脚本**：

```powershell
# 进入 server 目录
cd apps/server

# 检查数据库状态
pnpm run check-db

# 创建管理员账号
pnpm run create-admin

# 执行数据库迁移
pnpm prisma migrate deploy

# 打开数据库管理界面
pnpm run prisma:studio
```

## 📝 开发规范

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链相关
```

### 分支管理

- `main`: 主分支，生产环境
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复分支

## 👥 团队角色

- 项目经理 × 1
- 前端工程师 × 2
- 后端工程师 × 2
- UI设计师 × 1
- 测试工程师 × 1

## 📅 项目周期

**总工期**: 8-10周
**开发模式**: 敏捷开发，2周一个迭代

## 📞 联系方式

## 如有问题，请联系项目负责人。

**文档版本**: v1.3
**创建日期**: 2025-11-21
**最后更新**: 2025-11-27 09:15

## 📝 最新更新

### 2025-11-27

- 🔧 添加数据库故障排查工具
  - 创建数据库状态检查脚本 `check-database.js`
  - 创建管理员账号生成工具 `create-admin.js`
  - 编写快速修复指南 `QUICK_FIX_DATABASE_400.md`
  - 编写数据库配置详细指南 `VERCEL_DATABASE_SETUP.md`
  - 更新 README 添加故障排查部分
  - 修复生产环境登录 400 错误问题

### 2025-11-26

- ✅ 完成 Vercel 部署配置
  - 优化 `vercel.json` 配置文件
  - 添加 `.vercelignore` 文件
  - 创建部署脚本 `deploy-vercel.bat`
  - 编写完整的部署指南文档
  - 配置环境变量模板

### 2025-11-21

- ✅ 完成后端API开发（54个接口，新增文章管理7个接口）
- ✅ 完成后台管理系统API服务层封装
- ✅ 登录页面集成真实API
- ✅ 数据仪表盘集成真实API和ECharts图表
- ✅ 商品列表集成真实API（搜索、筛选、分页、删除）
- ✅ 商品分类管理完整实现（树形结构、CRUD）
- ✅ 订单列表集成真实API（搜索、详情、发货、完成）
- ✅ 用户列表集成真实API（搜索、筛选、状态管理）
- ✅ 优惠券管理完整CRUD功能
- ✅ 文章管理完整实现（CRUD、标签、分页）
- ✅ 系统设置完整实现（基本信息、联系方式、SEO、其他设置）
- 📄 详细开发日志：`docs/DEVELOPMENT_LOG.md`
