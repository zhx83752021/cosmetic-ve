import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '登录', hidden: true },
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/Dashboard.vue'),
                meta: { title: '数据仪表盘', icon: 'DataAnalysis' },
            },
        ],
    },
    {
        path: '/products',
        component: Layout,
        redirect: '/products/list',
        meta: { title: '商品管理', icon: 'Box' },
        children: [
            {
                path: 'list',
                name: 'ProductList',
                component: () => import('@/views/products/List.vue'),
                meta: { title: '商品列表' },
            },
            {
                path: 'categories',
                name: 'ProductCategories',
                component: () => import('@/views/products/Categories.vue'),
                meta: { title: '商品分类' },
            },
        ],
    },
    {
        path: '/orders',
        component: Layout,
        redirect: '/orders/list',
        meta: { title: '订单管理', icon: 'ShoppingCart' },
        children: [
            {
                path: 'list',
                name: 'OrderList',
                component: () => import('@/views/orders/List.vue'),
                meta: { title: '订单列表' },
            },
        ],
    },
    {
        path: '/users',
        component: Layout,
        redirect: '/users/list',
        meta: { title: '用户管理', icon: 'User' },
        children: [
            {
                path: 'list',
                name: 'UserList',
                component: () => import('@/views/users/List.vue'),
                meta: { title: '用户列表' },
            },
        ],
    },
    {
        path: '/marketing',
        component: Layout,
        redirect: '/marketing/coupons',
        meta: { title: '营销管理', icon: 'Present' },
        children: [
            {
                path: 'coupons',
                name: 'CouponManagement',
                component: () => import('@/views/marketing/Coupons.vue'),
                meta: { title: '优惠券管理' },
            },
            {
                path: 'activities',
                name: 'ActivityManagement',
                component: () => import('@/views/marketing/Activities.vue'),
                meta: { title: '活动管理' },
            },
        ],
    },
    {
        path: '/content',
        component: Layout,
        redirect: '/content/articles',
        meta: { title: '内容管理', icon: 'Document' },
        children: [
            {
                path: 'articles',
                name: 'ArticleManagement',
                component: () => import('@/views/content/Articles.vue'),
                meta: { title: '文章管理' },
            },
        ],
    },
    {
        path: '/settings',
        component: Layout,
        redirect: '/settings/system',
        meta: { title: '系统设置', icon: 'Setting' },
        children: [
            {
                path: 'system',
                name: 'SystemSettings',
                component: () => import('@/views/settings/System.vue'),
                meta: { title: '系统设置' },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: { title: '页面不存在', hidden: true },
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title || '雅妆'} - 后台管理系统`

    // 检查是否需要登录
    if (to.path !== '/login') {
        const token = localStorage.getItem('admin-token')
        if (!token) {
            next({ path: '/login' })
            return
        }
    }

    next()
})

export default router
