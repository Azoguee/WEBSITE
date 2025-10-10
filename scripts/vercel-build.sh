#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Always run 'prisma db push' to sync the schema directly.
# This is a robust way to handle inconsistent migration histories.
echo "Running 'prisma db push' to sync schema..."
npx prisma db push --accept-data-loss

# Run the Next.js build.
echo "Running 'next build'..."
next build