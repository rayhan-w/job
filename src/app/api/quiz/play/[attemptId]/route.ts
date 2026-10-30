import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { package: true },
    });

    if (!attempt || attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Quiz attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "This quiz attempt has already been submitted." }, { status: 400 });
    }

    // Only approved questions from bank (Acceptance test 18, 20)
    const allQuestions = await prisma.question.findMany({
      where: {
        bookId: attempt.package.bookId,
        status: "APPROVED",
      },
    });

    // Shuffle and pick package question count
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, attempt.package.questionCount);

    // Strip out correct answer so client cannot cheat!
    const clientQuestions = selected.map((q) => ({
      id: q.id,
      questionBn: q.questionBn,
      questionEn: q.questionEn,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: q.marks,
    }));

    return NextResponse.json({
      success: true,
      timeLimitMinutes: attempt.package.timeLimitMinutes,
      questions: clientQuestions,
      attemptId: attempt.id,
    });
  } catch (error: any) {
    console.error("Play quiz error:", error);
    return NextResponse.json({ error: error.message || "Failed to load quiz" }, { status: 500 });
  }
}
