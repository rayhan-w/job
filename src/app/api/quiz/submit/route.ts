import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditWallet } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId, answers = {}, timeTakenSeconds = 0 } = await req.json();

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: { package: true },
    });

    if (!attempt || attempt.userId !== session.userId) {
      return NextResponse.json({ error: "Quiz attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Quiz has already been submitted." }, { status: 400 });
    }

    // Evaluate answers
    const questionIds = Object.keys(answers);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;

    const answerRecords = [];

    for (const q of questions) {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctOption;

      if (isCorrect) {
        correctCount += 1;
        totalScore += q.marks;
      } else if (selected) {
        wrongCount += 1;
        totalScore = Math.max(0, totalScore - q.negativeMarks);
      }

      answerRecords.push({
        attemptId: attempt.id,
        questionId: q.id,
        selectedOption: selected || null,
        isCorrect,
      });
    }

    // Save answer records
    if (answerRecords.length > 0) {
      await prisma.quizAnswer.createMany({
        data: answerRecords,
      });
    }

    // Check Bonus Rule (Acceptance test 21)
    let bonusAwarded = false;
    let bonusAmount = 0;

    if (totalScore >= attempt.package.targetScore && attempt.package.bonusAmount > 0) {
      bonusAwarded = true;
      bonusAmount = attempt.package.bonusAmount;

      // Credit bonus directly to wallet with immutable ledger entry
      await creditWallet({
        userId: session.userId,
        amount: bonusAmount,
        type: "QUIZ_BONUS",
        referenceType: "QuizAttempt",
        referenceId: attempt.id,
        note: `Target score bonus for quiz: ${attempt.package.nameBn}`,
        createdBy: "SYSTEM",
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: session.userId,
          titleBn: "কুইজ বোনাস পুরস্কার!",
          titleEn: "Quiz Bonus Reward!",
          messageBn: `অভিনন্দন! আপনি কুইজে টার্গেট স্কোর অর্জন করায় আপনার ওয়ালেটে ৳ ${bonusAmount} বোনাস যোগ হয়েছে।`,
          messageEn: `Congratulations! ৳ ${bonusAmount} bonus has been credited to your wallet for reaching the target score.`,
          link: "/dashboard/wallet",
        },
      });
    }

    // Update attempt
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        score: totalScore,
        totalQuestions: questionIds.length,
        correctCount,
        wrongCount,
        timeTakenSeconds,
        bonusAwarded,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        score: totalScore,
        targetScore: attempt.package.targetScore,
        correctCount,
        wrongCount,
        totalQuestions: questionIds.length,
        timeTakenSeconds,
        bonusAwarded,
        bonusAmount,
      },
    });
  } catch (error: any) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit quiz" }, { status: 500 });
  }
}
