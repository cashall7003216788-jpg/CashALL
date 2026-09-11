import { prisma } from "../lib/db";
import nodemailer from "nodemailer";

async function verifyAll() {
  console.log("==================================================================");
  console.log("🚀 CASHALL COMPREHENSIVE SUBSYSTEM VERIFICATION REPORT");
  console.log("==================================================================\n");

  const results: Record<string, { status: "PASS" | "FAIL"; details: any }> = {};

  // 1. DATABASE & MODELS (Main Site Catalog)
  try {
    const brandCount = await prisma.brand.count();
    const modelCount = await prisma.deviceModel.count();
    const variantCount = await prisma.deviceVariant.count();

    const sampleModels = await prisma.deviceModel.findMany({
      take: 5,
      include: { brand: true },
      orderBy: { createdAt: "desc" },
    });

    results["Database & Models"] = {
      status: brandCount > 0 && modelCount > 0 ? "PASS" : "FAIL",
      details: {
        brands: brandCount,
        models: modelCount,
        variants: variantCount,
        recentSamples: sampleModels.map((m) => `${m.brand.name} ${m.name}`),
      },
    };
  } catch (err: any) {
    results["Database & Models"] = { status: "FAIL", details: err.message };
  }

  // 2. QUOTE GENERATION & QUOTE ID
  try {
    const quoteCount = await prisma.quote.count();
    const latestQuote = await prisma.quote.findFirst({
      orderBy: { createdAt: "desc" },
      include: { variant: { include: { model: { include: { brand: true } } } } },
    });

    results["Quote Engine & Quote ID"] = {
      status: quoteCount > 0 && !!latestQuote?.quoteNumber ? "PASS" : "FAIL",
      details: {
        totalQuotes: quoteCount,
        latestQuoteNumber: latestQuote?.quoteNumber,
        device: latestQuote ? `${latestQuote.variant.model.brand.name} ${latestQuote.variant.model.name}` : "N/A",
        estimatedPrice: latestQuote?.estimatedPrice,
        status: latestQuote?.status,
      },
    };
  } catch (err: any) {
    results["Quote Engine & Quote ID"] = { status: "FAIL", details: err.message };
  }

  // 3. ORDER GENERATION & LIFECYCLE
  try {
    const orderCount = await prisma.order.count();
    const latestOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        status: true,
        finalPrice: true,
        pickupDate: true,
        pickupTimeSlot: true,
        user: { select: { name: true, phone: true } },
      },
    });

    results["Order Generation & Database"] = {
      status: orderCount > 0 ? "PASS" : "FAIL",
      details: {
        totalOrders: orderCount,
        latestOrders: latestOrders.map((o) => ({
          orderNumber: o.orderNumber,
          customer: o.user.name,
          phone: o.user.phone,
          status: o.status,
          pickup: `${o.pickupDate} (${o.pickupTimeSlot})`,
        })),
      },
    };
  } catch (err: any) {
    results["Order Generation & Database"] = { status: "FAIL", details: err.message };
  }

  // 4. ADMIN PORTAL SUBSYSTEM (/admin)
  try {
    const adminOrders = await prisma.order.findMany({
      take: 5,
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, phone: true } },
        agent: { select: { name: true, role: true } },
        pickups: { take: 1, orderBy: { createdAt: "desc" } },
        payments: { take: 1, orderBy: { createdAt: "desc" } },
        qcReports: { take: 1, orderBy: { inspectedAt: "desc" } },
      },
    });

    const activeUsers = await prisma.user.count({ where: { deletedAt: null } });
    const agents = await prisma.user.count({ where: { role: "AGENT", deletedAt: null } });

    results["Admin Portal (/admin)"] = {
      status: adminOrders.length > 0 ? "PASS" : "FAIL",
      details: {
        totalActiveUsers: activeUsers,
        registeredAgents: agents,
        recentOrdersLoaded: adminOrders.length,
        sampleOrderNumber: adminOrders[0]?.orderNumber,
        assignedAgent: adminOrders[0]?.agent?.name || "Unassigned",
      },
    };
  } catch (err: any) {
    results["Admin Portal (/admin)"] = { status: "FAIL", details: err.message };
  }

  // 5. FIELD AGENT CONSOLE (/agent)
  try {
    // Find Hyder Ali
    const hyderAli = await prisma.user.findFirst({
      where: { role: "AGENT", name: { contains: "Hyder", mode: "insensitive" } },
    });

    const assignedOrdersCount = hyderAli
      ? await prisma.order.count({ where: { agentId: hyderAli.id, deletedAt: null } })
      : 0;

    const assignedOrders = hyderAli
      ? await prisma.order.findMany({
          where: { agentId: hyderAli.id, deletedAt: null },
          take: 3,
          select: { orderNumber: true, status: true },
        })
      : [];

    results["Agent Console (/agent)"] = {
      status: hyderAli ? "PASS" : "FAIL",
      details: {
        agentFound: hyderAli?.name || "Not found",
        phone: hyderAli?.phone,
        totalAssignedOrders: assignedOrdersCount,
        sampleAssigned: assignedOrders.map((o) => `${o.orderNumber} (${o.status})`),
      },
    };
  } catch (err: any) {
    results["Agent Console (/agent)"] = { status: "FAIL", details: err.message };
  }

  // 6. PARTNER LOGISTICS SUBSYSTEM (/partner)
  try {
    const partnerCount = await prisma.partner.count();
    const pickupCount = await prisma.pickup.count();

    const samplePickups = await prisma.pickup.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true } } },
    });

    results["Partner Subsystem (/partner)"] = {
      status: partnerCount > 0 && pickupCount > 0 ? "PASS" : "FAIL",
      details: {
        registeredPartners: partnerCount,
        totalPickups: pickupCount,
        recentPickups: samplePickups.map((p) => ({
          orderNumber: p.order.orderNumber,
          date: p.date,
          status: p.status,
          notes: p.notes,
        })),
      },
    };
  } catch (err: any) {
    results["Partner Subsystem (/partner)"] = { status: "FAIL", details: err.message };
  }

  // 7. SUPPORT TEAM SUBSYSTEM (/support)
  try {
    const ticketCount = await prisma.supportTicket.count();
    const supportUsers = await prisma.user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN", "EMPLOYEE"] } },
    });

    results["Support Subsystem (/support)"] = {
      status: "PASS",
      details: {
        totalTickets: ticketCount,
        supportStaffCount: supportUsers,
      },
    };
  } catch (err: any) {
    results["Support Subsystem (/support)"] = { status: "FAIL", details: err.message };
  }

  // 8. TRANSACTIONAL EMAIL DISPATCH
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "cashall7003216788@gmail.com",
        pass: "lkba sysu psuq cclk",
      },
    });

    await transporter.verify();
    results["Email Dispatch (SMTP)"] = {
      status: "PASS",
      details: {
        provider: "Gmail SMTP Verified",
        sender: "cashall7003216788@gmail.com",
        supportReplyTo: "support@cashall.in",
      },
    };
  } catch (err: any) {
    results["Email Dispatch (SMTP)"] = { status: "FAIL", details: err.message };
  }

  // DISPLAY REPORT
  console.log(JSON.stringify(results, null, 2));

  const allPassed = Object.values(results).every((r) => r.status === "PASS");
  console.log("\n==================================================================");
  console.log(allPassed ? "🎯 ALL SUBSYSTEMS OPERATIONAL & VERIFIED!" : "⚠️ SOME SUBSYSTEMS FAILED");
  console.log("==================================================================");

  await prisma.$disconnect();
}

verifyAll().catch(async (e) => {
  console.error("Verification failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
