import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { phone, identifier: rawId, password } = await req.json();
    const identifier = (phone || rawId || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone/Email and password are required" },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes("@");
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase() }
        : {
            OR: [
              { phone: identifier },
              { email: identifier.toLowerCase() },
            ],
          },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid phone/email or password" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid phone/email or password" },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your account is inactive or suspended" },
        { status: 403 }
      );
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
        balance: user.wallet?.balance ?? 0.0,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}
