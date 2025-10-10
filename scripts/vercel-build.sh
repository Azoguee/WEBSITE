#!/bin/bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-$POSTGRES_URL}"

# Always run 'prisma db push' to sync the schema directly.
# This is a robust way to handle inconsistent migration histories.
echo "Running 'prisma db push' to sync schema..."
npx prisma db push --accept-data-loss

echo "Next.js build..."
next build