import { Router, type Router as RouterType } from 'express'
import { prisma } from '../utils/prisma.js'

const router: RouterType = Router()

interface DiagnosticResult {
  timestamp: string
  environment: string | undefined
  checks: {
    env?: Record<string, string>
    database?: { status: string; connected: boolean; error?: string }
    tables?: { status: string; count: number; tables?: string[]; error?: string }
    admin?: { status: string; count: number; error?: string }
  }
  overall?: string
}

/**
 * 诊断接口 - 检查系统状态
 * GET /api/diagnostic
 */
router.get('/', async (req, res) => {
  const diagnostics: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  }

  try {
    // 1. 检查环境变量
    diagnostics.checks.env = {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ 已配置' : '❌ 未配置',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ 已配置' : '❌ 未配置',
      CORS_ORIGINS: process.env.CORS_ORIGINS || '❌ 未配置',
      NODE_ENV: process.env.NODE_ENV || 'development',
    }

    // 2. 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`
      diagnostics.checks.database = {
        status: '✅ 连接成功',
        connected: true,
      }
    } catch (dbError) {
      const error = dbError as Error
      diagnostics.checks.database = {
        status: '❌ 连接失败',
        connected: false,
        error: error.message,
      }
    }

    // 3. 检查数据库表
    try {
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `
      diagnostics.checks.tables = {
        status: tables.length > 0 ? '✅ 表已创建' : '❌ 表不存在',
        count: tables.length,
        tables: tables.map(t => t.tablename),
      }
    } catch (tableError) {
      const error = tableError as Error
      diagnostics.checks.tables = {
        status: '❌ 无法查询表',
        count: 0,
        error: error.message,
      }
    }

    // 4. 检查管理员账号
    try {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      })
      diagnostics.checks.admin = {
        status: adminCount > 0 ? '✅ 管理员已存在' : '❌ 无管理员账号',
        count: adminCount,
      }
    } catch (adminError) {
      const error = adminError as Error
      diagnostics.checks.admin = {
        status: '❌ 无法查询管理员',
        count: 0,
        error: error.message,
      }
    }

    // 5. 汇总状态
    const hasErrors =
      diagnostics.checks.database?.connected === false ||
      diagnostics.checks.tables?.count === 0 ||
      diagnostics.checks.admin?.count === 0

    diagnostics.overall = hasErrors ? '❌ 系统异常' : '✅ 系统正常'

    res.json({
      success: !hasErrors,
      data: diagnostics,
    })
  } catch (error) {
    const err = error as Error
    res.status(500).json({
      success: false,
      message: '诊断失败',
      error: err.message,
    })
  }
})

export default router
