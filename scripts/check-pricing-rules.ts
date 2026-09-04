import { prisma } from "../lib/db";

async function main() {
  const rules = await prisma.pricingRule.findMany({
    include: {
      question: true,
      option: true,
    }
  });
  console.log("Total rules:", rules.length);
  rules.forEach(r => {
    console.log(`Q: ${r.question?.title || r.questionId} | Opt: ${r.option?.label || r.optionId} | ruleType: ${r.ruleType} | adjType: ${r.adjustmentType} | adjVal: ${r.adjustmentValue}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
