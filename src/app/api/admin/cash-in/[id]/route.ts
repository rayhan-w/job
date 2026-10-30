import { NextRequest, NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";
import { sendTemplatedSms } from "@/lib/sms";

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
        { error: "Forbidden: You do not have permission to approve/reject cash-in." },
        { status: 403 }
      );
    }

    const { action, reason } = await req.json(); // "APPROVE" or "REJECT"

    const cashIn = await prisma.cashInRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!cashIn) {
      return NextResponse.json({ error: "Cash-in request not found" }, { status: 404 });
    }

    // Critical guard against double approval (Acceptance test 10)
    if (cashIn.status !== "PENDING") {
      return NextResponse.json(
        { error: `This request has already been ${cashIn.status.toLowerCase()} and cannot be processed again.` },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      // Credit wallet with immutable ledger entry
      const { newBalance } = await creditWallet({
        userId: cashIn.userId,
        amount: cashIn.amount,
        type: "CASH_IN",
        referenceType: "CashInRequest",
        referenceId: cashIn.id,
        note: `Approved cash-in via ${cashIn.method} (TrxID: ${cashIn.transactionId})`,
        createdBy: session.userId,
      });

      // Update request status
      const updated = await prisma.cashInRequest.update({
        where: { id: cashIn.id },
        data: {
          status: "APPROVED",
          approvedBy: session.userId,
          processedAt: new Date(),
        },
      });

      // In-app Notification
      await prisma.notification.create({
        data: {
          userId: cashIn.userId,
          titleBn: "ক্যাশ ইন সফল",
          titleEn: "Cash-In Approved",
          messageBn: `আপনার ৳ ${cashIn.amount} ক্যাশ ইন অনুমোদিত হয়েছে। বর্তমান ব্যালেন্স: ৳ ${newBalance}।`,
          messageEn: `Your cash-in of ৳ ${cashIn.amount} has been approved. Current balance: ৳ ${newBalance}.`,
          link: "/dashboard/wallet",
        },
      });

      // Sandbox SMS
      await sendTemplatedSms("CASH_IN_APPROVED", cashIn.user.phone, {
        name: cashIn.user.name,
        amount: cashIn.amount,
        balance: newBalance,
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "CASH_IN_APPROVE",
          targetType: "CashInRequest",
          targetId: cashIn.id,
          details: JSON.stringify({ amount: cashIn.amount, targetUserPhone: cashIn.user.phone }),
        },
      });

      return NextResponse.json({ success: true, message: "Cash-in approved successfully", request: updated });
    } else if (action === "REJECT") {
      const updated = await prisma.cashInRequest.update({
        where: { id: cashIn.id },
        data: {
          status: "REJECTED",
          rejectionReason: reason || "Invalid transaction details",
          approvedBy: session.userId,
          processedAt: new Date(),
        },
      });

      // In-app Notification with reject reason (Acceptance test 11)
      await prisma.notification.create({
        data: {
          userId: cashIn.userId,
          titleBn: "ক্যাশ ইন বাতিল",
          titleEn: "Cash-In Rejected",
          messageBn: `আপনার ৳ ${cashIn.amount} ক্যাশ ইন রিকোয়েস্ট বাতিল করা হয়েছে। কারণ: ${reason || "ত্রুটিপূর্ণ তথ্য"}`,
          messageEn: `Your cash-in request of ৳ ${cashIn.amount} was rejected. Reason: ${reason || "Invalid info"}`,
          link: "/dashboard/wallet",
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "CASH_IN_REJECT",
          targetType: "CashInRequest",
          targetId: cashIn.id,
          details: JSON.stringify({ amount: cashIn.amount, reason }),
        },
      });

      return NextResponse.json({ success: true, message: "Cash-in rejected", request: updated });
    }

    return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
  } catch (error: any) {
    console.error("Admin cash-in process error:", error);
    return NextResponse.json({ error: error.message || "Failed to process cash-in" }, { status: 500 });
  }
}
