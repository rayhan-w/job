import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { debitWallet } from "@/lib/wallet";
import { processOrderCommission } from "@/lib/commission";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json(); // array of { productId, quantity }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total and fetch products
    let totalOrderAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `Product not found or inactive: ${item.productId}` },
          { status: 404 }
        );
      }

      const qty = item.quantity || 1;
      const totalSale = product.salePrice * qty;
      const totalCost = product.costPrice * qty;
      const profit = totalSale - totalCost;

      totalOrderAmount += totalSale;

      orderItemsData.push({
        productId: product.id,
        quantity: qty,
        unitCost: product.costPrice,
        unitPrice: product.salePrice,
        totalCost,
        totalSale,
        profit,
      });
    }

    // Check customer wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet || wallet.balance < totalOrderAmount) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance. Please cash-in to complete this purchase.",
          requiredAmount: totalOrderAmount,
          currentBalance: wallet?.balance ?? 0.0,
          shortage: totalOrderAmount - (wallet?.balance ?? 0.0),
        },
        { status: 400 }
      );
    }

    // 1. Debit customer wallet
    const { transaction: debitTx } = await debitWallet({
      userId: session.userId,
      amount: totalOrderAmount,
      type: "PURCHASE",
      referenceType: "Order",
      note: `Payment for order containing ${orderItemsData.length} items`,
      createdBy: session.userId,
    });

    // 2. Create Order & OrderItems in database
    const order = await prisma.order.create({
      data: {
        customerId: session.userId,
        totalAmount: totalOrderAmount,
        status: "COMPLETED",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 3. Process referral commissions for Agent and Channel Partner (Acceptance test 14)
    const commissionResult = await processOrderCommission(order.id);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully using wallet balance!",
      order,
      commissionResult,
    });
  } catch (error: any) {
    console.error("Order checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to process order" }, { status: 500 });
  }
}
