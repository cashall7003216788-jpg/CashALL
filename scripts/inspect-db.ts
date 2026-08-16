import { prisma } from "../lib/db";

async function main() {
  console.log("=== ALL ORDERS IN DATABASE ===");
  const orders = await prisma.order.findMany({
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
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${orders.length} orders:`);
  orders.forEach((o) => {
    console.log({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.user?.name,
      customerPhone: o.user?.phone,
      city: o.address?.city,
      state: o.address?.state,
      address: `${o.address?.house}, ${o.address?.street}, ${o.address?.city}, ${o.address?.state} - ${o.address?.pincode}`,
      device: o.quote?.variant?.model ? `${o.quote.variant.model.brand.name} ${o.quote.variant.model.name}` : "Unknown",
      estimatedPrice: o.quote?.estimatedPrice,
      finalPrice: o.finalPrice,
      createdAt: o.createdAt,
    });
  });

  console.log("\n=== ALL QUOTES IN DATABASE ===");
  const quotes = await prisma.quote.findMany({
    include: {
      variant: {
        include: {
          model: {
            include: { brand: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${quotes.length} quotes:`);
  quotes.forEach((q) => {
    console.log({
      id: q.id,
      quoteNumber: q.quoteNumber,
      status: q.status,
      device: q.variant?.model ? `${q.variant.model.brand.name} ${q.variant.model.name}` : "Unknown",
      estimatedPrice: q.estimatedPrice,
      createdAt: q.createdAt,
    });
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
