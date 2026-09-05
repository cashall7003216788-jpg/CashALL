import { INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

console.log("=== CHECKING PRICING INVERSIONS (Higher Storage/RAM cheaper than lower) ===");

const models = INITIAL_MODELS.filter(m => m.category === 'MOBILE' || !m.category);

function getStorageVal(s: string): number {
  if (!s) return 0;
  if (s.toLowerCase().includes('tb')) return parseFloat(s) * 1024;
  return parseFloat(s) || 0;
}

function getRamVal(r?: string): number {
  if (!r) return 0;
  return parseFloat(r) || 0;
}

const inversions: any[] = [];

for (const m of models) {
  const vars = INITIAL_VARIANTS.filter(v => v.modelId === m.id);
  if (vars.length <= 1) continue;

  for (let i = 0; i < vars.length; i++) {
    for (let j = 0; j < vars.length; j++) {
      if (i === j) continue;
      const v1 = vars[i];
      const v2 = vars[j];

      const s1 = getStorageVal(v1.storage);
      const s2 = getStorageVal(v2.storage);
      const r1 = getRamVal(v1.ram);
      const r2 = getRamVal(v2.ram);

      // If v2 has strictly more or equal storage and strictly more or equal RAM (with at least one strictly greater)
      if ((s2 >= s1 && r2 >= r1) && (s2 > s1 || r2 > r1)) {
        if (v2.basePrice < v1.basePrice && v2.basePrice > 0) {
          inversions.push({
            brand: m.brandSlug,
            model: m.name,
            modelId: m.id,
            lowerConfig: `${v1.ram ? v1.ram + ' / ' : ''}${v1.storage} (₹${v1.basePrice})`,
            higherConfig: `${v2.ram ? v2.ram + ' / ' : ''}${v2.storage} (₹${v2.basePrice})`,
            v1_id: v1.id,
            v2_id: v2.id
          });
        }
      }
    }
  }
}

console.log(`Total pricing inversions found: ${inversions.length}`);
console.table(inversions);
