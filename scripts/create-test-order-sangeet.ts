import { prisma } from "../lib/db";

async function main() {
  console.log("Creating/verifying SANGEET SHAW agent and TEST_ orders...");

  // 1. Upsert Agent User
  let agent = await prisma.user.findFirst({
    where: {
      OR: [
        { phone: "6289477287" },
        { name: { equals: "SANGEET SHAW", mode: "insensitive" } },
      ],
    },
  });

  if (agent) {
    agent = await prisma.user.update({
      where: { id: agent.id },
      data: {
        name: "SANGEET SHAW",
        phone: "6289477287",
        role: "AGENT",
        status: "ACTIVE",
      },
    });
    console.log("Updated existing agent user:", agent.id, agent.name, agent.phone);
  } else {
    agent = await prisma.user.create({
      data: {
        name: "SANGEET SHAW",
        phone: "6289477287",
        email: "sangeetshaw39@gmail.com",
        role: "AGENT",
        status: "ACTIVE",
        firebaseUid: "sangeet_shaw_6289477287",
      },
    });
    console.log("Created new agent user:", agent.id, agent.name, agent.phone);
  }

  // Also upsert Partner record in case partner endpoints query Partner table
  let partner = await prisma.partner.findFirst({
    where: { phone: "6289477287" },
  });
  if (!partner) {
    partner = await prisma.partner.create({
      data: {
        name: "SANGEET SHAW",
        phone: "6289477287",
        email: "sangeetshaw39@gmail.com",
        city: "Kolkata",
        businessName: "CashALL Express Logistics",
        status: "ACTIVE",
        rating: 5.0,
      },
    });
    console.log("Created partner record:", partner.id);
  }

  // 2. Ensure customer user exists
  let customer = await prisma.user.findFirst({
    where: { phone: "9876543210" },
  });
  if (!customer) {
    customer = await prisma.user.create({
      data: {
        name: "Test Customer",
        phone: "9876543210",
        email: "testcustomer@cashall.in",
        role: "CUSTOMER",
        status: "ACTIVE",
        firebaseUid: "test_customer_9876543210",
      },
    });
  }

  // 3. Ensure address exists
  let address = await prisma.address.findFirst({
    where: { userId: customer.id },
  });
  if (!address) {
    address = await prisma.address.create({
      data: {
        userId: customer.id,
        fullName: "Test Customer",
        phone: "9876543210",
        house: "Flat 4B, Tower 2",
        street: "Park Street",
        area: "Park Street Area",
        city: "Kolkata",
        state: "West Bengal",
        pincode: "700016",
      },
    });
  }

  // 4. Find or create a device variant for quote
  let variant = await prisma.deviceVariant.findFirst({
    include: { model: { include: { brand: true } } },
  });

  if (!variant) {
    throw new Error("No device variant found in DB to link quote!");
  }

  // 5. Create TEST_ orders
  const testOrdersData = [
    {
      orderNumber: "TEST_CA101",
      quoteNumber: "TEST_Q101",
      pickupDate: "Today",
      pickupTimeSlot: "10 AM - 1 PM",
      status: "PARTNER_ASSIGNED" as const,
      estimatedPrice: 52000,
    },
    {
      orderNumber: "TEST_CA102",
      quoteNumber: "TEST_Q102",
      pickupDate: "Today",
      pickupTimeSlot: "1 PM - 4 PM",
      status: "PARTNER_ASSIGNED" as const,
      estimatedPrice: 38500,
    },
    {
      orderNumber: "TEST_CA103",
      quoteNumber: "TEST_Q103",
      pickupDate: "Tomorrow",
      pickupTimeSlot: "4 PM - 7 PM",
      status: "PICKUP_SCHEDULED" as const,
      estimatedPrice: 44000,
    },
  ];

  for (const tData of testOrdersData) {
    // Delete existing if any so it's clean and idempotent
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber: tData.orderNumber },
    });
    if (existingOrder) {
      await prisma.pickup.deleteMany({ where: { orderId: existingOrder.id } });
      await prisma.order.delete({ where: { id: existingOrder.id } });
      console.log(`Cleaned up previous ${tData.orderNumber}`);
    }

    // Create quote
    let quote = await prisma.quote.findFirst({
      where: { quoteNumber: tData.quoteNumber },
    });
    if (!quote) {
      quote = await prisma.quote.create({
        data: {
          quoteNumber: tData.quoteNumber,
          variantId: variant.id,
          selectedAnswersJson: JSON.stringify([
            { questionTitle: "Screen Condition", optionLabel: "Flawless" },
            { questionTitle: "Device Body", optionLabel: "No Scratches" },
          ]),
          basePrice: variant.basePrice,
          totalDeductions: Math.max(0, variant.basePrice - tData.estimatedPrice),
          estimatedPrice: tData.estimatedPrice,
          breakdownJson: JSON.stringify({
            deviceName: `${variant.model.brand.name} ${variant.model.name}`,
            basePrice: variant.basePrice,
            estimatedPrice: tData.estimatedPrice,
          }),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
        },
      });
    }

    // Create Order assigned to Sangeet Shaw
    const newOrder = await prisma.order.create({
      data: {
        orderNumber: tData.orderNumber,
        quoteId: quote.id,
        userId: customer.id,
        addressId: address.id,
        pickupDate: tData.pickupDate,
        pickupTimeSlot: tData.pickupTimeSlot,
        status: tData.status,
        agentId: agent.id,
        finalPrice: tData.estimatedPrice,
      },
    });

    // Create Pickup schedule assigned to Sangeet Shaw
    await prisma.pickup.create({
      data: {
        orderId: newOrder.id,
        partnerId: partner.id,
        date: tData.pickupDate,
        timeSlot: tData.pickupTimeSlot,
        status: "ASSIGNED",
        notes: "SANGEET SHAW",
        assignedAt: new Date(),
      },
    });

    console.log(`✅ Successfully created ${tData.orderNumber} assigned to SANGEET SHAW (${agent.id})`);
  }

  // 6. Verify orders query for Sangeet Shaw
  const sangeetOrders = await prisma.order.findMany({
    where: {
      OR: [
        { agentId: agent.id },
        { agent: { name: { equals: "SANGEET SHAW", mode: "insensitive" } } },
        { pickups: { some: { notes: { contains: "SANGEET SHAW", mode: "insensitive" } } } },
      ],
      deletedAt: null,
    },
    include: {
      address: true,
      agent: true,
      pickups: true,
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
    },
  });

  console.log(`\n🎉 Verification: Found ${sangeetOrders.length} active orders assigned to SANGEET SHAW:`);
  sangeetOrders.forEach((o) => {
    console.log(` - Order ${o.orderNumber}: ${o.status} | Date: ${o.pickupDate} (${o.pickupTimeSlot}) | Amount: ₹${o.finalPrice || o.quote?.estimatedPrice} | Address: ${o.address?.city} (${o.address?.pincode})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
