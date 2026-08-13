import { NextRequest, NextResponse } from "next/server";
import { apiWrapper } from "@/lib/utils/api-wrapper";
import { verifyAuthToken, requireRole } from "@/lib/middlewares/auth";
import { prisma } from "@/lib/db";

export const GET = apiWrapper(async (req: NextRequest) => {
  const decodedUser = await verifyAuthToken(req);
  requireRole(["PARTNER", "ADMIN", "SUPER_ADMIN"], decodedUser.role);

  const { searchParams } = new URL(req.url);
  const paramPhone = searchParams.get("phone");
  const targetPhone = (paramPhone || decodedUser.phone || "").replace(/\D/g, "");

  // Find partner profile associated with phone number
  const partner = targetPhone
    ? await prisma.partner.findFirst({
        where: { phone: targetPhone },
      })
    : null;

  // Query pickups assigned to this partner or return all assigned pickups if partner filter not specified
  const pickups = await prisma.pickup.findMany({
    where: partner ? { partnerId: partner.id } : {},
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, phone: true } },
          address: true,
          quote: {
            include: {
              variant: {
                include: { model: { include: { brand: true } } },
              },
            },
          },
          qcReports: true,
          identityVerifications: true,
          imeiVerifications: true,
          payments: true,
          signatures: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const orders = pickups.map((p) => ({
    id: p.order.id,
    orderNumber: p.order.orderNumber,
    customerName: p.order.user.name || p.order.address?.fullName || "CashALL Customer",
    customerPhone: p.order.address?.phone || p.order.user.phone,
    addressText: p.order.address
      ? `${p.order.address.house}, ${p.order.address.street}, ${p.order.address.area}, ${p.order.address.city} - ${p.order.address.pincode}`
      : "—",
    pickupDate: p.order.pickupDate,
    pickupTimeSlot: p.order.pickupTimeSlot,
    deviceName: `${p.order.quote.variant.model.brand.name} ${p.order.quote.variant.model.name}`,
    storage: p.order.quote.variant.storage,
    estimatedPrice: p.order.quote.estimatedPrice,
    finalPrice: p.order.finalPrice,
    status: p.order.status,
    identityStatus: p.order.identityVerifications[0]?.status || "PENDING",
    imeiStatus: p.order.imeiVerifications[0]?.status || "PENDING",
    hasQcReport: p.order.qcReports.length > 0,
    paymentStatus: p.order.payments[0]?.status || "PENDING",
    isSigned: p.order.signatures.some((s) => s.status === "ESIGNED"),
  }));

  return NextResponse.json({
    success: true,
    orders,
  });
});
