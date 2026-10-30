import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const globalSetting = await prisma.setting.findUnique({ where: { key: "COMMISSION_ENABLED" } });
    const rules = await prisma.commissionRule.findMany({ include: { product: true } });
    const agents = await prisma.agent.findMany({ include: { user: true, channelPartner: { include: { district: true } } } });
    const commissions = await prisma.commission.findMany({
      include: {
        order: true,
        agent: { include: { user: true } },
        channelPartner: { include: { user: true, district: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      globalEnabled: globalSetting ? globalSetting.value === "true" : true,
      rules,
      agents,
      recentCommissions: commissions,
    });
  } catch (error: any) {
    console.error("Fetch commission settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch commission settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can modify commission settings" }, { status: 403 });
    }

    const { globalEnabled, agentId, agentCommissionActive, newAgentPercentage, newCpPercentage, productId } = await req.json();

    // 1. Toggle global commission
    if (globalEnabled !== undefined) {
      await prisma.setting.upsert({
        where: { key: "COMMISSION_ENABLED" },
        create: { key: "COMMISSION_ENABLED", value: String(globalEnabled) },
        update: { value: String(globalEnabled) },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "COMMISSION_GLOBAL_TOGGLE",
          details: JSON.stringify({ enabled: globalEnabled }),
        },
      });
    }

    // 2. Toggle agent commission active state (Acceptance test 16)
    if (agentId && agentCommissionActive !== undefined) {
      await prisma.agent.update({
        where: { id: agentId },
        data: { commissionActive: Boolean(agentCommissionActive) },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "AGENT_COMMISSION_TOGGLE",
          targetType: "Agent",
          targetId: agentId,
          details: JSON.stringify({ commissionActive: agentCommissionActive }),
        },
      });
    }

    // 3. Update commission percentage (Acceptance test 17: applies to new orders only)
    if (newAgentPercentage !== undefined || newCpPercentage !== undefined) {
      if (agentId) {
        await prisma.agent.update({
          where: { id: agentId },
          data: {
            ...(newAgentPercentage !== undefined ? { commissionRate: Number(newAgentPercentage) } : {}),
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          role: session.role,
          action: "COMMISSION_RATE_UPDATE",
          details: JSON.stringify({ agentId, newAgentPercentage, newCpPercentage }),
        },
      });
    }

    return NextResponse.json({ success: true, message: "Commission configuration updated successfully" });
  } catch (error: any) {
    console.error("Update commission error:", error);
    return NextResponse.json({ error: error.message || "Failed to update commission settings" }, { status: 500 });
  }
}
