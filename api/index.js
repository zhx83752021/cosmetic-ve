// Vercel Serverless Function - 统一处理所有 /api/* 请求
// vercel.json 通过 rewrites 把 /api/:path* 映射到 /api?__p=:path*
// 这里根据 query 中的 __p 还原原始 URL，再交给编译后的 Express App 处理
import app from '../apps/server/dist/index.js'

export default function handler(req, res) {
  try {
    const raw = req.query && req.query.__p
    if (raw) {
      const segs = Array.isArray(raw) ? raw : [raw]
      const pathStr = segs.filter(Boolean).join('/')

      const qIndex = (req.url || '').indexOf('?')
      const queryPart = qIndex >= 0 ? (req.url || '').slice(qIndex + 1) : ''
      const params = new URLSearchParams(queryPart)
      params.delete('__p')
      const qsStr = params.toString()

      req.url = '/api/' + pathStr + (qsStr ? '?' + qsStr : '')
      delete req.query.__p
    } else if (req.url === '/' || req.url === '') {
      // 直接访问 /api（rewrites 规则下 __p 为空）
      req.url = '/api'
    }
  } catch (_) {
    // 忽略 URL 还原异常，继续交给 Express
  }
  return app(req, res)
}
