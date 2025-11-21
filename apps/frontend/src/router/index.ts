import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
    },
    // 登录注册改为模态窗口，保留路由仅作为备用
    // {
    //     path: '/login',
    //     name: 'Login',
    //     component: () => import('@/views/Login.vue'),
    //     meta: { title: '登录' },
    // },
    // {
    //     path: '/register',
    //     name: 'Register',
    //     component: () => import('@/views/Register.vue'),
    //     meta: { title: '注册' },
    // },
    {
        path: '/products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: { title: '产品中心' },
    },
    {
        path: '/product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: { title: '产品详情' },
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue'),
        meta: { title: '购物车' },
    },
    {
        path: '/checkout',
        name: 'Checkout',
        component: () => import('@/views/Checkout.vue'),
        meta: { title: '结算' },
    },
    {
        path: '/user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        redirect: '/user/profile',
        meta: { title: '用户中心', requiresAuth: true },
        children: [
            {
                path: 'profile',
                name: 'UserProfile',
                component: () => import('@/views/user/Profile.vue'),
                meta: { title: '个人信息' },
            },
            {
                path: 'orders',
                name: 'UserOrders',
                component: () => import('@/views/user/Orders.vue'),
                meta: { title: '我的订单' },
            },
            {
                path: 'addresses',
                name: 'UserAddresses',
                component: () => import('@/views/user/Addresses.vue'),
                meta: { title: '收货地址' },
            },
            {
                path: 'coupons',
                name: 'UserCoupons',
                component: () => import('@/views/user/Coupons.vue'),
                meta: { title: '优惠券' },
            },
            {
                path: 'points',
                name: 'UserPoints',
                component: () => import('@/views/user/Points.vue'),
                meta: { title: '积分' },
            },
        ],
    },
    {
        path: '/academy',
        name: 'Academy',
        component: () => import('@/views/Academy.vue'),
        meta: { title: '美妆学院' },
    },
    {
        path: '/academy/:id',
        name: 'AcademyArticle',
        component: () => import('@/views/AcademyArticle.vue'),
        meta: { title: '文章详情' },
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: '品牌故事' },
    },
    {
        path: '/service',
        name: 'Service',
        component: () => import('@/views/Service.vue'),
        meta: { title: '客户服务' },
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/Search.vue'),
        meta: { title: '搜索' },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面不存在' },
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    },
})

// 路由守卫
router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = `${to.meta.title || '雅妆'} - 高端化妆品品牌`

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token')
        if (!token) {
            // 未登录，跳转到首页（用户可以点击登录按钮打开模态窗口）
            next({ name: 'Home' })
            return
        }
    }

    next()
})

export default router
