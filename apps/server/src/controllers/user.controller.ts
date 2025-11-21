import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { successResponse, paginatedResponse } from '../utils/response.js'
import { AppError } from '../middleware/errorHandler.js'

/**
 * 获取用户地址列表
 */
export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const addresses = await prisma.address.findMany({
            where: { userId: req.userId },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' },
            ],
        })

        return successResponse(res, addresses)
    } catch (error) {
        next(error)
    }
}

/**
 * 获取地址详情
 */
export const getAddressById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { id } = req.params

        const address = await prisma.address.findFirst({
            where: {
                id: parseInt(id),
                userId: req.userId,
            },
        })

        if (!address) {
            throw new AppError(404, '地址不存在')
        }

        return successResponse(res, address)
    } catch (error) {
        next(error)
    }
}

/**
 * 创建地址
 */
export const createAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { name, phone, province, city, district, detail, isDefault } = req.body

        // 如果设置为默认地址，先取消其他默认地址
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.userId, isDefault: true },
                data: { isDefault: false },
            })
        }

        const address = await prisma.address.create({
            data: {
                userId: req.userId,
                name,
                phone,
                province,
                city,
                district,
                detail,
                isDefault: isDefault || false,
            },
        })

        return successResponse(res, address, '地址添加成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 更新地址
 */
export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { id } = req.params
        const { name, phone, province, city, district, detail, isDefault } = req.body

        // 检查地址是否存在
        const existingAddress = await prisma.address.findFirst({
            where: {
                id: parseInt(id),
                userId: req.userId,
            },
        })

        if (!existingAddress) {
            throw new AppError(404, '地址不存在')
        }

        // 如果设置为默认地址，先取消其他默认地址
        if (isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: req.userId,
                    isDefault: true,
                    id: { not: parseInt(id) },
                },
                data: { isDefault: false },
            })
        }

        const address = await prisma.address.update({
            where: { id: parseInt(id) },
            data: {
                name,
                phone,
                province,
                city,
                district,
                detail,
                isDefault,
            },
        })

        return successResponse(res, address, '地址更新成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 删除地址
 */
export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { id } = req.params

        const address = await prisma.address.findFirst({
            where: {
                id: parseInt(id),
                userId: req.userId,
            },
        })

        if (!address) {
            throw new AppError(404, '地址不存在')
        }

        await prisma.address.delete({
            where: { id: parseInt(id) },
        })

        return successResponse(res, null, '地址删除成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 获取用户优惠券列表
 */
export const getUserCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { status } = req.query

        const where: any = {
            userId: req.userId,
        }

        if (status) {
            where.status = status
        }

        const coupons = await prisma.userCoupon.findMany({
            where,
            include: {
                coupon: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return successResponse(res, coupons)
    } catch (error) {
        next(error)
    }
}

/**
 * 领取优惠券
 */
export const claimCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { couponId } = req.body

        // 检查优惠券是否存在
        const coupon = await prisma.coupon.findUnique({
            where: { id: couponId },
        })

        if (!coupon) {
            throw new AppError(404, '优惠券不存在')
        }

        if (coupon.status !== 'active') {
            throw new AppError(400, '优惠券已失效')
        }

        const now = new Date()
        if (now < coupon.startTime || now > coupon.endTime) {
            throw new AppError(400, '优惠券未在有效期内')
        }

        if (coupon.used >= coupon.total) {
            throw new AppError(400, '优惠券已领完')
        }

        // 检查用户是否已经领取过
        const existingUserCoupon = await prisma.userCoupon.findFirst({
            where: {
                userId: req.userId,
                couponId,
            },
        })

        if (existingUserCoupon) {
            throw new AppError(400, '您已经领取过该优惠券')
        }

        // 领取优惠券
        const userCoupon = await prisma.userCoupon.create({
            data: {
                userId: req.userId,
                couponId,
            },
            include: {
                coupon: true,
            },
        })

        // 更新优惠券已领取数量
        await prisma.coupon.update({
            where: { id: couponId },
            data: { used: { increment: 1 } },
        })

        return successResponse(res, userCoupon, '优惠券领取成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 获取可用优惠券
 */
export const getAvailableCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const now = new Date()

        const coupons = await prisma.coupon.findMany({
            where: {
                status: 'active',
                startTime: { lte: now },
                endTime: { gte: now },
                used: { lt: prisma.coupon.fields.total },
            },
            orderBy: { createdAt: 'desc' },
        })

        return successResponse(res, coupons)
    } catch (error) {
        next(error)
    }
}

/**
 * 获取用户收藏列表
 */
export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const {
            page = 1,
            pageSize = 12,
        } = req.query

        const pageNum = parseInt(page as string)
        const pageSizeNum = parseInt(pageSize as string)
        const skip = (pageNum - 1) * pageSizeNum

        const [favorites, total] = await Promise.all([
            prisma.favorite.findMany({
                where: { userId: req.userId },
                include: {
                    product: {
                        include: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSizeNum,
            }),
            prisma.favorite.count({ where: { userId: req.userId } }),
        ])

        return paginatedResponse(res, favorites, total, pageNum, pageSizeNum)
    } catch (error) {
        next(error)
    }
}

/**
 * 添加收藏
 */
export const addFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { productId } = req.body

        // 检查商品是否存在
        const product = await prisma.product.findUnique({
            where: { id: productId },
        })

        if (!product) {
            throw new AppError(404, '商品不存在')
        }

        // 检查是否已收藏
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: req.userId,
                    productId,
                },
            },
        })

        if (existingFavorite) {
            throw new AppError(400, '已经收藏过该商品')
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: req.userId,
                productId,
            },
            include: {
                product: true,
            },
        })

        return successResponse(res, favorite, '收藏成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 取消收藏
 */
export const removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { productId } = req.params

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: req.userId,
                    productId: parseInt(productId),
                },
            },
        })

        if (!favorite) {
            throw new AppError(404, '未收藏该商品')
        }

        await prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId: req.userId,
                    productId: parseInt(productId),
                },
            },
        })

        return successResponse(res, null, '取消收藏成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 检查是否收藏
 */
export const checkFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const { productId } = req.params

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: req.userId,
                    productId: parseInt(productId),
                },
            },
        })

        return successResponse(res, { isFavorite: !!favorite })
    } catch (error) {
        next(error)
    }
}

/**
 * 获取用户积分记录
 */
export const getPointsHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            throw new AppError(401, '未登录')
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                points: true,
                level: true,
            },
        })

        return successResponse(res, {
            currentPoints: user?.points || 0,
            level: user?.level || 1,
            // 实际项目中应该有积分记录表
            history: [],
        })
    } catch (error) {
        next(error)
    }
}
