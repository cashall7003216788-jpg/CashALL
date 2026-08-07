import { db } from "../db";

/**
 * Duplicate an existing device model configuration including variants, color variants, images, and question set link.
 */
export async function duplicateDeviceModel(sourceModelId: string, newName: string, newSlug: string) {
  const source = await db.deviceModel.findUnique({
    where: { id: sourceModelId },
    include: {
      variants: true,
      colorVariants: true,
      images: true,
      pricingRules: true,
    },
  });

  if (!source) {
    throw new Error("Source device model not found");
  }

  // Create new model
  const duplicatedModel = await db.deviceModel.create({
    data: {
      brandId: source.brandId,
      questionSetId: source.questionSetId,
      name: newName,
      slug: newSlug,
      category: source.category,
      imageUrl: source.imageUrl,
      releaseYear: source.releaseYear,
      basePrice: source.basePrice,
      description: source.description,
      popular: source.popular,
      active: source.active,
    },
  });

  // Duplicate Storage Variants
  for (const v of source.variants) {
    await db.deviceVariant.create({
      data: {
        modelId: duplicatedModel.id,
        ram: v.ram,
        storage: v.storage,
        basePrice: v.basePrice,
        active: v.active,
        sortOrder: v.sortOrder,
      },
    });
  }

  // Duplicate Color Variants
  for (const c of source.colorVariants) {
    await db.colorVariant.create({
      data: {
        modelId: duplicatedModel.id,
        colorName: c.colorName,
        hexCode: c.hexCode,
        imageUrl: c.imageUrl,
        active: c.active,
      },
    });
  }

  // Duplicate Device Images
  for (const img of source.images) {
    await db.deviceImage.create({
      data: {
        modelId: duplicatedModel.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        caption: img.caption,
        sortOrder: img.sortOrder,
      },
    });
  }

  // Duplicate Specific Pricing Rules
  for (const rule of source.pricingRules) {
    await db.pricingRule.create({
      data: {
        modelId: duplicatedModel.id,
        questionId: rule.questionId,
        optionId: rule.optionId,
        ruleType: rule.ruleType,
        adjustmentValue: rule.adjustmentValue,
        minValue: rule.minValue,
        maxValue: rule.maxValue,
        priority: rule.priority,
        active: rule.active,
      },
    });
  }

  return duplicatedModel;
}

/**
 * Fetches complete model details dynamically by slug or ID
 */
export async function getDynamicModelDetails(slugOrId: string) {
  return await db.deviceModel.findFirst({
    where: {
      OR: [{ id: slugOrId }, { slug: slugOrId }],
    },
    include: {
      brand: true,
      variants: {
        where: { active: true },
        orderBy: { basePrice: "asc" },
      },
      colorVariants: {
        where: { active: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      questionSet: {
        include: {
          questions: {
            where: { active: true },
            orderBy: { sortOrder: "asc" },
            include: {
              options: {
                where: { active: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
      pricingRules: {
        where: { active: true },
      },
    },
  });
}
