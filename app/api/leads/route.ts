import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { generateOrderRef, getDeviceType, buildZaloLink } from '@/lib/utils'
import { createLeadSchema, sanitizeString } from '@/lib/validation'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!rateLimit(clientIp, 5, 60000)) {
      // 5 requests per minute
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: getRateLimitHeaders(clientIp, 5, 60000),
        }
      )
    }

    const body = await request.json()

    // Validate input
    const validationResult = createLeadSchema.safeParse(body)
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

    const {
      productId,
      productName,
      price,
      variant,
      quantity = 1,
      sessionId,
      landingUrl,
      referrer,
      utmSource,
      utmCampaign,
      utmMedium,
    } = validationResult.data

    // Get client info
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const deviceType = getDeviceType(userAgent)

    // Sanitize inputs
    const sanitizedProductName = sanitizeString(productName)
    const sanitizedVariant = variant ? sanitizeString(variant) : undefined

    // Generate order reference
    const orderRef = generateOrderRef()

    // Create lead
    const leadData = {
      orderRef,
      productName: sanitizedProductName,
      price: parseFloat(price.toString()),
      quantity,
      clientIp,
      userAgent,
      deviceType,
      status: 'pending_chat' as const,
      ...(productId && { productId }),
      ...(sanitizedVariant && { variant: sanitizedVariant }),
      ...(sessionId && { sessionId }),
      ...(landingUrl && { landingUrl }),
      ...(referrer && { referrer }),
      ...(utmSource && { utmSource }),
      ...(utmCampaign && { utmCampaign }),
      ...(utmMedium && { utmMedium }),
    }

    const lead = await prisma.lead.create({
      data: leadData,
    })

    // Build Zalo link
    const zaloOaLink = process.env.ZALO_OA_LINK || 'https://zalo.me/your-zalo-oa'
    const zaloLinkParams = {
      productName: sanitizedProductName,
      sku: productId || 'N/A',
      price: `${price} VND`,
      sourcePage: landingUrl || 'Unknown',
      orderRef,
      zaloOaLink,
      ...(sanitizedVariant && { variant: sanitizedVariant }),
    }
    const zaloLink = buildZaloLink(zaloLinkParams)

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        orderRef: lead.orderRef,
        zaloLink,
      },
    })
  } catch (error) {
    console.error('Error creating lead:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid data',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { productName: { contains: search } },
        { orderRef: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: true,
        },
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}