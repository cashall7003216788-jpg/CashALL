export interface PaymentDetails {
  orderId: string;
  amount: number;
  paymentMethod: "BANK_TRANSFER" | "UPI";
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  accountHolderName?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  referenceId: string;
  status: "PAID" | "FAILED" | "PENDING";
  message: string;
}

export interface IPaymentService {
  processPayout(details: PaymentDetails): Promise<PaymentResponse>;
}
