/**
 * 与生产/ Vercel 同类：根目录执行 pnpm run build（整仓 + prepare-deploy.js）
 * 必须能连上数据库：apps/server 的 build 会执行 prisma migrate deploy
 */
const { spawnSync } = require('child_process')
const path = require('path')

const root = path.join(__dirname, '..')

if (!process.env.DATABASE_URL) {
  console.error('[verify-full-build] 未设置 DATABASE_URL。')
  console.error('  在 apps/server 配置 .env，或在当前 shell:')
  console.error('  set DATABASE_URL=postgresql://...   (Windows PowerShell: $env:DATABASE_URL=...)')
  console.error('  然后再次: pnpm run verify:full')
  console.error('  说明见: docs/DEPLOY.md')
  process.exit(1)
}

const r = spawnSync('pnpm', ['run', 'build'], {
  stdio: 'inherit',
  cwd: root,
  env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' },
  shell: process.platform === 'win32',
})

process.exit(r.status === 0 ? 0 : 1)
