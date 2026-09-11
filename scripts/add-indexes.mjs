import pkg from "pg";
const { Client } = pkg;

async function run() {
  const client = new Client({
    host: "db.jqysknhobtpcbyyltnfc.supabase.co",
    port: 5432,
    database: "postgres",
    user: "postgres",
    password: "cashall@7003216788",
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to database...");

  const queries = [
    'CREATE INDEX IF NOT EXISTS "Order_agentId_idx" ON "Order"("agentId")',
    'CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status")',
    'CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt" DESC)',
    'CREATE INDEX IF NOT EXISTS "Order_deletedAt_idx" ON "Order"("deletedAt")',
    'CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")',
  ];

  for (const q of queries) {
    console.log("Executing:", q);
    await client.query(q);
  }

  console.log("All indexes created successfully!");

  const res = await client.query(
    "SELECT indexname FROM pg_indexes WHERE tablename = 'Order'"
  );
  console.log("Current indexes on Order:", res.rows.map((r) => r.indexname));

  await client.end();
}

run().catch((err) => {
  console.error("Index creation failed:", err);
  process.exit(1);
});
