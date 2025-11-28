# 项目文件结构

```
cosmetics-platform/
│
├── .github/                          # GitHub配置（待添加）
│   └── workflows/                    # CI/CD工作流
│
├── .husky/                          # Git钩子
│   ├── pre-commit                   # 提交前检查
│   └── commit-msg                   # 提交信息验证
│
├── .vscode/                         # VSCode配置
│   ├── extensions.json              # 推荐扩展
│   └── settings.json                # 编辑器设置
│
├── apps/                            # 应用目录
│   │
│   ├── frontend/                    # 前台官网 (Vue3 + TailwindCSS)
│   │   ├── public/                  # 静态资源
│   │   ├── src/
│   │   │   ├── assets/             # 资源文件
│   │   │   │   └── styles/         # 样式文件
│   │   │   │       └── main.css    # 主样式文件（TailwindCSS）
│   │   │   ├── components/         # 组件
│   │   │   │   ├── home/           # 首页组件
│   │   │   │   ├── icons/          # 图标组件
│   │   │   │   └── layout/         # 布局组件
│   │   │   │       ├── AppHeader.vue
│   │   │   │       └── AppFooter.vue
│   │   │   ├── router/             # 路由
│   │   │   │   └── index.ts        # 路由配置
│   │   │   ├── stores/             # 状态管理
│   │   │   │   ├── user.ts         # 用户状态
│   │   │   │   └── cart.ts         # 购物车状态
│   │   │   ├── types/              # 类型定义
│   │   │   │   └── index.ts
│   │   │   ├── views/              # 页面视图
│   │   │   │   ├── Home.vue
│   │   │   │   ├── Products.vue
│   │   │   │   ├── ProductDetail.vue
│   │   │   │   ├── Cart.vue
│   │   │   │   ├── Checkout.vue
│   │   │   │   ├── User.vue
│   │   │   │   ├── Academy.vue
│   │   │   │   ├── About.vue
│   │   │   │   ├── Service.vue
│   │   │   │   └── user/           # 用户中心子页面
│   │   │   ├── App.vue             # 根组件
│   │   │   └── main.ts             # 入口文件
│   │   ├── index.html              # HTML模板
│   │   ├── package.json            # 依赖配置
│   │   ├── tsconfig.json           # TypeScript配置
│   │   ├── vite.config.ts          # Vite配置
│   │   ├── tailwind.config.js      # TailwindCSS配置
│   │   └── postcss.config.js       # PostCSS配置
│   │
│   ├── admin/                       # 后台管理 (Vue3 + Element Plus)
│   │   ├── public/                  # 静态资源
│   │   ├── src/
│   │   │   ├── assets/             # 资源文件
│   │   │   │   └── styles/
│   │   │   │       └── main.css    # 主样式文件
│   │   │   ├── layout/             # 布局组件
│   │   │   │   └── index.vue       # 主布局
│   │   │   ├── router/             # 路由
│   │   │   │   └── index.ts        # 路由配置
│   │   │   ├── stores/             # 状态管理
│   │   │   ├── views/              # 页面视图
│   │   │   │   ├── Login.vue
│   │   │   │   ├── Dashboard.vue
│   │   │   │   ├── NotFound.vue
│   │   │   │   ├── products/       # 商品管理
│   │   │   │   ├── orders/         # 订单管理
│   │   │   │   ├── users/          # 用户管理
│   │   │   │   ├── marketing/      # 营销管理
│   │   │   │   ├── content/        # 内容管理
│   │   │   │   └── settings/       # 系统设置
│   │   │   ├── App.vue             # 根组件
│   │   │   └── main.ts             # 入口文件
│   │   ├── index.html              # HTML模板
│   │   ├── package.json            # 依赖配置
│   │   ├── tsconfig.json           # TypeScript配置
│   │   └── vite.config.ts          # Vite配置
│   │
│   └── server/                      # 后端服务 (Express + Prisma)
│       ├── prisma/
│       │   └── schema.prisma       # 数据库模型
│       ├── src/
│       │   ├── middleware/         # 中间件
│       │   │   ├── auth.ts         # 认证中间件
│       │   │   ├── errorHandler.ts # 错误处理
│       │   │   └── logger.ts       # 日志中间件
│       │   ├── routes/             # 路由
│       │   │   └── index.ts        # 路由入口
│       │   └── index.ts            # 服务入口
│       ├── .env.example            # 环境变量示例
│       ├── package.json            # 依赖配置
│       └── tsconfig.json           # TypeScript配置
│
├── packages/                        # 共享包（待开发）
│   ├── shared/                     # 共享代码
│   └── ui/                         # UI组件库
│
├── docs/                           # 项目文档
│   ├── GETTING_STARTED.md         # 快速开始指南
│   └── PROGRESS.md                # 开发进度
│
├── 需求文档-01-项目概述与竞品分析.md
├── 需求文档-02-前台功能详细设计.md
├── 需求文档-03-后台管理系统.md
├── 需求文档-04-技术架构设计.md
├── 需求文档-05-数据库设计.md
├── 需求文档-06-API接口文档.md
├── 需求文档-07-部署运维方案.md
├── 需求文档-08-项目排期与里程碑.md
│
├── .eslintrc.cjs                   # ESLint配置
├── .gitignore                      # Git忽略文件
├── .lintstagedrc.cjs              # Lint-staged配置
├── .prettierrc                     # Prettier配置
├── .prettierignore                # Prettier忽略文件
├── commitlint.config.cjs          # Commitlint配置
├── package.json                    # 根依赖配置
├── pnpm-workspace.yaml            # pnpm workspace配置
├── PROJECT_STRUCTURE.md           # 本文件
├── README.md                       # 项目说明
├── tsconfig.json                   # 根TypeScript配置
└── turbo.json                      # Turbo配置
```

## 文件说明

### 配置文件

| 文件 | 说明 |
|------|------|
| `package.json` | 根项目依赖和脚本配置 |
| `pnpm-workspace.yaml` | Monorepo工作区配置 |
| `turbo.json` | Turbo构建系统配置 |
| `tsconfig.json` | TypeScript根配置 |
| `.eslintrc.cjs` | ESLint代码检查配置 |
| `.prettierrc` | Prettier代码格式化配置 |
| `commitlint.config.cjs` | Git提交信息规范配置 |
| `.lintstagedrc.cjs` | Git暂存文件检查配置 |

### 前台官网 (apps/frontend)

**端口**: 3000
**技术栈**: Vue 3 + TypeScript + Vite + TailwindCSS + Pinia

**主要文件**:
- `vite.config.ts` - Vite构建配置
- `tailwind.config.js` - TailwindCSS样式配置
- `src/router/index.ts` - 路由配置（13个路由）
- `src/stores/user.ts` - 用户状态管理
- `src/stores/cart.ts` - 购物车状态管理
- `src/types/index.ts` - TypeScript类型定义

### 后台管理 (apps/admin)

**端口**: 3002
**技术栈**: Vue 3 + TypeScript + Vite + Element Plus + Pinia

**主要文件**:
- `vite.config.ts` - Vite构建配置，集成Element Plus
- `src/router/index.ts` - 路由配置（管理模块）
- `src/layout/index.vue` - 主布局组件
- `src/assets/styles/main.css` - 自定义主题样式

### 后端服务 (apps/server)

**端口**: 3001
**技术栈**: Node.js + Express + TypeScript + Prisma + PostgreSQL

**主要文件**:
- `src/index.ts` - 服务入口
- `prisma/schema.prisma` - 数据库模型（11个表）
- `src/middleware/auth.ts` - JWT认证
- `src/middleware/errorHandler.ts` - 统一错误处理
- `.env.example` - 环境变量配置示例

## 数据库表结构

已定义的Prisma模型：

1. **User** - 用户表
2. **Category** - 商品分类表
3. **Product** - 商品表
4. **ProductSku** - 商品SKU表
5. **Order** - 订单表
6. **OrderItem** - 订单项表
7. **Address** - 收货地址表
8. **Coupon** - 优惠券表
9. **UserCoupon** - 用户优惠券表
10. **Article** - 文章表
11. **Review** - 评论表
12. **Favorite** - 收藏表

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（启动所有应用）
pnpm dev

# 单独启动某个应用
pnpm --filter @cosmetics/frontend dev
pnpm --filter @cosmetics/admin dev
pnpm --filter @cosmetics/server dev

# 构建
pnpm build

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 数据库操作
cd apps/server
pnpm prisma:generate    # 生成Prisma客户端
pnpm prisma:migrate     # 运行数据库迁移
pnpm prisma:studio      # 打开数据库可视化工具
```

## 环境变量

### 后端服务 (.env)

```env
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/cosmetics_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

## 端口分配

| 应用 | 端口 | 说明 |
|------|------|------|
| 前台官网 | 3000 | 用户访问的前台网站 |
| 后端API | 3001 | RESTful API服务 |
| 后台管理 | 3002 | 管理员后台系统 |
| Prisma Studio | 5555 | 数据库可视化工具 |

## 代码规范

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

### 目录命名规范

- 组件文件：PascalCase（如 `ProductCard.vue`）
- 普通文件：kebab-case（如 `user-utils.ts`）
- 目录名：kebab-case（如 `user-center/`）

### 代码风格

- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 保存时自动格式化
- Git提交前自动检查和格式化
