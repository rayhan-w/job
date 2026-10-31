import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.quizBook.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, books });
  } catch (error: any) {
    console.error("Fetch quiz books error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch quiz books" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nameBn, nameEn, subject } = await req.json();
    if (!nameBn || !subject) {
      return NextResponse.json({ error: "nameBn and subject are required" }, { status: 400 });
    }

    const book = await prisma.quizBook.create({
      data: {
        nameBn,
        nameEn: nameEn || nameBn,
        subject,
      },
    });

    return NextResponse.json({ success: true, book });
  } catch (error: any) {
    console.error("Create quiz book error:", error);
    return NextResponse.json({ error: error.message || "Failed to create quiz book" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Quiz book ID required" }, { status: 400 });
    }

    await prisma.quizBook.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Quiz book deleted" });
  } catch (error: any) {
    console.error("Delete quiz book error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete quiz book" }, { status: 500 });
  }
}
