import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get("packageId");

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        status: "COMPLETED",
        ...(packageId ? { packageId } : {}),
      },
      include: {
        user: {
          include: {
            candidateProfile: {
              include: { district: true },
            },
          },
        },
        package: true,
      },
      orderBy: [
        { score: "desc" },
        { timeTakenSeconds: "asc" },
      ],
      take: 20,
    });

    const leaderboard = attempts.map((a, index) => ({
      rank: index + 1,
      name: a.user.name,
      district: a.user.candidateProfile?.district?.nameBn || "ঢাকা",
      districtEn: a.user.candidateProfile?.district?.nameEn || "Dhaka",
      score: a.score,
      timeTaken: `${Math.floor(a.timeTakenSeconds / 60)}মি ${a.timeTakenSeconds % 60}সে`,
      packageName: a.package.nameBn,
      packageNameEn: a.package.nameEn,
    }));

    return NextResponse.json({ success: true, leaderboard });
  } catch (error: any) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch leaderboard" }, { status: 500 });
  }
}
