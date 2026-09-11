// Uses pg directly to the non-pooled Supabase connection — bypasses PgBouncer entirely
import pkg from "pg";
const { Client } = pkg;

const HYDER_ALI_ID = "7e4de44f-78b5-4b9f-a584-b59905612a96";

// Direct connection to Supabase (bypasses PgBouncer - port 5432 on db.* host)
const client = new Client({
  host: "db.jqysknhobtpcbyyltnfc.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "cashall@7003216788",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  statement_timeout: 10000,
});

async function go() {
  console.log("Connecting via direct (non-pooled) connection...");
  await client.connect();
  console.log("Connected!");

  // 1. Find the order
  const res = await client.query(
    `SELECT id, "orderNumber", status, "agentId"
     FROM "Order"
     WHERE "orderNumber" IN ('CA45510', '#CA45510')
     LIMIT 1`
  );

  if (res.rows.length === 0) {
    console.log("Order CA45510 not found. Showing 5 most recent orders:");
    const recent = await client.query(
      `SELECT "orderNumber", status, "createdAt" FROM "Order" ORDER BY "createdAt" DESC LIMIT 5`
    );
    console.table(recent.rows);
    return;
  }

  const order = res.rows[0];
  console.log("Found order:", order);

  // 2. Re-assign to Hyder Ali
  const newStatus = order.status === "PENDING_TO_ASSIGN" ? "ASSIGNED" : order.status;
  const update = await client.query(
    `UPDATE "Order"
     SET "agentId" = $1, status = $2::\"OrderStatus\", "updatedAt" = NOW()
     WHERE id = $3
     RETURNING "orderNumber", status, "agentId"`,
    [HYDER_ALI_ID, newStatus, order.id]
  );

  const updated = update.rows[0];
  console.log("\n✅ SUCCESS! Order re-assigned to Hyder Ali:");
  console.log("  Order Number:", updated.orderNumber);
  console.log("  New Agent ID:", updated.agentId);
  console.log("  Status:", updated.status);
}

go()
  .catch((e) => console.error("Error:", e.message))
  .finally(() => client.end());
