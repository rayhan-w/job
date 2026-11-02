import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        customer: {
          include: {
            user: {
              include: { wallet: true },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const fee = application.feePaid || 0;
    if (fee <= 0) {
      return NextResponse.json({ error: "This application had no fee (Free apply)." }, { status: 400 });
    }

    // Check if already refunded
    const existingRefund = await prisma.walletTransaction.findFirst({
      where: {
        referenceType: "APPLICATION_FEE_REFUND",
        referenceId: application.id,
      },
    });

    if (existingRefund) {
      return NextResponse.json({ error: "Fee for this application has already been refunded." }, { status: 400 });
    }

    const wallet = application.customer.user.wallet;
    if (!wallet) {
      return NextResponse.json({ error: "Candidate wallet not found" }, { status: 404 });
    }

    // Reversal entry in atomic transaction: NEVER edit or delete original entry
    const result = await prisma.$transaction(async (tx) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: fee },
        },
      });

      const refundTrx = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "REFUND",
          amount: fee,
          balanceAfter: updatedWallet.balance,
          referenceType: "APPLICATION_FEE_REFUND",
          referenceId: application.id,
          note: `আবেদন ফি রিফান্ড/রিভার্সাল: ${application.job.titleBn} (${application.job.organizationName})`,
          createdBy: session.userId,
        },
      });

      await tx.notification.create({
        data: {
          userId: application.customer.user.id,
          titleBn: "আবেদন ফি রিফান্ড করা হয়েছে",
          titleEn: "Application Fee Refunded",
          messageBn: `${application.job.organizationName}-এ '${application.job.titleBn}' পদের আবেদন ফি ৳${fee} আপনার ওয়ালেটে রিফান্ড করা হয়েছে।`,
          messageEn: `Application fee ৳${fee} for '${application.job.titleEn}' has been refunded to your wallet.`,
          link: "/dashboard/wallet",
        },
      });

      return refundTrx;
    });

    return NextResponse.json({
      success: true,
      message: `আবেদন ফি ৳${fee} সফলভাবে রিভার্সাল/রিফান্ড করা হয়েছে।`,
      transactionId: result.id,
    });
  } catch (error: any) {
    console.error("Refund application fee error:", error);
    return NextResponse.json({ error: error.message || "Failed to refund fee" }, { status: 500 });
  }
}
