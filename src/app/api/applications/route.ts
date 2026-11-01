import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
    });

    if (!customer) {
      return NextResponse.json({
        success: true,
        applications: [],
        counts: { totalApplications: 0, totalShortlisted: 0, totalInterview: 0, totalQuizAttempts: 0 },
      });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { customerId: customer.id },
      include: {
        job: {
          select: {
            id: true,
            titleBn: true,
            titleEn: true,
            organizationName: true,
            workplaceLocation: true,
            jobType: true,
            deadline: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    const totalApplications = applications.length;
    const totalShortlisted = applications.filter(
      (a) => a.status === "SHORTLISTED" || a.status === "SELECTED"
    ).length;
    const totalInterview = applications.filter((a) => a.status === "INTERVIEW_CALLED").length;

    const totalQuizAttempts = await prisma.quizAttempt.count({
      where: { userId: session.userId },
    });

    return NextResponse.json({
      success: true,
      applications,
      counts: {
        totalApplications,
        totalShortlisted,
        totalInterview,
        totalQuizAttempts,
      },
    });
  } catch (error: any) {
    console.error("Fetch user applications error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch applications" }, { status: 500 });
  }
}
