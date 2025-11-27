#!/usr/bin/env node

/**
 * 数据库状态检查工具
 * 用于诊断数据库连接和表结构问题
 *
 * 使用方法：
 * node scripts/check-database.js
 *
 * 环境变量：
 * DATABASE_URL - 数据库连接字符串
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function error(message) {
  log(`❌ ${message}`, 'red')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

async function checkDatabaseConnection() {
  log('\n='.repeat(80), 'blue')
  log('数据库状态检查工具', 'blue')
  log('='.repeat(80), 'blue')

  try {
    // 检查环境变量
    info('\n[1/5] 检查环境变量...')
    const databaseUrl = process.env.DATABASE_URL

    if (!databaseUrl) {
      error('DATABASE_URL 环境变量未设置')
      console.log('\n💡 请执行以下命令拉取环境变量：')
      console.log('   vercel env pull .env.production')
      process.exit(1)
    }

    // 隐藏敏感信息
    const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@')
    success(`DATABASE_URL 已设置: ${maskedUrl}`)

    // 测试数据库连接
    info('\n[2/5] 测试数据库连接...')
    await prisma.$connect()
    success('数据库连接成功')

    // 检查表是否存在
    info('\n[3/5] 检查数据库表...')
    const tables = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `

    if (tables.length === 0) {
      error('数据库中没有任何表')
      console.log('\n💡 请执行数据库迁移：')
      console.log('   pnpm prisma migrate deploy')
      process.exit(1)
    }

    success(`找到 ${tables.length} 个表`)
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`)
    })

    // 检查必需的表
    info('\n[4/5] 检查必需的表...')
    const requiredTables = ['users', 'products', 'categories', 'orders', 'coupons']

    const existingTables = tables.map(t => t.tablename)
    let allTablesExist = true

    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        success(`表 "${table}" 存在`)
      } else {
        error(`表 "${table}" 不存在`)
        allTablesExist = false
      }
    }

    if (!allTablesExist) {
      warning('\n数据库表结构不完整，请执行迁移')
      console.log('   pnpm prisma migrate deploy')
    }

    // 检查管理员账号
    info('\n[5/5] 检查管理员账号...')
    try {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      })

      if (adminCount === 0) {
        warning('没有找到管理员账号')
        console.log('\n💡 请执行以下命令创建管理员：')
        console.log('   pnpm run create-admin')
      } else {
        success(`找到 ${adminCount} 个管理员账号`)

        const admins = await prisma.user.findMany({
          where: { role: 'admin' },
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        })

        console.log('\n管理员列表：')
        admins.forEach(admin => {
          console.log(`   - ID: ${admin.id}`)
          console.log(`     用户名: ${admin.username || '未设置'}`)
          console.log(`     邮箱: ${admin.email || '未设置'}`)
          console.log(`     手机: ${admin.phone}`)
          console.log(`     状态: ${admin.status}`)
          console.log(`     创建时间: ${admin.createdAt.toISOString()}`)
          console.log('')
        })
      }
    } catch (err) {
      error('检查管理员账号失败')
      console.log('   错误信息:', err.message)
    }

    // 汇总报告
    log('\n' + '='.repeat(80), 'blue')
    log('检查完成', 'blue')
    log('='.repeat(80), 'blue')

    if (allTablesExist && existingTables.includes('users')) {
      success('\n✨ 数据库状态正常！')
      console.log('\n下一步：')
      console.log('1. 如果没有管理员账号，执行: pnpm run create-admin')
      console.log('2. 确保 Vercel 后端项目配置了正确的环境变量')
      console.log('3. 重新部署 Vercel 后端项目')
    } else {
      warning('\n⚠️  数据库状态异常，需要修复！')
      console.log('\n修复步骤：')
      console.log('1. 执行数据库迁移: pnpm prisma migrate deploy')
      console.log('2. 创建管理员账号: pnpm run create-admin')
      console.log('3. 重新运行此检查: node scripts/check-database.js')
    }
  } catch (err) {
    error('\n检查过程中发生错误')
    console.log('\n错误详情：')
    console.log(err)

    console.log('\n💡 常见问题：')
    console.log('1. 数据库连接失败：检查 DATABASE_URL 是否正确')
    console.log('2. 表不存在：执行 pnpm prisma migrate deploy')
    console.log('3. 权限错误：检查数据库用户权限')

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行检查
checkDatabaseConnection().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
