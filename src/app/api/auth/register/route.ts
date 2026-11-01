import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { ensureWallet } from "@/lib/wallet";

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

    // Resolve Agent: if referral code provided, lookup agent; else use Default Agent
    let targetAgent = null;
    if (refCode) {
      targetAgent = await prisma.agent.findUnique({
        where: { referralCode: refCode },
      });
    }

    if (!targetAgent) {
      // Find Default Agent
      targetAgent = await prisma.agent.findFirst({
        where: { isDefault: true },
      });
    }

    // Fallback if no agent found in edge cases
    if (!targetAgent) {
      targetAgent = await prisma.agent.findFirst();
    }

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email: email ? email.toLowerCase().trim() : undefined,
        passwordHash,
        role: role,
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

    // If candidate, create initial profile
    if (role === "CUSTOMER") {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
          phone: user.phone,
          completeness: 20,
        },
      });
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
