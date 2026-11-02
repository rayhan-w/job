"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  Bookmark,
  FileText,
  DollarSign,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const jobId = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    fetch(`/api/jobs/${jobId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Job not found");
        return res.json();
      })
      .then((data) => {
        setJob(data.job);
        setHasApplied(Boolean(data.hasApplied));
        setIsLoggedIn(Boolean(data.isLoggedIn));
        setUserRole(data.userRole);
        setProfileComplete(Boolean(data.profileComplete));
        if (typeof data.walletBalance === "number") setWalletBalance(data.walletBalance);

        if (data.isLoggedIn) {
          fetch("/api/saved-jobs")
            .then((r) => (r.ok ? r.json() : null))
            .then((sData) => {
              if (sData?.savedJobs) {
                const found = sData.savedJobs.some((s: any) => s.jobId === jobId);
                setIsSaved(found);
              }
            })
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error("Fetch job detail failed:", err);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/jobs/${jobId}`);
      return;
    }
    setSavingBookmark(true);
    try {
      if (isSaved) {
        await fetch(`/api/saved-jobs?jobId=${jobId}`, { method: "DELETE" });
        setIsSaved(false);
      } else {
        await fetch("/api/saved-jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId }),
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/jobs/${jobId}`);
      return;
    }

    if (userRole !== "CUSTOMER") {
      setApplyMsg({
        text:
          language === "bn"
            ? "শুধুমাত্র চাকরিপ্রার্থী একাউন্ট থেকে আবেদন করা যাবে।"
            : "Only job seeker candidate accounts can apply for jobs.",
        error: true,
      });
      return;
    }

    if (!profileComplete) {
      setApplyMsg({
        text:
          language === "bn"
            ? "আপনার প্রোফাইল অসম্পূর্ণ! আবেদন করার পূর্বে ফোন নম্বর ও অন্তত একটি শিক্ষাগত যোগ্যতা যোগ করুন।"
            : "Incomplete profile: Please add your phone number and at least one education entry before applying.",
        error: true,
      });
      return;
    }

    if (job?.applicationFee && job.applicationFee > 0) {
      setShowFeeModal(true);
      return;
    }

    executeApply();
  };

  const executeApply = async () => {
    setShowFeeModal(false);
    setApplying(true);
    setApplyMsg(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setHasApplied(true);
        if (job.applicationFee > 0) {
          setWalletBalance((prev) => Math.max(0, prev - job.applicationFee));
        }
        setApplyMsg({
          text:
            language === "bn"
              ? `অভিনন্দন! আপনার আবেদন সফলভাবে জমা হয়েছে।${
                  job.applicationFee > 0 ? ` ওয়ালেট থেকে ৳${job.applicationFee} কর্তন করা হয়েছে।` : ""
                }`
              : `Congratulations! Your application has been submitted successfully.${
                  job.applicationFee > 0 ? ` ৳${job.applicationFee} has been deducted from your wallet.` : ""
                }`,
        });
      } else {
        setApplyMsg({
          text: data.error || (language === "bn" ? "আবেদন ব্যর্থ হয়েছে।" : "Application failed."),
          error: true,
        });
      }
    } catch {
      setApplyMsg({
        text: language === "bn" ? "সার্ভার এরর। কিছুক্ষণ পর আবার চেষ্টা করুন।" : "Server error. Please try again.",
        error: true,
      });
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900">
          {language === "bn" ? "চাকরি পাওয়া যায়নি" : "Job Circular Not Found"}
        </h1>
        <p className="text-gray-500 text-sm">
          {language === "bn"
            ? "বিজ্ঞপ্তিটি প্রত্যাহার করা হতে পারে অথবা লিংকটি সঠিক নয়।"
            : "The job listing might have expired or the link is invalid."}
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "bn" ? "সকল চাকরি দেখুন" : "Browse All Jobs"}</span>
        </Link>
      </div>
    );
  }

  const title = language === "bn" ? job.titleBn || job.titleEn : job.titleEn || job.titleBn;
  const description = language === "bn" ? job.descriptionBn || job.descriptionEn : job.descriptionEn || job.descriptionBn;
  const categoryName = language === "bn" ? job.category?.nameBn || job.category?.nameEn : job.category?.nameEn || job.category?.nameBn;
  const location = job.workplaceLocation || (language === "bn" ? "বাংলাদেশ" : "Bangladesh");
  const isExpired = new Date(job.deadline) < new Date();
  const deadlineStr = new Date(job.deadline).toLocaleDateString(language === "bn" ? "bn-BD" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button */}
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === "bn" ? "চাকরির তালিকায় ফিরে যান" : "Back to Job Circulars"}</span>
        </Link>
      </div>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {job.logoUrl ? (
              <img
                src={job.logoUrl}
                alt={job.organizationName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-gray-100 shadow-xs shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-xs shrink-0">
                {job.organizationName ? job.organizationName.charAt(0).toUpperCase() : "W"}
              </div>
            )}
            <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                {categoryName || (language === "bn" ? "চাকরি" : "Job")}
              </span>
              <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                {job.jobType || "Full Time"}
              </span>
              {isExpired ? (
                <span className="inline-block bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                  {language === "bn" ? "আবেদনের সময় শেষ" : "Deadline Expired"}
                </span>
              ) : (
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                  {language === "bn" ? "আবেদন চলছে" : "Actively Hiring"}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 font-bold text-gray-800">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>{job.organizationName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  {language === "bn" ? "শেষ তারিখ:" : "Deadline:"} {deadlineStr}
                </span>
              </div>
            </div>
          </div>
          </div>

          {/* Save & Share action buttons */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              onClick={handleToggleSave}
              disabled={savingBookmark}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                isSaved
                  ? "bg-orange-50 border-orange-300 text-orange-700 shadow-xs"
                  : "border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-orange-600 text-orange-600" : ""}`} />
              <span>
                {isSaved
                  ? language === "bn" ? "সংরক্ষিত ✓" : "Saved ✓"
                  : language === "bn" ? "বুকমার্ক" : "Save Job"}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? (language === "bn" ? "কপি হয়েছে!" : "Copied!") : (language === "bn" ? "শেয়ার" : "Share")}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50/70 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {language === "bn" ? "আবেদন ফি" : "Application Fee"}
            </div>
            <div className="text-sm font-bold text-orange-600 mt-1">
              {job.applicationFee > 0 ? `৳ ${job.applicationFee}` : (language === "bn" ? "বিনামূল্যে (৳ ০)" : "Free (৳ 0)")}
            </div>
          </div>
          <div className="bg-gray-50/70 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {language === "bn" ? "বেতন স্কেল" : "Salary"}
            </div>
            <div className="text-sm font-bold text-gray-900 mt-1">
              {job.salaryRange || (language === "bn" ? "আলোচনা সাপেক্ষে" : "Negotiable")}
            </div>
          </div>

          <div className="bg-gray-50/70 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {language === "bn" ? "পদসংখ্যা" : "Vacancy"}
            </div>
            <div className="text-sm font-bold text-gray-900 mt-1">
              {job.vacancy ? `${job.vacancy} জন` : (language === "bn" ? "বিজ্ঞপ্তি দেখুন" : "See Circular")}
            </div>
          </div>

          <div className="bg-gray-50/70 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {language === "bn" ? "অভিজ্ঞতা" : "Experience"}
            </div>
            <div className="text-sm font-bold text-gray-900 mt-1 truncate">
              {job.experienceReq || (language === "bn" ? "প্রযোজ্য নয়" : "Freshers welcome")}
            </div>
          </div>

          <div className="bg-gray-50/70 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {language === "bn" ? "বয়সসীমা" : "Age Limit"}
            </div>
            <div className="text-sm font-bold text-gray-900 mt-1 truncate">
              {job.ageLimit || (language === "bn" ? "১৮-৩০ বছর" : "18-30 Years")}
            </div>
          </div>
        </div>

        {/* Apply Call To Action Banner */}
        <div className="p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent rounded-2xl border border-orange-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-gray-900 text-sm">
                {language === "bn" ? "১-ক্লিকে নিশ্চিত আবেদন" : "1-Click Direct Application"}
              </h3>
            </div>
            <p className="text-xs text-gray-600">
              {isLoggedIn
                ? (language === "bn"
                    ? "আপনার সংরক্ষিত প্রোফাইল থেকে স্বয়ংক্রিয়ভাবে আবেদন জমা হবে।"
                    : "Your saved verified profile snapshot will be sent directly to the employer.")
                : (language === "bn"
                    ? "আবেদন করতে লগইন করুন। অ্যাকাউন্ট না থাকলে ১ মিনিটে রেজিস্টার করুন।"
                    : "Please sign in to apply. If you don't have an account, register in 1 minute.")}
            </p>
          </div>

          <div>
            {hasApplied ? (
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md cursor-default">
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === "bn" ? "আবেদন জমা হয়েছে ✓" : "Applied ✓"}</span>
              </div>
            ) : isExpired ? (
              <button
                disabled
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-500 font-bold text-sm cursor-not-allowed"
              >
                {language === "bn" ? "সময়সীমা শেষ" : "Expired"}
              </button>
            ) : (
              <button
                onClick={handleApplyClick}
                disabled={applying}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/20 transition transform active:scale-95 disabled:opacity-60"
              >
                {applying
                  ? (language === "bn" ? "জমা হচ্ছে..." : "Submitting...")
                  : (language === "bn" ? "আবেদন করুন" : "Apply Now")}
              </button>
            )}
          </div>
        </div>

        {applyMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
              applyMsg.error
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
            }`}
          >
            {applyMsg.error ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{applyMsg.text}</span>
            {applyMsg.error && applyMsg.text.includes("Incomplete") && (
              <Link
                href="/dashboard/profile"
                className="ml-auto underline font-bold hover:text-red-900"
              >
                {language === "bn" ? "প্রোফাইল সাজান →" : "Edit Profile →"}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Job Details Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            <span>{language === "bn" ? "চাকরির বিবরণ ও সারসংক্ষেপ" : "Job Description"}</span>
          </h2>
          <div className="mt-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {description}
          </div>
        </div>

        {job.educationReq && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "শিক্ষাগত যোগ্যতা" : "Educational Requirements"}</span>
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {job.educationReq}
            </p>
          </div>
        )}

        {job.experienceReq && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "কাজের অভিজ্ঞতা ও দক্ষতা" : "Experience Requirements"}</span>
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {job.experienceReq}
            </p>
          </div>
        )}

        {job.responsibilities && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "দায়িত্বসমূহ" : "Responsibilities"}</span>
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {job.responsibilities}
            </p>
          </div>
        )}

        {job.otherReqs && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-600" />
              <span>{language === "bn" ? "অন্যান্য শর্তাবলী" : "Other Requirements"}</span>
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {job.otherReqs}
            </p>
          </div>
        )}

        {job.circularFileUrl && (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">
              {language === "bn" ? "অফিসিয়াল সার্কুলার ফাইল:" : "Official Circular Document:"}
            </span>
            <a
              href={job.circularFileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              {language === "bn" ? "ডকুমেন্ট ডাউনলোড / দেখুন" : "View / Download Document"}
            </a>
          </div>
        )}
      </div>

      {/* Bottom Sticky-like Apply Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">
            {job.organizationName}
          </div>
          <div className="text-lg font-black mt-0.5">{title}</div>
        </div>

        <div>
          {hasApplied ? (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === "bn" ? "আবেদন জমা হয়েছে ✓" : "Applied ✓"}</span>
            </div>
          ) : isExpired ? (
            <span className="text-xs text-gray-400 font-bold">
              {language === "bn" ? "সময়সীমা শেষ" : "Deadline Expired"}
            </span>
          ) : (
            <button
              onClick={handleApplyClick}
              disabled={applying}
              className="px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm transition shadow-lg shadow-orange-600/30"
            >
              {language === "bn" ? "আবেদন করুন" : "Apply Now"}
            </button>
          )}
        </div>
      </div>

      {/* Application Fee Confirmation Modal (Item 6b) */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                ৳
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  {language === "bn" ? "আবেদন ফি কর্তন অনুমোদন" : "Application Fee Confirmation"}
                </h3>
                <p className="text-xs text-gray-500">
                  {job.organizationName}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>{language === "bn" ? "পদের নাম:" : "Job Title:"}</span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">{title}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>{language === "bn" ? "আবেদন ফি:" : "Application Fee:"}</span>
                <span className="font-extrabold text-orange-600 text-sm">৳ {job.applicationFee}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 pt-2 border-t border-gray-200">
                <span>{language === "bn" ? "বর্তমান ওয়ালেট ব্যালেন্স:" : "Current Wallet Balance:"}</span>
                <span className={`font-bold ${walletBalance < job.applicationFee ? "text-red-600" : "text-emerald-700"}`}>
                  ৳ {walletBalance}
                </span>
              </div>
            </div>

            {walletBalance < job.applicationFee ? (
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                  <p className="font-bold">
                    {language === "bn" ? "অপর্যাপ্ত ব্যালেন্স!" : "Insufficient Balance!"}
                  </p>
                  <p>
                    {language === "bn"
                      ? `আবেদনের জন্য আরও ৳ ${(job.applicationFee - walletBalance).toFixed(2)} প্রয়োজন। আবেদন সম্পূর্ণ করতে অনুগ্রহ করে ওয়ালেটে টাকা যোগ (ক্যাশ-ইন) করুন।`
                      : `You need ৳ ${(job.applicationFee - walletBalance).toFixed(2)} more. Please cash-in to your wallet to complete application.`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFeeModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                  >
                    {language === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                  <Link
                    href="/dashboard/wallet"
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold text-center flex items-center justify-center"
                  >
                    {language === "bn" ? "ক্যাশ-ইন করুন →" : "Cash In →"}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">
                  {language === "bn"
                    ? `আবেদন নিশ্চিত করলে আপনার ওয়ালেট ব্যালেন্স থেকে ৳ ${job.applicationFee} কর্তন করা হবে। বাকি ব্যালেন্স থাকবে ৳ ${(walletBalance - job.applicationFee).toFixed(2)}।`
                    : `Confirming will deduct ৳ ${job.applicationFee} from your wallet. Remaining balance will be ৳ ${(walletBalance - job.applicationFee).toFixed(2)}.`}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFeeModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50"
                  >
                    {language === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    onClick={executeApply}
                    disabled={applying}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    {applying
                      ? (language === "bn" ? "জমা হচ্ছে..." : "Processing...")
                      : (language === "bn" ? "ফি প্রদান ও নিশ্চিত আবেদন" : "Pay & Submit Application")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
