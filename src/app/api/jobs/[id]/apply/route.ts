import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTemplatedSms } from "@/lib/sms";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const session = await getSession();

    if (!session || session.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only registered job seekers can apply for jobs." },
        { status: 403 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          include: {
            candidateProfile: true,
            educations: true,
            experiences: true,
            skills: true,
            cvFile: true,
            wallet: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Candidate account not found" }, { status: 404 });
    }

    // Check minimum profile requirements (phone, and at least 1 education)
    const profile = customer.user.candidateProfile;
    const educations = customer.user.educations;

    if (!profile || !profile.phone || educations.length === 0) {
      return NextResponse.json(
        {
          error: "Incomplete profile: Please add at least one education entry and phone number in your profile before applying.",
          missing: {
            education: educations.length === 0,
            phone: !profile?.phone,
          },
        },
        { status: 400 }
      );
    }

    // Check if job exists and is still open
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { institution: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "This job circular has been archived and is no longer accepting applications." },
        { status: 400 }
      );
    }

    if (new Date(job.deadline) < new Date()) {
      return NextResponse.json(
        { error: "This job circular has expired. Deadline has passed." },
        { status: 400 }
      );
    }

    // Idempotency check: Already applied check
    const alreadyApplied = await prisma.jobApplication.findUnique({
      where: {
        jobId_customerId: {
          jobId,
          customerId: customer.id,
        },
      },
    });

    if (alreadyApplied) {
      return NextResponse.json(
        { error: "Already applied to this job.", alreadyApplied: true },
        { status: 409 }
      );
    }

    // Application fee checking
    const fee = Math.max(0, job.applicationFee || 0);
    const wallet = customer.user.wallet;
    const currentBal = wallet?.balance || 0;

    if (fee > 0 && currentBal < fee) {
      const shortfall = fee - currentBal;
      return NextResponse.json(
        {
          error: `আবেদনের জন্য ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। আবেদন ফি ৳${fee}, আপনার বর্তমান ব্যালেন্স ৳${currentBal} (ঘাটতি ৳${shortfall})। অনুগ্রহ করে ওয়ালেট ক্যাশ-ইন করুন।`,
          insufficientBalance: true,
          requiredFee: fee,
          currentBalance: currentBal,
          shortfall,
        },
        { status: 400 }
      );
    }

    // Prepare profile snapshot
    const chosenCvType = profile?.preferredCvType || "ONLINE";
    let parsedDocs = null;
    let parsedRefs = null;
    try {
      if (profile?.documents) parsedDocs = JSON.parse(profile.documents);
      if (profile?.references) parsedRefs = JSON.parse(profile.references);
    } catch {}

    const profileSnapshot = JSON.stringify({
      candidateName: customer.user.name,
      phone: customer.user.phone,
      email: customer.user.email,
      personalInfo: profile,
      chosenCvType,
      cvPdfUrl: profile?.cvPdfUrl || customer.user.cvFile?.fileUrl || null,
      educations: customer.user.educations,
      experiences: customer.user.experiences,
      skills: customer.user.skills.map((s) => s.skillName),
      documents: parsedDocs,
      references: parsedRefs,
      feePaid: fee,
      appliedDate: new Date().toISOString(),
    });

    // ATOMIC TRANSACTION: Create application + Deduct fee + Create ledger entry
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Job Application
      const app = await tx.jobApplication.create({
        data: {
          jobId,
          customerId: customer.id,
          profileSnapshot,
          feePaid: fee,
          status: "APPLIED",
        },
      });

      // 2. If fee > 0, deduct wallet balance and create APPLICATION_FEE ledger entry
      if (fee > 0) {
        if (!wallet) {
          throw new Error("Wallet not found for candidate");
        }

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { decrement: fee },
          },
        });

        if (updatedWallet.balance < 0) {
          throw new Error("Insufficient wallet balance during atomic execution");
        }

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "APPLICATION_FEE",
            amount: -fee,
            balanceAfter: updatedWallet.balance,
            referenceType: "JOB_APPLICATION",
            referenceId: app.id,
            note: `চাকরিতে আবেদন ফি কর্তন: ${job.titleBn} (${job.organizationName})`,
            createdBy: "SYSTEM",
          },
        });
      }

      // 3. Create Notification
      await tx.notification.create({
        data: {
          userId: customer.user.id,
          titleBn: "আবেদন সফল হয়েছে",
          titleEn: "Application Submitted Successfully",
          messageBn: `${job.organizationName}-এ '${job.titleBn}' পদের জন্য আবেদন সফল হয়েছে।${
            fee > 0 ? ` ওয়ালেট থেকে আবেদন ফি ৳${fee} কর্তন করা হয়েছে।` : ""
          }`,
          messageEn: `Application for '${job.titleEn}' at ${job.organizationName} submitted.${
            fee > 0 ? ` ৳${fee} application fee deducted from wallet.` : ""
          }`,
          link: "/dashboard/applications",
        },
      });

      return app;
    });

    // Send sandbox SMS confirmation (outside tx)
    try {
      await sendTemplatedSms("APPLICATION_STATUS", customer.user.phone, {
        name: customer.user.name,
        organization: job.organizationName,
        status: "Applied",
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Applied successfully in 1-click!",
      applicationId: result.id,
      feePaid: fee,
      newBalance: fee > 0 ? currentBal - fee : currentBal,
    });
  } catch (error: any) {
    console.error("Apply job error:", error);
    if (error.code === "P2002") {
      // Prisma unique constraint violation (concurrent double-click protection)
      return NextResponse.json(
        { error: "Already applied to this job. Cannot apply twice.", alreadyApplied: true },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message || "Failed to apply" }, { status: 500 });
  }
}
