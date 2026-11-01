import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        workplaceDistrict: true,
        institution: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check user session & application status
    let hasApplied = false;
    let isLoggedIn = false;
    let userRole = null;
    let profileComplete = false;

    const session = await getSession();
    if (session) {
      isLoggedIn = true;
      userRole = session.role;

      if (session.role === "CUSTOMER") {
        const customer = await prisma.customer.findUnique({
          where: { userId: session.userId },
          include: {
            user: {
              include: {
                candidateProfile: true,
                educations: true,
              },
            },
          },
        });

        if (customer) {
          const profile = customer.user.candidateProfile;
          const educations = customer.user.educations;
          if (profile && profile.phone && educations.length > 0) {
            profileComplete = true;
          }

          const existingApp = await prisma.jobApplication.findUnique({
            where: {
              jobId_customerId: {
                jobId: id,
                customerId: customer.id,
              },
            },
          });

          if (existingApp) {
            hasApplied = true;
          }
        }
      }
    }

    return NextResponse.json({
      job,
      hasApplied,
      isLoggedIn,
      userRole,
      profileComplete,
    });
  } catch (error) {
    console.error("GET job by id error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve job circular" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.titleBn !== undefined) updateData.titleBn = body.titleBn;
    if (body.titleEn !== undefined) updateData.titleEn = body.titleEn;
    if (body.organizationName !== undefined) updateData.organizationName = body.organizationName;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.jobType !== undefined) updateData.jobType = body.jobType;
    if (body.workplaceLocation !== undefined) updateData.workplaceLocation = body.workplaceLocation;
    if (body.workplaceDistrictId !== undefined) updateData.workplaceDistrictId = body.workplaceDistrictId ? Number(body.workplaceDistrictId) : null;
    if (body.vacancy !== undefined) updateData.vacancy = Number(body.vacancy);
    if (body.salaryRange !== undefined) updateData.salaryRange = body.salaryRange;
    if (body.educationReq !== undefined) updateData.educationReq = body.educationReq;
    if (body.experienceReq !== undefined) updateData.experienceReq = body.experienceReq;
    if (body.ageLimit !== undefined) updateData.ageLimit = body.ageLimit;
    if (body.descriptionBn !== undefined) updateData.descriptionBn = body.descriptionBn;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.deadline !== undefined) updateData.deadline = new Date(body.deadline);

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, job: updatedJob });
  } catch (error: any) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: error.message || "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete job" }, { status: 500 });
  }
}
