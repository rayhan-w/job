import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Wallet Reconciliation Check (Acceptance test 24)
    const wallets = await prisma.wallet.findMany();
    const totalUserBalances = wallets.reduce((sum, w) => sum + w.balance, 0);

    const transactions = await prisma.walletTransaction.findMany();
    const sumLedgerCredits = transactions.reduce((sum, t) => sum + t.amount, 0);

    const reconciliationPass = Math.abs(totalUserBalances - sumLedgerCredits) < 0.01;

    // 2. Metrics
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.jobApplication.count();
    const totalUsers = await prisma.user.count();
    const totalOrders = await prisma.order.count();
    const totalCommissionsPaid = await prisma.commission.aggregate({
      _sum: { agentAmount: true, cpAmount: true },
      where: { status: "PAID" },
    });
    const totalQuizAttempts = await prisma.quizAttempt.count();
    const totalQuizBonusesPaid = await prisma.walletTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "QUIZ_BONUS" },
    });

    return NextResponse.json({
      success: true,
      reconciliation: {
        totalUserBalances,
        sumLedgerCredits,
        difference: totalUserBalances - sumLedgerCredits,
        passed: reconciliationPass,
      },
      metrics: {
        totalJobs,
        totalApplications,
        totalUsers,
        totalOrders,
        totalCommissions:
          (totalCommissionsPaid._sum.agentAmount || 0) + (totalCommissionsPaid._sum.cpAmount || 0),
        totalQuizAttempts,
        totalQuizBonuses: totalQuizBonusesPaid._sum.amount || 0,
      },
    });
  } catch (error: any) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate report" }, { status: 500 });
  }
}
