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

// 复制前端构建产物到 public 目录
const webDist = path.join(__dirname, '..', 'apps', 'web', 'dist')
const publicDir = path.join(__dirname, '..', 'public')

if (fs.existsSync(webDist)) {
  console.log('✅ 复制前端构建产物到 public/ ...')
  copyDir(webDist, publicDir)
  console.log('✅ 部署文件准备完成！')
} else {
  console.error('❌ 错误: apps/web/dist 目录不存在')
  process.exit(1)
}
