import { prisma } from "../lib/db";

async function main() {
  console.log("🚀 Starting update for Order #CA61962 and duplicate #CA94565...\n");

  const order61962 = await prisma.order.findUnique({
    where: { orderNumber: "CA61962" },
    include: { address: true, pickups: true },
  });

  const order94565 = await prisma.order.findUnique({
    where: { orderNumber: "CA94565" },
    include: { address: true, pickups: true },
  });

  if (!order61962) {
    throw new Error("Order #CA61962 not found!");
  }

  console.log("Found #CA61962 ID:", order61962.id);
  console.log("Current address of #CA61962:", order61962.address);

  // New address details from PIN 700036 (Baranagar)
  const newAddressData = {
    fullName: "Arijit",
    phone: "7980600582",
    house: "123, 1",
    street: "Gopal Lal Tagore Rd, Bonhooghly, Near Baine Hospital",
    area: "Baranagar",
    landmark: "Near Railway Station",
    city: "Baranagar",
    state: "West Bengal",
    pincode: "700036",
  };

  // 1. Update the address record attached to CA61962 (or point to the new address)
  if (order61962.addressId) {
    await prisma.address.update({
      where: { id: order61962.addressId },
      data: newAddressData,
    });
    console.log("✅ Updated address record for #CA61962 to PIN 700036");
  }

  // Also ensure address for order94565 has the clean data if shared
  if (order94565?.addressId && order94565.addressId !== order61962.addressId) {
    await prisma.address.update({
      where: { id: order94565.addressId },
      data: newAddressData,
    });
  }

  // 2. Update CA61962 Order with new pickup slot and assign agent Wasim Shirazi
  const wasimAgentId = "7ab7cdc4-b48b-420f-8ac0-e0576ef973aa"; // Wasim Shirazi

  await prisma.order.update({
    where: { id: order61962.id },
    data: {
      addressId: order94565?.addressId || order61962.addressId,
      pickupDate: "Today",
      pickupTimeSlot: "1 PM - 4 PM",
      status: "PARTNER_ASSIGNED",
      agentId: wasimAgentId,
      updatedAt: new Date(),
    },
  });
  console.log("✅ Updated #CA61962 order fields: pickupDate='Today', pickupTimeSlot='1 PM - 4 PM', status='PARTNER_ASSIGNED', agent='Wasim Shirazi'");

  // 3. Update or create pickup record for CA61962
  const pickup = order61962.pickups[0];
  if (pickup) {
    await prisma.pickup.update({
      where: { id: pickup.id },
      data: {
        date: "Today",
        timeSlot: "1 PM - 4 PM",
        status: "ASSIGNED",
        notes: "Wasim Shirazi",
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log("✅ Updated pickup schedule for #CA61962 to Today (1 PM - 4 PM), assigned to Wasim Shirazi");
  } else {
    await prisma.pickup.create({
      data: {
        orderId: order61962.id,
        date: "Today",
        timeSlot: "1 PM - 4 PM",
        status: "ASSIGNED",
        notes: "Wasim Shirazi",
        assignedAt: new Date(),
      },
    });
    console.log("✅ Created pickup schedule for #CA61962");
  }

  // 4. Soft delete the duplicate accidental order #CA94565 so it no longer appears in Admin
  if (order94565) {
    await prisma.order.update({
      where: { id: order94565.id },
      data: {
        deletedAt: new Date(),
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });

    // Also soft delete its pickups if any
    for (const p of order94565.pickups) {
      await prisma.pickup.update({
        where: { id: p.id },
        data: {
          deletedAt: new Date(),
          status: "CANCELLED",
        },
      });
    }
    console.log("✅ Soft-deleted duplicate order #CA94565 so only #CA61962 is active!");
  }

  // 5. Verification check
  const verifiedOrder = await prisma.order.findUnique({
    where: { orderNumber: "CA61962" },
    include: { address: true, agent: true, pickups: true },
  });

  console.log("\n================ VERIFICATION ================");
  console.log("Order Number:", verifiedOrder?.orderNumber);
  console.log("Status:", verifiedOrder?.status);
  console.log("Agent:", verifiedOrder?.agent?.name);
  console.log("Pickup Date & Slot:", verifiedOrder?.pickupDate, verifiedOrder?.pickupTimeSlot);
  console.log("Address:", `${verifiedOrder?.address?.house}, ${verifiedOrder?.address?.street}, ${verifiedOrder?.address?.city}, ${verifiedOrder?.address?.state} - ${verifiedOrder?.address?.pincode}`);
  console.log("Duplicate #CA94565 visible in active orders?:", (await prisma.order.count({ where: { orderNumber: "CA94565", deletedAt: null } })) > 0 ? "YES" : "NO (Cleanly Hidden)");
  console.log("==============================================");
}

main()
  .catch((err) => {
    console.error("Error updating order:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
