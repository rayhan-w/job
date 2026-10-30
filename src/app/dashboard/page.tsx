"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  Wallet,
  Briefcase,
  Bookmark,
  HelpCircle,
  Share2,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          setUserData(data.user);
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => (window.location.href = "/login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const completeness = userData?.candidateProfile?.completeness ?? 78;
  const walletBalance = userData?.wallet?.balance ?? 2450;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <DashboardSidebar userRole={userData?.role} />

        {/* Main Dashboard Area matching screenshot */}
        <div className="flex-1 space-y-8">
          {/* Top Greeting Header */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {language === "bn"
                  ? `শুভ সকাল, ${userData?.name || "রাহাতুল ইসলাম"}!`
                  : `Good morning, ${userData?.name || "Rahatul Islam"}!`}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {language === "bn"
                  ? "আপনার ক্যারিয়ার ড্যাশবোর্ড ওভারভিউ"
                  : "Your career dashboard overview"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
                {language === "bn" ? "প্রার্থী অ্যাকাউন্ট" : "Candidate Account"}
              </span>
            </div>
          </div>

          {/* Top 2 Primary Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Profile Completion Ring Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${completeness}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-black text-gray-900 text-lg">
                  {completeness}%
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {language === "bn" ? "প্রোফাইল সম্পূর্ণ" : "Profile Completed"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {language === "bn"
                    ? `আপনার প্রোফাইল ${completeness}% সম্পূর্ণ হয়েছে`
                    : `Your profile is ${completeness}% complete`}
                </p>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-3"
                >
                  <span>{language === "bn" ? "প্রোফাইল সম্পূর্ণ করুন" : "Complete Profile"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Wallet Balance Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {language === "bn" ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                    ৳ {walletBalance.toLocaleString()}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <Link
                  href="/dashboard/wallet?action=cash-in"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center transition shadow-sm"
                >
                  {language === "bn" ? "ক্যাশ ইন" : "Cash In"}
                </Link>
                <Link
                  href="/dashboard/wallet?action=cash-out"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-xl text-xs text-center transition shadow-sm"
                >
                  {language === "bn" ? "ক্যাশ আউট" : "Cash Out"}
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Stat Badges matching screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  {language === "bn" ? "মোট আবেদন" : "Total Applied"}
                </div>
                <div className="text-xl font-black text-gray-900 mt-0.5">12</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  {language === "bn" ? "সংরক্ষিত চাকরি" : "Saved Jobs"}
                </div>
                <div className="text-xl font-black text-gray-900 mt-0.5">8</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  {language === "bn" ? "কুইজ চেষ্টা" : "Quiz Attempts"}
                </div>
                <div className="text-xl font-black text-gray-900 mt-0.5">3</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  {language === "bn" ? "রেফারেল" : "Referrals"}
                </div>
                <div className="text-xl font-black text-gray-900 mt-0.5">1</div>
              </div>
            </div>
          </div>

          {/* Recent Applications Table matching screenshot */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? "সাম্প্রতিক আবেদনসমূহ" : "Recent Applications"}
              </h2>
              <Link
                href="/dashboard/applications"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>{language === "bn" ? "সব দেখুন" : "View All"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{language === "bn" ? "পদের নাম" : "Job Title"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "প্রতিষ্ঠান" : "Organization"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "আবেদনের তারিখ" : "Applied Date"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">সহকারী পরিচালক</td>
                    <td className="px-6 py-4">বাংলাদেশ সরকারি কর্ম কমিশন</td>
                    <td className="px-6 py-4 text-xs text-gray-500">১০ জুন ২০২৬</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Applied
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">Software Engineer</td>
                    <td className="px-6 py-4">BRACNet</td>
                    <td className="px-6 py-4 text-xs text-gray-500:">৪ জুন ২০২৬</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Viewed
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">Probationary Officer</td>
                    <td className="px-6 py-4">Eastern Bank PLC</td>
                    <td className="px-6 py-4 text-xs text-gray-500">৩ জুন ২০২৬</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Shortlisted
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">Program Officer</td>
                    <td className="px-6 py-4">Save the Children</td>
                    <td className="px-6 py-4 text-xs text-gray-500">১ জুন ২০২৬</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Interview Called
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
