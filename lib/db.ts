import { PrismaClient } from "@prisma/client";
import dns from "node:dns";

// Ensure Node.js resolves IPv4 addresses first to avoid pooler connection timeouts
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {
  // Ignore in environments where not supported
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Supabase IPv4 Transaction Pooler URL
// connection_limit=1 is CRITICAL for serverless (each function instance gets 1 connection via PgBouncer)
// Do NOT set it to 20 — that causes EMAXCONN with multiple Vercel instances
const SUPABASE_IPV4_POOLER_URL =
  "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=15&sslmode=require";

let dbUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  SUPABASE_IPV4_POOLER_URL;

// If the URL accidentally points to direct host, rewrite to transaction pooler
if (dbUrl.includes("db.jqysknhobtpcbyyltnfc.supabase.co") || dbUrl.includes("localhost")) {
  dbUrl = SUPABASE_IPV4_POOLER_URL;
}

// Force port 6543 (PgBouncer transaction mode) — never 5432 (session mode, limited slots)
if (dbUrl.includes(":5432/")) {
  dbUrl = dbUrl.replace(":5432/", ":6543/");
}

// Ensure pgbouncer flag is set
if (!dbUrl.includes("pgbouncer=true")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
}

// CRITICAL: Force connection_limit=1 per serverless function instance
// With PgBouncer, 1 connection per instance is enough. Setting it higher causes EMAXCONN.
if (dbUrl.includes("connection_limit=")) {
  dbUrl = dbUrl.replace(/connection_limit=\d+/, "connection_limit=1");
} else {
  dbUrl += "&connection_limit=1";
}

// Pool timeout: 15s — fail fast, never let queries queue forever
if (dbUrl.includes("pool_timeout=")) {
  dbUrl = dbUrl.replace(/pool_timeout=\d+/, "pool_timeout=15");
} else {
  dbUrl += "&pool_timeout=15";
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

// Singleton across all environments to prevent connection leaks in dev
globalForPrisma.prisma = prisma;
