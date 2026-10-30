import { prisma } from "../prisma";

export interface PaymentInitiateResult {
  redirectUrl: string;
  transactionId: string;
  provider: string;
}

export interface PaymentProvider {
  createPayment(
    orderId: string,
    amount: number,
    callbackUrls: { success: string; fail: string; cancel: string }
  ): Promise<PaymentInitiateResult>;
  verifyPayment(transactionId: string): Promise<{ success: boolean; amount: number; provider: string }>;
}

export class SandboxPaymentProvider implements PaymentProvider {
  async createPayment(
    orderId: string,
    amount: number,
    callbackUrls: { success: string; fail: string; cancel: string }
  ): Promise<PaymentInitiateResult> {
    const transactionId = `SANDBOX_TRX_${Date.now()}`;
    return {
      redirectUrl: `${callbackUrls.success}?trxId=${transactionId}&status=success`,
      transactionId,
      provider: "SANDBOX",
    };
  }

  async verifyPayment(transactionId: string) {
    return {
      success: true,
      amount: 0,
      provider: "SANDBOX",
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  // Real gateway (SSLCommerz, bKash, ShurjoPay) will plug in when credentials provided
  return new SandboxPaymentProvider();
}
