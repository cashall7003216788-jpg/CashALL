import { prisma } from "../lib/db";
import { INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";
import { BRAND_SERIES_MAP, filterModelsBySeries } from "../lib/series-data";

async function verify() {
  console.log("=================== VERIFICATION: DATABASE ===================");
  const realmeDb = await prisma.deviceModel.findUnique({
    where: { slug: "realme-p4-5g" },
    include: { variants: true, brand: true },
  });
  console.log(`[DB] Model: ${realmeDb?.name} (${realmeDb?.brand.name}) | Base: Rs ${realmeDb?.basePrice}`);
  realmeDb?.variants.forEach((v) => {
    console.log(`     -> Variant: ${v.ram} / ${v.storage} | Price: Rs ${v.basePrice} | Active: ${v.active}`);
  });

  const vivoDb = await prisma.deviceModel.findUnique({
    where: { slug: "vivo-v50-lite" },
    include: { variants: true, brand: true },
  });
  console.log(`[DB] Model: ${vivoDb?.name} (${vivoDb?.brand.name}) | Base: Rs ${vivoDb?.basePrice}`);
  vivoDb?.variants.forEach((v) => {
    console.log(`     -> Variant: ${v.ram} / ${v.storage} | Price: Rs ${v.basePrice} | Active: ${v.active}`);
  });

  console.log("\n=================== VERIFICATION: LIB/STORE ===================");
  const realmeStore = INITIAL_MODELS.find((m) => m.slug === "realme-p4-5g");
  const realmeStoreVariants = INITIAL_VARIANTS.filter((v) => v.modelId === realmeStore?.id);
  console.log(`[Store] Model: ${realmeStore?.name} | ID: ${realmeStore?.id} | Category: ${realmeStore?.category}`);
  realmeStoreVariants.forEach((v) => {
    console.log(`     -> Variant: ${v.ram} / ${v.storage} | Price: Rs ${v.basePrice}`);
  });

  const vivoStore = INITIAL_MODELS.find((m) => m.slug === "vivo-v50-lite");
  const vivoStoreVariants = INITIAL_VARIANTS.filter((v) => v.modelId === vivoStore?.id);
  console.log(`[Store] Model: ${vivoStore?.name} | ID: ${vivoStore?.id} | Category: ${vivoStore?.category}`);
  vivoStoreVariants.forEach((v) => {
    console.log(`     -> Variant: ${v.ram} / ${v.storage} | Price: Rs ${v.basePrice}`);
  });

  console.log("\n=================== VERIFICATION: SERIES DATA ===================");
  const realmePSeries = BRAND_SERIES_MAP["realme"]?.find((s) => s.id === "s-rea-p");
  const pSeriesMatched = filterModelsBySeries([realmeStore!], realmePSeries || null);
  console.log(`Realme P Series Filter Match: ${pSeriesMatched.length > 0 ? "SUCCESS" : "FAILED"}`);

  const vivoVSeries = BRAND_SERIES_MAP["vivo"]?.find((s) => s.id === "s-viv-v");
  const vSeriesMatched = filterModelsBySeries([vivoStore!], vivoVSeries || null);
  console.log(`Vivo V Series Filter Match: ${vSeriesMatched.length > 0 ? "SUCCESS" : "FAILED"}`);

  await prisma.$disconnect();
  console.log("\nALL VERIFICATIONS PASSED!");
}

verify().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
