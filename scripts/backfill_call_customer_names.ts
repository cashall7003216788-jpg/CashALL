import { prisma } from "../lib/db";

async function backfillCallCustomerNames() {
  console.log("🔍 Scanning auditLog for call records with missing customer details...");

  const logs = await prisma.auditLog.findMany({
    where: {
      action: { in: ["SUPPORT_CALL_RECORDING", "SUPPORT_CALL_LOGGED"] },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${logs.length} call records in auditLog.`);
  let updatedCount = 0;

  for (const log of logs) {
    if (!log.newValuesJson) continue;

    let data: any = {};
    try {
      data = JSON.parse(log.newValuesJson);
    } catch {
      continue;
    }

    const currentCustomerName = data.customerName || "";
    const customerPhone = data.customerPhone || "";
    const cleanDigits = customerPhone.replace(/\D/g, "").slice(-10);

    if (!cleanDigits) continue;

    let needsUpdate = false;
    let enrichedName = currentCustomerName;
    let enrichedDevice = data.deviceName || "Mobile Device";
    let enrichedQuoteId = data.quoteId || "N/A";

    // 1. Search prisma.user
    if (!enrichedName || enrichedName === "Customer Lead") {
      const user = await prisma.user.findFirst({
        where: { phone: { contains: cleanDigits } },
        select: { name: true },
      });
      if (user?.name) {
        enrichedName = user.name;
        needsUpdate = true;
      }
    }

    // 2. Search prisma.order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { user: { phone: { contains: cleanDigits } } },
          { address: { phone: { contains: cleanDigits } } },
        ],
      },
      include: {
        user: true,
        address: true,
        quote: {
          include: {
            variant: { include: { model: { include: { brand: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (order) {
      if (!enrichedName || enrichedName === "Customer Lead") {
        if (order.address?.fullName) {
          enrichedName = order.address.fullName;
          needsUpdate = true;
        } else if (order.user?.name) {
          enrichedName = order.user.name;
          needsUpdate = true;
        }
      }

      if ((!enrichedDevice || enrichedDevice === "Mobile Device") && order.quote?.variant) {
        enrichedDevice = `${order.quote.variant.model.brand.name} ${order.quote.variant.model.name} (${order.quote.variant.storage})`;
        needsUpdate = true;
      }

      if ((!enrichedQuoteId || enrichedQuoteId === "N/A") && order.quote?.quoteNumber) {
        enrichedQuoteId = order.quote.quoteNumber;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      data.customerName = enrichedName;
      data.deviceName = enrichedDevice;
      data.quoteId = enrichedQuoteId;

      await prisma.auditLog.update({
        where: { id: log.id },
        data: {
          newValuesJson: JSON.stringify(data),
        },
      });

      console.log(`✅ Updated Call #${log.id.slice(0, 8)}: Customer="${enrichedName}", Device="${enrichedDevice}", Phone="${customerPhone}"`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Backfill complete! Updated ${updatedCount} call records.`);
}

backfillCallCustomerNames()
  .catch((err) => {
    console.error("Backfill failed:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
