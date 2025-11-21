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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('❌ 错误:', err)

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        })
    }

    // 处理Prisma错误
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            success: false,
            message: '数据库操作失败',
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
    })
}
