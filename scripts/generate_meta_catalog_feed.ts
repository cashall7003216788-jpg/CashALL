import fs from "fs";
import path from "path";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

interface MetaCatalogItem {
  id: string;
  title: string;
  description: string;
  availability: string;
  condition: string;
  price: string;
  link: string;
  image_link: string;
  brand: string;
  google_product_category: string;
  fb_product_category: string;
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

  const items: MetaCatalogItem[] = [];

  for (const model of INITIAL_MODELS) {
    const brand = brandMap.get(model.brandId);
    const brandName = brand?.name || "CashALL";
    const brandSlug = brand?.slug || model.brandSlug || "brand";
    const category = (model.category || brand?.category || "MOBILE").toUpperCase();

    // Determine target URL on CashALL
    let pageUrl = "";
    let googleCategory = "Electronics > Communications > Telephony > Mobile Phones";
    if (category === "LAPTOP") {
      pageUrl = `https://www.cashall.in/sell/laptop/${brandSlug}/${model.slug}`;
      googleCategory = "Electronics > Computers > Laptops";
    } else if (category === "TABLET") {
      pageUrl = `https://www.cashall.in/sell/tablet/${brandSlug}/${model.slug}`;
      googleCategory = "Electronics > Computers > Tablet Computers";
    } else {
      pageUrl = `https://www.cashall.in/sell/mobile/${brandSlug}/${model.slug}`;
      googleCategory = "Electronics > Communications > Telephony > Mobile Phones";
    }

    const imageUrl = `https://www.cashall.in/api/v1/catalog/image/${model.slug}`;

    const variants = variantsByModel.get(model.id);

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        const storageLabel = variant.storage && variant.storage !== "Standard" ? ` (${variant.storage})` : "";
        const title = `Sell ${model.name}${storageLabel} for Instant Cash | CashALL`;
        const description = `Sell your used ${model.name}${storageLabel} on CashALL. Get instant valuation up to ₹${variant.basePrice.toLocaleString("en-IN")}, free doorstep verification, and instant bank/UPI payment.`;
        const priceStr = `${variant.basePrice}.00 INR`;

        items.push({
          id: variant.id || `v-${model.slug}-${variant.storage.toLowerCase().replace(/\s+/g, "")}`,
          title,
          description,
          availability: "in stock",
          condition: "used",
          price: priceStr,
          link: pageUrl,
          image_link: imageUrl,
          brand: brandName,
          google_product_category: googleCategory,
          fb_product_category: category.toLowerCase(),
        });
      }
    } else {
      const title = `Sell ${model.name} for Instant Cash | CashALL`;
      const description = `Sell your used ${model.name} on CashALL. Get instant valuation, free doorstep pickup, and instant cash payment.`;

      items.push({
        id: model.id || `m-${model.slug}`,
        title,
        description,
        availability: "in stock",
        condition: "used",
        price: "1000.00 INR",
        link: pageUrl,
        image_link: imageUrl,
        brand: brandName,
        google_product_category: googleCategory,
        fb_product_category: category.toLowerCase(),
      });
    }
  }

  // Sort items cleanly
  items.sort((a, b) => a.title.localeCompare(b.title));

  const headers = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
    "google_product_category",
    "fb_product_category",
  ];

  const lines: string[] = [];
  lines.push("\uFEFF" + headers.map(escapeCsv).join(","));

  for (const it of items) {
    lines.push(
      [
        escapeCsv(it.id),
        escapeCsv(it.title),
        escapeCsv(it.description),
        escapeCsv(it.availability),
        escapeCsv(it.condition),
        escapeCsv(it.price),
        escapeCsv(it.link),
        escapeCsv(it.image_link),
        escapeCsv(it.brand),
        escapeCsv(it.google_product_category),
        escapeCsv(it.fb_product_category),
      ].join(",")
    );
  }

  const csvContent = lines.join("\r\n");

  const rootPath = path.resolve(__dirname, "../CashALL_Meta_Catalog_Feed.csv");
  const publicPath = path.resolve(__dirname, "../public/CashALL_Meta_Catalog_Feed.csv");

  fs.writeFileSync(rootPath, csvContent, "utf-8");
  fs.writeFileSync(publicPath, csvContent, "utf-8");

  console.log(`Successfully generated Meta Catalog Feed!`);
  console.log(`Total Products: ${items.length}`);
  console.log(`Saved to root: ${rootPath}`);
  console.log(`Saved to public: ${publicPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
