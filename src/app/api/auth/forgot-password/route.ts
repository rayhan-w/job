import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return friendly message without leaking full system status
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
      });
    }

    // Invalidate existing tokens for this email
    await prisma.passwordResetToken.updateMany({
      where: {
        email: normalizedEmail,
        used: false,
      },
      data: { used: true },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
        used: false,
      },
    });

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${protocol}://${host}`;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    let emailResult = null;
    try {
      emailResult = await sendPasswordResetEmail(normalizedEmail, resetUrl, user.name);
    } catch (mailErr) {
      console.error("[ForgotPassword] Failed to send email via SMTP:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "A password reset link has been sent to your email.",
      resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
      previewUrl: emailResult?.previewUrl,
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
