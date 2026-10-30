"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  Share2,
  Copy,
  Check,
  Users,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react";

export default function ReferralPage() {
  const { language, t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUserData(data.user);
      });
  }, []);

  const refCode = userData?.agent?.referralCode || "REF12345";
  const refLink = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${refCode}` : `http://localhost:3000/register?ref=${refCode}`;

  const copyToClipboard = (text: string, isLink: boolean) => {
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={userData?.role} />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {language === "bn" ? "রেফারেল ও আজীবন কমিশন" : "Referral & Lifetime Commission"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === "bn"
                ? "আপনার রেফারেল লিংক দিয়ে যুক্ত হওয়া প্রতিটি গ্রাহক আজীবন আপনার অধীনে থাকবে এবং কমিশন তৈরি করবে।"
                : "Every customer who registers through your link stays under you for life and generates commissions."}
            </p>
          </div>

          {/* Referral Link & Code Box matching mobile design screenshot */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {language === "bn" ? "রেফারেল কোড" : "Referral Code"}
              </label>
              <div className="flex items-center gap-3">
                <div className="font-mono text-xl font-black text-gray-900 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl flex-1 tracking-wider">
                  {refCode}
                </div>
                <button
                  onClick={() => copyToClipboard(refCode, false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? "কপি হয়েছে!" : "কপি করুন"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {language === "bn" ? "রেফারেল লিংক" : "Referral Link"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={refLink}
                  className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl flex-1 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(refLink, true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-sm transition shadow-sm flex items-center gap-2 shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? "লিংক কপি হয়েছে!" : "লিংক কপি করুন"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* My Agent & Channel Partner card matching mobile screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">আমার এজেন্ট</div>
                <div className="font-bold text-gray-900 text-base mt-0.5">মো: হাসানুর রহমান</div>
                <div className="text-xs text-gray-500">+880 1700000021</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">আমার চ্যানেল পার্টনার</div>
                <div className="font-bold text-gray-900 text-base mt-0.5">ঢাকা চ্যানেল পার্টনার</div>
                <div className="text-xs text-emerald-600 font-medium">ঢাকা জেলা (District Unique)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
