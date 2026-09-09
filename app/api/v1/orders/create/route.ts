import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/services/whatsapp.service";
import { logger } from "@/lib/utils/logger";
import { cleanDeviceName } from "@/lib/device";
import { isPincodeServiced, getPincodeDetails, SERVICEABLE_DISTRICTS } from "@/lib/serviceability";
import {
  extractClientMetadata,
  sendServerLeadEvent,
  sendServerScheduleEvent,
  sendServerPickupBookedEvent,
} from "@/lib/analytics/meta-server";
import { z } from "zod";

const createOrderSchema = z.object({
  quoteId: z.any().optional(),
  fullName: z.any().optional(),
  phone: z.any().optional(),
  email: z.any().optional(),
  house: z.any().optional(),
  street: z.any().optional(),
  area: z.any().optional(),
  landmark: z.any().optional(),
  city: z.any().optional(),
  state: z.any().optional(),
  pincode: z.any().optional(),
  pickupDate: z.any().optional(),
  pickupTimeSlot: z.any().optional(),
  deviceName: z.any().optional(),
  estimatedPrice: z.any().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const validation = createOrderSchema.safeParse(body);

    const data = validation.success ? validation.data : body || {};

    const rawPhone = data.phone ? String(data.phone) : "7604092333";
    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10) || "7604092333";
    const fullName = data.fullName ? String(data.fullName).trim() : "Customer";
    const house = data.house ? String(data.house).trim() : "Customer Address";
    const street = data.street ? String(data.street).trim() : "Doorstep Location";
    const area = data.area ? String(data.area).trim() : "West Bengal";
    const pincode = data.pincode ? String(data.pincode).trim() : "";

    // Strictly lock serviceability to the designated districts
    if (!pincode || !isPincodeServiced(pincode)) {
      const districtNames = SERVICEABLE_DISTRICTS.map((d) => d.name).join(", ");
      return NextResponse.json(
        {
          success: false,
          error: `Currently, we only serve ${districtNames}. PIN code ${pincode || "provided"} is outside our service area.`,
        },
        { status: 400 }
      );
    }

    const pinDetails = getPincodeDetails(pincode);
    const city = data.city ? String(data.city).trim() : (pinDetails?.city || "Kolkata");
    const state = data.state ? String(data.state).trim() : (pinDetails?.state || "West Bengal");
    const pickupDate = data.pickupDate ? String(data.pickupDate).trim() : "Tomorrow";
    const pickupTimeSlot = data.pickupTimeSlot ? String(data.pickupTimeSlot).trim() : "10 AM - 1 PM";
    const deviceName = cleanDeviceName(data.deviceName ? String(data.deviceName).trim() : "Customer Mobile Device");
    
    const rawEstPrice = data.estimatedPrice;
    const estimatedPrice = typeof rawEstPrice === "number" 
      ? rawEstPrice 
      : (parseFloat(String(rawEstPrice)) || 32500);

    logger.info(`[ORDER CREATE] Processing order placement for ${fullName} (${cleanPhone}) - Device: ${deviceName}`);

    const rawEmail = (data.email || body.email) ? String(data.email || body.email).trim() : null;

    // 1. Parallelize User Upsert and Quote Resolution for ultra-fast placement
    const incomingQuoteNum = (data.quoteNumber || body.quoteNumber || "").trim();
    const incomingQuoteId = (data.quoteId || body.quoteId || "").trim();
    const isQuoteUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(incomingQuoteId);

    const userPromise = prisma.user.upsert({
      where: { phone: cleanPhone },
      update: {
        name: fullName,
        ...(rawEmail ? { email: rawEmail } : {}),
      },
      create: {
        phone: cleanPhone,
        name: fullName,
        email: rawEmail,
        firebaseUid: `uid_${cleanPhone}_${Date.now()}`,
        role: "CUSTOMER",
      },
    });

    const quoteConditions = [];
    if (incomingQuoteNum) quoteConditions.push({ quoteNumber: incomingQuoteNum });
    if (incomingQuoteId) {
      if (isQuoteUuid) quoteConditions.push({ id: incomingQuoteId });
      else quoteConditions.push({ quoteNumber: incomingQuoteId });
    }

    const quotePromise = quoteConditions.length > 0
      ? prisma.quote.findFirst({
          where: {
            OR: quoteConditions,
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

    let [user, quote] = await Promise.all([userPromise, quotePromise]);

    // DEDUPLICATION CHECK 1: If an active order already exists for this quote, return it immediately
    if (quote) {
      const existingOrderForQuote = await prisma.order.findFirst({
        where: {
          quoteId: quote.id,
          deletedAt: null,
        },
        include: {
          user: true,
          address: true,
          quote: true,
          pickups: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (existingOrderForQuote) {
        logger.info(`[ORDER CREATE IDEMPOTENCY] Order #${existingOrderForQuote.orderNumber} already exists for quote ${quote.quoteNumber || quote.id}. Returning existing order.`);
        const fullAddr = existingOrderForQuote.address
          ? `${existingOrderForQuote.address.house || ""}, ${existingOrderForQuote.address.street || ""}, ${existingOrderForQuote.address.area || ""}, ${existingOrderForQuote.address.city || ""}, ${existingOrderForQuote.address.state || ""} - ${existingOrderForQuote.address.pincode || ""}`
          : `${house}, ${street}, ${area}, ${city}, ${state} - ${pincode}`;

        return NextResponse.json({
          success: true,
          data: {
            id: existingOrderForQuote.id,
            orderNumber: existingOrderForQuote.orderNumber,
            customerName: existingOrderForQuote.user?.name || fullName,
            customerPhone: existingOrderForQuote.user?.phone || cleanPhone,
            deviceName: deviceName,
            pincode: existingOrderForQuote.address?.pincode || pincode,
            addressSummary: fullAddr,
            pickupDate: existingOrderForQuote.pickupDate || pickupDate,
            pickupTimeSlot: existingOrderForQuote.pickupTimeSlot || pickupTimeSlot,
            estimatedPrice: existingOrderForQuote.finalPrice || estimatedPrice,
            status: existingOrderForQuote.status,
            createdAt: existingOrderForQuote.createdAt.toISOString(),
          },
        });
      }
    }

    // DEDUPLICATION CHECK 2: If derived orderNumber already exists, return it immediately
    let targetOrderNumber = "";
    if (quote?.quoteNumber) {
      const digits = quote.quoteNumber.replace(/^(CAQ|Q)-?/i, "").replace(/[^0-9]/g, "");
      if (digits) {
        targetOrderNumber = `CA${digits}`;
      }
    }

    if (targetOrderNumber) {
      const existingOrderByNum = await prisma.order.findUnique({
        where: { orderNumber: targetOrderNumber },
        include: {
          user: true,
          address: true,
          quote: true,
          pickups: true,
        },
      });

      if (existingOrderByNum) {
        logger.info(`[ORDER CREATE IDEMPOTENCY] Order #${targetOrderNumber} already exists. Returning existing order.`);
        const fullAddr = existingOrderByNum.address
          ? `${existingOrderByNum.address.house || ""}, ${existingOrderByNum.address.street || ""}, ${existingOrderByNum.address.area || ""}, ${existingOrderByNum.address.city || ""}, ${existingOrderByNum.address.state || ""} - ${existingOrderByNum.address.pincode || ""}`
          : `${house}, ${street}, ${area}, ${city}, ${state} - ${pincode}`;

        return NextResponse.json({
          success: true,
          data: {
            id: existingOrderByNum.id,
            orderNumber: existingOrderByNum.orderNumber,
            customerName: existingOrderByNum.user?.name || fullName,
            customerPhone: existingOrderByNum.user?.phone || cleanPhone,
            deviceName: deviceName,
            pincode: existingOrderByNum.address?.pincode || pincode,
            addressSummary: fullAddr,
            pickupDate: existingOrderByNum.pickupDate || pickupDate,
            pickupTimeSlot: existingOrderByNum.pickupTimeSlot || pickupTimeSlot,
            estimatedPrice: existingOrderByNum.finalPrice || estimatedPrice,
            status: existingOrderByNum.status,
            createdAt: existingOrderByNum.createdAt.toISOString(),
          },
        });
      }
    }

    // DEDUPLICATION CHECK 3: Check if the same user placed an order for the same device/price within the last 5 minutes
    const recentDuplicate = await prisma.order.findFirst({
      where: {
        userId: user.id,
        finalPrice: estimatedPrice,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        deletedAt: null,
      },
      include: {
        user: true,
        address: true,
        quote: true,
        pickups: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentDuplicate) {
      logger.info(`[ORDER CREATE IDEMPOTENCY] Duplicate placement detected for user ${cleanPhone} (#${recentDuplicate.orderNumber}) within 5 min. Returning existing order.`);
      const fullAddr = recentDuplicate.address
        ? `${recentDuplicate.address.house || ""}, ${recentDuplicate.address.street || ""}, ${recentDuplicate.address.area || ""}, ${recentDuplicate.address.city || ""}, ${recentDuplicate.address.state || ""} - ${recentDuplicate.address.pincode || ""}`
        : `${house}, ${street}, ${area}, ${city}, ${state} - ${pincode}`;

      return NextResponse.json({
        success: true,
        data: {
          id: recentDuplicate.id,
          orderNumber: recentDuplicate.orderNumber,
          customerName: recentDuplicate.user?.name || fullName,
          customerPhone: recentDuplicate.user?.phone || cleanPhone,
          deviceName: deviceName,
          pincode: recentDuplicate.address?.pincode || pincode,
          addressSummary: fullAddr,
          pickupDate: recentDuplicate.pickupDate || pickupDate,
          pickupTimeSlot: recentDuplicate.pickupTimeSlot || pickupTimeSlot,
          estimatedPrice: recentDuplicate.finalPrice || estimatedPrice,
          status: recentDuplicate.status,
          createdAt: recentDuplicate.createdAt.toISOString(),
        },
      });
    }

    const rawIncomingAnswers = data.selectedAnswersJson || body.selectedAnswersJson || null;
    const incomingAnswersJson = typeof rawIncomingAnswers === "object" && rawIncomingAnswers !== null
      ? JSON.stringify(rawIncomingAnswers)
      : (typeof rawIncomingAnswers === "string" && rawIncomingAnswers.trim() && rawIncomingAnswers !== "{}" ? rawIncomingAnswers : null);

    const rawIncomingBreakdown = data.breakdownJson || body.breakdownJson || null;
    const incomingBreakdownJson = typeof rawIncomingBreakdown === "object" && rawIncomingBreakdown !== null
      ? JSON.stringify(rawIncomingBreakdown)
      : (typeof rawIncomingBreakdown === "string" && rawIncomingBreakdown.trim() && rawIncomingBreakdown !== "{}" ? rawIncomingBreakdown : null);

    // Fallback if quote is not found
    if (!quote) {
      const firstWord = deviceName.trim().split(" ")[0] || "CashALL";
      let brand = await prisma.brand.findFirst({
        where: { name: { contains: firstWord, mode: "insensitive" } },
      });
      if (!brand) {
        brand = await prisma.brand.create({
          data: { name: firstWord, slug: `${firstWord.toLowerCase()}-${Date.now()}`, category: "MOBILE" },
        });
      }

      let model = await prisma.deviceModel.findFirst({
        where: { brandId: brand.id, name: { contains: deviceName.slice(0, 15), mode: "insensitive" } },
      });
      if (!model) {
        model = await prisma.deviceModel.create({
          data: { brandId: brand.id, name: deviceName, slug: `dev-${Date.now()}`, category: "MOBILE", basePrice: estimatedPrice },
        });
      }

      let variant = await prisma.deviceVariant.findFirst({ where: { modelId: model.id } });
      if (!variant) {
        variant = await prisma.deviceVariant.create({
          data: { modelId: model.id, storage: "Default Storage", basePrice: estimatedPrice },
        });
      }

      const generatedQuoteNumber = incomingQuoteNum || `CAQ-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
        quote = await prisma.quote.create({
          data: {
            quoteNumber: generatedQuoteNumber,
            variantId: variant.id,
            selectedAnswersJson: incomingAnswersJson || JSON.stringify({ device: deviceName }),
            basePrice: Math.max(variant.basePrice || 0, estimatedPrice),
            totalDeductions: 0,
            estimatedPrice: estimatedPrice,
            breakdownJson: incomingBreakdownJson || JSON.stringify({ deviceName, basePrice: estimatedPrice }),
            status: "CONVERTED",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (quoteErr) {
        logger.error("Quote creation fallback error:", quoteErr);
        quote = await prisma.quote.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
      }
    }

    if (!quote) {
      return NextResponse.json(
        { success: false, error: "System initialization pending. Please try again." },
        { status: 400 }
      );
    }

    // 2. Create Address Record
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: fullName,
        phone: cleanPhone,
        house: house,
        street: street,
        area: area,
        landmark: data.landmark ? String(data.landmark).trim() : null,
        city: city,
        state: state,
        pincode: pincode,
      },
    });

    // 3. Create Order Record with matching Order ID (CAQ12345 -> CA12345) & direct Pickup relation
    let orderNumber = targetOrderNumber;
    if (!orderNumber && quote?.quoteNumber) {
      const digits = quote.quoteNumber.replace(/^(CAQ|Q)-?/i, "").replace(/[^0-9]/g, "");
      if (digits) {
        orderNumber = `CA${digits}`;
      }
    }
    if (!orderNumber) {
      orderNumber = `CA${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // Ensure uniqueness for fallback random numbers
    while (await prisma.order.findUnique({ where: { orderNumber } })) {
      orderNumber = `CA${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        quoteId: quote.id,
        addressId: address.id,
        pickupDate: pickupDate,
        pickupTimeSlot: pickupTimeSlot,
        status: "PICKUP_SCHEDULED",
        finalPrice: estimatedPrice,
        pickups: {
          create: {
            date: pickupDate,
            timeSlot: pickupTimeSlot,
            status: "SCHEDULED",
            notes: "Doorstep pickup order confirmed.",
          },
        },
      },
    });

    const fullAddress = `${house}, ${street}, ${area}${data.landmark ? ", " + data.landmark : ""}, ${state} - ${pincode}`;

    // 4. Detached asynchronous tasks (Never block or delay the customer HTTP response)
    const quoteIdToConvert = quote.id;
    const clientMeta = extractClientMetadata(req);
    const capiUserData = {
      email: rawEmail || undefined,
      phone: cleanPhone,
      firstName: fullName,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode,
      clientIpAddress: clientMeta.clientIpAddress,
      clientUserAgent: clientMeta.clientUserAgent,
      fbp: clientMeta.fbp,
      fbc: clientMeta.fbc,
    };

    // Fire non-blocking tasks asynchronously
    (async () => {
      try {
        // Mark quote converted
        await prisma.quote.update({
          where: { id: quoteIdToConvert },
          data: { status: "CONVERTED" },
        }).catch(() => {});

        // WhatsApp notification to admin
        WhatsAppService.notifyNewOrder({
          orderNumber: order.orderNumber,
          customerName: fullName,
          customerPhone: cleanPhone,
          deviceName: deviceName,
          estimatedPrice: estimatedPrice,
          pickupDate: pickupDate,
          pickupTimeSlot: pickupTimeSlot,
          address: fullAddress,
        }).catch((err) => logger.error("WhatsApp notification error:", err));

        // Meta CAPI server events
        Promise.allSettled([
          sendServerLeadEvent({
            orderNumber: order.orderNumber,
            value: estimatedPrice,
            contentName: deviceName,
            userData: capiUserData,
          }),
          sendServerScheduleEvent({
            orderNumber: order.orderNumber,
            value: estimatedPrice,
            contentName: deviceName,
            pickupDate: pickupDate,
            pickupTimeSlot: pickupTimeSlot,
            userData: capiUserData,
          }),
          sendServerPickupBookedEvent({
            orderNumber: order.orderNumber,
            value: estimatedPrice,
            contentName: deviceName,
            contentCategory: (quote as any)?.variant?.model?.category || "MOBILE",
            pincode: pincode,
            city: city,
            pickupDate: pickupDate,
            pickupTimeSlot: pickupTimeSlot,
            userData: capiUserData,
          }),
        ]).catch(() => {});
      } catch (bgErr) {
        logger.error("[ORDER ASYNC BG ERROR]", bgErr);
      }
    })();

    logger.info(`[ORDER SUCCESS] Created Order #${order.orderNumber} for ${fullName}`);

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: fullName,
        customerPhone: cleanPhone,
        deviceName: deviceName,
        pincode: pincode,
        addressSummary: fullAddress,
        pickupDate: pickupDate,
        pickupTimeSlot: pickupTimeSlot,
        estimatedPrice: estimatedPrice,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    logger.error("[ORDER API ERROR]", { message: err.message, stack: err.stack });
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create order. Please try again.",
      },
      { status: 400 }
    );
  }
}
