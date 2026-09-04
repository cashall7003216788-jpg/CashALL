// @ts-nocheck
import { Client } from "pg";

async function main() {
  const connectionString = "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log("[SUCCESS] Connected via pg client on 6543!");
    const res = await client.query('SELECT count(*) FROM "User"');
    console.log("User count in DB:", res.rows[0].count);
    await client.end();
  } catch (err) {
    console.error("[ERROR] pg client:", err);
  }
}

main();
