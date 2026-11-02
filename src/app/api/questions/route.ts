import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (bookId) where.bookId = bookId;
    if (status) {
      where.status = status;
    } else {
      where.status = { not: "ARCHIVED" };
    }

    if (search) {
      where.OR = [
        { questionBn: { contains: search, mode: "insensitive" } },
        { questionEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            nameBn: true,
            nameEn: true,
            subject: true,
          },
        },
        _count: {
          select: { quizAnswers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error("Fetch questions error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      id,
      bookId,
      questionBn,
      questionEn,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanationBn,
      explanationEn,
      difficulty,
      marks = 1.0,
      negativeMarks = 0.25,
      status: reqStatus,
    } = await req.json();

    if (!bookId || !questionBn || !optionA || !optionB || !correctOption) {
      return NextResponse.json({ error: "বই, প্রশ্ন, অপশন ও সঠিক উত্তর আবশ্যক" }, { status: 400 });
    }

    let status = reqStatus || "PENDING";
    if (session.role === "SUPER_ADMIN" || session.role === "ADMIN_STAFF") {
      status = reqStatus || "APPROVED";
    }

    let question;
    if (id) {
      question = await prisma.question.update({
        where: { id },
        data: {
          bookId,
          questionBn,
          questionEn: questionEn || questionBn,
          optionA,
          optionB,
          optionC: optionC || "",
          optionD: optionD || "",
          correctOption,
          difficulty: difficulty || "MEDIUM",
          marks: Number(marks) || 1.0,
          negativeMarks: Number(negativeMarks) || 0.0,
          explanationBn: explanationBn || "",
          explanationEn: explanationEn || "",
          status,
        },
        include: { book: true },
      });
    } else {
      question = await prisma.question.create({
        data: {
          bookId,
          questionBn,
          questionEn: questionEn || questionBn,
          optionA,
          optionB,
          optionC: optionC || "",
          optionD: optionD || "",
          correctOption,
          difficulty: difficulty || "MEDIUM",
          marks: Number(marks) || 1.0,
          negativeMarks: Number(negativeMarks) || 0.0,
          explanationBn: explanationBn || "",
          explanationEn: explanationEn || "",
          createdByUserId: session.userId,
          status,
        },
        include: { book: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: status === "PENDING" ? "প্রশ্নটি পর্যালোচনার জন্য জমা হয়েছে।" : "প্রশ্ন সংরক্ষিত হয়েছে।",
      question,
    });
  } catch (error: any) {
    console.error("Create question error:", error);
    return NextResponse.json({ error: error.message || "Failed to create question" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN_STAFF")) {
      return NextResponse.json({ error: "Only admins can edit/approve questions" }, { status: 403 });
    }

    const body = await req.json();
    const { questionId, id, ...updates } = body;
    const targetId = questionId || id;

    if (!targetId) {
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }

    const data: any = {};
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.questionBn !== undefined) data.questionBn = updates.questionBn;
    if (updates.questionEn !== undefined) data.questionEn = updates.questionEn;
    if (updates.optionA !== undefined) data.optionA = updates.optionA;
    if (updates.optionB !== undefined) data.optionB = updates.optionB;
    if (updates.optionC !== undefined) data.optionC = updates.optionC;
    if (updates.optionD !== undefined) data.optionD = updates.optionD;
    if (updates.correctOption !== undefined) data.correctOption = updates.correctOption;
    if (updates.difficulty !== undefined) data.difficulty = updates.difficulty;
    if (updates.marks !== undefined) data.marks = Number(updates.marks);
    if (updates.negativeMarks !== undefined) data.negativeMarks = Number(updates.negativeMarks);
    if (updates.explanationBn !== undefined) data.explanationBn = updates.explanationBn;
    if (updates.explanationEn !== undefined) data.explanationEn = updates.explanationEn;
    if (updates.bookId !== undefined) data.bookId = updates.bookId;

    const updated = await prisma.question.update({
      where: { id: targetId },
      data,
      include: { book: true },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    console.error("Update question error:", error);
    return NextResponse.json({ error: error.message || "Failed to update question" }, { status: 500 });
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
      return NextResponse.json({ error: "Question ID required" }, { status: 400 });
    }

    // Safe delete: check if question has user answers
    const answersCount = await prisma.quizAnswer.count({
      where: { questionId: id },
    });

    if (answersCount > 0) {
      // Archive question so past attempts remain intact
      await prisma.question.update({
        where: { id },
        data: { status: "ARCHIVED" },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: `প্রশ্নটিতে ${answersCount} টি উত্তরের রেকর্ড থাকায় এটি আর্কাইভ করা হয়েছে।`,
      });
    } else {
      // Hard delete
      await prisma.question.delete({
        where: { id },
      });

      return NextResponse.json({ success: true, archived: false, message: "প্রশ্নটি সম্পূর্ণ মুছে ফেলা হয়েছে।" });
    }
  } catch (error: any) {
    console.error("Delete question error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete question" }, { status: 500 });
  }
}
