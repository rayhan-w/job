import { NextRequest, NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { releaseCashOutHold, completeCashOutPayout } from "@/lib/wallet";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canApprove =
      session.role === "SUPER_ADMIN" ||
      (await hasPermission(session.userId, "wallets", "approve"));

    if (!canApprove) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to approve/reject cash-out." },
        { status: 403 }
      );
    }

    const { action, reason } = await req.json(); // "APPROVE" or "REJECT"

    const cashOut = await prisma.cashOutRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!cashOut) {
      return NextResponse.json({ error: "Cash-out request not found" }, { status: 404 });
    }

    if (cashOut.status !== "PENDING") {
      return NextResponse.json(
        { error: `This request has already been ${cashOut.status.toLowerCase()} and cannot be processed again.` },
        { status: 400 }
      );
    }

    if (action === "REJECT") {
      // Release held balance back to available balance (Acceptance test 12)
      await releaseCashOutHold({
        userId: cashOut.userId,
        amount: cashOut.amount,
        referenceId: cashOut.id,
        createdBy: session.userId,
      });

      const updated = await prisma.cashOutRequest.update({
        where: { id: cashOut.id },
        data: {
          status: "REJECTED",
          rejectionReason: reason || "Admin rejected request",
          approvedBy: session.userId,
          processedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId: cashOut.userId,
          titleBn: "ক্যাশ আউট বাতিল ও টাকা ফেরত",
          titleEn: "Cash-Out Rejected (Amount Returned)",
          messageBn: `আপনার ৳ ${cashOut.amount} ক্যাশ আউট রিকোয়েস্ট বাতিল করা হয়েছে এবং টাকা আপনার ব্যালেন্সে ফেরত এসেছে। কারণ: ${reason || "ত্রুটিপূর্ণ অ্যাকাউন্ট নম্বর"}`,
          messageEn: `Your cash-out request of ৳ ${cashOut.amount} was rejected and balance restored. Reason: ${reason || "Invalid account"}`,
          link: "/dashboard/wallet",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "CASH_OUT_REJECT",
          targetType: "CashOutRequest",
          targetId: cashOut.id,
          details: JSON.stringify({ amount: cashOut.amount, reason }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cash-out rejected and held amount released back to user balance",
        request: updated,
      });
    } else if (action === "APPROVE") {
      // Mark payout as complete in ledger (Acceptance test 13)
      await completeCashOutPayout({
        userId: cashOut.userId,
        amount: cashOut.amount,
        referenceId: cashOut.id,
        createdBy: session.userId,
      });

      const updated = await prisma.cashOutRequest.update({
        where: { id: cashOut.id },
        data: {
          status: "APPROVED",
          approvedBy: session.userId,
          processedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          userId: cashOut.userId,
          titleBn: "ক্যাশ আউট সম্পন্ন",
          titleEn: "Cash-Out Payout Complete",
          messageBn: `আপনার ৳ ${cashOut.netAmount} (ফি ৳ ${cashOut.feeAmount}) সফলভাবে আপনার ${cashOut.method} অ্যাকাউন্টে পাঠানো হয়েছে।`,
          messageEn: `Payout of ৳ ${cashOut.netAmount} has been sent to your ${cashOut.method} account.`,
          link: "/dashboard/wallet",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "CASH_OUT_APPROVE",
          targetType: "CashOutRequest",
          targetId: cashOut.id,
          details: JSON.stringify({ amount: cashOut.amount, netAmount: cashOut.netAmount, fee: cashOut.feeAmount }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cash-out approved and marked as paid",
        request: updated,
      });
    }

    return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin cash-out process error:", error);
    return NextResponse.json({ error: error.message || "Failed to process cash-out" }, { status: 500 });
  }
}
