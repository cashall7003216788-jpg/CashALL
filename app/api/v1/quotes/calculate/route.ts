import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { PricingService } from "@/lib/services/pricing.service";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { EmailService } from "@/lib/services/email.service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const calculateQuoteSchema = z.object({
  variantId: z.string({
    required_error: "variantId is required",
  }),
  answers: z.array(
    z.object({
      questionId: z.string(),
      questionTitle: z.string(),
      group: z.string(),
      optionId: z.string(),
      optionLabel: z.string(),
    })
  ),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = calculateQuoteSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.errors[0].message, 400);
  }

  const { variantId, answers } = validation.data;

  // Calculate quote values using the pricing service
  const quoteResult = await PricingService.calculateQuote(variantId, answers);

  const quoteNumber = `QA${Math.floor(10000 + Math.random() * 90000)}`;
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours validity

  // Save the quote in the database
  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      variantId,
      selectedAnswersJson: JSON.stringify(answers),
      basePrice: quoteResult.basePrice,
      totalDeductions: quoteResult.totalDeductions,
      estimatedPrice: quoteResult.estimatedPrice,
      breakdownJson: JSON.stringify(quoteResult.breakdown),
      expiresAt,
      status: "ACTIVE",
    },
    include: {
      variant: {
        include: {
          model: {
            include: {
              brand: true,
            },
          },
        },
      },
    },
  });

  // Optional email notification if user is logged in
  let userEmail: string | null = null;
  try {
    const decodedUser = await verifyAuthToken(req);
    if (decodedUser && decodedUser.email) {
      userEmail = decodedUser.email;
    }
  } catch (e) {
    // Ignore auth error for public quote calculations
  }

  if (userEmail) {
    const deviceName = `${quote.variant.model.brand.name} ${quote.variant.model.name}`;
    EmailService.sendEmail(
      userEmail,
      `Your Device Estimate: ₹${quote.estimatedPrice} 📱`,
      EmailService.compileQuoteTemplate(quote.quoteNumber, deviceName, quote.estimatedPrice)
    ).catch((err) => logger.error("Failed to send quote email:", err));
  }

  return NextResponse.json({
    success: true,
    data: quote,
  });
});
