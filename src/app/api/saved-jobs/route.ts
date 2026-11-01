import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedJob.findMany({
      where: { userId: session.userId },
      include: {
        job: {
          include: {
            category: true,
            workplaceDistrict: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, savedJobs: saved });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch saved jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const saved = await prisma.savedJob.upsert({
      where: {
        userId_jobId: {
          userId: session.userId,
          jobId,
        },
      },
      create: {
        userId: session.userId,
        jobId,
      },
      update: {},
      include: { job: true },
    });

    return NextResponse.json({ success: true, saved });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    await prisma.savedJob.deleteMany({
      where: {
        userId: session.userId,
        jobId,
      },
    });

    return NextResponse.json({ success: true, message: "Saved job removed" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete saved job" }, { status: 500 });
  }
}
