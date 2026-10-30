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
  Users,
  Folder,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { language, t } = useLanguage();
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  useEffect(() => {
    // Fetch initial published jobs
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
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
      });
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
    <div className="flex flex-col gap-12 pb-16">
      {/* 1. HERO SECTION matching Bangladeshi Parliament design */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-16 md:py-24">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/70 z-10" />
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
            {t("hero_title")}
          </h1>
          <p className="mt-4 text-base md:text-xl text-gray-300 max-w-2xl font-normal leading-relaxed">
            {t("hero_subtitle")}
          </p>

          {/* Unified Search Bar */}
          <div className="mt-8 w-full max-w-4xl bg-white p-2.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-2">
            <div className="flex items-center gap-3 px-4 py-2 flex-1 w-full border-b md:border-b-0 md:border-r border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("hero_search_placeholder")}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full text-gray-800 text-sm focus:outline-none placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-100">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-gray-700 text-sm bg-transparent focus:outline-none"
              >
                <option value="">{t("all_categories")}</option>
                <option value="govt">{language === "bn" ? "সরকারি" : "Government"}</option>
                <option value="private">{language === "bn" ? "বেসরকারি" : "Private"}</option>
                <option value="ngo">{language === "bn" ? "এনজিও" : "NGO"}</option>
                <option value="bank">{language === "bn" ? "ব্যাংক" : "Bank"}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 w-full md:w-48">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full text-gray-700 text-sm bg-transparent focus:outline-none"
              >
                <option value="">{t("all_districts")}</option>
                <option value="1">ঢাকা (Dhaka)</option>
                <option value="14">চট্টগ্রাম (Chattogram)</option>
                <option value="25">রাজশাহী (Rajshahi)</option>
                <option value="33">খুলনা (Khulna)</option>
              </select>
            </div>

            <Link
              href={`/jobs?search=${encodeURIComponent(searchKeyword)}&category=${selectedCategory}&district=${selectedDistrict}`}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              <span>{t("search_btn")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY CARDS SECTION matching design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/jobs?category=govt"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition">
                {t("cat_govt")}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">2,450+ {language === "bn" ? "চাকরি" : "Jobs"}</div>
            </div>
          </Link>

          <Link
            href="/jobs?category=private"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                {t("cat_private")}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">5,320+ {language === "bn" ? "চাকরি" : "Jobs"}</div>
            </div>
          </Link>

          <Link
            href="/jobs?category=ngo"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-purple-600 transition">
                {t("cat_ngo")}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">1,210+ {language === "bn" ? "চাকরি" : "Jobs"}</div>
            </div>
          </Link>

          <Link
            href="/jobs?category=bank"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-amber-600 transition">
                {t("cat_bank")}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">980+ {language === "bn" ? "চাকরি" : "Jobs"}</div>
            </div>
          </Link>

          <Link
            href="/jobs?category=others"
            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-gray-900 group-hover:text-teal-600 transition">
                {t("cat_others")}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">760+ {language === "bn" ? "চাকরি" : "Jobs"}</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. LATEST JOBS SECTION matching design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t("latest_jobs")}
          </h2>
          <Link
            href="/jobs"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>{t("view_all")}</span>
            <ArrowRight className="w-4 h-4" />
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
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  {/* Top: Org Logo/Icon + Days left badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                      {job.organizationName[0]}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>
                        {daysLeft} {t("days_left")}
                      </span>
                    </span>
                  </div>

                  {/* Title & Organization */}
                  <h3 className="mt-4 font-bold text-gray-900 text-lg line-clamp-1">
                    {language === "bn" ? job.titleBn : job.titleEn || job.titleBn}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {job.organizationName}
                  </p>

                  {/* Badges: Category & Job Type */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                      {job.category?.nameBn}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                      {job.jobType}
                    </span>
                  </div>

                  {/* Location & Deadline */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.workplaceLocation || "ঢাকা"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {t("deadline")}: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Apply Button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={applyingJobId === job.id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
                  >
                    {applyingJobId === job.id ? (
                      <span>...</span>
                    ) : (
                      <span>{t("apply_now")}</span>
                    )}
                  </button>

                  {applyMessage && applyMessage.id === job.id && (
                    <p
                      className={`text-xs mt-2 text-center font-medium ${
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

      {/* 4. "HOW IT WORKS" / ONCE CREATE PROFILE, 1-CLICK APPLY BANNER matching design */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-3xl border border-emerald-100 p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "সহজ ও স্মার্ট পদ্ধতি" : "Smart & Fast"}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {t("how_it_works_subtitle")}
            </h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {language === "bn"
                ? "আর কোনো চাকরিতে বারবার আপনার নাম, ঠিকানা ও শিক্ষাগত তথ্য লেখার প্রয়োজন নেই। ১ বার প্রোফাইল সেভ করুন এবং আজীবন ১ ক্লিকে চাকরির আবেদন সম্পন্ন করুন।"
                : "No need to repeatedly re-enter your details for every job circular. Save your profile snapshot once and apply to any job with 1 single click."}
            </p>

            <div className="mt-6">
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-md"
              >
                <span>{t("create_profile_now")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3 Step Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{t("step1_title")}</h4>
              <p className="text-xs text-gray-500 mt-1">{t("step1_desc")}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{t("step2_title")}</h4>
              <p className="text-xs text-gray-500 mt-1">{t("step2_desc")}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{t("step3_title")}</h4>
              <p className="text-xs text-gray-500 mt-1">{t("step3_desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
