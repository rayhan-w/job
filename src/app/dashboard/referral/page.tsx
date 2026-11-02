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
  AlertCircle,
  Percent,
} from "lucide-react";

export default function ReferralPage() {
  const { language, t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [refInfo, setRefInfo] = useState<{
    publicReferralEnabled: boolean;
    defaultAgentPct: number;
    defaultCpPct: number;
  }>({
    publicReferralEnabled: true,
    defaultAgentPct: 10,
    defaultCpPct: 5,
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/referral/info").then((r) => (r.ok ? r.json() : null)),
    ]).then(([meData, infoData]) => {
      if (meData?.user) setUserData(meData.user);
      if (infoData) setRefInfo(infoData);
    });
  }, []);

  const refCode = userData?.referralCode || userData?.agent?.referralCode || "";
  const refLink =
    typeof window !== "undefined" && refCode
      ? `${window.location.origin}/register?ref=${refCode}`
      : "";

  const copyToClipboard = (text: string, isLink: boolean) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isLink) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const agent = userData?.customer?.agent || userData?.agent;
  const agentName =
    agent?.user?.name ||
    userData?.referrer?.name ||
    (language === "bn" ? "সরাসরি নিবন্ধিত (সিস্টেম)" : "Direct Registration (System)");

  const agentPhone =
    agent?.user?.phone ||
    userData?.referrer?.phone ||
    (language === "bn" ? "কোনো রেফারেল মাধ্যম নেই" : "No direct agent phone");

  // Item 5a: Channel Partner follows user's registration district.
  // One CP per district. If no CP, show pending/not-assigned (never default to Dhaka).
  const assignedCp = userData?.customer?.channelPartner || userData?.customer?.agent?.channelPartner;
  const cpName = assignedCp?.user?.name
    ? assignedCp.user.name
    : language === "bn"
    ? "চ্যানেল পার্টনার নির্ধারিত হয়নি (অপেক্ষমান)"
    : "Channel Partner Not Assigned (Pending)";

  const cpDistrict = assignedCp?.district?.nameBn
    ? `${assignedCp.district.nameBn} জেলা`
    : language === "bn"
    ? "আপনার জেলার জন্য চ্যানেল পার্টনার নিয়োগ প্রক্রিয়াধীন"
    : "Appointment in progress for your district";

  const isCandidate = userData?.role === "CUSTOMER";
  const hidePublicReferral = isCandidate && !refInfo.publicReferralEnabled;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={userData?.role} />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {language === "bn" ? "রেফারেল ও জেলা পার্টনার তথ্য" : "Referral & District Partner Info"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === "bn"
                ? "আপনার নির্ধারিত জেলা এজেন্ট, চ্যানেল পার্টনার ও কমিশনের তথ্য।"
                : "Information about your assigned district agent, channel partner, and commission structure."}
            </p>
          </div>

          {/* Commission Structure Cards (Item 5b) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-3xl border border-orange-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                  {language === "bn" ? "জেলা এজেন্ট কমিশন" : "District Agent Commission"}
                </span>
                <div className="text-2xl font-black text-gray-900">
                  {refInfo.defaultAgentPct}%
                </div>
                <p className="text-xs text-gray-600">
                  {language === "bn" ? "এজেন্টের মাধ্যমে সকল সফল লেনদেনে" : "On all eligible transactions"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <Percent className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-3xl border border-blue-200/80 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {language === "bn" ? "চ্যানেল পার্টনার কমিশন" : "Channel Partner Commission"}
                </span>
                <div className="text-2xl font-black text-gray-900">
                  {refInfo.defaultCpPct}%
                </div>
                <p className="text-xs text-gray-600">
                  {language === "bn" ? "জেলার সকল সেবা ও প্যাকেজ বিক্রয়ে" : "On district-level turnover"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Referral Link & Code Box (Item 6c Public Referral toggle) */}
          {hidePublicReferral ? (
            <div className="p-6 bg-amber-50/70 border border-amber-200 rounded-3xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {language === "bn" ? "পাবলিক রেফারেল সাময়িকভাবে স্থগিত" : "Public Referral Currently Inactive"}
                </span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                {language === "bn"
                  ? "অ্যাডমিন কর্তৃক সাধারণ চাকরিপ্রার্থীদের জন্য পাবলিক রেফারেল কোড সাময়িকভাবে বন্ধ রাখা হয়েছে। শুধুমাত্র অনুমোদিত জেলা এজেন্ট ও চ্যানেল পার্টনারের মাধ্যমে নতুন ব্যবহারকারী নিবন্ধন ও কমিশন সুবিধা সচল রয়েছে।"
                  : "Public candidate referral is currently turned off by the platform administrator. New candidate registrations and commission flows are exclusively managed by authorized district agents and channel partners."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {language === "bn" ? "আপনার রেফারেল কোড" : "Your Referral Code"}
                </label>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xl font-black text-gray-900 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl flex-1 tracking-wider">
                    {refCode}
                  </div>
                  <button
                    onClick={() => copyToClipboard(refCode, false)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>
                      {copiedCode
                        ? language === "bn" ? "কপি হয়েছে!" : "Copied!"
                        : language === "bn" ? "কপি করুন" : "Copy Code"}
                    </span>
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
                    <span>
                      {copiedLink
                        ? language === "bn" ? "লিংক কপি হয়েছে!" : "Link Copied!"
                        : language === "bn" ? "লিংক কপি করুন" : "Copy Link"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My Agent & Channel Partner Card (Item 5a) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {language === "bn" ? "আমার জেলা এজেন্ট" : "My District Agent"}
                </div>
                <div className="font-bold text-gray-900 text-base mt-0.5 truncate">
                  {agentName}
                </div>
                <div className="text-xs text-gray-500 truncate">{agentPhone}</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {language === "bn" ? "আমার চ্যানেল পার্টনার" : "Channel Partner"}
                </div>
                <div className={`font-bold text-base mt-0.5 truncate ${assignedCp ? "text-gray-900" : "text-amber-700"}`}>
                  {cpName}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {cpDistrict}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
