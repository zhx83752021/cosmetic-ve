import Joi from 'joi'
import type { Request, Response, NextFunction } from 'express'

/**
 * 数据验证中间件工厂
 */
export const validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false })

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join('; ')
            return res.status(400).json({
                success: false,
                message: '数据验证失败',
                errors: errorMessage,
            })
        }

        next()
    }
}

/**
 * 注册验证规则
 */
export const registerSchema = Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.pattern.base': '手机号格式不正确',
        'any.required': '手机号不能为空',
    }),
    password: Joi.string().min(6).max(50).required().messages({
        'string.min': '密码至少6个字符',
        'string.max': '密码最多50个字符',
        'any.required': '密码不能为空',
    }),
    captcha: Joi.string().length(6).optional().messages({
        'string.length': '验证码必须为6位',
    }),
    username: Joi.string().min(3).max(30).optional().messages({
        'string.min': '用户名至少3个字符',
        'string.max': '用户名最多30个字符',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': '邮箱格式不正确',
    }),
})

/**
 * 登录验证规则
 */
export const loginSchema = Joi.object({
    account: Joi.string().required().messages({
        'any.required': '账号不能为空',
    }),
    password: Joi.string().required().messages({
        'any.required': '密码不能为空',
    }),
})

/**
 * 地址验证规则
 */
export const addressSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': '收货人姓名不能为空',
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.pattern.base': '手机号格式不正确',
        'any.required': '手机号不能为空',
    }),
    province: Joi.string().required().messages({
        'any.required': '省份不能为空',
    }),
    city: Joi.string().required().messages({
        'any.required': '城市不能为空',
    }),
    district: Joi.string().required().messages({
        'any.required': '区县不能为空',
    }),
    detail: Joi.string().required().messages({
        'any.required': '详细地址不能为空',
    }),
    isDefault: Joi.boolean().optional(),
})

/**
 * 订单创建验证规则
 */
export const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            productId: Joi.number().required(),
            skuId: Joi.number().optional(),
            quantity: Joi.number().min(1).required(),
        })
    ).min(1).required().messages({
        'array.min': '至少需要一个商品',
        'any.required': '商品列表不能为空',
    }),
    addressId: Joi.number().required().messages({
        'any.required': '收货地址不能为空',
    }),
    couponId: Joi.number().optional(),
    remark: Joi.string().max(200).optional(),
})

/**
 * 商品验证规则
 */
export const productSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': '商品名称不能为空',
    }),
    subTitle: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.min': '至少需要一张商品图片',
        'any.required': '商品图片不能为空',
    }),
    price: Joi.number().min(0).required().messages({
        'number.min': '价格不能小于0',
        'any.required': '价格不能为空',
    }),
    originalPrice: Joi.number().min(0).optional(),
    categoryId: Joi.number().required().messages({
        'any.required': '分类不能为空',
    }),
    brand: Joi.string().optional(),
    stock: Joi.number().min(0).required().messages({
        'number.min': '库存不能小于0',
        'any.required': '库存不能为空',
    }),
    description: Joi.string().optional(),
    details: Joi.string().optional(),
    ingredients: Joi.string().optional(),
    usage: Joi.string().optional(),
    isNew: Joi.boolean().optional(),
    isHot: Joi.boolean().optional(),
})

/**
 * 分类验证规则
 */
export const categorySchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': '分类名称不能为空',
    }),
    icon: Joi.string().optional(),
    image: Joi.string().optional(),
    parentId: Joi.number().optional(),
    sort: Joi.number().optional(),
})

/**
 * 优惠券验证规则
 */
export const couponSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': '优惠券名称不能为空',
    }),
    type: Joi.string().valid('discount', 'fixed').required().messages({
        'any.only': '优惠券类型必须是discount或fixed',
        'any.required': '优惠券类型不能为空',
    }),
    value: Joi.number().min(0).required().messages({
        'number.min': '优惠金额不能小于0',
        'any.required': '优惠金额不能为空',
    }),
    minAmount: Joi.number().min(0).required().messages({
        'number.min': '最低消费金额不能小于0',
        'any.required': '最低消费金额不能为空',
    }),
    maxAmount: Joi.number().min(0).optional(),
    total: Joi.number().min(1).required().messages({
        'number.min': '发放数量至少为1',
        'any.required': '发放数量不能为空',
    }),
    startTime: Joi.date().required().messages({
        'any.required': '开始时间不能为空',
    }),
    endTime: Joi.date().greater(Joi.ref('startTime')).required().messages({
        'date.greater': '结束时间必须晚于开始时间',
        'any.required': '结束时间不能为空',
    }),
    description: Joi.string().optional(),
})
