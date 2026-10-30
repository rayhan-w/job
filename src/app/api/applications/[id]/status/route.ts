import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTemplatedSms } from "@/lib/sms";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json(); // APPLIED, VIEWED, SHORTLISTED, INTERVIEW_CALLED, SELECTED, REJECTED

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        customer: {
          include: { user: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check permission: Institution owner or Admin
    if (session.role === "INSTITUTION") {
      const inst = await prisma.institution.findUnique({
        where: { userId: session.userId },
      });
      if (application.job.institutionId !== inst?.id) {
        return NextResponse.json({ error: "Forbidden: Not your job application" }, { status: 403 });
      }
    } else if (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id: application.id },
      data: { status },
    });

    // In-app Notification for candidate (Acceptance test 8)
    await prisma.notification.create({
      data: {
        userId: application.customer.userId,
        titleBn: "আবেদনের স্ট্যাটাস পরিবর্তন",
        titleEn: "Application Status Updated",
        messageBn: `${application.job.organizationName}-এ '${application.job.titleBn}' পদের আপনার আবেদনটির স্ট্যাটাস এখন '${status}'।`,
        messageEn: `Your application for '${application.job.titleEn}' at ${application.job.organizationName} is now '${status}'.`,
        link: "/dashboard/applications",
      },
    });

    // Sandbox SMS log creation
    await sendTemplatedSms("APPLICATION_STATUS", application.customer.user.phone, {
      name: application.customer.user.name,
      organization: application.job.organizationName,
      status,
    });

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      application: updated,
    });
  } catch (error: any) {
    console.error("Update application status error:", error);
    return NextResponse.json({ error: error.message || "Failed to update status" }, { status: 500 });
  }
}
