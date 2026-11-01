"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function JobAlertsPage() {
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [matchingJobs, setMatchingJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchAlertsData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData?.authenticated) {
        window.location.href = "/login?callbackUrl=/dashboard/alerts";
        return;
      }
      setUserData(meData.user);

      const [alertsRes, catsRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/categories"),
      ]);

      if (alertsRes.ok) {
        const aData = await alertsRes.json();
        setAlerts(aData.alerts || []);
        setMatchingJobs(aData.matchingJobs || []);
      }

      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(cData.categories || []);
        setDistricts(cData.districts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory && !selectedDistrict) {
      setMsg({
        text:
          language === "bn"
            ? "অনুগ্রহ করে একটি চাকরির ক্যাটাগরি অথবা জেলা নির্বাচন করুন।"
            : "Please select a category or district.",
        error: true,
      });
      return;
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory || null,
          districtId: selectedDistrict ? Number(selectedDistrict) : null,
        }),
      });

      if (res.ok) {
        setMsg({
          text:
            language === "bn"
              ? "জব অ্যালার্ট সফলভাবে সেট করা হয়েছে! নতুন বিজ্ঞপ্তি এলে তাৎক্ষণিক জানানো হবে।"
              : "Job alert saved successfully! You will be notified of new openings.",
        });
        setSelectedCategory("");
        setSelectedDistrict("");
        fetchAlertsData();
      } else {
        const d = await res.json();
        setMsg({ text: d.error || "Failed to create alert", error: true });
      }
    } catch {
      setMsg({ text: "Server error", error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
        setMsg({
          text: language === "bn" ? "অ্যালার্টটি মুছে ফেলা হয়েছে।" : "Alert removed successfully.",
        });
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
        {/* Sidebar */}
        <DashboardSidebar userRole={userData?.role} />

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
              <Bell className="w-6 h-6 text-orange-600" />
              <span>{language === "bn" ? "জব অ্যালার্ট ও নোটিফিকেশন" : "Job Alerts & Notifications"}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {language === "bn"
                ? "আপনার পছন্দের ক্যাটাগরি ও জেলায় নতুন চাকরির বিজ্ঞপ্তি প্রকাশিত হওয়ামাত্রই এসএমএস ও ইন-অ্যাপ অ্যালার্ট পান।"
                : "Receive instant notifications and SMS circular alerts matched to your target sectors and location."}
            </p>
          </div>

          {msg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                msg.error
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {msg.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Create Alert Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "নতুন চাকরির অ্যালার্ট তৈরি করুন" : "Set New Job Alert"}</span>
            </h2>

            <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "চাকরির ক্যাটাগরি" : "Job Category"}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none bg-white"
                >
                  <option value="">{language === "bn" ? "-- সকল ক্যাটাগরি --" : "-- All Categories --"}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === "bn" ? c.nameBn : c.nameEn || c.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "কর্মক্ষেত্র জেলা" : "Workplace District"}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:border-orange-500 focus:outline-none bg-white"
                >
                  <option value="">{language === "bn" ? "-- সারা বাংলাদেশ --" : "-- All Bangladesh --"}</option>
                  {districts.length > 0 ? (
                    districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {language === "bn" ? d.nameBn : d.nameEn || d.nameBn}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">ঢাকা (Dhaka)</option>
                      <option value="2">গাজীপুর (Gazipur)</option>
                      <option value="3">নারায়ণগঞ্জ (Narayanganj)</option>
                      <option value="4">চট্টগ্রাম (Chattogram)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  <span>{submitting ? (language === "bn" ? "সংরক্ষণ..." : "Saving...") : (language === "bn" ? "অ্যালার্ট সক্রিয় করুন" : "Activate Alert")}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900">
                {language === "bn" ? "আপনার সক্রিয় অ্যালার্টসমূহ" : "Your Active Alerts"} ({alerts.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-sm font-semibold text-gray-600">
                    {language === "bn"
                      ? "কোনো সক্রিয় অ্যালার্ট নেই।"
                      : "No active job alerts configured."}
                  </p>
                  <p className="text-xs text-gray-400">
                    {language === "bn"
                      ? "পছন্দের ক্যাটাগরি বা জেলা সিলেক্ট করে অ্যালার্ট সেট করুন।"
                      : "Select your preferred category or district above to receive updates."}
                  </p>
                </div>
              ) : (
                alerts.map((alt) => (
                  <div key={alt.id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50/50 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {alt.category
                            ? (language === "bn" ? alt.category.nameBn : alt.category.nameEn)
                            : (language === "bn" ? "সকল ক্যাটাগরি" : "All Categories")}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-semibold text-gray-600">
                          {alt.district
                            ? (language === "bn" ? alt.district.nameBn : alt.district.nameEn)
                            : (language === "bn" ? "সারা বাংলাদেশ" : "All Bangladesh")}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {language === "bn" ? "তৈরি হয়েছে: " : "Created: "}
                        {new Date(alt.createdAt).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US")}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title={language === "bn" ? "মুছে ফেলুন" : "Remove Alert"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommended / Matching Circulars */}
          {matchingJobs.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-black text-gray-900">
                  {language === "bn" ? "অ্যালার্ট অনুযায়ী মিলে যাওয়া চাকরির বিজ্ঞপ্তি" : "Matched Job Circulars for You"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between space-y-3 hover:border-orange-200 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{job.organizationName}</span>
                        <span className="text-orange-600 font-bold">{job.salaryRange}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mt-1">
                        {language === "bn" ? job.titleBn : job.titleEn || job.titleBn}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{job.workplaceLocation || "বাংলাদেশ"}</span>
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                    >
                      <span>{language === "bn" ? "১-ক্লিকে আবেদন করুন" : "Apply Now"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
