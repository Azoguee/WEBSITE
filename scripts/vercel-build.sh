#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Set the DATABASE_URL to the direct connection string for migrations
export DATABASE_URL="$STORAGE_POSTGRES_URL"

# Run the appropriate Prisma command based on the Vercel environment.
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Vercel environment is production, running 'prisma migrate deploy'..."
  npx prisma migrate deploy --schema=prisma/schema.prisma
else
  echo "Vercel environment is not production, running 'prisma db push'..."
  npx prisma db push --schema=prisma/schema.prisma
fi

# Run the Next.js build.
echo "Running 'next build'..."
next build