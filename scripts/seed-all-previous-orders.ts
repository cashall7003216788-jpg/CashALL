import { prisma } from "../lib/db";

async function seedPreviousOrders() {
  console.log("🌱 Seeding/Recovering all previous orders into PostgreSQL database...");

  const defaultVariant = await prisma.deviceVariant.findFirst({
    include: { model: { include: { brand: true } } },
  });

  if (!defaultVariant) {
    console.error("❌ No device variant found in DB.");
    return;
  }

  const previousOrders = [
    {
      orderNumber: "CA25844",
      customerName: "Sangeet Shaw",
      customerPhone: "6289477287",
      deviceName: "Apple iPhone 15 (128 GB)",
      basePrice: 40420,
      estimatedPrice: 40420,
      pincode: "700001",
      house: "Howrah, West Bengal",
      street: "GT Road",
      area: "Howrah",
      city: "Kolkata",
      state: "West Bengal",
      pickupDate: "Tomorrow",
      pickupTimeSlot: "10 AM - 1 PM",
      status: "PICKUP_SCHEDULED",
    },
    {
      orderNumber: "CA72512",
      customerName: "Rahul Verma",
      customerPhone: "9876543210",
      deviceName: "Apple iPhone 15 (128 GB)",
      basePrice: 32500,
      estimatedPrice: 32500,
      pincode: "700001",
      house: "12/A Park Street",
      street: "Park Street",
      area: "Park Circus",
      city: "Kolkata",
      state: "West Bengal",
      pickupDate: "Tomorrow",
      pickupTimeSlot: "2 PM - 5 PM",
      status: "PICKUP_SCHEDULED",
    },
    {
      orderNumber: "CA36738",
      customerName: "Ankit Sharma",
      customerPhone: "9876543211",
      deviceName: "Google Pixel 7 (128 GB)",
      basePrice: 28000,
      estimatedPrice: 28000,
      pincode: "700091",
      house: "Sector V, Salt Lake",
      street: "Ring Road",
      area: "Salt Lake",
      city: "Kolkata",
      state: "West Bengal",
      pickupDate: "Yesterday",
      pickupTimeSlot: "10 AM - 1 PM",
      status: "COMPLETED",
    },
  ];

  for (const ordData of previousOrders) {
    const existing = await prisma.order.findFirst({
      where: { orderNumber: ordData.orderNumber },
    });

    if (existing) {
      console.log(`✅ Order ${ordData.orderNumber} already exists in DB. Skipping creation.`);
      continue;
    }

    // 1. Find or create User
    let user = await prisma.user.findFirst({ where: { phone: ordData.customerPhone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: ordData.customerPhone,
          name: ordData.customerName,
          firebaseUid: `uid_${ordData.customerPhone}_hist_${Date.now()}`,
          role: "CUSTOMER",
        },
      });
    }

    // 2. Create Quote
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `Q${ordData.orderNumber.replace("CA", "")}`,
        variantId: defaultVariant.id,
        selectedAnswersJson: JSON.stringify({ device: ordData.deviceName }),
        basePrice: ordData.basePrice,
        totalDeductions: 0,
        estimatedPrice: ordData.estimatedPrice,
        breakdownJson: JSON.stringify({
          deviceName: ordData.deviceName,
          basePrice: ordData.basePrice,
          estimatedPrice: ordData.estimatedPrice,
          summary: "Customer valuation",
        }),
        status: ordData.status === "COMPLETED" ? "ORDERED" : "ORDERED",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 3. Create Address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: ordData.customerName,
        phone: ordData.customerPhone,
        house: ordData.house,
        street: ordData.street,
        area: ordData.area,
        city: ordData.city,
        state: ordData.state,
        pincode: ordData.pincode,
      },
    });

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber: ordData.orderNumber,
        userId: user.id,
        quoteId: quote.id,
        addressId: address.id,
        pickupDate: ordData.pickupDate,
        pickupTimeSlot: ordData.pickupTimeSlot,
        status: ordData.status as any,
        finalPrice: ordData.estimatedPrice,
      },
    });

    // 5. Create Pickup
    await prisma.pickup.create({
      data: {
        orderId: order.id,
        date: ordData.pickupDate,
        timeSlot: ordData.pickupTimeSlot,
        status: ordData.status === "COMPLETED" ? "COMPLETED" : "SCHEDULED",
        notes: "Historical order seeded into database.",
      },
    });

    console.log(`🎉 Created historical order ${ordData.orderNumber} (${ordData.deviceName}) in DB.`);
  }

  console.log("✅ Seed completed successfully!");
}

seedPreviousOrders()
  .catch((e) => console.error("Error seeding previous orders:", e))
  .finally(async () => {
    await prisma.$disconnect();
  });
