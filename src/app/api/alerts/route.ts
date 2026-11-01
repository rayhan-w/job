import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { userId: session.userId },
      include: {
        category: true,
        district: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Also fetch notifications for this user
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch matching jobs based on alerts
    const categoryIds = alerts.map((a) => a.categoryId).filter(Boolean) as string[];
    const districtIds = alerts.map((a) => a.districtId).filter(Boolean) as number[];

    let matchingJobs: any[] = [];
    if (categoryIds.length > 0 || districtIds.length > 0) {
      matchingJobs = await prisma.job.findMany({
        where: {
          status: "PUBLISHED",
          deadline: { gte: new Date() },
          OR: [
            ...(categoryIds.length > 0 ? [{ categoryId: { in: categoryIds } }] : []),
            ...(districtIds.length > 0 ? [{ workplaceDistrictId: { in: districtIds } }] : []),
          ],
        },
        include: {
          category: true,
          workplaceDistrict: true,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      alerts,
      notifications,
      matchingJobs,
    });
  } catch (error: any) {
    console.error("Get alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let { categoryId, districtId } = await req.json();

    if (!categoryId && !districtId) {
      return NextResponse.json({ error: "Please select a category or district for alert" }, { status: 400 });
    }

    let resolvedCategoryId: string | null = null;
    if (categoryId) {
      const cat = await prisma.jobCategory.findFirst({
        where: {
          OR: [{ id: categoryId }, { slug: categoryId }],
        },
      });
      if (cat) {
        resolvedCategoryId = cat.id;
      }
    }

    let resolvedDistrictId: number | null = null;
    if (districtId) {
      const dist = await prisma.district.findUnique({
        where: { id: Number(districtId) },
      });
      if (dist) {
        resolvedDistrictId = dist.id;
      }
    }

    if (!resolvedCategoryId && !resolvedDistrictId) {
      return NextResponse.json({ error: "Invalid category or district selected" }, { status: 400 });
    }

    const alert = await prisma.jobAlert.create({
      data: {
        userId: session.userId,
        categoryId: resolvedCategoryId,
        districtId: resolvedDistrictId,
      },
      include: {
        category: true,
        district: true,
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (error: any) {
    console.error("Create alert error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Alert ID is required" }, { status: 400 });
    }

    await prisma.jobAlert.deleteMany({
      where: {
        id,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, message: "Alert removed successfully" });
  } catch (error: any) {
    console.error("Delete alert error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
