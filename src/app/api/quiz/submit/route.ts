import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const answerRecords: any[] = [];

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

    // Calculate Quiz Reward per Admin rules:
    // target points X -> bonus ৳Y, plus optional perPointRate * totalScore
    const pkg = attempt.package;
    const isRewardEnabled = pkg.rewardEnabled !== false;
    let bonusAwarded = false;
    let rewardAmount = 0;

    if (isRewardEnabled && totalScore >= pkg.targetScore) {
      let calcAmount = pkg.bonusAmount || 0;
      if (pkg.perPointRate && pkg.perPointRate > 0) {
        calcAmount += Math.round(totalScore * pkg.perPointRate);
      }

      if (calcAmount > 0) {
        bonusAwarded = true;
        rewardAmount = calcAmount;
      }
    }

    // Atomic execution: save answers, complete attempt, credit QUIZ_REWARD ledger entry
    await prisma.$transaction(async (tx) => {
      // 1. Save answer records
      if (answerRecords.length > 0) {
        await tx.quizAnswer.createMany({
          data: answerRecords,
        });
      }

      // 2. Update attempt
      await tx.quizAttempt.update({
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

      // 3. Credit wallet reward if qualified
      if (bonusAwarded && rewardAmount > 0) {
        let wallet = await tx.wallet.findUnique({
          where: { userId: session.userId },
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: session.userId, balance: 0 },
          });
        }

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: rewardAmount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "QUIZ_REWARD",
            amount: rewardAmount,
            balanceAfter: updatedWallet.balance,
            referenceType: "QuizAttempt",
            referenceId: attempt.id,
            note: `কুইজ রিওয়ার্ড পুরস্কার: ${pkg.nameBn} (স্কোর: ${totalScore}/${questionIds.length})`,
            createdBy: "SYSTEM",
          },
        });

        await tx.notification.create({
          data: {
            userId: session.userId,
            titleBn: "কুইজ রিওয়ার্ড পুরস্কার!",
            titleEn: "Quiz Reward Credited!",
            messageBn: `অভিনন্দন! আপনি কুইজে টার্গেট স্কোর অর্জন করায় আপনার ওয়ালেটে ৳${rewardAmount} পুরস্কার যোগ হয়েছে।`,
            messageEn: `Congratulations! ৳${rewardAmount} quiz reward has been credited to your wallet for reaching target score.`,
            link: "/dashboard/wallet",
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      result: {
        score: totalScore,
        targetScore: pkg.targetScore,
        correctCount,
        wrongCount,
        totalQuestions: questionIds.length,
        timeTakenSeconds,
        bonusAwarded,
        rewardAmount,
        bonusAmount: rewardAmount,
      },
    });
  } catch (error: any) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit quiz" }, { status: 500 });
  }
}
