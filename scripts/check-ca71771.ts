import { prisma } from "../lib/db";
import { cleanDeviceName, formatDeviceName } from "../lib/device";

async function verifyOrder() {
  const order = await prisma.order.findUnique({
    where: { orderNumber: "CA71771" },
    include: {
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
      user: true,
      address: true,
      payments: true,
      qcReports: true,
    },
  });

  if (!order) {
    console.log("Order CA71771 not found.");
    return;
  }

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
      if (sa?.device && sa.device !== "Customer Mobile Device") explicitDeviceName = sa.device;
    } catch {}
  }

  const brandName = order.quote?.variant?.model?.brand?.name || "";
  const modelName = order.quote?.variant?.model?.name || "";
  const storage = order.quote?.variant?.storage || "";

  const fullDeviceName = explicitDeviceName || formatDeviceName(brandName, modelName, storage);
  const resolvedName = cleanDeviceName(fullDeviceName);

  console.log("\n=================== ORDER CA71771 AUDIT ===================");
  console.log("Order Number        :", order.orderNumber);
  console.log("Customer Name       :", order.user?.name);
  console.log("Customer Email      :", order.user?.email);
  console.log("Customer Phone      :", order.user?.phone);
  console.log("Resolved Device Name:", resolvedName);
  console.log("Final Price Paid    : ₹" + (order.finalPrice || 0).toLocaleString("en-IN"));
  console.log("Payment Status      :", order.payments?.[0]?.status);
  console.log("Status              :", order.status);
  console.log("==========================================================\n");
}

verifyOrder()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
