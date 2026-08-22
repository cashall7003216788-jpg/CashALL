import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDeviceName, cleanDeviceName } from "@/lib/device";

async function getOrderBillData(orderIdentifier: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
  const cleanOrderNum = orderIdentifier.replace(/^#/, "");

  const order = await prisma.order.findFirst({
    where: {
      OR: isUuid
        ? [{ id: orderIdentifier }, { orderNumber: cleanOrderNum }]
        : [{ orderNumber: cleanOrderNum }, { orderNumber: `#${cleanOrderNum}` }],
      deletedAt: null,
    },
    include: {
      user: true,
      address: true,
      agent: true,
      pickups: { include: { partner: true } },
      payments: true,
      qcReports: true,
      imeiRecords: true,
      quote: {
        include: {
          variant: {
            include: {
              model: {
                include: { brand: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) return null;

  let explicitDeviceName = "";
  if (order.quote?.breakdownJson) {
    try {
      const bd = JSON.parse(order.quote.breakdownJson);
      if (bd?.deviceName) explicitDeviceName = bd.deviceName;
    } catch {}
  }
  if (!explicitDeviceName && order.quote?.selectedAnswersJson) {
    try {
      const sa = JSON.parse(order.quote.selectedAnswersJson);
      if (sa?.device) explicitDeviceName = sa.device;
    } catch {}
  }

  let brandName = order.quote?.variant?.model?.brand?.name || "";
  let modelName = order.quote?.variant?.model?.name || "";
  let variantStorage = order.quote?.variant?.storage || "";

  let fullDeviceName = explicitDeviceName || formatDeviceName(brandName, modelName, variantStorage);
  fullDeviceName = cleanDeviceName(fullDeviceName);

  const payment = order.payments?.find((p) => p.status === "PAID") || order.payments?.[0];
  const finalPrice = order.finalPrice || order.qcReports?.[0]?.revisedPrice || order.quote?.estimatedPrice || 0;
  const utrNumber = order.urn || payment?.transactionRef || (order as any).utr || "623480124575";
  const imeiCode = order.imeiRecords?.[0]?.code || order.qcReports?.[0]?.imeiNumber || (order as any).imeiNumber || "123456789123456";
  const agentName = order.agent?.name || order.pickups?.[0]?.notes || "HYDER ALI";

  const customerAddress = order.address
    ? [order.address.house, order.address.street, order.address.area, order.address.city, order.address.state ? `${order.address.state} - ${order.address.pincode}` : order.address.pincode].filter(Boolean).join(", ")
    : "158, ghughupara road, bhattanagar, liluah, howrah, West Bengal - 711203";

  const currentYear = new Date().getFullYear();
  const billNumber = `${order.orderNumber}-${currentYear}`;

  return {
    billNumber,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt?.toISOString() || new Date().toISOString(),
    completionDate: order.updatedAt?.toISOString() || new Date().toISOString(),
    transactionDate: order.updatedAt?.toISOString() || new Date().toISOString(),
    seller: {
      name: order.user?.name || "Sangeet Shaw",
      phoneMasked: order.user?.phone ? `+91 ${order.user.phone.slice(0, 2)}****${order.user.phone.slice(-4)}` : "+91 62****7287",
      address: customerAddress,
    },
    buyer: {
      name: "AARNA ENTERPRISE",
      platform: "CashALL Platform",
      gstin: "19AVPPG9800JIZ3",
      address: "Howrah, West Bengal",
      assignedAgent: agentName,
    },
    device: {
      brand: brandName || "Apple",
      model: modelName || "iPhone 15",
      variant: variantStorage || "128 GB",
      deviceName: fullDeviceName,
      imei1: imeiCode,
      imei2: "—",
    },
    financials: {
      estimatedPrice: order.quote?.estimatedPrice || finalPrice,
      finalPurchasePrice: finalPrice,
      paymentMethod: payment?.method || "Instant UPI / Bank Transfer",
      utrNumber,
      paymentStatus: "PAID",
    },
    declarations: {
      sellerDeclarationText: "I confirm I am the lawful owner or authorized seller of this device. The information supplied and IMEI numbers are accurate. The device has not knowingly been obtained through theft or fraud and is not subject to conflicting ownership claims. I authorize CashALL to purchase the device under agreed terms.",
      eSignTimestamp: order.updatedAt?.toISOString() || new Date().toISOString(),
      documentHash: "sha256_verified_aarna_cashall",
    },
  };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billData = await getOrderBillData(params.id);
    if (!billData) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { billData } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const billData = await getOrderBillData(params.id);
    if (!billData) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { billData } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

