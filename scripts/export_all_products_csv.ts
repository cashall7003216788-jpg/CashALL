import fs from "fs";
import path from "path";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

interface CsvRow {
  category: string;
  brandName: string;
  brandSlug: string;
  modelName: string;
  modelSlug: string;
  variantStorage: string;
  variantRam: string;
  basePriceInr: number;
  popular: string;
  active: string;
  imageLink: string;
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

async function run() {
  console.log(`Loaded ${INITIAL_BRANDS.length} brands`);
  console.log(`Loaded ${INITIAL_MODELS.length} models`);
  console.log(`Loaded ${INITIAL_VARIANTS.length} variants`);

  const brandMap = new Map<string, typeof INITIAL_BRANDS[0]>();
  for (const b of INITIAL_BRANDS) {
    brandMap.set(b.id, b);
  }

  const variantsByModel = new Map<string, typeof INITIAL_VARIANTS>();
  const seenVariantIds = new Set<string>();
  for (const v of INITIAL_VARIANTS) {
    const key = v.id || `${v.modelId}_${v.storage}_${v.ram || ""}`;
    if (seenVariantIds.has(key)) continue;
    seenVariantIds.add(key);

    const list = variantsByModel.get(v.modelId) || [];
    list.push(v);
    variantsByModel.set(v.modelId, list);
  }

  const rows: CsvRow[] = [];

  for (const model of INITIAL_MODELS) {
    const brand = brandMap.get(model.brandId);
    const brandName = brand?.name || "Unknown";
    const brandSlug = brand?.slug || model.brandSlug || "";
    const category = (model.category || brand?.category || "MOBILE").toUpperCase();
    const imageLink = `https://www.cashall.in/api/v1/catalog/image/${model.slug}`;

    const variants = variantsByModel.get(model.id);

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        rows.push({
          category,
          brandName,
          brandSlug,
          modelName: model.name,
          modelSlug: model.slug,
          variantStorage: variant.storage || "Standard",
          variantRam: variant.ram || "",
          basePriceInr: variant.basePrice || 0,
          popular: model.popular ? "YES" : "NO",
          active: variant.active !== false && model.active !== false ? "YES" : "NO",
          imageLink,
        });
      }
    } else {
      // Model without explicit variants
      rows.push({
        category,
        brandName,
        brandSlug,
        modelName: model.name,
        modelSlug: model.slug,
        variantStorage: "Standard",
        variantRam: "",
        basePriceInr: 0,
        popular: model.popular ? "YES" : "NO",
        active: model.active !== false ? "YES" : "NO",
        imageLink,
      });
    }
  }

  // Sort rows nicely by Category, Brand Name, Model Name, Storage
  rows.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.brandName !== b.brandName) return a.brandName.localeCompare(b.brandName);
    if (a.modelName !== b.modelName) return a.modelName.localeCompare(b.modelName);
    return a.variantStorage.localeCompare(b.variantStorage);
  });

  const headers = [
    "Category",
    "Brand Name",
    "Brand Slug",
    "Model Name",
    "Model Slug",
    "Variant Storage",
    "Variant RAM",
    "Base Buyout Price (INR)",
    "Popular",
    "Active",
    "Image Link",
  ];

  const csvLines: string[] = [];
  // UTF-8 BOM for automatic Excel detection
  csvLines.push("\uFEFF" + headers.map(escapeCsv).join(","));

  for (const r of rows) {
    csvLines.push(
      [
        escapeCsv(r.category),
        escapeCsv(r.brandName),
        escapeCsv(r.brandSlug),
        escapeCsv(r.modelName),
        escapeCsv(r.modelSlug),
        escapeCsv(r.variantStorage),
        escapeCsv(r.variantRam),
        escapeCsv(r.basePriceInr),
        escapeCsv(r.popular),
        escapeCsv(r.active),
        escapeCsv(r.imageLink),
      ].join(",")
    );
  }

  const csvContent = csvLines.join("\r\n");

  const rootOutputPath = path.resolve(__dirname, "../CashALL_All_Products_Catalog.csv");
  const publicOutputPath = path.resolve(__dirname, "../public/CashALL_All_Products_Catalog.csv");

  fs.writeFileSync(rootOutputPath, csvContent, "utf-8");
  fs.writeFileSync(publicOutputPath, csvContent, "utf-8");

  console.log(`\nSuccessfully exported CSV!`);
  console.log(`Total Rows: ${rows.length}`);
  console.log(`File saved to: ${rootOutputPath}`);
  console.log(`File also available at: ${publicOutputPath}`);

  // Summary counts
  const countByCategory: Record<string, number> = {};
  for (const r of rows) {
    countByCategory[r.category] = (countByCategory[r.category] || 0) + 1;
  }
  console.log("Counts by category:", countByCategory);
}

run().catch((err) => {
  console.error("Export error:", err);
  process.exit(1);
});
