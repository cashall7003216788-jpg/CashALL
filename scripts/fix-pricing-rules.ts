import { prisma } from "../lib/db";

async function main() {
  console.log("Fixing pricing rules in DB...");

  // 1. Update rules where ruleType is FIXED_DECREASE
  const fixedDecrease = await prisma.pricingRule.updateMany({
    where: { ruleType: "FIXED_DECREASE" },
    data: { adjustmentType: "FIXED_DEDUCTION" },
  });
  console.log(`Updated ${fixedDecrease.count} FIXED_DECREASE rules to adjustmentType: FIXED_DEDUCTION`);

  // 2. Update rules where ruleType is BONUS
  const bonus = await prisma.pricingRule.updateMany({
    where: { ruleType: "BONUS" },
    data: { adjustmentType: "FIXED_BONUS" },
  });
  console.log(`Updated ${bonus.count} BONUS rules to adjustmentType: FIXED_BONUS`);

  // 3. Update rules where ruleType is NO_CHANGE
  const noChange = await prisma.pricingRule.updateMany({
    where: { ruleType: "NO_CHANGE" },
    data: { adjustmentType: "FIXED_BONUS", adjustmentValue: 0 },
  });
  console.log(`Updated ${noChange.count} NO_CHANGE rules`);

  // 4. Update rules where ruleType is PERCENTAGE_DECREASE
  const pctDecrease = await prisma.pricingRule.updateMany({
    where: { ruleType: "PERCENTAGE_DECREASE" },
    data: { adjustmentType: "PERCENTAGE_DEDUCTION" },
  });
  console.log(`Updated ${pctDecrease.count} PERCENTAGE_DECREASE rules`);

  // Verify
  const rules = await prisma.pricingRule.findMany();
  console.log(`\nVerified ${rules.length} total rules in DB:`);
  rules.forEach((r) => {
    console.log(`ID: ${r.id.slice(0, 8)} | ruleType: ${r.ruleType} | adjType: ${r.adjustmentType} | adjVal: ${r.adjustmentValue}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
