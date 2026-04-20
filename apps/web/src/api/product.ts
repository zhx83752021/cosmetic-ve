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
 * 离线/降维 Mock 数据
 * 当后端 API 不可用时，自动展示这些高画质的本地数据
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
        images: ['/uploads/products/serum.png'],
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
        images: ['/uploads/products/lipstick.png'],
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

/**
 * 获取商品列表
 */
export const getProducts = async (params: ProductQuery) => {
    try {
        const res = await get<PaginatedResponse<Product>>('/products', { params })
        if (res && res.data) return res
        throw new Error('API data empty')
    } catch (_error) {
        console.warn('Backend API unavailable, using local mock data')
        return {
            success: true,
            data: {
                items: MOCK_PRODUCTS,
                total: MOCK_PRODUCTS.length,
                page: 1,
                pageSize: 10
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
        return {
            success: true,
            data: mock
        }
    }
}

/**
 * 获取分类列表
 */
export const getCategories = () => {
    return get<Category[]>('/products/categories/all')
}

/**
 * 获取分类详情
 */
export const getCategoryById = (id: number) => {
    return get<Category>(`/products/categories/${id}`)
}
