import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/services/whatsapp.service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const createOrderSchema = z.object({
  quoteId: z.string().optional(),
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  house: z.string().min(1, "House details are required"),
  street: z.string().min(1, "Street is required"),
  area: z.string().min(1, "Area is required"),
  landmark: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().min(6, "PIN Code must be 6 digits"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTimeSlot: z.string().min(1, "Pickup time slot is required"),
  deviceName: z.string().optional(),
  estimatedPrice: z.number().optional(),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  const data = validation.data;
  const cleanPhone = data.phone.replace(/\D/g, "");
  const city = data.city || "Kolkata";
  const state = data.state || "West Bengal";

  // 1. Find or Create User
  let user = await prisma.user.findFirst({
    where: { phone: cleanPhone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: cleanPhone,
        name: data.fullName,
        firebaseUid: `uid_${cleanPhone}_${Date.now()}`,
        role: "CUSTOMER",
      },
    });
  } else if (data.fullName && user.name !== data.fullName) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: data.fullName },
    });
  }

  // 2. Find or Create Quote
  let quote = null;
  if (data.quoteId) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.quoteId);
    try {
      if (isUuid) {
        quote = await prisma.quote.findUnique({
          where: { id: data.quoteId },
        });
      } else {
        quote = await prisma.quote.findFirst({
          where: { quoteNumber: data.quoteId },
        });
      }
    } catch (e) {
      console.warn("Quote lookup by ID failed, will create new quote:", e);
    }
  }

  if (!quote) {
    const defaultVariant = await prisma.deviceVariant.findFirst({
      include: { model: { include: { brand: true } } },
    });

    if (defaultVariant) {
      const price = data.estimatedPrice || 32500;
      quote = await prisma.quote.create({
        data: {
          quoteNumber: `Q${Math.floor(10000 + Math.random() * 90000)}`,
          variantId: defaultVariant.id,
          selectedAnswersJson: JSON.stringify({ device: data.deviceName || "Customer Mobile Device" }),
          basePrice: price,
          totalDeductions: 0,
          estimatedPrice: price,
          breakdownJson: JSON.stringify({
            deviceName: data.deviceName || "Customer Mobile Device",
            basePrice: price,
            estimatedPrice: price,
            summary: "Customer declared valuation",
          }),
          status: "ORDERED",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // 3. Create Address Record
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      fullName: data.fullName,
      phone: cleanPhone,
      house: data.house,
      street: data.street,
      area: data.area,
      landmark: data.landmark || null,
      city: city,
      state: state,
      pincode: data.pincode,
    },
  });

  // 4. Create Order
  const orderNumber = `CA${Math.floor(10000 + Math.random() * 90000)}`;
  const orderDataPayload: any = {
    orderNumber,
    userId: user.id,
    addressId: address.id,
    pickupDate: data.pickupDate,
    pickupTimeSlot: data.pickupTimeSlot,
    status: "PICKUP_SCHEDULED",
    finalPrice: data.estimatedPrice || (quote ? quote.estimatedPrice : 0),
  };
  if (quote) {
    orderDataPayload.quoteId = quote.id;
  }

  const order = await prisma.order.create({
    data: orderDataPayload,
  });

  // 5. Create Pickup Schedule
  await prisma.pickup.create({
    data: {
      orderId: order.id,
      date: data.pickupDate,
      timeSlot: data.pickupTimeSlot,
      status: "SCHEDULED",
      notes: "Doorstep pickup order confirmed.",
    },
  });

  const fullAddress = `${data.house}, ${data.street}, ${data.area}${data.landmark ? ", " + data.landmark : ""}, ${state} - ${data.pincode}`;
  const device = data.deviceName || "Customer Mobile Device";

  // 6. Trigger WhatsApp Notification to Admin (7003216788)
  WhatsAppService.notifyNewOrder({
    orderNumber: order.orderNumber,
    customerName: data.fullName,
    customerPhone: cleanPhone,
    deviceName: device,
    estimatedPrice: order.finalPrice ?? 0,
    pickupDate: order.pickupDate,
    pickupTimeSlot: order.pickupTimeSlot,
    address: fullAddress,
  }).catch((err) => logger.error("WhatsApp notification error:", err));

  return NextResponse.json({
    success: true,
    data: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: data.fullName,
      customerPhone: cleanPhone,
      deviceName: device,
      pincode: data.pincode,
      addressSummary: fullAddress,
      pickupDate: data.pickupDate,
      pickupTimeSlot: data.pickupTimeSlot,
      estimatedPrice: order.finalPrice,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    },
  });
});
