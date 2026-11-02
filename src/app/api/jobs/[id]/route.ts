import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        workplaceDistrict: true,
        institution: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            logo: true,
            address: true,
            verified: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job circular not found" },
        { status: 404 }
      );
    }

    let hasApplied = false;
    let userRole = null;
    let isLoggedIn = false;
    let profileComplete = false;
    let walletBalance = 0;

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
                wallet: true,
              },
            },
            applications: {
              where: { jobId: id },
            },
          },
        });

        if (customer) {
          hasApplied = customer.applications.length > 0;
          const userObj = customer.user;
          const phoneValid = Boolean(userObj?.candidateProfile?.phone || userObj?.phone);
          const hasEdu = Boolean(userObj?.educations && userObj.educations.length > 0);
          profileComplete = phoneValid && hasEdu;
          walletBalance = userObj?.wallet?.balance || 0;
        }
      }
    }

    return NextResponse.json({
      success: true,
      job,
      hasApplied,
      isLoggedIn,
      userRole,
      profileComplete,
      walletBalance,
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
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl || null;
    if (body.applicationFee !== undefined) updateData.applicationFee = Math.max(0, Number(body.applicationFee) || 0);
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.jobType !== undefined) updateData.jobType = body.jobType;
    if (body.workplaceLocation !== undefined) updateData.workplaceLocation = body.workplaceLocation;
    if (body.workplaceDistrictId !== undefined) {
      updateData.workplaceDistrictId = body.workplaceDistrictId ? Number(body.workplaceDistrictId) : null;
    }
    if (body.vacancy !== undefined) updateData.vacancy = Math.max(1, Number(body.vacancy) || 1);
    if (body.salaryRange !== undefined) updateData.salaryRange = body.salaryRange;
    if (body.educationReq !== undefined) updateData.educationReq = body.educationReq;
    if (body.experienceReq !== undefined) updateData.experienceReq = body.experienceReq;
    if (body.ageLimit !== undefined) updateData.ageLimit = body.ageLimit;
    if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities;
    if (body.otherReqs !== undefined) updateData.otherReqs = body.otherReqs;
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

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const appsCount = job._count.applications;

    if (appsCount > 0) {
      // Safe delete: Archive the job so applications and candidate records are preserved
      await prisma.job.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `চাকরিটিতে ${appsCount} টি আবেদন জমা থাকায় এটি সাইট থেকে আর্কাইভ করা হয়েছে এবং সকল আবেদন সংরক্ষিত রয়েছে।`,
      });
    } else {
      // Hard delete: 0 applications
      await prisma.job.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        archived: false,
        message: "চাকরিটি সফলভাবে সম্পূর্ণ মুছে ফেলা হয়েছে।",
      });
    }
  } catch (error: any) {
    console.error("Delete job error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete job" }, { status: 500 });
  }
}
