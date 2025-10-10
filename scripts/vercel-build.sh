#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the appropriate Prisma command based on the Vercel environment.
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Vercel environment is production, running 'prisma migrate deploy'..."
  npx prisma migrate deploy
else
  echo "Vercel environment is not production, running 'prisma db push'..."
  npx prisma db push
fi

# Run the Next.js build.
echo "Running 'next build'..."
next build