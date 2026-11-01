import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    // 1. Users list with wallet and candidate profile
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        wallet: {
          select: {
            balance: true,
          },
        },
        candidateProfile: {
          select: {
            completeness: true,
          },
        },
        _count: {
          select: {
            notifications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // 2. All Jobs (published, pending, expired, closed)
    const jobs = await prisma.job.findMany({
      include: {
        category: true,
        workplaceDistrict: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Cash-in requests
    const cashInRequests = await prisma.cashInRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 4. Cash-out requests
    const cashOutRequests = await prisma.cashOutRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // 5. Quiz Packages
    const quizPackages = await prisma.quizPackage.findMany({
      include: {
        book: {
          select: { nameBn: true, nameEn: true, subject: true },
        },
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 6. Settings
    const settings = await prisma.setting.findMany();

    return NextResponse.json({
      success: true,
      users,
      jobs,
      cashInRequests,
      cashOutRequests,
      quizPackages,
      settings,
    });
  } catch (error: any) {
    console.error("Admin data API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admin data" }, { status: 500 });
  }
}
