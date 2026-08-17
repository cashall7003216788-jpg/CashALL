import { prisma } from "../lib/db";

async function main() {
  console.log("🧪 Testing order creation logic with non-UUID quoteId...");

  const testPhone = "9876543210";
  let user = await prisma.user.findFirst({ where: { phone: testPhone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: testPhone,
        name: "Test Customer",
        firebaseUid: `uid_${testPhone}_test`,
        role: "CUSTOMER",
      },
    });
  }

  const defaultVariant = await prisma.deviceVariant.findFirst({
    include: { model: { include: { brand: true } } },
  });

  if (!defaultVariant) {
    console.error("No default variant found.");
    return;
  }

  const quote = await prisma.quote.create({
    data: {
      quoteNumber: `Q${Math.floor(10000 + Math.random() * 90000)}`,
      variantId: defaultVariant.id,
      selectedAnswersJson: JSON.stringify({ device: "Google Pixel 8 Pro" }),
      basePrice: 45000,
      totalDeductions: 0,
      estimatedPrice: 45000,
      breakdownJson: JSON.stringify({
        deviceName: "Google Pixel 8 Pro",
        basePrice: 45000,
        estimatedPrice: 45000,
        summary: "Customer valuation",
      }),
      status: "ORDERED",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: "Test Customer",
      phone: testPhone,
      house: "123 Test St",
      street: "Test Road",
      area: "Howrah",
      city: "Howrah",
      state: "West Bengal",
      pincode: "711101",
    },
  });

  const orderNumber = `CA${Math.floor(10000 + Math.random() * 90000)}`;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      quoteId: quote.id,
      addressId: address.id,
      pickupDate: "Tomorrow",
      pickupTimeSlot: "10 AM - 1 PM",
      status: "PICKUP_SCHEDULED",
      finalPrice: 45000,
    },
  });

  console.log(`✅ Test order created successfully in DB: ${order.orderNumber} (ID: ${order.id})`);

  // Clean up test order
  await prisma.order.delete({ where: { id: order.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  await prisma.address.delete({ where: { id: address.id } });
  console.log("🧹 Test order cleaned up.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
