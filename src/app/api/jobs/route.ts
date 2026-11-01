import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACTUAL" | "INTERNSHIP";
type JobStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "EXPIRED" | "CLOSED";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || searchParams.get("category") || "";
    const districtId = searchParams.get("districtId") || searchParams.get("district") ? Number(searchParams.get("districtId") || searchParams.get("district")) : undefined;
    const jobType = searchParams.get("jobType") as JobType | undefined;
    const status = (searchParams.get("status") as JobStatus) || "PUBLISHED";
    const sort = searchParams.get("sort");

    const whereClause: any = {
      status,
    };

    if (status === "PUBLISHED") {
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
      // Institution posts require Admin approval (Pending)
      status = "PENDING";
    } else if (session.role === "SUPER_ADMIN" || session.role === "ADMIN_STAFF") {
      postedByAdmin = true;
      status = "PUBLISHED";
    } else {
      return NextResponse.json({ error: "Forbidden: Not allowed to post jobs" }, { status: 403 });
    }

    const job = await prisma.job.create({
      data: {
        titleBn,
        titleEn: titleEn || titleBn,
        organizationName,
        categoryId,
        jobType: jobType || "FULL_TIME",
        workplaceDistrictId: workplaceDistrictId ? Number(workplaceDistrictId) : null,
        workplaceLocation,
        vacancy: vacancy ? Number(vacancy) : 1,
        salaryRange: salaryRange || "Negotiable",
        educationReq,
        experienceReq,
        ageLimit: ageLimit || null,
        responsibilities: responsibilities || null,
        otherReqs: otherReqs || null,
        descriptionBn,
        descriptionEn: descriptionEn || descriptionBn,
        deadline: new Date(deadline),
        status,
        institutionId,
        postedByAdmin,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message || "Failed to create job" }, { status: 500 });
  }
}
