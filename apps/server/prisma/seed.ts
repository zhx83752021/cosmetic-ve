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
    const existing = await prisma.category.findFirst({ where: { name: cat.name } })
    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data: cat })
    } else {
      await prisma.category.create({ data: cat })
    }
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
    },
  ]

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } })
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: product })
    } else {
      await prisma.product.create({ data: product })
    }
  }

  // 4. 美妆学院示例文章（前台 /api/articles）
  // 封面使用带 auto=format 的 Unsplash 地址，避免个别资源在部分网络下 404
  const articleCover = (id: string) =>
    `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`

  const articleSeeds = [
    {
      title: '换季敏感肌怎么稳？三步建立修护 routine',
      cover: articleCover('photo-1556228720-195a672e8a03'),
      summary: '从清洁、保湿到防护，给敏感肌一份温和的换季清单。',
      content:
        '<p>换季时气温与湿度波动大，屏障脆弱时容易出现泛红、刺痒。下面用三步帮你稳住状态。</p><h2>温和清洁</h2><p>选择氨基酸或低泡配方，避免皂基与过热的水。</p><h2>保湿修护</h2><p>乳霜或轻油分产品锁住水分，必要时叠一层修护精华。</p><h2>日间防护</h2><p>紫外线会加重敏感，通勤务必使用防晒或硬防晒。</p>',
      author: '雅妆学院',
      tags: ['护肤', '敏感肌'],
      status: 'published' as const,
      categoryId: getCatId('护肤系列'),
    },
    {
      title: '早 C 晚 A 入门：浓度与搭配怎么选',
      cover: articleCover('photo-1620916566398-39f1143ab7be'),
      summary: '想提亮又抗老，先从低浓度与间隔使用开始，建立耐受再进阶。',
      content:
        '<p>维生素 C 侧重抗氧化与提亮，A 醇侧重抗老与角质代谢，错开时段可降低刺激。</p><h2>新手建议</h2><p>晚间 A 醇从每周 2 次开始，配合保湿面霜缓冲。</p><h2>白天注意</h2><p>使用 A 醇期间白天必须防晒，避免与高浓度酸类同晚叠加。</p>',
      author: '雅妆学院',
      tags: ['护肤', '抗老'],
      status: 'published' as const,
      categoryId: getCatId('护肤系列'),
    },
    {
      title: '雾面唇釉不掉线：上妆与定妆技巧',
      cover: articleCover('photo-1586495777744-4413f21062fa'),
      summary: '唇部打底、薄涂多层与边缘晕染，让雾面唇妆更持久自然。',
      content:
        '<p>雾面唇釉显高级也容易显唇纹，做好打底是关键。</p><h2>唇部护理</h2><p>妆前轻敷润唇膏，上色前抿掉多余油分。</p><h2>上妆手法</h2><p>从唇心向外薄涂两层，唇周用刷具晕染可避免积线。</p>',
      author: '雅妆学院',
      tags: ['彩妆', '唇妆'],
      status: 'published' as const,
      categoryId: getCatId('彩妆系列'),
    },
    {
      title: '通勤淡妆五分钟：工具与色号清单',
      cover: articleCover('photo-1487412720507-e7ab37603c6f'),
      summary: '一支多用途膏状腮红、自然眉形与通透底妆，快速出门不踩雷。',
      content:
        '<p>时间紧时优先「少而精」：底妆匀透、眉形清爽、唇颊同一色系即可精神满分。</p><h2>底妆</h2><p>气垫或润色防晒薄拍一层，局部遮瑕即可。</p><h2>眉眼</h2><p>眉粉填补空隙，睫毛膏轻刷根根分明。</p>',
      author: '雅妆学院',
      tags: ['彩妆', '通勤'],
      status: 'published' as const,
      categoryId: getCatId('彩妆系列'),
    },
  ]

  for (const art of articleSeeds) {
    const existing = await prisma.article.findFirst({ where: { title: art.title } })
    if (existing) {
      await prisma.article.update({ where: { id: existing.id }, data: art })
    } else {
      await prisma.article.create({ data: art })
    }
  }

  console.log('✅ 数据同步完成！所有配图已重定向至本地 uploads/products/')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
