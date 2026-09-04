import { PrismaClient } from "@prisma/client";

async function testConnection(url: string, name: string) {
  const p = new PrismaClient({
    datasources: { db: { url } },
    log: ["error"],
  });
  try {
    const start = Date.now();
    const count = await p.user.count();
    console.log(`[SUCCESS] ${name}: connected in ${Date.now() - start}ms, user count: ${count}`);
    await p.$disconnect();
    return true;
  } catch (err: any) {
    console.log(`[FAILED] ${name}: ${err.message?.split("\n")[0]}`);
    await p.$disconnect();
    return false;
  }
}

async function main() {
  const url6543 = "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
  const url5432 = "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

  console.log("Testing 6543...");
  const ok6543 = await testConnection(url6543, "Port 6543 (PgBouncer)");
  console.log("Testing 5432...");
  const ok5432 = await testConnection(url5432, "Port 5432 (Session)");
}

main();
