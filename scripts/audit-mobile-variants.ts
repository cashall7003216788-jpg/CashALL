import { INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

console.log("=== AUDIT MOBILE VARIANTS ===");

// 1. Check for inverted RAM and Storage (e.g. Storage is 4GB/6GB/8GB/12GB/16GB and RAM is 64GB/128GB/256GB/512GB)
const invertedVariants: any[] = [];
// 2. Check for exact duplicate variants in same model (same storage + ram)
const duplicateVariants: any[] = [];
// 3. Models with 0 basePrice
const zeroPriceVariants: any[] = [];

const modelMap = new Map(INITIAL_MODELS.map(m => [m.id, m]));

const seenVariantsByModel = new Map<string, Set<string>>();

INITIAL_VARIANTS.forEach(v => {
  const model = modelMap.get(v.modelId);
  if (!model || (model.category && model.category !== "MOBILE")) return;

  if (v.basePrice <= 0) {
    zeroPriceVariants.push({ model: model.name, brand: model.brandSlug, variant: v });
  }

  // Check duplicate
  const key = `${v.storage}__${v.ram || ''}`;
  if (!seenVariantsByModel.has(v.modelId)) {
    seenVariantsByModel.set(v.modelId, new Set());
  }
  const seen = seenVariantsByModel.get(v.modelId)!;
  if (seen.has(key)) {
    duplicateVariants.push({ model: model.name, brand: model.brandSlug, key, variant: v });
  } else {
    seen.add(key);
  }

  // Check inverted RAM/Storage
  // Common RAM values: 2 GB, 3 GB, 4 GB, 6 GB, 8 GB, 12 GB, 16 GB, 18 GB, 24 GB
  // Common Storage values: 16 GB, 32 GB, 64 GB, 128 GB, 256 GB, 512 GB, 1 TB
  // If storage is "16 GB" or less, and RAM is "64 GB" or "128 GB" or "256 GB" or "512 GB", it's definitely inverted!
  const ramNum = v.ram ? parseInt(v.ram) : 0;
  const storageNum = parseInt(v.storage);
  if (v.ram && storageNum && ramNum) {
    if (storageNum <= 16 && ramNum >= 64) {
      invertedVariants.push({ model: model.name, brand: model.brandSlug, storage: v.storage, ram: v.ram, variantId: v.id });
    }
  }
});

console.log(`Zero Price Variants: ${zeroPriceVariants.length}`);
console.log(zeroPriceVariants);

console.log(`\nInverted Storage/RAM Variants: ${invertedVariants.length}`);
console.log(invertedVariants);

console.log(`\nDuplicate Variants (same model, same storage/RAM): ${duplicateVariants.length}`);
console.table(duplicateVariants.map(d => ({ model: d.model, brand: d.brand, key: d.key, id: d.variant.id, price: d.variant.basePrice })));
