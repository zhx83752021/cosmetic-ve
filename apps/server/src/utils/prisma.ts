import { PrismaClient } from '@prisma/client'

// Prisma客户端单例
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Serverless 环境优化配置
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Vercel Serverless 优化
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions as any)

// 在非生产环境中缓存实例
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Serverless 环境：确保在响应后断开连接
if (process.env.VERCEL === '1') {
  // 在 Vercel 中不需要手动断开，Vercel 会自动管理
  console.log('🚀 Running in Vercel serverless environment')
}
