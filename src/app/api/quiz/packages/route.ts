import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const packages = await prisma.quizPackage.findMany({
      where: { status: "ACTIVE" },
      include: {
        book: {
          select: {
            nameBn: true,
            nameEn: true,
            subject: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let isLoggedIn = false;
    let walletBalance = 0;
    let userAttempts: Record<string, any[]> = {};

    const session = await getSession();
    if (session) {
      isLoggedIn = true;
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.userId },
        select: { balance: true },
      });
      walletBalance = wallet?.balance ?? 0;

      const attempts = await prisma.quizAttempt.findMany({
        where: { userId: session.userId },
        orderBy: { startedAt: "desc" },
      });

      for (const att of attempts) {
        if (!userAttempts[att.packageId]) {
          userAttempts[att.packageId] = [];
        }
        userAttempts[att.packageId].push(att);
      }
    }

    return NextResponse.json({
      packages,
      isLoggedIn,
      walletBalance,
      userAttempts,
    });
  } catch (error) {
    console.error("GET quiz packages error:", error);
    return NextResponse.json(
      { error: "Failed to load quiz packages" },
      { status: 500 }
    );
  }
}
