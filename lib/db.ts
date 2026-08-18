import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:cashall%407003216788@db.jqysknhobtpcbyyltnfc.supabase.co:5432/postgres";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
