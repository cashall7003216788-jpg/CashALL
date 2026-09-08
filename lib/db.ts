import { PrismaClient } from "@prisma/client";
import dns from "node:dns";

// Ensure Node.js resolves IPv4 addresses first to avoid pooler connection timeouts
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {
  // Ignore in environments where not supported
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Supabase IPv4 Transaction Pooler URL (Port 6543 handles thousands of concurrent serverless requests)
const SUPABASE_IPV4_POOLER_URL =
  "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require";

// STRICT: NEVER use POSTGRES_URL_NON_POOLING (port 5432 session mode, max 15 clients).
// Always prioritize pooled connection URLs (port 6543).
let dbUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  SUPABASE_IPV4_POOLER_URL;

// If the URL accidentally points to session mode (:5432/), rewrite to transaction pooler (:6543/)
if (dbUrl.includes(":5432/")) {
  dbUrl = dbUrl.replace(":5432/", ":6543/");
}

if (!dbUrl || dbUrl.includes("db.jqysknhobtpcbyyltnfc.supabase.co") || dbUrl.includes("localhost")) {
  dbUrl = SUPABASE_IPV4_POOLER_URL;
}

// Ensure Supabase transaction pooler parameters are present
if (!dbUrl.includes("pgbouncer=true")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
}

// Set connection limit to 5 so parallel queries and relation includes run smoothly without queuing
if (dbUrl.includes("connection_limit=")) {
  dbUrl = dbUrl.replace(/connection_limit=\d+/, "connection_limit=5");
} else {
  dbUrl += "&connection_limit=5";
}

// Set pool timeout to 25s so queries have sufficient headroom
if (dbUrl.includes("pool_timeout=")) {
  dbUrl = dbUrl.replace(/pool_timeout=\d+/, "pool_timeout=25");
} else {
  dbUrl += "&pool_timeout=25";
}

if (!dbUrl.includes("sslmode=")) {
  dbUrl += "&sslmode=require";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["error"],
  });

// Always store singleton on globalThis across all environments to prevent connection leaks
globalForPrisma.prisma = prisma;
