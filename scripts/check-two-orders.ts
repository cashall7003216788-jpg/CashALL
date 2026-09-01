import { prisma } from "../lib/db";

async function main() {
  const o1 = await prisma.order.findUnique({
    where: { orderNumber: "CA61962" },
    include: { address: true, user: true, agent: true, pickups: true, imeiRecords: true, qcReports: true, quote: true },
  });

  const o2 = await prisma.order.findUnique({
    where: { orderNumber: "CA94565" },
    include: { address: true, user: true, agent: true, pickups: true, imeiRecords: true, qcReports: true, quote: true },
  });

  console.log("=== CA61962 ===");
  console.log(JSON.stringify(o1, null, 2));

  console.log("\n=== CA94565 ===");
  console.log(JSON.stringify(o2, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
