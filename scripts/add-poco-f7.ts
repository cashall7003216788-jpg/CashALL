import { prisma } from "../lib/db";
import fs from "fs";
import path from "path";

async function addPocoF7() {
  console.log("=== ADDING POCO F7 5G TO SUPABASE POSTGRESQL & SEED STORE ===");

  // 1. Find or create POCO brand in DB
  let brand = await prisma.brand.findFirst({
    where: { OR: [{ slug: "poco" }, { name: { equals: "Poco", mode: "insensitive" } }] },
  });

  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        name: "POCO",
        slug: "poco",
        logoUrl: "https://s3n.cashify.in/cashify/brand/img/xhdpi/3e072dc2-6d7b.jpg?w=200",
        category: "MOBILE",
        sortOrder: 14,
        active: true,
      },
    });
    console.log("Created brand POCO in DB:", brand.id);
  } else {
    console.log("Found POCO brand in DB:", brand.id);
  }

  // 2. Find or create POCO F7 5G Model in DB
  let model = await prisma.deviceModel.findFirst({
    where: { slug: "poco-f7-5g" },
  });

  if (!model) {
    model = await prisma.deviceModel.create({
      data: {
        brandId: brand.id,
        name: "POCO F7 5G",
        slug: "poco-f7-5g",
        category: "MOBILE",
        imageUrl: "https://s3n.cashify.in/cashify/product/img/xhdpi/poco-f7-5g.jpg?w=800",
        releaseYear: 2025,
        basePrice: 24500,
        description: "Snapdragon 8s Gen 4, 6.83-inch pOLED 120Hz, 7500mAh 90W fast charge",
        popular: true,
        active: true,
      },
    });
    console.log("Created POCO F7 5G model in DB:", model.id);
  } else {
    console.log("Found POCO F7 5G model in DB:", model.id);
  }

  // 3. Add POCO F7 5G Variants (12GB/256GB and 12GB/512GB)
  const variants = [
    { ram: "12 GB", storage: "256 GB", basePrice: 22500, sortOrder: 1 },
    { ram: "12 GB", storage: "512 GB", basePrice: 24500, sortOrder: 2 },
  ];

  for (const v of variants) {
    const existing = await prisma.deviceVariant.findFirst({
      where: { modelId: model.id, storage: v.storage },
    });
    if (!existing) {
      await prisma.deviceVariant.create({
        data: {
          modelId: model.id,
          ram: v.ram,
          storage: v.storage,
          basePrice: v.basePrice,
          sortOrder: v.sortOrder,
          active: true,
        },
      });
      console.log(`Created variant ${v.ram}/${v.storage} for POCO F7 5G in DB`);
    } else {
      console.log(`Variant ${v.ram}/${v.storage} already exists in DB`);
    }
  }

  console.log("=== SUCCESSFULLY ADDED POCO F7 5G TO SUPABASE POSTGRESQL ===");
}

addPocoF7().catch(console.error).finally(() => process.exit(0));
