import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建管理员账号
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@example.com',
      phone: '13800138000',
      password: hashedPassword,
      nickname: '系统管理员',
      role: 'admin',
      status: 'active',
    },
  })

  console.log('✅ 管理员账号创建成功:', admin)
  console.log('账号: admin')
  console.log('密码: admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error('❌ 初始化失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
