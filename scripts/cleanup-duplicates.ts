import { prisma } from "../lib/db";

async function main() {
  console.log("🔍 Checking orders CA35435, CA64089, CA46705...\n");

  const orders = await prisma.order.findMany({
    where: {
      orderNumber: { in: ["CA35435", "CA64089", "CA46705"] },
    },
    include: {
      user: true,
      agent: true,
      pickups: true,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const o of orders) {
    console.log(`Order: #${o.orderNumber}, Status: ${o.status}, Agent: ${o.agent?.name || "None"}, CreatedAt: ${o.createdAt}, DeletedAt: ${o.deletedAt}`);
  }

  // We want to keep the primary order (CA35435) which has the assigned agent Hyder Ali,
  // and soft-delete the two accidental duplicates (CA64089 and CA46705)
  const dupesToClean = ["CA64089", "CA46705"];

  for (const dupeNum of dupesToClean) {
    const dupe = orders.find(o => o.orderNumber === dupeNum);
    if (dupe && !dupe.deletedAt) {
      console.log(`🗑️ Soft-deleting duplicate order #${dupeNum}...`);
      await prisma.order.update({
        where: { id: dupe.id },
        data: {
          deletedAt: new Date(),
          status: "CANCELLED",
          cancellationReason: "Duplicate order placed due to connection retry - superseded by #CA35435",
        },
      });
      console.log(`✅ Order #${dupeNum} successfully marked as cancelled & soft-deleted.`);
    }
  }

  console.log("\n✨ Cleanup finished.");
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
