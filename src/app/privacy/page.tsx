"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {language === "bn" ? "নীতিমালা" : "Legal Policy"}
        </span>
        <h1 className="text-3xl font-black text-gray-950">
          {language === "bn" ? "গোপনীয়তা নীতি (Privacy Policy)" : "Privacy Policy"}
        </h1>
        <p className="text-gray-500 text-xs">
          {language === "bn" ? "সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬" : "Last updated: October 2026"}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 text-sm text-gray-600 leading-relaxed">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "১. তথ্যের গোপনীয়তা ও সুরক্ষা" : "1. Data Protection & Security"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "WOJOB ব্যবহারকারীদের ব্যক্তিগত তথ্য (যেমন নাম, ফোন নম্বর, সিভি, জাতীয় পরিচয়পত্র নম্বর ও শিক্ষাগত যোগ্যতা) অত্যন্ত কঠোরভাবে এনক্রিপ্ট করে সংরক্ষণ করে। আমরা কোনো তৃতীয় পক্ষের কাছে তথ্য বিক্রি করি না।"
              : "WOJOB strictly encrypts and secures user personal data (including name, contact details, CV, NID, and academic credentials). We never sell your data to third parties."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "২. চাকরির আবেদনের তথ্য ব্যবহার" : "2. Use of Job Application Information"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "আপনি যখন কোনো চাকরির বিজ্ঞপ্তিতে '১-ক্লিকে আবেদন' করেন, কেবল সেই সার্কুলার প্রদানকারী অনুমোদিত প্রতিষ্ঠান আপনার প্রোফাইল ও সিভির স্ন্যাপশট দেখতে পারবে।"
              : "When you apply to a job circular via 1-click apply, only that authorized hiring institution can view your verified profile and snapshot."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Eye className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "৩. ওয়ালেট ও লেনদেন নিরাপত্তা" : "3. Wallet & Transaction Privacy"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "কুইজ অংশগ্রহণ, রেফারেল কমিশন এবং ওয়ালেট ক্যাশ-ইন/ক্যাশ-আউটের সকল ট্রানজ্যাকশন ব্যাংকিং লেজার স্ট্যান্ডার্ড অনুযায়ী সুরক্ষিতভাবে ট্র্যাক করা হয়।"
              : "All wallet ledger entries, quiz payouts, and cash transactions adhere to double-entry ledger security standards."}
          </p>
        </div>
      </div>
    </div>
  );
}
