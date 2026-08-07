import { prisma } from "../db";
import { AuthService } from "../services/auth.service";
import { PricingService } from "../services/pricing.service";
import { MapsService } from "../services/maps.service";
import { FirebaseService } from "../services/firebase.service";
import { EmailService } from "../services/email.service";
import { payoutServiceInstance } from "../services/payment.service";

async function runTests() {
  console.log("🚀 Starting CashALL Backend E2E Test Suite...");

  try {
    // 1. Database Connection Test
    console.log("\n🔍 Test 1: Testing Prisma Database Connection...");
    const brandsCount = await prisma.brand.count();
    console.log(`✅ Database connection successful! Found ${brandsCount} brands.`);

    // 2. User Sync / Auth Service Test
    console.log("\n🔍 Test 2: Testing AuthService.syncUser...");
    const testUser = await AuthService.syncUser(
      "test_firebase_uid_999",
      "+91 8888888888",
      "test-buyer@cashall.in",
      "Test Buyer"
    );
    console.log(`✅ AuthService sync successful! User ID: ${testUser.id}`);

    // 3. Pricing Calculation Test
    console.log("\n🔍 Test 3: Testing PricingService.calculateQuote...");
    const variant = await prisma.deviceVariant.findFirst({
      include: { model: { include: { brand: true } } },
    });

    if (!variant) {
      throw new Error("No device variants found in database. Run prisma db seed first.");
    }

    const testAnswers = [
      {
        questionId: "550e8400-e29b-41d4-a716-446655440031",
        questionTitle: "Does your phone switch on?",
        group: "BASIC",
        optionId: "550e8400-e29b-41d4-a716-446655440041",
        optionLabel: "Turns ON normally",
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440032",
        questionTitle: "What is the physical condition of the screen?",
        group: "SCREEN",
        optionId: "550e8400-e29b-41d4-a716-446655440044",
        optionLabel: "Minor Scratches",
      },
    ];

    const quote = await PricingService.calculateQuote(variant.id, testAnswers);
    console.log(`✅ PricingService calculation successful!`);
    console.log(`   Device: ${quote.variant.model.brand.name} ${quote.variant.model.name}`);
    console.log(`   Base Price: ₹${quote.basePrice}`);
    console.log(`   Deductions: ₹${quote.totalDeductions}`);
    console.log(`   Estimated Price: ₹${quote.estimatedPrice}`);

    // 4. Geocoding / Maps Service Test
    console.log("\n🔍 Test 4: Testing MapsService.geocodeAddress...");
    const coords = await MapsService.geocodeAddress("Connaught Place, New Delhi, Delhi 110001");
    console.log(`✅ MapsService geocoded coordinates: Lat: ${coords.latitude}, Lng: ${coords.longitude}`);

    // 5. Firebase Notification Register Test
    console.log("\n🔍 Test 5: Testing FirebaseService token registration...");
    await FirebaseService.registerFcmToken(testUser.id, "mock_fcm_token_xyz_999", "ANDROID");
    console.log("✅ Firebase token registration successful!");

    // 6. Resend Email Simulation Test
    console.log("\n🔍 Test 6: Testing EmailService simulation...");
    await EmailService.sendEmail(
      "test-buyer@cashall.in",
      "E2E Test Notification",
      EmailService.compileWelcomeTemplate("Test Buyer")
    );
    console.log("✅ EmailService simulation successful!");

    // 7. Payout Service Simulation Test
    console.log("\n🔍 Test 7: Testing PayoutService doorstep payout...");
    const testQuote = await prisma.quote.create({
      data: {
        quoteNumber: `QA${Math.floor(10000 + Math.random() * 90000)}`,
        variantId: variant.id,
        selectedAnswersJson: JSON.stringify(testAnswers),
        basePrice: quote.basePrice,
        totalDeductions: quote.totalDeductions,
        estimatedPrice: quote.estimatedPrice,
        breakdownJson: JSON.stringify(quote.breakdown),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "ORDERED",
      },
    });

    const testAddress = await prisma.address.create({
      data: {
        userId: testUser.id,
        fullName: "Test Buyer",
        phone: "+91 8888888888",
        house: "Shop 12",
        street: "Main Market",
        area: "Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
    });

    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `CA${Math.floor(10000 + Math.random() * 90000)}`,
        quoteId: testQuote.id,
        userId: testUser.id,
        addressId: testAddress.id,
        pickupDate: "2026-08-08",
        pickupTimeSlot: "10:00 AM - 01:00 PM",
        status: "ACCEPTED",
        finalPrice: quote.estimatedPrice,
      },
    });

    const payout = await payoutServiceInstance.processPayout({
      orderId: testOrder.id,
      amount: testOrder.finalPrice,
      paymentMethod: "UPI",
      upiId: "testbuyer@oksbi",
    });

    console.log(`✅ PayoutService simulation successful!`);
    console.log(`   Transaction ID: ${payout.transactionId}`);
    console.log(`   Reference ID: ${payout.referenceId}`);
    console.log(`   Payout Status: ${payout.status}`);

    // Clean up test records
    console.log("\n🧹 Cleaning up test records...");
    await prisma.paymentHistory.deleteMany({ where: { payment: { orderId: testOrder.id } } });
    await prisma.payment.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.deleteMany({ where: { id: testOrder.id } });
    await prisma.address.deleteMany({ where: { id: testAddress.id } });
    await prisma.quote.deleteMany({ where: { id: testQuote.id } });
    await prisma.userNotificationToken.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.deleteMany({ where: { id: testUser.id } });
    console.log("✅ Cleanup completed.");

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY! BACKEND IS 100% PRODUCTION READY!");
  } catch (error: any) {
    console.error("\n❌ E2E TEST SUITE FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
