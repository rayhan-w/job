"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { Landmark, Building2, Sprout, Fish, ShieldCheck, Users, Award, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
          {language === "bn" ? "আমাদের পরিচিতি" : "About Us"}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
          {language === "bn"
            ? "WOJOB: বাংলাদেশের স্মার্ট জব ও ক্যারিয়ার পোর্টাল"
            : "WOJOB: Smart Job & Career Portal of Bangladesh"}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {language === "bn"
            ? "আমরা চাকরিপ্রার্থী এবং নিয়োগকারী প্রতিষ্ঠানের মাঝে একটি সহজ, নির্ভরযোগ্য ও ডিজিটাল সেতুবন্ধন তৈরি করছি। ১-ক্লিক প্রোফাইল সিস্টেমের মাধ্যমে বারবার ফর্ম পূরণের ঝামেলা দূর করেছি।"
            : "We bridge the gap between job seekers and employers with a seamless, reliable digital ecosystem featuring a 1-click portfolio application workflow."}
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
            {language === "bn" ? "বেসরকারি চাকরি" : "Private Sector"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "শীর্ষস্থানীয় মাল্টিন্যাশনাল, কর্পোরেট ও টেক কোম্পানিগুলোর নিয়মিত নিয়োগ সার্কুলার।"
              : "Top vacancies from multinational corporations, conglomerates, and IT firms."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            {language === "bn" ? "কৃষি ও এগ্রো-ফার্মিং" : "Agriculture"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "দেশের দ্রুত বর্ধনশীল কৃষি খাতের বিশেষজ্ঞ ও মাঠপর্যায়ের কর্মসংস্থানের বিশেষ প্ল্যাটফর্ম।"
              : "Specialized openings in agriculture extension, agro-processing, and seed technologies."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Fish className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">
            {language === "bn" ? "মৎস্য ও অ্যাকুয়াকালচার" : "Fisheries"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === "bn"
              ? "মৎস্য চাষ, হ্যাচারি ব্যবস্থাপনা ও ব্লু-ইকোনমি সেক্টরের ক্যারিয়ার সুযোগ।"
              : "Opportunities across commercial aquaculture, hatcheries, and blue economy projects."}
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/10">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-black">
            {language === "bn" ? "আপনার ক্যারিয়ার শুরু করতে প্রস্তুত?" : "Ready to Start Your Career?"}
          </h3>
          <p className="text-orange-100 text-xs sm:text-sm max-w-lg">
            {language === "bn"
              ? "এখনই বিনামূল্যে রেজিস্ট্রেশন করুন এবং আপনার প্রোফাইল তৈরি করে চাকরির সার্কুলার দেখুন।"
              : "Create your free candidate account and apply in 1-click to top opportunities."}
          </p>
        </div>
        <Link
          href="/register"
          className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-6 py-3 rounded-full text-xs transition shadow-md shrink-0 flex items-center gap-1.5"
        >
          <span>{language === "bn" ? "নিবন্ধন করুন" : "Register Now"}</span>
          <ArrowRight className="w-4 h-4 text-orange-600" />
        </Link>
      </div>
    </div>
  );
}
