import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const now = new Date();
    const categories = await prisma.jobCategory.findMany({
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
    });

    // Custom display order: govt, private, krishi, motso, it, others, then any newly added categories
    const prioritySlugs = ["govt", "private", "krishi", "motso", "it", "others"];
    const sorted = [...categories].sort((a, b) => {
      const idxA = prioritySlugs.indexOf(a.slug);
      const idxB = prioritySlugs.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.nameBn.localeCompare(b.nameBn);
    });

    const data = sorted.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameBn: cat.nameBn,
      nameEn: cat.nameEn,
      icon: cat.icon || "Briefcase",
      jobCount: cat._count.jobs,
    }));

    return NextResponse.json({ success: true, categories: data });
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
    const { nameBn, nameEn, slug, icon } = body;

    if (!nameBn || !slug) {
      return NextResponse.json(
        { success: false, error: "nameBn and slug are required" },
        { status: 400 }
      );
    }

    const category = await prisma.jobCategory.upsert({
      where: { slug },
      create: {
        nameBn,
        nameEn: nameEn || nameBn,
        slug,
        icon: icon || "Briefcase",
      },
      update: {
        nameBn,
        nameEn: nameEn || nameBn,
        icon: icon || "Briefcase",
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
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

    if (id) {
      await prisma.jobCategory.delete({ where: { id } });
    } else if (slug) {
      await prisma.jobCategory.delete({ where: { slug } });
    }

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
