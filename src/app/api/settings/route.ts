import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {
      siteName: "WOJOB",
      siteLogo: "",
      hotline: "09600-000000",
      supportEmail: "support@jobportal.bd",
      officeAddress: "গুলশান-১, ঢাকা, বাংলাদেশ",
      facebookUrl: "",
      youtubeUrl: "",
      linkedinUrl: "",

      // SMTP / Email Server Settings
      smtpHost: "",
      smtpPort: "465",
      smtpUser: "",
      smtpPass: "",
      smtpFrom: '"WOJOB Portal" <support@jobportal.bd>',

      // Cash-in Payment Details
      bkashNumber: "01700-000000",
      nagadNumber: "01800-000000",
      rocketNumber: "01900-000000",
      bankInfo: "City Bank A/C: 1234567890",
      cashInInstructions: "বিকাশ, নগদ বা রকেটের মাধ্যমে টাকা সেন্ড মানি/ক্যাশ ইন করে ট্রানজেকশন আইডি (TrxID) দিয়ে সাবমিট করুন।",

      // Page Contents (Admin Editable)
      contentIntro: "বাংলাদেশের সরকারি, বেসরকারি, কৃষি ও মৎস্য সেক্টরের চাকরির সর্বাধুনিক পোর্টাল। একবার প্রোফাইল বানান, ১ ক্লিকে আবেদন করুন।",
      contentHeroTitle: "এক ঠিকানায় সব চাকরি ও ক্যারিয়ার প্রস্তুতি",
      contentHeroSubtitle: "বিসিএস, সরকারি, ব্যাংক, এনজিও ও কর্পোরেট সেক্টরের যাচাইকৃত চাকরির বিজ্ঞপ্তি। একবার প্রোফাইল বানিয়ে ১-ক্লিকে সরাসরি আবেদন করুন।",
      contentHowItWorks: "সহজ ৩ ধাপে চাকরির আবেদন সম্পন্ন করুন — একবার প্রোফাইল বানান, যোগ্যতা মিলিয়ে চাকরি খুঁজুন এবং ১ ক্লিকে আবেদন করুন।",
      contentOneClick: "১ ক্লিকে সরাসরি আবেদন করুন — কোনো অতিরিক্ত ফর্ম পূরণের ঝামেলা নেই।",
      contentAbout: "WOJOB বাংলাদেশের চাকরিপ্রার্থী এবং নিয়োগকারী প্রতিষ্ঠানের মাঝে একটি সহজ, নির্ভরযোগ্য ও ডিজিটাল সেতুবন্ধন তৈরি করছে। ১-ক্লিক প্রোফাইল সিস্টেমের মাধ্যমে বারবার ফর্ম পূরণের ঝামেলা দূর করেছি।",
      contentContact: "যেকোনো অনুসন্ধান, অভিযোগ বা পরামর্শের জন্য আমাদের হটলাইন, ইমেইল অথবা অফিসে যোগাযোগ করতে পারেন। আমাদের টিম সার্বক্ষণিক সহায়তায় প্রস্তুত।",
      contentPrivacy: "গোপনীয়তা নীতি: আপনার ব্যক্তিগত তথ্য ও সিভি কেবল নিয়োগকারী প্রতিষ্ঠান এবং অনুমোদিত প্রক্রিয়ায় ব্যবহৃত হবে। আমরা আপনার তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিত করি।",
      contentTerms: "শর্তাবলী: WOJOB প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী ও ব্যবহারকারীর অধিকার ও দায়িত্বসমূহ। সকল তথ্যের সত্যতা নিশ্চিত করে আবেদন করা বাধ্যতামূলক।",
      contentRefund: "রিফান্ড নীতি: যেকোনো অননুমোদিত ফি কর্তন অথবা যোগ্য দাবি ক্ষেত্রে আমাদের সাপোর্ট সেন্টারে যোগাযোগ করলে যাচাই সাপেক্ষে ২৪-৭২ ঘণ্টার মধ্যে ওয়ালেটে রিভার্সাল/রিফান্ড প্রদান করা হবে।",

      // Money & Commission Settings
      defaultAgentCommission: "10",
      defaultCpCommission: "5",
      commissionEnabled: "true",
      publicReferralEnabled: "true",
      agentCashInEnabled: "true",

      // Global Quiz Reward Default
      globalQuizTargetScore: "8",
      globalQuizBonusAmount: "100",
      globalQuizPerPointRate: "0",
    };

    for (const s of settings) {
      map[s.key] = s.value;
    }

    return NextResponse.json({ success: true, settings: map });
  } catch (error: any) {
    console.error("Public settings API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}
