import { prisma } from "../lib/db";

async function main() {
  console.log("Checking and upgrading questionnaire answers for all orders...");

  const orders = await prisma.order.findMany({
    include: { quote: true },
  });

  for (const ord of orders) {
    if (!ord.quote) continue;

    let answers: any = {};
    if (ord.quote.selectedAnswersJson) {
      try {
        answers = JSON.parse(ord.quote.selectedAnswersJson);
      } catch {}
    }

    // Standardize answers
    const updatedAnswers = {
      device: answers.device || ord.quote.variantId || "Mobile Device",
      underWarranty: answers.underWarranty !== undefined ? Boolean(answers.underWarranty) : false,
      validBill: answers.validBill !== undefined ? Boolean(answers.validBill) : false,
      powerWorking: answers.powerWorking !== undefined ? Boolean(answers.powerWorking) : (answers.power === "no" ? false : true),
      callsWorking: answers.callsWorking !== undefined ? Boolean(answers.callsWorking) : (answers.calls === "no" ? false : true),
      touchWorking: answers.touchWorking !== undefined ? Boolean(answers.touchWorking) : (answers.touch === "no" ? false : true),
      screenOriginal: answers.screenOriginal !== undefined ? Boolean(answers.screenOriginal) : true,
      selectedMajorDefects: Array.isArray(answers.selectedMajorDefects) ? answers.selectedMajorDefects : (Array.isArray(answers.majorDefects) ? answers.majorDefects : []),
      majorDefects: Array.isArray(answers.selectedMajorDefects) ? answers.selectedMajorDefects : (Array.isArray(answers.majorDefects) ? answers.majorDefects : []),
      scratchLevel: answers.scratchLevel || "no_scratches",
      dentLevel: answers.dentLevel || "no_dents",
      selectedFunctionalIssues: Array.isArray(answers.selectedFunctionalIssues) ? answers.selectedFunctionalIssues : (Array.isArray(answers.functionalIssues) ? answers.functionalIssues : []),
      functionalIssues: Array.isArray(answers.selectedFunctionalIssues) ? answers.selectedFunctionalIssues : (Array.isArray(answers.functionalIssues) ? answers.functionalIssues : []),
      selectedAccessories: Array.isArray(answers.selectedAccessories) ? answers.selectedAccessories : (Array.isArray(answers.accessories) ? answers.accessories : ["charger", "box"]),
      accessories: Array.isArray(answers.selectedAccessories) ? answers.selectedAccessories : (Array.isArray(answers.accessories) ? answers.accessories : ["charger", "box"]),
    };

    await prisma.quote.update({
      where: { id: ord.quote.id },
      data: {
        selectedAnswersJson: JSON.stringify(updatedAnswers),
      },
    });
    console.log(`✅ Normalized questionnaire answers for Order #${ord.orderNumber}`);
  }

  console.log("All order questionnaires updated successfully!");
}

main().catch(console.error);
