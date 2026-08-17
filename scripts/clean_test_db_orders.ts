import { prisma } from "../lib/db";

async function main() {
  console.log("=== CLEANING TEST MOCK ORDERS FROM DATABASE ===");
  
  // Find test orders CA36738 and CA72512
  const testOrders = await prisma.order.findMany({
    where: {
      orderNumber: {
        in: ["CA36738", "CA72512"],
      },
    },
    include: {
      quote: true,
      user: true,
    },
  });

  console.log(`Found ${testOrders.length} test orders to delete.`);

  for (const o of testOrders) {
    console.log(`Deleting test order: ${o.orderNumber} (${o.user?.name || "Customer"})...`);
    await prisma.pickup.deleteMany({ where: { orderId: o.id } });
    await prisma.payment.deleteMany({ where: { orderId: o.id } });
    await prisma.invoice.deleteMany({ where: { orderId: o.id } });
    await prisma.qcReport.deleteMany({ where: { orderId: o.id } });
    await prisma.order.delete({ where: { id: o.id } });
    if (o.quoteId) {
      await prisma.quote.delete({ where: { id: o.quoteId } }).catch(() => {});
    }
  }

  const remaining = await prisma.order.findMany({
    include: { user: true },
  });

  console.log(`\nRemaining live database orders (${remaining.length}):`);
  remaining.forEach((r) => {
    console.log(` - ${r.orderNumber}: ${r.user?.name} (${r.user?.phone}) - ${r.status}`);
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
