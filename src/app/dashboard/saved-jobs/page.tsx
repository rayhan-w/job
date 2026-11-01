"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Bookmark, Briefcase, MapPin, Trash2, ExternalLink } from "lucide-react";

export default function SavedJobsPage() {
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated) {
          setUserData(data.user);
          fetch("/api/saved-jobs")
            .then((res) => res.json())
            .then((sData) => {
              if (sData.savedJobs) setSavedJobs(sData.savedJobs);
            });
        } else {
          window.location.href = "/login?callbackUrl=/dashboard/saved-jobs";
        }
      })
      .catch(() => {
        window.location.href = "/login?callbackUrl=/dashboard/saved-jobs";
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId: string) => {
    try {
      const res = await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={userData?.role} />

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
                <Bookmark className="w-6 h-6 text-purple-600" />
                <span>{language === "bn" ? "সংরক্ষিত চাকরি" : "Saved Jobs"}</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {language === "bn"
                  ? "পরবর্তীতে আবেদনের জন্য আপনার বুকমার্ক করে রাখা চাকরির সার্কুলারসমূহ।"
                  : "List of job circulars you have bookmarked for later review."}
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>{language === "bn" ? "নতুন চাকরি দেখুন" : "Browse Jobs"}</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {savedJobs.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-3">
                  <Bookmark className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="font-semibold text-gray-600">
                    {language === "bn" ? "কোনো চাকরি সংরক্ষিত নেই।" : "No saved jobs found."}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === "bn"
                      ? "পছন্দের চাকরির সার্কুলারে বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।"
                      : "Click the bookmark icon on any job to save it here."}
                  </p>
                </div>
              ) : (
                savedJobs.map((item) => {
                  const job = item.job;
                  if (!job) return null;
                  return (
                    <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-orange-600 uppercase">
                          {job.organizationName}
                        </span>
                        <h3 className="font-bold text-gray-900 text-base">
                          {language === "bn" ? job.titleBn : job.titleEn || job.titleBn}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {job.workplaceLocation || "বাংলাদেশ"}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-gray-700">{job.salaryRange}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-sm inline-flex items-center gap-1"
                        >
                          <span>{language === "bn" ? "আবেদন করুন" : "Apply"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleRemove(job.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
