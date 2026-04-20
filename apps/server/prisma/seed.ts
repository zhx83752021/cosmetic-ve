import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('开始同步本地高清产品数据...')

    // 1. 清理旧数据 (可选, 根据需要取消注释)
    // await prisma.product.deleteMany()
    // await prisma.category.deleteMany()

    // 2. 创建分类
    const categories = [
        {
            name: '护肤系列',
            image: '/uploads/products/serum.png',
            sort: 1,
        },
        {
            name: '彩妆系列',
            image: '/uploads/products/lipstick.png',
            sort: 2,
        },
        {
            name: '香水系列',
            image: '/uploads/products/perfume.png',
            sort: 3,
        },
        {
            name: '礼盒套装',
            image: '/uploads/products/candle.png',
            sort: 4,
        },
    ]

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { name: cat.name },
            update: cat,
            create: cat,
        })
    }

    const dbCats = await prisma.category.findMany()
    const getCatId = (name: string) => dbCats.find(c => c.name === name)?.id || 1

    // 3. 创建核心产品
    const products = [
        {
            name: '极光赋活修护精华瓶',
            subTitle: '深层修复 肌底焕亮',
            brand: 'AESTHETIC',
            price: 880,
            originalPrice: 1080,
            categoryId: getCatId('护肤系列'),
            images: ['/uploads/products/serum.png'],
            sales: 1250,
            stock: 500,
            status: 'active',
            isNew: true,
            isHot: true,
            description: '<p>高浓度发酵精华，强效修护...</p>',
            details: '<p>产品详情介绍...</p>',
            ingredients: '<p>核心成分：极光酵母...</p>',
            usage: '<p>每日早晚取3-5滴...</p>',
        },
        {
            name: '魅惑丝绒哑光唇釉',
            subTitle: '哑而不干 高级柔雾感',
            brand: 'ELEGANCE',
            price: 260,
            originalPrice: 320,
            categoryId: getCatId('彩妆系列'),
            images: ['/uploads/products/lipstick.png'],
            sales: 8960,
            stock: 1200,
            status: 'active',
            isNew: false,
            isHot: true,
            description: '<p>浓郁显色，持妆不沾杯...</p>',
            details: '<p>口红详情...</p>',
            ingredients: '<p>透明质酸、天然油脂...</p>',
            usage: '<p>顺着唇形涂抹...</p>',
        },
        {
            name: '丝缎柔雾持妆气垫',
            subTitle: '轻盈遮瑕 透气持久',
            brand: 'GLOW',
            price: 420,
            originalPrice: 520,
            categoryId: getCatId('彩妆系列'),
            images: ['/uploads/products/cushion.png'],
            sales: 4500,
            stock: 800,
            status: 'active',
            isNew: true,
            isHot: true,
            description: '<p>轻盈如丝，持久遮瑕...</p>',
        },
        {
            name: '典藏版午后伯爵香水',
            subTitle: '静谧木香 留香悠久',
            brand: 'Maison',
            price: 1280,
            originalPrice: 1580,
            categoryId: getCatId('香水系列'),
            images: ['/uploads/products/perfume.png'],
            sales: 780,
            stock: 200,
            status: 'active',
            isNew: true,
            isHot: false,
            description: '<p>前调：佛手柑 中调：红茶...</p>',
        }
    ]

    for (const product of products) {
        await prisma.product.upsert({
          where: { name: product.name },
          update: product,
          create: product
        })
    }

    console.log('✅ 数据同步完成！所有配图已重定向至本地 uploads/products/')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
