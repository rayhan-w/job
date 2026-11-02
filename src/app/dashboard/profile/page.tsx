"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Printer,
  Save,
  Check,
  Upload,
  Briefcase,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";

export default function ProfilePage() {
  const { language, t } = useLanguage();
  const [profileData, setProfileData] = useState<any>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCvPreview, setShowCvPreview] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [nid, setNid] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [careerObjective, setCareerObjective] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [referencesText, setReferencesText] = useState("");
  const [preferredCvType, setPreferredCvType] = useState("ONLINE");
  const [cvPdfUrl, setCvPdfUrl] = useState("");
  const [educations, setEducations] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/districts").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([pData, dData]) => {
        if (dData?.districts) setDistricts(dData.districts);
        if (pData?.profile) {
          const p = pData.profile;
          setProfileData(p);
          setName(p.name || "");
          setAvatarUrl(p.avatarUrl || "");
          const cp = p.candidateProfile || {};
          setFatherName(cp.fatherName || "");
          setMotherName(cp.motherName || "");
          setDob(cp.dob ? new Date(cp.dob).toISOString().split("T")[0] : "");
          setGender(cp.gender || "Male");
          setNid(cp.nid || "");
          setDistrictId(cp.districtId ? String(cp.districtId) : "");
          setPresentAddress(cp.presentAddress || "");
          setPermanentAddress(cp.permanentAddress || "");
          setExpectedSalary(cp.expectedSalary || "");
          setCareerObjective(cp.careerObjective || "");
          setPreferredCvType(cp.preferredCvType || "ONLINE");
          setCvPdfUrl(cp.cvPdfUrl || p.cvFile?.fileUrl || "");

          if (cp.references) {
            try {
              const refs = JSON.parse(cp.references);
              setReferencesText(Array.isArray(refs) ? refs.join("\n") : cp.references);
            } catch {
              setReferencesText(cp.references);
            }
          }

          if (p.skills && p.skills.length > 0) {
            setSkillsText(p.skills.map((s: any) => s.skillName).join(", "));
          }

          setEducations(p.educations || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    const skillsArray = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const refsArray = referencesText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          avatarUrl,
          fatherName,
          motherName,
          dob: dob || null,
          gender,
          nid,
          districtId: districtId ? Number(districtId) : null,
          presentAddress,
          permanentAddress,
          expectedSalary,
          careerObjective,
          preferredCvType,
          cvPdfUrl,
          references: refsArray,
          skills: skillsArray,
          educations: educations.filter((e) => e.exam && e.boardOrInstitution),
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh profile data
        const fresh = await fetch("/api/profile").then((r) => r.json());
        if (fresh?.profile) setProfileData(fresh.profile);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addEducationRow = () => {
    setEducations([
      ...educations,
      {
        exam: "স্নাতক / ডিগ্রি",
        boardOrInstitution: "",
        subjectOrGroup: "",
        result: "",
        passingYear: new Date().getFullYear(),
      },
    ]);
  };

  const updateEducation = (index: number, field: string, val: any) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: val };
    setEducations(updated);
  };

  const removeEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  // Milestone checks (each 20% -> total 100%)
  const hasPhoto = Boolean(avatarUrl || profileData?.avatarUrl);
  const hasPersonalInfo = Boolean(fatherName && motherName);
  const hasAddress = Boolean(presentAddress && districtId);
  const hasEducation = Boolean(educations && educations.length > 0 && educations.some((e) => e.exam && e.boardOrInstitution));
  const hasCareer = Boolean(careerObjective || expectedSalary || skillsText);

  let calculatedCompleteness = 0;
  if (hasPhoto) calculatedCompleteness += 20;
  if (hasPersonalInfo) calculatedCompleteness += 20;
  if (hasAddress) calculatedCompleteness += 20;
  if (hasEducation) calculatedCompleteness += 20;
  if (hasCareer) calculatedCompleteness += 20;

  const completeness = calculatedCompleteness;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole="CUSTOMER" />
        <div className="flex-1 space-y-6">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-44 bg-gray-100 animate-pulse rounded-3xl" />
          <div className="h-96 bg-gray-100 animate-pulse rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <DashboardSidebar userRole={profileData?.role || "CUSTOMER"} />

        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {language === "bn" ? "আমার প্রোফাইল ও সিভি" : "My Profile & CV"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {language === "bn"
                  ? "আপনার প্রোফাইল ১০০% সম্পন্ন করুন এবং আবেদনের জন্য সিভি পছন্দ করুন"
                  : "Complete your profile 100% and choose which CV to submit with applications"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCvPreview(true)}
                className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-100 transition shadow-xs"
              >
                <Eye className="w-4 h-4" />
                <span>{language === "bn" ? "অনলাইন সিভি দেখুন" : "View Online CV"}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-xs"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>{language === "bn" ? "প্রিন্ট / ডাউনলোড" : "Print CV"}</span>
              </button>
            </div>
          </div>

          {/* Top Profile Summary Card & Completion Checklist */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Candidate Info Box */}
            <div id="photo-section" className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-orange-100 border-4 border-white shadow-md flex items-center justify-center text-orange-700 font-extrabold text-3xl overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{name ? name[0] : "👤"}</span>
                  )}
                </div>
              </div>

              <div className="text-center sm:text-left space-y-2 flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">{name || (language === "bn" ? "নাম প্রদান করুন" : "Set Your Name")}</h2>
                    <span className="inline-block bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1">
                      {language === "bn" ? "চাকরিপ্রার্থী ক্যান্ডিডেট" : "Job Seeker Candidate"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold">{language === "bn" ? "রেফারেল কোড:" : "Referral Code:"}</span>{" "}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono font-bold text-gray-800">
                      {profileData?.referralCode || "-"}
                    </code>
                  </div>
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{profileData?.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{profileData?.email || (language === "bn" ? "ইমেইল যুক্ত করা হয়নি" : "No email")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{presentAddress || (language === "bn" ? "ঠিকানা যুক্ত করা হয়নি" : "Address not added")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>
                      {language === "bn" ? "ডিফল্ট সিভি:" : "Default CV:"}{" "}
                      <strong className="text-orange-600">
                        {preferredCvType === "PDF" ? "আপলোডকৃত পিডিএফ" : "অনলাইন সিভি"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Avatar URL input */}
                <div className="pt-2">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={language === "bn" ? "প্রোফাইল ছবির লিংক (Image URL)" : "Avatar Image URL"}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Profile Status & Actionable Checklist (Item 4b) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {language === "bn" ? "প্রোফাইল অগ্রগতি" : "Profile Progress"}
                  </h3>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      completeness === 100
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                    }`}
                  >
                    {completeness}% {language === "bn" ? "সম্পূর্ণ" : "Complete"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      completeness === 100 ? "bg-emerald-500" : "bg-orange-500"
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>

                {/* Actionable Checklist */}
                <div className="space-y-2.5 text-xs">
                  <button
                    onClick={() => scrollToSection("photo-section")}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {hasPhoto ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={hasPhoto ? "text-gray-700" : "font-bold text-amber-700"}>
                        {language === "bn" ? "১. ছবি আপলোড (২০%)" : "1. Photo Upload (20%)"}
                      </span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => scrollToSection("personal-section")}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {hasPersonalInfo ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={hasPersonalInfo ? "text-gray-700" : "font-bold text-amber-700"}>
                        {language === "bn" ? "২. পিতা ও মাতার নাম (২০%)" : "2. Parents Info (20%)"}
                      </span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => scrollToSection("address-section")}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {hasAddress ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={hasAddress ? "text-gray-700" : "font-bold text-amber-700"}>
                        {language === "bn" ? "৩. বর্তমান ঠিকানা ও জেলা (২০%)" : "3. Address & District (20%)"}
                      </span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => scrollToSection("education-section")}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {hasEducation ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={hasEducation ? "text-gray-700" : "font-bold text-amber-700"}>
                        {language === "bn" ? "৪. শিক্ষাগত যোগ্যতা (২০%)" : "4. Education (20%)"}
                      </span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => scrollToSection("career-section")}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      {hasCareer ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={hasCareer ? "text-gray-700" : "font-bold text-amber-700"}>
                        {language === "bn" ? "৫. ক্যারিয়ার লক্ষ্য ও স্কিল (২০%)" : "5. Career & Skills (20%)"}
                      </span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-5 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <span>{language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."}</span>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === "bn" ? "সংরক্ষিত হয়েছে!" : "Saved Successfully!"}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{language === "bn" ? "সকল পরিবর্তন সংরক্ষণ করুন" : "Save All Changes"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section: CV Selection Mode (Item 4c) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span>{language === "bn" ? "চাকরি আবেদনের জন্য সিভি পছন্দ (CV Choice)" : "Default Application CV"}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === "bn"
                    ? "যেকোনো চাকরিতে ১-ক্লিকে আবেদনের সময় নিয়োগকারী প্রতিষ্ঠান আপনার এই পছন্দের সিভিটি দেখতে পাবে"
                    : "When you apply to jobs, the employer will receive a snapshot of your chosen CV."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  preferredCvType === "ONLINE"
                    ? "border-orange-500 bg-orange-50/30 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="preferredCvType"
                  value="ONLINE"
                  checked={preferredCvType === "ONLINE"}
                  onChange={() => setPreferredCvType("ONLINE")}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                    <span>{language === "bn" ? "১. পোর্টাল অনলাইন সিভি" : "1. Portal Online CV"}</span>
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                      {language === "bn" ? "সুপারিশকৃত" : "Recommended"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {language === "bn"
                      ? "প্রোফাইলে সংরক্ষিত ব্যক্তিগত তথ্য, শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ও স্কিলের স্বয়ংক্রিয় ডিজিটাল ফরম্যাট।"
                      : "Generated automatically from your verified profile information, educations, and skills."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCvPreview(true)}
                    className="text-xs font-bold text-orange-600 hover:underline pt-1 inline-flex items-center gap-1"
                  >
                    <span>{language === "bn" ? "সিভি প্রিভিউ দেখুন →" : "View CV Preview →"}</span>
                  </button>
                </div>
              </label>

              <label
                className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition ${
                  preferredCvType === "PDF"
                    ? "border-orange-500 bg-orange-50/30 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="preferredCvType"
                  value="PDF"
                  checked={preferredCvType === "PDF"}
                  onChange={() => setPreferredCvType("PDF")}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div className="space-y-1 w-full">
                  <div className="font-extrabold text-sm text-gray-900">
                    {language === "bn" ? "২. আপলোডকৃত পিডিএফ সিভি" : "2. Uploaded PDF CV"}
                  </div>
                  <p className="text-xs text-gray-600">
                    {language === "bn"
                      ? "আপনার নিজের তৈরি করা ফরম্যাটের PDF ফাইল জমা দিতে লিংক যুক্ত করুন।"
                      : "Provide a direct URL to your custom PDF resume file."}
                  </p>
                  <div className="pt-2">
                    <input
                      type="url"
                      value={cvPdfUrl}
                      onChange={(e) => setCvPdfUrl(e.target.value)}
                      placeholder="https://example.com/my-resume.pdf"
                      className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none bg-white"
                    />
                  </div>
                  {cvPdfUrl && (
                    <a
                      href={cvPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{language === "bn" ? "পিডিএফ ফাইলটি খুলুন" : "Open PDF Resume"}</span>
                    </a>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Section: Personal Info */}
          <div id="personal-section" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <User className="w-5 h-5 text-orange-600" />
              <span>{language === "bn" ? "ব্যক্তিগত তথ্য (Personal Information)" : "Personal Information"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "পূর্ণ নাম *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. মোঃ রাহাতুল ইসলাম"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "পিতার নাম *" : "Father's Name *"}
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. মোঃ রফিকুল ইসলাম"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "মাতার নাম *" : "Mother's Name *"}
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. রহিমা বেগম"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "জন্ম তারিখ" : "Date of Birth"}
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "লিঙ্গ" : "Gender"}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                >
                  <option value="Male">{language === "bn" ? "পুরুষ" : "Male"}</option>
                  <option value="Female">{language === "bn" ? "মহিলা" : "Female"}</option>
                  <option value="Other">{language === "bn" ? "অন্যান্য" : "Other"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "জাতীয় পরিচয়পত্র নম্বর (NID)" : "National ID (NID)"}
                </label>
                <input
                  type="text"
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. 19951234567890"
                />
              </div>
            </div>
          </div>

          {/* Section: Address & District */}
          <div id="address-section" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>{language === "bn" ? "ঠিকানা ও জেলা (Address & District)" : "Address & District"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "নিজ জেলা (District) *" : "District *"}
                </label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                >
                  <option value="">{language === "bn" ? "-- জেলা নির্বাচন করুন --" : "-- Select District --"}</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameBn} ({d.nameEn}) - {d.division}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  {language === "bn" ? "আপনার জেলার দায়িত্বপ্রাপ্ত এজেন্ট ও চ্যানেল পার্টনার নির্ধারিত হবে।" : "Determines your district Agent and Channel Partner."}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "বর্তমান ঠিকানা *" : "Present Address *"}
                </label>
                <input
                  type="text"
                  value={presentAddress}
                  onChange={(e) => setPresentAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. বাসা # ১২, রোড # ৪, ধানমন্ডি, ঢাকা"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "স্থায়ী ঠিকানা" : "Permanent Address"}
                </label>
                <input
                  type="text"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. গ্রাম: করিমপুর, ডাকঘর: সদর, জেলা: বগুড়া"
                />
              </div>
            </div>
          </div>

          {/* Section: Education Qualifications (Item 4a Redesign) */}
          <div id="education-section" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  <span>{language === "bn" ? "শিক্ষাগত যোগ্যতা (Education Qualifications)" : "Education"}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {language === "bn"
                    ? "চাকরিতে আবেদনের জন্য অন্তত ১টি শিক্ষাগত যোগ্যতা থাকা আবশ্যক।"
                    : "Add your degrees, GPA, board/institute, and passing year."}
                </p>
              </div>

              <button
                type="button"
                onClick={addEducationRow}
                className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold px-3.5 py-2 rounded-xl text-xs border border-orange-200 transition shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{language === "bn" ? "+ শিক্ষাগত যোগ্যতা যোগ করুন" : "+ Add Degree"}</span>
              </button>
            </div>

            {educations.length === 0 ? (
              <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-3">
                <GraduationCap className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">
                  {language === "bn"
                    ? "কোন শিক্ষাগত যোগ্যতা যোগ করা হয়নি। উপরের '+ শিক্ষাগত যোগ্যতা যোগ করুন' বোতামে চাপ দিন।"
                    : "No education entries added yet. Click above to add your first qualification."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {educations.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50/40 hover:bg-gray-50/80 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                        #{idx + 1}. {edu.exam || "নতুন ডিগ্রি"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(idx)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                        title={language === "bn" ? "ডিলিট করুন" : "Delete entry"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          {language === "bn" ? "পরীক্ষা / ডিগ্রি *" : "Exam / Degree *"}
                        </label>
                        <select
                          value={edu.exam}
                          onChange={(e) => updateEducation(idx, "exam", e.target.value)}
                          className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white font-semibold"
                        >
                          <option value="এসএসসি / সমমান">এসএসসি / সমমান</option>
                          <option value="এইচএসসি / সমমান">এইচএসসি / সমমান</option>
                          <option value="স্নাতক / ডিগ্রি">স্নাতক / ডিগ্রি</option>
                          <option value="স্নাতকোত্তর">স্নাতকোত্তর</option>
                          <option value="ডিপ্লোমা">ডিপ্লোমা</option>
                          <option value="অন্যান্য">অন্যান্য</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          {language === "bn" ? "বোর্ড / প্রতিষ্ঠান *" : "Board / University *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={edu.boardOrInstitution}
                          onChange={(e) => updateEducation(idx, "boardOrInstitution", e.target.value)}
                          placeholder="e.g. ঢাকা বিশ্ববিদ্যালয় / ঢাকা বোর্ড"
                          className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          {language === "bn" ? "বিষয় / বিভাগ" : "Subject / Major"}
                        </label>
                        <input
                          type="text"
                          value={edu.subjectOrGroup}
                          onChange={(e) => updateEducation(idx, "subjectOrGroup", e.target.value)}
                          placeholder="e.g. বিজ্ঞান / সিএসই"
                          className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          {language === "bn" ? "ফলাফল (Result/GPA)" : "Result / GPA"}
                        </label>
                        <input
                          type="text"
                          value={edu.result}
                          onChange={(e) => updateEducation(idx, "result", e.target.value)}
                          placeholder="e.g. 5.00 / 3.75 / 1st Class"
                          className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          {language === "bn" ? "পাসের বছর" : "Passing Year"}
                        </label>
                        <input
                          type="number"
                          min={1970}
                          max={2035}
                          value={edu.passingYear}
                          onChange={(e) => updateEducation(idx, "passingYear", e.target.value)}
                          className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Career & Skills */}
          <div id="career-section" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <span>{language === "bn" ? "ক্যারিয়ার লক্ষ্য ও দক্ষতা (Career & Skills)" : "Career & Skills"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "ক্যারিয়ার অবজেক্টিভ (Career Objective)" : "Career Objective"}
                </label>
                <textarea
                  rows={3}
                  value={careerObjective}
                  onChange={(e) => setCareerObjective(e.target.value)}
                  placeholder={
                    language === "bn"
                      ? "আপনার ক্যারিয়ার লক্ষ্য ও কর্মক্ষেত্র সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
                      : "Describe your career aspirations and key capabilities..."
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "প্রত্যাশিত বেতন (Expected Salary)" : "Expected Salary"}
                </label>
                <input
                  type="text"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  placeholder="e.g. ৳ ২৫,০০০ - ৩০,০০০"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "দক্ষতাসমূহ (কমা দিয়ে লিখুন)" : "Key Skills (comma separated)"}
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="e.g. MS Office, English Communication, Python"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {language === "bn" ? "রেফারেন্স / সুপারিশকারী (প্রতি লাইনে ১টি)" : "References (one per line)"}
                </label>
                <textarea
                  rows={2}
                  value={referencesText}
                  onChange={(e) => setReferencesText(e.target.value)}
                  placeholder="e.g. ড. রহমান, অধ্যাপক, ঢাকা বিশ্ববিদ্যালয় - ০১৭১XXXXXXXX"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Action Bar */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                {language === "bn" ? "প্রোফাইল আপডেট" : "Profile Status"}
              </div>
              <div className="text-base font-black mt-0.5">
                {language === "bn" ? `অগ্রগতি: ${completeness}% সম্পন্ন` : `Progress: ${completeness}% completed`}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm transition shadow-lg shadow-orange-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <span>{language === "bn" ? "সংরক্ষণ হচ্ছে..." : "Saving..."}</span>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === "bn" ? "সংরক্ষিত হয়েছে!" : "Saved Successfully!"}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{language === "bn" ? "প্রোফাইল সংরক্ষণ করুন" : "Save Profile"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Online CV Preview Modal (Item 4c) */}
      {showCvPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">
                    {language === "bn" ? "অনলাইন সিভি প্রিভিউ (Online CV Preview)" : "Online CV Preview"}
                  </h3>
                  <p className="text-xs text-gray-500">WOJOB Job Portal Verified Candidate Profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowCvPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable CV Card */}
            <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-200/80 space-y-6 text-xs text-gray-800">
              {/* Header section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b border-gray-200 pb-4">
                <div className="w-20 h-20 rounded-full bg-orange-500 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : name[0] || "U"}
                </div>
                <div className="text-center sm:text-left space-y-1 flex-1">
                  <h2 className="text-xl font-black text-gray-900">{name || "আপনার নাম"}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-600 pt-1">
                    <span>📞 {profileData?.phone || "-"}</span>
                    <span>✉️ {profileData?.email || "-"}</span>
                    <span>📍 {presentAddress || "বাংলাদেশ"}</span>
                  </div>
                  {careerObjective && (
                    <p className="text-xs text-gray-700 italic pt-2">{careerObjective}</p>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  ব্যক্তিগত বিবরণ
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div><span className="text-gray-500">পিতার নাম:</span> <strong>{fatherName || "-"}</strong></div>
                  <div><span className="text-gray-500">মাতার নাম:</span> <strong>{motherName || "-"}</strong></div>
                  <div><span className="text-gray-500">জন্ম তারিখ:</span> <strong>{dob || "-"}</strong></div>
                  <div><span className="text-gray-500">লিঙ্গ:</span> <strong>{gender || "-"}</strong></div>
                  <div><span className="text-gray-500">নিজ জেলা:</span> <strong>{districts.find((d) => String(d.id) === districtId)?.nameBn || "-"}</strong></div>
                  <div><span className="text-gray-500">প্রত্যাশিত বেতন:</span> <strong>{expectedSalary || "-"}</strong></div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1">
                  শিক্ষাগত যোগ্যতা
                </h4>
                {educations.length === 0 ? (
                  <p className="text-gray-400">কোন শিক্ষাগত যোগ্যতা যোগ করা হয়নি।</p>
                ) : (
                  <div className="space-y-2">
                    {educations.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white border border-gray-100">
                        <div>
                          <strong className="text-gray-900">{edu.exam}</strong> - {edu.boardOrInstitution}
                          {edu.subjectOrGroup && <span className="text-gray-500"> ({edu.subjectOrGroup})</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-orange-600">{edu.result}</span>
                          <span className="text-gray-400 text-[10px] ml-2">({edu.passingYear})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills */}
              {skillsText && (
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1">
                    দক্ষতাসমূহ
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsText.split(",").map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-800 font-semibold text-[11px]">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCvPreview(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট / ডাউনলোড</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
