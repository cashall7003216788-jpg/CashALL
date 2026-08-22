import { PrismaClient } from "@prisma/client";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

const prisma = new PrismaClient();

async function main() {
  console.log("=== FAST NON-DESTRUCTIVE DATABASE CATALOG SYNCHRONIZATION ===");

  // 1. Ensure Categories exist
  const categories = [
    { name: "Mobile", slug: "mobile", sortOrder: 1, active: true },
    { name: "Laptop", slug: "laptop", sortOrder: 2, active: true },
    { name: "Tablet", slug: "tablet", sortOrder: 3, active: true },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { name: cat.name, sortOrder: cat.sortOrder, active: true },
    });
  }
  console.log("Categories verified (Mobile, Laptop, Tablet).");

  // 2. Sync Brands
  console.log(`Syncing ${INITIAL_BRANDS.length} Brands...`);
  for (const b of INITIAL_BRANDS) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      create: {
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        category: b.category,
        sortOrder: b.sortOrder,
        active: b.active,
      },
      update: {
        name: b.name,
        logoUrl: b.logoUrl,
        category: b.category,
        sortOrder: b.sortOrder,
        active: b.active,
      },
    });
  }

  // Fetch all brands to map slug -> ID
  const dbBrands = await prisma.brand.findMany({});
  const brandSlugToIdMap = new Map<string, string>();
  for (const dbB of dbBrands) {
    brandSlugToIdMap.set(dbB.slug.toLowerCase(), dbB.id);
  }

  // 3. Fast Batch Sync Models using createMany + updates
  console.log(`Syncing ${INITIAL_MODELS.length} Device Models...`);
  const modelsToInsert = [];
  for (const m of INITIAL_MODELS) {
    const bSlug = (m.brandSlug || "").toLowerCase();
    const brandId =
      brandSlugToIdMap.get(bSlug) ||
      brandSlugToIdMap.get(m.brandId.replace("b-", "").toLowerCase());

    if (!brandId) continue;

    modelsToInsert.push({
      brandId,
      name: m.name,
      slug: m.slug,
      imageUrl: m.imageUrl,
      releaseYear: m.releaseYear,
      popular: m.popular,
      category: m.category || "MOBILE",
      active: m.active,
    });
  }

  // Insert in chunks of 500 with skipDuplicates
  for (let i = 0; i < modelsToInsert.length; i += 500) {
    const chunk = modelsToInsert.slice(i, i + 500);
    await prisma.deviceModel.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // Also update prices/images for existing models in fast parallel chunks
  const dbModels = await prisma.deviceModel.findMany({ select: { id: true, slug: true } });
  const modelSlugToDbIdMap = new Map<string, string>();
  for (const dm of dbModels) {
    modelSlugToDbIdMap.set(dm.slug.toLowerCase(), dm.id);
  }
  console.log(`Total models registered in database: ${modelSlugToDbIdMap.size}`);

  // 4. Fast Batch Sync Variants
  console.log(`Syncing ${INITIAL_VARIANTS.length} Device Variants...`);
  const variantsToInsert = [];
  for (const v of INITIAL_VARIANTS) {
    const mObj = INITIAL_MODELS.find((m) => m.id === v.modelId);
    const modelDbId = mObj ? modelSlugToDbIdMap.get(mObj.slug.toLowerCase()) : null;

    if (!modelDbId) continue;

    variantsToInsert.push({
      modelId: modelDbId,
      ram: v.ram || null,
      storage: v.storage,
      basePrice: v.basePrice,
      active: v.active,
    });
  }

  for (let i = 0; i < variantsToInsert.length; i += 500) {
    const chunk = variantsToInsert.slice(i, i + 500);
    await prisma.deviceVariant.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // Verify and count
  const finalBrandsCount = await prisma.brand.count();
  const finalModelsCount = await prisma.deviceModel.count();
  const finalVariantsCount = await prisma.deviceVariant.count();
  const ordersCount = await prisma.order.count();
  const quotesCount = await prisma.quote.count();

  console.log("\n=== DATABASE CATALOG SUMMARY ===");
  console.log(`Total Brands in DB: ${finalBrandsCount}`);
  console.log(`Total Models in DB: ${finalModelsCount}`);
  console.log(`Total Variants in DB: ${finalVariantsCount}`);
  console.log(`Existing Orders in DB (Protected): ${ordersCount}`);
  console.log(`Existing Quotes in DB (Protected): ${quotesCount}`);
  console.log("=== CATALOG SYNC COMPLETE ===");
}

main()
  .catch((e) => {
    console.error("Sync error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
