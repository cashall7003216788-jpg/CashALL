import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== VERIFYING CASHALL CATALOG ===\n');

  const totalModels = await prisma.deviceModel.count();
  const totalVariants = await prisma.deviceVariant.count();
  const appleModels = await prisma.deviceModel.count({ where: { brand: { slug: 'apple' } } });
  const appleVariants = await prisma.deviceVariant.count({ where: { model: { brand: { slug: 'apple' } } } });
  const quotes = await prisma.quote.count();
  const orders = await prisma.order.count();

  console.log(`Total Models in DB: ${totalModels}`);
  console.log(`Total Variants in DB: ${totalVariants}`);
  console.log(`Apple Models: ${appleModels} (Should be 206)`);
  console.log(`Apple Variants: ${appleVariants} (Should be 5463)`);
  console.log(`Quotes: ${quotes}`);
  console.log(`Orders: ${orders}`);

  // Check orphaned variants
  const allVariants = await prisma.deviceVariant.findMany({ select: { id: true, modelId: true } });
  const allModelIds = new Set((await prisma.deviceModel.findMany({ select: { id: true } })).map(m => m.id));
  const orphans = allVariants.filter(v => !allModelIds.has(v.modelId));
  console.log(`Orphaned Variants: ${orphans.length} (PASS if 0)`);
}

main().finally(() => prisma.$disconnect());
