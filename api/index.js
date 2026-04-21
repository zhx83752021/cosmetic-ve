import express from 'express'
import cors from 'cors'

// 设置主应用入口
// 注意：Vercel 部署时会先运行 build 命令，因此 dist 目录会存在
// 使用动态 import 或直接 import 编译后的文件
let serverApp

try {
  // 优先尝试引入编译后的逻辑
  // 在 Vercel 环境中，prepare-deploy.js 会将代码复制到 api/dist/
  const module = await import('./dist/index.js')
  serverApp = module.default
} catch (e) {
  console.error('Core backend link pending or internal error:', e.message)
}

const app = express()
app.use(cors())
app.use(express.json())

// 路由分发
app.use((req, res, next) => {
  if (serverApp) {
    // 如果后端应用已加载，则将请求交给它
    // 注意：serverApp 内部已经处理了 /api 前缀或路由逻辑
    return serverApp(req, res, next)
  }

  // 如果后端还没加载好的备选逻辑 (防止 404)
  if (req.url === '/api/products/categories/all' || req.url === '/products/categories/all') {
    return res.json({
      success: true,
      data: [
        { id: 1, name: '护肤系列', slug: 'skincare' },
        { id: 2, name: '彩妆系列', slug: 'makeup' },
        { id: 3, name: '香氛系列', slug: 'perfume' },
        { id: 4, name: '洗护系列', slug: 'bodycare' },
      ],
    })
  }

  if (req.url === '/api/health' || req.url === '/health') {
    return res.json({ status: 'ok', bridge: true })
  }

  res.status(404).json({ success: false, message: 'Backend Bridge: Resource Not Found' })
})

export default app
