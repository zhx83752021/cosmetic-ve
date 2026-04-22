import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('❌ 错误:', err)
  console.error('错误堆栈:', err.stack)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
  }

  // cors 包在拒绝 origin 时会 next(普通 Error)，否则表现为 500「服务器错误」
  if (err.message?.includes('CORS not allowed for origin:')) {
    return res.status(403).json({
      success: false,
      message: '该来源未在服务端 CORS 白名单中，请在环境变量 CORS_ORIGINS 中配置前端域名',
    })
  }

  // 处理Prisma错误
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: '数据库操作失败',
    })
  }

  // 处理Prisma初始化错误
  if (err.name === 'PrismaClientInitializationError') {
    console.error('❌ Prisma 初始化失败 - 可能缺少 DATABASE_URL')
    return res.status(500).json({
      success: false,
      message: '数据库连接失败',
      error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    })
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '无效的认证令牌',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: '认证令牌已过期',
    })
  }

  // 默认服务器错误
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? '服务器错误' : err.message,
    error: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  })
}
