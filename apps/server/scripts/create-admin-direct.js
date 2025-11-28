#!/usr/bin/env node

/**
 * 直接创建管理员账号（使用 Prisma）
 *
 * 使用方法：
 * node scripts/create-admin-direct.js
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 提问函数
function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createAdmin() {
  console.log('='.repeat(50))
  console.log('  创建管理员账号')
  console.log('='.repeat(50))
  console.log('')

  try {
    // 获取管理员信息
    const username = await question('请输入用户名 (默认: admin): ') || 'admin'
    const password = await question('请输入密码 (默认: admin123): ') || 'admin123'
    const phone = await question('请输入手机号 (默认: 13800138000): ') || '13800138000'
    const email = await question('请输入邮箱 (默认: admin@cosmetic.com): ') || 'admin@cosmetic.com'

    console.log('\n🔐 正在创建管理员账号...')

    // 检查手机号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log('\n⚠️  该手机号已是管理员账号')
        const update = await question('是否更新密码？(y/n): ')

        if (update.toLowerCase() === 'y') {
          const hashedPassword = await bcrypt.hash(password, 10)
          await prisma.user.update({
            where: { phone },
            data: {
              password: hashedPassword,
              username,
              email,
              updatedAt: new Date()
            }
          })
          console.log('\n✅ 管理员密码已更新！')
        } else {
          console.log('\n❌ 操作已取消')
        }
      } else {
        console.log('\n⚠️  该手机号已被普通用户使用')
        const upgrade = await question('是否升级为管理员？(y/n): ')

        if (upgrade.toLowerCase() === 'y') {
          const hashedPassword = await bcrypt.hash(password, 10)
          await prisma.user.update({
            where: { phone },
            data: {
              role: 'admin',
              password: hashedPassword,
              username,
              email,
              nickname: '系统管理员',
              updatedAt: new Date()
            }
          })
          console.log('\n✅ 用户已升级为管理员！')
        } else {
          console.log('\n❌ 操作已取消')
        }
      }
    } else {
      // 创建新管理员
      const hashedPassword = await bcrypt.hash(password, 10)

      const admin = await prisma.user.create({
        data: {
          username,
          email,
          phone,
          password: hashedPassword,
          nickname: '系统管理员',
          role: 'admin',
          status: 'active'
        }
      })

      console.log('\n✅ 管理员账号创建成功！')
      console.log('\n账号信息：')
      console.log('─'.repeat(50))
      console.log(`ID:       ${admin.id}`)
      console.log(`用户名:   ${admin.username}`)
      console.log(`密码:     ${password}`)
      console.log(`手机号:   ${admin.phone}`)
      console.log(`邮箱:     ${admin.email}`)
      console.log(`角色:     ${admin.role}`)
      console.log(`状态:     ${admin.status}`)
      console.log('─'.repeat(50))
      console.log('\n🎉 您现在可以使用以下任一方式登录：')
      console.log(`   - 用户名: ${username}`)
      console.log(`   - 手机号: ${phone}`)
      console.log(`   - 邮箱:   ${email}`)
      console.log(`   - 密码:   ${password}`)
      console.log('')
    }

  } catch (error) {
    console.error('\n❌ 创建失败:', error.message)
    if (error.code === 'P2002') {
      console.error('   该用户名或邮箱已被使用，请使用其他值')
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// 执行
createAdmin()
