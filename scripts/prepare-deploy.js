/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')
const path = require('path')

// 复制目录的递归函数
function copyDir(src, dest) {
  // 创建目标目录
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  // 读取源目录
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

console.log('📦 准备 Vercel 部署文件...')

// 1. 复制前端构建产物到 public 目录
const webDist = path.join(__dirname, '..', 'apps', 'web', 'dist')
const publicDir = path.join(__dirname, '..', 'public')

if (fs.existsSync(webDist)) {
  console.log('✅ 复制前端构建产物到 public/ ...')
  copyDir(webDist, publicDir)
} else {
  console.error('❌ 错误: apps/web/dist 目录不存在')
  process.exit(1)
}

// 1b. 兜底：将 apps/web/public 下的静态资源再合并一次
// （防止 Vite 未将 publicDir 正确复制到 dist 导致 /images、/uploads 等 404）
const webPublic = path.join(__dirname, '..', 'apps', 'web', 'public')
if (fs.existsSync(webPublic)) {
  console.log('✅ 合并 apps/web/public 静态资源到 public/ ...')
  copyDir(webPublic, publicDir)
}

// 2. 复制后端编译产物到 api/dist
const serverDist = path.join(__dirname, '..', 'apps', 'server', 'dist')
const apiDist = path.join(__dirname, '..', 'api', 'dist')

if (fs.existsSync(serverDist)) {
  console.log('✅ 复制后端编译产物到 api/dist/ ...')
  copyDir(serverDist, apiDist)
  console.log('✅ 后端 API 文件准备完成！')
} else {
  console.error('❌ 错误: apps/server/dist 目录不存在')
  process.exit(1)
}

// 3. 创建调试标记文件
function listSafe(dir) {
  try {
    return fs.existsSync(dir) ? fs.readdirSync(dir).slice(0, 50) : null
  } catch (_) {
    return null
  }
}
const debugFile = path.join(publicDir, 'deploy-debug.json')
const debugData = {
  deployedAt: new Date().toISOString(),
  webDistExists: fs.existsSync(webDist),
  serverDistExists: fs.existsSync(serverDist),
  apiDirExists: fs.existsSync(path.join(__dirname, '..', 'api')),
  nodeVersion: process.version,
  publicTopLevel: listSafe(publicDir),
  publicImages: listSafe(path.join(publicDir, 'images')),
  publicUploadsProducts: listSafe(path.join(publicDir, 'uploads', 'products')),
}
fs.writeFileSync(debugFile, JSON.stringify(debugData, null, 2))
console.log('✅ 调试标记文件已创建: /deploy-debug.json')

console.log('✅ 部署文件准备完成！')
