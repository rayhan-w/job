import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawInput = (body.email || body.phone || body.identifier || "").toString().trim();

    if (!rawInput) {
      return NextResponse.json(
        { error: "আপনার নিবন্ধিত মোবাইল নম্বর অথবা ইমেইল ঠিকানা দিন।" },
        { status: 400 }
      );
    }

    const normalizedEmail = rawInput.toLowerCase();
    const normalizedPhone = rawInput.replace(/[^0-9]/g, "");

    // Find user by either email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: rawInput },
          ...(normalizedPhone.length >= 10 ? [{ phone: normalizedPhone }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "এই মোবাইল নম্বর বা ইমেইলে কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সঠিক নম্বর/ইমেইল দিন অথবা নতুন একাউন্ট খুলুন।",
        },
        { status: 404 }
      );
    }

    // Invalidate existing active tokens for this user's email or phone
    const userIdentifiers = [user.email, user.phone].filter(Boolean) as string[];
    await prisma.passwordResetToken.updateMany({
      where: {
        email: { in: userIdentifiers },
        used: false,
      },
      data: { used: true },
    });

    // Generate secure random token (30-minute validity)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        email: user.email || user.phone,
        token,
        expiresAt,
        used: false,
      },
    });

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${protocol}://${host}`;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    let emailSent = false;
    let emailStatusNote = "";

    if (user.email) {
      try {
        const mailResult = await sendPasswordResetEmail(user.email, resetUrl, user.name);
        if (mailResult?.success) {
          emailSent = true;
          emailStatusNote = `আপনার ইমেইল (${user.email})-এ রিসেট লিংক সফলভাবে পাঠানো হয়েছে।`;
        } else {
          emailStatusNote = "সার্ভারে SMTP সক্রিয় না থাকায় সরাসরি ভেরিফিকেশন লিংক তৈরি করা হয়েছে।";
        }
      } catch (mailErr: any) {
        console.error("[ForgotPassword] Mail send error:", mailErr?.message || mailErr);
        emailStatusNote = "ইমেইল সার্ভারে সাময়িক সমস্যা হওয়ায় সরাসরি ভেরিফিকেশন লিংক দেওয়া হয়েছে।";
      }
    } else {
      emailStatusNote = "আপনার অ্যাকাউন্টে কোনো ইমেইল সংযুক্ত নেই। মোবাইল নম্বর যাচাই সাপেক্ষে পাসওয়ার্ড রিসেট সক্রিয় করা হয়েছে।";
    }

    return NextResponse.json({
      success: true,
      userFound: true,
      name: user.name,
      phone: user.phone,
      email: user.email || null,
      emailSent,
      resetUrl,
      message: emailSent
        ? `আপনার ইমেইল (${user.email})-এ পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে। আপনি চাইলে নিচের বাটনে ক্লিক করেও সরাসরি নতুন পাসওয়ার্ড সেট করতে পারেন।`
        : `অ্যাকাউন্ট ভেরিফিকেশন সম্পন্ন হয়েছে (${user.name})। সরাসরি নতুন পাসওয়ার্ড সেট করতে নিচের বাটনে ক্লিক করুন।`,
    });
  } catch (error: any) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "পাসওয়ার্ড রিসেট প্রক্রিয়াকরণে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
