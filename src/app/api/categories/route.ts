import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const now = new Date();
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await prisma.jobCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            jobs: {
              where: {
                status: "PUBLISHED",
                deadline: { gte: now },
              },
            },
          },
        },
      },
      orderBy: [
        { order: "asc" },
        { nameBn: "asc" },
      ],
    });

    const data = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameBn: cat.nameBn,
      nameEn: cat.nameEn,
      icon: cat.icon || "Briefcase",
      description: cat.description || "",
      order: cat.order ?? 0,
      isActive: cat.isActive ?? true,
      jobCount: cat._count.jobs,
    }));

    const districts = await prisma.district.findMany({
      orderBy: { nameBn: "asc" },
      select: { id: true, nameBn: true, nameEn: true, division: true },
    });

    return NextResponse.json({ success: true, categories: data, districts });
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const body = await req.json();
    const { id, nameBn, nameEn, slug, icon, description, order, isActive } = body;

    if (!nameBn || !slug) {
      return NextResponse.json(
        { success: false, error: "ক্যাটাগরির নাম (বাংলা) এবং স্লাগ আবশ্যক" },
        { status: 400 }
      );
    }

    let category;
    if (id) {
      category = await prisma.jobCategory.update({
        where: { id },
        data: {
          nameBn,
          nameEn: nameEn || nameBn,
          slug,
          icon: icon || "Briefcase",
          description: description || null,
          order: typeof order === "number" ? order : 0,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
      });
    } else {
      category = await prisma.jobCategory.upsert({
        where: { slug },
        create: {
          nameBn,
          nameEn: nameEn || nameBn,
          slug,
          icon: icon || "Briefcase",
          description: description || null,
          order: typeof order === "number" ? order : 0,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
        update: {
          nameBn,
          nameEn: nameEn || nameBn,
          icon: icon || "Briefcase",
          description: description || null,
          order: typeof order === "number" ? order : 0,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
      });
    }

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Save category error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save category" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const body = await req.json();

    // Support bulk reordering: array of { id, order }
    if (Array.isArray(body?.reorder)) {
      const updates = body.reorder.map((item: { id: string; order: number }) =>
        prisma.jobCategory.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      );
      await prisma.$transaction(updates);
      return NextResponse.json({ success: true, message: "Categories reordered successfully" });
    }

    const { id, nameBn, nameEn, slug, icon, description, order, isActive } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (nameBn !== undefined) updateData.nameBn = nameBn;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (slug !== undefined) updateData.slug = slug;
    if (icon !== undefined) updateData.icon = icon;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const category = await prisma.jobCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Patch category error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let slug = searchParams.get("slug");

    if (!id && !slug) {
      try {
        const body = await req.json();
        id = body?.id;
        slug = body?.slug;
      } catch {}
    }

    if (!id && !slug) {
      return NextResponse.json(
        { success: false, error: "id or slug required to delete" },
        { status: 400 }
      );
    }

    const category = await prisma.jobCategory.findFirst({
      where: id ? { id } : { slug: slug! },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    // Safe delete check: check if any jobs belong to this category
    const jobsCount = await prisma.job.count({
      where: { categoryId: category.id },
    });

    if (jobsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `এই ক্যাটাগরিতে ${jobsCount} টি চাকরি রয়েছে। ক্যাটাগরিটি মুছে ফেলার পূর্বে চাকরিগুলো অন্য ক্যাটাগরিতে স্থানান্তর করুন অথবা মুছে ফেলুন।`,
          jobsCount,
        },
        { status: 400 }
      );
    }

    // Clean delete if no jobs exist
    await prisma.jobCategory.delete({
      where: { id: category.id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
