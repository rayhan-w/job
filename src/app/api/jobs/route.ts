import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACTUAL" | "INTERNSHIP";
type JobStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "EXPIRED" | "CLOSED" | "ARCHIVED";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || searchParams.get("category") || "";
    const districtId = searchParams.get("districtId") || searchParams.get("district") ? Number(searchParams.get("districtId") || searchParams.get("district")) : undefined;
    const jobType = searchParams.get("jobType") as JobType | undefined;
    const statusParam = searchParams.get("status");
    const status = (statusParam as JobStatus) || "PUBLISHED";
    const sort = searchParams.get("sort");

    const whereClause: any = {};

    if (statusParam === "ALL") {
      whereClause.status = { not: "ARCHIVED" };
    } else {
      whereClause.status = status;
    }

    if (status === "PUBLISHED" && statusParam !== "ALL") {
      whereClause.deadline = { gte: new Date() };
    }

    if (search) {
      whereClause.OR = [
        { titleBn: { contains: search, mode: "insensitive" } },
        { titleEn: { contains: search, mode: "insensitive" } },
        { organizationName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      whereClause.category = {
        OR: [{ id: categoryId }, { slug: categoryId }],
      };
    }

    if (districtId) {
      whereClause.workplaceDistrictId = districtId;
    }

    if (jobType) {
      whereClause.jobType = jobType;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "popular") {
      orderBy = [
        { applications: { _count: "desc" } },
        { publishedAt: "desc" },
      ];
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        category: true,
        workplaceDistrict: true,
        institution: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy,
    });

    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      titleBn,
      titleEn,
      organizationName,
      logoUrl,
      applicationFee,
      categoryId,
      jobType,
      workplaceDistrictId,
      workplaceLocation,
      vacancy,
      salaryRange,
      educationReq,
      experienceReq,
      ageLimit,
      responsibilities,
      otherReqs,
      descriptionBn,
      descriptionEn,
      deadline,
    } = body;

    let institutionId: string | undefined = undefined;
    let postedByAdmin = false;
    let status: JobStatus = "PUBLISHED";

    if (session.role === "INSTITUTION") {
      const inst = await prisma.institution.findUnique({
        where: { userId: session.userId },
      });
      if (!inst) {
        return NextResponse.json({ error: "Institution profile not found" }, { status: 404 });
      }
      institutionId = inst.id;
      status = "PENDING";
    } else if (session.role === "SUPER_ADMIN" || session.role === "ADMIN_STAFF") {
      postedByAdmin = true;
      status = body.status || "PUBLISHED";
    } else {
      return NextResponse.json({ error: "Forbidden: Not allowed to post jobs" }, { status: 403 });
    }

    if (!titleBn || !organizationName || !categoryId) {
      return NextResponse.json(
        { error: "পদের নাম (বাংলা), প্রতিষ্ঠানের নাম এবং ক্যাটাগরি আবশ্যক" },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        titleBn,
        titleEn: titleEn || titleBn,
        organizationName,
        logoUrl: logoUrl || null,
        applicationFee: Math.max(0, Number(applicationFee) || 0),
        categoryId,
        jobType: jobType || "FULL_TIME",
        workplaceDistrictId: workplaceDistrictId ? Number(workplaceDistrictId) : null,
        workplaceLocation: workplaceLocation || "",
        vacancy: Math.max(1, Number(vacancy) || 1),
        salaryRange: salaryRange || "আলোচনা সাপেক্ষে",
        educationReq: educationReq || "",
        experienceReq: experienceReq || "",
        ageLimit: ageLimit || "",
        responsibilities: responsibilities || "",
        otherReqs: otherReqs || "",
        descriptionBn: descriptionBn || "",
        descriptionEn: descriptionEn || "",
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 15 * 86400000),
        postedByAdmin,
        institutionId,
        status,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
