"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { RefreshCcw, DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function RefundPolicyPage() {
  const { language } = useLanguage();
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings?.contentRefund) {
          setContent(data.settings.contentRefund);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {language === "bn" ? "রিফান্ড নীতি" : "Refund Policy"}
        </span>
        <h1 className="text-3xl font-black text-gray-950">
          {language === "bn" ? "রিফান্ড ও রিটার্ন নীতি (Refund Policy)" : "Refund Policy"}
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
                <RefreshCcw className="w-5 h-5 text-orange-600" />
                <span>{language === "bn" ? "১. ডিজিটাল সেবা ও কুইজ ফি" : "1. Digital Services & Quiz Fees"}</span>
              </h3>
              <p>
                {language === "bn"
                  ? "WOJOB-এর কুইজ প্যাকেজ ও প্রিপারেশন সেবাগুলো তাৎক্ষণিক ব্যবহারযোগ্য ডিজিটাল সেবা। কুইজ প্যাকেজ ক্রয় সম্পন্ন করার পর এবং প্রশ্নসমূহ উন্মুক্ত হওয়ার পর সাধারণ ক্ষেত্রে ফি অফেরতযোগ্য।"
                  : "WOJOB quiz packages and digital preparation tools are immediately accessible digital services. Once a quiz package is purchased and accessed, standard fees are non-refundable."}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span>{language === "bn" ? "২. ওয়ালেট ক্যাশ-ইন ও ক্যাশ-আউট" : "2. Wallet Cash-in & Cash-out"}</span>
              </h3>
              <p>
                {language === "bn"
                  ? "ওয়ালেটে ব্যবহার না হওয়া নগদ অর্থ আপনি যেকোনো সময় আপনার রেজিস্টার্ড বিকাশ/নগদ/রকেটে 'ক্যাশ-আউট' সুবিধার মাধ্যমে তুলে নিতে পারবেন। এর জন্য কোনো আলাদা রিফান্ড আবেদন প্রয়োজন নেই।"
                  : "Unused wallet balance can be withdrawn at any time to your registered bKash/Nagad/Rocket account via our Cash-out feature. No formal refund ticket is required."}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                <span>{language === "bn" ? "৩. আবেদন ফি রিভার্সাল ও রিফান্ড" : "3. Application Fee Reversal & Refunds"}</span>
              </h3>
              <p>
                {language === "bn"
                  ? "সার্ভার এরর অথবা যেকোনো অনিচ্ছাকৃত অতিরিক্ত আবেদন ফি কর্তন করা হলে, সাপোর্টে যোগাযোগ করার পর আমাদের সুপার এডমিন প্যানেল থেকে অপরিবর্তনযোগ্য রিভার্সাল লেজার এন্ট্রির মাধ্যমে সরাসরি প্রার্থী ওয়ালেটে টাকা ফেরত প্রদান করা হবে।"
                  : "In case of duplicate charges or technical faults, our Super Admin initiates an immutable reversal ledger entry to instantly refund the fee directly back to the candidate's wallet."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
