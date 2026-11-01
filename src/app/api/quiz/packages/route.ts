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
            id: true,
            nameBn: true,
            nameEn: true,
            subject: true,
            _count: {
              select: {
                questions: { where: { status: "APPROVED" } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPackages = packages.map((pkg) => {
      const realQCount = pkg.book?._count?.questions ?? pkg.questionCount;
      return {
        ...pkg,
        questionCount: realQCount > 0 ? realQCount : pkg.questionCount,
      };
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
      packages: formattedPackages,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const {
      nameBn,
      nameEn,
      bookId,
      questionCount = 10,
      timeLimitMinutes = 10,
      price = 50,
      targetScore = 8,
      bonusAmount = 100,
      status = "ACTIVE",
    } = await req.json();

    if (!nameBn || !bookId) {
      return NextResponse.json({ error: "Package name (Bangla) and Book ID are required" }, { status: 400 });
    }

    const pkg = await prisma.quizPackage.create({
      data: {
        nameBn,
        nameEn: nameEn || nameBn,
        bookId,
        questionCount: Number(questionCount),
        timeLimitMinutes: Number(timeLimitMinutes),
        price: Number(price),
        targetScore: Number(targetScore),
        bonusAmount: Number(bonusAmount),
        status,
      },
    });

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    console.error("Create quiz package error:", error);
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    await prisma.quizPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Quiz package deleted successfully" });
  } catch (error: any) {
    console.error("Delete quiz package error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
  }
}
