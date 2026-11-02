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
  Edit2,
  MapPin,
  Building,
  Award,
  FileText,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Shield,
  Star,
} from "lucide-react";

export default function AdminPage() {
  const { language } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "jobs" | "users" | "finance" | "quizzes" | "categories" | "commission" | "settings"
  >("overview");

  // Core administrative data
  const [adminData, setAdminData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [commissionSettings, setCommissionSettings] = useState<any>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    logoUrl: "",
    applicationFee: 0,
    categoryId: "",
    jobType: "FULL_TIME",
    workplaceLocation: "ঢাকা",
    workplaceDistrictId: null as number | null,
    vacancy: 1,
    salaryRange: "আলোচনা সাপেক্ষে",
    educationReq: "স্নাতক / সমমান",
    experienceReq: "১-২ বছর",
    ageLimit: "১৮-৩০ বছর",
    responsibilities: "",
    otherReqs: "",
    deadline: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    descriptionBn: "",
    descriptionEn: "",
    status: "PUBLISHED",
  });

  // Job Applicants View modal
  const [viewingJobId, setViewingJobId] = useState<string | null>(null);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [viewingSnapshot, setViewingSnapshot] = useState<any | null>(null);

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
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editingCat, setEditingCat] = useState<any | null>(null);

  // Quiz Books & Question Bank states
  const [quizBooks, setQuizBooks] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizTab, setQuizTab] = useState<"packages" | "questions">("packages");
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>("");
  const [questionStatusFilter, setQuestionStatusFilter] = useState<string>("ALL");

  // Question form state
  const [newQBookId, setNewQBookId] = useState("");
  const [newQTextBn, setNewQTextBn] = useState("");
  const [newQTextEn, setNewQTextEn] = useState("");
  const [newQOptA, setNewQOptA] = useState("");
  const [newQOptB, setNewQOptB] = useState("");
  const [newQOptC, setNewQOptC] = useState("");
  const [newQOptD, setNewQOptD] = useState("");
  const [newQCorrect, setNewQCorrect] = useState<string>("A");
  const [newQDifficulty, setNewQDifficulty] = useState("MEDIUM");
  const [newQMarks, setNewQMarks] = useState(1.0);
  const [newQNegativeMarks, setNewQNegativeMarks] = useState(0.25);
  const [newQExplanationBn, setNewQExplanationBn] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  // Quiz Package form state
  const [newPkgNameBn, setNewPkgNameBn] = useState("");
  const [newPkgNameEn, setNewPkgNameEn] = useState("");
  const [newPkgDescBn, setNewPkgDescBn] = useState("");
  const [newPkgBookId, setNewPkgBookId] = useState("");
  const [newPkgPrice, setNewPkgPrice] = useState(50);
  const [newPkgCount, setNewPkgCount] = useState(10);
  const [newPkgTime, setNewPkgTime] = useState(10);
  const [newPkgTarget, setNewPkgTarget] = useState(8);
  const [newPkgBonus, setNewPkgBonus] = useState(100);
  const [newPkgRewardEnabled, setNewPkgRewardEnabled] = useState(true);
  const [newPkgPerPointRate, setNewPkgPerPointRate] = useState(0);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);

  // People Structure states
  const [structureSubTab, setStructureSubTab] = useState<"users" | "districts" | "channelPartners" | "agents">("users");
  const [districts, setDistricts] = useState<any[]>([]);
  const [channelPartners, setChannelPartners] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [editingDistrict, setEditingDistrict] = useState<any | null>(null);
  const [editingCP, setEditingCP] = useState<any | null>(null);
  const [editingAgent, setEditingAgent] = useState<any | null>(null);
  const [showNewCPModal, setShowNewCPModal] = useState(false);
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [newCPForm, setNewCPForm] = useState({ name: "", phone: "", password: "", districtId: 1, commissionRate: 5.0 });
  const [newAgentForm, setNewAgentForm] = useState({
    name: "",
    phone: "",
    password: "",
    districtId: 1,
    commissionRate: 10.0,
    isDefault: false,
    cashInActive: true,
    commissionActive: true,
  });

  // Settings & Content sub-tab
  const [settingsSubTab, setSettingsSubTab] = useState<"site" | "payment" | "content">("site");
  const [siteSettings, setSiteSettings] = useState({
    siteName: "WOJOB Portal",
    siteLogo: "",
    hotline: "09600-000000",
    supportEmail: "support@jobportal.bd",
    officeAddress: "গুলশান-১, ঢাকা, বাংলাদেশ",
    noticeMessage: "",
    facebookUrl: "",
    youtubeUrl: "",
    linkedinUrl: "",

    // Payment & Cash-in
    bkashNumber: "01700-000000",
    nagadNumber: "01700-000000",
    rocketNumber: "01700-000000",
    bankInfo: "City Bank A/C: 1234567890",
    cashInInstructions: "বিকাশ, নগদ বা রকেটের মাধ্যমে টাকা সেন্ড মানি করে Transaction ID দিয়ে সাবমিট করুন।",

    // Page Content
    contentHeroTitle: "এক ঠিকানায় সব চাকরি ও ক্যারিয়ার প্রস্তুতি",
    contentHeroSubtitle: "বিসিএস, সরকারি, ব্যাংক, এনজিও ও কর্পোরেট সেক্টরের যাচাইকৃত চাকরির বিজ্ঞপ্তি। একবার প্রোফাইল বানিয়ে ১-ক্লিকে সরাসরি আবেদন করুন।",
    contentIntro: "বাংলাদেশের সরকারি, বেসরকারি, কৃষি ও মৎস্য সেক্টরের চাকরির সর্বাধুনিক পোর্টাল। একবার প্রোফাইল বানান, ১ ক্লিকে আবেদন করুন।",
    contentHowItWorks: "সহজ ৩ ধাপে চাকরির আবেদন সম্পন্ন করুন — একবার প্রোফাইল বানান, যোগ্যতা মিলিয়ে চাকরি খুঁজুন এবং ১ ক্লিকে আবেদন করুন।",
    contentOneClick: "১ ক্লিকে সরাসরি আবেদন করুন — কোনো অতিরিক্ত ফর্ম পূরণের ঝামেলা নেই।",
    contentAbout: "WOJOB বাংলাদেশের চাকরিপ্রার্থী এবং নিয়োগকারী প্রতিষ্ঠানের মাঝে একটি সহজ, নির্ভরযোগ্য ও ডিজিটাল সেতুবন্ধন তৈরি করছে।",
    contentContact: "যেকোনো জিজ্ঞাসা, সহায়তা বা অভিযোগের জন্য আমাদের হেল্পডেস্কে মেসেজ পাঠান।",
    contentPrivacy: "গোপনীয়তা নীতি: আপনার ব্যক্তিগত তথ্য ও সিভি কেবল নিয়োগকারী প্রতিষ্ঠান এবং অনুমোদিত প্রক্রিয়ায় ব্যবহৃত হবে।",
    contentTerms: "শর্তাবলী: WOJOB প্ল্যাটফর্ম ব্যবহারের নিয়মাবলী ও নীতিমালা। সকল তথ্যের সত্যতা নিশ্চিত করে আবেদন করা বাধ্যতামূলক।",
    contentRefund: "রিফান্ড নীতি: যেকোনো অননুমোদিত ফি কর্তন ক্ষেত্রে সাপোর্টে যোগাযোগ করলে ২৪-৭২ ঘণ্টার মধ্যে রিভার্সাল লেজার এন্ট্রির মাধ্যমে ওয়ালেটে রিফান্ড করা হবে।",

    // Money & Commissions
    defaultAgentCommission: "10",
    defaultCpCommission: "5",
    commissionEnabled: "true",
    publicReferralEnabled: "true",
    agentCashInEnabled: "true",
    globalQuizTargetScore: "8",
    globalQuizBonusAmount: "100",
    globalQuizPerPointRate: "0",
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
        fetch("/api/categories?includeInactive=true"),
        fetch("/api/quiz/books"),
        fetch("/api/questions"),
        fetch("/api/admin/settings"),
      ]);

      if (adminRes.ok) {
        const aData = await adminRes.json();
        setAdminData(aData);
        if (aData.districts) setDistricts(aData.districts);
        if (aData.channelPartners) setChannelPartners(aData.channelPartners);
        if (aData.agents) setAgents(aData.agents);
      }
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (actionMessage || errorMessage) {
      const timer = setTimeout(() => {
        setActionMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage, errorMessage]);

  // ----------------------------------------------------
  // JOB ACTIONS
  // ----------------------------------------------------
  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.titleBn || !jobForm.organizationName || !jobForm.categoryId) {
      setErrorMessage("অনুগ্রহ করে শিরোনাম, প্রতিষ্ঠান ও ক্যাটাগরি পূরণ করুন");
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
        setActionMessage(editingJobId ? "চাকরির বিজ্ঞপ্তি আপডেট হয়েছে!" : "নতুন চাকরির সার্কুলার সফলভাবে তৈরি হয়েছে!");
        setShowJobForm(false);
        setEditingJobId(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to save job");
      }
    } catch {
      setErrorMessage("সার্ভার এরর। কিছুক্ষণ পর আবার চেষ্টা করুন।");
    }
  };

  const handleEditJobClick = (job: any) => {
    setEditingJobId(job.id);
    setJobForm({
      titleBn: job.titleBn,
      titleEn: job.titleEn || "",
      organizationName: job.organizationName,
      logoUrl: job.logoUrl || "",
      applicationFee: job.applicationFee || 0,
      categoryId: job.categoryId,
      jobType: job.jobType || "FULL_TIME",
      workplaceLocation: job.workplaceLocation || "",
      workplaceDistrictId: job.workplaceDistrictId || null,
      vacancy: job.vacancy || 1,
      salaryRange: job.salaryRange || "আলোচনা সাপেক্ষে",
      educationReq: job.educationReq || "",
      experienceReq: job.experienceReq || "",
      ageLimit: job.ageLimit || "",
      responsibilities: job.responsibilities || "",
      otherReqs: job.otherReqs || "",
      deadline: new Date(job.deadline).toISOString().split("T")[0],
      descriptionBn: job.descriptionBn || "",
      descriptionEn: job.descriptionEn || "",
      status: job.status || "PUBLISHED",
    });
    setShowJobForm(true);
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!confirm(`'${title}' সার্কুলারটি ডিলিট করতে চান? (আবেদন জমা থাকলে এটি স্বয়ংক্রিয়ভাবে আর্কাইভ হবে)`)) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || "চাকরির বিজ্ঞপ্তি আপডেট হয়েছে!");
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to delete job");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
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
    } catch {} finally {
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

  const handleRefundApplicationFee = async (applicationId: string, candidateName: string, fee: number) => {
    if (!confirm(`প্রার্থী '${candidateName}'-এর আবেদন ফি ৳${fee} ওয়ালেটে রিফান্ড/রিভার্সাল করতে চান?`)) return;
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}/refund`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || `আবেদন ফি ৳${fee} সফলভাবে রিফান্ড করা হয়েছে!`);
        if (viewingJobId) handleViewApplicants(viewingJobId);
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to refund fee");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  // ----------------------------------------------------
  // CATEGORY ACTIONS (Part A)
  // ----------------------------------------------------
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameBn || !newCatSlug) {
      setErrorMessage("ক্যাটাগরির নাম ও স্লাগ আবশ্যক");
      return;
    }
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: newCatNameBn,
          nameEn: newCatNameEn || newCatNameBn,
          slug: newCatSlug,
          icon: newCatIcon,
          description: newCatDesc,
          order: categories.length + 1,
          isActive: true,
        }),
      });
      if (res.ok) {
        setActionMessage("নতুন ক্যাটাগরি তৈরি হয়েছে!");
        setNewCatNameBn("");
        setNewCatNameEn("");
        setNewCatSlug("");
        setNewCatDesc("");
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to create category");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCat),
      });
      if (res.ok) {
        setActionMessage("ক্যাটাগরি সফলভাবে আপডেট হয়েছে!");
        setEditingCat(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to update category");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleReorderCategory = async (catId: string, direction: "up" | "down") => {
    const index = categories.findIndex((c) => c.id === catId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    const reorderPayload = newCats.map((c, idx) => ({ id: c.id, order: idx + 1 }));
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reorderPayload }),
      });
      if (res.ok) {
        setActionMessage("ক্যাটাগরি ক্রম পরিবর্তন সফল হয়েছে!");
        fetchAllAdminData();
      }
    } catch {}
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`'${cat.nameBn}' ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!");
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to delete category");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  // ----------------------------------------------------
  // QUIZ & PACKAGES ACTIONS (Part D)
  // ----------------------------------------------------
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgNameBn || !newPkgBookId) {
      setErrorMessage("প্যাকেজ নাম ও বিষয় আবশ্যক");
      return;
    }
    try {
      const res = await fetch("/api/quiz/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameBn: newPkgNameBn,
          nameEn: newPkgNameEn || newPkgNameBn,
          descriptionBn: newPkgDescBn,
          bookId: newPkgBookId,
          price: Number(newPkgPrice),
          questionCount: Number(newPkgCount),
          timeLimitMinutes: Number(newPkgTime),
          targetScore: Number(newPkgTarget),
          bonusAmount: Number(newPkgBonus),
          rewardEnabled: newPkgRewardEnabled,
          perPointRate: Number(newPkgPerPointRate),
          status: "ACTIVE",
        }),
      });
      if (res.ok) {
        setActionMessage("নতুন কুইজ প্যাকেজ তৈরি হয়েছে!");
        setNewPkgNameBn("");
        setNewPkgNameEn("");
        setNewPkgDescBn("");
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to create package");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      const res = await fetch("/api/quiz/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPkg),
      });
      if (res.ok) {
        setActionMessage("কুইজ প্যাকেজ আপডেট হয়েছে!");
        setEditingPkg(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to update package");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleDeletePackage = async (pkg: any) => {
    if (!confirm(`'${pkg.nameBn}' প্যাকেজটি মুছে ফেলতে চান? (ইতিহাস থাকলে এটি স্বয়ংক্রিয়ভাবে আর্কাইভ হবে)`)) return;
    try {
      const res = await fetch(`/api/quiz/packages?id=${pkg.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || "কুইজ প্যাকেজ সফলভাবে সরানো হয়েছে!");
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to delete package");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  // Questions actions
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQBookId || !newQTextBn || !newQOptA || !newQOptB || !newQCorrect) {
      setErrorMessage("বই, প্রশ্ন, অপশন ও সঠিক উত্তর আবশ্যক");
      return;
    }
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: newQBookId,
          questionBn: newQTextBn,
          questionEn: newQTextEn || newQTextBn,
          optionA: newQOptA,
          optionB: newQOptB,
          optionC: newQOptC,
          optionD: newQOptD,
          correctOption: newQCorrect,
          difficulty: newQDifficulty,
          marks: Number(newQMarks),
          negativeMarks: Number(newQNegativeMarks),
          explanationBn: newQExplanationBn,
          status: "APPROVED",
        }),
      });
      if (res.ok) {
        setActionMessage("প্রশ্ন সফলভাবে যোগ করা হয়েছে!");
        setNewQTextBn("");
        setNewQTextEn("");
        setNewQOptA("");
        setNewQOptB("");
        setNewQOptC("");
        setNewQOptD("");
        setNewQExplanationBn("");
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to create question");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    try {
      const res = await fetch("/api/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingQuestion),
      });
      if (res.ok) {
        setActionMessage("প্রশ্ন সফলভাবে আপডেট হয়েছে!");
        setEditingQuestion(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to update question");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleDeleteQuestion = async (q: any) => {
    if (!confirm(`প্রশ্নটি ডিলিট করতে চান? (উত্তর দেওয়া থাকলে এটি আর্কাইভ হবে)`)) return;
    try {
      const res = await fetch(`/api/questions?id=${q.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(data.message || "প্রশ্ন মুছে ফেলা হয়েছে!");
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to delete question");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  // ----------------------------------------------------
  // PEOPLE STRUCTURE ACTIONS (Part H)
  // ----------------------------------------------------
  const handleSaveDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;
    try {
      const res = await fetch("/api/admin/districts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDistrict),
      });
      if (res.ok) {
        setActionMessage("জেলার নাম সফলভাবে আপডেট হয়েছে!");
        setEditingDistrict(null);
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to update district");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleCreateCP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/channel-partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCPForm),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("নতুন চ্যানেল পার্টনার সফলভাবে নিয়োগ করা হয়েছে!");
        setShowNewCPModal(false);
        setNewCPForm({ name: "", phone: "", password: "", districtId: 1, commissionRate: 5.0 });
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to assign channel partner");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleUpdateCP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCP) return;
    try {
      const res = await fetch("/api/admin/channel-partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCP),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("চ্যানেল পার্টনার তথ্য আপডেট হয়েছে!");
        setEditingCP(null);
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to update channel partner");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAgentForm),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("নতুন এজেন্ট সফলভাবে তৈরি হয়েছে!");
        setShowNewAgentModal(false);
        setNewAgentForm({
          name: "",
          phone: "",
          password: "",
          districtId: 1,
          commissionRate: 10.0,
          isDefault: false,
          cashInActive: true,
          commissionActive: true,
        });
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to create agent");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    try {
      const res = await fetch("/api/admin/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAgent),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage("এজেন্ট তথ্য সফলভাবে আপডেট হয়েছে!");
        setEditingAgent(null);
        fetchAllAdminData();
      } else {
        setErrorMessage(data.error || "Failed to update agent");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
  };

  // ----------------------------------------------------
  // SETTINGS & CONTENT ACTIONS (Part E & F)
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
        setActionMessage("প্ল্যাটফর্ম সেটিংস ও কন্টেন্ট সফলভাবে সংরক্ষিত হয়েছে!");
        fetchAllAdminData();
      } else {
        const d = await res.json();
        setErrorMessage(d.error || "Failed to save settings");
      }
    } catch {
      setErrorMessage("সার্ভার এরর");
    }
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

  // Cash In / Cash Out Actions
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

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchesBook = !selectedBookFilter || q.bookId === selectedBookFilter;
    const matchesStatus = questionStatusFilter === "ALL" || q.status === questionStatusFilter;
    return matchesBook && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">সেন্ট্রাল অ্যাডমিন কন্ট্রোল প্যানেল</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                PROD v11
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ক্যাটাগরি, চাকরি সার্কুলার, কুইজ, ফি, রিওয়ার্ড, কন্টেন্ট ও সিস্টেম সেটিংসের সম্পূর্ণ ডাইনামিক নিয়ন্ত্রণ
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
            ওভারভিউ
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "jobs" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            সার্কুলার ও ফি
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "users" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            ইউজার ও কাঠামো
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "finance" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            ওয়ালেট অনুমোদন
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "quizzes" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            কুইজ ও রিওয়ার্ড
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "categories" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            ক্যাটাগরি
          </button>
          <button
            onClick={() => setActiveTab("commission")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "commission" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            কমিশন
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-2 rounded-xl transition ${
              activeTab === "settings" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-300 hover:text-white"
            }`}
          >
            কন্টেন্ট ও সেটিংস
          </button>
        </div>
      </div>

      {/* Action / Error Banners */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-800 text-xs font-semibold rounded-2xl border border-red-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ======================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Honest Reconciliation Card (B5 Requirement) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>ওয়ালেট ও লেজার ভেরিফিকেশন (Honest Accounting)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  ইউজার ওয়ালেট ব্যালেন্সের মোট যোগফল বনাম অপরিবর্তনযোগ্য লেজারের যোগফল
                </p>
              </div>

              <div className="flex items-center gap-2">
                {reportData?.reconciliation?.passed ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>১০০% লেজার ও ব্যালেন্স ভেরিফাইড</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>সমন্বয় প্রয়োজন (পার্থক্য: ৳ {reportData?.reconciliation?.difference?.toFixed(2) || "0.00"})</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium">মোট ইউজার ওয়ালেট ব্যালেন্স</div>
                <div className="text-xl font-black text-gray-900 mt-1">
                  ৳ {reportData?.reconciliation?.totalUserBalances?.toLocaleString() || "0"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium">মোট লেজার ক্রেডিট যোগফল</div>
                <div className="text-xl font-black text-gray-900 mt-1">
                  ৳ {reportData?.reconciliation?.sumLedgerCredits?.toLocaleString() || "0"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium">ব্যালেন্স অডিট স্থিতি</div>
                <div className="text-base font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>প্রত্যেকটি ব্যালেন্সের লেজার বিদ্যমান</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-medium flex items-center justify-between">
                <span>মোট চাকরির সার্কুলার</span>
                <Briefcase className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {reportData?.metrics?.totalJobs ?? adminData?.jobs?.length ?? 0}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-medium flex items-center justify-between">
                <span>মোট চাকরি আবেদন</span>
                <FileCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {reportData?.metrics?.totalApplications ?? 0}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-medium flex items-center justify-between">
                <span>নিবন্ধিত ইউজার</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {reportData?.metrics?.totalUsers ?? adminData?.users?.length ?? 0}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-medium flex items-center justify-between">
                <span>প্রদত্ত কুইজ রিওয়ার্ড</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                ৳ {reportData?.metrics?.totalQuizBonuses?.toLocaleString() ?? 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. JOBS & APPLICATION FEE TAB (Part B & C) */}
      {/* ======================================================== */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">চাকরি সার্কুলার ও আবেদন ফি কন্ট্রোল</h2>
              <p className="text-xs text-gray-500">
                সার্কুলার তৈরি, এডিট, ডিলিট, প্রতিষ্ঠান লোগো এবং আবেদন ফি (৳) নির্ধারণ
              </p>
            </div>
            <button
              onClick={() => {
                setEditingJobId(null);
                setJobForm({
                  titleBn: "",
                  titleEn: "",
                  organizationName: "",
                  logoUrl: "",
                  applicationFee: 0,
                  categoryId: categories[0]?.id || "",
                  jobType: "FULL_TIME",
                  workplaceLocation: "ঢাকা",
                  workplaceDistrictId: null,
                  vacancy: 1,
                  salaryRange: "আলোচনা সাপেক্ষে",
                  educationReq: "স্নাতক / সমমান",
                  experienceReq: "১-২ বছর",
                  ageLimit: "১৮-৩০ বছর",
                  responsibilities: "",
                  otherReqs: "",
                  deadline: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
                  descriptionBn: "",
                  descriptionEn: "",
                  status: "PUBLISHED",
                });
                setShowJobForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন সার্কুলার যোগ করুন</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="পদবী বা প্রতিষ্ঠান নাম দিয়ে খুঁজুন..."
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
              <option value="ALL">সকল স্ট্যাটাস (All)</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">প্রতিষ্ঠান ও লোগো</th>
                    <th className="px-5 py-4">পদের নাম</th>
                    <th className="px-5 py-4">ক্যাটাগরি</th>
                    <th className="px-5 py-4">আবেদন ফি</th>
                    <th className="px-5 py-4">পদসংখ্যা ও বেতন</th>
                    <th className="px-5 py-4">শেষ তারিখ</th>
                    <th className="px-5 py-4">স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-gray-400">
                        কোনো চাকরির সার্কুলার পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    jobsList.map((job: any) => (
                      <tr key={job.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {job.logoUrl ? (
                              <img
                                src={job.logoUrl}
                                alt={job.organizationName}
                                className="w-8 h-8 rounded-lg object-contain border border-gray-200 p-0.5 bg-white"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs">
                                {job.organizationName?.charAt(0) || "ব"}
                              </div>
                            )}
                            <div className="font-bold text-gray-900">{job.organizationName}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900">
                          <Link href={`/jobs/${job.id}`} target="_blank" className="hover:text-orange-600 hover:underline">
                            {job.titleBn}
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                            {job.category?.nameBn || "ক্যাটাগরি"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-black">
                          {job.applicationFee > 0 ? (
                            <span className="text-orange-600 font-bold">৳ {job.applicationFee}</span>
                          ) : (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                              ফ্রি
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-800">{job.vacancy} টি পদ</div>
                          <div className="text-[11px] text-gray-400">{job.salaryRange}</div>
                        </td>
                        <td className="px-5 py-4 text-xs font-mono">
                          {new Date(job.deadline).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleJobStatus(job.id, job.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              job.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : job.status === "ARCHIVED"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {job.status}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleViewApplicants(job.id)}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-bold transition border border-blue-200"
                          >
                            আবেদন ({job._count?.applications || 0})
                          </button>
                          <button
                            onClick={() => handleEditJobClick(job)}
                            className="px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-[10px] font-bold transition"
                          >
                            এডিট
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id, job.titleBn)}
                            className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-bold transition border border-red-200"
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
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. CATEGORIES TAB (Part A - Full Control + Reorder) */}
      {/* ======================================================== */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-600" />
              <span>নতুন ক্যাটাগরি তৈরি করুন</span>
            </h3>

            <form onSubmit={handleSaveCategory} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
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
                <label className="block text-xs font-bold text-gray-700 mb-1">Name (English)</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="e.g. Agriculture"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Slug (ইউনিক) *</label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="e.g. krishi"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">আইকন নাম (Lucide)</label>
                <input
                  type="text"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  placeholder="Briefcase, Sprout, Landmark..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
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

          {/* Categories List */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">বিদ্যমান ক্যাটাগরিসমূহ ({categories.length})</h3>
              <p className="text-xs text-gray-400">হোমপেজ ও সব দেখুন তালিকায় এই ক্রমেই প্রদর্শিত হবে</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">ক্রম (Order)</th>
                    <th className="px-5 py-4">ক্যাটাগরি নাম (বাংলা / English)</th>
                    <th className="px-5 py-4">স্লাগ (Slug)</th>
                    <th className="px-5 py-4">আইকন</th>
                    <th className="px-5 py-4">সক্রিয় চাকরি</th>
                    <th className="px-5 py-4">স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4 font-bold text-gray-900 flex items-center gap-1.5">
                        <button
                          onClick={() => handleReorderCategory(c.id, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
                          title="উপরে নিন"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReorderCategory(c.id, "down")}
                          disabled={idx === categories.length - 1}
                          className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30"
                          title="নিচে নিন"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="ml-1 font-mono">{idx + 1}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 text-sm">{c.nameBn}</div>
                        <div className="text-[11px] text-gray-400">{c.nameEn}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-gray-600">{c.slug}</td>
                      <td className="px-5 py-4 text-xs font-mono">{c.icon || "Briefcase"}</td>
                      <td className="px-5 py-4 font-black text-gray-900">
                        {c.jobCount} টি চাকরি
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {c.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingCat(c)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition"
                        >
                          এডিট
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c)}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[10px] transition border border-red-200"
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
      {/* 4. QUIZ & REWARDS TAB (Part D) */}
      {/* ======================================================== */}
      {activeTab === "quizzes" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setQuizTab("packages")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                quizTab === "packages" ? "bg-orange-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              কুইজ প্যাকেজ ও রিওয়ার্ড রুল ({adminData?.quizPackages?.length || 0})
            </button>
            <button
              onClick={() => setQuizTab("questions")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                quizTab === "questions" ? "bg-orange-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              প্রশ্ন ব্যাংক ও অনুমোদন ({questions.length})
            </button>
          </div>

          {quizTab === "packages" ? (
            <div className="space-y-6">
              {/* Create Package */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>নতুন কুইজ প্যাকেজ তৈরি করুন</span>
                </h3>

                <form onSubmit={handleSavePackage} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">প্যাকেজ নাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newPkgNameBn}
                      onChange={(e) => setNewPkgNameBn(e.target.value)}
                      placeholder="e.g. সাধারণ জ্ঞান স্পেশাল কুইজ"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">কুইজ বিষয় / বই *</label>
                    <select
                      value={newPkgBookId}
                      onChange={(e) => setNewPkgBookId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white font-bold"
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">প্রশ্নসংখ্যা (পরিবেশিত)</label>
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

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">পয়েন্ট প্রতি বোনাস রেট (৳)</label>
                    <input
                      type="number"
                      min={0}
                      value={newPkgPerPointRate}
                      onChange={(e) => setNewPkgPerPointRate(Number(e.target.value))}
                      placeholder="Optional 0"
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-4 flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPkgRewardEnabled}
                        onChange={(e) => setNewPkgRewardEnabled(e.target.checked)}
                        className="rounded text-orange-600"
                      />
                      <span>এই প্যাকেজে ওয়ালেট পুরস্কার/বোনাস সক্রিয় রাখুন</span>
                    </label>

                    <button
                      type="submit"
                      disabled={quizBooks.length === 0}
                      className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      প্যাকেজ তৈরি করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Packages Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-4">প্যাকেজ নাম</th>
                        <th className="px-5 py-4">বই / বিষয়</th>
                        <th className="px-5 py-4">মূল্য</th>
                        <th className="px-5 py-4">প্রশ্ন ও সময়</th>
                        <th className="px-5 py-4">টার্গেট ও বোনাস</th>
                        <th className="px-5 py-4">রিওয়ার্ড অন/অফ</th>
                        <th className="px-5 py-4">স্ট্যাটাস</th>
                        <th className="px-5 py-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(adminData?.quizPackages || []).map((pkg: any) => (
                        <tr key={pkg.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-4 font-bold text-gray-900">{pkg.nameBn}</td>
                          <td className="px-5 py-4">{pkg.book?.nameBn}</td>
                          <td className="px-5 py-4 font-black">
                            {pkg.price > 0 ? `৳ ${pkg.price}` : "ফ্রি"}
                          </td>
                          <td className="px-5 py-4">
                            <div>{pkg.questionCount} টি প্রশ্ন</div>
                            <div className="text-[11px] text-gray-400">{pkg.timeLimitMinutes} মিনিট</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900">টার্গেট: {pkg.targetScore}</div>
                            <div className="text-[11px] text-emerald-600 font-bold">পুরস্কার: ৳ {pkg.bonusAmount}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pkg.rewardEnabled !== false ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {pkg.rewardEnabled !== false ? "ON" : "OFF"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                pkg.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : pkg.status === "ARCHIVED"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {pkg.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingPkg(pkg)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition"
                            >
                              এডিট
                            </button>
                            <button
                              onClick={() => handleDeletePackage(pkg)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[10px] transition border border-red-200"
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
          ) : (
            /* Questions Bank View */
            <div className="space-y-6">
              {/* Create Question */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-600" />
                  <span>নতুন প্রশ্ন তৈরি করুন</span>
                </h3>

                <form onSubmit={handleSaveQuestion} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">কুইজ বই / বিষয় *</label>
                      <select
                        value={newQBookId}
                        onChange={(e) => setNewQBookId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white font-bold"
                      >
                        {quizBooks.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.nameBn} ({b.subject})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">সঠিক উত্তর *</label>
                      <select
                        value={newQCorrect}
                        onChange={(e) => setNewQCorrect(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white font-bold text-emerald-600"
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">ডিফিকাল্টি</label>
                      <select
                        value={newQDifficulty}
                        onChange={(e) => setNewQDifficulty(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">প্রশ্ন (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newQTextBn}
                      onChange={(e) => setNewQTextBn(e.target.value)}
                      placeholder="প্রশ্নটি লিখুন..."
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Option A *</label>
                      <input
                        type="text"
                        required
                        value={newQOptA}
                        onChange={(e) => setNewQOptA(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Option B *</label>
                      <input
                        type="text"
                        required
                        value={newQOptB}
                        onChange={(e) => setNewQOptB(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Option C</label>
                      <input
                        type="text"
                        value={newQOptC}
                        onChange={(e) => setNewQOptC(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Option D</label>
                      <input
                        type="text"
                        value={newQOptD}
                        onChange={(e) => setNewQOptD(e.target.value)}
                        className="w-full p-2 rounded-xl border border-gray-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="py-2 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    >
                      প্রশ্ন সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              </div>

              {/* Questions List Table */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedBookFilter}
                    onChange={(e) => setSelectedBookFilter(e.target.value)}
                    className="p-2 rounded-xl border border-gray-200 text-xs bg-white font-bold"
                  >
                    <option value="">সকল বিষয় / বই</option>
                    {quizBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nameBn}
                      </option>
                    ))}
                  </select>

                  <select
                    value={questionStatusFilter}
                    onChange={(e) => setQuestionStatusFilter(e.target.value)}
                    className="p-2 rounded-xl border border-gray-200 text-xs bg-white font-bold"
                  >
                    <option value="ALL">সকল স্ট্যাটাস</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-4">প্রশ্ন</th>
                        <th className="px-5 py-4">বই</th>
                        <th className="px-5 py-4">অপশনসমূহ</th>
                        <th className="px-5 py-4">সঠিক উত্তর</th>
                        <th className="px-5 py-4">স্ট্যাটাস</th>
                        <th className="px-5 py-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-4 font-bold text-gray-900 max-w-xs">{q.questionBn}</td>
                          <td className="px-5 py-4">{q.book?.nameBn}</td>
                          <td className="px-5 py-4 text-[11px] text-gray-500">
                            <div>A: {q.optionA} | B: {q.optionB}</div>
                            {q.optionC && <div>C: {q.optionC} | D: {q.optionD}</div>}
                          </td>
                          <td className="px-5 py-4 font-black text-emerald-600">Option {q.correctOption}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                q.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : q.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {q.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right space-x-2">
                            {q.status === "PENDING" && (
                              <button
                                onClick={async () => {
                                  await fetch("/api/questions", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ questionId: q.id, status: "APPROVED" }),
                                  });
                                  fetchAllAdminData();
                                }}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                              >
                                অনুমোদন
                              </button>
                            )}
                            <button
                              onClick={() => setEditingQuestion(q)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition"
                            >
                              এডিট
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-[10px] transition border border-red-200"
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
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. USERS & PEOPLE STRUCTURE TAB (Part H) */}
      {/* ======================================================== */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setStructureSubTab("users")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                structureSubTab === "users" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              সকল ইউজার ({usersList.length})
            </button>
            <button
              onClick={() => setStructureSubTab("districts")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                structureSubTab === "districts" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              জেলাসমূহ (64 Districts)
            </button>
            <button
              onClick={() => setStructureSubTab("channelPartners")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                structureSubTab === "channelPartners" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              চ্যানেল পার্টনার ({channelPartners.length})
            </button>
            <button
              onClick={() => setStructureSubTab("agents")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                structureSubTab === "agents" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              এজেন্ট ও ডিফল্ট এজেন্ট ({agents.length})
            </button>
          </div>

          {structureSubTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="নাম, ফোন বা ইমেইল দিয়ে ইউজার খুঁজুন..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="p-2 rounded-xl border border-gray-200 text-xs bg-white font-bold"
                >
                  <option value="ALL">সকল রোল (All Roles)</option>
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="AGENT">AGENT</option>
                  <option value="CHANNEL_PARTNER">CHANNEL_PARTNER</option>
                  <option value="ADMIN_STAFF">ADMIN_STAFF</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-4">নাম ও ফোন</th>
                        <th className="px-5 py-4">রোল (Role)</th>
                        <th className="px-5 py-4">ওয়ালেট ব্যালেন্স</th>
                        <th className="px-5 py-4">প্রোফাইল</th>
                        <th className="px-5 py-4">স্ট্যাটাস</th>
                        <th className="px-5 py-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usersList.map((u: any) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                            <div className="text-[11px] text-gray-400">{u.phone}</div>
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
                              <option value="CHANNEL_PARTNER">CHANNEL_PARTNER</option>
                              <option value="ADMIN_STAFF">ADMIN_STAFF</option>
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 font-black text-gray-900">
                            ৳ {u.wallet?.balance?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-5 py-4 text-emerald-600 font-bold">
                            {u.candidateProfile?.completeness || 0}%
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
                            >
                              Login As
                            </button>
                            <button
                              onClick={() => setAdjustingUser(u)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition"
                            >
                              ব্যালেন্স
                            </button>
                            <button
                              onClick={() => setResettingUser(u)}
                              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 transition"
                            >
                              পাসওয়ার্ড
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

          {structureSubTab === "districts" && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">বাংলাদেশের ৬৪ জেলা তালিকা ও নাম এডিটর</h3>
                  <p className="text-xs text-gray-400">প্রতিটি জেলার নাম (বাংলা ও ইংরেজি) পরিবর্তন করতে পারবেন</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4">ID</th>
                      <th className="px-5 py-4">নাম (বাংলা)</th>
                      <th className="px-5 py-4">Name (English)</th>
                      <th className="px-5 py-4">বিভাগ (Division)</th>
                      <th className="px-5 py-4">চ্যানেল পার্টনার</th>
                      <th className="px-5 py-4">এজেন্ট সংখ্যা</th>
                      <th className="px-5 py-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {districts.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4 font-mono font-bold text-gray-900">{d.id}</td>
                        <td className="px-5 py-4 font-bold text-gray-900 text-sm">{d.nameBn}</td>
                        <td className="px-5 py-4 font-semibold">{d.nameEn}</td>
                        <td className="px-5 py-4 text-gray-500">{d.division}</td>
                        <td className="px-5 py-4">
                          {d.channelPartner ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {d.channelPartner.user?.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">নিযুক্ত নেই</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono">{d._count?.agents || 0}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setEditingDistrict(d)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition"
                          >
                            নাম পরিবর্তন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {structureSubTab === "channelPartners" && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">চ্যানেল পার্টনার তালিকা (District Channel Partners)</h3>
                  <p className="text-xs text-gray-400">প্রতি জেলায় সর্বোচ্চ একজন (Exactly ONE) চ্যানেল পার্টনার নিযুক্ত থাকবে</p>
                </div>
                <button
                  onClick={() => setShowNewCPModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন চ্যানেল পার্টনার নিয়োগ</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4">নাম ও যোগাযোগ</th>
                      <th className="px-5 py-4">নিযুক্ত জেলা</th>
                      <th className="px-5 py-4">কমিশন রেট</th>
                      <th className="px-5 py-4">এজেন্ট সংখ্যা</th>
                      <th className="px-5 py-4">স্ট্যাটাস</th>
                      <th className="px-5 py-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {channelPartners.map((cp) => (
                      <tr key={cp.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 text-sm">{cp.user?.name}</div>
                          <div className="text-[11px] text-gray-400">{cp.user?.phone}</div>
                        </td>
                        <td className="px-5 py-4 font-bold text-orange-600">
                          {cp.district?.nameBn} ({cp.district?.nameEn})
                        </td>
                        <td className="px-5 py-4 font-black">{cp.commissionRate}%</td>
                        <td className="px-5 py-4 font-mono">{cp._count?.agents || 0}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cp.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {cp.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setEditingCP(cp)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition"
                          >
                            এডিট / জেলা পরিবর্তন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {structureSubTab === "agents" && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-base">এজেন্ট ও ডিফল্ট এজেন্ট তালিকা (Agents)</h3>
                  <p className="text-xs text-gray-400">
                    রেফারেল ছাড়া রেজিস্টার করা নতুন ইউজারগণ স্বয়ংক্রিয়ভাবে ডিফল্ট এজেন্টের অধীনে পড়বে
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAgentModal(true)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন এজেন্ট তৈরি করুন</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-4">এজেন্ট নাম ও ফোন</th>
                      <th className="px-5 py-4">রেফারেল কোড</th>
                      <th className="px-5 py-4">জেলা ও চ্যানেল পার্টনার</th>
                      <th className="px-5 py-4">কমিশন %</th>
                      <th className="px-5 py-4">ডিফল্ট স্ট্যাটাস</th>
                      <th className="px-5 py-4">ক্যাশ-ইন অন/অফ</th>
                      <th className="px-5 py-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {agents.map((ag) => (
                      <tr key={ag.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900 text-sm">{ag.user?.name}</div>
                          <div className="text-[11px] text-gray-400">{ag.user?.phone}</div>
                        </td>
                        <td className="px-5 py-4 font-mono font-bold text-gray-700">{ag.referralCode}</td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-gray-900">{ag.district?.nameBn || "N/A"}</div>
                          <div className="text-[11px] text-gray-400">CP: {ag.channelPartner?.user?.name || "None"}</div>
                        </td>
                        <td className="px-5 py-4 font-black">{ag.commissionRate}%</td>
                        <td className="px-5 py-4">
                          {ag.isDefault ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>Default Agent</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">সাধারণ</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ag.cashInActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            {ag.cashInActive ? "সক্রিয়" : "বন্ধ"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingAgent(ag)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] transition"
                          >
                            এডিট / জেলা পরিবর্তন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. FINANCE & APPROVALS TAB */}
      {/* ======================================================== */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          {/* Cash In Requests */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">ক্যাশ-ইন পেন্ডিং রিকোয়েস্টসমূহ</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">ইউজার</th>
                    <th className="px-5 py-4">পরিমাণ (৳)</th>
                    <th className="px-5 py-4">মেথড ও নম্বর</th>
                    <th className="px-5 py-4">TrxID</th>
                    <th className="px-5 py-4">তারিখ</th>
                    <th className="px-5 py-4">স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অনুমোদন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(adminData?.cashInRequests || []).map((req: any) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{req.user?.name}</div>
                        <div className="text-[11px] text-gray-400">{req.user?.phone}</div>
                      </td>
                      <td className="px-5 py-4 font-black text-emerald-600 text-sm">৳ {req.amount}</td>
                      <td className="px-5 py-4">
                        <div>{req.method}</div>
                        <div className="text-[11px] font-mono">{req.senderNumber}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-gray-800">{req.transactionId}</td>
                      <td className="px-5 py-4 text-xs font-mono">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : req.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleCashInAction(req.id, "APPROVE")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => handleCashInAction(req.id, "REJECT")}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                            >
                              বাতিল
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash Out Requests */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base">ক্যাশ-আউট রিকোয়েস্টসমূহ</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-4">ইউজার</th>
                    <th className="px-5 py-4">মোট পরিমাণ</th>
                    <th className="px-5 py-4">ফি কর্তন</th>
                    <th className="px-5 py-4">প্রদেয় নেট (৳)</th>
                    <th className="px-5 py-4">প্রাপক মেথড ও নম্বর</th>
                    <th className="px-5 py-4">স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অনুমোদন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(adminData?.cashOutRequests || []).map((req: any) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{req.user?.name}</div>
                        <div className="text-[11px] text-gray-400">{req.user?.phone}</div>
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900">৳ {req.amount}</td>
                      <td className="px-5 py-4 text-red-600 font-mono">৳ {req.feeAmount}</td>
                      <td className="px-5 py-4 font-black text-emerald-600 text-sm">৳ {req.netAmount}</td>
                      <td className="px-5 py-4">
                        <div>{req.method}</div>
                        <div className="text-[11px] font-mono">{req.receiverNumber}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : req.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleCashOutAction(req.id, "APPROVE")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                            >
                              পেমেন্ট সম্পন্ন
                            </button>
                            <button
                              onClick={() => handleCashOutAction(req.id, "REJECT")}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                            >
                              বাতিল ও রিফান্ড
                            </button>
                          </>
                        )}
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
      {/* 7. COMMISSION & SYSTEM SETTINGS TAB (Part G) */}
      {/* ======================================================== */}
      {activeTab === "commission" && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">গ্লোবাল ও এজেন্ট কমিশন কন্ট্রোল</h2>
              <p className="text-xs text-gray-500">সুপার অ্যাডমিন অনুমতিতে কমিশন অন/অফ ও রেট সমন্বয়</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <label className="block text-xs font-bold text-gray-800">ডিফল্ট এজেন্ট কমিশন (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={siteSettings.defaultAgentCommission}
                  onChange={(e) => setSiteSettings({ ...siteSettings, defaultAgentCommission: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                />
                <p className="text-[11px] text-gray-400">নতুন এজেন্ট তৈরির সময় এই পার্সেন্টেজ প্রযোজ্য হবে</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <label className="block text-xs font-bold text-gray-800">ডিফল্ট চ্যানেল পার্টনার কমিশন (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={siteSettings.defaultCpCommission}
                  onChange={(e) => setSiteSettings({ ...siteSettings, defaultCpCommission: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                />
                <p className="text-[11px] text-gray-400">প্রতি জেলার চ্যানেল পার্টনারের জন্য প্রাথমিক রেট</p>
              </div>
            </div>

            {/* System Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs">কমিশন সিস্টেম</div>
                  <div className="text-[11px] text-gray-400">গ্লোবাল অন/অফ</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSiteSettings({
                      ...siteSettings,
                      commissionEnabled: siteSettings.commissionEnabled === "true" ? "false" : "true",
                    })
                  }
                  className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                    siteSettings.commissionEnabled === "true"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {siteSettings.commissionEnabled === "true" ? "ON" : "OFF"}
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs">পাবলিক ইউজার রেফারেল</div>
                  <div className="text-[11px] text-gray-400">সাধারণ ক্যান্ডিডেট রেফারেল</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSiteSettings({
                      ...siteSettings,
                      publicReferralEnabled: siteSettings.publicReferralEnabled === "true" ? "false" : "true",
                    })
                  }
                  className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                    siteSettings.publicReferralEnabled === "true"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {siteSettings.publicReferralEnabled === "true" ? "ON" : "OFF"}
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs">এজেন্ট ক্যাশ-ইন সুবিধা</div>
                  <div className="text-[11px] text-gray-400">সরাসরি এজেন্টের কাছে ক্যাশইন</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSiteSettings({
                      ...siteSettings,
                      agentCashInEnabled: siteSettings.agentCashInEnabled === "true" ? "false" : "true",
                    })
                  }
                  className={`px-3 py-1.5 rounded-full font-bold text-xs ${
                    siteSettings.agentCashInEnabled === "true"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {siteSettings.agentCashInEnabled === "true" ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                কমিশন সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. CONTENT & SITE SETTINGS TAB (Part E & F) */}
      {/* ======================================================== */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <button
              onClick={() => setSettingsSubTab("site")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                settingsSubTab === "site" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              সাইট ও হেল্পলাইন
            </button>
            <button
              onClick={() => setSettingsSubTab("payment")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                settingsSubTab === "payment" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              পেমেন্ট ও ক্যাশ-ইন নম্বর
            </button>
            <button
              onClick={() => setSettingsSubTab("content")}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
                settingsSubTab === "content" ? "bg-slate-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ওয়েবসাইট কন্টেন্ট ও লিগ্যাল পেজ
            </button>
          </div>

          <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            {settingsSubTab === "site" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">সাইট লোগো ইমেজ URL</label>
                  <input
                    type="text"
                    value={siteSettings.siteLogo}
                    onChange={(e) => setSiteSettings({ ...siteSettings, siteLogo: e.target.value })}
                    placeholder="https://... logo.png"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono"
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">অফিসিয়াল সাপোর্ট ইমেইল</label>
                  <input
                    type="email"
                    value={siteSettings.supportEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, supportEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">হেড অফিস ঠিকানা</label>
                  <input
                    type="text"
                    value={siteSettings.officeAddress}
                    onChange={(e) => setSiteSettings({ ...siteSettings, officeAddress: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">জরুরি নোটিশ / ঘোষণা (Notice Message)</label>
                  <textarea
                    rows={2}
                    value={siteSettings.noticeMessage}
                    onChange={(e) => setSiteSettings({ ...siteSettings, noticeMessage: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>
            )}

            {settingsSubTab === "payment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">bKash নম্বর (Send Money)</label>
                    <input
                      type="text"
                      value={siteSettings.bkashNumber}
                      onChange={(e) => setSiteSettings({ ...siteSettings, bkashNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nagad নম্বর (Send Money)</label>
                    <input
                      type="text"
                      value={siteSettings.nagadNumber}
                      onChange={(e) => setSiteSettings({ ...siteSettings, nagadNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Rocket নম্বর (Send Money)</label>
                    <input
                      type="text"
                      value={siteSettings.rocketNumber}
                      onChange={(e) => setSiteSettings({ ...siteSettings, rocketNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ব্যাংক একাউন্ট তথ্য</label>
                  <input
                    type="text"
                    value={siteSettings.bankInfo}
                    onChange={(e) => setSiteSettings({ ...siteSettings, bankInfo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাশ-ইন নির্দেশিকা টেক্সট (Instructions)</label>
                  <textarea
                    rows={3}
                    value={siteSettings.cashInInstructions}
                    onChange={(e) => setSiteSettings({ ...siteSettings, cashInInstructions: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>
            )}

            {settingsSubTab === "content" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">হোম হিরো শিরোনাম (Hero Title)</label>
                    <input
                      type="text"
                      value={siteSettings.contentHeroTitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contentHeroTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">হোম হিরো সাব-টাইটেল</label>
                    <input
                      type="text"
                      value={siteSettings.contentHeroSubtitle}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contentHeroSubtitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">প্ল্যাটফর্ম পরিচিতি (Footer & About Intro)</label>
                  <textarea
                    rows={2}
                    value={siteSettings.contentIntro}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentIntro: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">কীভাবে কাজ করে (How it Works) বর্ণনা</label>
                  <textarea
                    rows={2}
                    value={siteSettings.contentHowItWorks}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentHowItWorks: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">আমাদের সম্পর্কে পেজ (/about)</label>
                  <textarea
                    rows={3}
                    value={siteSettings.contentAbout}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentAbout: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">যোগাযোগ পেজ টেক্সট (/contact)</label>
                  <textarea
                    rows={2}
                    value={siteSettings.contentContact}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentContact: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">গোপনীয়তা নীতি পেজ টেক্সট (/privacy)</label>
                  <textarea
                    rows={3}
                    value={siteSettings.contentPrivacy}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentPrivacy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শর্তাবলী পেজ টেক্সট (/terms)</label>
                  <textarea
                    rows={3}
                    value={siteSettings.contentTerms}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentTerms: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">রিফান্ড নীতি পেজ টেক্সট (/refund)</label>
                  <textarea
                    rows={3}
                    value={siteSettings.contentRefund}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contentRefund: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="py-2.5 px-7 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS */}
      {/* ======================================================== */}

      {/* 1. Job Create / Edit Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingJobId ? "চাকরির সার্কুলার সম্পাদনা (Edit)" : "নতুন চাকরির সার্কুলার তৈরি"}
              </h3>
              <button onClick={() => setShowJobForm(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">পদের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.titleBn}
                    onChange={(e) => setJobForm({ ...jobForm, titleBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Job Title (English)</label>
                  <input
                    type="text"
                    value={jobForm.titleEn}
                    onChange={(e) => setJobForm({ ...jobForm, titleEn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্রতিষ্ঠানের নাম *</label>
                  <input
                    type="text"
                    required
                    value={jobForm.organizationName}
                    onChange={(e) => setJobForm({ ...jobForm, organizationName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্রতিষ্ঠান লোগো ইমেজ URL (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={jobForm.logoUrl}
                    onChange={(e) => setJobForm({ ...jobForm, logoUrl: e.target.value })}
                    placeholder="https://... logo.png"
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={jobForm.categoryId}
                    onChange={(e) => setJobForm({ ...jobForm, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameBn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">আবেদন ফি (৳) * (0 = ফ্রি)</label>
                  <input
                    type="number"
                    min={0}
                    value={jobForm.applicationFee}
                    onChange={(e) => setJobForm({ ...jobForm, applicationFee: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-orange-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">পদসংখ্যা</label>
                  <input
                    type="number"
                    min={1}
                    value={jobForm.vacancy}
                    onChange={(e) => setJobForm({ ...jobForm, vacancy: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">চাকরির ধরন</label>
                  <select
                    value={jobForm.jobType}
                    onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="FULL_TIME">ফুল-টাইম</option>
                    <option value="PART_TIME">পার্ট-টাইম</option>
                    <option value="CONTRACTUAL">চুক্তিভিত্তিক</option>
                    <option value="INTERNSHIP">ইন্টার্নশিপ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">বেতন সীমা</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">আবেদনের শেষ তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">কর্মস্থল / লোকেশন</label>
                  <input
                    type="text"
                    value={jobForm.workplaceLocation}
                    onChange={(e) => setJobForm({ ...jobForm, workplaceLocation: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={jobForm.status}
                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">শিক্ষাগত যোগ্যতা</label>
                <input
                  type="text"
                  value={jobForm.educationReq}
                  onChange={(e) => setJobForm({ ...jobForm, educationReq: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সার্কুলার বিবরণ (বাংলা)</label>
                <textarea
                  rows={3}
                  value={jobForm.descriptionBn}
                  onChange={(e) => setJobForm({ ...jobForm, descriptionBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowJobForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Job Applicants Modal */}
      {viewingJobId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">আবেদনকারী তালিকা ({jobApplicants.length})</h3>
                <p className="text-xs text-gray-400">প্রার্থীর প্রোফাইল স্ন্যাপশট ও ফি রিফান্ড/রিভার্সাল নিয়ন্ত্রণ</p>
              </div>
              <button onClick={() => setViewingJobId(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            {loadingApplicants ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600" />
              </div>
            ) : jobApplicants.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">এখনো কোনো আবেদন জমা পড়েনি।</div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-900 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">প্রার্থী নাম ও ফোন</th>
                      <th className="px-4 py-3">আবেদনের তারিখ</th>
                      <th className="px-4 py-3">পরিশোধিত ফি</th>
                      <th className="px-4 py-3">স্ট্যাটাস</th>
                      <th className="px-4 py-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobApplicants.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900">{app.customer?.user?.name}</div>
                          <div className="text-[11px] text-gray-400">{app.customer?.user?.phone}</div>
                        </td>
                        <td className="px-4 py-3 font-mono">{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-bold text-orange-600">
                          {app.feePaid > 0 ? `৳ ${app.feePaid}` : "ফ্রি"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                            className="bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded-lg border border-gray-200 text-xs"
                          >
                            <option value="APPLIED">APPLIED</option>
                            <option value="VIEWED">VIEWED</option>
                            <option value="SHORTLISTED">SHORTLISTED</option>
                            <option value="INTERVIEW_CALLED">INTERVIEW_CALLED</option>
                            <option value="SELECTED">SELECTED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              try {
                                setViewingSnapshot(JSON.parse(app.profileSnapshot));
                              } catch {
                                setViewingSnapshot({ info: "No snapshot" });
                              }
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-[10px] font-bold"
                          >
                            সিভি স্ন্যাপশট
                          </button>
                          {app.feePaid > 0 && (
                            <button
                              onClick={() => handleRefundApplicationFee(app.id, app.customer?.user?.name, app.feePaid)}
                              className="px-2.5 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-[10px] font-bold border border-amber-200"
                            >
                              রিফান্ড করুন
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snapshot Modal */}
      {viewingSnapshot && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">আবেদনকালীন প্রার্থীর প্রোফাইল স্ন্যাপশট</h3>
              <button onClick={() => setViewingSnapshot(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-2xl text-[11px] font-mono overflow-x-auto text-gray-700">
              {JSON.stringify(viewingSnapshot, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 3. Category Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">ক্যাটাগরি সম্পাদনা (Edit Category)</h3>
              <button onClick={() => setEditingCat(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ক্যাটাগরি নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingCat.nameBn}
                  onChange={(e) => setEditingCat({ ...editingCat, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  value={editingCat.nameEn}
                  onChange={(e) => setEditingCat({ ...editingCat, nameEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  required
                  value={editingCat.slug}
                  onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">আইকন নাম (Lucide)</label>
                <input
                  type="text"
                  value={editingCat.icon || ""}
                  onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={editingCat.isActive}
                  onChange={(e) => setEditingCat({ ...editingCat, isActive: e.target.checked })}
                  className="rounded text-orange-600"
                />
                <label htmlFor="catActive" className="font-bold text-gray-700 cursor-pointer">
                  ক্যাটাগরিটি সাইটে সক্রিয় রাখুন
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Quiz Package Edit Modal */}
      {editingPkg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">কুইজ প্যাকেজ সম্পাদনা (Edit Package)</h3>
              <button onClick={() => setEditingPkg(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePackage} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্যাকেজ নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={editingPkg.nameBn}
                    onChange={(e) => setEditingPkg({ ...editingPkg, nameBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্যাকেজ মূল্য (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.price}
                    onChange={(e) => setEditingPkg({ ...editingPkg, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">প্রশ্নসংখ্যা</label>
                  <input
                    type="number"
                    min={1}
                    value={editingPkg.questionCount}
                    onChange={(e) => setEditingPkg({ ...editingPkg, questionCount: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    min={1}
                    value={editingPkg.timeLimitMinutes}
                    onChange={(e) => setEditingPkg({ ...editingPkg, timeLimitMinutes: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">টার্গেট পয়েন্ট</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.targetScore}
                    onChange={(e) => setEditingPkg({ ...editingPkg, targetScore: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">টার্গেট বোনাস (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.bonusAmount}
                    onChange={(e) => setEditingPkg({ ...editingPkg, bonusAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">পয়েন্ট প্রতি বোনাস (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingPkg.perPointRate || 0}
                    onChange={(e) => setEditingPkg({ ...editingPkg, perPointRate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editingPkg.rewardEnabled !== false}
                    onChange={(e) => setEditingPkg({ ...editingPkg, rewardEnabled: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span>পুরস্কার প্রদান সক্রিয়</span>
                </label>

                <select
                  value={editingPkg.status}
                  onChange={(e) => setEditingPkg({ ...editingPkg, status: e.target.value })}
                  className="p-2 rounded-xl border border-gray-200 bg-white font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingPkg(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Question Edit Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">প্রশ্ন সম্পাদনা (Edit Question)</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">প্রশ্ন (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingQuestion.questionBn}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.optionA}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionA: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={editingQuestion.optionB}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionB: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option C</label>
                  <input
                    type="text"
                    value={editingQuestion.optionC || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionC: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Option D</label>
                  <input
                    type="text"
                    value={editingQuestion.optionD || ""}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, optionD: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">সঠিক উত্তর *</label>
                  <select
                    value={editingQuestion.correctOption}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, correctOption: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold text-emerald-600"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">নম্বর (Marks)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingQuestion.marks || 1.0}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={editingQuestion.status}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, status: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. District Edit Modal */}
      {editingDistrict && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">জেলা নাম সম্পাদনা (District #{editingDistrict.id})</h3>
              <button onClick={() => setEditingDistrict(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDistrict} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">জেলার নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={editingDistrict.nameBn}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, nameBn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">District Name (English) *</label>
                <input
                  type="text"
                  required
                  value={editingDistrict.nameEn}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, nameEn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">বিভাগ (Division)</label>
                <input
                  type="text"
                  value={editingDistrict.division}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, division: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingDistrict(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. New Channel Partner Modal */}
      {showNewCPModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">নতুন চ্যানেল পার্টনার নিয়োগ</h3>
              <button onClick={() => setShowNewCPModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCP} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">নাম *</label>
                <input
                  type="text"
                  required
                  value={newCPForm.name}
                  onChange={(e) => setNewCPForm({ ...newCPForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ফোন নম্বর (ইউনিক লগইন) *</label>
                <input
                  type="tel"
                  required
                  value={newCPForm.phone}
                  onChange={(e) => setNewCPForm({ ...newCPForm, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={newCPForm.password}
                  onChange={(e) => setNewCPForm({ ...newCPForm, password: e.target.value })}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">জেলা নির্বাচন করুন (১ জেলায় সর্বোচ্চ ১ জন) *</label>
                <select
                  value={newCPForm.districtId}
                  onChange={(e) => setNewCPForm({ ...newCPForm, districtId: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id}. {d.nameBn} ({d.nameEn}) {d.channelPartner ? "— [ইতিমধ্যে নিয়োজিত]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">কমিশন রেট (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newCPForm.commissionRate}
                  onChange={(e) => setNewCPForm({ ...newCPForm, commissionRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewCPModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  নিয়োগ নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. New Agent Modal */}
      {showNewAgentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">নতুন এজেন্ট তৈরি করুন</h3>
              <button onClick={() => setShowNewAgentModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">এজেন্ট নাম *</label>
                <input
                  type="text"
                  required
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ফোন নম্বর (ইউনিক লগইন) *</label>
                <input
                  type="tel"
                  required
                  value={newAgentForm.phone}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={newAgentForm.password}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, password: e.target.value })}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">জেলা নির্বাচন করুন *</label>
                <select
                  value={newAgentForm.districtId}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, districtId: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id}. {d.nameBn} ({d.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">কমিশন রেট (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newAgentForm.commissionRate}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, commissionRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAgentForm.isDefault}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, isDefault: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span>ডিফল্ট এজেন্ট হিসেবে সেট করুন (স্বয়ংক্রিয় রেফারেল বরাদ্দ)</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAgentForm.cashInActive}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, cashInActive: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span>এজেন্ট ক্যাশ-ইন সুবিধা সক্রিয় রাখুন</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewAgentModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  এজেন্ট তৈরি করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">এজেন্ট সম্পাদনা ({editingAgent.user?.name})</h3>
              <button onClick={() => setEditingAgent(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">এজেন্ট নাম</label>
                <input
                  type="text"
                  value={editingAgent.name || editingAgent.user?.name || ""}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">জেলা পরিবর্তন (Move District)</label>
                <select
                  value={editingAgent.districtId || ""}
                  onChange={(e) => setEditingAgent({ ...editingAgent, districtId: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white font-bold"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id}. {d.nameBn} ({d.nameEn})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  জেলা পরিবর্তন করলেও পূর্বের রেফারেল ইতিহাস ও কমিশন হিসেব অক্ষুণ্ণ থাকবে
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">কমিশন রেট (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={editingAgent.commissionRate}
                  onChange={(e) => setEditingAgent({ ...editingAgent, commissionRate: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAgent.isDefault}
                    onChange={(e) => setEditingAgent({ ...editingAgent, isDefault: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span>ডিফল্ট এজেন্ট হিসেবে সেট করুন (Set as Default Agent)</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAgent.cashInActive}
                    onChange={(e) => setEditingAgent({ ...editingAgent, cashInActive: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span>এজেন্ট ক্যাশ-ইন সক্রিয়</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingAgent.commissionActive}
                    onChange={(e) => setEditingAgent({ ...editingAgent, commissionActive: e.target.checked })}
                    className="rounded text-orange-600"
                  />
                  <span>কমিশন আয় সক্রিয়</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. Balance Adjustment Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">ওয়ালেট ব্যালেন্স সমন্বয়</h3>
              <button onClick={() => setAdjustingUser(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">ইউজার</label>
                <div className="font-bold text-gray-900 text-sm">{adjustingUser.name} ({adjustingUser.phone})</div>
                <div className="text-gray-500 mt-0.5">বর্তমান ব্যালেন্স: ৳ {adjustingUser.wallet?.balance || 0}</div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সমন্বয়ের পরিমাণ (৳) (+ যোগ, - বিয়োগ)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="e.g. 500 or -200"
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">সমন্বয়ের কারণ / নোট *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="অডিট নোট বা রেফারেন্স..."
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  লেজারে সমন্বয় করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Password Reset Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">ইউজার পাসওয়ার্ড রিসেট</h3>
              <button onClick={() => setResettingUser(null)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePasswordReset} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">ইউজার</label>
                <div className="font-bold text-gray-900 text-sm">{resettingUser.name} ({resettingUser.phone})</div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">নতুন পাসওয়ার্ড দিন *</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ অক্ষর..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm"
                >
                  রিসেট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
