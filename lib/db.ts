import { PrismaClient } from "@prisma/client";
import dns from "node:dns";

// Ensure Node.js resolves IPv4 addresses first to avoid pooler connection timeouts
try {
  dns.setDefaultResultOrder?.("ipv4first");
} catch {
  // Ignore in environments where not supported
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Supabase IPv4 Transaction Pooler URL (Port 6543 handles high concurrent traffic via transaction pooling)
const SUPABASE_IPV4_POOLER_URL =
  "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=20&sslmode=require";

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

// In serverless environments (Vercel, AWS Lambda), each function container processes ONE request at a time.
// Setting connection_limit=1 per container allows 150+ concurrent serverless lambdas without saturating PgBouncer (200 limit).
// In local dev/non-serverless, 5 connections are allowed for concurrency.
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  process.env.NODE_ENV === "production"
);
const connectionLimit = isServerless ? "1" : "5";

if (dbUrl.includes("connection_limit=")) {
  dbUrl = dbUrl.replace(/connection_limit=\d+/, `connection_limit=${connectionLimit}`);
} else {
  dbUrl += `&connection_limit=${connectionLimit}`;
}

// Pool timeout: 20s so during traffic bursts, queries wait safely rather than failing immediately
if (dbUrl.includes("pool_timeout=")) {
  dbUrl = dbUrl.replace(/pool_timeout=\d+/, "pool_timeout=20");
} else {
  dbUrl += "&pool_timeout=20";
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
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });

// Always store singleton on globalThis across all environments to prevent connection leaks
globalForPrisma.prisma = prisma;
