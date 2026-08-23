import { prisma } from "../lib/db";

async function updateAgents() {
  console.log("Updating agent details in database...");

  // 1. Hyder Ali: Phone 9874063573
  const hyder = await prisma.user.findFirst({
    where: {
      role: "AGENT",
      OR: [
        { name: { equals: "Hyder Ali", mode: "insensitive" } },
        { name: { equals: "HYDER ALI", mode: "insensitive" } },
        { phone: "7003216788" },
        { phone: "9874063573" },
      ],
    },
  });

  if (hyder) {
    await prisma.user.update({
      where: { id: hyder.id },
      data: {
        name: "Hyder Ali",
        phone: "9874063573",
        email: "hyder.ali@cashall.in",
        status: "ACTIVE",
      },
    });
    console.log("✅ Updated Hyder Ali to phone 9874063573");
  } else {
    await prisma.user.create({
      data: {
        name: "Hyder Ali",
        phone: "9874063573",
        email: "hyder.ali@cashall.in",
        role: "AGENT",
        status: "ACTIVE",
        firebaseUid: "agent_9874063573",
      },
    });
    console.log("✅ Created Hyder Ali with phone 9874063573");
  }

  // 2. Shadik -> Sadiq Sayyed: Phone 9942231841
  const sadiq = await prisma.user.findFirst({
    where: {
      role: "AGENT",
      OR: [
        { name: { equals: "Shadik", mode: "insensitive" } },
        { name: { equals: "Sadiq Sayyed", mode: "insensitive" } },
        { phone: "9876543211" },
        { phone: "9942231841" },
      ],
    },
  });

  if (sadiq) {
    await prisma.user.update({
      where: { id: sadiq.id },
      data: {
        name: "Sadiq Sayyed",
        phone: "9942231841",
        email: "sadiq.sayyed@cashall.in",
        status: "ACTIVE",
      },
    });
    console.log("✅ Updated Shadik to Sadiq Sayyed (phone: 9942231841)");
  } else {
    await prisma.user.create({
      data: {
        name: "Sadiq Sayyed",
        phone: "9942231841",
        email: "sadiq.sayyed@cashall.in",
        role: "AGENT",
        status: "ACTIVE",
        firebaseUid: "agent_9942231841",
      },
    });
    console.log("✅ Created Sadiq Sayyed with phone 9942231841");
  }

  // 3. Aryan Jaiswal: Phone 9214699841
  const aryan = await prisma.user.findFirst({
    where: {
      role: "AGENT",
      OR: [
        { name: { equals: "Aryan Jaiswal", mode: "insensitive" } },
        { phone: "7003216789" },
        { phone: "9214699841" },
      ],
    },
  });

  if (aryan) {
    await prisma.user.update({
      where: { id: aryan.id },
      data: {
        name: "Aryan Jaiswal",
        phone: "9214699841",
        email: "aryan.jaiswal@cashall.in",
        status: "ACTIVE",
      },
    });
    console.log("✅ Updated Aryan Jaiswal to phone 9214699841");
  } else {
    await prisma.user.create({
      data: {
        name: "Aryan Jaiswal",
        phone: "9214699841",
        email: "aryan.jaiswal@cashall.in",
        role: "AGENT",
        status: "ACTIVE",
        firebaseUid: "agent_9214699841",
      },
    });
    console.log("✅ Created Aryan Jaiswal with phone 9214699841");
  }

  const allAgents = await prisma.user.findMany({
    where: { role: "AGENT" },
    select: { id: true, name: true, phone: true, email: true, status: true },
    orderBy: { name: "asc" },
  });

  console.log("\nAll Active Agents in Database:");
  console.table(allAgents);
}

updateAgents()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
