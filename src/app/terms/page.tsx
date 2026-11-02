"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { FileText, CheckCircle2, AlertCircle, ShieldAlert, Award } from "lucide-react";

export default function TermsPage() {
  const { language } = useLanguage();
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.contentTerms) {
          setContent(data.settings.contentTerms);
        }
      })
      .catch(() => {});
  }, []);

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
          {language === "bn" ? "সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬" : "Last updated: November 2026"}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 text-sm text-gray-600 leading-relaxed">
        {content ? (
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {content}
          </div>
        ) : (
          <>
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
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span>{language === "bn" ? "৩. লেনদেন ও ওয়ালেট নিরাপত্তা" : "3. Transactions & Wallet Ledger"}</span>
              </h3>
              <p>
                {language === "bn"
                  ? "সকল ওয়ালেট লেনদেন অপরিবর্তনযোগ্য লেজারের মাধ্যমে সংরক্ষিত হয়। কোনো ব্যবহারকারী অনিয়ম করলে অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে স্থগিত করার অধিকার কর্তৃপক্ষ সংরক্ষণ করে।"
                  : "All transactions are logged to an immutable ledger. The platform reserves the right to suspend accounts engaged in abusive or fraudulent transactions."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
