// Vercel Serverless Function - /api 根路径入口
// 直接复用编译后的 Express App，由 nft 静态追踪所有后端依赖
import app from '../apps/server/dist/index.js'

export default app
