import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { z } from "zod";

const schema = z.object({
  phone: z.string().min(10, "Valid 10-digit mobile number required"),
  name: z.string().optional(),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const cleanPhone = validation.data.phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    throw new AppError("Invalid mobile phone number format.", 400);
  }

  // Find or create Partner profile
  let partner = await prisma.partner.findFirst({
    where: { phone: cleanPhone },
  });

  if (!partner) {
    const partnerName = validation.data.name?.trim() || `Partner Exec (${cleanPhone.slice(-4)})`;
    partner = await prisma.partner.create({
      data: {
        name: partnerName,
        phone: cleanPhone,
        email: `partner_${cleanPhone}@cashall.in`,
        businessName: "CashALL Doorstep Logistics",
        city: "Kolkata",
        status: "ACTIVE",
      },
    });
  }

  return NextResponse.json({
    success: true,
    message: "Partner authenticated successfully.",
    data: {
      partner: {
        id: partner.id,
        name: partner.name,
        phone: partner.phone,
        email: partner.email,
        businessName: partner.businessName || "CashALL Logistics",
        city: partner.city,
      },
      token: `tok_partner_${partner.id}`,
    },
  });
});
