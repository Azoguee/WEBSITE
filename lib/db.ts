import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (process.env.DATABASE_URL
    ? new PrismaClient({
        datasources: {
          db: {
            url: process.env.PRISMA_DATABASE_URL ?? process.env.DATABASE_URL,
          },
        },
      })
    : new Proxy(
        {},
        {
          get: (target, prop) => {
            if (prop === '$transaction') {
              return async (promises: any[]) => await Promise.all(promises);
            }
            return () => {
              throw new Error(
                'Database is not connected. DATABASE_URL is not set.',
              );
            };
          },
        },
      ));

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;