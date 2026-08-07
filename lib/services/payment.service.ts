import { IPaymentService, PaymentDetails, PaymentResponse } from "./payment.interface";
import { prisma } from "../db";
import { logger } from "../utils/logger";
import { NotificationHelper } from "./notification.helper";
import { EmailService } from "./email.service";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utils/AppError";

export class PaymentService implements IPaymentService {
  /**
   * Processes a doorstep payout simulation.
   */
  async processPayout(details: PaymentDetails): Promise<PaymentResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: details.orderId },
        include: { user: true },
      });

      if (!order) {
        throw new AppError("Order not found.", 404);
      }

      logger.info(`Initiating payout simulation for order ${order.orderNumber}. Amount: ₹${details.amount}`);

      const success = true;
      const transactionId = `txn_${uuidv4().substring(0, 18)}`;
      const referenceId = `ref_${Math.floor(100000 + Math.random() * 900000)}`;

      const status = success ? "PAID" : "FAILED";
      const message = success ? "Payout processed successfully." : "Payment provider rejected transaction.";

      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            method: details.paymentMethod,
            amount: details.amount,
            status,
            transactionRef: transactionId,
            paidAt: success ? new Date() : null,
          },
        });

        await tx.paymentHistory.create({
          data: {
            paymentId: payment.id,
            event: success ? "SUCCESS" : "FAILED",
            details: `Payout simulation completed: ${message} (Ref: ${referenceId})`,
          },
        });

        if (success) {
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "PAID",
            },
          });
        }
      });

      if (success) {
        await NotificationHelper.triggerMilestoneNotification(
          order.id,
          order.userId,
          "PAYMENT_PROCESSED"
        );

        if (order.user.email) {
          EmailService.sendEmail(
            order.user.email,
            `Payout Transferred: ₹${details.amount} 💸`,
            EmailService.compilePayoutTemplate(order.orderNumber, details.amount, referenceId)
          ).catch((err) => logger.error("Failed to send payout email:", err));
        }
      }

      return {
        success,
        transactionId,
        referenceId,
        status,
        message,
      };
    } catch (error: any) {
      logger.error("Error in processPayout service:", error);
      if (error instanceof AppError) throw error;
      return {
        success: false,
        transactionId: "",
        referenceId: "",
        status: "FAILED",
        message: error.message,
      };
    }
  }
}

export const payoutServiceInstance = new PaymentService();
