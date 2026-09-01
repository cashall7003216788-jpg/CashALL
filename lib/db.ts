import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Supabase IPv4 Pooler URL (Required for Vercel Serverless Functions which lack IPv6 outbound routing)
const SUPABASE_IPV4_POOLER_URL =
  "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

let dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || SUPABASE_IPV4_POOLER_URL;

// Force override any IPv6 direct host or port 6543 to working port 5432
if (!dbUrl || dbUrl.includes("db.jqysknhobtpcbyyltnfc.supabase.co") || dbUrl.includes("localhost") || dbUrl.includes(":6543")) {
  dbUrl = SUPABASE_IPV4_POOLER_URL;
}

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
