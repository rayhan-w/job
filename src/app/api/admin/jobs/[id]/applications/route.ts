import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                candidateProfile: true,
                educations: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch applicants" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Application ID and Status required" }, { status: 400 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
        job: true,
      },
    });

    // Notify candidate
    try {
      await prisma.notification.create({
        data: {
          userId: updated.customer.userId,
          titleBn: `চাকরির আবেদন আপডেট: ${status}`,
          titleEn: `Job Application Status: ${status}`,
          messageBn: `আপনার '${updated.job.titleBn}' পদের আবেদনের বর্তমান অবস্থা: ${status}`,
          messageEn: `Your application status for '${updated.job.titleEn || updated.job.titleBn}' is now ${status}`,
          link: "/dashboard/applications",
        },
      });
    } catch {}

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
