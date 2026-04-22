# 部署与环境（可复现流程）

目标：不依赖本机「神奇路径」，任何人在 **Node 20 + pnpm 8** 下按步骤可完成安装与构建。

## 1. 仓库与工具

- **Node.js** ≥ 20（与 `package.json` 的 `engines` 一致）
- **pnpm** 8（与 `packageManager` 字段一致，可用 `corepack enable` 后 `corepack prepare pnpm@8.12.1 --activate`）
- 克隆后进入仓库根目录，所有命令默认在**根目录**执行。

## 2. 环境变量（全量构建必看）

| 用途              | 变量                                   | 说明                                                                           |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| 后端与 Prisma     | `DATABASE_URL`                         | PostgreSQL 连接串，**全量 `pnpm run build` 时必需**（`prisma migrate deploy`） |
| 前端生产 API 基址 | 见 `apps/web/.env.production` / Vercel | 如 `VITE_API_BASE_URL`（以项目内实际为准）                                     |
| 后端 JWT 等       | 见 `apps/server/.env.example`          | 开发/生产按环境填写                                                            |

**本地建议**：将 `apps/server/.env.example` 复制为 `apps/server/.env` 并填写 `DATABASE_URL`；根目录执行全量构建前在 shell 中导出同一变量，或仅保证子进程能读到该文件（视你的 dotenv 加载方式而定；当前根 `build` 通过 workspace 调起 server build，**请确保已设置 `DATABASE_URL` 到进程环境**）。

## 3. 安装依赖（单条命令）

```bash
pnpm install --no-frozen-lockfile
```

（与 `vercel.json` 中 `installCommand` 思路一致，避免锁文件在少数环境下不兼容。CI 中亦使用此方式。）

## 4. 构建：两档

### 4.1 仅前端（与 PR / 日常 CI 一致）

```bash
pnpm run build:web
```

产物：`apps/web/dist`。

### 4.2 全量 monorepo（与 Vercel 根项目 / 生产一致）

**前提**：已设置可写的 `DATABASE_URL`（`migrate deploy` 会改库结构）。

```bash
# 已设置 DATABASE_URL 时（Linux/macOS）
export DATABASE_URL="postgresql://..."
pnpm run verify:full
```

`verify:full` 实际执行根目录的 `pnpm run build`：各 workspace 构建 + `scripts/prepare-deploy.js` 将 `apps/web/dist` 合并到 `public/` 等，与现有部署脚本一致。

**Windows PowerShell 示例**：

```powershell
$env:DATABASE_URL = "postgresql://用户:密码@主机:5432/库名"
pnpm run verify:full
```

若未设 `DATABASE_URL`，脚本会**直接退出并提示**，避免误报「构建成功」。

## 5. Vercel

- 根 `vercel.json` 的 `buildCommand` / `installCommand` 与上面对齐；**务必在 Vercel 项目 Environment Variables 中配置 `DATABASE_URL`（及前端 `VITE_*` 等）**。
- 更细的前后端拆分、双项目部署见仓库内 `VERCEL_DUAL_DEPLOYMENT.md`（若存在）及 `README.md` 的「快速部署」章节。

## 6. GitHub：全量构建工作流

仓库提供 **「全量构建（与生产一致）」** 工作流（`workflow_dispatch` 手动运行）：

1. 打开 **Settings → Secrets and variables → Actions**
2. 添加 **`DATABASE_URL`**（以及后续若全量需要补充的其它机密）
3. 在 **Actions** 中选中对应工作流，**Run workflow**

未配置机密时，请勿期望该工作流在云端成功执行数据库迁移；此时请优先使用本地 `verify:full` 或只跑 `build:web`。

## 7. 与「死代码/重复目录」相关的前端说明

- 用户端可复用组件**统一在** `apps/web/src/components/` 下分目录（`layout` / `home` / `auth` / `icons` / `products` 等）。
- `unplugin-vue-components` 的扫描目录与上述一致，避免再出现 `modules/user/components` 与 `components` 双份实现。

## 8. 故障速查

| 现象                   | 可能原因                                                  |
| ---------------------- | --------------------------------------------------------- |
| `prisma migrate` 失败  | 未设 `DATABASE_URL` 或库不可达/权限不足                   |
| 仅本机 Vite 找不到     | 在仓库根执行 `pnpm install`；使用 Node 20                 |
| Vercel 上无最新 commit | 构建失败 → 看 Deployments 日志；检查机密与 `buildCommand` |

更新日期：以仓库 `docs/DEPLOY.md` 为准。
