"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { FileText, CheckCircle2, AlertCircle, ShieldAlert, Award } from "lucide-react";

export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {language === "bn" ? "ব্যবহারের শর্তাবলী" : "Terms of Service"}
        </span>
        <h1 className="text-3xl font-black text-gray-950">
          {language === "bn" ? "শর্তাবলী ও নিয়মাবলী (Terms & Conditions)" : "Terms & Conditions"}
        </h1>
        <p className="text-gray-500 text-xs">
          {language === "bn" ? "সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬" : "Last updated: October 2026"}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 text-sm text-gray-600 leading-relaxed">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "১. সাধারণ ব্যবহারের নিয়মাবলী" : "1. General Usage Terms"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "WOJOB প্ল্যাটফর্মে রেজিস্ট্রেশন ও ব্যবহারের মাধ্যমে আপনি আমাদের সকল নিয়ম ও শর্তাবলী মেনে নিতে সম্মতি প্রদান করছেন। মিথ্যা বা ভুয়া তথ্য প্রদান করে একাউন্ট খোলা বা অপব্যবহার করা আইনত দণ্ডনীয়।"
              : "By registering and using the WOJOB platform, you agree to comply with all terms and conditions. Providing false information or misusing the service is strictly prohibited."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "২. চাকরির আবেদন ও প্রার্থীর যোগ্যতা" : "2. Job Applications & Eligibility"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "প্রার্থীকে চাকরির বিজ্ঞপ্তির শর্তাবলী ও শিক্ষাগত যোগ্যতা পূরণ সাপেক্ষে আবেদন করতে হবে। ১-ক্লিকে আবেদন প্রক্রিয়ায় প্রার্থীর সংরক্ষিত প্রোফাইল ডাটা নিয়োগকারী প্রতিষ্ঠানে পৌঁছাবে।"
              : "Candidates must meet the criteria and qualifications stated in the job circular. Using the 1-click apply feature transmits your saved verified profile snapshot to the employer."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "৩. কুইজ ও প্রস্তুতি প্যাকেজ" : "3. Quiz & Preparation Packages"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "কুইজ প্যাকেজে অংশগ্রহণ করতে ওয়ালেট ব্যালেন্সের মাধ্যমে সক্রিয় সাবস্ক্রিপশন থাকতে হবে। যেকোনো ধরনের অনৈতিক সুবিধা গ্রহণ বা কুইজে অসদুপায় অবলম্বন করলে ফলাফল বাতিল এবং একাউন্ট সাময়িক স্থগিত হতে পারে।"
              : "Participating in quiz packages requires an active package purchased via your wallet balance. Any unfair means or cheating will result in disqualification and possible account suspension."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "৪. একাউন্ট ও ক্রেডেনশিয়াল নিরাপত্তা" : "4. Account & Credential Security"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "আপনার একাউন্টের লগইন তথ্য ও পাসওয়ার্ডের সম্পূর্ণ দায়িত্ব আপনার। কোনো অননুমোদিত অ্যাক্সেস বা সন্দেহের ক্ষেত্রে তাৎক্ষণিকভাবে পাসওয়ার্ড রিসেট করুন অথবা আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।"
              : "You are solely responsible for maintaining the confidentiality of your login credentials. If you suspect unauthorized access, reset your password immediately or contact our support team."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "৫. সংশোধন ও আইনের এখতিয়ার" : "5. Amendments & Jurisdiction"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "WOJOB কর্তৃপক্ষ যেকোনো সময় প্ল্যাটফর্মের নীতিমালায় প্রয়োজনীয় পরিবর্তন বা পরিবর্ধন করার অধিকার সংরক্ষণ করে। সকল বিরোধ গণপ্রজাতন্ত্রী বাংলাদেশের প্রযোজ্য আইন অনুযায়ী নিষ্পত্তি হবে।"
              : "WOJOB reserves the right to amend these terms at any time. Any disputes arising hereunder shall be governed by the laws of Bangladesh."}
          </p>
        </div>
      </div>
    </div>
  );
}
