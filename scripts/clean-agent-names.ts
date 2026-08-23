import { prisma } from "../lib/db";

async function cleanAgentNames() {
  console.log("Cleaning and normalizing agent names across database orders & pickups...");

  // Find all agents in database
  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
  });

  const hyder = agents.find((a) => a.name.toLowerCase().includes("hyder"));
  const sadiq = agents.find((a) => a.name.toLowerCase().includes("sadiq") || a.name.toLowerCase().includes("shadik"));
  const aryan = agents.find((a) => a.name.toLowerCase().includes("aryan"));
  const wasim = agents.find((a) => a.name.toLowerCase().includes("wasim"));

  // 1. Update pickups with notes = "Shadik" to "Sadiq Sayyed" and link sadiq.id
  if (sadiq) {
    const updatedPickups = await prisma.pickup.updateMany({
      where: { notes: "Shadik" },
      data: { notes: sadiq.name },
    });
    console.log(`Updated ${updatedPickups.count} pickups from 'Shadik' to '${sadiq.name}'`);

    const updatedOrders = await prisma.order.updateMany({
      where: { agentId: sadiq.id },
      data: { agentId: sadiq.id },
    });
  }

  // 2. Update pickups with notes = "HYDER ALI" to "Hyder Ali"
  if (hyder) {
    const updatedPickups = await prisma.pickup.updateMany({
      where: { notes: "HYDER ALI" },
      data: { notes: hyder.name },
    });
    console.log(`Updated ${updatedPickups.count} pickups from 'HYDER ALI' to '${hyder.name}'`);
  }

  // 3. Normalize pickups notes for any order
  const pickups = await prisma.pickup.findMany({
    include: { order: true },
  });

  for (const p of pickups) {
    if (p.notes === "Shadik") {
      await prisma.pickup.update({
        where: { id: p.id },
        data: { notes: "Sadiq Sayyed" },
      });
    } else if (p.notes === "HYDER ALI") {
      await prisma.pickup.update({
        where: { id: p.id },
        data: { notes: "Hyder Ali" },
      });
    }
  }

  // 4. Update specific orders to point to proper agentId
  if (sadiq) {
    await prisma.order.updateMany({
      where: { orderNumber: { in: ["CA36738", "CA67512"] } },
      data: { agentId: sadiq.id },
    });
  }
  if (hyder) {
    await prisma.order.updateMany({
      where: { orderNumber: { in: ["CA33039", "CA24640", "CA69824", "CA90812"] } },
      data: { agentId: hyder.id },
    });
  }

  console.log("✅ Database pickup notes and order agentIds successfully updated.");
}

cleanAgentNames()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
