import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'
import routes from './routes/index.js'
// 加载环境变量
dotenv.config()
const app: express.Express = express()
const PORT = process.env.PORT || 3001

// Vercel / 反向代理环境下信任一层代理，避免 express-rate-limit
// 抛出 ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1)

// 安全中间件
app.use(helmet())
// CORS配置 - 智能检测环境
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
const isDevelopment = !isProduction
// 生产环境白名单
const productionOrigins = [
  'https://hi-ultra.com',
  'https://www.hi-ultra.com',
  'https://cosmetic-ve.vercel.app',
  'https://cosmetic-ve-git-main-zhx83752021s-projects.vercel.app', // Vercel Git 分支
]
// 如果设置了自定义 CORS_ORIGINS，添加到白名单
if (process.env.CORS_ORIGINS) {
  productionOrigins.push(...process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()))
}
// CORS 配置
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(
      `🔍 CORS检查 - Origin: ${origin}, 环境: ${isProduction ? 'production' : 'development'}`
    )

    // 允许没有 origin 的请求（如 Postman、服务器端请求）
    if (!origin) {
      console.log('✅ 允许无origin请求')
      return callback(null, true)
    }

    // 开发环境：允许所有 localhost
    if (isDevelopment && origin.startsWith('http://localhost:')) {
      console.log('✅ 开发环境 - 允许localhost')
      return callback(null, true)
    }

    // 生产环境：允许所有 Vercel 域名
    if (isProduction && origin.endsWith('.vercel.app')) {
      console.log('✅ 生产环境 - 允许Vercel域名')
      return callback(null, true)
    }

    // 检查生产环境白名单
    if (productionOrigins.includes(origin)) {
      console.log('✅ 白名单匹配成功')
      return callback(null, true)
    }

    // 记录被拒绝的来源以便调试
    console.warn(`❌ CORS blocked origin: ${origin}`)
    console.warn(`   白名单: ${JSON.stringify(productionOrigins)}`)
    callback(new Error(`CORS not allowed for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 预检请求缓存 24 小时
  preflightContinue: false,
  optionsSuccessStatus: 204,
}

app.use(cors(corsOptions))

// 显式处理 OPTIONS 预检请求
app.options('*', cors(corsOptions))
// 请求体解析
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// 请求日志
app.use(requestLogger)
// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
  message: '请求过于频繁，请稍后再试',
})
app.use('/api/', limiter)

// 健康检查处理函数
const healthCheck = (req: express.Request, res: express.Response) => {
  const hasDatabase = !!process.env.DATABASE_URL
  const hasJwtSecret = !!process.env.JWT_SECRET

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      isVercel: process.env.VERCEL === '1',
      hasDatabase,
      hasJwtSecret,
    },
    cors: {
      allowedOrigins: productionOrigins,
    },
  })
}

// 健康检查（支持两种路径）
app.get('/health', healthCheck)
app.get('/api/health', healthCheck)

// API路由
app.use('/api', routes)
// 404处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' })
})
// 错误处理
app.use(errorHandler)
// 启动服务器（仅在非 Vercel 环境）
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`)
    console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`)
  })
}
export default app
