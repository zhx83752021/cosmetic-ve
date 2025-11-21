import type { Response, NextFunction } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { prisma } from '../utils/prisma.js'
import { successResponse, paginatedResponse } from '../utils/response.js'
import { AppError } from '../middleware/errorHandler.js'

/**
 * 获取商品列表
 */
export const getProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            pageSize = 12,
            categoryId,
            brand,
            minPrice,
            maxPrice,
            isNew,
            isHot,
            keyword,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query

        const pageNum = parseInt(page as string)
        const pageSizeNum = parseInt(pageSize as string)
        const skip = (pageNum - 1) * pageSizeNum

        // 构建查询条件
        const where: any = {
            status: 'active',
        }

        if (categoryId) {
            where.categoryId = parseInt(categoryId as string)
        }

        if (brand) {
            where.brand = brand
        }

        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice as string)
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string)
        }

        if (isNew === 'true') {
            where.isNew = true
        }

        if (isHot === 'true') {
            where.isHot = true
        }

        if (keyword) {
            where.OR = [
                { name: { contains: keyword as string, mode: 'insensitive' } },
                { subTitle: { contains: keyword as string, mode: 'insensitive' } },
                { description: { contains: keyword as string, mode: 'insensitive' } },
            ]
        }

        // 构建排序
        const orderBy: any = {}
        if (sortBy === 'price' || sortBy === 'sales' || sortBy === 'createdAt') {
            orderBy[sortBy] = sortOrder
        } else {
            orderBy.createdAt = 'desc'
        }

        // 查询商品
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: pageSizeNum,
            }),
            prisma.product.count({ where }),
        ])

        return paginatedResponse(res, products, total, pageNum, pageSizeNum)
    } catch (error) {
        next(error)
    }
}

/**
 * 获取商品详情
 */
export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                skus: true,
                reviews: {
                    where: { status: 'approved' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        })

        if (!product) {
            throw new AppError(404, '商品不存在')
        }

        // 增加浏览量（异步，不影响响应）
        prisma.product.update({
            where: { id: parseInt(id) },
            data: { sales: { increment: 0 } }, // 这里应该有一个views字段，暂时用sales代替
        }).catch(() => {})

        return successResponse(res, product)
    } catch (error) {
        next(error)
    }
}

/**
 * 创建商品（管理员）
 */
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            name,
            subTitle,
            images,
            price,
            originalPrice,
            categoryId,
            brand,
            stock,
            description,
            details,
            ingredients,
            usage,
            isNew,
            isHot,
        } = req.body

        const product = await prisma.product.create({
            data: {
                name,
                subTitle,
                images,
                price,
                originalPrice,
                categoryId,
                brand,
                stock,
                description,
                details,
                ingredients,
                usage,
                isNew,
                isHot,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return successResponse(res, product, '商品创建成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 更新商品（管理员）
 */
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return successResponse(res, product, '商品更新成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 删除商品（管理员）
 */
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        // 软删除：更新状态为inactive
        await prisma.product.update({
            where: { id: parseInt(id) },
            data: { status: 'inactive' },
        })

        return successResponse(res, null, '商品删除成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 获取商品分类列表
 */
export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { sort: 'asc' },
            include: {
                children: {
                    orderBy: { sort: 'asc' },
                },
                _count: {
                    select: { products: true },
                },
            },
            where: {
                parentId: null, // 只获取顶级分类
            },
        })

        return successResponse(res, categories)
    } catch (error) {
        next(error)
    }
}

/**
 * 获取分类详情
 */
export const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                children: {
                    orderBy: { sort: 'asc' },
                },
                parent: true,
                _count: {
                    select: { products: true },
                },
            },
        })

        if (!category) {
            throw new AppError(404, '分类不存在')
        }

        return successResponse(res, category)
    } catch (error) {
        next(error)
    }
}

/**
 * 创建分类（管理员）
 */
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, icon, image, parentId, sort } = req.body

        const category = await prisma.category.create({
            data: {
                name,
                icon,
                image,
                parentId,
                sort: sort || 0,
            },
        })

        return successResponse(res, category, '分类创建成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 更新分类（管理员）
 */
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updateData,
        })

        return successResponse(res, category, '分类更新成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 删除分类（管理员）
 */
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        // 检查是否有子分类
        const childrenCount = await prisma.category.count({
            where: { parentId: parseInt(id) },
        })

        if (childrenCount > 0) {
            throw new AppError(400, '该分类下有子分类，无法删除')
        }

        // 检查是否有商品
        const productsCount = await prisma.product.count({
            where: { categoryId: parseInt(id) },
        })

        if (productsCount > 0) {
            throw new AppError(400, '该分类下有商品，无法删除')
        }

        await prisma.category.delete({
            where: { id: parseInt(id) },
        })

        return successResponse(res, null, '分类删除成功')
    } catch (error) {
        next(error)
    }
}

/**
 * 获取热门商品
 */
export const getHotProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { limit = 10 } = req.query

        const products = await prisma.product.findMany({
            where: {
                status: 'active',
                isHot: true,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { sales: 'desc' },
            take: parseInt(limit as string),
        })

        return successResponse(res, products)
    } catch (error) {
        next(error)
    }
}

/**
 * 获取新品
 */
export const getNewProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { limit = 10 } = req.query

        const products = await prisma.product.findMany({
            where: {
                status: 'active',
                isNew: true,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string),
        })

        return successResponse(res, products)
    } catch (error) {
        next(error)
    }
}
