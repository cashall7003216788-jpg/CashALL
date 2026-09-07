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

  // -------------------------------------------------------------
  // 2. VIVO V50 LITE
  // -------------------------------------------------------------
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
        sortOrder: 4,
        active: true,
      },
    });
    console.log("Created brand Vivo:", vivoBrand.id);
  } else {
    console.log("Found brand Vivo:", vivoBrand.id, vivoBrand.name);
  }

  // Model: Vivo V50 Lite
  // Cashify base prices:
  // 8 GB / 128 GB: 15800 * 1.01 = 15958
  // 8 GB / 256 GB: 17200 * 1.01 = 17372
  // 12 GB / 512 GB: 18900 * 1.01 = 19089
  let vivoV50Lite = await prisma.deviceModel.findFirst({
    where: { slug: "vivo-v50-lite" },
  });

  const vivoV50LiteData = {
    brandId: vivoBrand.id,
    questionSetId: mobileQuestionSetId,
    name: "Vivo V50 Lite",
    slug: "vivo-v50-lite",
    category: "MOBILE",
    imageUrl: "https://s3ng.cashify.in/builder/bd4696800f834b71a0cc8be44e0b148e.jpg",
    releaseYear: 2025,
    basePrice: 15958,
    description: "Snapdragon 685 / Dimensity 6300, 6.67-inch AMOLED 120Hz, 50MP Sony Camera, 5000mAh 80W",
    popular: true,
    active: true,
  };

  if (!vivoV50Lite) {
    vivoV50Lite = await prisma.deviceModel.create({
      data: vivoV50LiteData,
    });
    console.log("Created model Vivo V50 Lite in DB:", vivoV50Lite.id);
  } else {
    vivoV50Lite = await prisma.deviceModel.update({
      where: { id: vivoV50Lite.id },
      data: vivoV50LiteData,
    });
    console.log("Updated model Vivo V50 Lite in DB:", vivoV50Lite.id);
  }

  const vivoVariants = [
    { ram: "8 GB", storage: "128 GB", basePrice: 15958, sortOrder: 1 },
    { ram: "8 GB", storage: "256 GB", basePrice: 17372, sortOrder: 2 },
    { ram: "12 GB", storage: "512 GB", basePrice: 19089, sortOrder: 3 },
  ];

  for (const v of vivoVariants) {
    const existing = await prisma.deviceVariant.findFirst({
      where: { modelId: vivoV50Lite.id, storage: v.storage, ram: v.ram },
    });

    if (!existing) {
      const created = await prisma.deviceVariant.create({
        data: {
          modelId: vivoV50Lite.id,
          ram: v.ram,
          storage: v.storage,
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Created Vivo V50 Lite variant ${v.ram} / ${v.storage} (Rs ${v.basePrice}) with id: ${created.id}`);
    } else {
      const updated = await prisma.deviceVariant.update({
        where: { id: existing.id },
        data: {
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Updated Vivo V50 Lite variant ${v.ram} / ${v.storage} (Rs ${v.basePrice}) with id: ${updated.id}`);
    }
  }

  console.log("=== SUCCESSFULLY INJECTED ALL MODELS & VARIANTS INTO SUPABASE POSTGRESQL ===");
}

main().catch(console.error).finally(() => process.exit(0));
