import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Test basic query
    const categoryCount = await prisma.category.count()
    const productCount = await prisma.product.count()
    const leadCount = await prisma.lead.count()

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      prisma: 'initialized',
      counts: {
        categories: categoryCount,
        products: productCount,
        leads: leadCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
