#!/usr/bin/env node

/**
 * 创建管理员账号工具
 * 用于生成管理员账号的 SQL 语句
 *
 * 使用方法：
 * node scripts/create-admin.js [用户名] [密码] [手机号] [邮箱]
 *
 * 示例：
 * node scripts/create-admin.js admin 123456 13800138000 admin@cosmetic.com
 */

import bcrypt from 'bcryptjs'

// 获取命令行参数
const args = process.argv.slice(2)

// 默认值
const defaultUsername = 'admin'
const defaultPassword = '123456'
const defaultPhone = '13800138000'
const defaultEmail = 'admin@cosmetic.com'

// 解析参数
const username = args[0] || defaultUsername
const password = args[1] || defaultPassword
const phone = args[2] || defaultPhone
const email = args[3] || defaultEmail

// 生成密码 hash
async function generateAdminSQL() {
  console.log('🔐 正在生成管理员账号...\n')

  try {
    // 生成 bcrypt hash
    const hashedPassword = await bcrypt.hash(password, 10)

    // 生成 SQL 语句
    const sql = `
-- 创建管理员账号
-- 账号信息：
--   用户名: ${username}
--   密码: ${password}
--   手机号: ${phone}
--   邮箱: ${email}

INSERT INTO users (username, email, phone, password, nickname, role, status, "createdAt", "updatedAt")
VALUES (
  '${username}',
  '${email}',
  '${phone}',
  '${hashedPassword}',
  '系统管理员',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  "updatedAt" = NOW();

-- 验证账号是否创建成功
SELECT id, username, email, phone, nickname, role, status, "createdAt"
FROM users
WHERE username = '${username}';
`

    console.log('✅ SQL 语句生成成功！\n')
    console.log('='.repeat(80))
    console.log(sql)
    console.log('='.repeat(80))
    console.log('\n📋 使用说明：')
    console.log('1. 复制上面的 SQL 语句')
    console.log('2. 进入 Vercel Postgres 控制台 → Query 标签')
    console.log('3. 粘贴并执行 SQL')
    console.log('4. 使用以下账号登录：')
    console.log(`   - 用户名: ${username}`)
    console.log(`   - 密码: ${password}`)
    console.log(`   - 手机号: ${phone}`)
    console.log(`   - 邮箱: ${email}\n`)

    // 也输出纯 bcrypt hash，方便直接使用
    console.log('💡 如果需要手动修改，密码的 bcrypt hash 为：')
    console.log(hashedPassword)
    console.log('')
  } catch (error) {
    console.error('❌ 生成失败:', error.message)
    process.exit(1)
  }
}

// 执行
generateAdminSQL()
