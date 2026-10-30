import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { debitWallet } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packageId } = await req.json();
    const pkg = await prisma.quizPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg || pkg.status !== "ACTIVE") {
      return NextResponse.json({ error: "Quiz package not found or inactive" }, { status: 404 });
    }

    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.userId },
    });

    if (!wallet || wallet.balance < pkg.price) {
      return NextResponse.json(
        {
          error: "Insufficient wallet balance to buy this quiz package. Please cash-in.",
          requiredAmount: pkg.price,
          currentBalance: wallet?.balance ?? 0.0,
        },
        { status: 400 }
      );
    }

    // Debit package price from wallet (Acceptance test 19)
    if (pkg.price > 0) {
      await debitWallet({
        userId: session.userId,
        amount: pkg.price,
        type: "PURCHASE",
        referenceType: "QuizPackage",
        referenceId: pkg.id,
        note: `Purchased quiz package: ${pkg.nameBn}`,
        createdBy: session.userId,
      });
    }

    // Initialize Quiz Attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        packageId: pkg.id,
        userId: session.userId,
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Package purchased successfully! Ready to play.",
      attemptId: attempt.id,
      package: pkg,
    });
  } catch (error: any) {
    console.error("Quiz buy error:", error);
    return NextResponse.json({ error: error.message || "Failed to buy quiz package" }, { status: 500 });
  }
}
