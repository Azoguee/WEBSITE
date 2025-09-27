#!/usr/bin/env tsx

/**
 * Runtime compatibility checker for Vercel deployment
 * Ensures all API routes use Node.js runtime and no legacy configs
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

interface RuntimeCheck {
  file: string
  hasRuntime: boolean
  runtimeType: string | null
  hasPrisma: boolean
  issues: string[]
}

async function checkRuntimeCompatibility() {
  console.log('🔍 Checking runtime compatibility...')
  
  const issues: string[] = []
  const checks: RuntimeCheck[] = []
  
  try {
    // Check vercel.json for legacy configs
    console.log('📋 Checking vercel.json...')
    if (existsSync('vercel.json')) {
      const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf-8'))
      
      // Check for legacy configs
      if (vercelConfig.builds) {
        issues.push('❌ Legacy "builds" config found in vercel.json')
      }
      if (vercelConfig.routes) {
        issues.push('❌ Legacy "routes" config found in vercel.json')
      }
      if (vercelConfig.functions) {
        for (const [pattern, config] of Object.entries(vercelConfig.functions)) {
          if (typeof config === 'object' && config.runtime) {
            if (config.runtime.startsWith('now-')) {
              issues.push(`❌ Legacy "now-*" runtime found: ${pattern} -> ${config.runtime}`)
            }
            if (!config.runtime.startsWith('nodejs')) {
              issues.push(`❌ Non-Node.js runtime found: ${pattern} -> ${config.runtime}`)
            }
          }
        }
      }
      
      console.log('✅ vercel.json config is clean')
    }
    
    // Check all API routes
    console.log('🔍 Checking API routes...')
    const apiFiles = await glob('app/api/**/*.{ts,js}')
    
    for (const file of apiFiles) {
      const content = readFileSync(file, 'utf-8')
      const hasRuntime = content.includes('export const runtime')
      const hasPrisma = content.includes('@prisma/client') || content.includes('prisma')
      
      let runtimeType: string | null = null
      if (hasRuntime) {
        const runtimeMatch = content.match(/export const runtime = ['"`]([^'"`]+)['"`]/)
        runtimeType = runtimeMatch ? runtimeMatch[1] : null
      }
      
      const fileIssues: string[] = []
      
      if (hasPrisma && !hasRuntime) {
        fileIssues.push('❌ Prisma import without runtime declaration')
      }
      
      if (hasRuntime && runtimeType !== 'nodejs') {
        fileIssues.push(`❌ Non-Node.js runtime: ${runtimeType}`)
      }
      
      if (hasPrisma && runtimeType === 'edge') {
        fileIssues.push('❌ Prisma with Edge runtime (incompatible)')
      }
      
      checks.push({
        file,
        hasRuntime,
        runtimeType,
        hasPrisma,
        issues: fileIssues
      })
      
      if (fileIssues.length > 0) {
        issues.push(...fileIssues.map(issue => `${file}: ${issue}`))
      }
    }
    
    // Summary
    console.log('\n📊 RUNTIME COMPATIBILITY REPORT')
    console.log('=' .repeat(50))
    
    if (issues.length === 0) {
      console.log('✅ All checks passed! No runtime issues found.')
    } else {
      console.log('❌ Issues found:')
      issues.forEach(issue => console.log(`  ${issue}`))
    }
    
    console.log('\n📋 API Routes Summary:')
    checks.forEach(check => {
      const status = check.issues.length === 0 ? '✅' : '❌'
      console.log(`  ${status} ${check.file}`)
      console.log(`    Runtime: ${check.runtimeType || 'none'}`)
      console.log(`    Prisma: ${check.hasPrisma ? 'yes' : 'no'}`)
      if (check.issues.length > 0) {
        check.issues.forEach(issue => console.log(`    ${issue}`))
      }
    })
    
    // Vercel deployment recommendations
    console.log('\n🚀 VERCEL DEPLOYMENT RECOMMENDATIONS:')
    console.log('1. Framework Preset: Next.js')
    console.log('2. Build Command: npm run vercel-build')
    console.log('3. Node.js Version: 20.x')
    console.log('4. Environment Variables: DATABASE_URL, NODE_ENV')
    
    if (issues.length > 0) {
      console.log('\n⚠️  Please fix the issues above before deploying.')
      process.exit(1)
    } else {
      console.log('\n🎉 Ready for Vercel deployment!')
    }
    
  } catch (error) {
    console.error('❌ Runtime check failed:', error)
    process.exit(1)
  }
}

// Run the check
checkRuntimeCompatibility()
