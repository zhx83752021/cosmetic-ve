// Vercel Serverless Function - 处理所有 /api/* 请求
// 由 Vercel 自动识别为 catch-all（[...path].js），req.url 仍是原始 /api/xxx
import app from '../apps/server/dist/index.js'

export default app
