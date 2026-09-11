import dns from "node:dns";
try { (dns as any).setDefaultResultOrder?.("ipv4first"); } catch {}

import { PrismaClient } from "@prisma/client";

const HYDER_ALI_ID = "7e4de44f-78b5-4b9f-a584-b59905612a96";

// Use longer timeouts to get through when pool is busy
const dbUrl =
  "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=60&sslmode=require&connect_timeout=60";

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

async function go() {
  console.log("Searching for order CA45510...");

  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { orderNumber: "CA45510" },
        { orderNumber: "#CA45510" },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      agent: { select: { name: true } },
    },
  });

  if (!order) {
    console.log("Order CA45510 NOT found. Showing recent 5 orders:");
    const recent = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true, status: true },
    });
    console.log(JSON.stringify(recent, null, 2));
    return;
  }

  console.log("Found order:", JSON.stringify(order, null, 2));

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      agentId: HYDER_ALI_ID,
      status: "PARTNER_ASSIGNED",
    },
    select: { orderNumber: true, status: true, agentId: true },
  });

  console.log("\n✅ SUCCESS! Re-assigned order to Hyder Ali:");
  console.log(JSON.stringify(updated, null, 2));
}

go()
  .catch((e) => console.error("Error:", e.message))
  .finally(() => prisma.$disconnect());
