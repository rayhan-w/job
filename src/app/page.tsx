"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  Search,
  MapPin,
  Calendar,
  Briefcase,
  Landmark,
  Building2,
  Sprout,
  Fish,
  Folder,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  Play,
  Upload,
  FileText,
  UserCheck,
  Check,
  TrendingUp,
  Bookmark,
  CalendarDays,
  Video,
} from "lucide-react";

export default function HomePage() {
  const { language, t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) setJobs(data.jobs);
      });
  }, []);

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    setApplyMessage(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApplyMessage({
          id: jobId,
          text: language === "bn" ? "আবেদন সফল হয়েছে ✓" : "Applied Successfully ✓",
        });
      } else {
        setApplyMessage({
          id: jobId,
          text: data.error || (language === "bn" ? "আবেদন ব্যর্থ হয়েছে" : "Application failed"),
          error: true,
        });
      }
    } catch {
      setApplyMessage({
        id: jobId,
        text: language === "bn" ? "সার্ভার এরর" : "Server error",
        error: true,
      });
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-20 pt-4">
      {/* 1. HERO SECTION matching uploaded mockup design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-[2.5rem] bg-[#F4F5F7] border border-gray-200/80 p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-sm">
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {language === "bn" ? "নতুন" : "New"}
                </span>
                <span>
                  {language === "bn"
                    ? "১-ক্লিক প্রোফাইল ও অটো-অ্যাপ্লাই ফিচার ›"
                    : "Introducing 1-Click Portfolio & Apply ›"}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.12]">
                {language === "bn" ? (
                  <>
                    স্বপ্নের চাকরি খুঁজুন <br />
                    <span className="text-orange-600">সহজ ও দ্রুত</span>
                  </>
                ) : (
                  <>
                    Find your dream <br />
                    <span className="text-orange-600">job faster</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                {language === "bn"
                  ? "শীর্ষ সরকারি, বেসরকারি, কৃষি ও মৎস্য খাতে ক্যারিয়ার গড়ার আধুনিক প্ল্যাটফর্ম। ১ বার প্রোফাইল সেভ করে ১ ক্লিকেই আবেদন করুন।"
                  : "Connect with top companies and organizations in Government, Private, Agriculture & Fisheries to unlock opportunities that grow your career."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/jobs"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3.5 rounded-full text-sm transition shadow-md shadow-orange-600/20 flex items-center gap-2"
                >
                  <span>{language === "bn" ? "চাকরি খুঁজুন" : "Find Your Job"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/dashboard/profile"
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold px-6 py-3.5 rounded-full text-sm transition shadow-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-gray-800 text-gray-800" />
                  <span>{language === "bn" ? "কীভাবে কাজ করে" : "Watch Video"}</span>
                </Link>
              </div>

              {/* Integrated Search Bar */}
              <div className="pt-4">
                <div className="bg-white p-2.5 rounded-2xl shadow-xl shadow-orange-500/5 border border-gray-200/90 flex flex-col md:flex-row items-center gap-2">
                  <div className="flex items-center gap-3 px-4 py-2 flex-1 w-full border-b md:border-b-0 md:border-r border-gray-100">
                    <Search className="w-4 h-4 text-orange-500" />
                    <input
                      type="text"
                      placeholder={t("hero_search_placeholder")}
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-full text-gray-800 text-sm focus:outline-none placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 w-full md:w-44 border-b md:border-b-0 md:border-r border-gray-100">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-gray-700 text-sm bg-transparent focus:outline-none font-medium"
                    >
                      <option value="">{t("all_categories")}</option>
                      <option value="govt">{language === "bn" ? "সরকারি" : "Government"}</option>
                      <option value="private">{language === "bn" ? "বেসরকারি" : "Private"}</option>
                      <option value="krishi">{language === "bn" ? "কৃষি" : "Agriculture"}</option>
                      <option value="motso">{language === "bn" ? "মৎস্য" : "Fisheries"}</option>
                      <option value="it">{language === "bn" ? "তথ্যপ্রযুক্তি" : "Technology & IT"}</option>
                      <option value="others">{language === "bn" ? "অন্যান্য" : "Others"}</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 w-full md:w-36">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full text-gray-700 text-sm bg-transparent focus:outline-none font-medium"
                    >
                      <option value="">{t("all_districts")}</option>
                      <option value="1">{language === "bn" ? "ঢাকা" : "Dhaka"}</option>
                      <option value="14">{language === "bn" ? "চট্টগ্রাম" : "Chattogram"}</option>
                      <option value="25">{language === "bn" ? "রাজশাহী" : "Rajshahi"}</option>
                      <option value="33">{language === "bn" ? "খুলনা" : "Khulna"}</option>
                    </select>
                  </div>

                  <Link
                    href={`/jobs?search=${encodeURIComponent(searchKeyword)}&category=${selectedCategory}&district=${selectedDistrict}`}
                    className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3 rounded-xl transition shadow-sm flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>{t("search_btn")}</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with candidate & floating category tags */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Ambient Glow */}
              <div className="absolute w-72 h-72 bg-gradient-to-tr from-amber-400/30 to-orange-500/20 rounded-full blur-3xl -z-10" />

              {/* Candidate Image Card matching the uploaded picture with yellow armchair */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white w-full max-w-sm sm:max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=900&auto=format&fit=crop"
                  alt="Candidate"
                  className="w-full h-[400px] object-cover object-top"
                />

                {/* Floating Curved Skill / Category Pills matching mockup layout */}
                <div className="absolute right-3 top-6 flex flex-col items-end gap-2.5">
                  <span className="bg-[#FEF08A] text-amber-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md border border-amber-300/80 animate-bounce delay-100">
                    💻 Technology & IT
                  </span>
                  <span className="bg-[#FED7AA] text-orange-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md border border-orange-300/80">
                    🌾 {language === "bn" ? "কৃষি ও এগ্রো-ফার্মিং" : "Agriculture & Agro"}
                  </span>
                  <span className="bg-[#BAE6FD] text-sky-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md border border-sky-300/80">
                    🐟 {language === "bn" ? "মৎস্য ও অ্যাকুয়াকালচার" : "Fisheries & Marine"}
                  </span>
                  <span className="bg-[#E9D5FF] text-purple-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md border border-purple-300/80">
                    🏛️ {language === "bn" ? "সরকারি ও প্রশাসন" : "Govt & Administration"}
                  </span>
                  <span className="bg-[#BBF7D0] text-emerald-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md border border-emerald-300/80">
                    🏢 {language === "bn" ? "বেসরকারি ও কর্পোরেট" : "Private & Corporate"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATEMENT & METRICS BANNER matching uploaded mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-block text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {language === "bn" ? "আমাদের লক্ষ্য" : "Who We Are"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
            {language === "bn"
              ? "WOJOB-এ আমরা ক্যারিয়ার গড়ার প্রক্রিয়াকে সহজ, আধুনিক ও ক্ষমতায়িত করে তুলছি — যেখানে ১ ক্লিকে যেকোনো চাকরিতে আবেদন সম্পন্ন হয়।"
              : "At WOJOB, we're redefining how people find jobs and how companies discover talent. Our mission is to make job searching simple, efficient, and empowering."}
          </h2>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-3xl p-8 shadow-lg shadow-orange-500/10 text-left relative overflow-hidden">
            <div className="text-4xl sm:text-5xl font-black">50K+</div>
            <div className="text-sm font-semibold text-orange-100 mt-2">
              {language === "bn" ? "প্রতিষ্ঠান নিয়োগ দিচ্ছে" : "Companies Hiring"}
            </div>
            <div className="text-xs text-orange-200 mt-4">
              {language === "bn" ? "সরকারি, প্রাইভেট ও এগ্রো-ফার্ম" : "Govt, Private & Agro Farms"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm text-left">
            <div className="text-4xl sm:text-5xl font-black text-gray-950">120K+</div>
            <div className="text-sm font-semibold text-gray-600 mt-2">
              {language === "bn" ? "সক্রিয় নিবন্ধিত প্রার্থী" : "Active Registered Candidates"}
            </div>
            <div className="text-xs text-gray-400 mt-4">
              {language === "bn" ? "১-ক্লিক অনলাইন সিভি প্রস্তুত" : "Verified 1-Click Portfolios"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm text-left">
            <div className="text-4xl sm:text-5xl font-black text-gray-950">99.5%</div>
            <div className="text-sm font-semibold text-gray-600 mt-2">
              {language === "bn" ? "সঠিক প্রোফাইল স্ক্রিনিং রেট" : "Candidate Matching Rate"}
            </div>
            <div className="text-xs text-gray-400 mt-4">
              {language === "bn" ? "স্বয়ংক্রিয় অ্যালগরিদম ফিল্টার" : "Fast Tracking System"}
            </div>
          </div>
        </div>
      </section>

      {/* 3. EFFORTLESS PROCESS, EXCEPTIONAL RESULTS (3 BENTO CARDS MATCHING MOCKUP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight uppercase">
            {language === "bn" ? "সহজ প্রক্রিয়া, দুর্দান্ত ফলাফল" : "Effortless Process, Exceptional Results"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {language === "bn"
              ? "আমাদের আধুনিক পদ্ধতিতে মাত্র তিনটি ধাপে তৈরি করুন আপনার অনলাইন পোর্টফোলিও এবং চাকরির নিশ্চিত সুযোগ।"
              : "Our streamlined approach consistently delivers standout results with clarity and confidence."}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento Card 1: Complete Your Profile (Checklist) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Interactive checklist rows */}
              <div className="space-y-3 bg-gray-50/70 p-5 rounded-2xl border border-gray-150">
                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      CV
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">Curriculum Vitae</div>
                      <div className="text-[10px] text-gray-400">PDF / Formatted Online CV</div>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                      ID
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">Personal Data</div>
                      <div className="text-[10px] text-gray-400">Verified NID & Contact</div>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      ED
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-xs">Academic Information</div>
                      <div className="text-[10px] text-gray-400">SSC, HSC, Honors Credentials</div>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-black text-gray-950 text-lg">
                  {language === "bn" ? "প্রোফাইল সম্পূর্ণ করুন" : "Complete Your Profile"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {language === "bn"
                    ? "নিয়োগকারীদের নজরে আসার সম্ভাবনা বৃদ্ধি করতে আপনার প্রোফাইল সম্পূর্ণ তথ্য দিয়ে সাজান।"
                    : "To increase your chances of attracting the attention of recruiters, it's essential to complete your portfolio."}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/dashboard/profile"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5"
              >
                <span>{language === "bn" ? "প্রোফাইল সাজান" : "Start Profile"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Directly Portfolio Upload (Orange Gradient Graphic matching mockup) */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Graphic Banner */}
              <div className="bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden min-h-[190px]">
                {/* Concentric rings */}
                <div className="absolute w-44 h-44 rounded-full border border-white/20" />
                <div className="absolute w-60 h-60 rounded-full border border-white/10" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="mt-3 bg-white/90 text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Complete</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="font-black text-gray-950 text-lg">
                  {language === "bn" ? "১-ক্লিকে সরাসরি আবেদন" : "Directly Portfolio Upload"}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {language === "bn"
                    ? "একবার প্রোফাইল সংরক্ষণ করুন, এরপর যেকোনো চাকরির বিজ্ঞপ্তিতে আবেদন হবে মাত্র ১ ক্লিকে।"
                    : "To increase your chances of capturing the interest of recruiters, it's essential to upload your portfolio once."}
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/jobs"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5"
              >
                <span>{language === "bn" ? "সকল চাকরি দেখুন" : "Explore Circulars"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 3: Scheduling Interview & Select Candidate (Wide layout matching mockup) */}
          <div className="lg:col-span-12 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-block bg-orange-50 text-orange-700 text-[11px] font-bold px-3 py-1 rounded-full border border-orange-200">
                {language === "bn" ? "সাক্ষাৎকার ও নির্বাচন" : "Interview Scheduling"}
              </div>
              <h3 className="font-black text-gray-950 text-xl sm:text-2xl">
                {language === "bn"
                  ? "ইন্টারভিউ শিডিউলিং ও প্রার্থী বাছাই"
                  : "Scheduling Interview & Select Candidate"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-lg">
                {language === "bn"
                  ? "প্রতিষ্ঠান সরাসরি শর্টলিস্টেড প্রার্থীদের অনলাইন ইন্টারভিউতে আমন্ত্রণ জানাতে পারবে এবং এসএমএস নোটিফিকেশন পাঠাতে পারবে।"
                  : "Here employers can easily schedule interviews for selected candidates who perfectly fit the posted jobs, directly tracking in real-time."}
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="bg-gray-950 hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-full text-xs transition shadow-sm inline-flex items-center gap-2"
                >
                  <span>{language === "bn" ? "বিস্তারিত জানুন" : "Learn More"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Calendar & Interview Widget matching mockup */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row items-center justify-center gap-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-150">
              {/* Calendar Snippet */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs text-xs w-full sm:w-56">
                <div className="font-bold text-gray-800 flex items-center justify-between mb-2">
                  <span>September</span>
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] text-gray-400 text-center font-medium">
                  <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-[10px] text-center font-semibold text-gray-700 mt-1.5">
                  <span className="p-1">1</span><span className="p-1">2</span><span className="p-1">3</span>
                  <span className="p-1 bg-orange-600 text-white rounded-md">4</span><span className="p-1">5</span><span className="p-1">6</span><span className="p-1">7</span>
                </div>
              </div>

              {/* Floating Upcoming Interview Card */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md text-xs w-full sm:w-56 space-y-2.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Upcoming Interview
                </div>
                <div className="font-bold text-gray-900 text-xs">
                  {language === "bn" ? "কৃষি প্রকল্প সমন্বয়কারী" : "Agro Project Specialist"}
                </div>
                <div className="text-[11px] text-gray-500">Wednesday • 10:30-11:15</div>
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. UPDATED CATEGORIES: Bank & NGO REMOVED -> Agriculture (কৃষি) & Fisheries (মৎস্য) ADDED! */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {language === "bn" ? "জনপ্রিয় চাকরির ক্যাটাগরি" : "Explore by Category"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === "bn"
                ? "সরকারি, বেসরকারি, কৃষি ও মৎস্য খাতে সকল লাইভ সার্কুলার"
                : "Active vacancies in Government, Private, Agriculture & Fisheries"}
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>{t("view_all")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. সরকারি */}
          <Link
            href="/jobs?category=govt"
            className="group bg-white p-5 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md hover:border-orange-200 transition flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm">
                {language === "bn" ? "সরকারি" : "Government"}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                2,450+ {language === "bn" ? "চাকরি" : "Jobs"}
              </div>
            </div>
          </Link>

          {/* 2. বেসরকারি */}
          <Link
            href="/jobs?category=private"
            className="group bg-white p-5 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md hover:border-orange-200 transition flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm">
                {language === "bn" ? "বেসরকারি" : "Private"}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                5,320+ {language === "bn" ? "চাকরি" : "Jobs"}
              </div>
            </div>
          </Link>

          {/* 3. কৃষি (Agriculture) - NEW */}
          <Link
            href="/jobs?category=krishi"
            className="group bg-white p-5 rounded-2xl border border-orange-200/80 shadow-xs hover:shadow-md hover:border-orange-400 transition flex items-center gap-3.5 bg-gradient-to-br from-white to-orange-50/30"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm flex items-center gap-1.5">
                <span>{language === "bn" ? "কৃষি" : "Agriculture"}</span>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                  NEW
                </span>
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                1,840+ {language === "bn" ? "চাকরি" : "Jobs"}
              </div>
            </div>
          </Link>

          {/* 4. মৎস্য (Fisheries) - NEW */}
          <Link
            href="/jobs?category=motso"
            className="group bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs hover:shadow-md hover:border-sky-400 transition flex items-center gap-3.5 bg-gradient-to-br from-white to-sky-50/30"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <Fish className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm flex items-center gap-1.5">
                <span>{language === "bn" ? "মৎস্য" : "Fisheries"}</span>
                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.2 rounded">
                  NEW
                </span>
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                920+ {language === "bn" ? "চাকরি" : "Jobs"}
              </div>
            </div>
          </Link>

          {/* 5. অন্যান্য / টেক */}
          <Link
            href="/jobs?category=others"
            className="group bg-white p-5 rounded-2xl border border-gray-150 shadow-xs hover:shadow-md hover:border-orange-200 transition flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition shrink-0">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm">
                {language === "bn" ? "অন্যান্য" : "Others"}
              </div>
              <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                760+ {language === "bn" ? "চাকরি" : "Jobs"}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. MOST POPULAR JOBS SECTION (matching clean mockup cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight uppercase">
              {language === "bn" ? "জনপ্রিয় চাকরির সার্কুলার" : "Most Popular Jobs"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === "bn"
                ? "সরাসরি সরকারি ও কর্পোরেট অনুমোদনপ্রাপ্ত সার্কুলারসমূহ"
                : "Discover the top verified job opportunities tailored to your skills"}
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>{t("view_all")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobs.slice(0, 4).map((job) => {
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            );

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Icon + Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-lg border border-orange-100 group-hover:scale-105 transition">
                      {job.organizationName[0]}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] px-2.5 py-1 rounded-full font-bold border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>{daysLeft} {t("days_left")}</span>
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="mt-4 font-black text-gray-900 text-lg line-clamp-1 group-hover:text-orange-600 transition">
                    {language === "bn" ? job.titleBn : job.titleEn || job.titleBn}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {job.organizationName}
                  </p>

                  {/* Badges: Category & Job Type */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="bg-orange-50 text-orange-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                      {language === "bn" ? job.category?.nameBn : job.category?.nameEn || job.category?.nameBn}
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {job.jobType === "FULL_TIME"
                        ? (language === "bn" ? "ফুল-টাইম" : "Full Time")
                        : (language === "bn" ? "চুক্তিভিত্তিক" : "Contractual")}
                    </span>
                  </div>

                  {/* Location & Salary */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.workplaceLocation || (language === "bn" ? "ঢাকা" : "Dhaka")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                      <span>{job.salaryRange}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Apply Button in Vibrant Orange */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingJobId === job.id}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>
                      {applyingJobId === job.id
                        ? (language === "bn" ? "আবেদন হচ্ছে..." : "Applying...")
                        : t("apply_now")}
                    </span>
                  </button>

                  {applyMessage && applyMessage.id === job.id && (
                    <p
                      className={`text-xs mt-2 text-center font-bold ${
                        applyMessage.error ? "text-red-600" : "text-emerald-600"
                      }`}
                    >
                      {applyMessage.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
