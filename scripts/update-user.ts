import { prisma } from "../lib/db";

async function main() {
  const user = await prisma.user.findFirst({ where: { phone: "6289477287" } });
  console.log("Existing user in Supabase:", user);
  if (user) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: "sangeetshaw39@gmail.com" },
    });
    console.log("UPDATED_USER_EMAIL_SUCCESS:", updated);
  }
}

main().catch(console.error).finally(() => process.exit(0));
