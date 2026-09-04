// @ts-nocheck
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const countRes = await client.query('SELECT count(*) FROM "DeviceModel"');
    console.log("DeviceModel count in Postgres:", countRes.rows[0].count);
    
    // Check if Vivo models exist
    const vivoRes = await client.query('SELECT name, slug FROM "DeviceModel" WHERE slug LIKE \'%vivo%\' LIMIT 10');
    console.log("Sample Vivo models in DB:", vivoRes.rows);
    
    await client.end();
  } catch (err) {
    console.error("DB check err:", err.message);
  }
}

main();
