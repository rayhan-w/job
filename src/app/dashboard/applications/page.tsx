"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import Link from "next/link";
import { Briefcase, ArrowLeft, Clock, ExternalLink } from "lucide-react";

export default function ApplicationsPage() {
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) {
          setUserData(data.user);
          fetch("/api/applications")
            .then((res) => res.json())
            .then((appData) => {
              if (appData.applications) setApplications(appData.applications);
            })
            .catch(() => {});
        } else {
          window.location.href = "/login?callbackUrl=/dashboard/applications";
        }
      })
      .catch(() => {
        window.location.href = "/login?callbackUrl=/dashboard/applications";
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VIEWED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {language === "bn" ? "দেখা হয়েছে" : "Viewed"}
          </span>
        );
      case "SHORTLISTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {language === "bn" ? "শর্টলিস্টেড" : "Shortlisted"}
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            {language === "bn" ? "ইন্টারভিউ" : "Interview"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            {language === "bn" ? "বাতিল" : "Rejected"}
          </span>
        );
      case "HIRED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {language === "bn" ? "নিয়োগপ্রাপ্ত" : "Hired"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {language === "bn" ? "আবেদন জমা হয়েছে" : "Applied"}
          </span>
        );
    }
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

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                {language === "bn" ? "আমার আবেদনসমূহ" : "My Applications"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {language === "bn"
                  ? "আপনার করা সমস্ত চাকরির আবেদনের বিবরণ ও বর্তমান অবস্থা।"
                  : "Overview and current status of all your submitted job applications."}
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
            >
              <Briefcase className="w-4 h-4" />
              <span>{language === "bn" ? "নতুন চাকরি খুঁজুন" : "Browse Jobs"}</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{language === "bn" ? "পদের নাম" : "Job Title"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "প্রতিষ্ঠান" : "Organization"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "আবেদনের তারিখ" : "Applied Date"}</th>
                    <th className="px-6 py-4">{language === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                    <th className="px-6 py-4 text-right">{language === "bn" ? "বিস্তারিত" : "Details"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="font-semibold text-gray-700">
                          {language === "bn"
                            ? "আপনি এখনো কোনো চাকরিতে আবেদন করেননি।"
                            : "You have not applied to any jobs yet."}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {language === "bn"
                            ? "পছন্দের চাকরিতে ১-ক্লিকে আবেদন করুন।"
                            : "Find your ideal role and apply with 1-click."}
                        </p>
                        <div className="mt-4">
                          <Link
                            href="/jobs"
                            className="inline-flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700"
                          >
                            {language === "bn" ? "চাকরি ব্রাউজ করুন →" : "Browse Jobs →"}
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => {
                      const jobTitle =
                        language === "bn"
                          ? app.job?.titleBn || app.job?.title || "চাকরি"
                          : app.job?.title || app.job?.titleBn || "Job";
                      const company =
                        app.job?.organizationName ||
                        app.job?.company ||
                        (language === "bn" ? "প্রতিষ্ঠান" : "Organization");
                      const dateStr = new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString(
                        language === "bn" ? "bn-BD" : "en-US",
                        { day: "numeric", month: "short", year: "numeric" }
                      );

                      return (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-bold text-gray-900">
                            {jobTitle}
                          </td>
                          <td className="px-6 py-4">{company}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">{dateStr}</td>
                          <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/jobs/${app.jobId}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              <span>{language === "bn" ? "চাকরি দেখুন" : "View"}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
