import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { ensureWallet } from "@/lib/wallet";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, email, refCode, role = "CUSTOMER", termsAccepted } = await req.json();

    if (!phone || !password || !name) {
      return NextResponse.json(
        { error: "Name, phone, and password are required." },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the Terms & Conditions, Privacy Policy, and Refund Policy to register." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number is already registered." },
        { status: 409 }
      );
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email is already registered." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    // Resolve Referral / Agent
    let targetAgent = null;
    let referringUserId: string | null = null;

    if (refCode) {
      const cleanRef = String(refCode).trim().toUpperCase();
      // 1. Check if refCode belongs to an Agent
      targetAgent = await prisma.agent.findUnique({
        where: { referralCode: cleanRef },
      });

      // 2. Check if refCode belongs to a User
      const referringUser = await prisma.user.findUnique({
        where: { referralCode: cleanRef },
      });

      if (referringUser) {
        referringUserId = referringUser.id;
        // If the referring user is under an agent, link same agent
        const refCustomer = await prisma.customer.findUnique({
          where: { userId: referringUser.id },
        });
        if (refCustomer && !targetAgent) {
          targetAgent = await prisma.agent.findUnique({
            where: { id: refCustomer.agentId },
          });
        }
      }
    }

    if (!targetAgent) {
      // Find Default Agent
      targetAgent = await prisma.agent.findFirst({
        where: { isDefault: true },
      });
    }

    if (!targetAgent) {
      targetAgent = await prisma.agent.findFirst();
    }

    // Generate unique referral code for the new user
    let userReferralCode = "WOJ-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    let isUnique = false;
    while (!isUnique) {
      const existingCode = await prisma.user.findUnique({
        where: { referralCode: userReferralCode },
      });
      if (!existingCode) {
        isUnique = true;
      } else {
        userReferralCode = "WOJ-" + crypto.randomBytes(3).toString("hex").toUpperCase();
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email ? email.toLowerCase().trim() : undefined,
        passwordHash,
        role: role,
        referralCode: userReferralCode,
        referredById: referringUserId,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        termsPolicyVersion: "v1.0",
        customer:
          role === "CUSTOMER" && targetAgent
            ? {
                create: {
                  agentId: targetAgent.id,
                },
              }
            : undefined,
      },
    });

    // Initialize wallet
    await ensureWallet(user.id);

    // If candidate, create initial blank profile (completeness 0%)
    if (role === "CUSTOMER") {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
          phone: user.phone,
          completeness: 0,
        },
      });
    }

    // Trigger welcome email if email provided
    if (user.email) {
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (mailErr) {
        console.error("Welcome email error:", mailErr);
      }
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set("jp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
