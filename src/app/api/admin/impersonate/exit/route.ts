import { NextResponse } from "next/server";
import { getSession, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || !session.impersonatorId) {
      return NextResponse.json({ error: "Not in an active impersonation session" }, { status: 400 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.impersonatorId },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "Original admin user not found" }, { status: 404 });
    }

    // Restore original admin token
    const adminToken = signToken({
      userId: adminUser.id,
      phone: adminUser.phone,
      name: adminUser.name,
      role: adminUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Returned to Admin Panel",
    });

    response.cookies.set("jp_session", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Exit impersonation error:", error);
    return NextResponse.json({ error: error.message || "Failed to exit impersonation" }, { status: 500 });
  }
}
