import { prisma } from "../lib/db";

async function updateAnkitPhones() {
  console.log("Updating Ankit Gupta phones in database...");

  // 1. Update/Upsert Agent Ankit Gupta: Phone 8181908220
  const existingAgent = await prisma.user.findFirst({
    where: {
      role: "AGENT",
      name: { equals: "Ankit Gupta", mode: "insensitive" },
    },
  });

  if (existingAgent) {
    await prisma.user.update({
      where: { id: existingAgent.id },
      data: {
        phone: "8181908220",
        email: "ankit.agent@cashall.in",
        status: "ACTIVE",
      },
    });
    console.log("✅ Updated Agent Ankit Gupta phone to 8181908220 (id: " + existingAgent.id + ")");
  } else {
    const newAgent = await prisma.user.create({
      data: {
        name: "Ankit Gupta",
        phone: "8181908220",
        email: "ankit.agent@cashall.in",
        role: "AGENT",
        status: "ACTIVE",
        firebaseUid: "agent_8181908220",
      },
    });
    console.log("✅ Created Agent Ankit Gupta phone to 8181908220 (id: " + newAgent.id + ")");
  }

  // 2. Update/Upsert Admin Ankit Gupta: Phone 8336970738
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      name: { equals: "ANKIT GUPTA", mode: "insensitive" },
    },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        phone: "8336970738",
        email: "ankit.admin@cashall.in",
        status: "ACTIVE",
      },
    });
    console.log("✅ Updated Admin Ankit Gupta phone to 8336970738 (id: " + existingAdmin.id + ")");
  } else {
    const newAdmin = await prisma.user.create({
      data: {
        name: "ANKIT GUPTA",
        phone: "8336970738",
        email: "ankit.admin@cashall.in",
        role: "ADMIN",
        status: "ACTIVE",
        firebaseUid: "admin_8336970738",
      },
    });
    console.log("✅ Created Admin Ankit Gupta phone to 8336970738 (id: " + newAdmin.id + ")");
  }

  const allAnkits = await prisma.user.findMany({
    where: {
      name: { contains: "Ankit", mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      status: true,
    },
  });

  console.log("Current Ankit records in Database:");
  console.table(allAnkits);
}

updateAnkitPhones()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
