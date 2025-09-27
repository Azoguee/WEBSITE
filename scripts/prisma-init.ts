#!/usr/bin/env tsx

/**
 * Prisma initialization script for Vercel deployment
 * Ensures Prisma client is generated and database is ready
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

async function initializePrisma() {
  console.log('🔧 Initializing Prisma...')
  
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    console.log('✅ DATABASE_URL is configured')
    
    // Validate Prisma schema
    console.log('🔍 Validating Prisma schema...')
    execSync('npx prisma validate', { stdio: 'inherit' })
    console.log('✅ Prisma schema is valid')
    
    // Generate Prisma client
    console.log('⚙️ Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma client generated')
    
    // Check if we're in production and need to run migrations
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Production environment detected')
      
      // Check if migrations need to be deployed
      try {
        console.log('📦 Deploying migrations...')
        execSync('npx prisma migrate deploy', { stdio: 'inherit' })
        console.log('✅ Migrations deployed successfully')
      } catch (error) {
        console.warn('⚠️ Migration deploy failed, trying db push...')
        try {
          execSync('npx prisma db push', { stdio: 'inherit' })
          console.log('✅ Database schema pushed successfully')
        } catch (pushError) {
          console.error('❌ Database setup failed:', pushError)
          throw pushError
        }
      }
    } else {
      console.log('🔧 Development environment detected')
      console.log('💡 Run "npm run db:push" to sync database schema')
    }
    
    // Test database connection
    console.log('🔌 Testing database connection...')
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Database connection successful')
    } finally {
      await prisma.$disconnect()
    }
    
    console.log('🎉 Prisma initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Prisma initialization failed:', error)
    process.exit(1)
  }
}

// Run initialization
initializePrisma()
