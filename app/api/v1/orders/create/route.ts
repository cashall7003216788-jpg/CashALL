import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/utils/AppError";
import { MapsService } from "@/lib/services/maps.service";
import { NotificationHelper } from "@/lib/services/notification.helper";
import { EmailService } from "@/lib/services/email.service";
import { WhatsAppService } from "@/lib/services/whatsapp.service";
import { logger } from "@/lib/utils/logger";
import { z } from "zod";

const createOrderSchema = z.object({
  quoteId: z.string().min(1, "quoteId is required"),
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  house: z.string().min(1, "House details are required"),
  street: z.string().min(1, "Street is required"),
  area: z.string().min(1, "Area is required"),
  landmark: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().length(6, "PIN Code must be 6 digits"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupTimeSlot: z.string().min(1, "Pickup time slot is required"),
});

export const POST = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);

  const body = await req.json();
  const validation = createOrderSchema.safeParse(body);

  if (!validation.success) {
    throw new AppError(validation.error.issues[0].message, 400);
  }

  const data = validation.data;

  // 1. Fetch Quote
  const quote = await prisma.quote.findUnique({
    where: { id: data.quoteId },
  });

  if (!quote) {
    throw new AppError("Invalid or expired quote.", 404);
  }

  // Update quote status to ORDERED
  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "ORDERED" },
  });

  // 2. Geocode Address via MapsService
  const addressText = `${data.house}, ${data.street}, ${data.area}, ${data.landmark ? data.landmark + ", " : ""}${data.city}, ${data.state} - ${data.pincode}`;
  const coordinates = await MapsService.geocodeAddress(addressText);

  // 3. Create Address Record
  const address = await prisma.address.create({
    data: {
      userId: decodedUser.uid,
      fullName: data.fullName,
      phone: data.phone,
      house: data.house,
      street: data.street,
      area: data.area,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    },
  });

  // 4. Create Order
  const orderNumber = `CA${Math.floor(10000 + Math.random() * 90000)}`;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      quoteId: quote.id,
      userId: decodedUser.uid,
      addressId: address.id,
      pickupDate: data.pickupDate,
      pickupTimeSlot: data.pickupTimeSlot,
      status: "PICKUP_SCHEDULED",
      finalPrice: quote.estimatedPrice,
    },
    include: {
      quote: {
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
      },
      address: true,
    },
  });

  // 5. Create Pickup schedule record
  await prisma.pickup.create({
    data: {
      orderId: order.id,
      date: data.pickupDate,
      timeSlot: data.pickupTimeSlot,
      status: "SCHEDULED",
      notes: "System scheduled doorstep pickup.",
    },
  });

  // Trigger push notification
  await NotificationHelper.triggerMilestoneNotification(
    order.id,
    decodedUser.uid,
    "PICKUP_SCHEDULED"
  );

  // Send WhatsApp alert to admin
  const deviceName = `${order.quote.variant.model.brand.name} ${order.quote.variant.model.name}`;
  const addressText = `${data.house}, ${data.street}, ${data.area}, ${data.city}, ${data.state} - ${data.pincode}`;
  WhatsAppService.notifyNewOrder({
    orderNumber: order.orderNumber,
    customerName: data.fullName,
    customerPhone: data.phone,
    deviceName,
    estimatedPrice: order.finalPrice ?? 0,
    pickupDate: order.pickupDate,
    pickupTimeSlot: order.pickupTimeSlot,
    address: addressText,
  }).catch((err) => logger.error("Failed to send WhatsApp notification:", err));

  // Send confirmation email
  if (decodedUser.email) {
    EmailService.sendEmail(
      decodedUser.email,
      `Order Confirmed: #${order.orderNumber} 🎉`,
      EmailService.compileOrderTemplate(order.orderNumber, deviceName, order.pickupDate, order.pickupTimeSlot)
    ).catch((err) => logger.error("Failed to send order email:", err));
  }

  return NextResponse.json({
    success: true,
    data: order,
  });
});
