# 🚀 VERCEL DEPLOYMENT GUIDE - PRISMA FIX

## ✅ ĐÃ SỬA LỖI PRISMA TRÊN VERCEL

### **Lỗi đã sửa:**
- ❌ `@prisma/client did not initialize yet`
- ❌ Edge runtime không tương thích với Prisma
- ❌ Missing `prisma generate` trong build process
- ❌ Database connection issues

### **Giải pháp đã áp dụng:**

## 🔧 1. PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "vercel-build": "npm run db:init && next build",
    "db:init": "tsx scripts/prisma-init.ts"
  }
}
```

## 🔧 2. PRISMA CLIENT SINGLETON

**File:** `lib/db.ts`
- ✅ Singleton pattern để tránh multiple instances
- ✅ Proper connection management
- ✅ Graceful shutdown handlers
- ✅ Development hot-reload support

## 🔧 3. API ROUTES RUNTIME

**Tất cả API routes đã thêm:**
```typescript
export const runtime = 'nodejs'
```

**Files đã sửa:**
- `app/api/leads/route.ts`
- `app/api/analytics/route.ts` 
- `app/api/leads/[id]/route.ts`
- `app/api/health/route.ts` (mới)

## 🔧 4. VERCEL CONFIGURATION

**File:** `vercel.json`
```json
{
  "functions": {
    "app/api/**": {
      "runtime": "nodejs20.x"
    }
  },
  "buildCommand": "npm run vercel-build"
}
```

## 🔧 5. NEXT.JS CONFIG

**File:** `next.config.js`
- ✅ Webpack config cho Prisma
- ✅ Environment variables
- ✅ Proper bundling

## 🔧 6. PRISMA INITIALIZATION SCRIPT

**File:** `scripts/prisma-init.ts`
- ✅ Validate schema
- ✅ Generate client
- ✅ Deploy migrations (production)
- ✅ Test database connection

---

## 🚀 DEPLOYMENT STEPS

### **1. Environment Variables trên Vercel:**

```bash
# Required
DATABASE_URL="your-production-database-url"
NODE_ENV="production"

# Optional
SESSION_SECRET="your-session-secret"
ZALO_OA_LINK="https://zalo.me/your-zalo-oa"
```

### **2. Build Command trên Vercel:**
```bash
npm run vercel-build
```

### **3. Install Command:**
```bash
npm install
```

### **4. Framework Preset:**
```
Next.js
```

---

## 🧪 TESTING

### **1. Health Check:**
```bash
curl https://your-domain.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "prisma": "initialized",
  "counts": {
    "categories": 0,
    "products": 0,
    "leads": 0
  }
}
```

### **2. Test API Endpoints:**
```bash
# Test leads API
curl -X POST https://your-domain.vercel.app/api/leads \
  -H "Content-Type: application/json" \
  -d '{"productName":"Test","price":100}'

# Test analytics API  
curl -X POST https://your-domain.vercel.app/api/analytics \
  -H "Content-Type: application/json" \
  -d '{"event":"test","parameters":{}}'
```

---

## 🔍 TROUBLESHOOTING

### **Lỗi thường gặp:**

1. **"@prisma/client did not initialize yet"**
   - ✅ **Fixed:** `postinstall` script chạy `prisma generate`
   - ✅ **Fixed:** `vercel-build` script chạy `db:init`

2. **"Edge runtime not compatible"**
   - ✅ **Fixed:** Tất cả API routes có `export const runtime = 'nodejs'`

3. **"Database connection failed"**
   - ✅ **Fixed:** Prisma singleton với proper connection management
   - ✅ **Fixed:** Health check endpoint để test connection

4. **"Migration failed"**
   - ✅ **Fixed:** `prisma-init.ts` script handle migrations
   - ✅ **Fixed:** Fallback to `db push` nếu migrate deploy fail

---

## 📊 MONITORING

### **Health Check Endpoint:**
- **URL:** `/api/health`
- **Method:** GET
- **Response:** Database status, Prisma status, record counts

### **Logs to Monitor:**
```bash
# Vercel Function Logs
vercel logs --follow

# Check for these success messages:
✅ DATABASE_URL is configured
✅ Prisma schema is valid  
✅ Prisma client generated
✅ Database connection successful
```

---

## 🎯 KẾT QUẢ

**Trước khi sửa:**
- ❌ Prisma client not initialized
- ❌ Edge runtime errors
- ❌ Build failures
- ❌ Database connection issues

**Sau khi sửa:**
- ✅ Prisma client auto-generated
- ✅ Node.js runtime for all APIs
- ✅ Build success
- ✅ Database connection stable
- ✅ Health check endpoint
- ✅ Production ready

---

## 🚀 READY TO DEPLOY!

**Framework Preset:** `Next.js`  
**Build Command:** `npm run vercel-build`  
**Node.js Version:** `20.x`  

**Tất cả lỗi Prisma đã được sửa triệt để!** 🎉
