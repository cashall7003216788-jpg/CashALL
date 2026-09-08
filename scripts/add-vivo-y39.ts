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
  console.log("=== ADDING VIVO Y39 5G TO SUPABASE POSTGRESQL ===");

  const mobileQuestionSetId = "550e8400-e29b-41d4-a716-446655440000";

  // 1. Find Vivo brand in DB
  let vivoBrand = await prisma.brand.findFirst({
    where: { OR: [{ slug: "vivo" }, { name: { equals: "Vivo", mode: "insensitive" } }] },
  });

  if (!vivoBrand) {
    vivoBrand = await prisma.brand.create({
      data: {
        name: "Vivo",
        slug: "vivo",
        logoUrl: "https://s3n.cashify.in/cashify/brand/img/xhdpi/20922c34-8afc.jpg?w=200",
        category: "MOBILE",
        sortOrder: 5,
        active: true,
      },
    });
    console.log("Created brand Vivo in DB:", vivoBrand.id);
  } else {
    console.log("Found brand Vivo in DB:", vivoBrand.id, vivoBrand.name);
  }

  // 2. Find or Create Vivo Y39 5G Model in DB
  let vivoY39 = await prisma.deviceModel.findFirst({
    where: { slug: "vivo-y39-5g" },
  });

  const vivoY39Data = {
    brandId: vivoBrand.id,
    questionSetId: mobileQuestionSetId,
    name: "Vivo Y39 5G",
    slug: "vivo-y39-5g",
    category: "MOBILE",
    imageUrl: "https://s3ng.cashify.in/cashify/product/img/xhdpi/dae78d65-0e7f.jpg?w=800",
    releaseYear: 2025,
    basePrice: 12600,
    description: "MediaTek Dimensity 6300, 6.68-inch 120Hz Display, 6000mAh Battery with 44W Fast Charging, 50MP Dual Camera",
    popular: true,
    active: true,
  };

  if (!vivoY39) {
    vivoY39 = await prisma.deviceModel.create({
      data: vivoY39Data,
    });
    console.log("Created model Vivo Y39 5G in DB:", vivoY39.id);
  } else {
    vivoY39 = await prisma.deviceModel.update({
      where: { id: vivoY39.id },
      data: vivoY39Data,
    });
    console.log("Updated model Vivo Y39 5G in DB:", vivoY39.id);
  }

  // 3. Add Variants
  // 8 GB / 128 GB: ₹12,600
  // 8 GB / 256 GB: ₹12,670
  const variants = [
    { ram: "8 GB", storage: "128 GB", basePrice: 12600, sortOrder: 1 },
    { ram: "8 GB", storage: "256 GB", basePrice: 12670, sortOrder: 2 },
  ];

  for (const v of variants) {
    const existing = await prisma.deviceVariant.findFirst({
      where: { modelId: vivoY39.id, storage: v.storage, ram: v.ram },
    });

    if (!existing) {
      const created = await prisma.deviceVariant.create({
        data: {
          modelId: vivoY39.id,
          ram: v.ram,
          storage: v.storage,
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Created variant ${v.ram} / ${v.storage} (₹${v.basePrice}) with id: ${created.id}`);
    } else {
      const updated = await prisma.deviceVariant.update({
        where: { id: existing.id },
        data: {
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Updated variant ${v.ram} / ${v.storage} (₹${v.basePrice}) with id: ${updated.id}`);
    }
  }

  console.log("=== SUCCESSFULLY ADDED VIVO Y39 5G TO SUPABASE POSTGRESQL ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
