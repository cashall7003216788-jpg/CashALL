import { prisma } from "../lib/db";

async function main() {
  console.log("🔍 Fetching ALL orders from PostgreSQL database...\n");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      address: true,
      quote: {
        include: {
          variant: {
            include: {
              model: {
                include: { brand: true },
              },
            },
          },
        },
      },
      pickups: true,
    },
  });

  console.log(`Total orders in DB: ${orders.length}\n`);

  orders.forEach((o, index) => {
    let deviceName = "Mobile Device";
    if (o.quote?.breakdownJson) {
      try {
        const bd = JSON.parse(o.quote.breakdownJson);
        if (bd?.deviceName) deviceName = bd.deviceName;
      } catch {}
    }
    if (deviceName === "Mobile Device" && o.quote?.variant?.model) {
      const m = o.quote.variant.model;
      deviceName = m.brand ? `${m.brand.name} ${m.name}` : m.name;
    }

    console.log(`--- Order #${index + 1} ---`);
    console.log(`ID: ${o.id}`);
    console.log(`Order Number: ${o.orderNumber}`);
    console.log(`Customer Name: ${o.user?.name || "N/A"}`);
    console.log(`Customer Phone: ${o.user?.phone || "N/A"}`);
    console.log(`Device Name: ${deviceName}`);
    console.log(`Final Price: ₹${o.finalPrice}`);
    console.log(`Status: ${o.status}`);
    console.log(`Deleted At: ${o.deletedAt}`);
    console.log(`Created At: ${o.createdAt.toISOString()}`);
    console.log(`Address: ${o.address ? `${o.address.house}, ${o.address.area}, ${o.address.city} ${o.address.pincode}` : "None"}`);
    console.log("-----------------------\n");
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
