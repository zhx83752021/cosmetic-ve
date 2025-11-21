import type { Response } from 'express'

/**
 * 统一成功响应格式
 */
export const successResponse = (res: Response, data: any = null, message: string = '操作成功') => {
    return res.json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    })
}

/**
 * 统一分页响应格式
 */
export const paginatedResponse = (
    res: Response,
    data: any[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
) => {
    return res.json({
        success: true,
        message,
        data: {
            items: data,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        },
        timestamp: new Date().toISOString(),
    })
}

/**
 * 统一错误响应格式
 */
export const errorResponse = (res: Response, message: string = '操作失败', statusCode: number = 400) => {
    return res.status(statusCode).json({
        success: false,
        message,
        timestamp: new Date().toISOString(),
    })
}
