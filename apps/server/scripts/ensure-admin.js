/* eslint-disable @typescript-eslint/no-var-requires */
// 确保管理员账户存在（构建后自动执行）
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function ensureAdmin() {
  try {
    console.log('🔍 检查管理员账户...')

    // 检查管理员是否存在
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'admin',
      },
    })

    if (existingAdmin) {
      console.log('✅ 管理员账户已存在:', existingAdmin.username)
      return
    }

    // 创建默认管理员
    console.log('📝 创建默认管理员账户...')
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        phone: '13800138000',
        password: hashedPassword,
        nickname: '系统管理员',
        role: 'admin',
        status: 'active',
      },
    })

    console.log('✅ 管理员账户创建成功!')
    console.log('   用户名: admin')
    console.log('   密码: admin123')
    console.log('   邮箱:', admin.email)
  } catch (error) {
    console.error('❌ 管理员账户检查/创建失败:', error)
    // 不要退出进程，允许部署继续
  } finally {
    await prisma.$disconnect()
  }
}

ensureAdmin()
