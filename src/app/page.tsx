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
  Check,
  CalendarDays,
  Video,
  UserCheck,
  Laptop,
  Users,
  HelpCircle,
} from "lucide-react";

function toBanglaNumber(num: number): string {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

function getCategoryIcon(slug: string, icon?: string) {
  const key = (icon || slug || "").toLowerCase();
  if (key.includes("landmark") || key.includes("govt")) return <Landmark className="w-6 h-6 text-purple-600" />;
  if (key.includes("building") || key.includes("private")) return <Building2 className="w-6 h-6 text-blue-600" />;
  if (key.includes("sprout") || key.includes("krishi")) return <Sprout className="w-6 h-6 text-amber-600" />;
  if (key.includes("fish") || key.includes("motso")) return <Fish className="w-6 h-6 text-sky-600" />;
  if (key.includes("laptop") || key.includes("it")) return <Laptop className="w-6 h-6 text-indigo-600" />;
  if (key.includes("briefcase") || key.includes("bank")) return <Briefcase className="w-6 h-6 text-emerald-600" />;
  if (key.includes("users") || key.includes("ngo")) return <Users className="w-6 h-6 text-rose-600" />;
  return <Folder className="w-6 h-6 text-orange-600" />;
}

export default function HomePage() {
  const { language, t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
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

  const scrollToSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("search-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-16 pt-8 sm:pt-12">
      {/* 1. SEARCH SECTION in Card Style (owner liked this card style) - sits visibly lower with proper breathing room */}
      <section id="search-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-28">
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl shadow-orange-500/5 p-6 sm:p-8 space-y-4">
          {/* FIX 2: Badge "১-ক্লিক আবেদন সক্রিয়" completely removed */}
          <div className="border-b border-gray-100 pb-3">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-600" />
              <span>{language === "bn" ? "চাকরি খুঁজুন" : "Search Jobs"}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === "bn"
                ? "পদবী, প্রতিষ্ঠান, ক্যাটাগরি বা জেলা দিয়ে সহজে সরকারি, বেসরকারি, কৃষি ও মৎস্য চাকরি খুঁজুন"
                : "Find circulars across Government, Private, Agriculture & Fisheries sectors"}
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/jobs?search=${encodeURIComponent(searchKeyword)}&category=${selectedCategory}&district=${selectedDistrict}`;
            }}
            className="flex flex-col md:flex-row items-center gap-2.5 pt-1"
          >
            {/* Keyword Input */}
            <div className="flex items-center gap-3 px-4 py-2.5 flex-1 w-full rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white transition">
              <Search className="w-4 h-4 text-orange-500 shrink-0" />
              <input
                type="text"
                placeholder={t("hero_search_placeholder")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full text-gray-800 text-sm bg-transparent focus:outline-none placeholder-gray-400"
              />
            </div>

            {/* Category Select - Data-driven from database categories */}
            <div className="flex items-center px-3 py-2.5 w-full md:w-52 rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white transition">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-gray-700 text-sm bg-transparent focus:outline-none font-medium"
              >
                <option value="">{t("all_categories")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {language === "bn" ? c.nameBn : c.nameEn || c.nameBn}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div className="flex items-center px-3 py-2.5 w-full md:w-44 rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-orange-500 focus-within:bg-white transition">
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

            {/* Search Submit Button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{t("search_btn")}</span>
            </button>
          </form>
        </div>
      </section>

      {/* 2. JOB CATEGORIES directly below the search section - Live counts from Database (Fix 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              {language === "bn" ? "চাকরির ক্যাটাগরি" : "Job Categories"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === "bn"
                ? "যেকোনো ক্যাটাগরিতে ক্লিক করে সেই ক্যাটাগরির সকল চাকরি দেখুন"
                : "Click any category to open and view all jobs in that sector"}
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
          {categories.map((cat) => {
            const isNew = cat.slug === "krishi" || cat.slug === "motso";
            return (
              <Link
                key={cat.id}
                href={`/jobs?category=${cat.slug}`}
                className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition flex items-center gap-3.5"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:scale-105 transition shrink-0">
                  {getCategoryIcon(cat.slug, cat.icon)}
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-orange-600 transition text-sm flex items-center gap-1.5">
                    <span>{language === "bn" ? cat.nameBn : cat.nameEn || cat.nameBn}</span>
                    {isNew && (
                      <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {language === "bn"
                      ? `${toBanglaNumber(cat.jobCount)}টি চাকরি`
                      : `${cat.jobCount} ${cat.jobCount === 1 ? "Job" : "Jobs"}`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. POPULAR JOBS (জনপ্রিয় চাকরি) directly below the categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
              {language === "bn" ? "জনপ্রিয় চাকরির বিজ্ঞপ্তি" : "Popular Job Circulars"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === "bn"
                ? "সরাসরি অনুমোদিত ও হট সার্কুলারসমূহ — ১ ক্লিকেই আবেদন করুন"
                : "Top active vacancies across Bangladesh — apply directly in 1 click"}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                  {/* Top: Icon + Days left */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-base border border-orange-100 group-hover:scale-105 transition">
                      {job.organizationName[0]}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] px-2.5 py-1 rounded-full font-bold border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>{daysLeft} {t("days_left")}</span>
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="mt-3.5 font-black text-gray-900 text-base line-clamp-1 group-hover:text-orange-600 transition">
                    <Link href={`/jobs/${job.id}`}>
                      {language === "bn" ? job.titleBn : job.titleEn || job.titleBn}
                    </Link>
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
                  <div className="mt-3.5 space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.workplaceLocation || (language === "bn" ? "ঢাকা" : "Dhaka")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                      <span>{job.salaryRange}</span>
                    </div>
                  </div>
                </div>

                {/* View Details / Apply Button */}
                <div className="mt-5 pt-3.5 border-t border-gray-100">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{t("apply_now")}</span>
                  </Link>

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

      {/* 4. "চাকরি খুঁজুন" + "কীভাবে কাজ করে" (How It Works) in the lower area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#F8F9FA] rounded-3xl border border-gray-200/80 p-8 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                {language === "bn" ? "সহজ গাইডলাইন" : "Simple Process"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mt-2">
                {language === "bn" ? "কীভাবে কাজ করে?" : "How It Works"}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {language === "bn"
                  ? "মাত্র ৩টি সহজ ধাপে আপনার অনলাইন প্রোফাইল তৈরি করুন এবং সরাসরি চাকরিতে আবেদন সম্পন্ন করুন"
                  : "Build your digital portfolio and apply to your dream job in 3 straightforward steps"}
              </p>
            </div>

            {/* "চাকরি খুঁজুন" button returns back up to the search area */}
            <a
              href="#search-section"
              onClick={scrollToSearch}
              className="self-start sm:self-center bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-full text-xs transition shadow-md shadow-orange-600/20 flex items-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{language === "bn" ? "চাকরি খুঁজুন" : "Find Jobs"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-black text-base flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === "bn" ? "প্রোফাইল তৈরি (একবারই)" : "Build Profile (Once)"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === "bn"
                  ? "আপনার শিক্ষা, অভিজ্ঞতা ও সিভি দিয়ে একটি পূর্ণাঙ্গ অনলাইন প্রোফাইল সাজান।"
                  : "Create your verified online portfolio with your education, skills, and resume details once."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                2
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === "bn" ? "সকল চাকরিতে ১ ক্লিকে আবেদন" : "1-Click Apply to Any Job"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === "bn"
                  ? "কোনো ফর্ম বারবার পূরণ না করে পছন্দের বিজ্ঞপ্তিতে সরাসরি ১ ক্লিকে আবেদন করুন।"
                  : "Apply instantly with your stored snapshot without filling repetitive forms."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black text-base flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-base">
                {language === "bn" ? "ইন্টারভিউ ও সরাসরি নিয়োগ" : "Interview & Direct Hiring"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {language === "bn"
                  ? "কোম্পানি সরাসরি আপনার প্রোফাইল দেখে যোগাযোগ করবে এবং ইন্টারভিউতে ডাকবে।"
                  : "Employers review your profile and directly schedule online or in-person interviews."}
              </p>
            </div>
          </div>

          {/* FIX 3: Quiz entry in lower area (ONE single clearly visible, nicely designed place) */}
          <div className="bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 rounded-2xl border border-orange-200/90 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-600/20">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-gray-950 text-base">
                    {language === "bn" ? "কুইজ প্রতিযোগিতা ও পুরস্কার" : "Quiz Contest & Rewards"}
                  </h3>
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full border border-orange-200">
                    {language === "bn" ? "লাইভ" : "LIVE"}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {language === "bn"
                    ? "সাধারণ জ্ঞান ও বিষয়ভিত্তিক কুইজে অংশ নিন এবং জিতে নিন আকর্ষণীয় বোনাস।"
                    : "Participate in quizzes, test your knowledge, and earn instant bonuses."}
                </p>
              </div>
            </div>

            <Link
              href="/quiz"
              className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-full text-xs transition shadow-sm shadow-orange-600/20 flex items-center justify-center gap-2 shrink-0"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{language === "bn" ? "কুইজ খেলুন" : "Play Quiz"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. TWO SECTIONS JUST ABOVE FOOTER:
          (a) "১ ক্লিকে সরাসরি আবেদন" (Directly Portfolio Upload)
          (b) Interview-related section (Scheduling Interview & Select Candidate) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* (a) "১ ক্লিকে সরাসরি আবেদন" */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Graphic Banner */}
              <div className="bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 flex items-center justify-center relative overflow-hidden min-h-[170px]">
                <div className="absolute w-44 h-44 rounded-full border border-white/20" />
                <div className="absolute w-60 h-60 rounded-full border border-white/10" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-lg p-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="mt-3 bg-white/90 text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Complete</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-gray-950 text-lg">
                  {language === "bn" ? "১ ক্লিকে সরাসরি আবেদন" : "Direct Apply in 1 Click"}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {language === "bn"
                    ? "একবার প্রোফাইল সংরক্ষণ করুন, এরপর যেকোনো চাকরির বিজ্ঞপ্তিতে আবেদন হবে মাত্র ১ ক্লিকে।"
                    : "Save your portfolio once, and apply to verified opportunities across Bangladesh in just 1 click."}
                </p>
              </div>
            </div>

            <div className="pt-5">
              <Link
                href="/jobs"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5"
              >
                <span>{language === "bn" ? "সকল চাকরি দেখুন" : "Explore Circulars"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* (b) Interview-related section */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-gray-200/80 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Interview & Calendar Widget */}
              <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/70 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                {/* Calendar Widget */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs text-xs w-full sm:w-48">
                  <div className="font-bold text-gray-800 flex items-center justify-between mb-1.5 text-[11px]">
                    <span>September</span>
                    <CalendarDays className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-[9px] text-gray-400 text-center font-medium">
                    <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-[9px] text-center font-semibold text-gray-700 mt-1">
                    <span className="p-0.5">1</span><span className="p-0.5">2</span><span className="p-0.5">3</span>
                    <span className="p-0.5 bg-orange-600 text-white rounded">4</span><span className="p-0.5">5</span><span className="p-0.5">6</span><span className="p-0.5">7</span>
                  </div>
                </div>

                {/* Upcoming Interview Card */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm text-xs w-full sm:w-48 space-y-2">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Upcoming Interview
                  </div>
                  <div className="font-bold text-gray-900 text-[11px] truncate">
                    {language === "bn" ? "কৃষি প্রকল্প কর্মকর্তা" : "Agro Project Officer"}
                  </div>
                  <div className="text-[10px] text-gray-500">Wednesday • 10:30 AM</div>
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 rounded-lg text-[10px] transition flex items-center justify-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Now</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-black text-gray-950 text-lg">
                  {language === "bn"
                    ? "ইন্টারভিউ শিডিউলিং ও প্রার্থী বাছাই"
                    : "Scheduling Interview & Select Candidate"}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {language === "bn"
                    ? "প্রতিষ্ঠান সরাসরি শর্টলিস্টেড প্রার্থীদের অনলাইন ইন্টারভিউতে আমন্ত্রণ জানাতে পারবে এবং এসএমএস নোটিফিকেশন পাঠাতে পারবে।"
                    : "Employers easily schedule interviews for selected candidates who fit the posted vacancies."}
                </p>
              </div>
            </div>

            <div className="pt-5">
              <Link
                href="/login"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1.5"
              >
                <span>{language === "bn" ? "বিস্তারিত জানুন" : "Learn More"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
