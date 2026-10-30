import { prisma } from "../prisma";

export interface SmsResponse {
  success: boolean;
  cost?: number;
  error?: string;
  provider: string;
}

export interface SmsProvider {
  sendSms(phone: string, message: string): Promise<SmsResponse>;
  sendOtp(phone: string, code: string): Promise<SmsResponse>;
}

// LogSmsProvider (Sandbox Mode)
export class LogSmsProvider implements SmsProvider {
  async sendSms(phone: string, message: string): Promise<SmsResponse> {
    console.log(`[SMS SANDBOX] To: ${phone} | Content: ${message}`);
    await prisma.smsLog.create({
      data: {
        phone,
        message,
        provider: "LOG_SANDBOX",
        status: "Sandbox — not sent",
        cost: 0.0,
      },
    });
    return { success: true, provider: "LOG_SANDBOX", cost: 0.0 };
  }

  async sendOtp(phone: string, code: string): Promise<SmsResponse> {
    const message = `Your verification code is: ${code}`;
    return this.sendSms(phone, message);
  }
}

// Factory to get active provider
export function getSmsProvider(): SmsProvider {
  // Real gateway will be plugged here when owner provides API keys in .env
  return new LogSmsProvider();
}

export async function sendTemplatedSms(
  slug: string,
  phone: string,
  variables: Record<string, string | number>
) {
  try {
    const template = await prisma.smsTemplate.findUnique({
      where: { slug },
    });

    let message = template?.templateBn || "";
    if (!message) {
      // Fallback message
      message = Object.entries(variables)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
    } else {
      for (const [key, val] of Object.entries(variables)) {
        message = message.replace(new RegExp(`{${key}}`, "g"), String(val));
      }
    }

    const provider = getSmsProvider();
    return await provider.sendSms(phone, message);
  } catch (err) {
    console.error("Failed to send templated SMS:", err);
  }
}
