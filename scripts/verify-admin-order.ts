import { prisma } from "../lib/db";

async function main() {
  const orders = await prisma.order.findMany({
    where: { deletedAt: null },
    include: { address: true, agent: true, pickups: true },
    orderBy: { createdAt: "desc" },
  });

  const o61962 = orders.find((o) => o.orderNumber === "CA61962");
  const o94565 = orders.find((o) => o.orderNumber === "CA94565");

  console.log("Active CA61962 in Admin Dashboard Query:");
  console.log({
    orderNumber: o61962?.orderNumber,
    address: `${o61962?.address?.house}, ${o61962?.address?.street}, ${o61962?.address?.city}, ${o61962?.address?.state} - ${o61962?.address?.pincode}`,
    agent: o61962?.agent?.name,
    pickupDate: o61962?.pickupDate,
    pickupSlot: o61962?.pickupTimeSlot,
    status: o61962?.status,
  });

  console.log("\nActive CA94565 in Admin Dashboard Query?:", Boolean(o94565));
}

main().catch(console.error).finally(() => prisma.$disconnect());
