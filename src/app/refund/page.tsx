"use client";

import React from "react";
import { useLanguage } from "@/components/LanguageContext";
import { RefreshCcw, DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function RefundPolicyPage() {
  const { language } = useLanguage();

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
          {language === "bn" ? "সর্বশেষ হালনাগাদ: অক্টোবর ২০২৬" : "Last updated: October 2026"}
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6 text-sm text-gray-600 leading-relaxed">
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
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "৩. প্রযুক্তিগত ত্রুটি ও দ্বৈত লেনদেন" : "3. Technical Errors & Double Debits"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "সার্ভার ক্র্যাশ বা পেমেন্ট গেটওয়ের ত্রুটির কারণে আপনার অ্যাকাউন্ট থেকে একাধিকবার অর্থ কর্তন হলে বা প্যাকেজ সক্রিয় না হলে, অতিরিক্ত অর্থ স্বয়ংক্রিয়ভাবে ৩ থেকে ৫ কার্যদিবসের মধ্যে আপনার ওয়ালেটে অথবা মূল পেমেন্ট মাধ্যমে ফেরত দেওয়া হবে।"
              : "If a technical glitch or payment gateway error causes a duplicate debit or fails to activate the purchased package, excess charges will be refunded to your wallet or original payment method within 3 to 5 business days."}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "৪. রিফান্ড আবেদনের প্রক্রিয়া" : "4. How to Request a Refund"}</span>
          </h3>
          <p>
            {language === "bn"
              ? "কোনো অমীমাংসিত পেমেন্ট বা রিফান্ড সংক্রান্ত বিষয়ে আমাদের সাপোর্ট পেজে যোগাযোগ করুন অথবা ট্রানজ্যাকশন আইডি (TrxID) সহ support@wojob.com এ ইমেইল পাঠান। আমাদের টিম ৪৮ ঘণ্টার মধ্যে তদন্ত সম্পন্ন করবে।"
              : "For any payment dispute, contact our support page or email support@wojob.com with your TrxID. Our verification team will investigate and respond within 48 hours."}
          </p>
        </div>
      </div>
    </div>
  );
}
