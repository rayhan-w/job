import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { holdCashOut } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method, receiverNumber } = await req.json();
    const cashOutAmount = Number(amount);

    if (!cashOutAmount || cashOutAmount <= 0 || !method || !receiverNumber) {
      return NextResponse.json(
        { error: "Amount, method, and receiver account number are required." },
        { status: 400 }
      );
    }

    // Get settings for cash-out min, max, fee
    const minSetting = await prisma.setting.findUnique({ where: { key: "CASH_OUT_MIN" } });
    const maxSetting = await prisma.setting.findUnique({ where: { key: "CASH_OUT_MAX" } });
    const feeSetting = await prisma.setting.findUnique({ where: { key: "CASH_OUT_FEE_PERCENT" } });

    const minAmount = minSetting ? Number(minSetting.value) : 100;
    const maxAmount = maxSetting ? Number(maxSetting.value) : 25000;
    const feePercent = feeSetting ? Number(feeSetting.value) : 2.0;

    if (cashOutAmount < minAmount) {
      return NextResponse.json(
        { error: `Minimum cash-out amount is ৳ ${minAmount}.` },
        { status: 400 }
      );
    }

    if (cashOutAmount > maxAmount) {
      return NextResponse.json(
        { error: `Maximum cash-out amount per request is ৳ ${maxAmount}.` },
        { status: 400 }
      );
    }

    const feeAmount = (cashOutAmount * feePercent) / 100;
    const netAmount = cashOutAmount - feeAmount;

    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: session.userId } });
    if (!wallet || wallet.balance < cashOutAmount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance to request cash-out." },
        { status: 400 }
      );
    }

    // Create CashOutRequest in PENDING status
    const request = await prisma.cashOutRequest.create({
      data: {
        userId: session.userId,
        amount: cashOutAmount,
        feeAmount,
        netAmount,
        method,
        receiverNumber,
        status: "PENDING",
      },
    });

    // Hold the balance immediately in the ledger (Acceptance test 12)
    await holdCashOut({
      userId: session.userId,
      amount: cashOutAmount,
      referenceId: request.id,
      createdBy: session.userId,
    });

    return NextResponse.json({
      success: true,
      message: `Cash-out request submitted. ৳ ${cashOutAmount} is placed on hold until admin approval.`,
      request,
    });
  } catch (error: any) {
    console.error("Cash-out error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit cash-out request" }, { status: 500 });
  }
}
