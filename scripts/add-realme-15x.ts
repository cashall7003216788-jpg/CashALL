import { prisma } from "../lib/db";

async function addRealme15x() {
  console.log("=== ADDING REALME 15X 5G TO SUPABASE POSTGRESQL ===");

  // 1. Find Realme brand in DB
  let brand = await prisma.brand.findFirst({
    where: { OR: [{ slug: "realme" }, { name: { equals: "Realme", mode: "insensitive" } }] },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        name: "Realme",
        slug: "realme",
        logoUrl: "https://s3n.cashify.in/cashify/brand/img/xhdpi/cb5de2a9-c097.jpg?w=200",
        category: "MOBILE",
        sortOrder: 6,
        active: true,
      },
    });
    console.log("Created brand Realme in DB:", brand.id);
  } else {
    console.log("Found Realme brand in DB:", brand.id, brand.name);
  }

  // 2. Find or create Realme 15x 5G Model in DB
  let model = await prisma.deviceModel.findFirst({
    where: { slug: "realme-15x-5g" },
  });

  if (!model) {
    model = await prisma.deviceModel.create({
      data: {
        brandId: brand.id,
        name: "Realme 15x 5G",
        slug: "realme-15x-5g",
        category: "MOBILE",
        imageUrl: "https://s3bo.cashify.in/gpro/uploads/2024/11/01184336/realme-15x-5g-front-1.webp",
        releaseYear: 2025,
        basePrice: 12070,
        description: "MediaTek Dimensity 6300, 6.81-inch 144Hz, 7000mAh Titan Battery 60W, 50MP Camera",
        popular: true,
        active: true,
      },
    });
    console.log("Created Realme 15x 5G model in DB:", model.id);
  } else {
    // Update existing model
    model = await prisma.deviceModel.update({
      where: { id: model.id },
      data: {
        name: "Realme 15x 5G",
        imageUrl: "https://s3bo.cashify.in/gpro/uploads/2024/11/01184336/realme-15x-5g-front-1.webp",
        releaseYear: 2025,
        basePrice: 12070,
        popular: true,
        active: true,
      },
    });
    console.log("Updated Realme 15x 5G model in DB:", model.id);
  }

  // 3. Add Variants (Cashify + 1% increase)
  // 6/128: 11950 * 1.01 = 12070
  // 8/128: 12970 * 1.01 = 13100
  // 8/256: 13820 * 1.01 = 13958
  const variants = [
    { ram: "6 GB", storage: "128 GB", basePrice: 12070, sortOrder: 1 },
    { ram: "8 GB", storage: "128 GB", basePrice: 13100, sortOrder: 2 },
    { ram: "8 GB", storage: "256 GB", basePrice: 13958, sortOrder: 3 },
  ];

  for (const v of variants) {
    const existing = await prisma.deviceVariant.findFirst({
      where: { modelId: model.id, storage: v.storage, ram: v.ram },
    });

    if (!existing) {
      const created = await prisma.deviceVariant.create({
        data: {
          modelId: model.id,
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

  console.log("=== SUCCESSFULLY ADDED REALME 15X 5G TO SUPABASE POSTGRESQL ===");
}

addRealme15x().catch(console.error).finally(() => process.exit(0));
