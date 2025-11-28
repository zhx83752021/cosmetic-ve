import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler.js'

export interface AuthRequest extends Request {
    userId?: number
    userRole?: string
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            throw new AppError(401, '未提供认证令牌')
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: number
            role: string
        }

        req.userId = decoded.userId
        req.userRole = decoded.role

        next()
    } catch (error) {
        next(error)
    }
}

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return next(new AppError(403, '权限不足'))
        }
        next()
    }
}
