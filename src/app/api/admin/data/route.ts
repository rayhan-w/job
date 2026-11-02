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
      take: 200,
    });

    // 2. All Jobs (published, pending, expired, closed, archived)
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
      take: 100,
    });

    // 4. Cash-out requests
    const cashOutRequests = await prisma.cashOutRequest.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // 5. Quiz Packages (including archived)
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

    // 6. Agent Cash-in Confirmations (Item 6d)
    const agentCashInConfirmations = await prisma.agentCashInConfirmation.findMany({
      include: {
        agent: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
            district: true,
          },
        },
        customer: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // 7. Structure: Districts
    const districts = await prisma.district.findMany({
      include: {
        channelPartner: {
          include: {
            user: { select: { id: true, name: true, phone: true, email: true, status: true } },
          },
        },
        _count: {
          select: { agents: true, candidateProfiles: true, jobs: true },
        },
      },
      orderBy: { id: "asc" },
    });

    // 8. Structure: Channel Partners
    const channelPartners = await prisma.channelPartner.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, status: true },
        },
        district: true,
        _count: {
          select: { agents: true, customers: true, commissions: true },
        },
      },
      orderBy: { districtId: "asc" },
    });

    // 9. Structure: Agents
    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: { id: true, name: true, phone: true, email: true, status: true },
        },
        district: true,
        channelPartner: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        _count: {
          select: { customers: true, commissions: true, cashIns: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    // 10. Settings
    const settings = await prisma.setting.findMany();

    return NextResponse.json({
      success: true,
      users,
      jobs,
      cashInRequests,
      cashOutRequests,
      agentCashInConfirmations,
      quizPackages,
      districts,
      channelPartners,
      agents,
      settings,
    });
  } catch (error: any) {
    console.error("Admin data API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admin data" }, { status: 500 });
  }
}
