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
 * 生产环境 CDN 备用图库 (解决 Vercel 静态资源丢失问题)
 */
const CDN_IMAGES = {
    serum: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
    lipstick: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&q=80&w=800',
    banner1: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=1600'
}

/**
 * 离线/降维 Mock 数据 (全线上图源版)
 */
const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: '极光赋活修护精华瓶',
        subTitle: '深层修复 肌底焕亮',
        brand: 'AESTHETIC',
        price: 880,
        originalPrice: 1080,
        categoryId: 1,
        images: [CDN_IMAGES.serum],
        sales: 1250,
        stock: 500,
        description: '含有高浓度极光酵母精华，专为熬夜亚健康肌肤设计。',
        rating: 5.0,
        reviewCount: 1200,
        status: 'active',
        isNew: true,
        isHot: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 3,
        name: '魅惑丝绒哑光唇釉',
        subTitle: '哑而不干 高级柔雾感',
        brand: 'ELEGANCE',
        price: 260,
        originalPrice: 320,
        categoryId: 2,
        images: [CDN_IMAGES.lipstick],
        sales: 8900,
        stock: 2000,
        description: '色泽浓郁，轻盈贴合，长效持妆不沾杯。',
        rating: 4.8,
        reviewCount: 3500,
        status: 'active',
        isNew: false,
        isHot: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
]

const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: '护肤系列', sort: 1, createdAt: '', updatedAt: '' },
    { id: 2, name: '彩妆系列', sort: 2, createdAt: '', updatedAt: '' },
    { id: 3, name: '香氛系列', sort: 3, createdAt: '', updatedAt: '' },
    { id: 4, name: '洗护系列', sort: 4, createdAt: '', updatedAt: '' }
]

/**
 * 获取商品列表
 */
export const getProducts = async (params: ProductQuery) => {
    try {
        const res = await get<any>('/products', { params })
        if (res && res.data) return res
        throw new Error('API unavailable')
    } catch (_error) {
        return {
            success: true,
            data: {
                data: {
                    items: MOCK_PRODUCTS,
                    pagination: { total: MOCK_PRODUCTS.length, page: 1, pageSize: 10, totalPages: 1 }
                }
            }
        }
    }
}

/**
 * 获取商品详情
 */
export const getProductById = async (id: number) => {
    try {
        const res = await get<Product>(`/products/${id}`)
        if (res && res.data) return res
        throw new Error('Product not found')
    } catch (_error) {
        const mock = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0]
        return { success: true, data: mock }
    }
}

/**
 * 获取分类列表
 */
export const getCategories = async () => {
    try {
        const res = await get<Category[]>('/products/categories/all')
        if (res && res.data) return res
        throw new Error('API unavailable')
    } catch (_error) {
        return { success: true, data: MOCK_CATEGORIES }
    }
}

export const getCategoryById = (id: number) => get<Category>(`/products/categories/${id}`)
export const createProduct = (data: any) => post<Product>('/products', data)
export const updateProduct = (id: number, data: any) => put<Product>(`/products/${id}`, data)
export const deleteProduct = (id: number) => del(`/products/${id}`)
export const createCategory = (data: any) => post<Category>('/products/categories', data)
export const updateCategory = (id: number, data: any) => put<Category>(`/products/categories/${id}`, data)
export const deleteCategory = (id: number) => del(`/products/categories/${id}`)
