import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also get quiz attempts that represent package access
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: session.userId },
      include: {
        package: {
          include: { book: true },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      orders,
      quizAttempts: quizAttempts.map((a) => ({
        id: a.id,
        packageId: a.packageId,
        packageNameBn: a.package.nameBn,
        packageNameEn: a.package.nameEn,
        bookName: a.package.book?.nameBn,
        price: a.package.price,
        questionCount: a.package.questionCount,
        status: a.status,
        score: a.score,
        createdAt: a.startedAt,
      })),
    });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
