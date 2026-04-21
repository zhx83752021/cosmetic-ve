import { get, post, put, del, type PaginatedResponse } from './request'

// 商品接口
export interface Product {
    id: number
    name: string
    subTitle?: string
    images: string[]
    price: number
    originalPrice?: number
    categoryId: number
    brand?: string
    sales: number
    stock: number
    description?: string
    details?: string
    ingredients?: string
    usage?: string
    status: string
    isNew: boolean
    isHot: boolean
    rating?: number
    reviewCount?: number
    createdAt: string
    updatedAt: string
    category?: {
        id: number
        name: string
    }
}

// 商品分类
export interface Category {
    id: number
    name: string
    icon?: string
    image?: string
    parentId?: number
    sort: number
    createdAt: string
    updatedAt: string
    children?: Category[]
    _count?: {
        products: number
    }
}

// 商品查询参数
export interface ProductQuery {
    page?: number
    pageSize?: number
    categoryId?: number
    brand?: string
    keyword?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

/**
 * 生产环境路径适配 (针对本地资源)
 */
const getImagePath = (path: string) => {
    if (path.startsWith('http')) return path
    if (path.startsWith('/')) return path
    return `/${path}`
}

/**
 * 【真后端模式】获取商品列表
 */
export const getProducts = async (params: ProductQuery) => {
    try {
        const res = await get<any>('/products', { params })
        if (res && res.data) {
            // 对后端返回的图片路径做一次清洗
            if (res.data.data && res.data.data.items) {
                res.data.data.items = res.data.data.items.map((p: any) => ({
                    ...p,
                    images: p.images.map(getImagePath)
                }))
            }
            return res
        }
        throw new Error('API Empty')
    } catch (error) {
        console.error('API Error, check DATABASE_URL in Vercel settings:', error)
        // 只有在极端的 API 挂掉时才降级到基本结构，这里不再写死 Mock 逻辑，以展示真实连接状态
        return { success: false, message: '数据库连接中，请稍后刷新...' }
    }
}

/**
 * 获取商品详情
 */
export const getProductById = (id: number) => get<Product>(`/products/${id}`)

/**
 * 获取分类列表
 */
export const getCategories = async () => {
    try {
        const res = await get<Category[]>('/products/categories/all')
        return res
    } catch (error) {
        console.error('Category API Error:', error)
        return []
    }
}

// 管理后台接口
export const getCategoryById = (id: number) => get<Category>(`/products/categories/${id}`)
export const createProduct = (data: any) => post<Product>('/products', data)
export const updateProduct = (id: number, data: any) => put<Product>(`/products/${id}`, data)
export const deleteProduct = (id: number) => del(`/products/${id}`)
export const createCategory = (data: any) => post<Category>('/products/categories', data)
export const updateCategory = (id: number, data: any) => put<Category>(`/products/categories/${id}`, data)
export const deleteCategory = (id: number) => del(`/products/categories/${id}`)
