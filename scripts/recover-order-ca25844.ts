/**
 * Recovery script: Create the missing order CA25844 in the database.
 * The order was placed on laptop but only saved to localStorage — never reached the DB.
 * 
 * Known data from user screenshots:
 *   - Customer: Sangeet Shaw
 *   - Phone: 6289477287
 *   - Device: Apple iPhone 15 (128 GB)
 *   - Price: ₹40,420
 *   - Pickup: Tomorrow, 10 AM - 1 PM
 *   - Status: PICKUP_SCHEDULED
 *   - Order Number: CA25844
 */

import { prisma } from "../lib/db";

async function main() {
  console.log("🔧 Recovering missing order CA25844...\n");

  // 1. Check if it already exists
  const existing = await prisma.order.findFirst({ where: { orderNumber: "CA25844" } });
  if (existing) {
    console.log("✅ Order CA25844 already exists in DB. No recovery needed.");
    return;
  }

  // 2. Find or create the customer user
  const phoneNum = "6289477287";
  let user = await prisma.user.findFirst({ where: { phone: { contains: "6289477287" } } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: phoneNum,
        name: "Sangeet Shaw",
        firebaseUid: `uid_6289477287_recovery`,
        role: "CUSTOMER",
      },
    });
    console.log("✅ Created user:", user.name, user.phone);
  } else {
    console.log("✅ Found existing user:", user.name, user.phone);
    // Ensure name is correct
    if (user.name !== "Sangeet Shaw") {
      user = await prisma.user.update({ where: { id: user.id }, data: { name: "Sangeet Shaw" } });
      console.log("   Updated name to Sangeet Shaw");
    }
  }

  // 3. Get a device variant for iPhone 15 (or closest available)
  let variant = await prisma.deviceVariant.findFirst({
    where: {
      storage: { contains: "128" },
      model: {
        name: { contains: "15" },
        brand: { name: { contains: "Apple" } },
      },
    },
    include: { model: { include: { brand: true } } },
  });

  if (!variant) {
    // Fallback to any Apple iPhone variant
    variant = await prisma.deviceVariant.findFirst({
      where: { model: { brand: { name: { contains: "Apple" } } } },
      include: { model: { include: { brand: true } } },
    });
  }

  if (!variant) {
    variant = await prisma.deviceVariant.findFirst({
      include: { model: { include: { brand: true } } },
    });
  }

  if (!variant) {
    console.error("❌ No device variant found. Cannot create order.");
    return;
  }
  console.log(`✅ Using variant: ${variant.model?.brand?.name} ${variant.model?.name} (${variant.storage})`);

  // 4. Create quote with correct device name
  const quote = await prisma.quote.create({
    data: {
      quoteNumber: "Q25844",
      variantId: variant.id,
      selectedAnswersJson: JSON.stringify({ device: "Apple iPhone 15 (128 GB)" }),
      basePrice: 40420,
      totalDeductions: 0,
      estimatedPrice: 40420,
      breakdownJson: JSON.stringify({
        deviceName: "Apple iPhone 15 (128 GB)",
        basePrice: 40420,
        estimatedPrice: 40420,
        summary: "Customer assessment valuation - recovered from localStorage",
      }),
      status: "ORDERED",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
  console.log("✅ Created quote:", quote.id);

  // 5. Create address
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: "Sangeet Shaw",
      phone: phoneNum,
      house: "Customer Address",
      street: "West Bengal",
      area: "West Bengal",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700001",
    },
  });
  console.log("✅ Created address:", address.id);

  // 6. Create the order with the exact order number CA25844
  const order = await prisma.order.create({
    data: {
      orderNumber: "CA25844",
      userId: user.id,
      quoteId: quote.id,
      addressId: address.id,
      pickupDate: "Tomorrow",
      pickupTimeSlot: "10 AM - 1 PM",
      status: "PICKUP_SCHEDULED",
      finalPrice: 40420,
    },
  });
  console.log("✅ Created order:", order.orderNumber, order.id);

  // 7. Create pickup record
  await prisma.pickup.create({
    data: {
      orderId: order.id,
      date: "Tomorrow",
      timeSlot: "10 AM - 1 PM",
      status: "SCHEDULED",
      notes: "Order recovered from localStorage data.",
    },
  });
  console.log("✅ Created pickup record");

  console.log("\n🎉 Successfully recovered order CA25844 in the database!");
  console.log("   Customer: Sangeet Shaw (6289477287)");
  console.log("   Device: Apple iPhone 15 (128 GB)");
  console.log("   Price: ₹40,420");
  console.log("\n   The order should now appear on all devices when logged in with 6289477287.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
