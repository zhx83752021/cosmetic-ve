import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateTokenPair, verifyToken } from '../utils/jwt.js'
import { successResponse } from '../utils/response.js'
import { AppError } from '../middleware/errorHandler.js'

/**
 * 用户注册
 */
export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { phone, password, username, email } = req.body

        // 检查手机号是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { phone },
        })

        if (existingUser) {
            throw new AppError(400, '手机号已被注册')
        }

        // 加密密码
        const hashedPassword = await hashPassword(password)

        // 创建用户
        const user = await prisma.user.create({
            data: {
                password: hashedPassword,
                phone,
                nickname: `用户${phone.slice(-4)}`,
            },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                nickname: true,
                avatar: true,
                level: true,
                points: true,
                role: true,
                createdAt: true,
            },
        })

        // 生成令牌
        const tokens = generateTokenPair(user.id, user.role)

        return successResponse(res, {
            user,
            ...tokens,
        }, '注册成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 用户登录
 */
export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { account, password } = req.body

        // 查找用户（支持用户名、邮箱、手机号登录）
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: account },
                    { email: account },
                    { phone: account },
                ],
            },
        })

        if (!user) {
            throw new AppError(401, '账号或密码错误')
        }

        // 检查账号状态
        if (user.status === 'banned') {
            throw new AppError(403, '账号已被禁用')
        }

        // 验证密码
        const isPasswordValid = await comparePassword(password, user.password)
        if (!isPasswordValid) {
            throw new AppError(401, '账号或密码错误')
        }

        // 生成令牌
        const tokens = generateTokenPair(user.id, user.role)

        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user

        return successResponse(res, {
            user: userWithoutPassword,
            ...tokens,
        }, '登录成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 刷新令牌
 */
export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            throw new AppError(401, '刷新令牌不能为空')
        }

        // 验证刷新令牌
        const decoded = verifyToken(refreshToken) as { userId: number } | null

        if (!decoded || !decoded.userId) {
            throw new AppError(401, '刷新令牌无效或已过期')
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        })

        if (!user) {
            throw new AppError(401, '用户不存在')
        }

        if (user.status === 'banned') {
            throw new AppError(403, '账号已被禁用')
        }

        // 生成新的令牌对
        const tokens = generateTokenPair(user.id, user.role)

        return successResponse(res, tokens, '令牌刷新成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                nickname: true,
                avatar: true,
                gender: true,
                birthday: true,
                level: true,
                points: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!user) {
            throw new AppError(404, '用户不存在')
        }

        return successResponse(res, user, '获取成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 更新用户信息
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { nickname, avatar, gender, birthday } = req.body

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(nickname && { nickname }),
                ...(avatar && { avatar }),
                ...(gender && { gender }),
                ...(birthday && { birthday: new Date(birthday) }),
            },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                nickname: true,
                avatar: true,
                gender: true,
                birthday: true,
                level: true,
                points: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return successResponse(res, user, '更新成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 修改密码
 */
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            throw new AppError(400, '旧密码和新密码不能为空')
        }

        if (newPassword.length < 6) {
            throw new AppError(400, '新密码至少6个字符')
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        })

        if (!user) {
            throw new AppError(404, '用户不存在')
        }

        // 验证旧密码
        const isPasswordValid = await comparePassword(oldPassword, user.password)
        if (!isPasswordValid) {
            throw new AppError(400, '旧密码错误')
        }

        // 加密新密码
        const hashedPassword = await hashPassword(newPassword)

        // 更新密码
        await prisma.user.update({
            where: { id: req.userId },
            data: { password: hashedPassword },
        })

        return successResponse(res, null, '密码修改成功')
    } catch (error) {
        next(error)
    }
}
