"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  Building2,
  DollarSign,
  Filter,
} from "lucide-react";

function JobsContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || searchParams.get("categoryId") || "");
  const [district, setDistrict] = useState(searchParams.get("district") || searchParams.get("districtId") || "");
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<{ id: string; text: string; error?: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const urlCategory = searchParams.get("category") || searchParams.get("categoryId") || "";
    const urlSearch = searchParams.get("search") || "";
    const urlDistrict = searchParams.get("district") || searchParams.get("districtId") || "";
    setCategory(urlCategory);
    setSearch(urlSearch);
    setDistrict(urlDistrict);
  }, [searchParams]);

  const fetchJobs = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("categoryId", category);
    if (district) params.set("districtId", district);

    fetch(`/api/jobs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) setJobs(data.jobs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [category, district]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleApply = async (jobId: string) => {
    setApplyingJobId(jobId);
    setApplyResult(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setApplyResult({ id: jobId, text: language === "bn" ? "আবেদন সফল হয়েছে ✓" : "Applied Successfully ✓" });
      } else {
        setApplyResult({ id: jobId, text: data.error || (language === "bn" ? "আবেদন ব্যর্থ হয়েছে" : "Application failed"), error: true });
      }
    } catch {
      setApplyResult({ id: jobId, text: language === "bn" ? "সার্ভার এরর" : "Server error", error: true });
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {language === "bn" ? "সকল চাকরির বিজ্ঞপ্তি" : "All Job Circulars"}
        </h1>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={t("hero_search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none bg-white"
            >
              <option value="">{t("all_categories")}</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {language === "bn" ? c.nameBn : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition shadow-sm"
          >
            {t("search_btn")}
          </button>
        </form>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-600" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
          {language === "bn" ? "কোনো চাকরির সার্কুলার পাওয়া যায়নি।" : "No job circulars found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const daysLeft = Math.max(
              0,
              Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            );

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-lg">
                      {job.organizationName[0]}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>{daysLeft} {t("days_left")}</span>
                    </span>
                  </div>

                  <h3 className="mt-4 font-black text-gray-900 text-lg line-clamp-1 hover:text-orange-600 transition">
                    <Link href={`/jobs/${job.id}`}>
                      {language === "bn" ? job.titleBn : job.titleEn || job.titleBn}
                    </Link>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {job.organizationName}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="bg-orange-50 text-orange-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {language === "bn" ? job.category?.nameBn : job.category?.nameEn || job.category?.nameBn}
                    </span>
                    <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {language === "bn" ? (job.jobType === "FULL_TIME" ? "ফুল-টাইম" : job.jobType === "CONTRACTUAL" ? "চুক্তিভিত্তিক" : job.jobType) : (job.jobType === "FULL_TIME" ? "Full-time" : job.jobType === "CONTRACTUAL" ? "Contractual" : job.jobType)}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {language === "bn" ? "পদসংখ্যা" : "Vacancy"}: {job.vacancy}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.workplaceLocation || (language === "bn" ? "ঢাকা" : "Dhaka")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.salaryRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{t("deadline")}: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{t("apply_now")}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}
