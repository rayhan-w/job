import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendTemplatedSms } from "@/lib/sms";
import { debitWallet } from "@/lib/wallet";

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
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Candidate account not found" }, { status: 404 });
    }

    // Check minimum profile requirements (photo or phone, and at least 1 education)
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

    if (new Date(job.deadline) < new Date()) {
      return NextResponse.json(
        { error: "This job circular has expired. Deadline has passed." },
        { status: 400 }
      );
    }

    // Check if already applied (Acceptance test 7)
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
        { error: "Already applied to this job." },
        { status: 409 }
      );
    }

    // Check application fee & wallet balance
    const fee = job.applicationFee || 0;
    if (fee > 0) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: session.userId },
      });
      const currentBal = wallet?.balance || 0;
      if (currentBal < fee) {
        return NextResponse.json(
          {
            error: `আবেদনের জন্য ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। আবেদন ফি ৳${fee}, আপনার বর্তমান ব্যালেন্স ৳${currentBal}। অনুগ্রহ করে ওয়ালেট ক্যাশ-ইন করুন।`,
            insufficientBalance: true,
            requiredFee: fee,
            currentBalance: currentBal,
          },
          { status: 400 }
        );
      }
    }

    // Take snapshot of profile at apply time (Section 6.3 & v8)
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

    // Save Application with profile snapshot
    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        customerId: customer.id,
        profileSnapshot,
        status: "APPLIED",
      },
    });

    // Deduct application fee from wallet if fee > 0
    if (fee > 0) {
      await debitWallet({
        userId: customer.user.id,
        amount: fee,
        type: "PURCHASE",
        referenceType: "JOB_APPLICATION",
        referenceId: application.id,
        note: `চাকরিতে আবেদন ফি কর্তন: ${job.titleBn} (${job.organizationName})`,
      });
    }

    // Create in-app notification for candidate
    await prisma.notification.create({
      data: {
        userId: customer.user.id,
        titleBn: "আবেদন সফল হয়েছে",
        titleEn: "Application Submitted Successfully",
        messageBn: `${job.organizationName}-এ '${job.titleBn}' পদের জন্য আপনার আবেদনটি গৃহীত হয়েছে।`,
        messageEn: `Your application for '${job.titleEn}' at ${job.organizationName} has been submitted.`,
        link: `/dashboard/applications`,
      },
    });

    // Send sandbox SMS confirmation
    await sendTemplatedSms("APPLICATION_STATUS", customer.user.phone, {
      name: customer.user.name,
      organization: job.organizationName,
      status: "Applied",
    });

    return NextResponse.json({
      success: true,
      message: "Applied successfully in 1-click!",
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error("Apply job error:", error);
    return NextResponse.json({ error: error.message || "Failed to apply" }, { status: 500 });
  }
}
