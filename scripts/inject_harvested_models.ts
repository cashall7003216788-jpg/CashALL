import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/db';

interface ModelData {
  id: string;
  brandId: string;
  brandSlug: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  releaseYear: number;
  popular: boolean;
  active: boolean;
  category: string;
}

interface VariantData {
  id: string;
  modelId: string;
  storage: string;
  ram?: string | null;
  basePrice: number;
  active: boolean;
}

async function main() {
  const jsonPath = path.join(__dirname, '../scratch/harvested_modern_models.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("Harvested JSON not found at", jsonPath);
    return;
  }

  const { models, variants }: { models: ModelData[], variants: VariantData[] } = JSON.parse(
    fs.readFileSync(jsonPath, 'utf8')
  );

  console.log(`Loaded ${models.length} models and ${variants.length} variants to inject.`);

  // 1. Inject into lib/store.ts
  const storePath = path.join(__dirname, '../lib/store.ts');
  let storeContent = fs.readFileSync(storePath, 'utf8');

  // Filter out any models already present in store.ts
  const modelsToInsert: ModelData[] = [];
  for (const m of models) {
    if (storeContent.includes(`"id": "${m.id}"`) || storeContent.includes(`"slug": "${m.slug}"`)) {
      console.log(`Model ${m.name} (${m.slug}) already in store.ts, checking variants...`);
    } else {
      modelsToInsert.push(m);
    }
  }

  const variantsToInsert: VariantData[] = [];
  for (const v of variants) {
    if (storeContent.includes(`"id": "${v.id}"`)) {
      // already there
    } else {
      variantsToInsert.push(v);
    }
  }

  console.log(`New models to insert into store.ts: ${modelsToInsert.length}`);
  console.log(`New variants to insert into store.ts: ${variantsToInsert.length}`);

  if (modelsToInsert.length > 0) {
    // Format models code
    let modelsCode = "";
    for (const m of modelsToInsert) {
      const brandId = `b-${m.brandSlug}`;
      modelsCode += `  {\n    "id": "${m.id}",\n    "brandId": "${brandId}",\n    "brandSlug": "${m.brandSlug}",\n    "name": "${m.name}",\n    "slug": "${m.slug}",\n    "imageUrl": "${m.imageUrl || ''}",\n    "releaseYear": ${m.releaseYear},\n    "popular": true,\n    "active": true,\n    "contactForPrice": false,\n    "category": "MOBILE"\n  },\n`;
    };

    // Insert at start of MOBILE_MODELS_PART_4
    const targetModelEnd = 'const MOBILE_MODELS_PART_4: DeviceModelData[] = [';
    if (storeContent.includes(targetModelEnd)) {
      storeContent = storeContent.replace(
        targetModelEnd,
        `${targetModelEnd}\n${modelsCode}`
      );
      console.log(`✓ Injected ${modelsToInsert.length} models into MOBILE_MODELS_PART_4`);
    } else {
      console.error("Could not find MOBILE_MODELS_PART_4");
    }
  }

  if (variantsToInsert.length > 0) {
    // Format variants code
    let variantsCode = "";
    for (const v of variantsToInsert) {
      const ramStr = v.ram ? `,\n    "ram": "${v.ram}"` : '';
      variantsCode += `  {\n    "id": "${v.id}",\n    "modelId": "${v.modelId}",\n    "storage": "${v.storage}",\n    "basePrice": ${v.basePrice},\n    "active": true${ramStr}\n  },\n`;
    }

    // Insert at start of MOBILE_VARIANTS_PART_12
    const targetVariantEnd = 'const MOBILE_VARIANTS_PART_12: DeviceVariantData[] = [';
    if (storeContent.includes(targetVariantEnd)) {
      storeContent = storeContent.replace(
        targetVariantEnd,
        `${targetVariantEnd}\n${variantsCode}`
      );
      console.log(`✓ Injected ${variantsToInsert.length} variants into MOBILE_VARIANTS_PART_12`);
    } else {
      console.error("Could not find MOBILE_VARIANTS_PART_12");
    }
  }

  fs.writeFileSync(storePath, storeContent, 'utf8');
  console.log("✓ store.ts updated and saved successfully!");

  // 2. Sync into Supabase PostgreSQL database
  console.log("\nSyncing to Supabase PostgreSQL via Prisma...");
  
  // Brands map in DB
  const dbBrands = await prisma.brand.findMany();
  const brandMap = new Map(dbBrands.map(b => [b.slug.toLowerCase(), b.id]));

  let dbModelsCreated = 0;
  let dbVariantsUpserted = 0;

  for (const m of models) {
    const brandId = brandMap.get(m.brandSlug.toLowerCase());
    if (!brandId) {
      console.log(`Brand ${m.brandSlug} not found in DB brands!`);
      continue;
    }

    // Upsert model
    const dbModel = await prisma.deviceModel.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        active: true,
        popular: true,
        category: "MOBILE"
      },
      create: {
        brandId: brandId,
        name: m.name,
        slug: m.slug,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        category: "MOBILE",
        active: true,
        popular: true
      }
    });
    dbModelsCreated++;

    // Upsert variants for this model
    const mVariants = variants.filter(v => v.modelId === m.id);
    for (const v of mVariants) {
      // Find existing by modelId and storage + ram
      const existing = await prisma.deviceVariant.findFirst({
        where: {
          modelId: dbModel.id,
          storage: v.storage,
          ram: v.ram || null
        }
      });

      if (existing) {
        await prisma.deviceVariant.update({
          where: { id: existing.id },
          data: {
            basePrice: v.basePrice,
            active: true
          }
        });
      } else {
        await prisma.deviceVariant.create({
          data: {
            modelId: dbModel.id,
            storage: v.storage,
            ram: v.ram || null,
            basePrice: v.basePrice,
            active: true
          }
        });
      }
      dbVariantsUpserted++;
    }
  }

  // Also update OPPO F33 5G and Samsung S24 series in DB
  const oppoF33 = await prisma.deviceModel.findFirst({
    where: { slug: "oppo-f33-5g" },
    include: { variants: true }
  });
  if (oppoF33) {
    for (const v of oppoF33.variants) {
      if (v.basePrice === 0 || (v.storage.includes("128") && v.ram?.includes("8"))) {
        await prisma.deviceVariant.update({
          where: { id: v.id },
          data: { basePrice: 22008 }
        });
        console.log(`✓ Updated DB OPPO F33 5G variant ${v.id} to ₹22,008`);
      }
    }
  }

  console.log(`✓ DB sync complete: ${dbModelsCreated} models synced, ${dbVariantsUpserted} variants synced!`);
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
});
