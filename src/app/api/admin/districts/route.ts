import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const districts = await prisma.district.findMany({
      include: {
        channelPartner: {
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
          },
        },
        _count: {
          select: { agents: true, candidateProfiles: true, jobs: true },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, districts });
  } catch (error: any) {
    console.error("GET districts error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch districts" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin required" }, { status: 403 });
    }

    const { id, nameBn, nameEn, division } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "District ID required" }, { status: 400 });
    }

    const data: any = {};
    if (nameBn !== undefined) data.nameBn = nameBn;
    if (nameEn !== undefined) data.nameEn = nameEn;
    if (division !== undefined) data.division = division;

    const district = await prisma.district.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({ success: true, district });
  } catch (error: any) {
    console.error("Update district error:", error);
    return NextResponse.json({ error: error.message || "Failed to update district" }, { status: 500 });
  }
}
