import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const TEST_PHONE_BLACKLIST = new Set([
  "7604092333",
  "6289477287",
  "9999999999",
  "1234567890",
  "8888888888",
  "7777777777",
  "0000000000",
  "1111111111",
]);

const TEST_NAME_KEYWORDS = ["test", "fake", "demo", "sample", "dummy"];

function checkIsRealOrder(customerPhone: string, customerName: string, orderNumber: string): boolean {
  const cleanPhone = (customerPhone || "").replace(/\D/g, "").slice(-10);
  if (TEST_PHONE_BLACKLIST.has(cleanPhone)) {
    return false;
  }
  const cleanName = (customerName || "").toLowerCase().trim();
  for (const kw of TEST_NAME_KEYWORDS) {
    if (cleanName.includes(kw)) {
      return false;
    }
  }
  if (orderNumber.toUpperCase().includes("TEST")) {
    return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const latestOrder = await prisma.order.findFirst({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        pickupDate: true,
        pickupTimeSlot: true,
        finalPrice: true,
        user: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
        address: {
          select: {
            street: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
        quote: {
          select: {
            estimatedPrice: true,
            variant: {
              select: {
                ram: true,
                storage: true,
                model: {
                  select: {
                    name: true,
                    brand: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!latestOrder) {
      return NextResponse.json({ success: true, order: null });
    }

    const customerPhone = latestOrder.user?.phone || "";
    const customerName = latestOrder.user?.name || "Customer";
    const brandName = latestOrder.quote?.variant?.model?.brand?.name || "";
    const modelName = latestOrder.quote?.variant?.model?.name || "";
    const ram = latestOrder.quote?.variant?.ram || "";
    const storage = latestOrder.quote?.variant?.storage || "";
    const deviceName = `${brandName} ${modelName} ${ram ? `${ram}/` : ""}${storage}`.trim() || "Mobile Device";

    const fullAddress = [
      latestOrder.address?.street,
      latestOrder.address?.city,
      latestOrder.address?.state,
      latestOrder.address?.pincode,
    ].filter(Boolean).join(", ");

    const isRealOrder = checkIsRealOrder(customerPhone, customerName, latestOrder.orderNumber);

    return NextResponse.json({
      success: true,
      order: {
        id: latestOrder.id,
        orderNumber: latestOrder.orderNumber,
        status: latestOrder.status,
        createdAt: latestOrder.createdAt,
        pickupDate: latestOrder.pickupDate,
        pickupTimeSlot: latestOrder.pickupTimeSlot,
        quotedPrice: latestOrder.quote?.estimatedPrice || latestOrder.finalPrice || 0,
        customerName,
        customerPhone,
        customerEmail: latestOrder.user?.email || null,
        deviceName,
        location: fullAddress || "Doorstep Address Not Specified",
        pincode: latestOrder.address?.pincode || "",
        isRealOrder,
      },
    });
  } catch (error: any) {
    console.error("Latest order check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch latest order" },
      { status: 500 }
    );
  }
}
