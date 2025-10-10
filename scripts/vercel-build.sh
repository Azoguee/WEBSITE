#!/bin/bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-$POSTGRES_URL}"

echo "Prisma generate..."
npx prisma generate

echo "Prisma migrate deploy..."
npx prisma migrate deploy --schema=prisma/schema.prisma

echo "Next.js build..."
next build