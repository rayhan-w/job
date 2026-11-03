import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function getEmailConfig() {
  let host = process.env.SMTP_HOST || "";
  let port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  let user = process.env.SMTP_USER || "";
  let pass = process.env.SMTP_PASS || "";
  let from = process.env.SMTP_FROM || '"WOJOB Portal" <no-reply@wojob.com>';

  try {
    const dbSettings = await prisma.setting.findMany({
      where: {
        key: { in: ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpFrom"] },
      },
    });

    for (const s of dbSettings) {
      if (s.key === "smtpHost" && s.value?.trim()) host = s.value.trim();
      if (s.key === "smtpPort" && s.value?.trim()) port = parseInt(s.value.trim(), 10);
      if (s.key === "smtpUser" && s.value?.trim()) user = s.value.trim();
      if (s.key === "smtpPass" && s.value?.trim()) pass = s.value.trim();
      if (s.key === "smtpFrom" && s.value?.trim()) from = s.value.trim();
    }
  } catch (err) {
    console.error("[Email] Failed to fetch SMTP settings from database:", err);
  }

  const isConfigured = Boolean(host && user && pass);

  return {
    host,
    port,
    user,
    pass,
    from,
    isConfigured,
  };
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const config = await getEmailConfig();

  if (!config.isConfigured) {
    console.warn(`[Email] SMTP is not configured. Email to ${to} was not sent via real mail server.`);
    return {
      success: false,
      unconfigured: true,
      message: "SMTP is not configured in settings or environment.",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    });

    console.log(`[Email] Message sent successfully to ${to}: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error(`[Email] Failed to send email to ${to}:`, error?.message || error);
    return {
      success: false,
      error: error?.message || "Failed to send email",
    };
  }
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string, name?: string) {
  const subject = "পাসওয়ার্ড রিসেট লিংক — WOJOB Job Portal";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #ea580c; margin: 0;">WOJOB</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Career & Recruitment Platform</p>
      </div>
      <p style="font-size: 15px; color: #111827;">প্রিয় ${name || "ব্যবহারকারী"},</p>
      <p style="font-size: 14px; color: #374151; line-height: 1.6;">
        আপনার WOJOB অ্যাকাউন্টের পাসওয়ার্ড রিসেট করার জন্য একটি অনুরোধ পাওয়া গেছে। আপনার নতুন পাসওয়ার্ড সেট করতে নিচের বাটনে ক্লিক করুন:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 8px; display: inline-block;">
          নতুন পাসওয়ার্ড সেট করুন
        </a>
      </div>
      <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">
        যদি বাটন কাজ না করে, নিচের লিংকটি কপি করে আপনার ব্রাউজারে পেস্ট করুন:<br/>
        <a href="${resetUrl}" style="color: #ea580c; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        * এই লিংকটি ৩০ মিনিট পর্যন্ত কার্যকর থাকবে এবং একবার ব্যবহারের পর নিষ্ক্রিয় হয়ে যাবে। আপনি যদি এই অনুরোধ না করে থাকেন, তবে বার্তাটি উপেক্ষা করুন।
      </p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(toEmail: string, name?: string) {
  const subject = "WOJOB প্ল্যাটফর্মে স্বাগতম!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
      <h2 style="color: #ea580c; text-align: center;">WOJOB এ আপনাকে স্বাগতম</h2>
      <p style="font-size: 14px; color: #374151;">প্রিয় ${name || "ব্যবহারকারী"},</p>
      <p style="font-size: 14px; color: #374151;">আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখনই লগইন করে আপনার পছন্দের চাকরিতে আবেদন করুন।</p>
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject,
    html,
  });
}
