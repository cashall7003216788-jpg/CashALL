import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/services/whatsapp.service";
import { z } from "zod";

const syncOrderSchema = z.object({
  orderNumber: z.string(),
  customerName: z.any().optional(),
  customerPhone: z.any().optional(),
  deviceName: z.any().optional(),
  addressSummary: z.any().optional(),
  pincode: z.any().optional(),
  pickupDate: z.any().optional(),
  pickupTimeSlot: z.any().optional(),
  estimatedPrice: z.any().optional(),
  revisedPrice: z.any().optional(),
  status: z.any().optional(),
});

const bulkSyncSchema = z.object({
  orders: z.array(syncOrderSchema),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const body = await req.json();
  const validation = bulkSyncSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error.issues[0].message },
      { status: 400 }
    );
  }

  let syncedCount = 0;

  for (const item of validation.data.orders) {
    if (!item.orderNumber) continue;

    // Check if order already exists in DB
    const existing = await prisma.order.findFirst({
      where: { orderNumber: item.orderNumber },
    });

    if (existing) continue; // Already in DB, no need to re-sync

    const rawPhone = item.customerPhone ? String(item.customerPhone) : "7003216788";
    const phone = rawPhone.replace(/\D/g, "").slice(-10) || "7003216788";
    const name = item.customerName ? String(item.customerName) : "Customer";
    
    const rawPrice = item.estimatedPrice ?? item.revisedPrice ?? 32500;
    const price = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice)) || 32500;
    
    const deviceName = item.deviceName ? String(item.deviceName) : "Customer Mobile Device";
    const pincodeStr = item.pincode ? String(item.pincode) : "700001";
    const pickupDateStr = item.pickupDate ? String(item.pickupDate) : "Tomorrow";
    const pickupSlotStr = item.pickupTimeSlot ? String(item.pickupTimeSlot) : "10 AM - 1 PM";
    const addressStr = item.addressSummary ? String(item.addressSummary) : "Doorstep Address, Howrah, West Bengal";

    // 1. Find or create User
    let user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          name,
          firebaseUid: `uid_${phone}_sync_${Date.now()}`,
          role: "CUSTOMER",
        },
      });
    }

    // 2. Find or create variant & quote
    let variant = await prisma.deviceVariant.findFirst({
      include: { model: { include: { brand: true } } },
    });

    if (!variant) {
      let brand = await prisma.brand.findFirst();
      if (!brand) {
        brand = await prisma.brand.create({
          data: { name: "CashALL", slug: "cashall", category: "MOBILE" },
        });
      }
      let model = await prisma.deviceModel.findFirst({ where: { brandId: brand.id } });
      if (!model) {
        model = await prisma.deviceModel.create({
          data: { brandId: brand.id, name: "Mobile Device", slug: "mobile-device", category: "MOBILE", basePrice: price },
        });
      }
      variant = await prisma.deviceVariant.create({
        data: { modelId: model.id, storage: "128 GB", basePrice: price },
        include: { model: { include: { brand: true } } },
      });
    }

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `Q${Math.floor(10000 + Math.random() * 90000)}`,
        variantId: variant.id,
        selectedAnswersJson: JSON.stringify({ device: deviceName }),
        basePrice: price,
        totalDeductions: 0,
        estimatedPrice: price,
        breakdownJson: JSON.stringify({
          deviceName: deviceName,
          basePrice: price,
          estimatedPrice: price,
          summary: "Synced order valuation",
        }),
        status: "ORDERED",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 3. Create address
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: name,
        phone: phone,
        house: addressStr,
        street: "Service Area",
        area: "West Bengal",
        city: "Kolkata",
        state: "West Bengal",
        pincode: pincodeStr,
      },
    });

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber: item.orderNumber,
        userId: user.id,
        quoteId: quote.id,
        addressId: address.id,
        pickupDate: pickupDateStr,
        pickupTimeSlot: pickupSlotStr,
        status: (item.status as any) || "PICKUP_SCHEDULED",
        finalPrice: price,
      },
    });

    // 5. Create Pickup
    await prisma.pickup.create({
      data: {
        orderId: order.id,
        date: pickupDateStr,
        timeSlot: pickupSlotStr,
        status: "SCHEDULED",
        notes: "Order synced to database automatically.",
      },
    });

    // 6. WhatsApp Notification
    WhatsAppService.notifyNewOrder({
      orderNumber: order.orderNumber,
      customerName: name,
      customerPhone: phone,
      deviceName: deviceName,
      estimatedPrice: price,
      pickupDate: pickupDateStr,
      pickupTimeSlot: pickupSlotStr,
      address: addressStr,
    }).catch((err) => console.warn("WhatsApp notify on sync error:", err));

    syncedCount++;
  }

  return NextResponse.json({
    success: true,
    message: `Successfully synced ${syncedCount} order(s) to database.`,
    syncedCount,
  });
});
