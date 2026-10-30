import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";
import { reverseOrderCommission } from "@/lib/commission";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Only administrators can refund orders" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json({ error: "Order is already refunded" }, { status: 400 });
    }

    // 1. Re-credit customer's wallet (Acceptance test 15)
    await creditWallet({
      userId: order.customerId,
      amount: order.totalAmount,
      type: "REFUND",
      referenceType: "OrderRefund",
      referenceId: order.id,
      note: `Full refund for order #${order.id.slice(0, 8)}`,
      createdBy: session.userId,
    });

    // 2. Reverse Agent & Channel Partner commissions
    const revResult = await reverseOrderCommission(order.id);

    // 3. Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "REFUNDED" },
    });

    // In-app Notification to customer
    await prisma.notification.create({
      data: {
        userId: order.customerId,
        titleBn: "অর্ডার রিফান্ড সম্পন্ন",
        titleEn: "Order Refund Completed",
        messageBn: `আপনার অর্ডার #${order.id.slice(0, 8)} এর ৳ ${order.totalAmount} আপনার ওয়ালেটে ফেরত দেওয়া হয়েছে।`,
        messageEn: `Order #${order.id.slice(0, 8)} of ৳ ${order.totalAmount} has been refunded to your wallet.`,
        link: "/dashboard/wallet",
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: "ORDER_REFUND",
        targetType: "Order",
        targetId: order.id,
        details: JSON.stringify({ totalAmount: order.totalAmount, reversedCommissions: revResult.count }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order refunded successfully and commissions reversed",
      order: updatedOrder,
      reversedCount: revResult.count,
    });
  } catch (error: any) {
    console.error("Order refund error:", error);
    return NextResponse.json({ error: error.message || "Failed to refund order" }, { status: 500 });
  }
}
