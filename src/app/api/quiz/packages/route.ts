import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: any = {};
    if (includeInactive) {
      where.status = { not: "ARCHIVED" };
    } else {
      where.status = "ACTIVE";
    }

    const packages = await prisma.quizPackage.findMany({
      where,
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
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPackages = packages.map((pkg) => {
      const realQCount = pkg.book?._count?.questions ?? pkg.questionCount;
      return {
        ...pkg,
        questionCount: realQCount > 0 ? realQCount : pkg.questionCount,
        attemptsCount: pkg._count.attempts,
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
      success: true,
      packages: formattedPackages,
      isLoggedIn,
      walletBalance,
      userAttempts,
    });
  } catch (error: any) {
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

    const body = await req.json();
    const {
      id,
      nameBn,
      nameEn,
      descriptionBn,
      descriptionEn,
      bookId,
      questionCount = 10,
      timeLimitMinutes = 10,
      price = 50,
      targetScore = 8,
      bonusAmount = 100,
      rewardEnabled = true,
      perPointRate = 0.0,
      status = "ACTIVE",
    } = body;

    if (!nameBn || !bookId) {
      return NextResponse.json({ error: "Package name (Bangla) and Book ID are required" }, { status: 400 });
    }

    let pkg;
    if (id) {
      pkg = await prisma.quizPackage.update({
        where: { id },
        data: {
          nameBn,
          nameEn: nameEn || nameBn,
          descriptionBn: descriptionBn || null,
          descriptionEn: descriptionEn || null,
          bookId,
          questionCount: Math.max(1, Number(questionCount) || 10),
          timeLimitMinutes: Math.max(1, Number(timeLimitMinutes) || 10),
          price: Math.max(0, Number(price) || 0),
          targetScore: Math.max(0, Number(targetScore) || 0),
          bonusAmount: Math.max(0, Number(bonusAmount) || 0),
          rewardEnabled: Boolean(rewardEnabled),
          perPointRate: Math.max(0, Number(perPointRate) || 0),
          status,
        },
      });
    } else {
      pkg = await prisma.quizPackage.create({
        data: {
          nameBn,
          nameEn: nameEn || nameBn,
          descriptionBn: descriptionBn || null,
          descriptionEn: descriptionEn || null,
          bookId,
          questionCount: Math.max(1, Number(questionCount) || 10),
          timeLimitMinutes: Math.max(1, Number(timeLimitMinutes) || 10),
          price: Math.max(0, Number(price) || 0),
          targetScore: Math.max(0, Number(targetScore) || 0),
          bonusAmount: Math.max(0, Number(bonusAmount) || 0),
          rewardEnabled: Boolean(rewardEnabled),
          perPointRate: Math.max(0, Number(perPointRate) || 0),
          status,
        },
      });
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: any) {
    console.error("Save quiz package error:", error);
    return NextResponse.json({ error: error.message || "Failed to save package" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    const data: any = {};
    if (updates.nameBn !== undefined) data.nameBn = updates.nameBn;
    if (updates.nameEn !== undefined) data.nameEn = updates.nameEn;
    if (updates.descriptionBn !== undefined) data.descriptionBn = updates.descriptionBn;
    if (updates.descriptionEn !== undefined) data.descriptionEn = updates.descriptionEn;
    if (updates.bookId !== undefined) data.bookId = updates.bookId;
    if (updates.questionCount !== undefined) data.questionCount = Math.max(1, Number(updates.questionCount));
    if (updates.timeLimitMinutes !== undefined) data.timeLimitMinutes = Math.max(1, Number(updates.timeLimitMinutes));
    if (updates.price !== undefined) data.price = Math.max(0, Number(updates.price));
    if (updates.targetScore !== undefined) data.targetScore = Math.max(0, Number(updates.targetScore));
    if (updates.bonusAmount !== undefined) data.bonusAmount = Math.max(0, Number(updates.bonusAmount));
    if (updates.rewardEnabled !== undefined) data.rewardEnabled = Boolean(updates.rewardEnabled);
    if (updates.perPointRate !== undefined) data.perPointRate = Math.max(0, Number(updates.perPointRate));
    if (updates.status !== undefined) data.status = updates.status;

    const updated = await prisma.quizPackage.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (error: any) {
    console.error("Patch quiz package error:", error);
    return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    // Check if package has attempts / purchase history
    const attemptsCount = await prisma.quizAttempt.count({
      where: { packageId: id },
    });

    if (attemptsCount > 0) {
      // Safe delete: Archive the package so user attempt history, scores and rewards are preserved
      await prisma.quizPackage.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `প্যাকেজটিতে ${attemptsCount} টি কুইজ চেষ্টা/ইতিহাস থাকায় এটি সাইট থেকে আর্কাইভ করা হয়েছে এবং সকল রেকর্ড সংরক্ষিত রয়েছে।`,
      });
    } else {
      // Hard delete: 0 attempts
      await prisma.quizPackage.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        archived: false,
        message: "প্যাকেজটি সফলভাবে সম্পূর্ণ মুছে ফেলা হয়েছে।",
      });
    }
  } catch (error: any) {
    console.error("Delete quiz package error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
  }
}
