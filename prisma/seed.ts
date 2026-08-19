import { PrismaClient } from "@prisma/client";
import { INITIAL_BRANDS, INITIAL_MODELS, INITIAL_VARIANTS } from "../lib/store";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records in dependency order
  await prisma.activityLog.deleteMany({});
  await prisma.adminLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.emailLog.deleteMany({});
  await prisma.otpLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.imageReference.deleteMany({});
  await prisma.customerDevice.deleteMany({});
  await prisma.paymentHistory.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.qcReport.deleteMany({});
  await prisma.pickup.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.quote.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.pricingRule.deleteMany({});
  await prisma.conditionOption.deleteMany({});
  await prisma.conditionQuestion.deleteMany({});
  await prisma.colorVariant.deleteMany({});
  await prisma.deviceVariant.deleteMany({});
  await prisma.deviceModel.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.serviceArea.deleteMany({});
  await prisma.fAQ.deleteMany({});
  await prisma.systemSetting.deleteMany({});

  console.log("Cleaned old records.");

  // 2. Create Categories
  await prisma.category.create({
    data: { name: "Mobile", slug: "mobile", sortOrder: 1, active: true },
  });
  await prisma.category.create({
    data: { name: "Laptop", slug: "laptop", sortOrder: 2, active: true },
  });

  // 3. Create Brands
  console.log(`Seeding ${INITIAL_BRANDS.length} brands...`);
  for (const b of INITIAL_BRANDS) {
    await prisma.brand.create({
      data: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoUrl: b.logoUrl,
        sortOrder: b.sortOrder,
        active: b.active,
      },
    });
  }

  // 4. Create Models
  console.log(`Seeding ${INITIAL_MODELS.length} models...`);
  for (const m of INITIAL_MODELS) {
    await prisma.deviceModel.create({
      data: {
        id: m.id,
        brandId: m.brandId,
        name: m.name,
        slug: m.slug,
        imageUrl: m.imageUrl,
        releaseYear: m.releaseYear,
        popular: m.popular,
        active: m.active,
      },
    });
  }

  // 5. Create Device Variants
  console.log(`Seeding ${INITIAL_VARIANTS.length} variants...`);
  for (const v of INITIAL_VARIANTS) {
    await prisma.deviceVariant.create({
      data: {
        id: v.id,
        modelId: v.modelId,
        ram: v.ram || null,
        storage: v.storage,
        basePrice: v.basePrice,
        active: v.active,
      },
    });
  }

  // 6. Create Questions and Options
  // Q1: Power
  const qPower = await prisma.conditionQuestion.create({
    data: {
      id: "550e8400-e29b-41d4-a716-446655440031",
      title: "Does your phone switch on?",
      subtitle: "Turn on the phone screen and check basic power function",
      group: "BASIC",
      type: "SINGLE",
      sortOrder: 1,
      active: true,
    },
  });
  const oPowerYes = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440041", questionId: qPower.id, label: "Turns ON normally", description: "Phone powers up to home screen", iconName: "Power", sortOrder: 1 },
  });
  const oPowerNo = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440042", questionId: qPower.id, label: "Power / Boot Issue", description: "Does not turn on or gets stuck on logo", iconName: "PowerOff", sortOrder: 2 },
  });

  // Q2: Screen
  const qScreen = await prisma.conditionQuestion.create({
    data: {
      id: "550e8400-e29b-41d4-a716-446655440032",
      title: "What is the physical condition of the screen?",
      subtitle: "Check under clear light for scratches, cracks or display tint",
      group: "SCREEN",
      type: "SINGLE",
      sortOrder: 2,
      active: true,
    },
  });
  const oScreenFlawless = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440043", questionId: qScreen.id, label: "Flawless / Like New", description: "No scratches, zero defects", iconName: "Sparkles", sortOrder: 1 },
  });
  const oScreenMinor = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440044", questionId: qScreen.id, label: "Minor Scratches", description: "1-2 light surface hairline scratches", iconName: "Minimize2", sortOrder: 2 },
  });
  const oScreenHeavy = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440045", questionId: qScreen.id, label: "Heavy Scratches", description: "Multiple deep noticeable scratches", iconName: "Layers", sortOrder: 3 },
  });
  const oScreenCracked = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440046", questionId: qScreen.id, label: "Cracked / Damaged Glass", description: "Visible glass cracks or touch issue", iconName: "Smartphone", sortOrder: 4 },
  });

  // Q3: Body
  const qBody = await prisma.conditionQuestion.create({
    data: {
      id: "550e8400-e29b-41d4-a716-446655440033",
      title: "What is the condition of the body / side frame?",
      subtitle: "Inspect side edges, back glass, camera bump and corners",
      group: "BODY",
      type: "SINGLE",
      sortOrder: 3,
      active: true,
    },
  });
  const oBodyFlawless = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440047", questionId: qBody.id, label: "Flawless Body", description: "No dents, no scratches", iconName: "ShieldCheck", sortOrder: 1 },
  });
  const oBodyMinor = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440048", questionId: qBody.id, label: "Minor Wear", description: "Light paint wear or minor micro scuffs", iconName: "Sliders", sortOrder: 2 },
  });
  const oBodyDents = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440049", questionId: qBody.id, label: "Dents / Scratches", description: "Noticeable dents on corners or back glass scuffs", iconName: "AlertTriangle", sortOrder: 3 },
  });
  const oBodyDamaged = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440050", questionId: qBody.id, label: "Heavy Structural Damage", description: "Bent frame, cracked back panel", iconName: "XCircle", sortOrder: 4 },
  });

  // Q4: Functional
  const qFunctional = await prisma.conditionQuestion.create({
    data: {
      id: "550e8400-e29b-41d4-a716-446655440034",
      title: "Are there any functional issues?",
      subtitle: "Select all features that are broken or malfunctioning",
      group: "FUNCTIONAL",
      type: "SINGLE",
      sortOrder: 4,
      active: true,
    },
  });
  const oFuncNone = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440051", questionId: qFunctional.id, label: "All Functions Work Perfectly", description: "Cameras, Wi-Fi, Speakers, Fingerprint/FaceID all fine", iconName: "CheckCircle2", sortOrder: 1 },
  });
  const oFuncMinor = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440052", questionId: qFunctional.id, label: "1-2 Minor Issues", description: "Weak battery health or slightly muffled speaker", iconName: "AlertCircle", sortOrder: 2 },
  });
  const oFuncMajor = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440053", questionId: qFunctional.id, label: "Major Fault (Camera/Wi-Fi/Biometric)", description: "Camera blurry, FaceID failed or Wi-Fi unresponsive", iconName: "AlertTriangle", sortOrder: 3 },
  });

  // Q5: Accessories
  const qAccessories = await prisma.conditionQuestion.create({
    data: {
      id: "550e8400-e29b-41d4-a716-446655440035",
      title: "Which original accessories do you have?",
      subtitle: "Having original box and charger increases your phone's value",
      group: "ACCESSORIES",
      type: "SINGLE",
      sortOrder: 5,
      active: true,
    },
  });
  const oAccAll = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440054", questionId: qAccessories.id, label: "Original Box + Original Charger", description: "Complete inbox packaging included", iconName: "PackageCheck", sortOrder: 1 },
  });
  const oAccBox = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440055", questionId: qAccessories.id, label: "Original Box Only", description: "No charger cable included", iconName: "Package", sortOrder: 2 },
  });
  const oAccCharger = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440056", questionId: qAccessories.id, label: "Original Charger Only", description: "No original box included", iconName: "Zap", sortOrder: 3 },
  });
  const oAccNone = await prisma.conditionOption.create({
    data: { id: "550e8400-e29b-41d4-a716-446655440057", questionId: qAccessories.id, label: "Device Only", description: "No box or charger included", iconName: "Smartphone", sortOrder: 4 },
  });

  // 7. Create Pricing Rules
  const rules = [
    { questionId: qPower.id, optionId: oPowerNo.id, adjustmentType: "PERCENTAGE_DEDUCTION", adjustmentValue: 50 },
    { questionId: qScreen.id, optionId: oScreenFlawless.id, adjustmentType: "FIXED_BONUS", adjustmentValue: 500 },
    { questionId: qScreen.id, optionId: oScreenMinor.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 1200 },
    { questionId: qScreen.id, optionId: oScreenHeavy.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 2800 },
    { questionId: qScreen.id, optionId: oScreenCracked.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 5500 },
    { questionId: qBody.id, optionId: oBodyFlawless.id, adjustmentType: "FIXED_BONUS", adjustmentValue: 300 },
    { questionId: qBody.id, optionId: oBodyMinor.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 800 },
    { questionId: qBody.id, optionId: oBodyDents.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 1800 },
    { questionId: qBody.id, optionId: oBodyDamaged.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 3500 },
    { questionId: qFunctional.id, optionId: oFuncNone.id, adjustmentType: "FIXED_BONUS", adjustmentValue: 0 },
    { questionId: qFunctional.id, optionId: oFuncMinor.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 1500 },
    { questionId: qFunctional.id, optionId: oFuncMajor.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 3800 },
    { questionId: qAccessories.id, optionId: oAccAll.id, adjustmentType: "FIXED_BONUS", adjustmentValue: 600 },
    { questionId: qAccessories.id, optionId: oAccBox.id, adjustmentType: "FIXED_BONUS", adjustmentValue: 300 },
    { questionId: qAccessories.id, optionId: oAccCharger.id, adjustmentType: "FIXED_BONUS", adjustmentValue: 200 },
    { questionId: qAccessories.id, optionId: oAccNone.id, adjustmentType: "FIXED_DEDUCTION", adjustmentValue: 500 },
  ];

  for (const rule of rules) {
    await prisma.pricingRule.create({
      data: {
        ...rule,
        ruleType: rule.adjustmentType,
      },
    });
  }

  // 8. Create Service Areas
  const pincodes = [
    { pincode: "700001", city: "Kolkata", state: "West Bengal" },
    { pincode: "700120", city: "Barrackpore", state: "West Bengal" },
    { pincode: "273001", city: "Gorakhpur", state: "Uttar Pradesh" },
    { pincode: "277001", city: "Ballia", state: "Uttar Pradesh" },
    { pincode: "834001", city: "Ranchi", state: "Jharkhand" },
  ];
  for (const p of pincodes) {
    await prisma.serviceArea.create({ data: p });
  }

  // 9. Create FAQs
  await prisma.fAQ.create({
    data: {
      question: "How does CashALL calculate my phone's value?",
      answer: "CashALL uses a transparent, rule-based pricing engine that combines your phone's real market base value with deductions or bonuses based on your screen condition, physical body wear, functional status, and original accessories.",
      category: "PRICING",
    },
  });

  // 10. Create Partners
  await prisma.partner.create({
    data: {
      id: "550e8400-e29b-41d4-a716-446655440071",
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul@cashallpartners.in",
      businessName: "Express Logistics East",
      city: "Kolkata",
      status: "ACTIVE",
    },
  });

  // 11. Create Admin User
  await prisma.user.create({
    data: {
      email: "support@cashall.in",
      phone: "+91 7003216788",
      firebaseUid: "admin_master_uid_123",
      role: "ADMIN",
      name: "System Admin",
      status: "ACTIVE",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
