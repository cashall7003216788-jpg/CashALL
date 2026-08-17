import { prisma } from "../lib/db";

async function main() {
  console.log("🔍 Checking order CA25844...");
  
  const order = await prisma.order.findFirst({
    where: { orderNumber: "CA25844" },
    include: { user: true, address: true, quote: true, pickups: true },
  });

  if (!order) {
    console.log("❌ Order CA25844 not found in DB.");
    return;
  }

  console.log("✅ Found order:", JSON.stringify({
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    finalPrice: order.finalPrice,
    status: order.status,
    user: order.user ? { name: order.user.name, phone: order.user.phone } : null,
    quote: order.quote ? {
      id: order.quote.id,
      breakdownJson: order.quote.breakdownJson,
      estimatedPrice: order.quote.estimatedPrice,
    } : null,
    pickups: order.pickups,
  }, null, 2));

  // Fix 1: Correct the device name in the quote's breakdownJson
  if (order.quote) {
    console.log("\n🔧 Updating quote breakdownJson to correct device name...");
    await prisma.quote.update({
      where: { id: order.quote.id },
      data: {
        breakdownJson: JSON.stringify({
          deviceName: "Apple iPhone 15 (128 GB)",
          basePrice: order.quote.estimatedPrice,
          estimatedPrice: order.quote.estimatedPrice,
          summary: "Customer assessment valuation",
        }),
        selectedAnswersJson: JSON.stringify({ device: "Apple iPhone 15 (128 GB)" }),
      },
    });
    console.log("✅ Quote updated with correct device name: Apple iPhone 15 (128 GB)");
  }

  // Also check if user phone is correct
  if (order.user) {
    console.log(`\n📱 User phone in DB: "${order.user.phone}"`);
    // Ensure phone is stored as 10-digit number for consistent lookup
    const cleanPhone = order.user.phone.replace(/\D/g, "").slice(-10);
    if (order.user.phone !== cleanPhone && cleanPhone.length === 10) {
      console.log(`🔧 Normalizing phone from "${order.user.phone}" to "${cleanPhone}"`);
      await prisma.user.update({
        where: { id: order.user.id },
        data: { phone: cleanPhone },
      });
      console.log("✅ User phone normalized.");
    } else {
      console.log("✅ Phone is already correct.");
    }
  }

  console.log("\n✅ Done! Order CA25844 fixed.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
