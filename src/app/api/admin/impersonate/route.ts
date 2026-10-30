import { NextRequest, NextResponse } from "next/server";
import { getSession, signToken, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canImpersonate =
      session.role === "SUPER_ADMIN" ||
      (await hasPermission(session.userId, "users", "impersonate"));

    if (!canImpersonate) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to login as other users." },
        { status: 403 }
      );
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Write to Audit Log (Acceptance test requirement 5)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: "LOGIN_AS_USER",
        targetType: "User",
        targetId: targetUser.id,
        details: JSON.stringify({
          adminPhone: session.phone,
          targetUserPhone: targetUser.phone,
          targetUserName: targetUser.name,
          targetRole: targetUser.role,
        }),
      },
    });

    // Create session as target user with impersonation metadata
    const impersonatedToken = signToken({
      userId: targetUser.id,
      phone: targetUser.phone,
      name: targetUser.name,
      role: targetUser.role,
      impersonatorId: session.userId,
      impersonatorRole: session.role,
    });

    const response = NextResponse.json({
      success: true,
      message: `Successfully logged in as ${targetUser.name}`,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        role: targetUser.role,
      },
    });

    response.cookies.set("jp_session", impersonatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Impersonation error:", error);
    return NextResponse.json({ error: error.message || "Failed to impersonate" }, { status: 500 });
  }
}
