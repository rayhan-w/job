import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, method, senderNumber, transactionId, note, screenshotUrl } = await req.json();

    if (!amount || Number(amount) <= 0 || !method || !senderNumber || !transactionId) {
      return NextResponse.json(
        { error: "Amount, method, sender number, and transaction ID are required." },
        { status: 400 }
      );
    }

    // Check transaction ID uniqueness
    const existing = await prisma.cashInRequest.findUnique({
      where: { transactionId: transactionId.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A cash-in request with this Transaction ID already exists." },
        { status: 409 }
      );
    }

    const request = await prisma.cashInRequest.create({
      data: {
        userId: session.userId,
        amount: Number(amount),
        method,
        senderNumber: senderNumber.trim(),
        transactionId: transactionId.trim(),
        note: note ? String(note).trim() : null,
        screenshotUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cash-in request submitted successfully. Awaiting admin approval.",
      request,
    });
  } catch (error: any) {
    console.error("Cash-in error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit cash-in request" }, { status: 500 });
  }
}
