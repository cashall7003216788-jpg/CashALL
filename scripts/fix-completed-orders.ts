import { prisma } from "../lib/db";

async function main() {
  console.log("Starting DB fix for completed orders...");

  // 1. Get Md. Arshad ID
  const arshad = await prisma.user.findFirst({
    where: {
      OR: [
        { name: { equals: "Md. Arshad", mode: "insensitive" } },
        { name: { equals: "Md Arshad", mode: "insensitive" } },
        { phone: "9062775880" },
      ],
    },
  });

  console.log("Found Md. Arshad:", arshad?.id, arshad?.name);

  // 2. Fix CA44158 (Roshan Kumar - iPhone 14 - ₹27,000) -> COMPLETED & Agent: Md. Arshad
  const order44158 = await prisma.order.findFirst({ where: { orderNumber: "CA44158" } });
  if (order44158) {
    await prisma.order.update({
      where: { id: order44158.id },
      data: {
        status: "COMPLETED",
        agentId: arshad ? arshad.id : order44158.agentId,
      },
    });

    await prisma.pickup.updateMany({
      where: { orderId: order44158.id },
      data: {
        status: "COMPLETED",
        notes: "Md. Arshad",
      },
    });
    console.log("✅ Fixed CA44158 -> Status: COMPLETED, Agent: Md. Arshad");
  }

  // 3. Fix CA48359 (Md aslamuzzaman - OPPO A3x - ₹3,499) -> COMPLETED
  const order48359 = await prisma.order.findFirst({ where: { orderNumber: "CA48359" } });
  if (order48359) {
    await prisma.order.update({
      where: { id: order48359.id },
      data: {
        status: "COMPLETED",
      },
    });

    await prisma.pickup.updateMany({
      where: { orderId: order48359.id },
      data: {
        status: "COMPLETED",
        notes: "Gulrez Naushad",
      },
    });
    console.log("✅ Fixed CA48359 -> Status: COMPLETED, Agent: Gulrez Naushad");
  }

  // 4. Fix CA34347 (Aditya Bhardwaj - iPhone 12 Pro - ₹12,000) -> COMPLETED
  const order34347 = await prisma.order.findFirst({ where: { orderNumber: "CA34347" } });
  if (order34347) {
    await prisma.order.update({
      where: { id: order34347.id },
      data: {
        status: "COMPLETED",
      },
    });

    await prisma.pickup.updateMany({
      where: { orderId: order34347.id },
      data: {
        status: "COMPLETED",
        notes: "Shakti Thakur",
      },
    });
    console.log("✅ Fixed CA34347 -> Status: COMPLETED, Agent: Shakti Thakur");
  }

  // 5. Fix CA75157 (Sangeet Shaw - ₹3,000) -> COMPLETED
  const order75157 = await prisma.order.findFirst({ where: { orderNumber: "CA75157" } });
  if (order75157) {
    await prisma.order.update({
      where: { id: order75157.id },
      data: {
        status: "COMPLETED",
      },
    });

    await prisma.pickup.updateMany({
      where: { orderId: order75157.id },
      data: {
        status: "COMPLETED",
        notes: "Aman Mishra",
      },
    });
    console.log("✅ Fixed CA75157 -> Status: COMPLETED, Agent: Aman Mishra");
  }

  // 6. Verify all orders
  const allPaid = await prisma.order.findMany({
    where: { payments: { some: { status: "PAID" } } },
    select: {
      orderNumber: true,
      status: true,
      finalPrice: true,
      agent: { select: { name: true } },
      pickups: { select: { notes: true, status: true } },
      payments: { select: { amount: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log("--- FINAL STATUS OF ALL PAID ORDERS IN SUPABASE DB ---");
  console.log(JSON.stringify(allPaid, null, 2));
}

main().catch(console.error);
