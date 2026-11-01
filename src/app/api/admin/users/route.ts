import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { creditWallet, debitWallet, ensureWallet } from "@/lib/wallet";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userId, role, status, newPassword, walletAdjustment, adjustmentReason } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Role / Status update
    const updateData: any = {};
    if (role && session.role === "SUPER_ADMIN") {
      updateData.role = role;
    }
    if (status) {
      updateData.status = status;
    }
    if (newPassword && newPassword.length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // Wallet adjustment if requested
    if (walletAdjustment && typeof walletAdjustment === "number" && walletAdjustment !== 0) {
      await ensureWallet(userId);
      if (walletAdjustment > 0) {
        await creditWallet({
          userId,
          amount: walletAdjustment,
          type: "ADMIN_ADJUSTMENT",
          referenceType: "Admin",
          referenceId: session.userId,
          note: adjustmentReason || "Admin manual credit",
          createdBy: session.userId,
        });
      } else {
        await debitWallet({
          userId,
          amount: Math.abs(walletAdjustment),
          type: "ADMIN_ADJUSTMENT",
          referenceType: "Admin",
          referenceId: session.userId,
          note: adjustmentReason || "Admin manual debit",
          createdBy: session.userId,
        });
      }
    }

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required to delete users" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    if (userId === session.userId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
