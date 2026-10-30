import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, questionBn, questionEn, optionA, optionB, optionC, optionD, correctOption, explanationBn } = await req.json();

    if (!bookId || !questionBn || !optionA || !optionB || !correctOption) {
      return NextResponse.json({ error: "Book, question text, options and correct answer are required" }, { status: 400 });
    }

    let status = "PENDING";
    if (session.role === "SUPER_ADMIN" || session.role === "ADMIN_STAFF") {
      status = "APPROVED";
    }

    const question = await prisma.question.create({
      data: {
        bookId,
        questionBn,
        questionEn: questionEn || questionBn,
        optionA,
        optionB,
        optionC: optionC || "",
        optionD: optionD || "",
        correctOption,
        explanationBn,
        createdByUserId: session.userId,
        status, // Pending until admin approves (Acceptance test 18)
      },
    });

    return NextResponse.json({
      success: true,
      message: status === "PENDING" ? "Question submitted for Admin approval." : "Question created & approved.",
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
      return NextResponse.json({ error: "Only admins can approve questions" }, { status: 403 });
    }

    const { questionId, status } = await req.json(); // "APPROVED" or "REJECTED"

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { status },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    console.error("Approve question error:", error);
    return NextResponse.json({ error: error.message || "Failed to approve question" }, { status: 500 });
  }
}
