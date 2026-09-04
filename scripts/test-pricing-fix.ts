import { prisma } from "../lib/db";
import { PricingService } from "../lib/services/pricing.service";

async function main() {
  const variant = await prisma.deviceVariant.findFirst({
    include: { model: { include: { brand: true } } },
  });

  if (!variant) {
    console.log("No variant found");
    return;
  }

  console.log(`Testing with variant: ${variant.model.brand.name} ${variant.model.name} (${variant.storage}), basePrice: ${variant.basePrice}`);

  // Screen questions & options
  const questions = await prisma.conditionQuestion.findMany({
    include: { options: true },
  });

  const screenQ = questions.find((q) => q.group === "SCREEN" || q.title.toLowerCase().includes("screen"));
  if (!screenQ) {
    console.log("No screen question found in DB");
    return;
  }

  console.log(`Screen Question: ${screenQ.title}`);
  for (const opt of screenQ.options) {
    const res = await PricingService.calculateQuote(variant.id, [
      {
        questionId: screenQ.id,
        questionTitle: screenQ.title,
        group: screenQ.group,
        optionId: opt.id,
        optionLabel: opt.label,
      },
    ]);
    console.log(`Option: "${opt.label}" | Base: ₹${res.basePrice} | Deductions: ₹${res.totalDeductions} | Bonuses: ₹${res.totalBonuses} | Offer: ₹${res.estimatedPrice}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
