"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { Landmark, Building2, Sprout, Fish, ShieldCheck, Users, Award, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<any>({
    siteName: "WOJOB",
    contentAbout: "আমরা চাকরিপ্রার্থী এবং নিয়োগকারী প্রতিষ্ঠানের মাঝে একটি সহজ, নির্ভরযোগ্য ও ডিজিটাল সেতুবন্ধন তৈরি করছি। ১-ক্লিক প্রোফাইল সিস্টেমের মাধ্যমে বারবার ফর্ম পূরণের ঝামেলা দূর করেছি।",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setSettings((prev: any) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {language === "bn" ? "আমাদের পরিচিতি" : "About Us"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
          {settings.siteName || "WOJOB"}: {language === "bn" ? "বাংলাদেশের স্মার্ট জব ও ক্যারিয়ার পোর্টাল" : "Smart Job & Career Portal of Bangladesh"}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
          {settings.contentAbout}
        </p>
      </div>

      {/* 4 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            {language === "bn" ? "সরকারি চাকরি" : "Government"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "বিসিএস, মন্ত্রণালয়, অধিদপ্তর ও সরকারি স্বায়ত্তশাসিত প্রতিষ্ঠানের সকল অনুমোদিত বিজ্ঞপ্তি।"
              : "Verified circulars from ministries, directorates, and public institutions across Bangladesh."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            {language === "bn" ? "বেসরকারি ও মাল্টিন্যাশনাল" : "Private & MNC"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "ব্যাংক, বীমা, এনজিও, টেলিকম এবং শীর্ষস্থানীয় কর্পোরেট কোম্পানিগুলোর সেরা চাকরির সুযোগ।"
              : "Top openings in banks, NGOs, telecommunications, FMCG, and emerging tech startups."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            {language === "bn" ? "কৃষি ও এগ্রো-ফার্মিং" : "Agriculture"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "কৃষি গবেষণা, পোল্ট্রি, ডেইরি, বীজ প্রক্রিয়াকরণ ও আধুনিক এগ্রোটেক ইন্ডাস্ট্রির পদসমূহ।"
              : "Agricultural research, crop science, smart farming, poultry, and dairy management jobs."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
            <Fish className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            {language === "bn" ? "মৎস্য ও অ্যাকুয়াকালচার" : "Fisheries"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "হ্যাচারি, ফিডমিল, বাণিজ্যিক মৎস্য খামার ও সামুদ্রিক সম্পদ খাতের বিশিষ্ট চাকরির বিজ্ঞপ্তি।"
              : "Opportunities in commercial hatcheries, feed manufacturing, marine resources, and aquaculture."}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 sm:p-10 text-white text-center space-y-4 shadow-lg shadow-orange-600/20">
        <h2 className="text-2xl sm:text-3xl font-black">
          {language === "bn" ? "আজই শুরু করুন আপনার স্বপ্নের ক্যারিয়ার যাত্রা" : "Start Your Dream Career Journey Today"}
        </h2>
        <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto">
          {language === "bn"
            ? "ফ্রি অ্যাকাউন্ট খুলুন, আপনার তথ্য দিয়ে এক ক্লিকেই সিভি প্রোফাইল প্রস্তুত করুন এবং পছন্দের চাকরিতে আবেদন করুন।"
            : "Sign up free, complete your 1-click CV profile, and apply directly to top employers across the country."}
        </p>
        <div className="pt-2">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-full text-xs shadow-md hover:bg-orange-50 transition"
          >
            <span>{language === "bn" ? "সকল চাকরি দেখুন" : "Browse All Jobs"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
