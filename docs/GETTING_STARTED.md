# 项目启动指南

## 环境要求

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 16
- Redis >= 7（可选，用于缓存）

## 快速开始

### 1. 安装依赖

```bash
# 安装pnpm（如果未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 2. 配置环境变量

复制后端环境变量示例文件：

```bash
cp apps/server/.env.example apps/server/.env
```

编辑 `apps/server/.env` 文件，配置数据库连接：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/cosmetics_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
```

### 3. 初始化数据库

```bash
# 进入server目录
cd apps/server

# 生成Prisma客户端
pnpm prisma:generate

# 运行数据库迁移
pnpm prisma:migrate

# 返回根目录
cd ../..
```

### 4. 启动开发服务器

```bash
# 启动所有服务（前台、后台、后端）
pnpm dev
```

或者分别启动：

```bash
# 前台官网 - http://localhost:3000
cd apps/frontend && pnpm dev

# 后台管理 - http://localhost:3002
cd apps/admin && pnpm dev

# 后端API - http://localhost:3001
cd apps/server && pnpm dev
```

### 5. 访问应用

- 前台官网: http://localhost:3000
- 后台管理: http://localhost:3002
- API文档: http://localhost:3001/api/test

## 项目结构

```
cosmetics-platform/
├── apps/
│   ├── frontend/              # 前台官网
│   │   ├── src/
│   │   │   ├── assets/        # 静态资源
│   │   │   ├── components/    # 组件
│   │   │   ├── views/         # 页面
│   │   │   ├── stores/        # 状态管理
│   │   │   ├── router/        # 路由
│   │   │   └── types/         # 类型定义
│   │   └── package.json
│   ├── admin/                 # 后台管理
│   │   ├── src/
│   │   │   ├── layout/        # 布局
│   │   │   ├── views/         # 页面
│   │   │   └── router/        # 路由
│   │   └── package.json
│   └── server/                # 后端服务
│       ├── src/
│       │   ├── middleware/    # 中间件
│       │   ├── routes/        # 路由
│       │   └── index.ts       # 入口
│       ├── prisma/
│       │   └── schema.prisma  # 数据库模型
│       └── package.json
├── packages/                  # 共享包（待实现）
├── docs/                      # 项目文档
├── package.json               # 根配置
└── pnpm-workspace.yaml        # Monorepo配置
```

## 开发命令

```bash
# 开发
pnpm dev              # 启动所有应用
pnpm dev --filter @cosmetics/frontend   # 只启动前台
pnpm dev --filter @cosmetics/admin      # 只启动后台
pnpm dev --filter @cosmetics/server     # 只启动后端

# 构建
pnpm build            # 构建所有应用

# 代码检查
pnpm lint             # 检查所有代码
pnpm format           # 格式化代码

# 测试
pnpm test             # 运行测试

# 清理
pnpm clean            # 清理构建产物和依赖
```

## 数据库管理

```bash
# 进入server目录
cd apps/server

# 生成Prisma客户端
pnpm prisma:generate

# 创建迁移
pnpm prisma:migrate

# 打开Prisma Studio（数据库可视化工具）
pnpm prisma:studio
```

## 常见问题

### 1. 依赖安装失败

确保使用的是pnpm而不是npm或yarn：

```bash
pnpm install
```

### 2. 数据库连接失败

检查PostgreSQL是否正在运行：

```bash
# Windows
# 在服务管理器中检查PostgreSQL服务状态

# Linux/Mac
sudo systemctl status postgresql
```

### 3. 端口被占用

修改各应用的端口配置：

- 前台: `apps/frontend/vite.config.ts` 中的 `server.port`
- 后台: `apps/admin/vite.config.ts` 中的 `server.port`
- 后端: `apps/server/.env` 中的 `PORT`

## 下一步

- 查看 [API接口文档](../需求文档-06-API接口文档.md)
- 查看 [数据库设计](../需求文档-05-数据库设计.md)
- 查看 [技术架构设计](../需求文档-04-技术架构设计.md)
