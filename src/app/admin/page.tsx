"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import {
  ShieldCheck,
  Users,
  Wallet,
  TrendingUp,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  LogIn,
  RefreshCw,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  Check,
  Briefcase,
  Search,
  Eye,
  Settings,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  KeyRound,
  UserCheck,
  UserX,
  ExternalLink,
} from "lucide-react";

export default function AdminPage() {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "users" | "finance" | "quizzes" | "categories" | "commission" | "settings"
  >("overview");

  // Core administrative states
  const [adminData, setAdminData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [commissionSettings, setCommissionSettings] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter states
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  // Job Creation / Edit form state
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({
    titleBn: "",
    titleEn: "",
    organizationName: "",
    categoryId: "",
    jobType: "FULL_TIME",
    workplaceLocation: "ঢাকা",
    vacancy: 1,
    salaryRange: "আলোচনা সাপেক্ষে",
    educationReq: "স্নাতক / সমমান",
    experienceReq: "১-২ বছর",
    ageLimit: "১৮-৩০ বছর",
    deadline: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    descriptionBn: "",
    status: "PUBLISHED",
  });

  // Job Applicants View modal
  const [viewingJobId, setViewingJobId] = useState<string | null>(null);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // User edit / adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [newAdminPassword, setNewAdminPassword] = useState("");

  // Category management states
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatNameBn, setNewCatNameBn] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Briefcase");

  // Quiz Books & Question Bank states
  const [quizBooks, setQuizBooks] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>("");
  const [newBookNameBn, setNewBookNameBn] = useState("");
  const [newBookNameEn, setNewBookNameEn] = useState("");
  const [newBookSubject, setNewBookSubject] = useState("General Knowledge");

  // New Question form state
  const [newQBookId, setNewQBookId] = useState("");
  const [newQTextBn, setNewQTextBn] = useState("");
  const [newQTextEn, setNewQTextEn] = useState("");
  const [newQOptA, setNewQOptA] = useState("");
  const [newQOptB, setNewQOptB] = useState("");
  const [newQOptC, setNewQOptC] = useState("");
  const [newQOptD, setNewQOptD] = useState("");
  const [newQCorrect, setNewQCorrect] = useState<string>("A");
  const [newQDifficulty, setNewQDifficulty] = useState("MEDIUM");
  const [newQExplanationBn, setNewQExplanationBn] = useState("");

  // Quiz Package form state
  const [newPkgNameBn, setNewPkgNameBn] = useState("");
  const [newPkgNameEn, setNewPkgNameEn] = useState("");
  const [newPkgBookId, setNewPkgBookId] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState(50);
  const [newPkgCount, setNewPkgCount] = useState(10);
  const [newPkgTime, setNewPkgTime] = useState(10);
  const [newPkgTarget, setNewPkgTarget] = useState(8);
  const [newPkgBonus, setNewPkgBonus] = useState(100);

  // Platform Settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: "WOJOB Portal",
    hotline: "09600-000000",
    supportEmail: "support@wojob.com",
    officeAddress: "গুলশান-১, ঢাকা, বাংলাদেশ",
    noticeMessage: "",
  });

  const fetchAllAdminData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (!meData?.authenticated || (meData.user.role !== "SUPER_ADMIN" && meData.user.role !== "ADMIN_STAFF")) {
        window.location.href = "/login?redirect=/admin";
        return;
      }
      setCurrentUser(meData.user);

      const [adminRes, repRes, commRes, catsRes, quizBooksRes, questionsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/data"),
        fetch("/api/admin/reports"),
        fetch("/api/admin/commission"),
        fetch("/api/categories"),
        fetch("/api/quiz/books"),
        fetch("/api/questions"),
        fetch("/api/admin/settings"),
      ]);

      if (adminRes.ok) setAdminData(await adminRes.json());
      if (repRes.ok) setReportData(await repRes.json());
      if (commRes.ok) setCommissionSettings(await commRes.json());
      if (catsRes.ok) {
        const cData = await catsRes.json();
        setCategories(cData.categories || []);
      }
      if (quizBooksRes.ok) {
        const bData = await quizBooksRes.json();
        setQuizBooks(bData.books || []);
        if (bData.books?.length > 0) {
          setNewQBookId(bData.books[0].id);
          setNewPkgBookId(bData.books[0].id);
        }
      }
      if (questionsRes.ok) {
        const qData = await questionsRes.json();
        setQuestions(qData.questions || []);
      }
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.settings) {
          setSiteSettings((prev) => ({ ...prev, ...sData.settings }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  // ----------------------------------------------------
  // JOB ACTIONS
  // ----------------------------------------------------
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.titleBn || !jobForm.organizationName || !jobForm.categoryId) {
      alert(language === "bn" ? "অনুগ্রহ করে শিরোনাম, প্রতিষ্ঠান ও ক্যাটাগরি পূরণ করুন" : "Please fill out required job fields");
      return;
    }

    try {
      const url = editingJobId ? `/api/jobs/${editingJobId}` : "/api/jobs";
      const method = editingJobId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });

      if (res.ok) {
        setActionMessage(editingJobId ? "চাকরির বিজ্ঞপ্তি আপডেট হয়েছে!" : "নতুন চাকরির সার্কুলার সফলভাবে প্রকাশিত হয়েছে!");
        setShowJobForm(false);
        setEditingJobId(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save job");
      }
    } catch {
      alert("Server error");
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(language === "bn" ? `'${title}' সার্কুলারটি ডিলিট করতে চান?` : `Delete circular '${title}'?`)) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage("চাকরির বিজ্ঞপ্তি মুছে ফেলা হয়েছে!");
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleToggleJobStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "CLOSED" : "PUBLISHED";
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setActionMessage(`সার্কুলার স্ট্যাটাস: ${nextStatus}`);
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleViewApplicants = async (jobId: string) => {
    setViewingJobId(jobId);
    setLoadingApplicants(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/applications`);
      if (res.ok) {
        const d = await res.json();
        setJobApplicants(d.applications || []);
      }
    } catch {}
    finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${viewingJobId}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (res.ok) {
        setJobApplicants((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
        );
        setActionMessage(`আবেদনকারীর স্ট্যাটাস '${status}' করা হয়েছে!`);
      }
    } catch {}
  };

  // ----------------------------------------------------
  // USER ACTIONS
  // ----------------------------------------------------
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setActionMessage(`ইউজারের রোল '${newRole}' এ পরিবর্তন করা হয়েছে!`);
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      if (res.ok) {
        setActionMessage(`ইউজার এখন ${nextStatus}!`);
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleImpersonate = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      if (res.ok) {
        window.location.href = "/dashboard";
      } else {
        const d = await res.json();
        alert(d.error || "Impersonation failed");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || adjustAmount === 0) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: adjustingUser.id,
          walletAdjustment: Number(adjustAmount),
          adjustmentReason: adjustReason,
        }),
      });
      if (res.ok) {
        setActionMessage(`৳ ${adjustAmount} ব্যালেন্স সফলভাবে সমন্বয় করা হয়েছে!`);
        setAdjustingUser(null);
        setAdjustAmount(0);
        setAdjustReason("");
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || newAdminPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resettingUser.id,
          newPassword: newAdminPassword,
        }),
      });
      if (res.ok) {
        setActionMessage("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!");
        setResettingUser(null);
        setNewAdminPassword("");
      }
    } catch {}
  };

  // ----------------------------------------------------
  // FINANCE & REQUESTS ACTIONS
  // ----------------------------------------------------
  const handleCashInAction = async (requestId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/admin/cash-in/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`ক্যাশ-ইন রিকোয়েস্ট ${action === "APPROVE" ? "অনুমোদিত" : "বাতিল"} হয়েছে!`);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || "Action failed");
      }
    } catch {}
  };

  const handleCashOutAction = async (requestId: string, action: "APPROVE" | "REJECT") => {
    try {
      const res = await fetch(`/api/admin/cash-out/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMessage(`ক্যাশ-আউট রিকোয়েস্ট ${action === "APPROVE" ? "অনুমোদিত" : "বাতিল"} হয়েছে!`);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        alert(d.error || "Action failed");
      }
    } catch {}
  };

  // ----------------------------------------------------
  // QUIZ & PACKAGES ACTIONS
  // ----------------------------------------------------
  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgNameBn || !newPkgBookId) return;
    try {
      const res = await fetch("/api/quiz/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: newPkgNameBn,
          nameEn: newPkgNameEn || newPkgNameBn,
          bookId: newPkgBookId,
          price: Number(newPkgPrice),
          questionCount: Number(newPkgCount),
          timeLimitMinutes: Number(newPkgTime),
          targetScore: Number(newPkgTarget),
          bonusAmount: Number(newPkgBonus),
        }),
      });
      if (res.ok) {
        setActionMessage("নতুন কুইজ প্যাকেজ তৈরি হয়েছে!");
        setNewPkgNameBn("");
        setNewPkgNameEn("");
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/quiz/packages?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage("কুইজ প্যাকেজ মুছে ফেলা হয়েছে!");
        fetchAllAdminData();
      }
    } catch {}
  };

  // ----------------------------------------------------
  // SETTINGS ACTION
  // ----------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });
      if (res.ok) {
        setActionMessage("প্ল্যাটফর্ম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  // Filtered jobs
  const jobsList = (adminData?.jobs || []).filter((j: any) => {
    const matchesSearch =
      !jobSearch ||
      j.titleBn?.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.organizationName?.toLowerCase().includes(jobSearch.toLowerCase());
    const matchesStatus = jobStatusFilter === "ALL" || j.status === jobStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered users
  const usersList = (adminData?.users || []).filter((u: any) => {
    const matchesSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Master Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight">
                {language === "bn" ? "সুপার অ্যাডমিন মাস্টার প্যানেল" : "Super Admin Master Panel"}
              </h1>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">
                {currentUser?.role || "SUPER_ADMIN"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === "bn"
                ? "চাকরি, ইউজার, কুইজ, ওয়ালেট ও কমিশন সহ প্ল্যাটফর্মের সম্পূর্ণ নিয়ন্ত্রণ"
                : "Full Centralized Control: Jobs, Circulars, Users, Finance, Quizzes & System Configuration"}
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-1.5 text-xs font-bold bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "overview" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "ওভারভিউ" : "Overview"}
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "jobs" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "চাকরি সার্কুলার" : "Jobs"}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "users" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "ইউজার ম্যানেজমেন্ট" : "Users"}
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "finance" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "ক্যাশ-ইন / আউট" : "Finance"}
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "quizzes" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "কুইজ ও প্রশ্ন" : "Quizzes"}
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "categories" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "ক্যাটাগরি" : "Categories"}
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "commission" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "কমিশন" : "Commission"}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "settings" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            {language === "bn" ? "সেটিংস" : "Settings"}
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. OVERVIEW & METRICS TAB */}
      {/* ======================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Ledger Reconciliation Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  reportData?.reconciliation?.passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}
              >
                {reportData?.reconciliation?.passed ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {reportData?.reconciliation?.passed
                    ? (language === "bn" ? "লেজার রিকনসিলিয়েশন ভেরিফাইড (Passed ✓)" : "Ledger Reconciliation Passed ✓")
                    : "Ledger Reconciliation Status"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === "bn" ? "ইউজার ব্যালেন্স:" : "Total User Balances:"} ৳ {reportData?.reconciliation?.totalUserBalances?.toLocaleString() || "0"} |{" "}
                  {language === "bn" ? "লেজার ক্রেডিট:" : "Total Ledger Credits:"} ৳ {reportData?.reconciliation?.sumLedgerCredits?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {language === "bn" ? "১০০% ব্যালেন্স মিল রয়েছে" : "100% Balanced"}
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-400 font-semibold uppercase">
                {language === "bn" ? "মোট চাকরির বিজ্ঞপ্তি" : "Total Jobs"}
              </div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {adminData?.jobs?.length || reportData?.metrics?.totalJobs || 0}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-400 font-semibold uppercase">
                {language === "bn" ? "মোট আবেদন জমা" : "Total Applications"}
              </div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {reportData?.metrics?.totalApplications || 0}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-400 font-semibold uppercase">
                {language === "bn" ? "মোট ইউজার অ্যাকাউন্ট" : "Total Users"}
              </div>
              <div className="text-2xl font-black text-gray-900 mt-1">
                {adminData?.users?.length || reportData?.metrics?.totalUsers || 0}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-400 font-semibold uppercase">
                {language === "bn" ? "মোট কমিশন পেইড" : "Total Commissions Paid"}
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                ৳ {reportData?.metrics?.totalCommissions?.toLocaleString() || 0}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Jobs and Finance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <span>{language === "bn" ? "চাকরির সার্কুলার নিয়ন্ত্রণ" : "Job Circulars Management"}</span>
                </h3>
                <button
                  onClick={() => {
                    setActiveTab("jobs");
                    setShowJobForm(true);
                  }}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition"
                >
                  + {language === "bn" ? "নতুন চাকরি যোগ করুন" : "Add Job"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {language === "bn"
                  ? "নতুন নিয়োগ বিজ্ঞপ্তি পোস্ট করুন, মেয়াদ বা শর্তাবলী সম্পাদনা করুন এবং আবেদনকারীদের তালিকা দেখুন।"
                  : "Post new job circulars, manage deadlines, requirements, and review candidate applications."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>{language === "bn" ? "ক্যাশ-ইন ও ক্যাশ-আউট পেন্ডিং" : "Pending Financial Requests"}</span>
                </h3>
                <button
                  onClick={() => setActiveTab("finance")}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  {language === "bn" ? "অনুমোদন করুন" : "Review"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {language === "bn"
                  ? `পেন্ডিং ক্যাশ-ইন: ${(adminData?.cashInRequests || []).filter((r: any) => r.status === "PENDING").length} টি | পেন্ডিং ক্যাশ-আউট: ${(adminData?.cashOutRequests || []).filter((r: any) => r.status === "PENDING").length} টি`
                  : `Pending Cash-In: ${(adminData?.cashInRequests || []).filter((r: any) => r.status === "PENDING").length} | Pending Cash-Out: ${(adminData?.cashOutRequests || []).filter((r: any) => r.status === "PENDING").length}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. JOBS MANAGEMENT TAB (Full Control) */}
      {/* ======================================================== */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? "চাকরির সার্কুলার ম্যানেজমেন্ট" : "Job Circulars Management"}
              </h2>
              <p className="text-xs text-gray-500">
                {language === "bn"
                  ? "সকল চাকরির বিজ্ঞপ্তি তৈরি, সম্পাদনা, স্ট্যাটাস পরিবর্তন ও আবেদনকারীদের যাচাই করুন"
                  : "Create, edit, toggle status, and inspect applicants for all job listings."}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingJobId(null);
                setJobForm({
                  titleBn: "",
                  titleEn: "",
                  organizationName: "",
                  categoryId: categories[0]?.id || "",
                  jobType: "FULL_TIME",
                  workplaceLocation: "ঢাকা",
                  vacancy: 1,
                  salaryRange: "আলোচনা সাপেক্ষে",
                  educationReq: "স্নাতক / সমমান",
                  experienceReq: "১-২ বছর",
                  ageLimit: "১৮-৩০ বছর",
                  deadline: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
                  descriptionBn: "",
                  status: "PUBLISHED",
                });
                setShowJobForm(!showJobForm);
              }}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl transition shadow-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{showJobForm ? (language === "bn" ? "ফর্ম বন্ধ করুন" : "Close Form") : (language === "bn" ? "নতুন সার্কুলার পোস্ট করুন" : "Post New Job")}</span>
            </button>
          </div>

          {/* Job Creation / Edit Form Modal or Toggle */}
          {showJobForm && (
            <div className="bg-white rounded-3xl p-6 border-2 border-orange-500/20 shadow-md space-y-4">
              <h3 className="font-bold text-gray-900 text-base">
                {editingJobId
                  ? (language === "bn" ? "বিজ্ঞপ্তি সম্পাদনা করুন" : "Edit Job Circular")
                  : (language === "bn" ? "নতুন চাকরির বিজ্ঞপ্তি যোগ করুন" : "Create New Job Circular")}
              </h3>

              <form onSubmit={handleSaveJob} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.titleBn}
                    onChange={(e) => setJobForm({ ...jobForm, titleBn: e.target.value })}
                    placeholder="e.g. সহকারী পরিচালক"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Job Title (English)</label>
                  <input
                    type="text"
                    value={jobForm.titleEn}
                    onChange={(e) => setJobForm({ ...jobForm, titleEn: e.target.value })}
                    placeholder="e.g. Assistant Director"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.organizationName}
                    onChange={(e) => setJobForm({ ...jobForm, organizationName: e.target.value })}
                    placeholder="e.g. বাংলাদেশ পাবলিক সার্ভিস কমিশন"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={jobForm.categoryId}
                    onChange={(e) => setJobForm({ ...jobForm, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                  >
                    <option value="">-- সিলেক্ট করুন --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">চাকরির ধরন</label>
                  <select
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                  >
                    <option value="FULL_TIME">ফুল-টাইম (Full-Time)</option>
                    <option value="CONTRACTUAL">চুক্তিভিত্তিক (Contractual)</option>
                    <option value="PART_TIME">পার্ট-টাইম (Part-Time)</option>
                    <option value="INTERNSHIP">ইন্টার্নশিপ (Internship)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">কর্মক্ষেত্র / জেলা</label>
                  <input
                    type="text"
                    value={jobForm.workplaceLocation}
                    onChange={(e) => setJobForm({ ...jobForm, workplaceLocation: e.target.value })}
                    placeholder="e.g. ঢাকা"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদসংখ্যা</label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.vacancy}
                    onChange={(e) => setJobForm({ ...jobForm, vacancy: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">বেতন স্কেল</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    placeholder="e.g. ৳ ৩০,০০০ - ৫০,০০০"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">আবেদনের শেষ তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা</label>
                  <input
                    type="text"
                    value={jobForm.educationReq}
                    onChange={(e) => setJobForm({ ...jobForm, educationReq: e.target.value })}
                    placeholder="e.g. যে কোনো বিষয়ে ৪ বছর মেয়াদি স্নাতক"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">কাজের অভিজ্ঞতা</label>
                  <input
                    type="text"
                    value={jobForm.experienceReq}
                    onChange={(e) => setJobForm({ ...jobForm, experienceReq: e.target.value })}
                    placeholder="e.g. প্রয়োজন নেই / ১-২ বছর"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={jobForm.status}
                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white font-bold"
                  >
                    <option value="PUBLISHED">সক্রিয় (PUBLISHED)</option>
                    <option value="PENDING">পেন্ডিং (PENDING)</option>
                    <option value="CLOSED">বন্ধ (CLOSED)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">চাকরির বিবরণ ও শর্তাবলী</label>
                  <textarea
                    rows={3}
                    value={jobForm.descriptionBn}
                    onChange={(e) => setJobForm({ ...jobForm, descriptionBn: e.target.value })}
                    placeholder="চাকরির বিস্তারিত দায়িত্ব ও প্রয়োজনীয় শর্তাবলী..."
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    {editingJobId ? "আপডেট সংরক্ষণ করুন" : "বিজ্ঞপ্তি প্রকাশ করুন"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={language === "bn" ? "চাকরি বা প্রতিষ্ঠানের নাম দিয়ে খুঁজুন..." : "Search jobs..."}
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
              />
            </div>

            <select
              value={jobStatusFilter}
              onChange={(e) => setJobStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white font-bold"
            >
              <option value="ALL">সকল স্ট্যাটাস (All Status)</option>
              <option value="PUBLISHED">সক্রিয় (PUBLISHED)</option>
              <option value="PENDING">পেন্ডিং (PENDING)</option>
              <option value="CLOSED">বন্ধ (CLOSED)</option>
              <option value="EXPIRED">মেয়াদ শেষ (EXPIRED)</option>
            </select>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">পদের নাম ও প্রতিষ্ঠান</th>
                    <th className="px-5 py-4">ক্যাটাগরি</th>
                    <th className="px-5 py-4">আবেদনের শেষ তারিখ</th>
                    <th className="px-5 py-4">আবেদনকারী</th>
                    <th className="px-5 py-4">স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                        কোনো চাকরি পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    jobsList.map((job: any) => (
                      <tr key={job.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4">
                          <Link href={`/jobs/${job.id}`} target="_blank" className="font-bold text-gray-900 hover:text-orange-600">
                            {job.titleBn}
                          </Link>
                          <div className="text-[11px] text-gray-400">{job.organizationName}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[10px]">
                            {job.category?.nameBn}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-500 font-medium">
                          {new Date(job.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleViewApplicants(job.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          >
                            <Users className="w-3 h-3" />
                            <span>{job._count?.applications || 0} জন</span>
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleJobStatus(job.id, job.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              job.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                            title="Click to toggle status"
                          >
                            {job.status}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingJobId(job.id);
                              setJobForm({
                                titleBn: job.titleBn,
                                titleEn: job.titleEn || "",
                                organizationName: job.organizationName,
                                categoryId: job.categoryId,
                                jobType: job.jobType,
                                workplaceLocation: job.workplaceLocation || "",
                                vacancy: job.vacancy,
                                salaryRange: job.salaryRange,
                                educationReq: job.educationReq || "",
                                experienceReq: job.experienceReq || "",
                                ageLimit: job.ageLimit || "",
                                deadline: new Date(job.deadline).toISOString().split("T")[0],
                                descriptionBn: job.descriptionBn || "",
                                status: job.status,
                              });
                              setShowJobForm(true);
                            }}
                            className="text-blue-600 hover:underline font-bold text-[11px]"
                          >
                            সম্পাদনা
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id, job.titleBn)}
                            className="text-red-500 hover:text-red-700 font-bold text-[11px]"
                          >
                            ডিলিট
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Viewing Applicants Modal / Drawer */}
          {viewingJobId && (
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>আবেদনকারীদের তালিকা ({jobApplicants.length})</span>
                </h3>
                <button
                  onClick={() => setViewingJobId(null)}
                  className="text-slate-400 hover:text-white font-bold text-xs"
                >
                  ✕ বন্ধ করুন
                </button>
              </div>

              {loadingApplicants ? (
                <div className="text-center py-6 text-xs text-slate-400">আবেদনকারীদের তথ্য লোড হচ্ছে...</div>
              ) : jobApplicants.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">এই চাকরিতে এখনো কেউ আবেদন করেনি।</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {jobApplicants.map((app) => (
                    <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-white text-sm">
                          {app.customer?.user?.name || "নাম পাওয়া যায়নি"}
                        </div>
                        <div className="text-slate-400">
                          ফোন: {app.customer?.user?.phone} | ইমেইল: {app.customer?.user?.email || "N/A"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          আবেদনের তারিখ: {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">স্ট্যাটাস:</span>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                          className="bg-slate-800 text-amber-400 font-bold px-2.5 py-1 rounded-lg border border-slate-700 text-xs"
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="VIEWED">VIEWED</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW_CALLED">INTERVIEW_CALLED</option>
                          <option value="SELECTED">SELECTED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. USERS MANAGEMENT TAB (Real Database Users) */}
      {/* ======================================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {language === "bn" ? "ব্যবহারকারী অ্যাকাউন্ট ও রোল কন্ট্রোল" : "User Accounts & Role Control"}
              </h2>
              <p className="text-xs text-gray-500">
                {language === "bn"
                  ? "রোল পরিবর্তন, অ্যাকাউন্ট স্থগিত/সক্রিয়, পাসওয়ার্ড রিসেট, ওয়ালেট ব্যালেন্স সমন্বয় ও লগইন-অ্যাজ"
                  : "Promote roles, suspend/activate accounts, reset passwords, adjust wallets, and login-as."}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="নাম, ফোন বা ইমেইল দিয়ে ইউজার খুঁজুন..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white font-bold"
            >
              <option value="ALL">সকল রোল (All Roles)</option>
              <option value="CUSTOMER">ক্যান্ডিডেট (CUSTOMER)</option>
              <option value="AGENT">এজেন্ট (AGENT)</option>
              <option value="ADMIN_STAFF">স্টাফ (ADMIN_STAFF)</option>
              <option value="SUPER_ADMIN">সুপার অ্যাডমিন (SUPER_ADMIN)</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">নাম ও যোগাযোগ</th>
                    <th className="px-5 py-4">রোল (Role)</th>
                    <th className="px-5 py-4">ওয়ালেট ব্যালেন্স</th>
                    <th className="px-5 py-4">প্রোফাইল</th>
                    <th className="px-5 py-4">স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                        কোনো ইউজার পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u: any) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                          <div className="text-[11px] text-gray-400">{u.phone} {u.email ? `• ${u.email}` : ""}</div>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                            disabled={currentUser?.role !== "SUPER_ADMIN"}
                            className="bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded-lg border border-gray-200 text-xs"
                          >
                            <option value="CUSTOMER">CUSTOMER</option>
                            <option value="AGENT">AGENT</option>
                            <option value="ADMIN_STAFF">ADMIN_STAFF</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 font-black text-gray-900">
                          ৳ {u.wallet?.balance?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-emerald-600">
                            {u.candidateProfile?.completeness || 0}%
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                          >
                            {u.status}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleImpersonate(u.id)}
                            className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition"
                            title="Login As User"
                          >
                            Login As
                          </button>
                          <button
                            onClick={() => setAdjustingUser(u)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition"
                            title="Adjust Balance"
                          >
                            ব্যালেন্স
                          </button>
                          <button
                            onClick={() => setResettingUser(u)}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 transition"
                            title="Reset Password"
                          >
                            পাসওয়ার্ড
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Balance Adjustment Modal */}
          {adjustingUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <h3 className="font-black text-base text-gray-900">
                  ব্যালেন্স সমন্বয়: {adjustingUser.name}
                </h3>
                <p className="text-xs text-gray-500">
                  বর্তমান ব্যালেন্স: ৳ {adjustingUser.wallet?.balance || 0}
                </p>

                <form onSubmit={handleExecuteAdjustment} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      টাকার পরিমাণ (+ যোগ করতে ধনাত্মক, - কাটতে ঋণাত্মক)
                    </label>
                    <input
                      type="number"
                      required
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(Number(e.target.value))}
                      placeholder="e.g. 100 or -50"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">সমন্বয়ের কারণ / নোট</label>
                    <input
                      type="text"
                      required
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="e.g. বিশেষ বোনাস / ম্যানুয়াল রিফান্ড"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdjustingUser(null)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      নিশ্চিত করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Password Reset Modal */}
          {resettingUser && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <h3 className="font-black text-base text-gray-900">
                  পাসওয়ার্ড রিসেট: {resettingUser.name}
                </h3>
                <form onSubmit={handleExecutePasswordReset} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResettingUser(null)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                    >
                      রিসেট সম্পন্ন করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. FINANCE TAB (Cash-in & Cash-out Approvals) */}
      {/* ======================================================== */}
      {activeTab === "finance" && (
        <div className="space-y-8">
          {/* Cash-In Requests Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              <span>ক্যাশ-ইন রিকোয়েস্ট তালিকা ({adminData?.cashInRequests?.length || 0})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">ইউজার</th>
                    <th className="px-4 py-3">পরিমাণ</th>
                    <th className="px-4 py-3">পদ্ধতি</th>
                    <th className="px-4 py-3">প্রেরক ফোন</th>
                    <th className="px-4 py-3">TrxID</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(adminData?.cashInRequests || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                        কোনো ক্যাশ-ইন রিকোয়েস্ট নেই।
                      </td>
                    </tr>
                  ) : (
                    (adminData?.cashInRequests || []).map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-900">{req.user?.name}</td>
                        <td className="px-4 py-3 font-black text-emerald-600">৳ {req.amount}</td>
                        <td className="px-4 py-3">{req.method}</td>
                        <td className="px-4 py-3 font-mono">{req.senderNumber}</td>
                        <td className="px-4 py-3 font-mono text-gray-800 font-bold">{req.transactionId}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700"
                                : req.status === "REJECTED"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {req.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleCashInAction(req.id, "APPROVE")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                অনুমোদন
                              </button>
                              <button
                                onClick={() => handleCashInAction(req.id, "REJECT")}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                বাতিল
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash-Out Requests Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-red-600" />
              <span>ক্যাশ-আউট রিকোয়েস্ট তালিকা ({adminData?.cashOutRequests?.length || 0})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">ইউজার</th>
                    <th className="px-4 py-3">পরিমাণ</th>
                    <th className="px-4 py-3">পদ্ধতি</th>
                    <th className="px-4 py-3">প্রাপক ফোন</th>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(adminData?.cashOutRequests || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                        কোনো ক্যাশ-আউট রিকোয়েস্ট নেই।
                      </td>
                    </tr>
                  ) : (
                    (adminData?.cashOutRequests || []).map((req: any) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-900">{req.user?.name}</td>
                        <td className="px-4 py-3 font-black text-red-600">৳ {req.amount}</td>
                        <td className="px-4 py-3">{req.method}</td>
                        <td className="px-4 py-3 font-mono">{req.receiverNumber}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700"
                                : req.status === "REJECTED"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {req.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleCashOutAction(req.id, "APPROVE")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                পেইড ও অনুমোদন
                              </button>
                              <button
                                onClick={() => handleCashOutAction(req.id, "REJECT")}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold"
                              >
                                বাতিল ও রিফান্ড
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. QUIZZES & PACKAGES TAB */}
      {/* ======================================================== */}
      {activeTab === "quizzes" && (
        <div className="space-y-8">
          {/* Create Quiz Package Form */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-orange-600" />
              <span>নতুন কুইজ প্যাকেজ তৈরি করুন</span>
            </h3>

            <form onSubmit={handleCreatePackage} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">প্যাকেজ নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={newPkgNameBn}
                  onChange={(e) => setNewPkgNameBn(e.target.value)}
                  placeholder="e.g. সাধারণ জ্ঞান স্পেশাল কুইজ"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">কুইজ বিষয় / বই *</label>
                <select
                  value={newPkgBookId}
                  onChange={(e) => setNewPkgBookId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white font-bold"
                >
                  {quizBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nameBn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">প্যাকেজ মূল্য (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">টার্গেট বোনাস পুরস্কার (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={newPkgBonus}
                  onChange={(e) => setNewPkgBonus(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">প্রশ্নসংখ্যা</label>
                <input
                  type="number"
                  min={1}
                  value={newPkgCount}
                  onChange={(e) => setNewPkgCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সময়সীমা (মিনিট)</label>
                <input
                  type="number"
                  min={1}
                  value={newPkgTime}
                  onChange={(e) => setNewPkgTime(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">টার্গেট স্কোর (পয়েন্ট)</label>
                <input
                  type="number"
                  min={1}
                  value={newPkgTarget}
                  onChange={(e) => setNewPkgTarget(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={quizBooks.length === 0}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  প্যাকেজ প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Quiz Packages Table */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">লাইভ কুইজ প্যাকেজসমূহ ({adminData?.quizPackages?.length || 0})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">প্যাকেজ নাম</th>
                    <th className="px-4 py-3">কুইজ বিষয়</th>
                    <th className="px-4 py-3">মূল্য</th>
                    <th className="px-4 py-3">টার্গেট বোনাস</th>
                    <th className="px-4 py-3">প্রশ্ন / সময়</th>
                    <th className="px-4 py-3">চেষ্টা সংখ্যা</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(adminData?.quizPackages || []).map((pkg: any) => (
                    <tr key={pkg.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-bold text-gray-900">{pkg.nameBn}</td>
                      <td className="px-4 py-3">{pkg.book?.nameBn}</td>
                      <td className="px-4 py-3 font-black text-gray-900">৳ {pkg.price}</td>
                      <td className="px-4 py-3 font-black text-emerald-600">৳ {pkg.bonusAmount}</td>
                      <td className="px-4 py-3">{pkg.questionCount} প্রশ্ন / {pkg.timeLimitMinutes} মিনিট</td>
                      <td className="px-4 py-3">{pkg._count?.attempts || 0} বার</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ডিলিট
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Question Bank Manager */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">প্রশ্ন ব্যাংক ও আপলোড ({questions.length})</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">বিষয় ফিল্টার:</span>
                <select
                  value={selectedBookFilter}
                  onChange={(e) => setSelectedBookFilter(e.target.value)}
                  className="p-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                >
                  <option value="">সকল বিষয়</option>
                  {quizBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nameBn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-600">
                <thead className="bg-gray-50 text-gray-900 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">প্রশ্ন</th>
                    <th className="py-3 px-4">ক. অপশন</th>
                    <th className="py-3 px-4">খ. অপশন</th>
                    <th className="py-3 px-4">সঠিক</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {questions
                    .filter((q) => !selectedBookFilter || q.bookId === selectedBookFilter)
                    .slice(0, 15)
                    .map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate">{q.questionBn}</td>
                        <td className="py-3 px-4">{q.optionA}</td>
                        <td className="py-3 px-4">{q.optionB}</td>
                        <td className="py-3 px-4 font-black text-emerald-600">{q.correctOption}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              if (confirm("Delete question?")) {
                                await fetch(`/api/questions?id=${q.id}`, { method: "DELETE" });
                                setQuestions((prev) => prev.filter((item) => item.id !== q.id));
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ডিলিট
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. CATEGORIES TAB */}
      {/* ======================================================== */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-600" />
              <span>নতুন ক্যাটাগরি তৈরি করুন</span>
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch("/api/categories", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    nameBn: newCatNameBn,
                    nameEn: newCatNameEn || newCatNameBn,
                    slug: newCatSlug,
                    icon: newCatIcon,
                  }),
                });
                if (res.ok) {
                  setActionMessage("নতুন ক্যাটাগরি তৈরি হয়েছে!");
                  setNewCatNameBn("");
                  setNewCatNameEn("");
                  setNewCatSlug("");
                  fetchAllAdminData();
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={newCatNameBn}
                  onChange={(e) => setNewCatNameBn(e.target.value)}
                  placeholder="e.g. কৃষি ও খামার"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="e.g. Agriculture"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="e.g. krishi"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">বিদ্যমান ক্যাটাগরিসমূহ ({categories.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{c.nameBn}</div>
                    <div className="text-xs text-gray-400 font-mono">slug: {c.slug}</div>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(`Delete ${c.nameBn}?`)) {
                        await fetch(`/api/categories?id=${c.id}`, { method: "DELETE" });
                        fetchAllAdminData();
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    ডিলিট
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. COMMISSION CONTROL TAB */}
      {/* ======================================================== */}
      {activeTab === "commission" && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">গ্লোবাল ও এজেন্ট কমিশন কন্ট্রোল</h2>
              <p className="text-xs text-gray-500">সুপার অ্যাডমিন অনুমতিতে কমিশন অন/অফ ও রেট সমন্বয়</p>
            </div>
            <button
              onClick={async () => {
                const next = !commissionSettings?.globalEnabled;
                await fetch("/api/admin/commission", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ globalEnabled: next }),
                });
                fetchAllAdminData();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
                commissionSettings?.globalEnabled ? "bg-emerald-600" : "bg-red-600"
              }`}
            >
              গ্লোবাল কমিশন: {commissionSettings?.globalEnabled ? "সক্রিয় (ON)" : "বন্ধ (OFF)"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">এজেন্ট নাম</th>
                  <th className="px-4 py-3">রেফারেল কোড</th>
                  <th className="px-4 py-3">কমিশন রেট</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(commissionSettings?.agents || []).map((ag: any) => (
                  <tr key={ag.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-900">{ag.user?.name}</td>
                    <td className="px-4 py-3 font-mono font-bold">{ag.referralCode}</td>
                    <td className="px-4 py-3 font-black text-emerald-600">{ag.commissionRate}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${ag.commissionActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {ag.commissionActive ? "ACTIVE" : "DISABLED"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={async () => {
                          await fetch("/api/admin/commission", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ agentId: ag.id, agentCommissionActive: !ag.commissionActive }),
                          });
                          fetchAllAdminData();
                        }}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        {ag.commissionActive ? "বন্ধ করুন" : "চালু করুন"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. SETTINGS TAB */}
      {/* ======================================================== */}
      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-700" />
            <span>সিস্টেম ও প্ল্যাটফর্ম সেটিংস</span>
          </h2>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">সাইটের নাম / ব্র্যান্ড</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">কাস্টমার সাপোর্ট হটলাইন</label>
              <input
                type="text"
                value={siteSettings.hotline}
                onChange={(e) => setSiteSettings({ ...siteSettings, hotline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">অফিসিয়াল ইমেইল</label>
              <input
                type="email"
                value={siteSettings.supportEmail}
                onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">হেড অফিস ঠিকানা</label>
              <input
                type="text"
                value={siteSettings.officeAddress}
                onChange={(e) => setSiteSettings({ ...siteSettings, officeAddress: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">জরুরি নোটিশ / ঘোষণা (Notice Board)</label>
              <textarea
                rows={2}
                value={siteSettings.noticeMessage}
                onChange={(e) => setSiteSettings({ ...siteSettings, noticeMessage: e.target.value })}
                placeholder="ওয়েবসাইটের শীর্ষে কোনো নোটিশ বা জরুরি মেসেজ দেখাতে চাইলে লিখুন..."
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
