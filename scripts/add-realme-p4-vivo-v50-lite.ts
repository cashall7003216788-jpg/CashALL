import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.jqysknhobtpcbyyltnfc:cashall%407003216788@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

async function main() {
  console.log("=== INJECTING REALME P4 5G & VIVO V50 LITE INTO SUPABASE POSTGRESQL ===");

  const mobileQuestionSetId = "550e8400-e29b-41d4-a716-446655440000";

  // -------------------------------------------------------------
  // 1. REALME P4 5G
  // -------------------------------------------------------------
  let realmeBrand = await prisma.brand.findFirst({
    where: { OR: [{ slug: "realme" }, { name: { equals: "Realme", mode: "insensitive" } }] },
  });

  if (!realmeBrand) {
    realmeBrand = await prisma.brand.create({
      data: {
        name: "Realme",
        slug: "realme",
        logoUrl: "https://s3n.cashify.in/cashify/brand/img/xhdpi/0124cc45-3a6c.jpg?w=200",
        category: "MOBILE",
        sortOrder: 6,
        active: true,
      },
    });
    console.log("Created brand Realme:", realmeBrand.id);
  } else {
    console.log("Found brand Realme:", realmeBrand.id, realmeBrand.name);
  }

  // Model: Realme P4 5G
  // Cashify base prices:
  // 6 GB / 128 GB: 13260 * 1.01 = 13392.6 -> 13393
  // 8 GB / 128 GB: 13500 * 1.01 = 13635
  // 8 GB / 256 GB: 14000 * 1.01 = 14140
  let realmeP4 = await prisma.deviceModel.findFirst({
    where: { slug: "realme-p4-5g" },
  });

  const realmeP4Data = {
    brandId: realmeBrand.id,
    questionSetId: mobileQuestionSetId,
    name: "Realme P4 5G",
    slug: "realme-p4-5g",
    category: "MOBILE",
    imageUrl: "https://s3ng.cashify.in/cashify/product/img/xhdpi/a50cfd9b-82b0.jpg?w=800",
    releaseYear: 2025,
    basePrice: 13393,
    description: "MediaTek Dimensity 7050, 6.67-inch AMOLED 120Hz, 50MP AI Camera, 5000mAh Battery",
    popular: true,
    active: true,
  };

  if (!realmeP4) {
    realmeP4 = await prisma.deviceModel.create({
      data: realmeP4Data,
    });
    console.log("Created model Realme P4 5G in DB:", realmeP4.id);
  } else {
    realmeP4 = await prisma.deviceModel.update({
      where: { id: realmeP4.id },
      data: realmeP4Data,
    });
    console.log("Updated model Realme P4 5G in DB:", realmeP4.id);
  }

  const realmeVariants = [
    { ram: "6 GB", storage: "128 GB", basePrice: 13393, sortOrder: 1 },
    { ram: "8 GB", storage: "128 GB", basePrice: 13635, sortOrder: 2 },
    { ram: "8 GB", storage: "256 GB", basePrice: 14140, sortOrder: 3 },
  ];

  for (const v of realmeVariants) {
    const existing = await prisma.deviceVariant.findFirst({
      where: { modelId: realmeP4.id, storage: v.storage, ram: v.ram },
    });

    if (!existing) {
      const created = await prisma.deviceVariant.create({
        data: {
          modelId: realmeP4.id,
          ram: v.ram,
          storage: v.storage,
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Created Realme P4 variant ${v.ram} / ${v.storage} (Rs ${v.basePrice}) with id: ${created.id}`);
    } else {
      const updated = await prisma.deviceVariant.update({
        where: { id: existing.id },
        data: {
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Updated Realme P4 variant ${v.ram} / ${v.storage} (Rs ${v.basePrice}) with id: ${updated.id}`);
    }
  }

  console.log("=== SUCCESSFULLY INJECTED REALME P4 5G INTO SUPABASE POSTGRESQL ===");
}

main().catch(console.error).finally(() => process.exit(0));
