const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECKING POSTGRESQL DATABASE FOR ALL ORDERS & QUOTES ===");
  
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      address: true,
      quote: {
        include: {
          variant: {
            include: {
              model: {
                include: { brand: true }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  console.log(`\nTOTAL ORDERS IN DB: ${orders.length}`);
  orders.forEach((o, index) => {
    const brand = o.quote?.variant?.model?.brand?.name || "";
    const model = o.quote?.variant?.model?.name || "";
    const deviceName = `${brand} ${model}`.trim() || "Device";

    console.log(`\nORDER #${index + 1}:`);
    console.log(`- Order Number: ${o.orderNumber}`);
    console.log(`- Status: ${o.status}`);
    console.log(`- Customer Name: ${o.user?.name || "N/A"}`);
    console.log(`- Customer Phone: ${o.user?.phone || "N/A"}`);
    console.log(`- Device: ${deviceName}`);
    console.log(`- Address: ${o.address ? `${o.address.house}, ${o.address.street}, ${o.address.city}, ${o.address.state} - ${o.address.pincode}` : "No Address"}`);
    console.log(`- Created At: ${o.createdAt}`);
  });

  const quotes = await prisma.quote.findMany({
    include: {
      variant: {
        include: {
          model: {
            include: { brand: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  console.log(`\nTOTAL QUOTES IN DB: ${quotes.length}`);
  quotes.forEach((q, index) => {
    const brand = q.variant?.model?.brand?.name || "";
    const model = q.variant?.model?.name || "";
    const deviceName = `${brand} ${model}`.trim() || "Device";

    console.log(`\nQUOTE #${index + 1}:`);
    console.log(`- Quote ID: ${q.id}`);
    console.log(`- Quote Number: ${q.quoteNumber}`);
    console.log(`- Status: ${q.status}`);
    console.log(`- Customer Phone: ${q.customerPhone || "N/A"}`);
    console.log(`- Device: ${deviceName}`);
    console.log(`- Estimated Price: ₹${q.estimatedPrice}`);
    console.log(`- Created At: ${q.createdAt}`);
  });
}

main()
  .catch((e) => console.error("Database Error:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
