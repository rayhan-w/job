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
