import { FirebaseService } from "./firebase.service";
import { prisma } from "../db";
import { logger } from "../utils/logger";

export class NotificationHelper {
  /**
   * Triggers a milestone push notification and logs it in the database.
   */
  static async triggerMilestoneNotification(
    orderId: string,
    userId: string,
    milestone: "PICKUP_SCHEDULED" | "PARTNER_ASSIGNED" | "REVISED_OFFER" | "OFFER_ACCEPTED" | "OFFER_DECLINED" | "INSPECTION_COMPLETED" | "PAYMENT_PROCESSED"
  ) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          quote: {
            include: {
              variant: {
                include: {
                  model: true,
                },
              },
            },
          },
        },
      });

      if (!order) return;

      const deviceName = order.quote.variant.model.name;
      let title = "";
      let body = "";

      switch (milestone) {
        case "PICKUP_SCHEDULED":
          title = "Pickup Scheduled! 🗓️";
          body = `Your doorstep pickup for ${deviceName} is successfully scheduled for ${order.pickupDate} (${order.pickupTimeSlot}).`;
          break;
        case "PARTNER_ASSIGNED":
          title = "Agent Dispatched! 🚗";
          body = `A CashALL inspection specialist has been assigned to pick up your ${deviceName}.`;
          break;
        case "REVISED_OFFER":
          title = "New Offer Received! 💰";
          body = `Doorstep QC is complete. We've made a revised offer of ₹${order.finalPrice} for your ${deviceName}. Check details to accept!`;
          break;
        case "OFFER_ACCEPTED":
          title = "Offer Accepted! ✅";
          body = `You've accepted the revised price of ₹${order.finalPrice}. We are processing your instant payout.`;
          break;
        case "OFFER_DECLINED":
          title = "Offer Declined ❌";
          body = `You've declined the revised offer for your ${deviceName}. Your device will be handed back immediately.`;
          break;
        case "INSPECTION_COMPLETED":
          title = "Inspection Completed! 🔍";
          body = `Your ${deviceName} passed inspection check. Payout of ₹${order.finalPrice} has been approved.`;
          break;
        case "PAYMENT_PROCESSED":
          title = "Payment Transferred! 💸";
          body = `Success! Instant payout of ₹${order.finalPrice} for your ${deviceName} has been credited to your account.`;
          break;
      }

      // Save notification to DB
      await prisma.notification.create({
        data: {
          userId,
          title,
          message: body,
          type: "SYSTEM",
          read: false,
        },
      });

      // Deliver push
      await FirebaseService.sendPushNotification(userId, title, body, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        milestone,
      });

      logger.info(`Milestone notification triggered for order ${order.orderNumber}: ${milestone}`);
    } catch (error) {
      logger.error("Failed to trigger milestone notification:", error);
    }
  }
}
