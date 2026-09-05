import { INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

console.log("=== MOBILE CATALOG AUDIT ===");

const mobileModels = INITIAL_MODELS.filter(m => !m.category || m.category === "MOBILE");
const mobileModelIds = new Set(mobileModels.map(m => m.id));
const mobileVariants = INITIAL_VARIANTS.filter(v => mobileModelIds.has(v.modelId));

console.log(`Mobile Models: ${mobileModels.length}`);
console.log(`Mobile Variants: ${mobileVariants.length}`);

const zeroPrice = mobileVariants.filter(v => v.basePrice <= 0);
console.log(`Zero Price Mobile Variants: ${zeroPrice.length}`);

// Inverted RAM/Storage
const inverted = mobileVariants.filter(v => {
  const ramNum = v.ram ? parseInt(v.ram) : 0;
  const storageNum = parseInt(v.storage);
  return v.ram && storageNum && ramNum && storageNum <= 16 && ramNum >= 64;
});
console.log(`Inverted RAM/Storage Mobile Variants: ${inverted.length}`);

// Duplicates by modelId + storage + ram
const seen = new Set<string>();
const duplicates: any[] = [];
mobileVariants.forEach(v => {
  const key = `${v.modelId}__${v.storage}__${v.ram || ""}`;
  if (seen.has(key)) {
    duplicates.push(v);
  } else {
    seen.add(key);
  }
});
console.log(`Duplicate Mobile Variants: ${duplicates.length}`);
if (duplicates.length > 0) {
  duplicates.forEach(d => console.log(` - Duplicate: ${d.id} (model: ${d.modelId}, storage: ${d.storage}, ram: ${d.ram})`));
}

console.log("=== MOBILE AUDIT COMPLETE ===");
