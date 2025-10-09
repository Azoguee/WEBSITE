import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyticsSchema } from '@/lib/validation'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/auth'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!rateLimit(clientIp, 10, 60000)) {
      // 10 requests per minute
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: getRateLimitHeaders(clientIp, 10, 60000),
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = analyticsSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { event, parameters } = validationResult.data

    // Log analytics event
    console.log('Analytics Event:', { event, parameters, timestamp: new Date() })

    // Here you would typically send to Google Analytics, Facebook Pixel, etc.
    // For now, we'll just log it and potentially store in database

    // Example: Send to Google Analytics 4
    if (process.env.GOOGLE_ANALYTICS_ID) {
      // Implementation would go here
      console.log('Would send to GA4:', { event, parameters })
    }

    // Example: Send to Facebook Pixel
    if (process.env.FACEBOOK_PIXEL_ID) {
      // Implementation would go here
      console.log('Would send to Facebook Pixel:', { event, parameters })
    }

    // Example: Send to Zalo Ads
    if (process.env.ZALO_ADS_CONVERSION_ID) {
      // Implementation would go here
      console.log('Would send to Zalo Ads:', { event, parameters })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: { createdAt?: { gte: Date; lte: Date } } = {}
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // Get analytics data
    const [
      totalLeads,
      pendingLeads,
      contactedLeads,
      successLeads,
      lostLeads,
      totalRevenue,
      leadsByDay,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: 'pending_chat' } }),
      prisma.lead.count({ where: { ...where, status: 'contacted' } }),
      prisma.lead.count({ where: { ...where, status: 'success' } }),
      prisma.lead.count({ where: { ...where, status: 'lost' } }),
      prisma.lead.aggregate({
        where: { ...where, status: 'success' },
        _sum: { price: true },
      }),
      prisma.lead.groupBy({
        by: ['createdAt'],
        where,
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const conversionRate = totalLeads > 0 ? (successLeads / totalLeads) * 100 : 0
    const contactRate = totalLeads > 0 ? (contactedLeads / totalLeads) * 100 : 0

    return NextResponse.json({
      summary: {
        totalLeads,
        pendingLeads,
        contactedLeads,
        successLeads,
        lostLeads,
        totalRevenue: totalRevenue._sum.price || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        contactRate: Math.round(contactRate * 100) / 100,
      },
      leadsByDay,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
})