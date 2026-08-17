import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { prisma } from "@/lib/db";
import { z } from "zod";

const syncOrderSchema = z.object({
  orderNumber: z.string(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  deviceName: z.string().optional(),
  addressSummary: z.string().optional(),
  pincode: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTimeSlot: z.string().optional(),
  estimatedPrice: z.number().optional(),
  status: z.string().optional(),
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

    const phone = (item.customerPhone || "7003216788").replace(/\D/g, "").slice(-10) || "7003216788";
    const name = item.customerName || "Customer";
    const price = item.estimatedPrice || 32500;
    const deviceName = item.deviceName || "Customer Mobile Device";

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

    // 2. Find default variant & create quote
    const variant = await prisma.deviceVariant.findFirst({
      include: { model: { include: { brand: true } } },
    });

    if (!variant) continue;

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
        house: item.addressSummary || "Customer Address",
        street: "Service Area",
        area: "West Bengal",
        city: "Kolkata",
        state: "West Bengal",
        pincode: item.pincode || "700001",
      },
    });

    // 4. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber: item.orderNumber,
        userId: user.id,
        quoteId: quote.id,
        addressId: address.id,
        pickupDate: item.pickupDate || "Tomorrow",
        pickupTimeSlot: item.pickupTimeSlot || "10 AM - 1 PM",
        status: (item.status as any) || "PICKUP_SCHEDULED",
        finalPrice: price,
      },
    });

    // 5. Create Pickup
    await prisma.pickup.create({
      data: {
        orderId: order.id,
        date: item.pickupDate || "Tomorrow",
        timeSlot: item.pickupTimeSlot || "10 AM - 1 PM",
        status: "SCHEDULED",
        notes: "Order synced to database automatically.",
      },
    });

    syncedCount++;
  }

  return NextResponse.json({
    success: true,
    message: `Successfully synced ${syncedCount} order(s) to database.`,
    syncedCount,
  });
});
