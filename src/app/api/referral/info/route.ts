import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [pubRef, agentPct, cpPct] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "PUBLIC_REFERRAL_ENABLED" } }),
      prisma.setting.findUnique({ where: { key: "DEFAULT_AGENT_COMMISSION_PCT" } }),
      prisma.setting.findUnique({ where: { key: "DEFAULT_CP_COMMISSION_PCT" } }),
    ]);

    return NextResponse.json({
      publicReferralEnabled: pubRef ? pubRef.value !== "false" : true,
      defaultAgentPct: agentPct ? Number(agentPct.value) : 10,
      defaultCpPct: cpPct ? Number(cpPct.value) : 5,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
